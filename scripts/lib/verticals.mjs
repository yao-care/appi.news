// 自動產文管線「支援哪些分類 + 哪些內容形態」的單一事實來源（鏡像 src/config/categories.ts）。
//
// 為什麼鏡像而非 import：categories.ts 是 TypeScript，這些是純 .mjs 腳本（Node ESM 不直接吃 .ts）。
// 沿用本專案既有慣例（newsroom-job.mjs 原本就硬編 tech 子分類並註明「以 categories.ts 為準」）。
// 改 categories.ts 的分類/子分類 slug 時，這裡要一起改（categories.ts 為唯一事實來源）。
//
// 範圍：只列「開放給自動產文」的分類。focus / health / finance / columns 暫不自動產，故不在此。

/** 分類 → { 中文名, 合法子分類 slug }。子分類對齊 src/config/categories.ts。 */
export const VERTICALS = {
  tech: {
    name: '科技',
    subcategories: ['ai', 'security', 'digital-tools', 'software-products', 'startup', 'semiconductor', 'industry-tech', 'tech-policy'],
  },
  international: {
    name: '國際',
    subcategories: ['global-focus', 'asia', 'americas', 'europe', 'middle-east', 'global-trends', 'cross-strait', 'international-organizations'],
  },
  sports: {
    name: '運動',
    subcategories: ['events', 'baseball', 'basketball', 'football', 'tennis', 'sports-industry', 'sports-science', 'fitness-training', 'sports-health'],
  },
  lifestyle: {
    name: '生活',
    subcategories: ['life', 'consumer', 'family', 'travel', 'food', 'workplace', 'education', 'aging-life', 'life-tech', 'reading-leisure'],
  },
};

export const VERTICAL_SLUGS = Object.keys(VERTICALS);

/**
 * 內容形態（kind）：決定「要不要真人觀點」「預設署名」「預設 contentType」「觀點 gate 開不開」。
 *   - column ：有個人觀點的稿（現行 tech 日更 DNA、國際解讀）。觀點必填、gate 開、署名作者本人。
 *   - factual：事實／服務型 roundup（颱風停班課、樂齡活動、連假優惠）。無個人觀點、gate 關、編輯部署名。
 */
export const KINDS = {
  column: {
    label: '觀點稿',
    viewpointRequired: true, // 沒收到真人看法不動筆
    viewpointGate: true, // 起草後查核觀點是否真的反映於內文
    requireApproval: false, // 過 gate 直接發佈上線（同 tech 日更）
    defaultAuthor: 'lightman',
    defaultContentType: 'news',
  },
  factual: {
    label: '事實稿',
    viewpointRequired: false, // 服務型資訊不逼塞個人觀點
    viewpointGate: false,
    requireApproval: true, // 事實稿一律「人工審後發」：先產待審草稿，核可才上線
    defaultAuthor: 'appi-editorial',
    defaultContentType: 'guide',
  },
};

export const KIND_SLUGS = Object.keys(KINDS);
export const KIND_DEFAULT = 'column'; // 不指定 kind 時 → 維持現行觀點稿行為（向後相容）

/** content.config.ts 的 contentType enum 鏡像（驗證工單 contentType 用；改 schema 要同步）。 */
export const CONTENT_TYPES = [
  'news', 'feature', 'analysis', 'column', 'opinion', 'interview',
  'research-brief', 'guide', 'press-release', 'sponsored', 'video', 'photo-story',
];

export function isVertical(slug) {
  return Object.prototype.hasOwnProperty.call(VERTICALS, slug);
}

export function verticalName(slug) {
  return VERTICALS[slug]?.name ?? slug;
}

export function subcategoriesOf(slug) {
  return VERTICALS[slug]?.subcategories ?? [];
}
