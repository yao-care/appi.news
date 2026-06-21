// dev 頻道「請 claude 幫我做」對話橋接的純函式（無 I/O、可單元測試）。
//
// 設計同 slack-interaction.mjs：決策邏輯抽純函式，server 是薄殼。
// 三類純邏輯：
//   1. 輪詢訊息過濾（哪些是「要處理的人類訊息」）
//   2. 每個 thread 的分支命名
//   3. 安全政策 evaluateTool（站長定的鐵則：只在分支開 PR、不動 main、不部署、不碰機密）
//
// 安全模型：頻道成員＝授權（私密頻道只放信任開發者）；Claude 有 shell，靠下面這個
// denylist + worktree 封閉把「不可逆 / 對外 / 機密」的動作擋在程式層，不只靠提示詞。

import { isAbsolute, resolve } from 'node:path';

// ───────────────────────── 1. 輪詢訊息過濾 ─────────────────────────

// 該略過的訊息：bot 自己、各種系統 subtype（join/leave/bot_message/channel_*…）。
// 只留「人類在頻道打的字」。
function isHumanMessage(m, botUserId) {
  if (!m || m.type !== 'message') return false;
  if (m.subtype) return false; // bot_message / channel_join / thread_broadcast 等一律略過
  if (!m.user || m.user === botUserId) return false; // 沒有 user 或就是 bot 自己
  if (!m.ts) return false;
  return true;
}

/**
 * 從 conversations.history 取新的「頂層」人類訊息（每則＝一段新對話的起點）。
 * 頂層＝沒有 thread_ts，或 thread_ts === ts（自己就是 thread 根）。
 * @returns 依 ts 升冪排序的訊息陣列
 */
export function newRootMessages(historyMessages, botUserId) {
  return (historyMessages || [])
    .filter((m) => isHumanMessage(m, botUserId))
    .filter((m) => !m.thread_ts || m.thread_ts === m.ts)
    .sort((a, b) => Number(a.ts) - Number(b.ts));
}

/**
 * 從 conversations.replies 取某 thread 的新人類回覆（接續對話的後續輪）。
 * 排除 thread 根本身（ts === threadTs）與 sinceTs（含）以前已處理的。
 * @returns 依 ts 升冪排序
 */
export function newThreadReplies(replyMessages, botUserId, threadTs, sinceTs) {
  const since = Number(sinceTs || threadTs);
  return (replyMessages || [])
    .filter((m) => isHumanMessage(m, botUserId))
    .filter((m) => m.ts !== threadTs && Number(m.ts) > since)
    .sort((a, b) => Number(a.ts) - Number(b.ts));
}

/** 一組訊息裡最大的 ts（字串）；空陣列回 fallback。 */
export function maxTs(messages, fallback) {
  return (messages || []).reduce((mx, m) => (Number(m.ts) > Number(mx) ? m.ts : mx), fallback);
}

// ───────────────────────── 2. 分支命名 ─────────────────────────

/** thread_ts → 穩定分支名（同一 thread 多輪共用同分支）。例：1718000000.000100 → dev/t1718000000-000100 */
export function branchForThread(threadTs) {
  const safe = String(threadTs).replace(/[^0-9.]/g, '').replace('.', '-');
  return `dev/t${safe}`;
}

// ───────────────────────── 3. 安全政策 ─────────────────────────

// 機密檔／路徑：出現在指令字串或檔案路徑就擋（cat/grep/source/cp/讀寫皆然）。
const SECRET_RE = /(report\.env|secrets\.md|(^|[\s/'"=])\.env\b|id_rsa|id_ed25519|\.ssh\/|\.config\/appi-news|\.aws\/|credentials|\.npmrc|GOOGLE_APPLICATION_CREDENTIALS|ga4-sa\.json)/i;

// Bash 指令 denylist：任一命中即擋（涵蓋串接 && ; | 後的危險段）。
const BASH_DENY = [
  // push 到 main / master（含 HEAD:main、origin main）
  { re: /\bgit\s+push\b[^\n]*\b(origin\s+)?(HEAD:)?(refs\/heads\/)?(main|master)\b/i, why: '禁止 push 到 main/master，請推到目前的 dev 分支並開 PR' },
  // force push（含 --force-with-lease，仍會改寫歷史）
  { re: /\bgit\s+push\b[^\n]*(--force\b|--force-with-lease|\s-f\b)/i, why: '禁止 force push' },
  // 刪分支 -D（與全站 settings deny 對齊）
  { re: /\bgit\s+branch\b[^\n]*\s-D\b/i, why: '禁止強制刪分支（-D）' },
  // 清掉被忽略檔（含 .env / node_modules）
  { re: /\bgit\s+clean\b[^\n]*-[a-z]*x/i, why: '禁止 git clean -x（會刪被忽略的機密/建置檔）' },
  // 部署 / 進程 / 容器 / CDN
  { re: /\b(pm2|systemctl|service|docker|wrangler|kubectl|nginx|certbot)\b/i, why: '禁止部署或操作系統服務（pm2/docker/wrangler/systemctl…）' },
  { re: /\b(npm|pnpm|yarn)\s+publish\b/i, why: '禁止發佈套件' },
  { re: /\bgh\s+(secret|api)\b/i, why: '禁止操作 GitHub secret / 原始 API' },
  // 提權 / 毀滅性
  { re: /\bsudo\b/i, why: '禁止 sudo' },
  { re: /\brm\s+-[a-z]*r[a-z]*f?\s+(\/(?!root\/appi\.news)|~|\$HOME|\.\.)/i, why: '禁止刪除工作目錄以外 / 家目錄 / 上層路徑' },
  { re: /\b(mkfs|dd\s+if=|:\(\)\s*\{)/i, why: '禁止毀滅性磁碟 / fork bomb 指令' },
  // reset 到遠端 main（會洗掉 PR 分支進度）— 在 worktree 內針對 main 才危險，保守擋 origin/main hard reset
  { re: /\bgit\s+reset\b[^\n]*--hard[^\n]*origin\/(main|master)\b/i, why: '禁止 reset --hard 到 origin/main（會洗掉分支進度）' },
];

function isInsideWorktree(path, worktree) {
  if (!worktree) return true; // 沒給根就不檢查（測試/分析模式）
  const abs = isAbsolute(path) ? resolve(path) : resolve(worktree, path);
  const root = resolve(worktree);
  return abs === root || abs.startsWith(root + '/');
}

/**
 * 純安全政策：給工具名與輸入，回 Agent SDK 的 PermissionResult。
 * 預設放行（頻道成員＝信任開發者），只擋「不可逆 / 對外 / 機密 / 越界寫入」。
 * @param {string} toolName
 * @param {Record<string, unknown>} input
 * @param {{worktree?: string}} [ctx]
 * @returns {{behavior:'allow'} | {behavior:'deny', message:string}}
 */
export function evaluateTool(toolName, input = {}, ctx = {}) {
  const { worktree } = ctx;

  if (toolName === 'Bash') {
    const cmd = String(input.command || '');
    if (SECRET_RE.test(cmd)) return deny('指令觸及機密檔（.env / report.env / secrets / 金鑰），已擋下');
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
    if (!isInsideWorktree(p, worktree)) return deny('只能在本 thread 的 worktree 內改檔，禁止寫到工作目錄以外');
    return allow();
  }

  // 其餘工具（Glob/Grep/WebSearch/WebFetch/TodoWrite…）放行
  return allow();
}

const allow = () => ({ behavior: 'allow' });
const deny = (message) => ({ behavior: 'deny', message });

// 給測試用
export const _internals = { SECRET_RE, BASH_DENY, isHumanMessage, isInsideWorktree };
