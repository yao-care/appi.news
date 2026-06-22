// dev 頻道協作管線的純函式（無 I/O、可單元測試）。
//
// 取代舊的對話輪詢模型。新模型＝兩步驟 gated pipeline，以 GitHub Issue #N 為主軸：
//   步驟一（Slack @bot）：統整討論成需求確認書 →「建立需求單」鈕 → 開 Issue #N + 分支 dev/issue-N
//   步驟二（GitHub webhook）：Issue 建立 → 在 worktree 用 Agent SDK 開發 → 開 PR → 通知測試 → 發佈鈕
//
// 安全（站長定調：只擋「不可逆／影響整台」）：Agent SDK 的 canUseTool 接 evaluateTool，
// 只擋 sudo、rm -rf 打到家目錄/系統/上層、毀滅性磁碟指令、讀寫機密檔、寫到 worktree 以外。
// 其餘（git push、build、裝套件…）一律放行。「不動 main」靠設計本身（引擎只開 PR、人按鈕才 merge），不靠 denylist。

import { isAbsolute, resolve } from 'node:path';

// ───────────────────────── 分支命名 ─────────────────────────

/** Issue #N → 分支名（整條管線的關聯鍵）。 */
export function branchForIssue(n) {
  return `dev/issue-${Number(n)}`;
}

// ───────────────────────── Slack Events 解析 ─────────────────────────

/** 去掉訊息開頭的 <@BOTID> 提及，回乾淨內文。 */
export function stripMention(text) {
  return String(text || '').replace(/<@[A-Z0-9]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * 解析 Slack Events API 外層 payload。
 * @returns {{kind:'url_verification', challenge:string}
 *          | {kind:'app_mention', channel, threadTs, ts, user, text}
 *          | {kind:'ignore'}}
 */
export function parseSlackEvent(body) {
  if (!body || typeof body !== 'object') return { kind: 'ignore' };
  if (body.type === 'url_verification') return { kind: 'url_verification', challenge: String(body.challenge || '') };
  if (body.type !== 'event_callback' || !body.event) return { kind: 'ignore' };
  const e = body.event;
  if (e.type !== 'app_mention') return { kind: 'ignore' };
  if (e.bot_id || e.subtype) return { kind: 'ignore' }; // bot 自己/系統訊息
  return {
    kind: 'app_mention',
    channel: e.channel,
    threadTs: e.thread_ts || e.ts, // 在既有串裡 @ 就接該串，否則開新串
    ts: e.ts,
    user: e.user,
    text: stripMention(e.text),
  };
}

// ───────────────────────── 需求確認書 ─────────────────────────

/** 把 thread 討論（[{user,text}]）組成餵給 Claude 的收斂提示。純字串。 */
export function buildConsolidationPrompt(messages, { botUserId } = {}) {
  const lines = (messages || [])
    .filter((m) => m && m.text && m.user !== botUserId)
    .map((m) => `@${m.user}: ${stripMention(m.text)}`);
  const discussion = lines.join('\n') || '（討論串沒有可用內容）';
  return `你是 APPI News 的開發需求收斂助理。以下是開發者在 Slack 討論串裡談的需求：

${discussion}

請把它統整成一份「需求確認書」，給之後的自動開發引擎照著做。用繁體中文、台灣用語、精簡具體。
只輸出一個 \`\`\`json 區塊，格式：
{"title": "一句話需求標題（會當 GitHub Issue 標題，≤60字）",
 "body": "Markdown 需求確認書，含：## 背景與目標 / ## 要做什麼（範圍） / ## 不做什麼（非目標） / ## 驗收條件 / ## 線索（討論有提到的檔案、頁面、限制）"}
不要輸出 json 區塊以外的任何文字。`;
}

/** 從 Claude 輸出抽出 {title, body}。先找 ```json 區塊，失敗退回「首行當標題、全文當內文」。 */
export function parseSpecOutput(text) {
  const raw = String(text || '');
  const m = raw.match(/```json\s*([\s\S]*?)```/i);
  if (m) {
    try {
      const o = JSON.parse(m[1].trim());
      if (o && o.title && o.body) return { title: String(o.title).trim(), body: String(o.body).trim() };
    } catch { /* 退回 */ }
  }
  const lines = raw.trim().split('\n');
  const title = (lines[0] || '需求確認書').replace(/^#+\s*/, '').slice(0, 60).trim() || '需求確認書';
  return { title, body: raw.trim() || '（無內容）' };
}

/** 組 GitHub Issue 內文（需求確認書 + 出處頁尾）。 */
export function buildIssueBody({ specBody, threadLink, requestedBy }) {
  const foot = ['', '---', '🤖 由 dev 頻道 @appi_claude 收斂自 Slack 討論。'];
  if (requestedBy) foot.push(`需求提出：<@${requestedBy}>`);
  if (threadLink) foot.push(`討論串：${threadLink}`);
  return `${String(specBody || '').trim()}\n${foot.join('\n')}`;
}

// ───────────────────────── 按鈕（複用 slack-actions button infra）─────────────────────────

export const DEVBOT_CREATE_ACTION = 'devbot_create_spec'; // 「建立需求單」
export const DEVBOT_PUBLISH_ACTION = 'devbot_publish'; // 「發佈」（merge+部署）

/** 草稿訊息附的「建立需求單」鈕。value 帶 channel+threadTs，handler 由 state 取草稿。 */
export function buildCreateSpecButton({ channel, threadTs }) {
  const value = JSON.stringify({ channel, threadTs });
  return {
    type: 'actions',
    elements: [
      { type: 'button', text: { type: 'plain_text', text: '✅ 建立需求單' }, style: 'primary', action_id: DEVBOT_CREATE_ACTION, value },
    ],
  };
}

export function isCreateSpecAction(payload) {
  return payload?.type === 'block_actions'
    && Array.isArray(payload.actions)
    && payload.actions.some((a) => a?.action_id === DEVBOT_CREATE_ACTION);
}

export function parseCreateSpecInteraction(payload) {
  const action = payload.actions?.find((a) => a?.action_id === DEVBOT_CREATE_ACTION);
  if (!action?.value) throw new Error('建立需求單鈕無 value');
  const { channel, threadTs } = JSON.parse(action.value);
  if (!channel || !threadTs) throw new Error('建立需求單鈕 value 不完整');
  return { userId: payload.user?.id, channel, threadTs };
}

/** 開發完成通知附的「發佈」鈕。value 帶 pr/issue/branch。 */
export function buildDevPublishButton({ pr, issue, branch, title }) {
  const value = JSON.stringify({ pr: Number(pr), issue: Number(issue), branch, title: title || '' });
  if (value.length > 2000) throw new Error(`發佈鈕 value 超過 2000 字元（${value.length}）`);
  return {
    type: 'actions',
    elements: [
      { type: 'button', text: { type: 'plain_text', text: '🚀 發佈' }, style: 'primary', action_id: DEVBOT_PUBLISH_ACTION, value },
    ],
  };
}

export function isDevPublishAction(payload) {
  return payload?.type === 'block_actions'
    && Array.isArray(payload.actions)
    && payload.actions.some((a) => a?.action_id === DEVBOT_PUBLISH_ACTION);
}

export function parseDevPublishInteraction(payload) {
  const action = payload.actions?.find((a) => a?.action_id === DEVBOT_PUBLISH_ACTION);
  if (!action?.value) throw new Error('發佈鈕無 value');
  const d = JSON.parse(action.value);
  if (!Number.isInteger(d.pr) || !Number.isInteger(d.issue)) throw new Error('發佈鈕 pr/issue 不合法');
  if (!/^dev\/issue-\d+$/.test(d.branch || '')) throw new Error('發佈鈕 branch 不合法');
  return { userId: payload.user?.id, pr: d.pr, issue: d.issue, branch: d.branch, title: d.title || '' };
}

// ───────────────────────── 安全政策（沿用，原 dev-bridge.mjs）─────────────────────────

const SECRET_RE = /(report\.env|secrets\.md|(^|[\s/'"=])\.env\b|id_rsa|id_ed25519|\.ssh\/|\.config\/appi-news|\.aws\/|credentials|\.npmrc|GOOGLE_APPLICATION_CREDENTIALS|ga4-sa\.json)/i;

// 只擋「不可逆／影響整台機器」。push/merge/部署不在此列（靠設計與人工發佈把關，不靠 denylist）。
const BASH_DENY = [
  { re: /\bsudo\b/i, why: '禁止 sudo（提權）' },
  { re: /\brm\s+-[a-z]*r[a-z]*f?\s+(\/(?!root\/appi\.news)|~|\$HOME|\.\.)/i, why: '禁止刪除工作目錄以外 / 家目錄 / 系統 / 上層路徑' },
  { re: /\b(mkfs|dd\s+if=)/i, why: '禁止毀滅性磁碟操作' },
  { re: /:\(\)\s*\{/, why: '禁止 fork bomb' },
];

function isInsideWorktree(path, worktree) {
  if (!worktree) return true;
  const abs = isAbsolute(path) ? resolve(path) : resolve(worktree, path);
  const root = resolve(worktree);
  return abs === root || abs.startsWith(root + '/');
}

const allow = () => ({ behavior: 'allow' });
const deny = (message) => ({ behavior: 'deny', message });

/**
 * 純安全政策：Agent SDK canUseTool 用。預設放行，擋不可逆/對外/機密/越界寫入。
 * @returns {{behavior:'allow'} | {behavior:'deny', message:string}}
 */
export function evaluateTool(toolName, input = {}, ctx = {}) {
  const { worktree } = ctx;
  if (toolName === 'Bash') {
    const cmd = String(input.command || '');
    if (SECRET_RE.test(cmd)) return deny('指令觸及機密檔，已擋下');
    for (const { re, why } of BASH_DENY) if (re.test(cmd)) return deny(why);
    return allow();
  }
  if (toolName === 'Read' || toolName === 'NotebookRead') {
    const p = String(input.file_path || input.path || input.notebook_path || '');
    if (SECRET_RE.test(p)) return deny('禁止讀取機密檔');
    return allow();
  }
  if (toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit' || toolName === 'NotebookEdit') {
    const p = String(input.file_path || input.path || input.notebook_path || '');
    if (SECRET_RE.test(p)) return deny('禁止寫入機密檔');
    if (!isInsideWorktree(p, worktree)) return deny('只能在本 issue 的 worktree 內改檔');
    return allow();
  }
  return allow();
}

export const _internals = { SECRET_RE, BASH_DENY, isInsideWorktree };
