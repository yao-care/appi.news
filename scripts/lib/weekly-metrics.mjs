// 純轉換：吃 GA4 runReport / GSC query 的原始回應，吐週報四區塊資料。無 I/O、好測。

const AI_HOSTS = ['chatgpt.com', 'openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];

export function pctChange(cur, prev) {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

export function categoryOf(path) {
  const KNOWN = ['focus', 'international', 'health', 'tech', 'finance', 'sports', 'lifestyle', 'columns'];
  const seg = (path || '').split('/').filter(Boolean)[0];
  return KNOWN.includes(seg) ? seg : 'other';
}

export function isAiReferral(source) {
  const s = (source || '').toLowerCase();
  return AI_HOSTS.some((h) => s === h || s.endsWith(`.${h}`) || s.includes(h));
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

/** GA4 dimensions=[pagePath] metrics=[screenPageViews]，cur/prev 兩份報告 → 分類彙整 + 週對比 */
export function categoryBreakdown(curReport, prevReport) {
  const sum = (report) => {
    const m = {};
    for (const r of rows(report)) m[categoryOf(dim(r, 0))] = (m[categoryOf(dim(r, 0))] || 0) + met(r, 0);
    return m;
  };
  const cur = sum(curReport);
  const prev = sum(prevReport);
  return Object.keys(cur)
    .map((category) => ({ category, views: cur[category], wowPct: pctChange(cur[category], prev[category] || 0) }))
    .sort((a, b) => b.views - a.views);
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
