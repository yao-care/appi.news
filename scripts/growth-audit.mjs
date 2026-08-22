// 三關體檢：站台從「Google 願意給流量」往下走，還卡在哪一關。
//
// 為什麼要有這支：這三個問題每次都要重新手刻 GA4／GSC 查詢，且答案是「會變的現況」，
// 依專案規則不可以寫進任何文件——所以做成指令，文件只寫「跑這個」。
// 三關的定義與對應工作項目＝docs/growth-playbook.md，為什麼＝docs/lessons/growth-three-gates.md。
//
// 用法：
//   node scripts/growth-audit.mjs            # 四段全跑
//   node scripts/growth-audit.mjs --gate1    # 只看「流量是否由大量頁面共同帶動」
//   node scripts/growth-audit.mjs --gate2    # 只看「回訪與品牌搜尋」
//   node scripts/growth-audit.mjs --gate3    # 只看「週線是否連續成長」
//   node scripts/growth-audit.mjs --cohort   # 只看「舊文世代自己有沒有在長」
//   node scripts/growth-audit.mjs --days 28  # 改比較窗（預設 28 天，對比前一個等長窗）
//   node scripts/growth-audit.mjs --gate1 --top 200  # 「有曝光但 0 點擊」印前 200 名（預設 10；排工作清單用）
//
// 需要 GA4／GSC 金鑰（同 weekly-data.mjs，見 scripts/lib/report-config.mjs 檔頭）。
// 禁杜撰數據：報現況一律以本指令實跑輸出為準。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadServiceAccount, getAccessToken, ga4RunReport, gscQuery } from './lib/google-data.mjs';
import { GA_SCOPE, GSC_SCOPE, GSC_SA_KEY_PATH } from './lib/report-config.mjs';
import { warnIfStaleCheckout } from './lib/checkout-freshness.mjs';

warnIfStaleCheckout();

const ARTICLES_DIR = 'src/content/articles';
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const DAYS = Number(argv[argv.indexOf('--days') + 1]) > 0 && argv.includes('--days') ? Number(argv[argv.indexOf('--days') + 1]) : 28;
const TOP = has('--top') && Number(argv[argv.indexOf('--top') + 1]) > 0 ? Number(argv[argv.indexOf('--top') + 1]) : 10;
const only = ['--gate1', '--gate2', '--gate3', '--cohort'].filter(has);
const want = (k) => only.length === 0 || has(k);

const iso = (d) => d.toISOString().slice(0, 10);
const shift = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return iso(d); };
// GA4 當日資料未定案、GSC 還有 2–3 天延遲：一律以「昨天」為窗尾，避免把不完整的日子當成下滑。
const cur = { startDate: shift(DAYS), endDate: shift(1) };
const prev = { startDate: shift(DAYS * 2), endDate: shift(DAYS + 1) };

const sa = loadServiceAccount();
const gaTok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const gscSa = loadServiceAccount(GSC_SA_KEY_PATH);
const gscTok = await getAccessToken({ clientEmail: gscSa.clientEmail, privateKey: gscSa.privateKey, scopes: [GSC_SCOPE] });

const gaRows = (rep) => (rep?.rows || []).map((r) => ({
  k: r.dimensionValues?.[0]?.value ?? '',
  v: Number(r.metricValues?.[0]?.value ?? 0),
  v2: Number(r.metricValues?.[1]?.value ?? 0),
}));
const pct = (a, b) => (b > 0 ? Math.round(((a - b) / b) * 100) : null);
const pctStr = (a, b) => { const p = pct(a, b); return p === null ? 'n/a' : `${p > 0 ? '+' : ''}${p}%`; };

console.log(`# 三關體檢｜近 ${DAYS} 天 ${cur.startDate}~${cur.endDate}（對比 ${prev.startDate}~${prev.endDate}）`);
console.log('# 窗尾固定取到昨天：GA4 當日未定案、GSC 延遲 2–3 天，含今天會看起來像下滑。\n');

/* ---------------- 關卡 1：流量是否由大量頁面共同帶動 ---------------- */
if (want('--gate1')) {
  const [p1, p0, gp] = await Promise.all([
    ga4RunReport({ token: gaTok, body: { dateRanges: [cur], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 5000 } }),
    ga4RunReport({ token: gaTok, body: { dateRanges: [prev], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 5000 } }),
    gscQuery({ token: gscTok, body: { startDate: cur.startDate, endDate: cur.endDate, dimensions: ['page'], rowLimit: 5000 } }),
  ]);
  const stat = (rep) => {
    const rs = gaRows(rep).filter((r) => r.k.startsWith('/articles/')).sort((a, b) => b.v - a.v);
    const total = rs.reduce((a, b) => a + b.v, 0);
    const share = (n) => (total ? Math.round((rs.slice(0, n).reduce((a, b) => a + b.v, 0) / total) * 100) : 0);
    return { total, pages: rs.length, top1: share(1), top10: share(10), top20: share(20), ge10: rs.filter((r) => r.v >= 10).length, ge20: rs.filter((r) => r.v >= 20).length };
  };
  const a = stat(p1), b = stat(p0);
  console.log('## 關卡 1：流量是否由大量頁面共同帶動');
  console.log(`文章頁 PV        ${a.total}（前窗 ${b.total}，${pctStr(a.total, b.total)}）`);
  console.log(`有流量的文章頁    ${a.pages}（前窗 ${b.pages}）`);
  console.log(`集中度 top1/10/20 ${a.top1}% / ${a.top10}% / ${a.top20}%（前窗 ${b.top1}% / ${b.top10}% / ${b.top20}%）← 量增而集中度降＝健康`);
  console.log(`腰部 ≥10PV/≥20PV  ${a.ge10} / ${a.ge20} 頁（前窗 ${b.ge10} / ${b.ge20}）`);
  const rows = (gp.rows || []).map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
  const withImp = rows.filter((r) => r.impressions >= 1);
  const withClick = rows.filter((r) => r.clicks >= 1);
  const dead = withImp.filter((r) => r.clicks === 0).sort((x, y) => y.impressions - x.impressions);
  console.log(`GSC 有曝光頁 ${withImp.length}｜有點擊頁 ${withClick.length}｜有曝光但 0 點擊 ${dead.length} 頁 ← 這批是關卡 A 的存量池`);
  console.log(`曝光最多卻 0 點擊的前 ${TOP} 頁（改標題／description 的優先名單；--top N 可看更多）：`);
  dead.slice(0, TOP).forEach((r) => console.log(`  imp ${String(r.impressions).padStart(5)}  pos ${r.position.toFixed(1).padStart(5)}  ${r.page}`));
  console.log();
}

/* ---------------- 關卡 2：回訪與品牌搜尋 ---------------- */
if (want('--gate2')) {
  const [n1, n0, q1, q0] = await Promise.all([
    ga4RunReport({ token: gaTok, body: { dateRanges: [cur], dimensions: [{ name: 'newVsReturning' }], metrics: [{ name: 'totalUsers' }, { name: 'sessions' }] } }),
    ga4RunReport({ token: gaTok, body: { dateRanges: [prev], dimensions: [{ name: 'newVsReturning' }], metrics: [{ name: 'totalUsers' }, { name: 'sessions' }] } }),
    gscQuery({ token: gscTok, body: { startDate: cur.startDate, endDate: cur.endDate, dimensions: ['query'], rowLimit: 5000 } }),
    gscQuery({ token: gscTok, body: { startDate: prev.startDate, endDate: prev.endDate, dimensions: ['query'], rowLimit: 5000 } }),
  ]);
  const ret = (rep) => {
    const rs = gaRows(rep);
    const tot = rs.reduce((a, b) => a + b.v, 0);
    const r = rs.find((x) => x.k === 'returning') || { v: 0, v2: 0 };
    return { tot, users: r.v, sessions: r.v2, share: tot ? Math.round((r.v / tot) * 100) : 0 };
  };
  const a = ret(n1), b = ret(n0);
  console.log('## 關卡 2：使用者是否開始回訪與搜尋品牌');
  console.log(`回訪 users ${a.users}／總 ${a.tot}＝${a.share}%（前窗 ${b.users}／${b.tot}＝${b.share}%）← 看的是「比例有沒有升」，不是人數`);
  console.log(`回訪者 sessions ${a.sessions}（人均 ${a.users ? (a.sessions / a.users).toFixed(1) : 0} 次）`);
  const brandRe = /appi|亞太專業觀點|appinews/i;
  const brand = (rep) => {
    const rs = (rep.rows || []).map((r) => ({ q: r.keys[0], clicks: r.clicks, impressions: r.impressions }));
    const b2 = rs.filter((r) => brandRe.test(r.q));
    return { n: b2.length, imp: b2.reduce((s, x) => s + x.impressions, 0), clk: b2.reduce((s, x) => s + x.clicks, 0), all: rs.length, list: b2 };
  };
  const bc = brand(q1), bp = brand(q0);
  console.log(`品牌 query ${bc.n} 個｜曝光 ${bc.imp}｜點擊 ${bc.clk}（前窗 ${bp.n} 個／${bp.imp}／${bp.clk}）`);
  bc.list.slice(0, 10).forEach((x) => console.log(`  - ${x.q}  imp ${x.impressions} clk ${x.clicks}`));
  console.log(`不重複 query 總數 ${bc.all}（前窗 ${bp.all}）← 廣度，跟品牌強度分開看\n`);
}

/* ---------------- 關卡 3：週線是否連續成長 ---------------- */
if (want('--gate3')) {
  const [d, gd] = await Promise.all([
    ga4RunReport({ token: gaTok, body: { dateRanges: [{ startDate: shift(98), endDate: shift(1) }], dimensions: [{ name: 'date' }], metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }], limit: 200 } }),
    gscQuery({ token: gscTok, body: { startDate: shift(98), endDate: shift(1), dimensions: ['date'], rowLimit: 200 } }),
  ]);
  const monday = (dt) => { const w = new Date(dt); w.setUTCDate(w.getUTCDate() - ((w.getUTCDay() + 6) % 7)); return iso(w); };
  const wk = new Map();
  for (const r of gaRows(d)) {
    const key = monday(new Date(`${r.k.slice(0, 4)}-${r.k.slice(4, 6)}-${r.k.slice(6, 8)}T00:00:00Z`));
    const c = wk.get(key) || { pv: 0, users: 0, clk: 0, imp: 0, days: 0 };
    c.pv += r.v; c.users += r.v2; c.days += 1; wk.set(key, c);
  }
  for (const r of (gd.rows || [])) {
    const key = monday(new Date(`${r.keys[0]}T00:00:00Z`));
    const c = wk.get(key) || { pv: 0, users: 0, clk: 0, imp: 0, days: 0 };
    c.clk += r.clicks; c.imp += r.impressions; wk.set(key, c);
  }
  console.log('## 關卡 3：週線是否連續成長（要連 3–6 個月才算過關，短期上升不算）');
  console.log('週一起算   PV   users   GSC點擊  GSC曝光   （天數<7＝未滿一週，不可拿來比）');
  for (const [k, v] of [...wk.entries()].sort()) {
    console.log(`  ${k}  ${String(v.pv).padStart(5)}  ${String(v.users).padStart(5)}  ${String(v.clk).padStart(6)}  ${String(v.imp).padStart(7)}   ${v.days < 7 ? `(${v.days}天)` : ''}`);
  }
  console.log();
}

/* ---------------- 世代分析：舊文自己有沒有在長 ---------------- */
if (want('--cohort')) {
  const [p1, p0] = await Promise.all([
    ga4RunReport({ token: gaTok, body: { dateRanges: [cur], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 5000 } }),
    ga4RunReport({ token: gaTok, body: { dateRanges: [prev], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 5000 } }),
  ]);
  // slug → publishDate（讀 frontmatter 前幾行，不解析全文）
  const pub = new Map();
  for (const f of readdirSync(ARTICLES_DIR).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(ARTICLES_DIR, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    const fm = m[1];
    const slug = fm.match(/^slug:\s*["']?([^"'\n]+)/m)?.[1]?.trim() || f.replace(/\.md$/, '');
    const pd = fm.match(/^publishDate:\s*["']?([^"'\n]+)/m)?.[1]?.trim();
    if (pd) pub.set(slug, new Date(pd));
  }
  // 世代切點：比較窗開始前 90 天就發佈的＝舊文（成長不能靠新頁上線撐）
  const cut = new Date(new Date(cur.startDate).getTime() - 90 * 864e5);
  const sum = (rep) => {
    let old = 0, fresh = 0, unknown = 0;
    for (const r of gaRows(rep)) {
      const m = r.k.match(/^\/articles\/([^/]+)\//);
      if (!m) continue;
      const pd = pub.get(decodeURIComponent(m[1]));
      if (!pd) unknown += r.v;
      else if (pd < cut) old += r.v;
      else fresh += r.v;
    }
    return { old, fresh, unknown };
  };
  const a = sum(p1), b = sum(p0);
  console.log('## 世代分析：舊文（比較窗起點前 90 天就發佈者）自己有沒有在長');
  console.log(`舊文 PV   ${a.old}（前窗 ${b.old}，${pctStr(a.old, b.old)}）  ← 這條在長＝真趨勢，停產也不會塌`);
  console.log(`新文 PV   ${a.fresh}（前窗 ${b.fresh}，${pctStr(a.fresh, b.fresh)}）  ← 只有這條在長＝成長靠一直發新文撐`);
  if (a.unknown || b.unknown) console.log(`對不到檔案的 PV ${a.unknown}（前窗 ${b.unknown}）← 已刪或改名的舊 slug`);
  console.log();
}
