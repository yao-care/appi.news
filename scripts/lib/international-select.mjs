// 國際編譯台「選題引擎」純邏輯（可單元測試、無 I/O）。
// 輸入：GDELT Events（export）檔解析出的事件列；輸出：每區「相對熱門」的代表題。
// I/O（下載 24h Events 檔）在 scripts/international-select.mjs。
//
// 機制（全部用真實 GDELT 欄位，非推測）：
//   - 每個 GDELT event 自帶 NumArticles / NumSources＝「被幾篇/幾家報導」＝天然熱度。
//   - 同一事件會跨多個 15 分檔出現（NumArticles 累積）→ 依 eventId 取最大值去重。
//   - 同一篇文章會因提到多個地點產生多個 event 列 → 依 sourceUrl 去重，歸到其最熱的那區。
//   - 「熱門」用該區當天分布相對判定（中位數的倍數），非固定門檻；該區沒突出者就略過。

// GDELT Events v2 欄位索引（0-based）。已用真實檔驗證：
export const COL = {
  eventId: 0,
  numMentions: 31,
  numSources: 32,
  numArticles: 33,
  actionGeoFullName: 52, // "City, ADM1, Country"
  actionGeoCountry: 53, // FIPS 國碼
  sourceUrl: 60, // 末欄
};

// 國家（英文名，取 ActionGeo_FullName 最後一段）→ 八大分區。涵蓋主要新聞國，未列者歸 null（略過）。
// 之後要加國家直接補這張表。
const REGION_BY_COUNTRY = {};
const add = (region, names) => names.forEach((n) => (REGION_BY_COUNTRY[n.toLowerCase()] = region));
add('東亞', ['Japan', 'South Korea', 'North Korea', 'China', 'Taiwan', 'Hong Kong', 'Macau', 'Mongolia']);
add('東南亞與南亞', ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Afghanistan', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Malaysia', 'Singapore', 'Myanmar', 'Burma', 'Cambodia', 'Laos', 'Brunei', 'Timor-Leste']);
add('中東', ['Israel', 'Palestine', 'Iran', 'Iraq', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen', 'Syria', 'Lebanon', 'Jordan', 'Turkey']);
add('非洲', ['Egypt', 'Nigeria', 'South Africa', 'Kenya', 'Ethiopia', 'Ghana', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'South Sudan', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', "Cote d'Ivoire", 'Cameroon', 'Zimbabwe', 'Zambia', 'Mozambique', 'Angola', 'Somalia', 'Mali', 'Democratic Republic of the Congo', 'Congo']);
add('歐洲', ['United Kingdom', 'Ireland', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Poland', 'Ukraine', 'Russia', 'Greece', 'Czechia', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Slovakia', 'Slovenia', 'Lithuania', 'Latvia', 'Estonia', 'Luxembourg', 'Cyprus', 'Malta']);
add('北美', ['United States', 'Canada']);
add('拉美', ['Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'Cuba', 'Dominican Republic', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Haiti']);
add('大洋洲', ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea']);

export const REGIONS = ['東亞', '東南亞與南亞', '中東', '非洲', '歐洲', '北美', '拉美', '大洋洲'];

/** ActionGeo_FullName → 分區（取最後一段國名比對）。未知回 null。 */
export function regionForFullName(fullName) {
  if (!fullName) return null;
  const country = String(fullName).split(',').pop().trim().toLowerCase();
  return REGION_BY_COUNTRY[country] || null;
}

/** 解析一列 Events（已用 \t split 成陣列）→ 標準化事件物件；不合格回 null。 */
export function parseEventRow(cols) {
  if (!Array.isArray(cols) || cols.length < 61) return null;
  const numArticles = Number(cols[COL.numArticles]) || 0;
  const sourceUrl = (cols[COL.sourceUrl] || '').trim();
  const fullName = (cols[COL.actionGeoFullName] || '').trim();
  if (!/^https?:\/\//.test(sourceUrl)) return null;
  const region = regionForFullName(fullName);
  if (!region) return null;
  return {
    eventId: cols[COL.eventId],
    numArticles,
    numSources: Number(cols[COL.numSources]) || 0,
    fullName,
    region,
    sourceUrl,
  };
}

/**
 * 聚合 24h 事件：依 eventId 取 NumArticles 最大、再依 sourceUrl 去重（同篇取最熱），歸其最熱分區。
 * 回傳 { [region]: Story[] }，Story = {sourceUrl, numArticles, numSources, fullName, region}。
 */
// 熱度比較：以「來源家數（NumSources）＝被幾家不同媒體報導」為主，文章數為輔（破同分）。
// 因為文章數會被單一農場/論壇/促銷狂發灌高；來源家數才是真「多家報導」。
function hotter(a, b) {
  return a.numSources !== b.numSources ? a.numSources - b.numSources : a.numArticles - b.numArticles;
}

export function aggregateStories(events) {
  // 1) 依 eventId 取最高熱度（同事件跨檔累積）
  const byEvent = new Map();
  for (const e of events) {
    if (!e) continue;
    const prev = byEvent.get(e.eventId);
    if (!prev || hotter(e, prev) > 0) byEvent.set(e.eventId, e);
  }
  // 2) 依 sourceUrl 去重（同篇文章可能跨多地點），保留最熱那筆
  const byUrl = new Map();
  for (const e of byEvent.values()) {
    const prev = byUrl.get(e.sourceUrl);
    if (!prev || hotter(e, prev) > 0) byUrl.set(e.sourceUrl, e);
  }
  // 3) 分區歸戶（依熱度排序）
  const out = {};
  for (const r of REGIONS) out[r] = [];
  for (const s of byUrl.values()) out[s.region].push(s);
  for (const r of REGIONS) out[r].sort((a, b) => hotter(b, a));
  return out;
}

/**
 * 該區「相對熱門」挑選：用該區自己當天「來源家數」分布的統計判定突出者，非固定門檻。
 * 熱度指標＝NumSources（被幾家不同媒體報導），文章數只破同分。
 * 規則：門檻 = 來源家數平均 + 1 個標準差；「嚴格大於」門檻才算突出（沒人突出 → 略過該區）。
 *   - 分布平坦（標準差 0）→ 回空（呼應「沒夠熱就跳過」）。
 *   - 長尾（多數 1–2 家、少數多家）→ 只挑多家報的那幾則，砍掉 1–2 家的假熱門。
 *   - 取最多 maxPer 則（依熱度排序）。
 */
export function relativeHotPicks(stories, maxPer = 3) {
  if (!Array.isArray(stories) || stories.length === 0) return [];
  const counts = stories.map((s) => s.numSources);
  const n = counts.length;
  const mean = counts.reduce((a, b) => a + b, 0) / n;
  const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const stdev = Math.sqrt(variance);
  if (stdev === 0) return []; // 完全平坦 → 無突出
  const threshold = mean + stdev;
  const hot = stories.filter((s) => s.numSources > threshold);
  return hot.sort((a, b) => hotter(b, a)).slice(0, maxPer);
}

/** 一次跑完：events → 每區挑出的熱題清單。 */
export function selectHotByRegion(events, maxPer = 3) {
  const agg = aggregateStories(events);
  const out = {};
  for (const r of REGIONS) out[r] = relativeHotPicks(agg[r], maxPer);
  return out;
}
