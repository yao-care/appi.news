// 純轉換:服務/顧問轉換漏斗。內容 → /pricing、/services → /submit → generate_lead 事件。
// generate_lead 要埋點部署後才有(WS1);未部署前 leads=0、只顯示 page 步驟。
const rows = (report) => report?.rows ?? [];
const dim = (r, i) => r.dimensionValues[i].value;
const met = (r, i) => Number(r.metricValues[i].value);

/** 在 pagePath 報告裡加總「路徑以 prefix 開頭」的 views/users。 */
export function pageMetric(pageReport, prefix) {
  let views = 0;
  let users = 0;
  for (const r of rows(pageReport)) {
    const p = String(dim(r, 0) || '').split(/[?#]/)[0];
    if (p === prefix || p.startsWith(prefix)) { views += met(r, 0); users += met(r, 1); }
  }
  return { views, users };
}

/** eventName 報告裡取某事件的次數。 */
export function eventCount(eventReport, name) {
  for (const r of rows(eventReport)) if (dim(r, 0) === name) return met(r, 0);
  return 0;
}

const rate = (num, den) => (den ? Math.round((num / den) * 1000) / 10 : null); // 百分比一位小數

/**
 * pageReport: dims=[pagePath], metrics=[screenPageViews, totalUsers]
 * eventReport: dims=[eventName], metrics=[eventCount]
 * 回漏斗步驟 + lead 數 + 各段轉換率(%)。
 */
export function funnel(pageReport, eventReport) {
  const pricing = pageMetric(pageReport, '/pricing/');
  const services = pageMetric(pageReport, '/services/');
  const submit = pageMetric(pageReport, '/submit/');
  const intent = { views: pricing.views + services.views, users: pricing.users + services.users };
  const leads = eventCount(eventReport, 'generate_lead');
  return {
    steps: [
      { step: '方案/服務頁(/pricing + /services)', views: intent.views, users: intent.users },
      { step: '投稿頁(/submit)', views: submit.views, users: submit.users },
      { step: 'generate_lead(送出成功)', count: leads },
    ],
    breakdown: { pricing, services, submit },
    leads,
    intentToSubmitRate: rate(submit.users, intent.users),
    submitToLeadRate: rate(leads, submit.users),
  };
}
