// 純轉換：吃 GA4 runReport / GSC query 的原始回應，吐週報區塊資料。無 I/O、好測。
// 站內頁面分類（slug→category 映射）I/O 在 article-category-map.mjs，傳進來。

const AI_HOSTS = ['chatgpt.com', 'openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];

// src/config/categories.ts 的 8 個分類 slug（columns 另歸頁面類型「專欄」）。
const NEWS_CATEGORIES = ['focus', 'international', 'health', 'tech', 'finance', 'sports', 'lifestyle'];

export function pctChange(cur, prev) {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

/** 去 query/hash、補開頭斜線、收斂連續斜線。 */
function normPath(p) {
  const clean = String(p || '').split(/[?#]/)[0];
  return ('/' + clean.replace(/^\/+/, '')).replace(/\/{2,}/g, '/');
}

const firstSeg = (path) => normPath(path).split('/').filter(Boolean)[0];

/**
 * 頁面類型：首頁 / 文章內文 / 作者頁 / 分類索引 / 專欄 / 專題 / 標籤 / 其他靜態頁。
 * 文章內文一律走 /articles/<slug>/，不能用第一段當分類（那是舊 bug：全被丟進 other）。
 */
export function pageTypeOf(path) {
  const seg = firstSeg(path);
  if (!seg) return 'home';
  if (seg === 'articles') return 'article';
  if (seg === 'authors') return 'author';
  if (seg === 'columns') return 'column';
  if (seg === 'topics') return 'topic';
  if (seg === 'tags') return 'tag';
  if (NEWS_CATEGORIES.includes(seg)) return 'category';
  return 'page';
}

/** /articles/<slug>/ → slug；非文章內文回 null。 */
export function articleSlugOf(path) {
  const segs = normPath(path).split('/').filter(Boolean);
  return segs[0] === 'articles' ? segs[1] || null : null;
}

export function isAiReferral(source) {
  const s = (source || '').toLowerCase();
  return AI_HOSTS.some((h) => s === h || s.endsWith(`.${h}`));
}

const rows = (report) => report?.rows ?? [];
const dim = (r, i) => r.dimensionValues[i].value;
const met = (r, i) => Number(r.metricValues[i].value);

/** GA4 dimensions=[pagePath,pageTitle] metrics=[screenPageViews,userEngagementDuration] */
export function topArticles(report, n = 5) {
  return rows(report)
    .slice(0, n)
    .map((r) => {
      const views = met(r, 0);
      const eng = met(r, 1);
      return { path: dim(r, 0), title: dim(r, 1), views, avgEngagementSec: views ? Math.round(eng / views) : 0 };
    });
}

/** 通用：依 keyFn 把 cur/prev 兩份 pagePath 報告彙整成 [{key,views,wowPct}]，keyFn 回 null 的列略過。 */
function breakdown(curReport, prevReport, keyFn) {
  const sum = (report) => {
    const m = {};
    for (const r of rows(report)) {
      const k = keyFn(dim(r, 0));
      if (k == null) continue;
      m[k] = (m[k] || 0) + met(r, 0);
    }
    return m;
  };
  const cur = sum(curReport);
  const prev = sum(prevReport);
  return [...new Set([...Object.keys(cur), ...Object.keys(prev)])]
    .map((key) => ({ key, views: cur[key] || 0, wowPct: pctChange(cur[key] || 0, prev[key] || 0) }))
    .sort((a, b) => b.views - a.views);
}

/** 各頁面類型瀏覽 + 週對比（首頁/文章/作者/分類索引/專欄/專題/標籤/其他）。 */
export function pageTypeBreakdown(curReport, prevReport) {
  return breakdown(curReport, prevReport, pageTypeOf).map(({ key, views, wowPct }) => ({ type: key, views, wowPct }));
}

/**
 * 只算「文章內文」(/articles/<slug>/)、依文章真實分類彙整 + 週對比。
 * slugMap：{ slug: category }（來自 article-category-map.mjs）。映射不到的歸 'uncategorized'。
 */
export function articleCategoryBreakdown(curReport, prevReport, slugMap = {}) {
  const keyFn = (path) => {
    const slug = articleSlugOf(path);
    if (slug == null) return null; // 非文章內文不計入
    return slugMap[slug] || 'uncategorized';
  };
  return breakdown(curReport, prevReport, keyFn).map(({ key, views, wowPct }) => ({ category: key, views, wowPct }));
}

/** GA4 dimensions=[sessionSource] metrics=[totalUsers] → 主要來源 + AI 轉介 */
export function trafficSources(report) {
  const all = rows(report).map((r) => ({ source: dim(r, 0), users: met(r, 0) }));
  return { sources: all.slice(0, 6), aiReferrals: all.filter((s) => isAiReferral(s.source)) };
}

/** GSC dimensions=[query]，留排名 11-20、依曝光排序 */
export function searchOpportunities(resp, n = 5) {
  return (resp?.rows ?? [])
    .filter((r) => r.position >= 11 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, n)
    .map((r) => ({ query: r.keys[0], impressions: r.impressions, clicks: r.clicks, ctr: r.ctr, position: r.position }));
}

/**
 * SEO 啟動指標：GSC dimensions=[page] 的彙總。
 * pagesInSearch=本週曾出現在搜尋結果的頁數（索引/曝光代理指標）、總曝光/總點擊、曝光加權平均排名。
 */
export function seoHealth(pageResp) {
  const r = pageResp?.rows ?? [];
  let impressions = 0;
  let clicks = 0;
  let posWeighted = 0;
  for (const row of r) {
    impressions += row.impressions || 0;
    clicks += row.clicks || 0;
    posWeighted += (row.position || 0) * (row.impressions || 0);
  }
  return {
    pagesInSearch: r.length,
    totalImpressions: impressions,
    totalClicks: clicks,
    avgPosition: impressions ? Math.round((posWeighted / impressions) * 10) / 10 : null,
  };
}
