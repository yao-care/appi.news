#!/usr/bin/env node
/**
 * 存量頁升級（成長工作簿路線 A）：把「Google 已經給曝光、卻沒人點」的頁面，
 * 依**實際搜尋詞**改寫 title 與 description。
 *
 * 為什麼這批最划算：曝光是已經付出的成本。這些頁排進了結果頁，卡在讀者看到標題不想點，
 * 改標題比寫新文章便宜得多。工作簿 §路線 A、docs/growth-playbook.md。
 *
 * 🔴 標題不可以開空頭支票。2026-08-07 手工升級時差點把「藥局買不買得到」寫進標題，
 *    但那篇根本沒談處方與取得管道。所以這支要求模型連帶回傳一句**逐字出自本文的證據**，
 *    程式會比對那句話真的在內文裡，比對不到就整篇不改。
 *
 * 其他安全設計：
 * - 只改 frontmatter 的 title／description／updatedDate，**不動內文一個字**。
 * - 寬度用全形字計（與 growth-lint 的 G3 同一套）：title ≤30、description 60-160。
 * - 禁用句型與中國用語比照 backfill-faq。
 * - 冪等：改過的（updatedDate 為今天且已不在零點擊名單）自然不會再被選中；
 *   中途中斷可直接重跑。
 *
 * 用法：
 *   node scripts/backfill-titles.mjs --dry                 # 只印目標與其實際搜尋詞
 *   node scripts/backfill-titles.mjs --limit 30
 *   node scripts/backfill-titles.mjs --all --concurrency 8
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import { loadServiceAccount, getAccessToken, gscQuery } from './lib/google-data.mjs';
import { GSC_SCOPE, GSC_SA_KEY_PATH } from './lib/report-config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const LIMIT = argv.includes('--all') ? Infinity : Number(arg('--limit', '30'));
const CONCURRENCY = Number(arg('--concurrency', '6'));
/** 曝光低於這個數的頁先不動——樣本太少，改了也看不出效果。 */
const MIN_IMPRESSIONS = Number(arg('--min-impressions', '5'));

const width = (s) => [...s].reduce((n, c) => n + (/[\x00-\x7F]/.test(c) ? 0.5 : 1), 0);
const TELLS = [/—/, /--/, /不僅[^，。]{0,12}更/, /值得注意的是/, /總而言之/, /不是[^，。]{1,12}，而是/, /全面解析/, /一次搞定/, /終極/, /必看/];
const CN = /(軟件|程序員|網絡|算法|人工智能|信息|視頻|質量)/;

const fmOf = (raw) => raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
const one = (fm, k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';

/* --------------------------- 讀文章與 GSC --------------------------- */

const bySlug = new Map();
for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
  const raw = readFileSync(path.join(ARTICLES, f), 'utf8');
  const m = fmOf(raw);
  if (!m) continue;
  const [, fm, body] = m;
  const status = one(fm, 'status') || 'published';
  const d = new Date(one(fm, 'publishDate'));
  if (one(fm, 'draft') === 'true' || status === 'draft' || status === 'archived') continue;
  if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) continue;
  bySlug.set(one(fm, 'slug') || f.replace(/\.mdx?$/, ''), { file: f, fm, body, title: one(fm, 'title') });
}

const sa = loadServiceAccount(GSC_SA_KEY_PATH);
const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });
const end = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
const start = new Date(Date.now() - 91 * 86400e3).toISOString().slice(0, 10);
const rows = (await gscQuery({ token, body: { startDate: start, endDate: end, dimensions: ['page', 'query'], rowLimit: 25000 } })).rows || [];

const agg = new Map(); // slug → { imp, clicks, queries[] }
for (const r of rows) {
  const slug = decodeURIComponent((r.keys[0].match(/\/articles\/([^/]+)\//) || [])[1] || '');
  if (!slug || !bySlug.has(slug)) continue;
  if (!agg.has(slug)) agg.set(slug, { imp: 0, clicks: 0, queries: [] });
  const a = agg.get(slug);
  a.imp += r.impressions;
  a.clicks += r.clicks;
  a.queries.push({ q: r.keys[1], imp: r.impressions, pos: r.position });
}

const targets = [...agg.entries()]
  .filter(([, a]) => a.clicks === 0 && a.imp >= MIN_IMPRESSIONS)
  .map(([slug, a]) => ({ slug, ...a, queries: a.queries.sort((x, y) => y.imp - x.imp).slice(0, 8) }))
  .sort((a, b) => b.imp - a.imp);

console.log(`零點擊且曝光 ≥${MIN_IMPRESSIONS} 的頁：${targets.length} 篇；本次上限 ${LIMIT === Infinity ? '全部' : LIMIT}，並行 ${CONCURRENCY}`);
if (DRY) {
  for (const t of targets.slice(0, 15))
    console.log(`  imp ${String(t.imp).padStart(4)}  ${t.slug}\n      ${t.queries.map((q) => `${q.q}(${q.imp})`).join('、')}`);
  process.exit(0);
}

/* ------------------------------- 改寫 ------------------------------- */

function buildPrompt(art, t) {
  return [
    '你在替一篇已發佈的繁體中文文章改寫標題與描述，目的是讓實際在搜尋的人願意點進來。',
    '',
    `目前標題：${art.title}`,
    `目前描述：${one(art.fm, 'description')}`,
    '',
    '這頁在 Google 實際被搜到的關鍵字（括號是曝光次數，全部都沒有人點）：',
    ...t.queries.map((q) => `  ${q.q}（${q.imp} 次，平均排名 ${q.pos.toFixed(1)}）`),
    '',
    '文章內容：',
    '"""',
    art.body.replace(/<[^>]+>/g, ' ').slice(0, 6000),
    '"""',
    '',
    '規則（違反任何一條都算失敗）：',
    '1. 🔴 **標題只能承諾文章真的有回答的事**。如果搜尋詞問的東西文章沒寫，就不要把它寫進標題。',
    '2. 把讀者實際在搜的字放進標題前段，用他們的講法，不要用內部術語。',
    '3. 標題全形字數 30 以內（英數字算半個）。描述 60 到 160 全形字，講清楚讀完能拿到什麼。',
    '4. 繁體中文、台灣用語。禁止中國用語。',
    '5. 禁止破折號與 AI 套語（不僅…更、值得注意的是、總而言之、全面解析、必看、終極）。',
    '6. 不要為了吸引點擊而誇大或恐嚇。',
    '',
    '輸出 JSON：{"title":"…","description":"…","evidence":"…"}',
    'evidence 必須是**逐字抄自上面文章內容的一句話**（15 字以上），用來證明新標題的承諾文章真的有寫。',
    '如果文章內容和這些搜尋詞其實對不上、改標題只會誤導讀者，輸出 {"skip":true}。',
  ].join('\n');
}

const norm = (s) => s.replace(/\s+/g, '').replace(/[「」『』（）()【】\[\]，,。.、；;：:！!？?]/g, '');

function reject(o, art) {
  if (!o?.title || !o?.description || !o?.evidence) return '缺欄位';
  const tw = width(o.title);
  if (tw > 30) return `標題 ${tw} 全形字`;
  if (tw < 10) return '標題過短';
  const dw = width(o.description);
  if (dw < 60 || dw > 160) return `描述 ${Math.round(dw)} 全形字`;
  for (const re of TELLS) if (re.test(o.title) || re.test(o.description)) return `禁用句型 ${re}`;
  if (CN.test(o.title) || CN.test(o.description)) return '中國用語';
  if (o.title.trim() === art.title.trim()) return '標題沒有變';
  if (/["\\]/.test(o.title) || /["\\]/.test(o.description)) return '含會破壞 YAML 的引號';
  // 空頭支票防呆：證據句必須逐字出現在內文
  if ([...o.evidence].length < 15) return '證據句過短';
  if (!norm(art.body).includes(norm(o.evidence))) return '證據句不在內文裡（標題可能開空頭支票）';
  return null;
}

const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const batch = targets.slice(0, LIMIT === Infinity ? targets.length : LIMIT);
let done = 0, skipped = 0, failed = 0, cursor = 0, aborted = false;

async function worker() {
  while (!aborted) {
    const i = cursor++;
    if (i >= batch.length) return;
    const t = batch[i];
    const art = bySlug.get(t.slug);
    let o;
    try {
      const out = await runClaudeOnce(buildPrompt(art, t), 'claude-sonnet-5', 180_000);
      const s = out.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
      o = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/用量上限|weekly limit|usage limit/i.test(msg)) { aborted = true; console.error('⛔ 用量上限，中止'); return; }
      failed++; console.log(`✖ ${t.slug} ${msg.slice(0, 60)}`); continue;
    }
    if (o?.skip) { skipped++; console.log(`－ ${t.slug} 模型判定搜尋詞與內容對不上`); continue; }
    const bad = reject(o, art);
    if (bad) { failed++; console.log(`✖ ${t.slug} ${bad}`); continue; }

    const p = path.join(ARTICLES, art.file);
    const raw = readFileSync(p, 'utf8');
    const m = fmOf(raw);
    if (!m) continue;
    let fm = m[1];
    fm = fm.replace(/^title:.*$/m, `title: "${o.title.trim()}"`);
    fm = /^description:/m.test(fm)
      ? fm.replace(/^description:.*$/m, `description: "${o.description.trim()}"`)
      : fm.replace(/^title:.*$/m, (l) => `${l}\ndescription: "${o.description.trim()}"`);
    fm = /^updatedDate:/m.test(fm)
      ? fm.replace(/^updatedDate:.*$/m, `updatedDate: ${today}`)
      : fm.replace(/^publishDate:.*$/m, (l) => `${l}\nupdatedDate: ${today}`);
    writeFileSync(p, `---\n${fm}\n---\n${m[2]}`);
    done++;
    if (done % 10 === 0 || done < 5) console.log(`✓ [${done}] ${t.slug}｜${o.title}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\n本批：改寫 ${done} 篇、判定不適合 ${skipped} 篇、失敗 ${failed} 篇`);
