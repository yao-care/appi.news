// 純轉換:把 GA pagePath 報告歸戶成「8 區塊 + home/other」的人流(views + 停留)。
// 8 區塊 = 7 新聞分類 + 專欄(columns) + 作者群(authors)。文章內文靠 slug→category 離線映射,
// 分類索引/作者頁靠路徑首段。reuse weekly-metrics 的 articleSlugOf(單一事實來源)。
//
// 兩種資料源:
//   - 離線(pagePath):即時、跑歷史,但「人數」不可由 per-page 加總(用 views+停留)。
//   - contentGroup(埋點後):GA 原生按區塊彙整,才有準確人數(見 section-report.mjs)。
import { articleSlugOf } from './weekly-metrics.mjs';

const NEWS_CATEGORIES = ['focus', 'international', 'health', 'tech', 'finance', 'sports', 'lifestyle'];
const SECTION_SEGS = new Set([...NEWS_CATEGORIES, 'columns']); // 分類索引首段
const rows = (report) => report?.rows ?? [];
const dim = (r, i) => r.dimensionValues[i].value;
const met = (r, i) => Number(r.metricValues[i].value);

function firstSeg(path) {
  return String(path || '').split(/[?#]/)[0].replace(/^\/+/, '').split('/')[0];
}

/** 把一個 pagePath 歸到區塊。文章→其分類;分類索引/作者頁→區塊;首頁→home;其餘→other。 */
export function sectionOf(path, slugMap = {}) {
  const slug = articleSlugOf(path);
  if (slug) return slugMap[slug] || 'uncategorized';
  const seg = firstSeg(path);
  if (!seg) return 'home';
  if (SECTION_SEGS.has(seg)) return seg; // /tech/、/columns/ 等分類索引
  if (seg === 'authors') return 'authors'; // 作者群
  return 'other';
}

export function pctChange(cur, prev) {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

/**
 * GA dimensions=[pagePath]、metrics=[screenPageViews, userEngagementDuration]。
 * 回每區塊 { section, views, engagedSec, avgEngagedSecPerView, viewsWoWPct },依 views 由大到小。
 * slugMap 來自 article-category-map.mjs。
 */
export function sectionBreakdown(curReport, prevReport, slugMap = {}) {
  const sum = (report) => {
    const m = {};
    for (const r of rows(report)) {
      const k = sectionOf(dim(r, 0), slugMap);
      const e = (m[k] ||= { views: 0, engagedSec: 0 });
      e.views += met(r, 0);
      e.engagedSec += met(r, 1);
    }
    return m;
  };
  const cur = sum(curReport);
  const prev = sum(prevReport);
  return [...new Set([...Object.keys(cur), ...Object.keys(prev)])]
    .map((section) => {
      const c = cur[section] || { views: 0, engagedSec: 0 };
      return {
        section,
        views: c.views,
        engagedSec: Math.round(c.engagedSec),
        avgEngagedSecPerView: c.views ? Math.round(c.engagedSec / c.views) : 0,
        viewsWoWPct: pctChange(c.views, (prev[section] || {}).views || 0),
      };
    })
    .sort((a, b) => b.views - a.views);
}

/**
 * GA dimensions=[contentGroup]、metrics=[totalUsers, sessions, userEngagementDuration]。
 * 埋點後的準確版:回每區塊 { section, users, sessions, engagedSec, avgEngagedSecPerUser }。
 */
export function sectionByContentGroup(report) {
  return rows(report)
    .map((r) => {
      const users = met(r, 0);
      const engagedSec = Math.round(met(r, 2));
      return {
        section: dim(r, 0) || 'other',
        users,
        sessions: met(r, 1),
        engagedSec,
        avgEngagedSecPerUser: users ? Math.round(engagedSec / users) : 0,
      };
    })
    .sort((a, b) => b.users - a.users);
}
