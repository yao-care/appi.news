// 「一篇文章上線前要過哪些 gate」的唯一定義點。
//
// 在這支出現之前，各產線各自維護一段 25~40 行的 gate spawn 序列，實測漂移成四種順序、
// 兩種失敗語意（有的線一篇違規會把整批好稿一起 die 掉）；「加一道 gate」等於同時改遍
// 所有產線（例：2026-08-11 封面規格、2026-08-07 成長規則，各改了全部入口檔）。
// 收攏後：gate 的組成、順序、report-only 與否只在這裡改，一處生效、不再漏接。
//
// 順序（便宜的先跑）：assets（純 fs）→ growth（report-only 永不擋）→ tags → tone
//   → dup（選配，見下）→ cover（要讀圖檔，最貴）。
// dup（check-duplicate-topic）預設關閉：每日 roundup 型產線（便民/警消）的標題本來就
// 高度相似，開了必誤殺；只有「一題一篇」的線（newsroom、健康紀念日）才開。
//
// 失敗語意統一為「回報，不決定」：這裡只回 {ok:false, gate, label, detail}，
// 剔除該篇還是中止整批由呼叫端決定——但**永遠不該讓一篇違規拖垮同批其他好稿**。

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ARTICLES_DIR = 'src/content/articles';

/**
 * 該篇引用了、但 public/ 下不存在的本地圖檔（封面＋內文）。空陣列＝都在。
 * 在 build/check:links 之前就攔下「有引用卻沒存到圖」的半成品。
 */
export function missingLocalAssets(slug, { articlesDir = ARTICLES_DIR, publicDir = 'public' } = {}) {
  const file = join(articlesDir, `${slug}.md`);
  if (!existsSync(file)) return ['（文章檔不存在）'];
  const raw = readFileSync(file, 'utf8');
  const refs = new Set();
  for (const m of raw.matchAll(/(covers|images)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|avif)/gi)) refs.add(m[0]);
  return [...refs].filter((r) => !existsSync(join(publicDir, r)));
}

/** gate 定義（順序即執行順序）。blocking:false ＝ report-only，只印不擋。 */
export const GATES = [
  { key: 'growth', label: '成長規則自檢', script: 'scripts/growth-lint.mjs', blocking: false },
  { key: 'tags', label: '標籤 gate（受控詞彙表）', script: 'scripts/check-tags.mjs', blocking: true },
  { key: 'tone', label: '去 AI 腔 gate', script: 'scripts/check-content.mjs', blocking: true },
  { key: 'dup', label: '選題重複 gate', script: 'scripts/check-duplicate-topic.mjs', blocking: true, optIn: true },
  { key: 'cover', label: '封面規格 gate（Discover 橫式 ≥1200）', script: 'scripts/check-cover-spec.mjs', blocking: true },
];

/**
 * 對單篇文章跑完整 gate 序列。
 * @param {string} slug
 * @param {object} opts
 *   - dup: true 才跑選題重複 gate（預設 false，理由見檔頭）
 *   - cover: false 可關封面規格 gate（僅 newsroom-write——它有自己更嚴的配圖 gate；
 *     自動產線一律保持預設 true）
 *   - log: 進度輸出（growth 的 report-only 結果與各 gate stdout 走這裡）
 *   - spawnImpl: 測試注入用
 * @returns {{ok:true} | {ok:false, gate:string, label:string, detail:string}}
 */
export function runArticleGates(slug, { articlesDir = ARTICLES_DIR, dup = false, cover = true, log = console.log, spawnImpl = spawnSync } = {}) {
  const missing = missingLocalAssets(slug, { articlesDir });
  if (missing.length) {
    return { ok: false, gate: 'assets', label: '缺本地圖檔', detail: missing.join('、') };
  }
  const file = join(articlesDir, `${slug}.md`);
  for (const g of GATES) {
    if (g.optIn && !dup) continue;
    if (g.key === 'cover' && !cover) continue;
    const r = spawnImpl('node', [g.script, file], { encoding: 'utf8' });
    const out = ((r.stdout || '') + (r.stderr || '')).trim();
    if (!g.blocking) {
      if (out) log(out);
      continue;
    }
    if (r.status !== 0) return { ok: false, gate: g.key, label: g.label, detail: out };
    if (out) log(out);
  }
  return { ok: true };
}
