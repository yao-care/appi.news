// Phase 1 Slack 互動端點（pm2 服務，NPM 反代給對外 HTTPS）。
//
// 流程：
//   週報按鈕(block_actions) → 驗章 + 白名單 → views.open 看法 modal
//   → 送出(view_submission) → 驗章 + 白名單 + validateJob → 背景跑 newsroom-write --go → 回報 Slack
//
// 機密由 ~/.config/appi-news/report.env 提供（pm2 啟動時 source）：
//   SLACK_SIGNING_SECRET（驗章）、SLACK_BOT_TOKEN（views.open / 回報）
// 設定：report-config.mjs（白名單、回報頻道）
//
// 主機慣例：綁 0.0.0.0:PORT，UFW 放行 172.18.0.0/16，NPM Forward Hostname 用 172.18.0.1。
//
// 純決策邏輯抽成 handleInteraction（可單元測試、無 I/O）；server 與引擎觸發是薄殼。

import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { verifySlackSignature } from './lib/slack-verify.mjs';
import {
  parseButtonInteraction,
  parseModalSubmission,
  buildViewpointModal,
  buildPublishButton,
  parsePublishInteraction,
  isPublishAction,
  isAuthorized,
  toJob,
  VIEWPOINT_BLOCK,
} from './lib/slack-interaction.mjs';
import { validateJob } from './lib/newsroom-job.mjs';
import { postMessage } from './lib/slack.mjs';
import { SLACK_CHANNEL, NEWSROOM_AUTHORIZED_SLACK_USERS, channelForCategory, DEV_CHANNEL } from './lib/report-config.mjs';
import {
  parseSlackEvent,
  buildIssueBody,
  buildCreateSpecButton,
  isCreateSpecAction,
  parseCreateSpecInteraction,
  buildDevPublishButton,
  isDevPublishAction,
  parseDevPublishInteraction,
} from './lib/devbot.mjs';
import { verifyGithubSignature, parseGithubEvent } from './lib/github-webhook.mjs';

const errorsResponse = (msg) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ response_action: 'errors', errors: { [VIEWPOINT_BLOCK]: msg } }),
});

/**
 * 純決策：給原始請求，回一個「該怎麼回應 + 要做什麼副作用」的物件。不碰網路、不發文。
 * 回傳：{ status, body?, contentType?, openModal?:{view,triggerId}, startEngine?:job }
 * 不判斷忙碌與否——是否立刻跑或排隊由 I/O 殼層的佇列決定（驗證過就一律回 startEngine）。
 * @param {object} p
 * @param {string} p.rawBody
 * @param {object} p.headers              小寫鍵的標頭物件
 * @param {string} p.signingSecret
 * @param {string[]} p.allowlist          授權 Slack user
 * @param {number} [p.now]                unix 秒（測試注入）
 */
export function handleInteraction({ rawBody, headers, signingSecret, allowlist, now }) {
  let verified = false;
  try {
    verified = verifySlackSignature({
      signingSecret,
      timestamp: headers['x-slack-request-timestamp'],
      signature: headers['x-slack-signature'],
      rawBody,
      now,
    });
  } catch {
    verified = false;
  }
  if (!verified) return { status: 401, body: 'bad signature' };

  let payload;
  try {
    payload = JSON.parse(new URLSearchParams(rawBody).get('payload') || '{}');
  } catch {
    return { status: 400, body: 'bad payload' };
  }

  if (payload.type === 'block_actions') {
    // devbot 按鈕：授權＝在 dev 頻道點（私密頻道成員即授權，不走 newsroom 白名單）。
    if (isCreateSpecAction(payload)) {
      if (payload.channel?.id !== DEV_CHANNEL) return { status: 200, body: '' };
      const { channel, threadTs, userId } = parseCreateSpecInteraction(payload);
      return { status: 200, body: '', startCreateSpec: { channel, threadTs, userId } };
    }
    if (isDevPublishAction(payload)) {
      if (payload.channel?.id !== DEV_CHANNEL) return { status: 200, body: '' };
      const d = parseDevPublishInteraction(payload);
      return { status: 200, body: '', startDevPublish: d };
    }
    // 「發佈」鈕（事實稿待審草稿核可上線）：與「我要寫這題」分流。
    if (isPublishAction(payload)) {
      const { userId, slug, title, category } = parsePublishInteraction(payload);
      if (!isAuthorized(userId, allowlist)) return { status: 200, body: '' }; // 未授權靜默忽略
      return { status: 200, body: '', startPublish: { slug, title, category } };
    }
    const { userId, triggerId, topic } = parseButtonInteraction(payload);
    if (!isAuthorized(userId, allowlist)) return { status: 200, body: '' }; // 未授權靜默忽略
    return { status: 200, body: '', openModal: { view: buildViewpointModal({ topic }), triggerId } };
  }

  if (payload.type === 'view_submission') {
    const { userId, viewpoint, length, publishDate, topic } = parseModalSubmission(payload);
    if (!isAuthorized(userId, allowlist)) return errorsResponse('你沒有觸發權限');
    const job = toJob(topic, viewpoint, { length, publishDate });
    const errs = validateJob(job);
    if (errs.length) return errorsResponse(errs.join('；'));
    return {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ response_action: 'clear' }),
      startEngine: job,
    };
  }

  return { status: 200, body: '' };
}

// ───────────────────────── 以下為 I/O 薄殼（不單元測試）─────────────────────────

const PORT = Number(process.env.SLACK_ACTIONS_PORT || 3399);
const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const REPO_DIR = fileURLToPath(new URL('..', import.meta.url)); // scripts/.. = repo 根

// 隔離模式（專屬發佈 checkout）：每篇開跑前把工作區拉回 origin/main 的乾淨最新狀態，
// 讓自動產文完全不受「有人正在這個目錄開發 / 留未提交改動 / 本地落後遠端」影響。
// 只在 PUBLISH_ISOLATED=1（由 publisher 的 pm2 環境設定）時啟用——避免誤在開發目錄 reset --hard 毀掉未存檔的改動。
const PUBLISH_ISOLATED = process.env.PUBLISH_ISOLATED === '1';
function prepareCleanCheckout() {
  if (!PUBLISH_ISOLATED) return { ok: true };
  const steps = [
    ['git', ['fetch', 'origin', '--prune']],
    ['git', ['checkout', '-q', 'main']],
    ['git', ['reset', '--hard', 'origin/main']],
    ['git', ['clean', '-fd']], // 清未追蹤殘留；不帶 -x，保留 node_modules / dist / .env
  ];
  for (const [cmd, args] of steps) {
    const r = spawnSync(cmd, args, { cwd: REPO_DIR, encoding: 'utf8' });
    if (r.status !== 0) {
      return { ok: false, msg: `${cmd} ${args.join(' ')} 失敗：${(r.stderr || r.stdout || '').trim().slice(-300)}` };
    }
  }
  return { ok: true };
}

// 序列佇列：同時只跑一篇（避免並發 --go 撞共用 git 工作區），其餘排隊等前一篇跑完自動接上。
// 純記憶體，不持久化——server 重啟（pm2 restart）會清空尚未開跑的佇列，與舊版 inFlight 行為一致。
const queue = []; // 待產製工單（不含正在跑的那篇）
let running = false; // 是否已有一篇在產製中

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1_000_000) req.destroy();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function slackApi(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${BOT_TOKEN}`, 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({ ok: false, error: `http_${res.status}` }));
  if (!j.ok) throw new Error(`Slack ${method} 失敗: ${j.error}`);
  return j;
}

// 訊息預設發到分類頻道（傳 channel 覆寫）；未指定分類落到預設頻道。
const notify = (text, channel = SLACK_CHANNEL) => postMessage({ token: BOT_TOKEN, channel, text }).catch(() => {});
const notifyBlocks = (text, blocks, channel = SLACK_CHANNEL) => postMessage({ token: BOT_TOKEN, channel, text, blocks }).catch(() => {});

/** 佇列任務的顯示名（write 用標題、publish 用標題或 slug）。 */
const taskLabel = (task) => (task.type === 'publish' ? task.title || task.slug : task.job?.title || '（未命名）');
/** 任務該回報到哪個頻道（依分類；publish 帶 category、write 帶 job.category）。 */
const taskChannel = (task) => channelForCategory(task.type === 'publish' ? task.category : task.job?.category);

// 完成回報訊息：帶內文摘要 + 重點 + 預覽/編輯連結（同一 URL，登入 /admin 後可編輯）。
// result 為 newsroom-write 寫的 result.json；讀不到時退回舊式 stdout 解析（out）。
export function buildDoneMessage(job, result, out) {
  if (!result) {
    const url = out.match(/PUBLISHED_URL=(\S+)/)?.[1];
    const sched = out.match(/SCHEDULED_DATE=(\S+)/)?.[1];
    const link = url ? `\n<${url}|${sched ? '預覽連結' : '看文章'}>` : '';
    return sched
      ? `✅ 已排程 ${sched} 發佈：「${job.title}」${link}`
      : `✅ 自動產文完成並發佈：「${job.title}」${link}`;
  }
  const head = result.pendingApproval
    ? `📝 已產出待審草稿（未上線）：「${result.title}」`
    : result.scheduled
      ? `✅ 已排程 ${result.dateYmd} 發佈：「${result.title}」`
      : `✅ 自動產文完成並發佈：「${result.title}」`;
  const lines = [head];
  if (result.excerpt) lines.push('', `> ${result.excerpt}`);
  if (result.highlights?.length) {
    lines.push('', '重點：', ...result.highlights.map((h) => `• ${h}`));
  }
  // 本次採用的真人觀點（C：讓作者目視確認自己的想法有無進文、有無被稀釋）。
  if (result.viewpoint) {
    const vp = result.viewpoint.length > 140 ? `${result.viewpoint.slice(0, 140)}…` : result.viewpoint;
    lines.push('', `🗣 本次採用觀點：${vp}`);
    if (result.viewpointNote) lines.push(`↳ 反映於：${result.viewpointNote}`);
  }
  if (result.url) {
    const label = result.pendingApproval ? '預覽／編輯草稿' : result.scheduled ? '預覽／編輯' : '看文章／編輯';
    lines.push('', `🔗 <${result.url}|${label}>（登入 /admin 後右下角「編輯」鈕可直接改）`);
  }
  const cover = result.coverImage ? '封面 ✓' : '封面 ✗';
  lines.push(`🖼 ${cover} · 內文 ${result.inlineImages ?? 0} 張圖`);
  if (result.pendingApproval) lines.push('', '審閱沒問題就按下方「✅ 發佈這篇」上線；要改先點上面連結進編輯器。');
  return lines.join('\n');
}

// 輪詢文章 URL 直到回 200（部署完成 + CDN 生效）。每次帶 cache-buster 避免釘住舊 404。
async function waitForLive(url, tries = 40, intervalMs = 15000) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}-${i}`, { redirect: 'follow' });
      if (res.ok) return true;
    } catch { /* 重試 */ }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

// 等頁面真的上線後，才送出帶連結的正式完成訊息（避免作者點到部署中的 404）。不阻塞佇列。
// 待審草稿（pendingApproval）：附「✅ 發佈這篇」鈕，作者審閱後一鍵核可上線。channel=回報頻道。
async function announceWhenLive(job, result, out, url, channel = SLACK_CHANNEL) {
  const pending = result?.pendingApproval && result?.slug;
  const send = (msg) => {
    if (pending) {
      notifyBlocks(msg, [{ type: 'section', text: { type: 'mrkdwn', text: msg } }, buildPublishButton({ slug: result.slug, title: result.title, category: result.category })], channel);
    } else {
      notify(msg, channel);
    }
  };
  if (!url) {
    send(buildDoneMessage(job, result, out));
    return;
  }
  const live = await waitForLive(url);
  const base = buildDoneMessage(job, result, out);
  send(live ? base : `${base}\n（⚠️ 預覽頁部署較久，若點開仍 404 請稍候一兩分鐘重新整理）`);
}

// 收任務（write 產文 / publish 核可上線）：沒在跑就立刻開跑；正在跑就排隊並回報順位。
function enqueue(task) {
  if (running) {
    queue.push(task);
    const ahead = queue.length;
    notify(`🗂️ 已排入佇列：「${taskLabel(task)}」，前面還有 ${ahead} 件（含正在處理中的 1 件）。輪到時自動開始。`, taskChannel(task));
    return;
  }
  queue.push(task);
  drain();
}

// 若沒有正在跑的，從佇列取下一件開跑（單一進入點，保證序列）。
function drain() {
  if (running || queue.length === 0) return;
  const task = queue.shift();
  if (task.type === 'publish') runPublish(task);
  else runEngine(task.job);
}

// 共用：開跑前的專屬發佈 checkout 同步。失敗回 false 並回報。
function syncCheckoutOrFail(label) {
  const prep = prepareCleanCheckout();
  if (!prep.ok) {
    running = false;
    notify(`⚠️ 未開始：「${label}」\n發佈 checkout 同步失敗：${prep.msg}`);
    drain();
    return false;
  }
  return true;
}

function runEngine(job) {
  running = true;
  const ch = channelForCategory(job.category); // 此篇回報到對應分類頻道
  const dir = mkdtempSync(join(tmpdir(), 'newsroom-'));
  const jobPath = join(dir, 'job.json');
  writeFileSync(jobPath, JSON.stringify(job));
  const waiting = queue.length ? `（後面還有 ${queue.length} 件排隊）` : '';
  // 專屬發佈 checkout：開跑前拉回 origin/main 乾淨最新狀態（隔離開發狀態的影響）。
  if (!syncCheckoutOrFail(job.title)) return;
  notify(`📝 開始自動撰寫：「${job.title}」（約十幾分鐘，完成回報）${waiting}`, ch);
  const child = spawn('node', ['scripts/newsroom-write.mjs', jobPath, '--go'], { cwd: REPO_DIR, env: process.env });
  let out = '';
  child.stdout.on('data', (d) => (out += d));
  child.stderr.on('data', (d) => (out += d));
  child.on('close', (code) => {
    running = false;
    if (code === 0) {
      // 優先讀 result.json（含內文摘要 + 重點 + 預覽/編輯連結）；讀不到才退回舊式 stdout 解析。
      let result = null;
      try {
        const rp = join(dir, 'result.json');
        if (existsSync(rp)) result = JSON.parse(readFileSync(rp, 'utf8'));
      } catch { /* 退回舊式 */ }
      const url = result?.url || out.match(/PUBLISHED_URL=(\S+)/)?.[1] || null;
      const sched = result ? result.scheduled : /SCHEDULED_DATE=/.test(out);
      const dateYmd = result?.dateYmd || out.match(/SCHEDULED_DATE=(\S+)/)?.[1] || '';
      const pending = result?.pendingApproval || /PENDING_APPROVAL_SLUG=/.test(out);
      // 先確認「完成」但不附連結；連結等頁面真的上線（部署完成）才送，避免點到 404。
      const headline = pending
        ? `📝 待審草稿已產出：「${result?.title || job.title}」\n⏳ 預覽頁部署中，連結與「發佈」鈕待頁面上線後送出（約 3–5 分鐘）`
        : `✅ 自動產文完成：「${result?.title || job.title}」${sched && dateYmd ? `（排程 ${dateYmd} 發佈）` : ''}\n⏳ 部署中，預覽連結待頁面上線後送出（約 3–5 分鐘）`;
      notify(headline, ch);
      announceWhenLive(job, result, out, url, ch); // 背景輪詢，不阻塞佇列
    } else {
      notify(`⚠️ 自動產文失敗（exit ${code}）：「${job.title}」\n\`\`\`${out.slice(-800)}\`\`\``, ch);
    }
    drain(); // 接下一件（成功或失敗都繼續）
  });
  child.on('error', (e) => {
    running = false;
    notify(`⚠️ 自動產文無法啟動：「${job.title}」：${e.message}`, ch);
    drain();
  });
}

// 核可上線：把事實稿待審草稿轉正（status→published、publishDate→now）並 push。
function runPublish(task) {
  running = true;
  const label = task.title || task.slug;
  const ch = channelForCategory(task.category); // 回報到對應分類頻道
  if (!syncCheckoutOrFail(label)) return;
  notify(`🚀 核可上線中：「${label}」`, ch);
  const child = spawn('node', ['scripts/newsroom-publish.mjs', task.slug, '--go'], { cwd: REPO_DIR, env: process.env });
  let out = '';
  child.stdout.on('data', (d) => (out += d));
  child.stderr.on('data', (d) => (out += d));
  child.on('close', (code) => {
    running = false;
    if (code === 0) {
      const url = out.match(/PUBLISHED_URL=(\S+)/)?.[1] || `https://appi.news/articles/${task.slug}/`;
      notify(`✅ 已核可上線：「${label}」\n⏳ 部署中（約 3–5 分鐘），連結待頁面上線後送出。`, ch);
      announceWhenLive({ title: label }, { title: label, url, scheduled: false }, out, url, ch);
    } else {
      notify(`⚠️ 核可上線失敗（exit ${code}）：「${label}」\n\`\`\`${out.slice(-800)}\`\`\``, ch);
    }
    drain();
  });
  child.on('error', (e) => {
    running = false;
    notify(`⚠️ 核可上線無法啟動：「${label}」：${e.message}`, ch);
    drain();
  });
}

// ═════════════════════ 子專案 3：dev 頻道協作管線（devbot）═════════════════════
// 步驟一（Slack @bot）收斂→開 Issue；步驟二（GitHub webhook）開發→PR；發佈鈕 merge+部署。
// 與上面 newsroom 發文車道「分開的序列車道」：長開發不卡文章發佈。

const GITHUB_REPO = 'yao-care/appi.news';
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const GH_BOT_LOGIN = process.env.GH_BOT_LOGIN || 'LightChang'; // gh 認證帳號；其留言不回觸發
const DEVBOT_STATE = `${process.env.HOME}/.local/state/appi-news/devbot-state.json`;

function loadDevbot() {
  try { return JSON.parse(readFileSync(DEVBOT_STATE, 'utf8')); } catch { return { specs: {}, issues: {} }; }
}
function saveDevbot(s) {
  mkdirSync(dirname(DEVBOT_STATE), { recursive: true });
  writeFileSync(DEVBOT_STATE, JSON.stringify(s, null, 2));
}
const devbot = loadDevbot();

// 回貼 dev 頻道（thread 內）。
const devReply = (threadTs, text, blocks) =>
  postMessage({ token: BOT_TOKEN, channel: DEV_CHANNEL, text, blocks, thread_ts: threadTs }).catch((e) => console.error('devReply', e.message));

let devBotUserId = null;
async function getBotUserId() {
  if (devBotUserId) return devBotUserId;
  try { devBotUserId = (await slackApi('auth.test', {})).user_id; } catch { /* 容後再試 */ }
  return devBotUserId;
}

// Promise 包裝的子行程（繼承 env，cwd=publisher checkout；腳本內部操作 devbridge clone 絕對路徑）。
function spawnNode(args) {
  return new Promise((resolve) => {
    const child = spawn('node', args, { cwd: REPO_DIR, env: process.env });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (code) => resolve({ code, out }));
    child.on('error', (e) => resolve({ code: -1, out: e.message }));
  });
}

// ── devbot 序列車道（一次一件）──
const devQueue = [];
let devRunning = false;
function devEnqueue(job) { devQueue.push(job); devDrain(); }
function devDrain() {
  if (devRunning || devQueue.length === 0) return;
  devRunning = true;
  const job = devQueue.shift();
  const done = () => { devRunning = false; devDrain(); };
  const run = { consolidate: runConsolidate, createIssue: runCreateIssue, develop: runDevelop, publish: runDevPublish }[job.type];
  (run ? run(job) : Promise.resolve()).catch((e) => console.error('devbot job 失敗', job.type, e.message)).finally(done);
}

// 步驟一-a：收斂討論 → 草稿 + 「建立需求單」鈕。
async function runConsolidate({ channel, threadTs, requestedBy }) {
  const botId = await getBotUserId();
  let messages = [];
  try {
    const rep = await slackApi('conversations.replies', { channel, ts: threadTs, limit: 100 });
    messages = (rep.messages || []).filter((m) => !m.subtype).map((m) => ({ user: m.user, text: m.text || '' }));
  } catch (e) { return devReply(threadTs, `⚠️ 讀討論串失敗：${e.message}`); }

  const dir = mkdtempSync(join(tmpdir(), 'devbot-spec-'));
  writeFileSync(join(dir, 'input.json'), JSON.stringify({ messages, botUserId: botId }));
  await devReply(threadTs, '🤔 收到，正在把討論統整成需求確認書…');
  const r = await spawnNode(['scripts/devbot-consolidate.mjs', join(dir, 'input.json'), dir]);
  if (r.code !== 0 || !existsSync(join(dir, 'result.json'))) {
    return devReply(threadTs, `⚠️ 收斂失敗：\n\`\`\`${r.out.slice(-600)}\`\`\``);
  }
  const spec = JSON.parse(readFileSync(join(dir, 'result.json'), 'utf8'));
  devbot.specs[threadTs] = { channel, title: spec.title, body: spec.body, requestedBy };
  saveDevbot(devbot);
  const text = `📋 *需求確認書草稿*\n\n*${spec.title}*\n\n${spec.body}`.slice(0, 2900);
  await devReply(threadTs, text, [
    { type: 'section', text: { type: 'mrkdwn', text } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: '確認沒問題就按下方建立需求單；要改先在這串補充再 @我重新統整。' }] },
    buildCreateSpecButton({ channel, threadTs }),
  ]);
}

// 步驟一-b：建立需求單鈕 → 開 GitHub Issue（label dev-bot）→ webhook 觸發開發。
async function runCreateIssue({ channel, threadTs }) {
  const spec = devbot.specs[threadTs];
  if (!spec) return devReply(threadTs, '⚠️ 找不到這串的需求草稿（可能服務重啟過），請 @我重新統整。');
  const threadLink = `https://slack.com/archives/${channel}/p${String(threadTs).replace('.', '')}`;
  const body = buildIssueBody({ specBody: spec.body, threadLink, requestedBy: spec.requestedBy });
  const dir = mkdtempSync(join(tmpdir(), 'devbot-issue-'));
  const bodyFile = join(dir, 'body.md');
  writeFileSync(bodyFile, body);
  const r = spawnSync('gh', ['issue', 'create', '--repo', GITHUB_REPO, '--title', spec.title, '--body-file', bodyFile, '--label', 'dev-bot'], { encoding: 'utf8', env: process.env });
  if (r.status !== 0) return devReply(threadTs, `⚠️ 開 Issue 失敗：${(r.stderr || r.stdout || '').trim().slice(-400)}`);
  const url = (r.stdout || '').trim();
  const num = Number((url.match(/\/issues\/(\d+)/) || [])[1]);
  if (num) { devbot.issues[num] = { channel, threadTs }; }
  delete devbot.specs[threadTs];
  saveDevbot(devbot);
  await devReply(threadTs, `✅ 已建立需求單 #${num} ${url}\n開發引擎會接手（在分支 \`dev/issue-${num}\` 上做，完成回報請測試）。\n\n🧹 這題到此結束，*下一個需求請另開新訊息*（每串各自獨立、不累積記憶）。`);
}

// 步驟二：開發 → PR → 通知測試 + 發佈鈕。
async function runDevelop({ issue, branch, title, iterate }) {
  const meta = devbot.issues[issue] || {};
  const threadTs = meta.threadTs; // 沒有就發頻道頂層
  await devReply(threadTs, `🛠 開始${iterate ? '修正' : '開發'} 需求單 #${issue}…（約數分鐘，完成回報）`);
  const dir = mkdtempSync(join(tmpdir(), 'devbot-dev-'));
  const args = ['scripts/devbot-develop.mjs', dir, '--issue', String(issue)];
  if (iterate) args.push('--iterate', iterate);
  const r = await spawnNode(args);
  if (!existsSync(join(dir, 'result.json'))) {
    return devReply(threadTs, `⚠️ #${issue} 開發失敗：\n\`\`\`${r.out.slice(-700)}\`\`\``);
  }
  const res = JSON.parse(readFileSync(join(dir, 'result.json'), 'utf8'));
  if (!res.ok) return devReply(threadTs, `⚠️ #${issue} 開發中斷：${res.error}`);
  if (res.noChanges) return devReply(threadTs, `ℹ️ #${issue} 跑完但沒有程式改動。\n> ${(res.summary || '').slice(0, 500)}`);
  const prUrl = res.pr ? `https://github.com/${GITHUB_REPO}/pull/${res.pr}` : '（PR 待確認）';
  const text = `✅ *#${issue} ${res.title}* 開發完成，請測試\n\n> ${(res.summary || '').slice(0, 800)}\n\nPR：${prUrl}`;
  const blocks = [{ type: 'section', text: { type: 'mrkdwn', text } }];
  if (res.pr) blocks.push(buildDevPublishButton({ pr: res.pr, issue, branch: res.branch || branch, title: res.title }));
  await devReply(threadTs, text, blocks);
}

// 發佈鈕：merge PR → 觸發 GitHub Pages 部署 → 回貼線上連結。
async function runDevPublish({ pr, issue, branch, title }) {
  const meta = devbot.issues[issue] || {};
  const threadTs = meta.threadTs;
  await devReply(threadTs, `🚀 發佈中：merge PR #${pr}（#${issue} ${title}）…`);
  const r = spawnSync('gh', ['pr', 'merge', String(pr), '--repo', GITHUB_REPO, '--merge', '--delete-branch'], { encoding: 'utf8', env: process.env });
  if (r.status !== 0) return devReply(threadTs, `⚠️ merge 失敗：${(r.stderr || r.stdout || '').trim().slice(-400)}`);
  await devReply(threadTs, `✅ 已 merge #${pr}，GitHub Pages 部署中（約 3–5 分鐘）…`);
  const live = await waitForLive('https://appi.news/');
  delete devbot.issues[issue];
  saveDevbot(devbot);
  await devReply(threadTs, live
    ? `🎉 #${issue} 已上線：https://appi.news/ \n（若改的是特定頁面，直接開該頁看結果；有問題在這串 @我描述即可接續修。）`
    : `#${issue} 已 merge，部署可能較久，稍後開 https://appi.news/ 看結果。`);
}

// ── HTTP handler：Slack Events ──（同一把 signing secret 驗章）
function handleSlackEventReq(rawBody, headers) {
  if (headers['x-slack-retry-num']) return { status: 200, body: '' }; // 重送略過，避免重複觸發
  let ok = false;
  try { ok = verifySlackSignature({ signingSecret: SIGNING_SECRET, timestamp: headers['x-slack-request-timestamp'], signature: headers['x-slack-signature'], rawBody }); } catch { ok = false; }
  if (!ok) return { status: 401, body: 'bad signature' };
  let body;
  try { body = JSON.parse(rawBody); } catch { return { status: 400, body: 'bad json' }; }
  const ev = parseSlackEvent(body);
  if (ev.kind === 'url_verification') return { status: 200, contentType: 'application/json', body: JSON.stringify({ challenge: ev.challenge }) };
  if (ev.kind === 'app_mention' && ev.channel === DEV_CHANNEL) {
    return { status: 200, body: '', devJob: { type: 'consolidate', channel: ev.channel, threadTs: ev.threadTs, requestedBy: ev.user } };
  }
  return { status: 200, body: '' };
}

// ── HTTP handler：GitHub webhook ──（HMAC 驗章）
function handleGithubReq(rawBody, headers) {
  if (!verifyGithubSignature({ secret: GITHUB_WEBHOOK_SECRET, signature: headers['x-hub-signature-256'], rawBody })) {
    return { status: 401, body: 'bad signature' };
  }
  let payload;
  try { payload = JSON.parse(rawBody); } catch { return { status: 400, body: 'bad json' }; }
  const ev = parseGithubEvent({ eventType: headers['x-github-event'], payload, botLogin: GH_BOT_LOGIN });
  if (ev.kind === 'develop') return { status: 200, body: 'ok', devJob: { type: 'develop', issue: ev.issue, branch: ev.branch, title: ev.title } };
  if (ev.kind === 'iterate') return { status: 200, body: 'ok', devJob: { type: 'develop', issue: ev.issue, branch: ev.branch, iterate: ev.comment } };
  return { status: 200, body: 'ok' };
}

function startServer() {
  if (!SIGNING_SECRET || !BOT_TOKEN) {
    console.error('缺 SLACK_SIGNING_SECRET 或 SLACK_BOT_TOKEN（請 source ~/.config/appi-news/report.env）');
    process.exit(1);
  }
  createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') return res.writeHead(200).end('ok');
    if (req.method !== 'POST') return res.writeHead(404).end('not found');

    const rawBody = await readRawBody(req);

    // 子專案 3：Slack Events（/slack/events）與 GitHub webhook（/github）
    if (req.url === '/slack/events' || req.url === '/github') {
      let r;
      try { r = req.url === '/github' ? handleGithubReq(rawBody, req.headers) : handleSlackEventReq(rawBody, req.headers); }
      catch (e) { res.writeHead(200).end(); console.error('devbot handler', e.message); return; }
      res.writeHead(r.status, r.contentType ? { 'content-type': r.contentType } : undefined);
      res.end(r.body || '');
      if (r.devJob) devEnqueue(r.devJob);
      return;
    }

    if (!req.url.startsWith('/slack')) return res.writeHead(404).end('not found');

    let result;
    try {
      result = handleInteraction({
        rawBody,
        headers: req.headers,
        signingSecret: SIGNING_SECRET,
        allowlist: NEWSROOM_AUTHORIZED_SLACK_USERS,
      });
    } catch (e) {
      res.writeHead(200).end();
      notify(`⚠️ 互動處理錯誤：${e.message}`);
      return;
    }

    res.writeHead(result.status, result.contentType ? { 'content-type': result.contentType } : undefined);
    res.end(result.body || '');

    // 副作用在回應後執行（block_actions 需先 ack 再開 modal）
    if (result.openModal) {
      slackApi('views.open', { trigger_id: result.openModal.triggerId, view: result.openModal.view }).catch((e) =>
        notify(`⚠️ 開 modal 失敗：${e.message}`),
      );
    }
    if (result.startEngine) enqueue({ type: 'write', job: result.startEngine });
    if (result.startPublish) enqueue({ type: 'publish', slug: result.startPublish.slug, title: result.startPublish.title, category: result.startPublish.category });
    if (result.startCreateSpec) devEnqueue({ type: 'createIssue', channel: result.startCreateSpec.channel, threadTs: result.startCreateSpec.threadTs });
    if (result.startDevPublish) devEnqueue({ type: 'publish', pr: result.startDevPublish.pr, issue: result.startDevPublish.issue, branch: result.startDevPublish.branch, title: result.startDevPublish.title });
  }).listen(PORT, '0.0.0.0', () => console.log(`slack-actions-server on 0.0.0.0:${PORT}（repo=${REPO_DIR}，devbot enabled）`));
}

// 只有「直接執行」才啟動 server；被 import（測試）時不啟動、不綁埠。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
