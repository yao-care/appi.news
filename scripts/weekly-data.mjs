// 抓 GA4 + GSC，輸出週報四區塊 JSON 到 stdout（不含 LLM）。供 /weekly-report 技能讀。
// 用法：node scripts/weekly-data.mjs   （需 env GOOGLE_APPLICATION_CREDENTIALS）
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadServiceAccount, getAccessToken, ga4RunReport, gscQuery } from './lib/google-data.mjs';
import { GA_SCOPE, GSC_SCOPE, GSC_SA_KEY_PATH, weekRanges } from './lib/report-config.mjs';
import {
  topArticles,
  pageTypeBreakdown,
  articleCategoryBreakdown,
  trafficSources,
  searchOpportunities,
  seoHealth,
  pctChange,
  siteTraffic,
  articleTrafficShape,
  sprintStatus,
  seasonalTopicClicks,
} from './lib/weekly-metrics.mjs';
import { loadArticleCategoryMap } from './lib/article-category-map.mjs';
import { warnIfStaleCheckout } from './lib/checkout-freshness.mjs';

warnIfStaleCheckout();
import { parseArticle, parseTopic, membersOf, aggregate } from './lib/topic-tracker.mjs';

const SPRINT_TOPIC_IDS = ['qixi-2026', 'zhongyuan-2026', 'back-to-school-2026'];
const ARTICLES_DIR = 'src/content/articles';
const TOPICS_DIR = 'src/content/topics';

const { cur, prev } = weekRanges(new Date());
const sa = loadServiceAccount();
const catMap = loadArticleCategoryMap();

const gaTok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
// GSC 用專屬金鑰（見 report-config.mjs GSC_SA_KEY_PATH）；GA4 仍用 sa，兩者不是同一把。
const gscSa = loadServiceAccount(GSC_SA_KEY_PATH);
const gscTok = await getAccessToken({ clientEmail: gscSa.clientEmail, privateKey: gscSa.privateKey, scopes: [GSC_SCOPE] });

const dr = (range) => [{ startDate: range.start, endDate: range.end }];

const [topRep, catCur, catPrev, srcRep, usersCur, usersPrev, siteCur, sitePrev, seasonalClickRep] = await Promise.all([
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 5 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 1000 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 1000 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'totalUsers' }], orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }], limit: 50 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), metrics: [{ name: 'totalUsers' }] } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), metrics: [{ name: 'totalUsers' }] } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }] } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }] } }),
  ga4RunReport({
    token: gaTok,
    body: {
      dateRanges: dr(cur),
      dimensions: [{ name: 'contentGroup' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: 'seasonal_topic_click' },
        },
      },
      limit: 10,
    },
  }),
]);

const [gscOpp, gscPages] = await Promise.all([
  gscQuery({ token: gscTok, body: { startDate: cur.start, endDate: cur.end, dimensions: ['query'], rowLimit: 200 } }),
  gscQuery({ token: gscTok, body: { startDate: cur.start, endDate: cur.end, dimensions: ['page'], rowLimit: 1000 } }),
]);

const usersOf = (rep) => Number(rep?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
const { sources, aiReferrals } = trafficSources(srcRep);
const currentTraffic = siteTraffic(siteCur);
const previousTraffic = siteTraffic(sitePrev);
const trafficShape = articleTrafficShape(catCur, currentTraffic.pageViews);

/** 三個 8 月時效叢集的文章成員加總；每日重跑即可取得同一口徑的 PV/GSC 變化。 */
function sprintTopicPerformance() {
  const articles = readdirSync(ARTICLES_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => parseArticle(readFileSync(join(ARTICLES_DIR, file), 'utf8'), file.replace(/\.mdx?$/, '')));
  const byPath = {};
  for (const row of catCur?.rows ?? []) {
    const path = row.dimensionValues?.[0]?.value;
    if (!path) continue;
    byPath[path] = { ...(byPath[path] || {}), views: Number(row.metricValues?.[0]?.value ?? 0) };
  }
  for (const row of gscPages?.rows ?? []) {
    let path = row.keys?.[0] ?? '';
    try { path = new URL(path).pathname; } catch { /* 已是 path */ }
    byPath[path] = {
      ...(byPath[path] || {}),
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      position: row.position || 0,
    };
  }
  return SPRINT_TOPIC_IDS.map((id) => {
    const topic = parseTopic(readFileSync(join(TOPICS_DIR, `${id}.md`), 'utf8'), id);
    const members = membersOf(topic, articles);
    const metrics = aggregate(members, byPath);
    return {
      id,
      title: topic.title,
      members: members.length,
      views: metrics.views,
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      position: metrics.position == null ? null : Math.round(metrics.position * 10) / 10,
    };
  });
}

console.log(
  JSON.stringify(
    {
      period: { ...cur, prev },
      sprint: {
        ...sprintStatus({
          endDate: cur.end,
          pageViews: currentTraffic.pageViews,
          sessions: currentTraffic.sessions,
          topArticleSharePct: trafficShape.topArticleSharePct,
        }),
        pageViewsWoWPct: pctChange(currentTraffic.pageViews, previousTraffic.pageViews),
        sessionsWoWPct: pctChange(currentTraffic.sessions, previousTraffic.sessions),
        middleTrafficPages: {
          atLeast10Pv: trafficShape.pagesAtLeast10Pv,
          atLeast20Pv: trafficShape.pagesAtLeast20Pv,
        },
        seasonalTopicClicks: seasonalTopicClicks(seasonalClickRep),
        topics: sprintTopicPerformance(),
      },
      articlePerf: {
        topArticles: topArticles(topRep, 5),
        byPageType: pageTypeBreakdown(catCur, catPrev),
        byArticleCategory: articleCategoryBreakdown(catCur, catPrev, catMap),
      },
      seoHealth: seoHealth(gscPages),
      searchOpportunities: searchOpportunities(gscOpp, 5),
      trafficHealth: {
        ...currentTraffic,
        pageViewsWoWPct: pctChange(currentTraffic.pageViews, previousTraffic.pageViews),
        sessionsWoWPct: pctChange(currentTraffic.sessions, previousTraffic.sessions),
        users: usersOf(usersCur),
        usersWoWPct: pctChange(usersOf(usersCur), usersOf(usersPrev)),
        sources,
        aiReferrals,
      },
    },
    null,
    2,
  ),
);
