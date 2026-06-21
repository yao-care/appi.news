// dev 頻道「請 claude 幫我做」對話式橋接（pm2 長駐，輪詢式，不需 Slack Events）。
//
// 流程：
//   輪詢 DEV_CHANNEL → 新人類訊息 → 序列佇列 → Agent SDK query（在專屬 worktree 跑，
//   多輪用 session resume 續接）→ 回覆貼回原 thread。
//   改程式只在分支 + 開 PR（gh），絕不 push main、不部署、不碰機密——靠 canUseTool(evaluateTool) 程式層把關。
//
// 授權＝頻道成員（私密頻道只放信任開發者）。一次只跑一件（serial）。
//
// 機密由 ~/.config/appi-news/report.env 提供（pm2 啟動時 source）：SLACK_BOT_TOKEN。
// claude CLI 須在 server 已登入（Agent SDK 沿用同一把訂閱認證）。
//
// 純決策邏輯在 lib/dev-bridge.mjs（可單元測試）；本檔是 I/O 薄殼，不單測。

import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { postMessage } from './lib/slack.mjs';
import { DEV_CHANNEL } from './lib/report-config.mjs';
import {
  newRootMessages,
  newThreadReplies,
  maxTs,
  branchForThread,
  evaluateTool,
} from './lib/dev-bridge.mjs';

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const POLL_MS = Number(process.env.DEV_BRIDGE_POLL_MS || 8000);
const HEALTH_PORT = Number(process.env.DEV_BRIDGE_HEALTH_PORT || 3400);
const MAX_TURNS = Number(process.env.DEV_BRIDGE_MAX_TURNS || 60);
const REPLY_LIMIT = 3500; // Slack 單則安全長度

const BASE_CLONE = process.env.DEV_BRIDGE_BASE || '/root/appi.news-devbridge';
const WT_ROOT = process.env.DEV_BRIDGE_WT_ROOT || '/root/appi.news-devbridge-wt';
const STATE_PATH = `${process.env.HOME}/.local/state/appi-news/dev-bridge-state.json`;

const RULES = `你正透過 Slack 的 dev 頻道，與「信任的 APPI News 開發者」對話協作。當前工作目錄是一個專屬 git worktree，分支已開好、base 是 origin/main 的最新狀態。

硬性規則（違反會被系統層擋下，不要嘗試繞過）：
- 要改程式：就在目前這個分支上改，完成後 \`git add\` → \`git commit\` → \`git push -u origin <目前分支>\` → \`gh pr create\` 開 PR，最後在回覆裡附上 PR 連結。
- 絕不 push 到 main/master、絕不 force push、絕不部署（pm2 / docker / wrangler / systemctl）、絕不讀寫機密（.env / report.env / secrets.md / ~/.config / 金鑰）。
- 一次只處理一件事。純分析 / 問答時不必改檔或開 PR。
- 遵守本專案 CLAUDE.md 與 PERFORMANCE.md（效能鐵則、內容紀律、一律 pnpm）。
- 上線前自檢請用 \`pnpm build\` 與 \`pnpm check:links\`。
- 全程用台灣用語繁體中文，回覆精簡、給重點與結論，不要長篇覆述。最後一則訊息就是要貼回 Slack 給人看的內容。`;

// ───────────────────────── Slack API ─────────────────────────

async function slackGet(method, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`https://slack.com/api/${method}?${qs}`, {
    headers: { Authorization: `Bearer ${BOT_TOKEN}` },
  });
  const j = await res.json().catch(() => ({ ok: false, error: `http_${res.status}` }));
  if (!j.ok) throw new Error(`Slack ${method} 失敗: ${j.error}`);
  return j;
}

const reply = (threadTs, text) =>
  postMessage({ token: BOT_TOKEN, channel: DEV_CHANNEL, text, thread_ts: threadTs }).catch((e) =>
    console.error('postMessage 失敗', e.message),
  );

// ───────────────────────── 狀態持久化 ─────────────────────────
// { channelLastTs, threads: { [threadTs]: { sessionId, branch, worktree, lastTs } } }

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { channelLastTs: undefined, threads: {} };
  }
}
function saveState(state) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  const tmp = `${STATE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, STATE_PATH); // 原子寫入，避免半截檔
}

// ───────────────────────── git worktree ─────────────────────────

function git(args, cwd = BASE_CLONE) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} 失敗: ${(r.stderr || r.stdout || '').trim().slice(-300)}`);
  return r.stdout.trim();
}

// 確保專屬 worktree 存在（同一 thread 多輪共用）。首輪建立、後續沿用（保留分支進度）。
function ensureWorktree(threadTs) {
  const branch = branchForThread(threadTs);
  const wt = `${WT_ROOT}/t${String(threadTs).replace('.', '-')}`;
  if (existsSync(wt)) return { branch, worktree: wt };
  git(['fetch', 'origin', '--prune']);
  mkdirSync(WT_ROOT, { recursive: true });
  // -B：分支已存在就重設到 origin/main；新建 worktree 指向它
  git(['worktree', 'add', '-B', branch, wt, 'origin/main']);
  return { branch, worktree: wt };
}

// ───────────────────────── 對話一輪（Agent SDK）─────────────────────────

async function runTurn(threadTs, text, thread) {
  const { branch, worktree } = ensureWorktree(threadTs);
  let sessionId = thread.sessionId;
  let finalText = '';
  let errSubtype = null;

  const q = query({
    prompt: text,
    options: {
      cwd: worktree,
      resume: sessionId || undefined,
      permissionMode: 'default', // 未預先放行的工具一律問 → 走 canUseTool
      settingSources: ['project'], // 載入專案 CLAUDE.md 當脈絡
      maxTurns: MAX_TURNS,
      systemPrompt: { type: 'preset', preset: 'claude_code', append: `${RULES}\n\n（目前分支：${branch}）` },
      canUseTool: async (toolName, input) => evaluateTool(toolName, input, { worktree }),
    },
  });

  for await (const msg of q) {
    if (msg.session_id) sessionId = msg.session_id;
    if (msg.type === 'result') {
      if (msg.subtype === 'success') finalText = msg.result || '';
      else errSubtype = msg.subtype; // error_max_turns / error_during_execution …
    }
  }

  thread.sessionId = sessionId;
  thread.branch = branch;
  thread.worktree = worktree;

  if (errSubtype) {
    return errSubtype === 'error_max_turns'
      ? '（這題太大、達到單輪步數上限就先停了。可以把需求拆小一點再說，或直接接著補充。）'
      : `（處理時中斷了：${errSubtype}。請再說一次或換個說法。）`;
  }
  const out = finalText.trim() || '（這輪沒有可回覆的內容。）';
  return out.length > REPLY_LIMIT ? `${out.slice(0, REPLY_LIMIT)}\n…（內容過長已截斷）` : out;
}

// ───────────────────────── 序列佇列（一次一件）─────────────────────────

const state = loadState();
const queue = []; // { threadTs, text }
let running = false;

function enqueue(threadTs, text) {
  queue.push({ threadTs, text });
  if (running) {
    reply(threadTs, `🗂️ 收到，前面還有 ${queue.length - 1} 件在處理，輪到時自動開始。`);
  }
  drain();
}

async function drain() {
  if (running || queue.length === 0) return;
  running = true;
  const { threadTs, text } = queue.shift();
  const thread = (state.threads[threadTs] ||= { lastTs: threadTs });
  reply(threadTs, '🤔 收到，處理中…');
  try {
    const out = await runTurn(threadTs, text, thread);
    await reply(threadTs, out);
  } catch (e) {
    console.error('runTurn 失敗', e);
    await reply(threadTs, `⚠️ 出錯了：${e.message}`);
  } finally {
    saveState(state);
    running = false;
    drain(); // 接下一件
  }
}

// ───────────────────────── 輪詢 ─────────────────────────

let botUserId = null;

async function poll() {
  try {
    // 1) 新的頂層訊息＝新對話
    const hist = await slackGet('conversations.history', {
      channel: DEV_CHANNEL,
      oldest: state.channelLastTs || '0',
      limit: '50',
      inclusive: 'false',
    });
    const roots = newRootMessages(hist.messages, botUserId);
    for (const m of roots) {
      state.threads[m.ts] ||= { lastTs: m.ts };
      enqueue(m.ts, m.text || '');
    }
    state.channelLastTs = maxTs([...roots, ...(hist.messages || [])], state.channelLastTs || '0');

    // 2) 既有 thread 的新回覆＝接續對話
    for (const threadTs of Object.keys(state.threads)) {
      const t = state.threads[threadTs];
      const rep = await slackGet('conversations.replies', {
        channel: DEV_CHANNEL,
        ts: threadTs,
        oldest: t.lastTs || threadTs,
        limit: '50',
        inclusive: 'false',
      });
      const replies = newThreadReplies(rep.messages, botUserId, threadTs, t.lastTs);
      for (const m of replies) enqueue(threadTs, m.text || '');
      const newLast = maxTs(replies, t.lastTs);
      if (newLast !== t.lastTs) {
        t.lastTs = newLast;
        saveState(state);
      }
    }
  } catch (e) {
    console.error('poll 失敗', e.message);
  } finally {
    setTimeout(poll, POLL_MS);
  }
}

// ───────────────────────── 啟動 ─────────────────────────

async function main() {
  if (!BOT_TOKEN) {
    console.error('缺 SLACK_BOT_TOKEN（請 source ~/.config/appi-news/report.env）');
    process.exit(1);
  }
  if (!existsSync(BASE_CLONE)) {
    console.error(`缺專屬 clone ${BASE_CLONE}；請先 git clone <origin> ${BASE_CLONE}`);
    process.exit(1);
  }
  const auth = await slackGet('auth.test', {});
  botUserId = auth.user_id;
  console.log(`dev-bridge 啟動：bot=${auth.user}(${botUserId}) channel=${DEV_CHANNEL} base=${BASE_CLONE} poll=${POLL_MS}ms`);

  // 健康檢查（本機）：pm2 / 監控用
  createServer((req, res) => {
    if (req.url === '/health') return res.writeHead(200).end('ok');
    res.writeHead(404).end();
  }).listen(HEALTH_PORT, '127.0.0.1', () => console.log(`health on 127.0.0.1:${HEALTH_PORT}`));

  poll();
}

// 給本地端到端測試用（不啟動 server）
export { runTurn, ensureWorktree, RULES };

// 只有「直接執行」才啟動；被 import 時不啟動。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
