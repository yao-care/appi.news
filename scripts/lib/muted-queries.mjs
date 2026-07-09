// 靜音查詢清單（SEO 機會工具的「滅燈」機制）。
//
// 用途：有些 query 有高曝光零點擊，但已「查證」為結構性非人類流量——氣象 App／OS 通知的
// 模板化結構化查詢。這種曝光改 title / description / schema 永遠拿不到點擊（搜尋者不是人）。
// 列在此處後，seo-opportunities 的 titleCtrCandidates / searchDemandTopics 不再把它們當
// 「可行動機會」端出來，避免大腦層 / seo-ops 反思層每天重複判讀同一組死訊號。
//
// 為什麼會有非人類高曝光零點擊、怎麼查證、為何 mute 才是解：
//   docs/lessons/high-impression-zero-click-bot-queries.md
//
// 新增結案項：加一筆 { pattern, reason, closedOn, evidence }，pattern 要窄到不會誤殺真人查詢。

export const MUTED_QUERY_PATTERNS = [
  {
    pattern: /^(紅|橙|橘|黃|黄|藍|蓝|白)色警[報告报]/,
    reason: '氣象 App／OS 通知的「顏色警報 - 溫度形容詞」模板化查詢（非人類搜尋）',
    closedOn: '2026-07-09',
    evidence:
      'extreme-heat-warning-guide 群組：28 天 432 曝光／0 點擊；代表題「橘色警報 - 高溫」135/142 曝光全在 mobile；混入簡體「橙色警报 - 高温」；pos 2~8 好排名仍 0 CTR。GSC 裝置別驗證於 2026-07-09。',
  },
  {
    pattern: /(極端|极端|中度|中等|中級|中级|嚴重|严重|輕度|轻度|重度)(高溫|高温)(警報|警告|警示|警报|提醒|警戒)/,
    reason: '氣象 App／OS 通知的「嚴重程度＋高溫警報」模板化查詢（非人類搜尋）',
    closedOn: '2026-07-09',
    evidence: '同上群組；「嚴重高溫警告」pos 4.3／137 曝光／0 點擊，違反真人在第 4 名應有的 CTR。',
  },
];

/** query 是否命中靜音清單（結構性非人類流量，勿當 SEO 機會）。 */
export const isMutedQuery = (q) => {
  const s = String(q || '');
  return MUTED_QUERY_PATTERNS.some((m) => m.pattern.test(s));
};
