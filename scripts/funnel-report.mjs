// 服務/顧問轉換漏斗報表:內容 → /pricing、/services → /submit → generate_lead。
// generate_lead 需 WS1 埋點部署後才有;未部署前 leads=0、page 步驟仍可看。
// 用法:node scripts/funnel-report.mjs [--days 28]  (需 GOOGLE_APPLICATION_CREDENTIALS)
import { loadServiceAccount, getAccessToken, ga4RunReport } from './lib/google-data.mjs';
import { GA_SCOPE } from './lib/report-config.mjs';
import { funnel } from './lib/funnel-metrics.mjs';

const i = process.argv.indexOf('--days');
const days = (() => { const n = i >= 0 ? Number(process.argv[i + 1]) : NaN; return Number.isFinite(n) && n > 0 ? Math.floor(n) : 28; })();
const iso = (d) => d.toISOString().slice(0, 10);
const end = new Date(); end.setUTCDate(end.getUTCDate() - 1);
const start = new Date(end); start.setUTCDate(start.getUTCDate() - (days - 1));
const range = [{ startDate: iso(start), endDate: iso(end) }];

const sa = loadServiceAccount();
const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const q = (body) => ga4RunReport({ token, body: { dateRanges: range, ...body } });

const [pageRep, evRep] = await Promise.all([
  q({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }], limit: 2000 }),
  q({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], limit: 200 }),
]);

console.log(JSON.stringify({
  windowDays: days,
  period: { start: iso(start), end: iso(end) },
  funnel: funnel(pageRep, evRep),
  note: 'generate_lead 需 content_group/lead 埋點部署後累積;未部署前 leads=0 屬正常。',
}, null, 2));
