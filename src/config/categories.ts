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
    description: 'APPI 編輯部精選的重要議題、重大事件、跨領域趨勢與深度報導。',
    color: 'oklch(0.55 0.20 255)',
    subcategories: [
      { slug: 'today', name: '今日焦點' },
      { slug: 'major-issues', name: '重大議題' },
      { slug: 'editors-pick', name: '編輯精選' },
      { slug: 'trend-watch', name: '趨勢觀察' },
      { slug: 'policy-watch', name: '政策觀察' },
      { slug: 'special-report', name: '特別報導' },
    ],
  },
  {
    slug: 'international',
    name: '國際',
    nameEn: 'International',
    description: '追蹤國際新聞、區域局勢、全球趨勢、兩岸觀察與跨國議題。',
    color: 'oklch(0.52 0.14 240)',
    subcategories: [
      { slug: 'global-focus', name: '國際焦點' },
      { slug: 'asia', name: '亞洲' },
      { slug: 'americas', name: '美洲' },
      { slug: 'europe', name: '歐洲' },
      { slug: 'middle-east', name: '中東' },
      { slug: 'global-trends', name: '全球趨勢' },
      { slug: 'cross-strait', name: '兩岸觀察' },
      { slug: 'international-organizations', name: '國際組織' },
    ],
  },
  {
    slug: 'health',
    name: '健康',
    nameEn: 'Health',
    channelName: 'APPI Health｜亞太醫頭條',
    description:
      '聚焦醫療、預防醫學、營養、中醫與整合醫學、心理健康、高齡健康、醫療科技、健康政策與保健食品法規。',
    color: 'oklch(0.58 0.11 170)',
    subcategories: [
      { slug: 'medical', name: '醫療' },
      { slug: 'preventive', name: '預防醫學' },
      { slug: 'nutrition', name: '營養' },
      { slug: 'tcm-integrative', name: '中醫與整合醫學' },
      { slug: 'mental-health', name: '心理健康' },
      { slug: 'aging-health', name: '高齡健康' },
      { slug: 'medtech', name: '醫療科技' },
      { slug: 'health-policy', name: '健康政策' },
      { slug: 'supplement-regulation', name: '保健食品與法規' },
    ],
  },
  {
    slug: 'tech',
    name: '科技',
    nameEn: 'Tech',
    description: '追蹤 AI、資安、數位工具、軟體產品、新創、半導體、產業科技與科技政策。',
    color: 'oklch(0.50 0.20 295)',
    subcategories: [
      { slug: 'ai', name: 'AI' },
      { slug: 'security', name: '資安' },
      { slug: 'digital-tools', name: '數位工具' },
      { slug: 'software-products', name: '軟體與產品' },
      { slug: 'startup', name: '新創' },
      { slug: 'semiconductor', name: '半導體' },
      { slug: 'industry-tech', name: '產業科技' },
      { slug: 'tech-policy', name: '科技政策' },
    ],
  },
  {
    slug: 'finance',
    name: '財經',
    nameEn: 'Finance',
    description: '整理產業、企業經營、市場觀察、金融科技、商業模式、房市、消費金融與投資觀念。',
    color: 'oklch(0.58 0.12 85)',
    subcategories: [
      { slug: 'industry', name: '產業' },
      { slug: 'management', name: '企業經營' },
      { slug: 'market', name: '市場觀察' },
      { slug: 'fintech', name: '金融科技' },
      { slug: 'business-model', name: '商業模式' },
      { slug: 'real-estate', name: '房市' },
      { slug: 'consumer-finance', name: '消費金融' },
      { slug: 'investing-literacy', name: '投資觀念' },
    ],
  },
  {
    slug: 'sports',
    name: '運動',
    nameEn: 'Sports',
    description: '關注賽事、棒球、籃球、足球、網球、運動產業、運動科學、健身訓練與運動健康。',
    color: 'oklch(0.52 0.10 175)',
    subcategories: [
      { slug: 'events', name: '賽事' },
      { slug: 'baseball', name: '棒球' },
      { slug: 'basketball', name: '籃球' },
      { slug: 'football', name: '足球' },
      { slug: 'tennis', name: '網球' },
      { slug: 'sports-industry', name: '運動產業' },
      { slug: 'sports-science', name: '運動科學' },
      { slug: 'fitness-training', name: '健身訓練' },
      { slug: 'sports-health', name: '運動健康' },
    ],
  },
  {
    slug: 'lifestyle',
    name: '生活',
    nameEn: 'Lifestyle',
    description:
      '從生活、消費、家庭、旅遊、美食、職場、教育、熟齡生活、生活科技與閱讀休閒角度，整理日常中的重要變化。',
    color: 'oklch(0.58 0.15 345)',
    subcategories: [
      { slug: 'life', name: '生活' },
      { slug: 'consumer', name: '消費' },
      { slug: 'family', name: '家庭' },
      { slug: 'travel', name: '旅遊' },
      { slug: 'food', name: '美食' },
      { slug: 'workplace', name: '職場' },
      { slug: 'education', name: '教育' },
      { slug: 'aging-life', name: '熟齡生活' },
      { slug: 'life-tech', name: '生活科技' },
      { slug: 'reading-leisure', name: '閱讀與休閒' },
    ],
  },
  {
    slug: 'columns',
    name: '專欄',
    nameEn: 'Columns',
    description: '收錄 APPI 作者群、專家觀點、編輯部觀點、特約專欄、品牌專欄與人物觀點。',
    color: 'oklch(0.48 0.01 250)',
    subcategories: [
      { slug: 'author-column', name: '作者專欄' },
      { slug: 'expert-view', name: '專家觀點' },
      { slug: 'editorial-view', name: '編輯部觀點' },
      { slug: 'guest-column', name: '特約專欄' },
      { slug: 'brand-column', name: '品牌專欄' },
      { slug: 'personal-view', name: '人物觀點' },
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
