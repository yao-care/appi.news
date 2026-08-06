// 無人值守自動產文的「寫作工單」解析與驗證。
// 純函式、無副作用，方便單元測試。協調器 scripts/newsroom-write.mjs 用它把關。
//
// 工單來源：選題雷達建議（標題/訊號依據/切角/候選結論/分類）+（觀點稿才有）Slack modal 的「作者看法」。
// 不可破的鐵律 gate 在此強制：
//   1. 分類必須是「開放自動產文」的 vertical 之一（見 scripts/lib/verticals.mjs；非白名單一律擋）。
//   2. 觀點稿（kind: column）作者看法必填——沒收到真人看法不動筆，機器人永不杜撰個人觀點。
//      事實稿（kind: factual，颱風/樂齡/優惠等服務型）不要求觀點、由編輯部署名。
//
// 分類與內容形態的事實來源是 scripts/lib/verticals.mjs（它再鏡像 src/config/categories.ts）。

import {
  VERTICALS,
  VERTICAL_SLUGS,
  ALL_CATEGORY_SLUGS,
  KINDS,
  KIND_SLUGS,
  KIND_DEFAULT,
  CONTENT_TYPES,
  isVertical,
  isCategoryAny,
  subcategoriesOf,
  subcategoriesOfAny,
  verticalName,
  categoryNameAny,
} from './verticals.mjs';

// 向後相容匯出（既有測試 / 呼叫端仍 import 這兩個）。
export const TECH_CATEGORY = 'tech';
export const TECH_SUBCATEGORIES = subcategoriesOf('tech');

export const LENGTH_DEFAULT = 'short'; // Q4 未提供時的預設：短稿 800–1500 字
export const LENGTHS = ['short', 'deep'];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** 取工單的內容形態（kind）；非法或未給 → 預設 column。回傳 KINDS 的設定物件。 */
export function kindOf(job) {
  const k = job && typeof job.kind === 'string' ? job.kind : KIND_DEFAULT;
  return KINDS[k] ? k : KIND_DEFAULT;
}

/**
 * 驗證工單。回傳錯誤字串陣列；空陣列＝通過。
 * 不丟例外（讓呼叫端決定怎麼回報），不改動入參。
 *
 * @param {object} job
 * @param {{allowAnyCategory?: boolean}} [opts]
 *   allowAnyCategory=true：放寬分類白名單成「全部合法分類」（含 focus/health/finance/columns）。
 *   只給「真人經 /admin 下單」用——人工下單非機器自選題，不受自動產文白名單限制。
 *   預設 false＝維持自動產線的鐵律（只收 vertical），行為與過去完全一致。
 */
export function validateJob(job, { allowAnyCategory = false } = {}) {
  const errors = [];

  if (!job || typeof job !== 'object') {
    return ['工單不是物件'];
  }

  // 鐵律 1：分類必須合法。自動產線＝只收 vertical；/admin 真人下單＝放寬成全部合法分類。
  const categoryOk = allowAnyCategory ? isCategoryAny(job.category) : isVertical(job.category);
  const categoryList = allowAnyCategory ? ALL_CATEGORY_SLUGS : VERTICAL_SLUGS;
  if (!isNonEmptyString(job.category) || !categoryOk) {
    errors.push(
      `category 必須是${allowAnyCategory ? '合法' : '可自動產文'}的分類之一（${categoryList.join(' / ')}），收到：${JSON.stringify(job.category)}`,
    );
  }

  // 內容形態若有給，必須合法
  if (job.kind != null && !KIND_SLUGS.includes(job.kind)) {
    errors.push(`kind 必須是 ${KIND_SLUGS.join(' / ')}，收到：${JSON.stringify(job.kind)}`);
  }

  // 鐵律 2：觀點稿作者看法必填（禁杜撰根防線）；事實稿不要求
  const requiresViewpoint = KINDS[kindOf(job)].viewpointRequired;
  if (requiresViewpoint && !isNonEmptyString(job.viewpoint)) {
    errors.push('viewpoint（作者看法）必填且不可空白——觀點稿沒收到真人看法不動筆');
  }

  // 起草必要欄位
  if (!isNonEmptyString(job.title)) errors.push('title 必填');
  if (!isNonEmptyString(job.conclusion)) errors.push('conclusion（核心結論）必填');

  // 子分類若有給，必須屬於該分類（分類本身合法才檢查，否則訊息會混淆）
  const categoryValidForSub = allowAnyCategory ? isCategoryAny(job.category) : isVertical(job.category);
  if (job.subcategory != null && categoryValidForSub) {
    const allowed = allowAnyCategory ? subcategoriesOfAny(job.category) : subcategoriesOf(job.category);
    if (!allowed.includes(job.subcategory)) {
      errors.push(`subcategory "${job.subcategory}" 不屬於 ${job.category}；可選：${allowed.join(' / ')}`);
    }
  }

  // contentType 若有給，必須是 schema 合法值
  if (job.contentType != null && !CONTENT_TYPES.includes(job.contentType)) {
    errors.push(`contentType "${job.contentType}" 非合法值；可選：${CONTENT_TYPES.join(' / ')}`);
  }

  // 篇幅若有給，必須合法
  if (job.length != null && !LENGTHS.includes(job.length)) {
    errors.push(`length 必須是 ${LENGTHS.join(' / ')}，收到：${JSON.stringify(job.length)}`);
  }

  // 排程日若有給，須為 YYYY-MM-DD（或 ISO 起頭）
  if (job.publishDate != null && !/^\d{4}-\d{2}-\d{2}/.test(String(job.publishDate))) {
    errors.push(`publishDate 須為 YYYY-MM-DD，收到：${JSON.stringify(job.publishDate)}`);
  }

  // 固定 slug 若有給，須為英文 kebab（給滾動更新／同一事件就地改寫用；不給＝引擎自選）
  if (job.slug != null && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(job.slug))) {
    errors.push(`slug 須為英文 kebab（a-z0-9 與連字號），收到：${JSON.stringify(job.slug)}`);
  }

  return errors;
}

/**
 * 套用預設值，回一份正規化後的新工單（不改入參）。
 * 僅在 validateJob 通過後呼叫才有意義。
 */
export function normalizeJob(job) {
  const kind = kindOf(job);
  const kindCfg = KINDS[kind];
  return {
    title: job.title.trim(),
    conclusion: job.conclusion.trim(),
    viewpoint: isNonEmptyString(job.viewpoint) ? job.viewpoint.trim() : '',
    category: job.category, // 不再寫死 tech；validateJob 已確保是合法分類
    categoryName: categoryNameAny(job.category), // 全分類版（含 health/focus/finance/columns）
    subcategory: job.subcategory ?? null,
    kind,
    author: isNonEmptyString(job.author) ? job.author.trim() : kindCfg.defaultAuthor,
    contentType: isNonEmptyString(job.contentType) ? job.contentType : kindCfg.defaultContentType,
    viewpointRequired: kindCfg.viewpointRequired,
    viewpointGate: kindCfg.viewpointGate,
    // 事實稿預設「人工審後發」。`autoPublish: true` 是**產線層級的明示豁免**：
    // 給已由站長裁示全自動上架的線用（如論壇選題雷達），與國際／警消／便民同一種模式。
    // 刻意做成工單欄位而不是改 KINDS：那會讓所有事實稿都變成自動上線，範圍太大。
    requireApproval: job.autoPublish === true ? false : kindCfg.requireApproval,
    signal: isNonEmptyString(job.signal) ? job.signal.trim() : '',
    angle: isNonEmptyString(job.angle) ? job.angle.trim() : '',
    length: job.length ?? LENGTH_DEFAULT,
    mustCite: Array.isArray(job.mustCite) ? job.mustCite.filter(isNonEmptyString) : [],
    publishDate: job.publishDate ? String(job.publishDate).slice(0, 10) : null, // 指定排程日；null=引擎自選空檔
    slug: isNonEmptyString(job.slug) ? job.slug.trim() : null, // 固定 slug；給滾動更新就地改寫用，null=引擎自選
  };
}

// 讓呼叫端（newsroom-write）能拿到分類中文名等
export { VERTICALS, VERTICAL_SLUGS, verticalName };
