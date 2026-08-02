// GSC 驅動的 SEO 機會工具：純 Search Console，輸出四區塊 JSON 到 stdout（不含 LLM）。
// 供 tech-radar（選題接搜尋需求）與 weekly-report（第 2 頁衝刺／改標題）讀。
//
// 用法：
//   export GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json
//   node scripts/seo-opportunities.mjs
//
// 區間：近 28 天（GSC 資料較完整且去抖；end = 今天前 2 天，避免最新兩天資料未滿）。
//
// 輸出四區塊：
//   pageOpportunities  ── S2 第 2 頁衝刺：position 10.5~20.5 且 impressions>=門檻 的頁面（補內鏈/補深度就能進第一頁）
//   titleCtrCandidates ── S3 改標題搶點擊：impressions 高但 ctr 低的 query→page 配對（排名還行、標題沒吸引點擊）
//   searchDemandTopics ── S1 選題接需求：讀者在搜、本站還沒吃到點擊的高曝光 query（去站名/品牌字），供雷達優先補題
//   evergreenDemandTopics ─ S0 常青需求（選題最優先）：跨多個時間窗都複現的 query＝真實重複需求，非事件脈衝

import { loadServiceAccount, getAccessToken, gscQuery } from './lib/google-data.mjs';
import { GSC_SCOPE, GSC_SA_KEY_PATH } from './lib/report-config.mjs';
import { articleSlugOf } from './lib/weekly-metrics.mjs';
import { loadArticleCategoryMap } from './lib/article-category-map.mjs';
import { isMutedQuery } from './lib/muted-queries.mjs';

// ───────────────────────── 門檻（可用 env 覆寫，測試/調參用）─────────────────────────
const PAGE_OPP_MIN_IMPRESSIONS = Number(process.env.SEO_PAGE_OPP_MIN_IMPR || 5);
const PAGE_OPP_POS_MIN = 10.5; // 第 2 頁起點（第 1 頁 = 1~10）
const PAGE_OPP_POS_MAX = 20.5; // 第 2 頁終點
const TITLE_MIN_IMPRESSIONS = Number(process.env.SEO_TITLE_MIN_IMPR || 10);
const TITLE_MAX_CTR = Number(process.env.SEO_TITLE_MAX_CTR || 0.02); // 2%
const DEMAND_MIN_IMPRESSIONS = Number(process.env.SEO_DEMAND_MIN_IMPR || 10);
const DEMAND_MAX_CLICKS = Number(process.env.SEO_DEMAND_MAX_CLICKS || 1); // 「還沒吃到點擊」：點擊 <= 此值
const LOOKBACK_DAYS = Number(process.env.SEO_LOOKBACK_DAYS || 28);
// 常青訊號取幾個不重疊的回看窗（見 evergreenDemandTopics）。3 窗＝約 84 天。
const EVERGREEN_WINDOWS = Number(process.env.SEO_EVERGREEN_WINDOWS || 3);
const TOP_N = Number(process.env.SEO_TOP_N || 25); // 各區塊輸出上限

// 站名/品牌字（去掉這類 query，只留真正的內容需求題）。
const BRAND_TERMS = ['appi', 'appinews', 'appi news', 'appi.news'];

const iso = (d) => d.toISOString().slice(0, 10);

/**
 * 近 LOOKBACK_DAYS 天區間：end = today - 2（避最新兩天未滿），start = end - (N-1)。
 * `back` = 往前推幾個完整窗（0＝最近一窗、1＝再往前一窗…），供常青訊號取不重疊的多個窗。
 */
function lookbackRange(today = new Date(), days = LOOKBACK_DAYS, back = 0) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - 2 - back * days);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start: iso(start), end: iso(end) };
}

const isBrandQuery = (q) => {
  const s = String(q || '').toLowerCase();
  return BRAND_TERMS.some((t) => s.includes(t));
};

const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

/** /articles/<slug>/ → 分類；非文章內文或對不到 → 'uncategorized'。 */
function categoryOfPage(page, catMap) {
  let path = page;
  try {
    path = new URL(page).pathname;
  } catch {
    // 已是 path
  }
  const slug = articleSlugOf(path);
  if (slug == null) return 'uncategorized';
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // 壞編碼 → 用原字串查
  }
  return catMap[decoded] || catMap[slug] || 'uncategorized';
}

// ───────────────────────── 純轉換（吃 GSC 原始 rows，吐區塊）─────────────────────────

/** S2：第 2 頁衝刺。dimensions=['page']。 */
export function pageOpportunities(pageResp, catMap = {}, n = TOP_N) {
  return (pageResp?.rows ?? [])
    .filter((r) => r.position >= PAGE_OPP_POS_MIN && r.position <= PAGE_OPP_POS_MAX && (r.impressions || 0) >= PAGE_OPP_MIN_IMPRESSIONS)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, n)
    .map((r) => ({
      page: r.keys[0],
      category: categoryOfPage(r.keys[0], catMap),
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: round(r.ctr),
      position: round(r.position, 1),
    }));
}

/** S3：改標題搶點擊。dimensions=['query','page']。 */
export function titleCtrCandidates(qpResp, catMap = {}, n = TOP_N) {
  return (qpResp?.rows ?? [])
    .filter((r) => (r.impressions || 0) >= TITLE_MIN_IMPRESSIONS && (r.ctr || 0) < TITLE_MAX_CTR && !isBrandQuery(r.keys[0]) && !isMutedQuery(r.keys[0]))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, n)
    .map((r) => ({
      query: r.keys[0],
      page: r.keys[1],
      category: categoryOfPage(r.keys[1], catMap),
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: round(r.ctr),
      position: round(r.position, 1),
    }));
}

/**
 * S1：選題接需求。彙整高曝光、本站還沒吃到點擊的 query（去站名/品牌字）。
 * 同 query 可能跨多頁，取 impressions 加總、position 取最佳（最小）。
 */
export function searchDemandTopics(queryResp, n = TOP_N) {
  return (queryResp?.rows ?? [])
    .filter((r) => (r.impressions || 0) >= DEMAND_MIN_IMPRESSIONS && (r.clicks || 0) <= DEMAND_MAX_CLICKS && !isBrandQuery(r.keys[0]) && !isMutedQuery(r.keys[0]))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, n)
    .map((r) => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      bestPosition: round(r.position, 1),
    }));
}

/**
 * S0：常青需求（**選題最優先訊號**）。
 *
 * 為什麼需要它，而 `searchDemandTopics` 不夠：後者只按曝光排序，於是**事件題必然壓過常青題**
 * ——一家餐廳歇業的字可以在一週內拿到 157 曝光，把「美顏針」（77 曝光、第 71 名）擠出名單。
 * 但事件題寫完就死、不累積，常青題會年復一年地被搜。只看曝光等於系統性地獎勵錯的題目。
 *
 * 判準用**跨時間窗複現**，不用關鍵詞規則（「功效」「症狀」這類字表既漏又誤判）：
 * 把回看期切成數個不重疊的窗，同一個 query 在 >=2 個窗都出現＝真實重複需求；
 * 只在單一窗爆量的＝事件脈衝，不收。這是純資料判準，不必維護字表。
 *
 * 分數刻意偏好「有量 × 排名還很差」：排名差代表還沒吃到，升級空間最大；
 * 已在前段的字投報率反而低（見 lessons/query-targeting-event-vs-concept.md）。
 *
 * @param {Array<{rows?:Array}>} windowResps 各時間窗的 GSC query 回應（新→舊）
 */
export function evergreenDemandTopics(windowResps, n = TOP_N) {
  const maps = windowResps.map(
    (r) => new Map((r?.rows ?? []).filter((x) => !isMutedQuery(x.keys[0]) && !isBrandQuery(x.keys[0])).map((x) => [x.keys[0], x])),
  );
  const seen = new Set(maps.flatMap((m) => [...m.keys()]));
  const out = [];
  for (const q of seen) {
    const hits = maps.filter((m) => m.has(q));
    if (hits.length < 2) continue; // 只出現在一個窗＝事件脈衝，不是常青需求
    const impressions = hits.reduce((a, m) => a + (m.get(q).impressions || 0), 0);
    if (impressions < DEMAND_MIN_IMPRESSIONS) continue;
    const clicks = hits.reduce((a, m) => a + (m.get(q).clicks || 0), 0);
    const bestPosition = Math.min(...hits.map((m) => m.get(q).position));
    out.push({
      query: q,
      windows: hits.length, // 幾個時間窗都出現（越多越常青）
      impressions,
      clicks,
      bestPosition: round(bestPosition, 1),
      // 升級空間：排名越差、曝光越大 → 分數越高（已在前 10 名的字空間小）
      upsideScore: round(impressions * Math.min(bestPosition, 100) / 100, 1),
    });
  }
  return out.sort((a, b) => b.windows - a.windows || b.upsideScore - a.upsideScore).slice(0, n);
}

// ───────────────────────── 主流程（被直接執行時）─────────────────────────

export async function run() {
  const range = lookbackRange();
  const sa = loadServiceAccount(GSC_SA_KEY_PATH); // GSC 專屬金鑰，非 GA4 那把
  const catMap = loadArticleCategoryMap();
  const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });

  // 常青訊號要看更長的歷史：切成 EVERGREEN_WINDOWS 個不重疊的 LOOKBACK_DAYS 窗（新→舊）。
  const evergreenRanges = Array.from({ length: EVERGREEN_WINDOWS }, (_, k) => lookbackRange(new Date(), LOOKBACK_DAYS, k));

  const [pageResp, qpResp, queryResp, ...windowResps] = await Promise.all([
    gscQuery({ token, body: { startDate: range.start, endDate: range.end, dimensions: ['page'], rowLimit: 1000 } }),
    gscQuery({ token, body: { startDate: range.start, endDate: range.end, dimensions: ['query', 'page'], rowLimit: 2000 } }),
    gscQuery({ token, body: { startDate: range.start, endDate: range.end, dimensions: ['query'], rowLimit: 1000 } }),
    ...evergreenRanges.map((w) => gscQuery({ token, body: { startDate: w.start, endDate: w.end, dimensions: ['query'], rowLimit: 2000 } })),
  ]);

  return {
    period: { ...range, lookbackDays: LOOKBACK_DAYS },
    thresholds: {
      pageOpp: { posMin: PAGE_OPP_POS_MIN, posMax: PAGE_OPP_POS_MAX, minImpressions: PAGE_OPP_MIN_IMPRESSIONS },
      titleCtr: { minImpressions: TITLE_MIN_IMPRESSIONS, maxCtr: TITLE_MAX_CTR },
      searchDemand: { minImpressions: DEMAND_MIN_IMPRESSIONS, maxClicks: DEMAND_MAX_CLICKS },
      evergreen: { windows: EVERGREEN_WINDOWS, windowDays: LOOKBACK_DAYS, minWindowsHit: 2 },
    },
    evergreenDemandTopics: evergreenDemandTopics(windowResps),
    pageOpportunities: pageOpportunities(pageResp, catMap),
    titleCtrCandidates: titleCtrCandidates(qpResp, catMap),
    searchDemandTopics: searchDemandTopics(queryResp),
  };
}

import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
    .then((out) => console.log(JSON.stringify(out, null, 2)))
    .catch((e) => {
      console.error(`seo-opportunities 失敗：${e.message}`);
      process.exit(1);
    });
}
