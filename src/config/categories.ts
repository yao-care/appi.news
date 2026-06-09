/**
 * APPI News 分類體系（單一事實來源）。
 * 文章 frontmatter 的 category 必須是這裡的 slug 之一；
 * subcategory 必須屬於該分類的 subcategories。
 * content.config.ts 會用 CATEGORY_SLUGS 做型別約束。
 */

export interface SubCategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string; // 中文主名
  nameEn: string; // 英文
  /** 健康頻道專用的中文頻道名（其餘為 undefined） */
  channelName?: string;
  /** 分類頁的介紹文案 */
  description: string;
  /** 頻道強調色（hex，低飽和品牌色） */
  color: string;
  subcategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'focus',
    name: '焦點',
    nameEn: 'Focus',
    description: 'APPI 編輯部精選的重要議題、跨領域趨勢與深度分析。',
    color: 'oklch(0.55 0.20 255)',
    subcategories: [
      { slug: 'today', name: '今日焦點' },
      { slug: 'trends', name: '重大趨勢' },
      { slug: 'analysis', name: '專題分析' },
      { slug: 'editors-pick', name: '編輯精選' },
    ],
  },
  {
    slug: 'health',
    name: '健康',
    nameEn: 'Health',
    channelName: 'APPI Health｜亞太醫頭條',
    description:
      '承接亞太醫頭條的健康醫療內容，聚焦醫療、預防醫學、中醫、營養與醫療科技。',
    color: 'oklch(0.58 0.11 170)',
    subcategories: [
      { slug: 'medical', name: '醫療' },
      { slug: 'preventive', name: '預防醫學' },
      { slug: 'tcm', name: '中醫' },
      { slug: 'nutrition', name: '營養' },
      { slug: 'medtech', name: '醫療科技' },
      { slug: 'health-policy', name: '健康政策' },
      { slug: 'supplement-compliance', name: '保健食品合規' },
    ],
  },
  {
    slug: 'tech',
    name: '科技',
    nameEn: 'Tech',
    description: '追蹤 AI、數位工具、資安、新創與產業科技應用。',
    color: 'oklch(0.50 0.20 295)',
    subcategories: [
      { slug: 'ai', name: 'AI' },
      { slug: 'digital-tools', name: '數位工具' },
      { slug: 'security', name: '資安' },
      { slug: 'startup', name: '新創' },
      { slug: 'software', name: '軟體與產品' },
      { slug: 'industry-tech', name: '產業應用' },
    ],
  },
  {
    slug: 'finance',
    name: '財經',
    nameEn: 'Finance',
    description: '整理產業、投資觀念、企業經營、金融科技與商業模式觀察。',
    color: 'oklch(0.58 0.12 85)',
    subcategories: [
      { slug: 'industry', name: '產業' },
      { slug: 'investing', name: '投資觀念' },
      { slug: 'management', name: '企業經營' },
      { slug: 'fintech', name: '金融科技' },
      { slug: 'business-model', name: '商業模式' },
      { slug: 'market', name: '市場觀察' },
    ],
  },
  {
    slug: 'society',
    name: '時事',
    nameEn: 'Society',
    description: '從政策、社會趨勢、公共議題與國際觀察，拆解正在發生的變化。',
    color: 'oklch(0.57 0.18 35)',
    subcategories: [
      { slug: 'public-issues', name: '公共議題' },
      { slug: 'policy', name: '政策觀察' },
      { slug: 'social-trends', name: '社會趨勢' },
      { slug: 'international', name: '國際觀察' },
      { slug: 'media-literacy', name: '媒體與資訊識讀' },
    ],
  },
  {
    slug: 'sports',
    name: '運動',
    nameEn: 'Sports',
    description: '關注運動科學、賽事觀察、運動產業與健康訓練。',
    color: 'oklch(0.52 0.10 175)',
    subcategories: [
      { slug: 'sports-science', name: '運動科學' },
      { slug: 'events', name: '賽事觀察' },
      { slug: 'sports-industry', name: '運動產業' },
      { slug: 'training', name: '健身與訓練' },
      { slug: 'sports-health', name: '運動健康' },
    ],
  },
  {
    slug: 'lifestyle',
    name: '生活',
    nameEn: 'Lifestyle',
    description: '從教育、職場、消費、家庭與文化角度，整理生活中的重要變化。',
    color: 'oklch(0.58 0.15 345)',
    subcategories: [
      { slug: 'education', name: '教育' },
      { slug: 'workplace', name: '職場' },
      { slug: 'consumer', name: '消費' },
      { slug: 'family', name: '家庭' },
      { slug: 'culture', name: '文化' },
      { slug: 'life-tech', name: '生活科技' },
    ],
  },
  {
    slug: 'columns',
    name: '專欄',
    nameEn: 'Columns',
    description: '收錄 APPI 作者群、專家觀點、特約專欄與品牌專欄。',
    color: 'oklch(0.48 0.01 250)',
    subcategories: [
      { slug: 'author-column', name: '作者專欄' },
      { slug: 'expert-view', name: '專家觀點' },
      { slug: 'corporate-view', name: '企業觀點' },
      { slug: 'guest-column', name: '特約專欄' },
      { slug: 'editorial-view', name: '編輯部觀點' },
    ],
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

/** 主導覽要顯示的分類（不含 columns，columns 另列） */
export const NAV_CATEGORIES = CATEGORIES;

export function getCategory(slug: string | undefined): Category | undefined {
  if (!slug) return undefined;
  return CATEGORY_MAP[slug];
}

export function getCategoryName(slug: string | undefined): string {
  return getCategory(slug)?.name ?? '未分類';
}

export function getSubcategoryName(
  catSlug: string | undefined,
  subSlug: string | undefined,
): string | undefined {
  if (!catSlug || !subSlug) return undefined;
  return getCategory(catSlug)?.subcategories.find((s) => s.slug === subSlug)?.name;
}
