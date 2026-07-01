// 受眾媒體包報表(對外談權威/賣服務用):總量、裝置、台灣縣市、新舊訪客、分區塊占比。
// 純 GA4、免埋點。用法:node scripts/audience-report.mjs [--days 28]  (需 GOOGLE_APPLICATION_CREDENTIALS)
import { loadServiceAccount, getAccessToken, ga4RunReport } from './lib/google-data.mjs';
import { GA_SCOPE } from './lib/report-config.mjs';
import { totals, deviceBreakdown, geoBreakdown, returningSplit } from './lib/audience-metrics.mjs';
import { sectionBreakdown } from './lib/section-metrics.mjs';
import { loadArticleCategoryMap } from './lib/article-category-map.mjs';

const i = process.argv.indexOf('--days');
const days = (() => { const n = i >= 0 ? Number(process.argv[i + 1]) : NaN; return Number.isFinite(n) && n > 0 ? Math.floor(n) : 28; })();

const iso = (d) => d.toISOString().slice(0, 10);
const end = new Date(); end.setUTCDate(end.getUTCDate() - 1);
const start = new Date(end); start.setUTCDate(start.getUTCDate() - (days - 1));
const range = [{ startDate: iso(start), endDate: iso(end) }];

const sa = loadServiceAccount();
const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const q = (body) => ga4RunReport({ token, body: { dateRanges: range, ...body } });

const [totRep, devRep, geoRep, retRep, pageRep] = await Promise.all([
  q({ metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'userEngagementDuration' }] }),
  q({ dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'userEngagementDuration' }], limit: 10 }),
  q({ dimensions: [{ name: 'region' }], metrics: [{ name: 'totalUsers' }], dimensionFilter: { filter: { fieldName: 'country', stringFilter: { value: 'Taiwan' } } }, orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }], limit: 30 }),
  q({ dimensions: [{ name: 'newVsReturning' }], metrics: [{ name: 'totalUsers' }, { name: 'userEngagementDuration' }] }),
  q({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }], limit: 2000 }),
]);

const sectionMix = sectionBreakdown(pageRep, { rows: [] }, loadArticleCategoryMap()).map(({ section, views }) => ({ section, views }));

const report = {
  windowDays: days,
  period: { start: iso(start), end: iso(end) },
  totals: totals(totRep),
  device: deviceBreakdown(devRep),
  taiwanRegions: geoBreakdown(geoRep, 12),
  returning: returningSplit(retRep),
  sectionMix,
  note: '純 GA4 受眾指標,免埋點;供對外媒體包/賣服務。台灣縣市已以 country=Taiwan 過濾。',
};

// --format md:一頁式受眾媒體包(給人看/發 Slack;GA 介面不會幫你排這個)。
if ((process.argv[process.argv.indexOf('--format') + 1]) === 'md') {
  const t = report.totals;
  const dev = report.device.map((d) => `${d.device} ${d.sharePct}%`).join('、');
  const geo = report.taiwanRegions.slice(0, 5).map((g) => `${g.region} ${g.sharePct}%`).join('、');
  const sec = report.sectionMix.filter((s) => !['home', 'other'].includes(s.section)).slice(0, 5).map((s) => `${s.section} ${s.views}`).join('、');
  const ret = report.returning.returningRate != null ? `${Math.round(report.returning.returningRate * 100)}%` : 'n/a';
  console.log([
    `📊 *APPI News 受眾媒體包*（近 ${days} 天 ${report.period.start}~${report.period.end}）`,
    `• 使用者 ${t.users}、工作階段 ${t.sessions}、瀏覽 ${t.views}、每人平均停留 ${t.avgEngagedSecPerUser}s`,
    `• 裝置：${dev}`,
    `• 台灣縣市 Top5：${geo}`,
    `• 回訪率：${ret}`,
    `• 分區塊瀏覽 Top5：${sec}`,
  ].join('\n'));
} else {
  console.log(JSON.stringify(report, null, 2));
}
