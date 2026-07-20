// 一次性呼叫 claude-appi CLI（print/json 模式），供圖片階段的兩層 LLM 用：
//   · runClaudeOnce        — 純文字輸出（擬真照 prompt 展開，Sonnet）
//   · runClaudeAgentText   — 帶工具（Read/vision）的 agent（生成圖視覺自檢，Haiku）
//
// 移植自 /root/agent.writer/scripts/lib/claude-cli.ts。差異：
//   - appi 一律用 `claude-appi`（營運帳號，與全站自動化一致）；不解析 usage 入帳。
//   - 模型 id 由呼叫端明確帶入（'claude-sonnet-5' / 'haiku'），不做別名解析。
//   - 巢狀防呆：get-image.mjs 可能被外層 claude 會話（newsroom-write）以 Bash 叫起，
//     這裡再 spawn claude-appi ＝巢狀；刪掉 CLAUDECODE 讓子進程當獨立會話（同 writer）。
//   - claude-appi 撞用量上限時會 exit 0 只印限額訊息 → 視為暫時性失敗交給 withRetry 退避。

import { spawn } from 'node:child_process';

function cleanEnv() {
  const env = { ...process.env };
  delete env.CLAUDECODE; // 避免巢狀鎖定
  return env;
}

// claude-appi 撞週/日額度會 exit 0 只印限額訊息；與 newsroom-write.mjs 的偵測一致。
const LIMIT_RE = /API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit/i;

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
