// 「被引用內容」拆解的純邏輯:把每個被 AI 引用的頁(由 skill 用 WebFetch 側寫成 profile)
// 聚合出「被引用頁一致具備、我方缺」的 GEO 寫作檢查表與逐頁差距。無 I/O,好測。
//
// profile 由 cited-teardown skill 填(WebFetch 後結構化),欄位:
//   { url, answerUpfront(bool), headingStructure(bool), primarySourceCount(int),
//     hasData(bool), authorByline(bool), dateVisible(bool), wordCount(int) }
// 這裡只做門檻化 + 聚合 + 差距,不碰網路。

export const PRIMARY_SOURCE_MIN = 1; // 至少 1 條一手來源才算「有」
export const DEPTH_MIN_WORDS = 800; // 深度門檻

// GEO 訊號(順序即報表呈現序)。key 對應 profile 欄位的判定。
export const SIGNALS = [
  { key: 'answerUpfront', label: '結論/答案前置(開頭就給)' },
  { key: 'headingStructure', label: 'H2/H3 小標分層' },
  { key: 'primarySources', label: '一手來源(gov/edu/期刊)' },
  { key: 'hasData', label: '數據或表格' },
  { key: 'authorByline', label: '作者/專家掛名' },
  { key: 'dateVisible', label: '發布/更新日期可見' },
  { key: 'depth', label: '足夠深度' },
];

/** 一手來源網域判定(gov/edu/學術期刊)。host 可含 www.。 */
export function isPrimarySourceHost(host) {
  const h = String(host || '').toLowerCase().replace(/^www\./, '');
  if (!h) return false;
  const suffixes = ['.gov', '.gov.tw', '.edu', '.edu.tw', '.edu.hk', '.ac.uk'];
  const exact = [
    'who.int', 'ncbi.nlm.nih.gov', 'pubmed.ncbi.nlm.nih.gov', 'nature.com',
    'thelancet.com', 'nejm.org', 'bmj.com', 'sciencedirect.com', 'cochrane.org',
  ];
  if (exact.some((d) => h === d || h.endsWith('.' + d))) return true;
  return suffixes.some((s) => h.endsWith(s));
}

/** 把一個 profile 門檻化成各訊號的 has(bool) map。 */
export function signalPresence(profile = {}) {
  return {
    answerUpfront: !!profile.answerUpfront,
    headingStructure: !!profile.headingStructure,
    primarySources: (Number(profile.primarySourceCount) || 0) >= PRIMARY_SOURCE_MIN,
    hasData: !!profile.hasData,
    authorByline: !!profile.authorByline,
    dateVisible: !!profile.dateVisible,
    depth: (Number(profile.wordCount) || 0) >= DEPTH_MIN_WORDS,
  };
}

/** 聚合一組被引用頁 → 每訊號「具備比例」,依比例由高到低。 */
export function aggregateProfiles(profiles = []) {
  const n = profiles.length;
  const pres = profiles.map(signalPresence);
  return SIGNALS.map(({ key, label }) => {
    const count = pres.filter((p) => p[key]).length;
    return { key, label, count, total: n, presentRate: n ? Math.round((count / n) * 100) / 100 : 0 };
  }).sort((a, b) => b.presentRate - a.presentRate);
}

/** 被引用頁「一致具備」(比例 ≥ threshold)的訊號 = GEO 寫作檢查表。 */
export function checklist(profiles = [], threshold = 0.6) {
  return aggregateProfiles(profiles).filter((s) => s.presentRate >= threshold);
}

/** 被引用頁一致具備、但我方頁缺的訊號 = 升級待辦。ourProfile 為 null 時全列(我方無此文)。 */
export function gapVsOurs(citedProfiles = [], ourProfile = null, threshold = 0.6) {
  const ourPres = ourProfile ? signalPresence(ourProfile) : null;
  return checklist(citedProfiles, threshold)
    .filter((s) => !ourPres || !ourPres[s.key])
    .map((s) => ({ key: s.key, label: s.label, citedRate: s.presentRate, ourHas: ourPres ? ourPres[s.key] : null }));
}
