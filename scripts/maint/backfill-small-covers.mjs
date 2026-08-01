// 一次性維護：把 <1200px 的舊封面換成 ≥1200px（Google Discover／Top Stories 大圖門檻）。
//
// 為什麼需要：站上累積 129 張 <1200px 封面，那些文章拿不到 Discover 大卡片版位。
// 源頭已於 2026-07-31 堵住（agent.writer 加 pickCoverSource 下限、worker 加
// orientation=landscape、get-image.mjs 本來就對 covers/ 用 1200），本腳本處理存量。
// 背景見 docs/lessons/discover-image-and-meta-signals.md。
//
// 設計：
// - **查詢字用受控標籤推導**，不再為了生英文 query 而多打一輪 LLM（省共用額度）。
// - 逐篇呼叫 scripts/get-image.mjs（圖庫優先、內含 Haiku 候選審查），成功才改 frontmatter。
// - 冪等：跑完會重新量尺寸，已達標的跳過；中途中斷可直接重跑。
// - 失敗不中止整批，最後列出待處理清單。
//
// 用法：
//   node scripts/maint/backfill-small-covers.mjs --limit 20            # 先跑最新 20 篇
//   node scripts/maint/backfill-small-covers.mjs --limit 999 --go      # 全部
//   不帶 --go 為 dry-run（只列出要處理什麼、印出推導的查詢字）

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';

const ARTICLES = 'src/content/articles';
const MIN_WIDTH = 1200;
const arg = (n, d = '') => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const GO = process.argv.includes('--go');
const LIMIT = Number(arg('limit', '20'));

/** 受控標籤 → 英文圖庫查詢字。查無對應時退回分類的通用字。 */
const TAG_QUERY = {
  醫療AI: 'medical artificial intelligence hospital technology',
  數位健康: 'digital health mobile app wellness',
  預防醫學: 'preventive health checkup clinic',
  健檢報告: 'medical report health screening document',
  代謝健康: 'metabolic health nutrition lifestyle',
  糖尿病: 'blood glucose monitoring diabetes care',
  心血管健康: 'heart health cardiology stethoscope',
  癌症防治: 'cancer screening hospital care',
  高齡健康: 'senior citizens health elderly care',
  長照: 'elderly care nursing home caregiver',
  肌少症: 'senior strength training exercise',
  骨骼關節: 'joint pain orthopedic physiotherapy',
  復健治療: 'physical therapy rehabilitation clinic',
  中醫: 'traditional chinese medicine herbs acupuncture',
  營養: 'healthy food nutrition vegetables',
  保健食品: 'supplements vitamins capsules',
  食品安全: 'food safety kitchen hygiene',
  口腔健康: 'dental care teeth checkup',
  心理健康: 'mental health calm mindfulness',
  傳染病防治: 'public health hygiene handwashing',
  公共衛生: 'public health community clinic',
  健保: 'health insurance card hospital counter',
  醫療政策: 'government health policy building',
  藥物研發: 'pharmaceutical laboratory research',
  睡眠與疲勞: 'sleep bedroom rest',
  減重管理: 'weight management scale exercise',
  眼睛健康: 'eye care vision optometry',
  疼痛治療: 'pain management clinic therapy',
  育兒健康: 'parenting children health',
  AI: 'artificial intelligence technology abstract',
  'AI agent': 'artificial intelligence automation workflow',
  AI治理: 'technology policy regulation office',
  生成式AI: 'generative ai computer screen',
  AI基礎建設: 'data center servers infrastructure',
  半導體: 'semiconductor wafer chip fabrication',
  台積電: 'semiconductor fab clean room taiwan',
  先進封裝: 'semiconductor packaging microchip',
  資安: 'cybersecurity network lock server',
  資料治理: 'data governance server database',
  個資保護: 'privacy data protection',
  新創: 'startup team office meeting',
  數位轉型: 'digital transformation office technology',
  機器人: 'industrial robot automation factory',
  開發工具: 'software developer code screen',
  科技政策: 'technology policy government',
  能源政策: 'power grid electricity transmission',
  電網: 'electricity grid power lines',
  再生能源: 'solar panels wind turbines renewable',
  離岸風電: 'offshore wind turbines sea',
  儲能: 'battery energy storage facility',
  核能: 'nuclear power plant',
  氣候變遷: 'climate change environment',
  氣候調適: 'climate adaptation city heat',
  極端高溫: 'heatwave sun city hot weather',
  水資源: 'water reservoir river supply',
  碳費: 'carbon emissions industry chimney',
  碳盤查: 'carbon accounting industry data',
  ESG: 'sustainability business green office',
  循環經濟: 'recycling circular economy materials',
  淨零轉型: 'net zero green energy transition',
  環境部: 'government building environment taiwan',
  經濟部: 'government ministry building',
  資本市場: 'stock market trading charts',
  投資理財: 'investment finance charts calculator',
  退休規劃: 'retirement planning senior finance',
  總體經濟: 'economy finance city skyline',
  供應鏈: 'supply chain logistics container port',
  房市: 'housing real estate apartment buildings',
  消費趨勢: 'retail shopping consumer',
  金融科技: 'fintech mobile payment',
  企業經營: 'business meeting office strategy',
  職場趨勢: 'modern office workplace people',
  生技產業: 'biotechnology laboratory research',
  製造業: 'manufacturing factory production line',
  保險: 'insurance documents consultation',
  便民措施: 'government service counter public',
  市政服務: 'city hall public service',
  颱風: 'typhoon storm clouds wind',
  天然災害: 'natural disaster emergency response',
  警察: 'police patrol street safety',
  交通: 'traffic road transportation city',
  育兒: 'parenting family children',
  教育: 'classroom school students',
  少子化: 'empty classroom demographics',
  超高齡社會: 'elderly society senior citizens',
  居家安全: 'home safety household',
  美食: 'food cuisine restaurant dish',
  節慶: 'traditional festival lanterns temple',
  旅遊: 'travel destination landscape',
  文化藝術: 'art culture exhibition',
  桌球: 'table tennis ping pong sport',
  棒球: 'baseball stadium sport',
  籃球: 'basketball court sport',
  足球: 'soccer football stadium',
  健身: 'fitness gym workout',
  運動科技: 'sports technology wearable',
  運動醫學: 'sports medicine physiotherapy athlete',
  學生賽事: 'school sports competition students',
  國際賽事: 'international sports competition stadium',
};
const CATEGORY_QUERY = {
  health: 'health wellness clinic',
  tech: 'technology computer abstract',
  focus: 'policy government infrastructure',
  finance: 'finance business charts',
  international: 'world news city international',
  sports: 'sports competition stadium',
  lifestyle: 'daily life taiwan city',
};

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}
function field(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'));
  return m ? m[1].trim() : '';
}
function tagsOf(fm) {
  const inline = fm.match(/^tags:\s*\[(.*)\]/m);
  if (inline) return inline[1].split(',').map((t) => t.replace(/["'\s]/g, '')).filter(Boolean);
  const block = fm.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (!block) return [];
  return [...block[1].matchAll(/^\s+-\s+"?([^"\n]+)"?/gm)].map((x) => x[1].trim());
}

const targets = [];
for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
  const p = path.join(ARTICLES, f);
  const raw = readFileSync(p, 'utf8');
  const fm = frontmatter(raw);
  const cover = field(fm, 'coverImage');
  if (!cover || /^https?:/.test(cover)) continue;
  const local = path.join('public', cover);
  if (!existsSync(local)) continue;
  let w = 0;
  try { w = (await sharp(local).metadata()).width ?? 0; } catch { continue; }
  if (w >= MIN_WIDTH) continue;
  const slug = field(fm, 'slug') || f.replace(/\.mdx?$/, '');
  const tags = tagsOf(fm);
  const cat = field(fm, 'category');
  const query = tags.map((t) => TAG_QUERY[t]).find(Boolean) || CATEGORY_QUERY[cat] || 'taiwan news';
  targets.push({ file: p, slug, title: field(fm, 'title'), date: field(fm, 'publishDate').slice(0, 10), w, query, cat });
}
targets.sort((a, b) => b.date.localeCompare(a.date));
const batch = targets.slice(0, LIMIT);
console.log(`待處理 ${targets.length} 篇，本次取最新 ${batch.length} 篇${GO ? '' : '（dry-run）'}`);

let ok = 0;
const failed = [];
for (const t of batch) {
  if (!GO) { console.log(`  ${t.date} ${String(t.w).padStart(4)}px  ${t.slug}  → "${t.query}"`); continue; }
  const out = `public/covers/${t.slug}-cover.webp`;
  const r = spawnSync('node', ['scripts/get-image.mjs',
    '--topic', t.title.slice(0, 60),
    '--context', `${t.cat} 分類文章：${t.title}`,
    '--query', t.query,
    '--caption', t.title.slice(0, 40),
    '--alt', t.title.slice(0, 40),
    '--article-context', t.title.slice(0, 60),
    '--out', out,
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const line = (r.stdout || '').trim().split('\n').filter((l) => l.startsWith('{')).pop();
  let info = null;
  try { info = JSON.parse(line); } catch { /* noop */ }
  if (!info?.file || !existsSync(out)) { failed.push(`${t.slug}: ${(r.stderr || r.stdout || '').slice(-120)}`); continue; }
  const nw = (await sharp(out).metadata()).width ?? 0;
  if (nw < MIN_WIDTH) { failed.push(`${t.slug}: 新圖仍只有 ${nw}px`); continue; }
  let raw = readFileSync(t.file, 'utf8');
  raw = raw.replace(/^coverImage:.*$/m, `coverImage: "covers/${t.slug}-cover.webp"`);
  if (info.credit) {
    raw = /^coverImageCredit:/m.test(raw)
      ? raw.replace(/^coverImageCredit:.*$/m, `coverImageCredit: "${info.credit}"`)
      : raw.replace(/^(coverImage:.*)$/m, `$1\ncoverImageCredit: "${info.credit}"`);
  }
  writeFileSync(t.file, raw);
  ok++;
  console.log(`  ✓ ${t.slug}  ${t.w}px → ${nw}px  (${info.mode})`);
}
if (GO) {
  console.log(`\n完成 ${ok} 篇，失敗 ${failed.length} 篇，剩餘待處理 ${targets.length - ok}`);
  failed.forEach((f) => console.log('  ✗ ' + f));
}
