// GSC 驅動的 SEO 機會工具：純 Search Console，輸出三區塊 JSON 到 stdout（不含 LLM）。
// 供 daily-tech-radar（選題接搜尋需求）與 weekly-report（第 2 頁衝刺／改標題）讀。
//
// 用法：
//   export GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json
//   node scripts/seo-opportunities.mjs
//
// 區間：近 28 天（GSC 資料較完整且去抖；end = 今天前 2 天，避免最新兩天資料未滿）。
//
// 輸出三區塊：
//   pageOpportunities  ── S2 第 2 頁衝刺：position 10.5~20.5 且 impressions>=門檻 的頁面（補內鏈/補深度就能進第一頁）
//   titleCtrCandidates ── S3 改標題搶點擊：impressions 高但 ctr 低的 query→page 配對（排名還行、標題沒吸引點擊）
//   searchDemandTopics ── S1 選題接需求：讀者在搜、本站還沒吃到點擊的高曝光 query（去站名/品牌字），供雷達優先補題

import { loadServiceAccount, getAccessToken, gscQuery } from './lib/google-data.mjs';
import { GSC_SCOPE } from './lib/report-config.mjs';
import { articleSlugOf } from './lib/weekly-metrics.mjs';
import { loadArticleCategoryMap } from './lib/article-category-map.mjs';

// ───────────────────────── 門檻（可用 env 覆寫，測試/調參用）─────────────────────────
const PAGE_OPP_MIN_IMPRESSIONS = Number(process.env.SEO_PAGE_OPP_MIN_IMPR || 5);
const PAGE_OPP_POS_MIN = 10.5; // 第 2 頁起點（第 1 頁 = 1~10）
const PAGE_OPP_POS_MAX = 20.5; // 第 2 頁終點
const TITLE_MIN_IMPRESSIONS = Number(process.env.SEO_TITLE_MIN_IMPR || 10);
const TITLE_MAX_CTR = Number(process.env.SEO_TITLE_MAX_CTR || 0.02); // 2%
const DEMAND_MIN_IMPRESSIONS = Number(process.env.SEO_DEMAND_MIN_IMPR || 10);
const DEMAND_MAX_CLICKS = Number(process.env.SEO_DEMAND_MAX_CLICKS || 1); // 「還沒吃到點擊」：點擊 <= 此值
const LOOKBACK_DAYS = Number(process.env.SEO_LOOKBACK_DAYS || 28);
const TOP_N = Number(process.env.SEO_TOP_N || 25); // 各區塊輸出上限

// 站名/品牌字（去掉這類 query，只留真正的內容需求題）。
const BRAND_TERMS = ['appi', 'appinews', 'appi news', 'appi.news'];

const iso = (d) => d.toISOString().slice(0, 10);

/** 近 LOOKBACK_DAYS 天區間：end = today - 2（避最新兩天未滿），start = end - (N-1)。 */
function lookbackRange(today = new Date(), days = LOOKBACK_DAYS) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - 2);
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
    .filter((r) => (r.impressions || 0) >= TITLE_MIN_IMPRESSIONS && (r.ctr || 0) < TITLE_MAX_CTR && !isBrandQuery(r.keys[0]))
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
    .filter((r) => (r.impressions || 0) >= DEMAND_MIN_IMPRESSIONS && (r.clicks || 0) <= DEMAND_MAX_CLICKS && !isBrandQuery(r.keys[0]))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, n)
    .map((r) => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      bestPosition: round(r.position, 1),
    }));
}

// ───────────────────────── 主流程（被直接執行時）─────────────────────────

export async function run() {
  const range = lookbackRange();
  const sa = loadServiceAccount();
  const catMap = loadArticleCategoryMap();
  const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });

  const [pageResp, qpResp, queryResp] = await Promise.all([
    gscQuery({ token, body: { startDate: range.start, endDate: range.end, dimensions: ['page'], rowLimit: 1000 } }),
    gscQuery({ token, body: { startDate: range.start, endDate: range.end, dimensions: ['query', 'page'], rowLimit: 2000 } }),
    gscQuery({ token, body: { startDate: range.start, endDate: range.end, dimensions: ['query'], rowLimit: 1000 } }),
  ]);

  return {
    period: { ...range, lookbackDays: LOOKBACK_DAYS },
    thresholds: {
      pageOpp: { posMin: PAGE_OPP_POS_MIN, posMax: PAGE_OPP_POS_MAX, minImpressions: PAGE_OPP_MIN_IMPRESSIONS },
      titleCtr: { minImpressions: TITLE_MIN_IMPRESSIONS, maxCtr: TITLE_MAX_CTR },
      searchDemand: { minImpressions: DEMAND_MIN_IMPRESSIONS, maxClicks: DEMAND_MAX_CLICKS },
    },
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
