// 讀 stock-cover-decisions.json 的 real 條目，逐篇搜圖庫，收集候選（含描述）供挑選。
// 輸出 docs/content-plan/stock-candidates.json
import { readFileSync, writeFileSync } from 'node:fs';
import { searchStock } from './lib/stock.mjs';

const decisions = JSON.parse(
  readFileSync('docs/content-plan/stock-cover-decisions.json', 'utf8'),
);
const real = decisions.filter((d) => d.decision === 'real' && d.query);
const out = [];
for (const d of real) {
  let r = { unsplash: [], pexels: [] };
  try {
    r = await searchStock(d.query, 6);
  } catch (e) {
    console.error(`${d.slug}: ERR ${e.message}`);
  }
  // pexels 先（實測常較貼題），unsplash 後；picker 看全部
  const candidates = [...r.pexels, ...r.unsplash].map((c) => ({
    source: c.source,
    id: c.id,
    description: c.description,
    photographer: c.photographer,
    downloadUrl: c.downloadUrl,
    credit: c.credit,
  }));
  out.push({ slug: d.slug, title: d.title, kind: d.kind, query: d.query, candidates });
  console.error(`${d.slug}: ${r.unsplash.length}U + ${r.pexels.length}P`);
  await new Promise((res) => setTimeout(res, 250));
}
writeFileSync(
  'docs/content-plan/stock-candidates.json',
  JSON.stringify(out, null, 2),
);
console.error(`wrote ${out.length} entries → docs/content-plan/stock-candidates.json`);
