// 無人值守自動產文（子專案 2 / Phase 0）的「寫作工單」解析與驗證。
// 純函式、無副作用，方便單元測試。協調器 scripts/newsroom-write.mjs 用它把關。
//
// 工單來源：週報建議方向（標題/訊號依據/切角/候選結論/建議分類）+ Slack modal 的「作者看法」。
// 兩條不可破的鐵律 gate 在此強制：
//   1. 只限科技類（category === 'tech'）——newsroom 是科技類日更引擎。
//   2. 作者看法必填——沒收到真人看法不動筆，機器人永不杜撰個人觀點。
//
// 分類事實來源是 src/config/categories.ts；此處只硬編「tech」與其子分類 slug，
// 改分類體系時兩邊要一起改（categories.ts 為準）。

export const TECH_CATEGORY = 'tech';

// 對齊 src/config/categories.ts 的 tech.subcategories（唯一事實來源在那）。
export const TECH_SUBCATEGORIES = [
  'ai',
  'security',
  'digital-tools',
  'software-products',
  'startup',
  'semiconductor',
  'industry-tech',
  'tech-policy',
];

export const LENGTH_DEFAULT = 'short'; // Q4 未提供時的預設：短稿 800–1500 字
export const LENGTHS = ['short', 'deep'];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * 驗證工單。回傳錯誤字串陣列；空陣列＝通過。
 * 不丟例外（讓呼叫端決定怎麼回報），不改動入參。
 */
export function validateJob(job) {
  const errors = [];

  if (!job || typeof job !== 'object') {
    return ['工單不是物件'];
  }

  // 鐵律 1：只限科技類
  if (job.category !== TECH_CATEGORY) {
    errors.push(`category 必須是 "${TECH_CATEGORY}"（本管線只自動產科技類），收到：${JSON.stringify(job.category)}`);
  }

  // 鐵律 2：作者看法必填（禁杜撰根防線）
  if (!isNonEmptyString(job.viewpoint)) {
    errors.push('viewpoint（作者看法）必填且不可空白——沒收到真人看法不動筆');
  }

  // 起草必要欄位
  if (!isNonEmptyString(job.title)) errors.push('title 必填');
  if (!isNonEmptyString(job.conclusion)) errors.push('conclusion（核心結論）必填');

  // 子分類若有給，必須屬於 tech
  if (job.subcategory != null && !TECH_SUBCATEGORIES.includes(job.subcategory)) {
    errors.push(`subcategory "${job.subcategory}" 不屬於 tech；可選：${TECH_SUBCATEGORIES.join(' / ')}`);
  }

  // 篇幅若有給，必須合法
  if (job.length != null && !LENGTHS.includes(job.length)) {
    errors.push(`length 必須是 ${LENGTHS.join(' / ')}，收到：${JSON.stringify(job.length)}`);
  }

  // 排程日若有給，須為 YYYY-MM-DD（或 ISO 起頭）
  if (job.publishDate != null && !/^\d{4}-\d{2}-\d{2}/.test(String(job.publishDate))) {
    errors.push(`publishDate 須為 YYYY-MM-DD，收到：${JSON.stringify(job.publishDate)}`);
  }

  return errors;
}

/**
 * 套用預設值，回一份正規化後的新工單（不改入參）。
 * 僅在 validateJob 通過後呼叫才有意義。
 */
export function normalizeJob(job) {
  return {
    title: job.title.trim(),
    conclusion: job.conclusion.trim(),
    viewpoint: job.viewpoint.trim(),
    category: TECH_CATEGORY,
    subcategory: job.subcategory ?? null,
    signal: isNonEmptyString(job.signal) ? job.signal.trim() : '',
    angle: isNonEmptyString(job.angle) ? job.angle.trim() : '',
    length: job.length ?? LENGTH_DEFAULT,
    mustCite: Array.isArray(job.mustCite) ? job.mustCite.filter(isNonEmptyString) : [],
    publishDate: job.publishDate ? String(job.publishDate).slice(0, 10) : null, // 指定排程日；null=引擎自選空檔
  };
}
