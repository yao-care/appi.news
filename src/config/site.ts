/**
 * 全站品牌與設定常數。
 * 換網域時不需動這裡 —— site/base 由 astro.config.mjs 控制，
 * 絕對網址一律透過 Astro.site 取得，站內連結透過 url() helper 取得。
 */
export const SITE = {
  /** 中文主品牌 */
  name: 'APPI News',
  /** 中文定位 */
  tagline: '亞太專業觀點',
  /** 英文定位（輔助字樣） */
  taglineEn: 'Asia-Pacific Press & Insight',
  /** 完整品牌說法 */
  description:
    'APPI News｜亞太專業觀點，是一個聚集各領域專業作者的觀點媒體，透過新聞、評論、專欄、專題、專訪與深度分析，協助讀者理解健康、科技、財經、國際、運動、生活等重要議題。',
  /** Google Analytics 4 評估 ID（空字串則不輸出追蹤碼）。延遲載入見 components/seo/Analytics.astro */
  gaId: 'G-38R2SZ5FTQ',
  /** 預設語系 */
  lang: 'zh-Hant',
  locale: 'zh_TW',
  /** 社群 / 聯絡 */
  /** 對外聯絡信箱。**留空則全站不顯示 email、schema 亦不輸出 contactPoint**（條件式渲染）。
   * 2026-07-31 清空：原值是 evidencetoday.news 的信箱（2026-06-17 815c1b2 複製設定時誤帶），
   * 掛別站品牌的 Gmail 當本站編輯窗口，對讀者與 Google 都是實體矛盾。待專屬信箱開通後填回。 */
  email: 'appi.newsdesk@gmail.com',
  /** 預設社群分享圖（相對 BASE_URL） */
  defaultOgImage: 'og/default.png',
  /**
   * 內容授權（站長決策 2026-07-17，全開路線）：
   * 文字/編輯內容採 CC BY 4.0 —— 可自由轉載、改作、商用、供 AI 訓練，惟須標示作者、
   * 註明來源「APPI News」並連回原文。程式碼另採 MIT。
   * ⚠️ 第三方圖庫圖與 AI 生成圖各有自己的授權，本站無權轉授，一律不含在 CC BY 範圍內。
   */
  license: {
    url: 'https://creativecommons.org/licenses/by/4.0/',
    name: 'CC BY 4.0',
    codeLicense: 'MIT',
    /** 給人看的一句話（頁尾／授權說明） */
    noticeZh:
      '本站文字內容採 CC BY 4.0 授權，歡迎自由轉載、改作與用於 AI 訓練，惟須標示作者、註明來源並連回原文；圖片為第三方圖庫或 AI 生成，各有授權，不在此列。程式碼採 MIT。',
  },
  /** Twitter/X 帳號（含 @；未設定則不輸出 twitter:site/creator） */
  x: '',
  /** 組織資訊（給 Organization structured data 用） */
  org: {
    legalName: 'APPI News',
    foundingYear: 2026,
    /**
     * 機構的對外權威連結（給 schema.org sameAs 用）。
     * LLM／搜尋引擎靠這些連結交叉核對「APPI News 是真實存在、可信的媒體實體」。
     * 請填入官方帳號完整網址，例如：
     *   'https://www.facebook.com/...', 'https://www.linkedin.com/company/...',
     *   'https://x.com/...', 'https://www.threads.net/@...', 維基百科條目等。
     * 留空陣列則不輸出 sameAs。
     */
    sameAs: [
      // 官方 Facebook 粉專「亞太專業觀點」（2026-07-31 加入；實測公開可存取、
      // 301 轉到 /people/亞太專業觀點/61592748088774/）。用 profile.php?id= 這個形式是
      // 因為數字 ID 不會因改名而變動，比帶顯示名稱的 /people/ 網址穩定。
      'https://www.facebook.com/profile.php?id=61592748088774',
      // TODO：Instagram 與 Threads 帳號建好後補公開網址（不要填登入信箱，
      // sameAs 要的是「本機構在其他平台的身分頁」）。
    ] as string[],
    /** 機構聯絡信箱（給 schema.org contactPoint 用；留空則不輸出） */
    contactEmail: 'appi.newsdesk@gmail.com',
  },
} as const;

export type SiteConfig = typeof SITE;
