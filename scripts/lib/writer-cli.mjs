// 產文（寫文章）用的 LLM CLI 正本——codex 後端。
//
// 站長 2026-08-22 裁示：**自動產線的「寫作文章」一律改用 codex**；查核/選題/配圖/週報等
// 非寫作呼叫維持 claude-appi（三態判定正本仍在 lib/claude-cli.mjs，兩邊規則互不覆蓋）。
// 呼叫端（8 支產線 + newsroom-write）只從這裡拿 runWriterArticle / writerExecArgs，
// 引擎再換一次時只改本檔。
//
// codex exec 行為（0.149 實測）：
//   - headless 可用，最終回覆印在 stdout（transcript 也在 stdout，哨兵行掃全文即可）。
//   - 撞額度/速率的訊息樣態與 claude 不同，QUOTA/FAIL regex 獨立維護在本檔；
//     cron 第二道網＝scripts/cron/_runner.sh 的 CRON_LIMIT_RE（兩邊都要涵蓋 codex 樣態）。
//   - 沙箱：cron 產線需要寫檔＋跑 node（配圖/gate）＋連網查證，
//     故用 --dangerously-bypass-approvals-and-sandbox（等價於 claude headless 的信任模式，
//     只在自家伺服器 cron 使用）；--skip-git-repo-check 讓 worktree/暫存目錄也能跑。
//   - 模型一律明確帶入（同「不帶 --model 默默吃 Opus」的教訓，codex 版＝不帶 -m 吃
//     config.toml 預設，互動改設定就會默默污染產線）。reasoning effort 固定 high：
//     config 全域是 max，那是互動用，產文用 max 只換到更慢更貴。
import { spawnSync } from 'node:child_process';

/** 產線預設寫作模型。要換模型改這裡一處（並同步 docs/automation-invariants.md）。 */
export const WRITER_MODEL = 'gpt-5.6-luna';
export const WRITER_CMD = 'codex';

// 撞額度/速率（帳號層級：整批必須中止，同 claude 版語意）。
export const CODEX_QUOTA_RE = /usage limit|rate limit|quota (?:exceeded|reached)|too many requests|\b429\b/i;
// 單則失敗（連線/串流層）：只跳過該則。非 0 退出與 spawn error 由 classify 直接判 fail，不靠這條。
export const CODEX_FAIL_RE = /stream (?:error|disconnected)|connection (?:refused|reset)|network error/i;

/** 組 codex exec 參數（單一正本；newsroom-write 要 stdio:'inherit' 自己 spawn 時也用它）。 */
export function writerExecArgs(prompt, { model = WRITER_MODEL } = {}) {
  return [
    'exec',
    '--dangerously-bypass-approvals-and-sandbox',
    '--skip-git-repo-check',
    '-m', model,
    '-c', 'model_reasoning_effort="high"',
    prompt,
  ];
}

/**
 * 把一次 codex exec 的結果分類成三態（純函式，可測；語意對齊 classifyClaudeRun）：
 *   { kind: 'quota', detail }  撞額度/速率 → 呼叫端**中止整批**
 *   { kind: 'fail',  detail }  單則失敗（非 0 退出/spawn error/連線層錯誤）→ 跳過該則
 *   { kind: 'ok',    stdout }  正常 → 交給 parseSentinelResult
 */
export function classifyWriterRun({ error, status, stdout, stderr } = {}) {
  const out = `${stdout || ''}\n${stderr || ''}`;
  if (CODEX_QUOTA_RE.test(out)) return { kind: 'quota', detail: out.trim().slice(-200) };
  if (error || status !== 0 || CODEX_FAIL_RE.test(out)) {
    return { kind: 'fail', detail: (stderr || stdout || error?.message || `exit ${status}`).trim().slice(-200) };
  }
  return { kind: 'ok', stdout: stdout || '' };
}

/**
 * 產文用的一次性 codex exec（同步、無重試——重試語意交給「下輪 cron 重新選題」，同 claude 版）。
 * 有 45 分鐘保險絲：codex 卡死不該讓 cron 永久掛著（claude 版沒有是歷史遺留，別學）。
 */
export function runWriterArticle({ prompt, model = WRITER_MODEL, maxBufferMB = 64, timeoutMs = 45 * 60_000, spawnImpl = spawnSync }) {
  const r = spawnImpl(WRITER_CMD, writerExecArgs(prompt, { model }), {
    encoding: 'utf8',
    maxBuffer: maxBufferMB * 1024 * 1024,
    timeout: timeoutMs,
    killSignal: 'SIGKILL',
  });
  return classifyWriterRun(r);
}
