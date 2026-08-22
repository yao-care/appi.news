// 一次性呼叫 claude-appi CLI（print/json 模式），供圖片階段的兩層 LLM 用：
//   · runClaudeOnce        — 純文字輸出（擬真照 prompt 展開，Sonnet）
//   · runClaudeAgentText   — 帶工具（Read/vision）的 agent（生成圖視覺自檢，Haiku）
//
// 移植自 /root/agent.writer/scripts/lib/claude-cli.ts。差異：
//   - appi 一律用 `claude-appi`（2026-07-28 起全站唯一帳號，互動與自動化共用）；不解析 usage 入帳。
//   - 模型 id 由呼叫端明確帶入（'claude-sonnet-5' / 'haiku'），不做別名解析。
//   - 巢狀防呆：get-image.mjs 可能被外層 claude 會話（newsroom-write）以 Bash 叫起，
//     這裡再 spawn claude-appi ＝巢狀；刪掉 CLAUDECODE 讓子進程當獨立會話（同 writer）。
//   - claude-appi 撞用量上限時會 exit 0 只印限額訊息 → 視為暫時性失敗交給 withRetry 退避。

import { spawn, spawnSync } from 'node:child_process';

function cleanEnv() {
  const env = { ...process.env };
  delete env.CLAUDECODE; // 避免巢狀鎖定
  return env;
}

// 「Claude 成功了嗎」的判定正本（全站唯一，別在各產線重抄 regex）。
// 撞額度是**帳號層級**：這一則被擋，同批剩下每一則都會被擋，呼叫端必須中止整批，
// 不可照單則錯誤 continue（會把 20+ 則狂打成空跑，見 docs/lessons/automation-model-and-account-split.md）。
// claude-appi 撞上限時會 exit 0 只印限額訊息 → 必須查 stdout，不能只看 exit code。
export const QUOTA_RE = /hit your .*limit|weekly limit|usage limit/i;
// 單則失敗（API error／拒答）：只影響這一則，呼叫端跳過該則、續跑下一則即可。
export const CLAUDE_FAIL_RE = /API Error|Usage Policy|unable to respond/i;
// 兩者聯集：runClaudeOnce 的退避重試沿用（重試對兩類都適用——限額會在額度重置後自癒）。
const LIMIT_RE = new RegExp(`${CLAUDE_FAIL_RE.source}|${QUOTA_RE.source}`, 'i');

/**
 * 把一次 claude-appi spawnSync 的結果分類成三態（純函式，可測）：
 *   { kind: 'quota', detail }  撞用量上限 → 呼叫端**中止整批**
 *   { kind: 'fail',  detail }  單則失敗（API error／拒答／非 0 退出）→ 呼叫端跳過該則
 *   { kind: 'ok',    stdout }  正常 → 交給 parseSentinelResult
 */
export function classifyClaudeRun({ error, status, stdout, stderr } = {}) {
  const out = stdout || '';
  if (QUOTA_RE.test(out)) return { kind: 'quota', detail: out.trim().slice(-200) };
  if (error || status !== 0 || CLAUDE_FAIL_RE.test(out)) {
    return { kind: 'fail', detail: (stderr || out || error?.message || `exit ${status}`).trim().slice(-200) };
  }
  return { kind: 'ok', stdout: out };
}

/**
 * 產文用的一次性 claude-appi（同步、無重試——一篇要 6~9 分鐘，重試語意交給「下輪 cron 重新選題」）。
 * 回傳 classifyClaudeRun 的三態。model 一律明確帶入（不帶 --model 會默默吃 Opus 燒爆週額度）。
 */
export function runClaudeArticle({ prompt, model = 'claude-sonnet-5', maxBufferMB = 64, spawnImpl = spawnSync }) {
  const r = spawnImpl('claude-appi', ['--model', model, '-p', prompt], {
    encoding: 'utf8',
    maxBuffer: maxBufferMB * 1024 * 1024,
    env: cleanEnv(),
  });
  return classifyClaudeRun(r);
}

/**
 * 解析產線哨兵行（`<SENTINEL>_RESULT=NEW｜slug ｜ 說明`）的共用實作。
 * 各產線的 parseXResult 一律薄包這支，別再各自抄 regex（曾漂移出 8 個變體）。
 *
 * 回傳 { action, slug, note, fields, infra? }：
 *   - action：動詞小寫（new/update/skip/ok…，依 verdicts）
 *   - slug：第一欄洗到只剩 [a-z0-9-]（模型常包反引號/粗體，見 lib/acute-care.mjs 2026-08-03 教訓）
 *   - fields：rest 以全半形直線切開的各欄（tech 的 targetQuery 這類附加欄位由呼叫端取用）
 *   - infra: true ＝ 整行解析不出來 → **故障，不是編輯判斷**：不可記帳本、不可當終止條件，
 *     先 salvageArticle 撿稿（模型常已把稿寫好在工作區）。
 */
export function parseSentinelResult(stdout, sentinel, { verdicts = ['NEW', 'SKIP'] } = {}) {
  const re = new RegExp(`${sentinel}_RESULT\\s*=\\s*(${verdicts.join('|')})\\s*[｜|:：]\\s*(.*)$`, 'im');
  const m = String(stdout || '').match(re);
  if (!m) return { action: 'skip', slug: null, note: `無法解析 ${sentinel}_RESULT（視為跳過）`, fields: [], infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  const fields = rest.split(/[｜|]/).map((x) => x.trim());
  if (action === 'skip') return { action: 'skip', slug: null, note: rest, fields };
  const raw = rest.split(/[\s｜|]/)[0] || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action, slug, note: rest, fields };
}

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 4_000;
const MAX_DELAY_MS = 60_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 退避毫秒（指數 + 抖動，夾在上限內）。抖動用 process.hrtime 取代 Math.random（不影響正確性、可跑）。
function backoffDelay(attempt) {
  const base = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
  const jitter = Number(process.hrtime.bigint() % 1000n);
  return base + jitter;
}

async function withRetry(label, fn) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt >= MAX_ATTEMPTS) break;
      const delay = backoffDelay(attempt);
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`     ⏳ ${label} 失敗（第 ${attempt}/${MAX_ATTEMPTS} 次，${Math.round(delay / 1000)}s 後重試）：${msg.slice(0, 120)}`);
      await sleep(delay);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

// 單次 spawn claude-appi。非 0 退出、is_error 結果、撞限額訊息、逾時皆 reject（交給 withRetry）。
function spawnClaudeOnce({ prompt, model, timeoutMs, cwd, tools }) {
  return new Promise((resolve, reject) => {
    const args = ['-p', prompt, '--model', model, '--output-format', 'json'];
    if (tools) args.push('--allowedTools', tools);
    const child = spawn('claude-appi', args, {
      cwd,
      env: cleanEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(new Error(`claude-appi 超時（${Math.round(timeoutMs / 1000)}s）`));
    }, timeoutMs);

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `claude-appi exit ${code}`));
        return;
      }
      // 撞用量上限：exit 0 但只印限額訊息 → 當暫時性失敗，退避重試（額度重置後自癒）。
      if (LIMIT_RE.test(stdout)) {
        reject(new Error(`claude-appi 撞用量上限：${stdout.trim().slice(-120)}`));
        return;
      }
      try {
        const obj = JSON.parse(stdout);
        if (obj?.is_error) {
          reject(new Error(typeof obj.result === 'string' ? obj.result : 'claude-appi is_error'));
          return;
        }
        resolve(typeof obj?.result === 'string' ? obj.result : stdout);
      } catch {
        resolve(stdout);
      }
    });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

/** 一次性 claude-appi（純文字輸出，帶退避重試）。model 明確帶入（如 'claude-sonnet-5'）。 */
export async function runClaudeOnce(prompt, model = 'claude-sonnet-5', timeoutMs = 120_000) {
  return withRetry('claude-appi', () => spawnClaudeOnce({ prompt, model, timeoutMs }));
}

/** 帶工具、指定 cwd 的 claude-appi agent（視覺自檢用：Haiku 以 Read 讀圖）。回傳結果文字。 */
export async function runClaudeAgentText(cwd, prompt, opts = {}) {
  const model = opts.model || 'claude-sonnet-5';
  const tools = opts.tools || 'Read';
  const timeoutMs = opts.timeoutMs || 120_000;
  return withRetry('claude-appi agent', () => spawnClaudeOnce({ prompt, model, timeoutMs, cwd, tools }));
}
