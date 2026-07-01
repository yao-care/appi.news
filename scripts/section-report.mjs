// 分區塊人流報表:8 區塊(7 新聞 + 專欄 + 作者群)各自 views + 停留(+ 埋點後準確人數)。
// 用法:
//   node scripts/section-report.mjs [--days 28]              # 離線模式(pagePath,即時、跑歷史)
//   node scripts/section-report.mjs --source contentgroup    # 埋點後準確人數(GA 原生按區塊)
// 需 env GOOGLE_APPLICATION_CREDENTIALS。
import { loadServiceAccount, getAccessToken, ga4RunReport } from './lib/google-data.mjs';
import { GA_SCOPE } from './lib/report-config.mjs';
import { sectionBreakdown, sectionByContentGroup } from './lib/section-metrics.mjs';
import { loadArticleCategoryMap } from './lib/article-category-map.mjs';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const days = (() => {
  const n = Number(arg('--days'));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 28;
})();
const useContentGroup = arg('--source') === 'contentgroup';

const iso = (d) => d.toISOString().slice(0, 10);
function periods(today, n) {
  const end = new Date(today); end.setUTCDate(end.getUTCDate() - 1);
  const curStart = new Date(end); curStart.setUTCDate(curStart.getUTCDate() - (n - 1));
  const prevEnd = new Date(curStart); prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd); prevStart.setUTCDate(prevStart.getUTCDate() - (n - 1));
  return { cur: { start: iso(curStart), end: iso(end) }, prev: { start: iso(prevStart), end: iso(prevEnd) } };
}

const { cur, prev } = periods(new Date(), days);
const sa = loadServiceAccount();
const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const dr = (range) => [{ startDate: range.start, endDate: range.end }];

let sections;
if (useContentGroup) {
  const rep = await ga4RunReport({ token, body: {
    dateRanges: dr(cur),
    dimensions: [{ name: 'contentGroup' }],
    metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'userEngagementDuration' }],
    limit: 50,
  } });
  sections = sectionByContentGroup(rep);
} else {
  const body = (range) => ({ dateRanges: dr(range), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }], limit: 2000 });
  const [curRep, prevRep] = await Promise.all([
    ga4RunReport({ token, body: body(cur) }),
    ga4RunReport({ token, body: body(prev) }),
  ]);
  sections = sectionBreakdown(curRep, prevRep, loadArticleCategoryMap());
}

console.log(JSON.stringify({
  windowDays: days,
  source: useContentGroup ? 'contentGroup(準確人數)' : 'pagePath(離線;人數不可加總,看 views+停留)',
  period: { ...cur, prev },
  sections,
  note: useContentGroup
    ? 'contentGroup 模式需先部署埋點、資料往後累積。'
    : '離線模式:views/停留可加總;準確人數請埋 content_group 後用 --source contentgroup。',
}, null, 2));
