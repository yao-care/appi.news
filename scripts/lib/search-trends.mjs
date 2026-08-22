// 外部搜尋趨勢雷達的純資料層。
//
// 這裡只做四件事：解析 Google Trends RSS、計算可重現的熱度/時效/適配度、
// 標記風險與既有文章撞題。抓到熱搜不等於可以直接寫稿，寫作與查證仍走既有
// newsroom / growth gate。純函式集中在這裡，讓 dry-run、cron 與測試共用同一套判準。

import { decodeEntities, parsePubDate, stripTags } from './civic-rss.mjs';

export const GOOGLE_TRENDS_TW_RSS = 'https://trends.google.com/trending/rss?geo=TW';
export const DEFAULT_MAX_AGE_HOURS = 48;

const CATEGORY_RULES = [
  { category: 'health', keywords: ['感冒', '流感', '病毒', '症狀', '過敏', '睡眠', '疫苗', '醫療', '醫院', '藥', '血糖', '健身', '癌'] },
  { category: 'lifestyle', keywords: ['開學', '學校', '小朋友', '兒童', '育兒', '旅遊', '天氣', '食譜', '食物', '消費', '購物', '交通', '租屋'] },
  { category: 'tech', keywords: ['AI', '人工智慧', 'Gemini', 'ChatGPT', 'iPhone', 'Android', '手機', 'Google', 'Apple', '科技', '演算法', '機器人'] },
  { category: 'focus', keywords: ['政策', '法規', '政府', '台灣', '地震', '颱風', '災害', '安全', '改革'] },
  { category: 'finance', keywords: ['股票', '股價', 'ETF', '央行', '利率', '匯率', '投資', '金融', '房貸'] },
  { category: 'sports', keywords: ['球', '賽', '冠軍', '球員', '奧運', '網球', '高爾夫', '棒球', '籃球', '足球'] },
  { category: 'international', keywords: ['美國', '日本', '中國', '韓國', '歐洲', '英國', '德國', '印度', '俄羅斯', '以色列'] },
];

const INTENT_TERMS = ['怎麼', '如何', '為何', '是什麼', '意思', '原因', '攻略', '懶人包', '症狀', '可以嗎', '值得', '價格', '時間', '規則', '辦法', '申請', '影響', '注意'];
const GOSSIP_TERMS = ['老公', '老婆', '出軌', '婚姻', '戀情', '分手', '私生活', '身材', '整形'];

function tagValue(block, name) {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i');
  const match = String(block).match(re);
  return match ? decodeEntities(match[1]).trim() : '';
}

function tagBlocks(block, name) {
  const out = [];
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'gi');
  let match;
  while ((match = re.exec(String(block)))) out.push(match[1]);
  return out;
}

/** 把 Google Trends 的 100+ / 1K+ / 1.2M+ 轉成可排序的估計值。 */
export function parseApproxTraffic(raw = '') {
  const text = String(raw).replace(/,/g, '').trim();
  const match = text.match(/([\d.]+)\s*([KMB])?/i);
  if (!match) return 0;
  const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[String(match[2] || '').toUpperCase()] || 1;
  return Math.round(Number(match[1]) * multiplier);
}

/** 穩定的比對鍵：保留中日韓文字與英數，移除空白和標點。 */
export function normalizeTrendText(value = '') {
  return String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

function parseNewsItems(block) {
  return tagBlocks(block, 'ht:news_item').map((item) => ({
    title: tagValue(item, 'ht:news_item_title'),
    snippet: stripTags(tagValue(item, 'ht:news_item_snippet'), 280),
    url: tagValue(item, 'ht:news_item_url'),
    source: tagValue(item, 'ht:news_item_source'),
  })).filter((item) => item.title || item.url);
}

/**
 * 解析 Google Trends TW RSS。
 * @returns {Array<{title:string,approxTraffic:number,approxTrafficRaw:string,pubDate:string|null,newsItems:Array}>}
 */
export function parseGoogleTrendsRss(xml = '') {
  const items = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = re.exec(String(xml)))) {
    const block = match[1];
    const title = tagValue(block, 'title');
    if (!title) continue;
    items.push({
      title,
      approxTrafficRaw: tagValue(block, 'ht:approx_traffic'),
      approxTraffic: parseApproxTraffic(tagValue(block, 'ht:approx_traffic')),
      pubDate: parsePubDate(tagValue(block, 'pubDate')),
      pictureSource: tagValue(block, 'ht:picture_source'),
      newsItems: parseNewsItems(block),
    });
  }
  return items;
}

/** 以固定詞表產生可追蹤的站台分類訊號；沒有命中不代表不能寫，只代表要人工判斷。 */
export function classifyTrend(title = '') {
  const normalized = normalizeTrendText(title);
  const categories = CATEGORY_RULES.filter((rule) => rule.keywords.some((keyword) => normalized.includes(normalizeTrendText(keyword)))).map((rule) => rule.category);
  return { categories, fitScore: categories.length ? Math.min(3, categories.length) : 0 };
}

function riskFlags(title = '') {
  const normalized = normalizeTrendText(title);
  const flags = [];
  if (/^\d{3,6}$/.test(normalized)) flags.push('numeric-only');
  if (normalized.length <= 2 && !INTENT_TERMS.some((term) => normalized.includes(normalizeTrendText(term)))) flags.push('too-broad');
  if (GOSSIP_TERMS.some((term) => normalized.includes(normalizeTrendText(term)))) flags.push('celebrity-or-private-life');
  return flags;
}

function freshnessScore(pubDate, now) {
  if (!pubDate) return { hoursAgo: null, score: 0 };
  const hoursAgo = (new Date(now).getTime() - new Date(pubDate).getTime()) / 3_600_000;
  if (!Number.isFinite(hoursAgo) || hoursAgo < -2) return { hoursAgo: 0, score: 0 };
  if (hoursAgo <= 6) return { hoursAgo, score: 3 };
  if (hoursAgo <= 24) return { hoursAgo, score: 2 };
  if (hoursAgo <= DEFAULT_MAX_AGE_HOURS) return { hoursAgo, score: 1 };
  return { hoursAgo, score: 0 };
}

function heatScore(traffic) {
  if (traffic >= 500) return 3;
  if (traffic >= 200) return 2;
  if (traffic >= 100) return 1;
  return 0;
}

function intentScore(title) {
  const normalized = normalizeTrendText(title);
  return INTENT_TERMS.some((term) => normalized.includes(normalizeTrendText(term))) ? 2 : 0;
}

function evidenceScore(newsItems = []) {
  if (newsItems.length >= 2) return 2;
  if (newsItems.length === 1) return 1;
  return 0;
}

function ngrams(text, size = 2) {
  if (text.length < size) return text ? [text] : [];
  return Array.from({ length: text.length - size + 1 }, (_, i) => text.slice(i, i + size));
}

/** 找到標題完全相同、包含關係或高度重疊的既有文章，避免把熱搜誤當新需求。 */
export function findArticleOverlap(title, articles = []) {
  const needle = normalizeTrendText(title);
  if (!needle) return null;
  const needleGrams = new Set(ngrams(needle));
  let best = null;
  for (const article of articles) {
    const articleTitle = String(article.title || '');
    const haystack = normalizeTrendText(articleTitle);
    if (!haystack) continue;
    const exact = needle === haystack;
    const contains = needle.length >= 4 && (haystack.includes(needle) || needle.includes(haystack));
    const grams = ngrams(haystack);
    const overlap = grams.length ? grams.filter((gram) => needleGrams.has(gram)).length / grams.length : 0;
    if (!exact && !contains && overlap < 0.45) continue;
    const strength = exact ? 3 : contains ? 2 : 1;
    if (!best || strength > best.strength || (strength === best.strength && overlap > best.overlap)) {
      best = { slug: article.slug, title: articleTitle, strength, overlap };
    }
  }
  return best;
}

function decisionFor({ score, categories, risks, overlap }) {
  if (risks.includes('numeric-only')) return 'DROP';
  if (score >= 8 && categories.length > 0 && risks.length === 0 && !overlap) return 'GO';
  if (score >= 5) return 'REVIEW';
  return 'WATCH';
}

function angleFor(categories, title) {
  const lead = categories[0] || 'focus';
  const templates = {
    health: `先查官方與醫療來源，回答「${title}」的原因、影響、警訊與可採取做法`,
    lifestyle: `先查官方規則或可信資料，回答「${title}」對台灣讀者的實際影響與做法`,
    tech: `先查產品／官方文件，回答「${title}」的原理、限制、價格或隱私風險`,
    focus: `先查第一手公告與多家報導，整理「${title}」的背景、影響與後續變化`,
    finance: `先查主管機關與市場資料，說明「${title}」的定義、影響與風險，不做投資保證`,
    sports: `先查賽事或官方紀錄，整理「${title}」的結果、背景與讀者需要知道的規則`,
    international: `先查當事國官方與至少兩個獨立來源，整理「${title}」的背景、影響與時間線`,
  };
  return templates[lead] || `先查第一手來源，再把「${title}」改寫成可回答讀者問題的解釋型文章`;
}

/** 對單一熱搜產生可審核的分數與決策，不呼叫模型、不寫檔。 */
export function scoreTrend(item, { now = new Date(), articles = [] } = {}) {
  const { categories, fitScore } = classifyTrend(item.title);
  const risks = riskFlags(item.title);
  const freshness = freshnessScore(item.pubDate, now);
  const overlap = findArticleOverlap(item.title, articles);
  const heat = heatScore(item.approxTraffic);
  const intent = intentScore(item.title);
  const evidence = evidenceScore(item.newsItems);
  const duplicatePenalty = overlap ? (overlap.strength === 3 ? 3 : 2) : 0;
  const riskPenalty = risks.includes('celebrity-or-private-life') ? 2 : risks.includes('too-broad') ? 1 : 0;
  const score = heat + freshness.score + fitScore + intent + evidence - duplicatePenalty - riskPenalty;
  const decision = decisionFor({ score, categories, risks, overlap });
  return {
    ...item,
    categories,
    fitScore,
    risks,
    overlap,
    score,
    decision,
    hoursAgo: freshness.hoursAgo,
    signals: { heat, freshness: freshness.score, intent, evidence, duplicatePenalty, riskPenalty },
    angle: angleFor(categories, item.title),
  };
}

/** 依決策、分數、熱度、時效排序；DROP 只留在 dropped 供稽核，不進候選清單。 */
export function rankTrendCandidates(items, options = {}) {
  const now = options.now || new Date();
  const maxAgeHours = options.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;
  const scored = items.map((item) => scoreTrend(item, { ...options, now }));
  const active = scored.filter((item) => item.decision !== 'DROP' && (item.hoursAgo === null || item.hoursAgo <= maxAgeHours));
  active.sort((a, b) => b.score - a.score || b.approxTraffic - a.approxTraffic || (a.hoursAgo ?? 999) - (b.hoursAgo ?? 999) || a.title.localeCompare(b.title, 'zh-Hant'));
  return {
    candidates: active.slice(0, options.limit ?? 20),
    dropped: scored.filter((item) => item.decision === 'DROP' || (item.hoursAgo !== null && item.hoursAgo > maxAgeHours)),
  };
}

/** 網路層可注入 fetch，測試不必連外。 */
export async function fetchTrendFeed(url = GOOGLE_TRENDS_TW_RSS, { fetchImpl = globalThis.fetch, timeoutMs = 15_000 } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('環境沒有 fetch，無法讀取搜尋趨勢來源');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: { 'user-agent': 'appi.news-search-trend-radar/1.0 (+https://appi.news/)' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`搜尋趨勢來源回應 ${response.status}`);
    const xml = await response.text();
    if (!/<item\b/i.test(xml)) throw new Error('搜尋趨勢來源不是可解析的 RSS');
    return xml;
  } finally {
    clearTimeout(timer);
  }
}

export const SEARCH_TREND_CATEGORY_RULES = CATEGORY_RULES;
