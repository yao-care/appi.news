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
    'APPI News｜亞太專業觀點，是一個結合 AI 輔助寫作、專家審稿與媒體刊登的專業觀點平台，協助各領域專業者快速建立可信內容資產。',
  /** 預設語系 */
  lang: 'zh-Hant',
  locale: 'zh_TW',
  /** 社群 / 聯絡 */
  email: 'hello@appi.news',
  /** 預設社群分享圖（相對 BASE_URL） */
  defaultOgImage: 'og/default.png',
  /** Twitter/X 帳號（含 @；未設定則不輸出 twitter:site/creator） */
  x: '',
  /** 組織資訊（給 Organization structured data 用） */
  org: {
    legalName: 'APPI News',
    foundingYear: 2026,
  },
} as const;

export type SiteConfig = typeof SITE;
