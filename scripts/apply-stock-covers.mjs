// 依 stock-picks.json 的「索引」套用封面：URL/署名一律從 stock-candidates.json（可信，來自 API）解析，
// 不採用 picks 內任何 URL/id（避免幻覺）。下載到 public/covers/<slug>-stock.jpg（舊 AI 圖保留），
// 更新 frontmatter coverImage / coverAlt / coverImageCredit。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const cand = Object.fromEntries(
  JSON.parse(readFileSync('docs/content-plan/stock-candidates.json', 'utf8')).map((x) => [x.slug, x]),
);
const picks = JSON.parse(readFileSync('docs/content-plan/stock-picks.json', 'utf8')).filter(
  (p) => p.decision === 'pick',
);

let ok = 0;
const failed = [];
for (const p of picks) {
  const c = cand[p.slug];
  if (!c) { failed.push(`${p.slug}: 候選不存在`); continue; }
  const idx = Number(p.index);
  const photo = c.candidates[idx];
  if (!photo) { failed.push(`${p.slug}: index ${p.index} 超出候選範圍`); continue; }
  const md = `src/content/articles/${p.slug}.md`;
  if (!existsSync(md)) { failed.push(`${p.slug}: 無文章檔`); continue; }

  let buf;
  try {
    const res = await fetch(photo.downloadUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) throw new Error(`檔案過小 ${buf.length}B`);
  } catch (e) {
    failed.push(`${p.slug}: 下載失敗 ${e.message}`);
    continue;
  }
  const outRel = `covers/${p.slug}-stock.jpg`;
  writeFileSync(`public/${outRel}`, buf);

  const alt = p.coverAlt || photo.description || '';
  let t = readFileSync(md, 'utf8');
  t = t.replace(/^coverImage:.*$/m, `coverImage: "${outRel}"`);
  if (/^coverAlt:.*$/m.test(t)) t = t.replace(/^coverAlt:.*$/m, `coverAlt: ${JSON.stringify(alt)}`);
  else t = t.replace(/^(coverImage:.*)$/m, `$1\ncoverAlt: ${JSON.stringify(alt)}`);
  if (/^coverImageCredit:.*$/m.test(t))
    t = t.replace(/^coverImageCredit:.*$/m, `coverImageCredit: ${JSON.stringify(photo.credit)}`);
  else t = t.replace(/^(coverAlt:.*)$/m, `$1\ncoverImageCredit: ${JSON.stringify(photo.credit)}`);
  writeFileSync(md, t);

  ok++;
  console.error(`✓ ${p.slug} ← ${photo.source}#${photo.id} (${(buf.length / 1024).toFixed(0)}KB)`);
  await new Promise((r) => setTimeout(r, 150));
}
console.error(`\n完成 ${ok} 篇；失敗 ${failed.length}${failed.length ? '：\n' + failed.join('\n') : ''}`);
