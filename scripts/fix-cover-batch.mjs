// 封面 Discover 規格批次修復：check-cover-spec 不合格的存量頁，按 GSC 曝光由高到低重取封面。
// 站長 2026-08-22 裁示（成長第 4 槓桿：Discover 目前為 0，先把封面規格清乾淨）。
//
// 行為：
//   node scripts/fix-cover-batch.mjs               # dry-run：列會處理哪些頁（含曝光排序）
//   node scripts/fix-cover-batch.mjs --limit 20 --go
//   - 只挑「封面不符規格」且 category ≠ sports 的頁（真實選手/人物不可 AI 生圖鐵律）。
//   - 逐頁走 get-image（圖庫優先＋審查、fallback codex 生圖；covers/ механи把關 ≥1200 橫式）。
//   - 成功後改寫 frontmatter：coverImage 指向新檔、stock 有 credit 就寫 coverImageCredit、
//     generated 則移除舊 credit；蓋 updatedDate。舊圖檔留在 public/（歷史 URL 不破）。
//   - 需要 GSC 金鑰（伺服器上跑）；拿不到曝光時退回檔名排序照清。
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkCoverFile } from './lib/cover-spec.mjs';

const ARTICLES = 'src/content/articles';
const GO = process.argv.includes('--go');
const LIMIT = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : 20;

function fm(text) { const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/); return m ? m[1] : ''; }
function field(block, name) {
  const m = block.match(new RegExp(`^${name}:[ \\t]*"?(.+?)"?[ \\t]*$`, 'm'));
  return m ? m[1] : '';
}

// 1. 盤出不合格頁
const bad = [];
for (const f of readdirSync(ARTICLES)) {
  if (!/\.mdx?$/.test(f)) continue;
  const text = readFileSync(join(ARTICLES, f), 'utf8');
  const block = fm(text);
  const cover = field(block, 'coverImage');
  if (!cover) continue;
  const category = field(block, 'category');
  if (category === 'sports') continue; // 真實選手不可 AI 生圖
  const p = join('public', cover);
  if (!existsSync(p)) continue; // 缺檔屬另一類問題，交 gate
  const check = await checkCoverFile(p).catch(() => null);
  if (!check || check.ok) continue;
  const slug = field(block, 'slug') || f.replace(/\.mdx?$/, '');
  bad.push({ file: f, slug, title: field(block, 'title'), desc: field(block, 'description').slice(0, 120), cover });
}

// 2. 按 GSC 曝光排序（拿不到就維持原序）
try {
  const { loadServiceAccount, getAccessToken, gscQuery } = await import('./lib/google-data.mjs');
  const { GSC_SCOPE, GSC_SA_KEY_PATH } = await import('./lib/report-config.mjs');
  const sa = loadServiceAccount(GSC_SA_KEY_PATH);
  const t = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });
  const r = await gscQuery({ token: t, body: { startDate: '2026-07-01', endDate: '2026-08-22', dimensions: ['page'], rowLimit: 5000 } });
  const imp = new Map((r.rows || []).map((x) => [x.keys[0].replace(/^https:\/\/appi\.news/, ''), x.impressions]));
  for (const b of bad) b.imp = imp.get(`/articles/${b.slug}/`) || 0;
  bad.sort((a, b2) => b2.imp - a.imp);
} catch (e) {
  console.warn(`⚠️ 取不到 GSC 曝光（${String(e.message).slice(0, 80)}），改用檔名序`);
}

const batch = bad.slice(0, LIMIT);
console.log(`不合格（非 sports、檔案存在）共 ${bad.length} 頁；本批 ${batch.length} 頁：`);
for (const b of batch) console.log(`  imp ${String(b.imp ?? '-').padStart(5)}  ${b.slug}`);
if (!GO) { console.log('\n（dry-run；加 --go 實際重取封面）'); process.exit(0); }

// 3. 逐頁重取封面 + 回寫 frontmatter
let ok = 0;
for (const b of batch) {
  const outPath = `public/covers/${b.slug}-cover.webp`;
  const r = spawnSync('node', ['scripts/get-image.mjs',
    '--topic', b.title, '--article-context', b.desc || b.title,
    '--caption', b.title, '--alt', b.title,
    '--out', outPath, '--width', '1280'], { encoding: 'utf8', timeout: 20 * 60_000 });
  let info = null;
  try { info = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch { /* 解析失敗走下面 */ }
  if (r.status !== 0 || !info?.file) {
    console.log(`  ✖ ${b.slug}：取圖失敗（${(r.stderr || r.stdout || '').trim().slice(-120)}）`);
    continue;
  }
  const path = join(ARTICLES, b.file);
  let text = readFileSync(path, 'utf8');
  text = text.replace(/^coverImage:.*$/m, `coverImage: "covers/${b.slug}-cover.webp"`);
  if (info.credit) {
    text = /^coverImageCredit:/m.test(text)
      ? text.replace(/^coverImageCredit:.*$/m, `coverImageCredit: "${info.credit}"`)
      : text.replace(/^coverImage:.*$/m, (l) => `${l}\ncoverImageCredit: "${info.credit}"`);
  } else {
    text = text.replace(/^coverImageCredit:.*\n/m, '');
  }
  const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
  text = /^updatedDate:/m.test(text)
    ? text.replace(/^updatedDate:.*$/m, `updatedDate: ${today}`)
    : text.replace(/^coverImage:/m, `updatedDate: ${today}\ncoverImage:`);
  writeFileSync(path, text);
  ok++;
  console.log(`  ✓ ${b.slug}（${info.mode}${info.credit ? '，credit 已寫' : ''}）`);
}
console.log(`\n完成 ${ok}/${batch.length} 頁；剩餘 ${bad.length - batch.length} 頁下批再清（重跑本指令即可，冪等）。`);
