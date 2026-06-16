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
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
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
 * @param {object} p
 * @param {string} p.rawBody
 * @param {object} p.headers              小寫鍵的標頭物件
 * @param {string} p.signingSecret
 * @param {string[]} p.allowlist          授權 Slack user
 * @param {boolean} p.inFlight            是否已有一篇在產製中
 * @param {number} [p.now]                unix 秒（測試注入）
 */
export function handleInteraction({ rawBody, headers, signingSecret, allowlist, inFlight, now }) {
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
    const { userId, viewpoint, topic } = parseModalSubmission(payload);
    if (!isAuthorized(userId, allowlist)) return errorsResponse('你沒有觸發權限');
    if (inFlight) return errorsResponse('目前已有一篇在產製中，請等它完成再試');
    const job = toJob(topic, viewpoint);
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
let inFlight = false; // 同時只允許一篇，避免並發 --go 撞 git

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

function runEngine(job) {
  inFlight = true;
  const dir = mkdtempSync(join(tmpdir(), 'newsroom-'));
  const jobPath = join(dir, 'job.json');
  writeFileSync(jobPath, JSON.stringify(job));
  notify(`📝 開始自動撰寫：「${job.title}」（約十幾分鐘，完成回報）`);
  const child = spawn('node', ['scripts/newsroom-write.mjs', jobPath, '--go'], { cwd: REPO_DIR, env: process.env });
  let out = '';
  child.stdout.on('data', (d) => (out += d));
  child.stderr.on('data', (d) => (out += d));
  child.on('close', (code) => {
    inFlight = false;
    notify(code === 0 ? `✅ 自動產文完成並發佈：「${job.title}」` : `⚠️ 自動產文失敗（exit ${code}）：「${job.title}」\n\`\`\`${out.slice(-800)}\`\`\``);
  });
  child.on('error', (e) => {
    inFlight = false;
    notify(`⚠️ 自動產文無法啟動：「${job.title}」：${e.message}`);
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
        inFlight,
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
    if (result.startEngine) runEngine(result.startEngine);
  }).listen(PORT, '0.0.0.0', () => console.log(`slack-actions-server on 0.0.0.0:${PORT}（repo=${REPO_DIR}）`));
}

// 只有「直接執行」才啟動 server；被 import（測試）時不啟動、不綁埠。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
