// 純轉換:受眾媒體包用的 GA4 拆解(裝置 / 台灣縣市 / 新舊訪客 / 總量)。皆純 GA4、免埋點。
const rows = (report) => report?.rows ?? [];
const dim = (r, i) => r.dimensionValues[i].value;
const met = (r, i) => Number(r.metricValues[i].value);
const round = (n) => Math.round(n);

/** metrics=[totalUsers, sessions, screenPageViews, userEngagementDuration](無維度)→ 總量。 */
export function totals(report) {
  const r = rows(report)[0];
  if (!r) return { users: 0, sessions: 0, views: 0, avgEngagedSecPerUser: 0 };
  const users = met(r, 0);
  const eng = met(r, 3);
  return { users, sessions: met(r, 1), views: met(r, 2), avgEngagedSecPerUser: users ? round(eng / users) : 0 };
}

/** dims=[deviceCategory]、metrics=[totalUsers, sessions, userEngagementDuration]。 */
export function deviceBreakdown(report) {
  const total = rows(report).reduce((s, r) => s + met(r, 0), 0) || 1;
  return rows(report)
    .map((r) => {
      const users = met(r, 0);
      const eng = met(r, 2);
      return { device: dim(r, 0), users, sessions: met(r, 1), sharePct: round((users / total) * 100), avgEngagedSecPerUser: users ? round(eng / users) : 0 };
    })
    .sort((a, b) => b.users - a.users);
}

/** dims=[region](已用 country=Taiwan 過濾)、metrics=[totalUsers]→ 縣市前 n。 */
export function geoBreakdown(report, n = 12) {
  const total = rows(report).reduce((s, r) => s + met(r, 0), 0) || 1;
  return rows(report)
    .map((r) => ({ region: dim(r, 0) || '(未知)', users: met(r, 0), sharePct: round((met(r, 0) / total) * 100) }))
    .sort((a, b) => b.users - a.users)
    .slice(0, n);
}

/** dims=[newVsReturning]、metrics=[totalUsers, userEngagementDuration]→ 新/舊 + 回訪率。 */
export function returningSplit(report) {
  let neu = 0;
  let ret = 0;
  for (const r of rows(report)) {
    const v = (dim(r, 0) || '').toLowerCase();
    const users = met(r, 0);
    if (v.startsWith('return')) ret += users;
    else if (v.startsWith('new')) neu += users;
  }
  const tot = neu + ret;
  return { new: neu, returning: ret, returningRate: tot ? Math.round((ret / tot) * 100) / 100 : null };
}
