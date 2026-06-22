// 抓 GA4 + GSC，輸出週報四區塊 JSON 到 stdout（不含 LLM）。供 /weekly-report 技能讀。
// 用法：node scripts/weekly-data.mjs   （需 env GOOGLE_APPLICATION_CREDENTIALS）
import { loadServiceAccount, getAccessToken, ga4RunReport, gscQuery } from './lib/google-data.mjs';
import { GA_SCOPE, GSC_SCOPE, weekRanges } from './lib/report-config.mjs';
import {
  topArticles,
  pageTypeBreakdown,
  articleCategoryBreakdown,
  trafficSources,
  searchOpportunities,
  seoHealth,
  pctChange,
} from './lib/weekly-metrics.mjs';
import { loadArticleCategoryMap } from './lib/article-category-map.mjs';

const { cur, prev } = weekRanges(new Date());
const sa = loadServiceAccount();
const catMap = loadArticleCategoryMap();

const gaTok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const gscTok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });

const dr = (range) => [{ startDate: range.start, endDate: range.end }];

const [topRep, catCur, catPrev, srcRep, usersCur, usersPrev] = await Promise.all([
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 5 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 1000 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 1000 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'totalUsers' }], orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }], limit: 50 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), metrics: [{ name: 'totalUsers' }] } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), metrics: [{ name: 'totalUsers' }] } }),
]);

const [gscOpp, gscPages] = await Promise.all([
  gscQuery({ token: gscTok, body: { startDate: cur.start, endDate: cur.end, dimensions: ['query'], rowLimit: 200 } }),
  gscQuery({ token: gscTok, body: { startDate: cur.start, endDate: cur.end, dimensions: ['page'], rowLimit: 1000 } }),
]);

const usersOf = (rep) => Number(rep?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
const { sources, aiReferrals } = trafficSources(srcRep);

console.log(
  JSON.stringify(
    {
      period: { ...cur, prev },
      articlePerf: {
        topArticles: topArticles(topRep, 5),
        byPageType: pageTypeBreakdown(catCur, catPrev),
        byArticleCategory: articleCategoryBreakdown(catCur, catPrev, catMap),
      },
      seoHealth: seoHealth(gscPages),
      searchOpportunities: searchOpportunities(gscOpp, 5),
      trafficHealth: { users: usersOf(usersCur), usersWoWPct: pctChange(usersOf(usersCur), usersOf(usersPrev)), sources, aiReferrals },
    },
    null,
    2,
  ),
);
