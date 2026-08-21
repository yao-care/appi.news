// 檢查目前 checkout 是否落後 origin/main，落後就印警告。
//
// 為什麼需要：weekly-data / growth-audit 用「本地 src/content/articles」建 slug→分類對照，
// 在落後的分支上跑，之後新發的文章全對不到檔案，GA4 分類報表會把它們默默歸成
// uncategorized（2026-08-20 實測：舊分支上看到 703 PV「未分類」，最新 main 重算只剩 10 PV），
// 不會報錯、只會給出失真的結論。cron 環境乾淨不受影響，這是給互動查數據的保險。
//
// 只比對本地已有的 origin/main ref（不 fetch、不連網），所以 origin/main 若很久沒 fetch
// 會低估落後量；這裡要的是「便宜且必印」的提醒，不追求精準。
import { spawnSync } from 'node:child_process';

/** 回傳 HEAD 落後 origin/main 的 commit 數；不是 git repo 或 git 失敗回 0（不打擾）。 */
export function commitsBehindMain(cwd = process.cwd()) {
  const r = spawnSync('git', ['rev-list', '--count', 'HEAD..origin/main'], { cwd, encoding: 'utf8' });
  if (r.status !== 0) return 0;
  const n = Number((r.stdout || '').trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** 落後就往 stderr 印一行警告（stderr 才不會汙染 stdout 的 JSON 輸出）。回傳落後數供測試。 */
export function warnIfStaleCheckout(cwd = process.cwd(), log = (m) => console.error(m)) {
  const behind = commitsBehindMain(cwd);
  if (behind > 0) {
    log(`⚠ 本 checkout 落後 origin/main ${behind} 個 commit：新文章會被歸成 uncategorized、分類報表失真，建議切到最新 main 再跑。`);
  }
  return behind;
}
