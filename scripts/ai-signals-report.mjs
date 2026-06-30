// 抓 GA4，輸出「來源訊號」報表：SEO / AI 轉介 / 其他 三桶的人數+停留，
// 加 AI 逐 host 拆解與「AI 把人帶到哪些頁」。獨立於週報主線，不污染 weekly-data。
// 用法：node scripts/ai-signals-report.mjs        （需 env GOOGLE_APPLICATION_CREDENTIALS）
//       node scripts/ai-signals-report.mjs --days 28
//
// 量測前提見 scripts/lib/ai-signals.mjs 檔頭：此處「AI」=真人從 AI 答案點進來的 referral，
// 非 AI 爬蟲抓取；GSC 的 Google AI Overview 曝光被 Google 併進搜尋數、無法單獨拆，故不在此報。
import { loadServiceAccount, getAccessToken, ga4RunReport } from './lib/google-data.mjs';
import { GA_SCOPE } from './lib/report-config.mjs';
import { AI_HOSTS } from './lib/weekly-metrics.mjs';
import { acquisitionSplit, aiHostBreakdown, aiLandingPages } from './lib/ai-signals.mjs';

const argDays = (() => {
  const i = process.argv.indexOf('--days');
  const n = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 28;
})();

const iso = (d) => d.toISOString().slice(0, 10);
/** 回「截至昨天往回 n 天」的本期，與緊鄰前一期（不重疊），供 WoW/MoM 對比。 */
function periods(today, n) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - 1); // 不含今天（資料未滿日）
  const curStart = new Date(end);
  curStart.setUTCDate(curStart.getUTCDate() - (n - 1));
  const prevEnd = new Date(curStart);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - (n - 1));
  return { cur: { start: iso(curStart), end: iso(end) }, prev: { start: iso(prevStart), end: iso(prevEnd) } };
}

const { cur, prev } = periods(new Date(), argDays);
const sa = loadServiceAccount();
const tok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const dr = (range) => [{ startDate: range.start, endDate: range.end }];

// 三桶分流的主查詢：source × medium，帶人數/工作階段/互動秒數。
const acqBody = (range) => ({
  dateRanges: dr(range),
  dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
  metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'userEngagementDuration' }],
  limit: 250,
});
// AI 著陸頁：以 sessionSource inList AI_HOSTS 過濾，看 AI 把人帶到哪些頁。
const aiLandingBody = (range) => ({
  dateRanges: dr(range),
  dimensions: [{ name: 'landingPagePlusQueryString' }],
  metrics: [{ name: 'totalUsers' }],
  dimensionFilter: { filter: { fieldName: 'sessionSource', inListFilter: { values: AI_HOSTS } } },
  orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
  limit: 20,
});

const [acqCur, acqPrev, aiLandCur] = await Promise.all([
  ga4RunReport({ token: tok, body: acqBody(cur) }),
  ga4RunReport({ token: tok, body: acqBody(prev) }),
  ga4RunReport({ token: tok, body: aiLandingBody(cur) }),
]);

const splitCur = acquisitionSplit(acqCur);
const splitPrev = acquisitionSplit(acqPrev);
const pct = (c, p) => (p ? Math.round(((c - p) / p) * 100) : null);
const withTrend = (key) => ({
  ...splitCur[key],
  usersWoWPct: pct(splitCur[key].users, splitPrev[key].users),
});

console.log(
  JSON.stringify(
    {
      windowDays: argDays,
      period: { ...cur, prev },
      acquisition: { seo: withTrend('seo'), ai: withTrend('ai'), other: withTrend('other') },
      aiByHost: aiHostBreakdown(acqCur),
      aiLandingPages: aiLandingPages(aiLandCur, 10),
      note: 'AI=真人從 AI 答案點進來的 referral（非爬蟲抓取；系統性低估）。GSC AI Overview 曝光無法單獨拆，不在此報。',
    },
    null,
    2,
  ),
);
