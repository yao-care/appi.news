// CI 用：判斷「這次排程要不要真的 build + deploy」。
//
// 為什麼需要：deploy.yml 改成每 15 分鐘排程後（2026-08-06 拿掉 push 觸發），
// 若無條件執行就是一天 96 次 build、每次重傳約 335 MB 的 artifact，
// 而平常日真正有內容變動的次數只有十幾次。沒事不部署，才不會把節流問題放大。
//
// **判斷不能只看 commit**：排程稿（status: scheduled + 未來 publishDate）是靠
// 「build 當下時間」才轉正的（src/utils/content.ts 的 isPublic），沒有新 commit 也需要重建。
// 健康紀念日那條線就是這樣上線的。所以兩個條件任一成立就要部署：
//   ① 上次成功部署之後有新 commit
//   ② 有排程稿的 publishDate 落在（上次部署時間, 現在]
//
// **抓不到上次部署資訊時一律回 true**（fail-open）：寧可多部署一次，不可漏掉內容。
//
// 用法：node scripts/deploy-needed.mjs <lastDeployedSha> <lastDeployedISOTime>
//   印 "true"／"false" 到 stdout（給 GITHUB_OUTPUT 用）。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { isPublicFrontmatter } from '../src/utils/visibility.mjs';

const ARTICLES_DIR = 'src/content/articles';

/**
 * 有沒有文章在（after, now] 這段區間「從隱藏轉為公開」。純函式，方便測試。
 * 判準走可見性正本（src/utils/visibility.mjs）：**任何 status** 只要 publishDate 落在區間內
 * 都算到期——舊碼只認 status: scheduled，frontmatter 寫 published＋未來日期的排程稿
 * 站台會隱藏、CI 卻不重建，到期不上線（2026-08-20 架構體檢修正）。
 * @param {Array<{status?:string, publishDate?:string, draft?:boolean}>} entries 文章 frontmatter 摘要
 */
export function hasDueScheduled(entries, after, now = new Date()) {
  const from = new Date(after).getTime();
  if (!Number.isFinite(from)) return true; // 上次時間不可解讀 → fail-open
  return (entries || []).some((e) => !isPublicFrontmatter(e, from) && isPublicFrontmatter(e, now));
}

/** 讀出每篇文章的 status / publishDate / draft（只讀 frontmatter，不解析全文）。 */
export function readArticleSchedule(dir = ARTICLES_DIR) {
  let files = [];
  try { files = readdirSync(dir).filter((f) => f.endsWith('.md')); } catch { return null; }
  const out = [];
  for (const f of files) {
    try {
      const raw = readFileSync(join(dir, f), 'utf8');
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      const fm = m[1];
      out.push({
        status: fm.match(/^status:\s*["']?([\w-]+)/m)?.[1],
        publishDate: fm.match(/^publishDate:\s*["']?([^"'\n]+)/m)?.[1]?.trim(),
        draft: /^draft:\s*true\b/m.test(fm),
      });
    } catch { /* 單篇壞掉不影響判斷 */ }
  }
  return out;
}

function main() {
  const [lastSha, lastTime] = process.argv.slice(2);
  if (!lastSha || !lastTime) return true; // 沒有上次成功部署的資訊 → 部署

  let head = '';
  try { head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(); } catch { return true; }
  if (head !== lastSha) return true; // 有新 commit

  const entries = readArticleSchedule();
  if (entries === null) return true; // 讀不到文章目錄 → 別冒險，照部署
  return hasDueScheduled(entries, lastTime);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(main() ? 'true' : 'false');
}
