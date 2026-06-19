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
import { writeFileSync, mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { verifySlackSignature } from './lib/slack-verify.mjs';
import {
  parseButtonInteraction,
  parseModalSubmission,
  buildViewpointModal,
  isAuthorized,
  toJob,
  VIEWPOINT_BLOCK,
} from './lib/slack-interaction.mjs';
import { validateJob } from './lib/newsroom-job.mjs';
import { postMessage } from './lib/slack.mjs';
import { SLACK_CHANNEL, NEWSROOM_AUTHORIZED_SLACK_USERS } from './lib/report-config.mjs';

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

const notify = (text) => postMessage({ token: BOT_TOKEN, channel: SLACK_CHANNEL, text }).catch(() => {});

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
  const head = result.scheduled
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
    const label = result.scheduled ? '預覽／編輯' : '看文章／編輯';
    lines.push('', `🔗 <${result.url}|${label}>（登入 /admin 後右下角「編輯」鈕可直接改）`);
  }
  const cover = result.coverImage ? '封面 ✓' : '封面 ✗';
  lines.push(`🖼 ${cover} · 內文 ${result.inlineImages ?? 0} 張圖`);
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
async function announceWhenLive(job, result, out, url) {
  if (!url) { notify(buildDoneMessage(job, result, out)); return; }
  const live = await waitForLive(url);
  const msg = buildDoneMessage(job, result, out);
  notify(live ? msg : `${msg}\n（⚠️ 預覽頁部署較久，若點開仍 404 請稍候一兩分鐘重新整理）`);
}

// 收工單：沒在跑就立刻開跑；正在跑就排隊並回報順位。輪到時 drain() 自動接上。
function enqueue(job) {
  if (running) {
    queue.push(job);
    const ahead = queue.length; // 正在跑的 1 篇 + 排在這篇前面的（queue.length - 1）
    notify(`🗂️ 已排入佇列：「${job.title}」，前面還有 ${ahead} 篇（含正在產製中的 1 篇）。輪到時自動開始。`);
    return;
  }
  queue.push(job);
  drain();
}

// 若沒有正在跑的，從佇列取下一篇開跑（單一進入點，保證序列）。
function drain() {
  if (running || queue.length === 0) return;
  runEngine(queue.shift());
}

function runEngine(job) {
  running = true;
  const dir = mkdtempSync(join(tmpdir(), 'newsroom-'));
  const jobPath = join(dir, 'job.json');
  writeFileSync(jobPath, JSON.stringify(job));
  const waiting = queue.length ? `（後面還有 ${queue.length} 篇排隊）` : '';
  // 專屬發佈 checkout：開跑前拉回 origin/main 乾淨最新狀態（隔離開發狀態的影響）。
  const prep = prepareCleanCheckout();
  if (!prep.ok) {
    running = false;
    notify(`⚠️ 自動產文未開始：「${job.title}」\n發佈 checkout 同步失敗：${prep.msg}`);
    drain();
    return;
  }
  notify(`📝 開始自動撰寫：「${job.title}」（約十幾分鐘，完成回報）${waiting}`);
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
      // 先確認「完成」但不附連結；連結等頁面真的上線（部署完成）才送，避免點到 404。
      notify(`✅ 自動產文完成：「${result?.title || job.title}」${sched && dateYmd ? `（排程 ${dateYmd} 發佈）` : ''}\n⏳ 部署中，預覽連結待頁面上線後送出（約 3–5 分鐘）`);
      announceWhenLive(job, result, out, url); // 背景輪詢，不阻塞佇列
    } else {
      notify(`⚠️ 自動產文失敗（exit ${code}）：「${job.title}」\n\`\`\`${out.slice(-800)}\`\`\``);
    }
    drain(); // 接下一篇（成功或失敗都繼續）
  });
  child.on('error', (e) => {
    running = false;
    notify(`⚠️ 自動產文無法啟動：「${job.title}」：${e.message}`);
    drain();
  });
}

function startServer() {
  if (!SIGNING_SECRET || !BOT_TOKEN) {
    console.error('缺 SLACK_SIGNING_SECRET 或 SLACK_BOT_TOKEN（請 source ~/.config/appi-news/report.env）');
    process.exit(1);
  }
  createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') return res.writeHead(200).end('ok');
    if (req.method !== 'POST' || !req.url.startsWith('/slack')) return res.writeHead(404).end('not found');

    const rawBody = await readRawBody(req);
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
    if (result.startEngine) enqueue(result.startEngine);
  }).listen(PORT, '0.0.0.0', () => console.log(`slack-actions-server on 0.0.0.0:${PORT}（repo=${REPO_DIR}）`));
}

// 只有「直接執行」才啟動 server；被 import（測試）時不啟動、不綁埠。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
