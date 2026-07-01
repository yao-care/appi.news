// AEO/GEO 能見度探針的「量表」單一事實來源：非品牌、貼守備範圍的固定題庫 + 競品觀察清單。
// 純資料 + 純比對，無 I/O，好測。給 aeo-radar skill 與 geo-citation-audit 共用。
//
// 為什麼固定題庫（而非每次從 GSC 動態產）：對外談權威要「可比較的份額趨勢」，題目一變趨勢就斷。
// 這份是穩定骨幹；GSC 動態需求題由 geo-citation-audit 的 dynamic 模式另供，兩者不混。
//
// 競品比對用「最長網域後綴」判定：health.businessweekly.com.tw（良醫）與 businessweekly.com.tw（商周）
// 巢狀時，取最specific那個，避免一條 URL 被算到兩家。

/** 7 分類固定題庫（非品牌、解釋型優先，AI 答案較會附來源）。專欄不列（觀點體裁少被引用）。 */
export const QUESTION_SET = [
  { category: 'focus', questions: [
    '台灣淨零轉型目前進度到哪、卡在哪些環節？',
    '台灣電網的韌性問題是什麼？近年做了哪些強化？',
    '少子化對台灣未來十年最大的衝擊是什麼？',
  ] },
  { category: 'international', questions: [
    '美中科技戰對台灣供應鏈的影響是什麼？',
    '歐盟碳邊境機制（CBAM）對台灣出口商有什麼衝擊？',
    '地緣政治風險如何影響台灣的能源與糧食安全？',
  ] },
  { category: 'health', questions: [
    '中醫結合 AI 診斷可信嗎？要注意什麼？',
    '保健食品的健康聲稱在台灣是怎麼規範的？',
    '高齡者預防肌少症有哪些實證方法？',
  ] },
  { category: 'tech', questions: [
    '生成式 AI 導入企業最常見的資安風險有哪些？',
    '台灣半導體在先進封裝的競爭優勢是什麼？',
    '中小企業要怎麼評估要不要導入 AI 工具？',
  ] },
  { category: 'finance', questions: [
    '什麼是轉型金融？跟綠色金融差在哪？',
    '2026 台灣房市的觀察重點有哪些？',
    '一般人要怎麼建立基本的資產配置觀念？',
  ] },
  { category: 'sports', questions: [
    '台灣棒球在 WBC 之後的發展與挑戰？',
    '運動科學如何幫助業餘跑者避免受傷？',
    '台灣運動產業有哪些新的商業模式？',
  ] },
  { category: 'lifestyle', questions: [
    '台灣連假出遊有哪些省錢的交通／住宿優惠管道？',
    '熟齡族群退休後的生活要怎麼規劃？',
    '遠距與混合辦公對職場文化的長期影響？',
  ] },
];

/** 本站網域（判「被引用」）。 */
export const OWN_DOMAIN = 'appi.news';

// 跨分類共通競品（任何題出現都算數）：綜合日報 + 綜合商業/權威媒體。
// 商業/權威媒體（商周、哈佛商業評論、今周刊、天下、遠見）跨 beat 到處被引用，
// 且是站長點名要對標的權威指標，故列共通、不綁單一分類（實跑 baseline 發現漏算而升級）。
const SHARED_COMPETITORS = [
  { name: '中央社', domain: 'cna.com.tw' },
  { name: '聯合新聞網', domain: 'udn.com' },
  { name: '自由時報', domain: 'ltn.com.tw' },
  { name: '商業周刊', domain: 'businessweekly.com.tw' },
  { name: '哈佛商業評論', domain: 'hbrtaiwan.com' },
  { name: '今周刊', domain: 'businesstoday.com.tw' },
  { name: '天下', domain: 'cw.com.tw' },
  { name: '遠見', domain: 'gvm.com.tw' },
];

// 分類專屬競品（含站長點名要贏的商周、哈佛商業評論）。domain 用最specific可辨識網域。
const CATEGORY_COMPETITORS = {
  focus: [
    { name: '天下', domain: 'cw.com.tw' },
    { name: '報導者', domain: 'twreporter.org' },
    { name: '關鍵評論網', domain: 'thenewslens.com' },
    { name: '商業周刊', domain: 'businessweekly.com.tw' },
    { name: '哈佛商業評論', domain: 'hbrtaiwan.com' },
  ],
  international: [
    { name: '轉角國際', domain: 'global.udn.com' },
    { name: 'BBC中文', domain: 'bbc.com' },
    { name: 'DW中文', domain: 'dw.com' },
    { name: '關鍵評論網', domain: 'thenewslens.com' },
  ],
  health: [
    { name: '康健', domain: 'commonhealth.com.tw' },
    { name: '早安健康', domain: 'everydayhealth.com.tw' },
    { name: 'Heho健康', domain: 'heho.com.tw' },
    { name: '元氣網', domain: 'health.udn.com' },
    { name: '良醫健康網', domain: 'health.businessweekly.com.tw' },
  ],
  tech: [
    { name: 'iThome', domain: 'ithome.com.tw' },
    { name: '科技新報', domain: 'technews.tw' },
    { name: 'INSIDE', domain: 'inside.com.tw' },
    { name: '數位時代', domain: 'bnext.com.tw' },
    { name: '哈佛商業評論', domain: 'hbrtaiwan.com' },
  ],
  finance: [
    { name: '經濟日報', domain: 'money.udn.com' },
    { name: '工商時報', domain: 'ctee.com.tw' },
    { name: '鉅亨網', domain: 'cnyes.com' },
    { name: '商業周刊', domain: 'businessweekly.com.tw' },
    { name: '哈佛商業評論', domain: 'hbrtaiwan.com' },
    { name: '今周刊', domain: 'businesstoday.com.tw' },
    { name: '遠見', domain: 'gvm.com.tw' },
  ],
  sports: [
    { name: '運動視界', domain: 'sportsv.net' },
    { name: 'ETtoday運動雲', domain: 'sports.ettoday.net' },
    { name: '麗台運動報', domain: 'ltsports.com.tw' },
    { name: 'TSNA', domain: 'tsna.com.tw' },
  ],
  lifestyle: [
    { name: 'ETtoday', domain: 'ettoday.net' },
    { name: '食尚玩家', domain: 'supertaste.tvbs.com.tw' },
    { name: '康健', domain: 'commonhealth.com.tw' },
    { name: '欣傳媒', domain: 'xinmedia.com' },
  ],
};

/** 攤平題庫成 [{question, category}]。 */
export function flatQuestions() {
  return QUESTION_SET.flatMap((c) => c.questions.map((question) => ({ question, category: c.category })));
}

/** 某分類的競品清單（分類專屬 + 共通），domain 去重（先分類專屬）。 */
export function competitorsFor(category) {
  const list = [...(CATEGORY_COMPETITORS[category] || []), ...SHARED_COMPETITORS];
  const seen = new Set();
  return list.filter((c) => (seen.has(c.domain) ? false : (seen.add(c.domain), true)));
}

/** 取 URL 的 hostname（小寫、去 www.），失敗回 ''。 */
export function hostOf(url) {
  try {
    return new URL(String(url)).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** host 是否命中 domain（完全相等或為其子網域）。 */
export function hostMatches(host, domain) {
  return host === domain || host.endsWith('.' + domain);
}

/**
 * 判一批被引用 URL（依顯著度排序）對某分類的歸屬：
 *  - cited/rank/url：本站是否被引用、排第幾（1-based）、命中的連結。
 *  - competitors：命中的競品 domain 陣列（每條 URL 取最長後綴那家，避免重複計）。
 */
export function classifyCitedUrls(citedUrls = [], category) {
  const comps = competitorsFor(category);
  const hitDomains = new Set();
  let cited = false;
  let rank = null;
  let url = null;
  citedUrls.forEach((u, i) => {
    const host = hostOf(u);
    if (!host) return;
    if (!cited && hostMatches(host, OWN_DOMAIN)) {
      cited = true;
      rank = i + 1;
      url = String(u);
    }
    // 競品：取最長（最specific）命中網域，一條 URL 只算一家。
    let best = null;
    for (const c of comps) {
      if (hostMatches(host, c.domain) && (!best || c.domain.length > best.length)) best = c.domain;
    }
    if (best) hitDomains.add(best);
  });
  return { cited, rank, url, competitors: [...hitDomains] };
}

/** domain → 顯示名（跨全部清單查）。查不到回 domain 自己。 */
export function competitorName(domain) {
  for (const c of [...SHARED_COMPETITORS, ...Object.values(CATEGORY_COMPETITORS).flat()]) {
    if (c.domain === domain) return c.name;
  }
  return domain;
}
