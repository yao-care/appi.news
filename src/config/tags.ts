/**
 * APPI News 標籤體系（單一事實來源）。
 *
 * 文章 frontmatter 的 `tags` 必須是這裡的 `name` 之一，
 * `content.config.ts` 會用 `TAG_VOCABULARY` 做 `z.enum` 型別約束
 * （與 `categories.ts` 的 `CATEGORY_SLUGS` 同一套機制）。
 * 詞彙表外的標籤會讓 `pnpm build` 直接失敗，CI 擋部署。
 *
 * 為什麼要受控詞彙表：早期 `tags` 是 `z.array(z.string())` 完全不設限，
 * 五條自動產線各自即興發明標籤，481 篇長出 1,883 個 unique tag、
 * 其中 85.9% 只出現一次，標籤頁完全無法作為主題 hub。
 * 完整成因與修法見 docs/lessons/tag-taxonomy.md。
 *
 * 【怎麼新增標籤】
 * 1. 先確認現有詞彙表真的沒有可掛的（優先復用，寧可少掛也不要新增近義詞）。
 * 2. 新標籤要能預期累積到 3 篇以上，否則它只會變成另一個死頁。
 * 3. 加進下面對應 group 的 `TAGS`，跑 `pnpm check:tags` 確認通過。
 * 4. 命名規範：中英混排不加空格（`醫療AI` 不是 `醫療 AI`）；
 *    用「臺」的官方縣市名一律寫成「台」（台北市、台東縣）。
 */

export const TAG_GROUPS = [
  { slug: 'health', name: '健康與醫療' },
  { slug: 'tech', name: '科技與 AI' },
  { slug: 'sustainability', name: '永續與能源' },
  { slug: 'finance', name: '財經與產業' },
  { slug: 'society', name: '生活與社會' },
  { slug: 'region', name: '縣市' },
  { slug: 'world', name: '國際' },
  { slug: 'sports', name: '運動' },
] as const;

export type TagGroupSlug = (typeof TAG_GROUPS)[number]['slug'];

export interface TagDef {
  /** 標籤顯示名，同時是 frontmatter 寫入值 */
  name: string;
  group: TagGroupSlug;
}

export const TAGS: TagDef[] = [
  // ── 健康與醫療 ──────────────────────────────────────────────
  { name: '醫療AI', group: 'health' },
  { name: '數位健康', group: 'health' },
  { name: '預防醫學', group: 'health' },
  { name: '健檢報告', group: 'health' },
  { name: '代謝健康', group: 'health' },
  { name: '糖尿病', group: 'health' },
  { name: '心血管健康', group: 'health' },
  { name: '癌症防治', group: 'health' },
  { name: '高齡健康', group: 'health' },
  { name: '失智症', group: 'health' },
  { name: '長照', group: 'health' },
  { name: '肌少症', group: 'health' },
  { name: '骨骼關節', group: 'health' },
  { name: '復健治療', group: 'health' },
  { name: '中醫', group: 'health' },
  { name: '營養', group: 'health' },
  { name: '保健食品', group: 'health' },
  { name: '食品安全', group: 'health' },
  { name: '口腔健康', group: 'health' },
  { name: '女性健康', group: 'health' },
  { name: '男性健康', group: 'health' },
  { name: '心理健康', group: 'health' },
  { name: '傳染病防治', group: 'health' },
  { name: '公共衛生', group: 'health' },
  { name: '健保', group: 'health' },
  { name: '醫療政策', group: 'health' },
  { name: '藥物研發', group: 'health' },
  { name: '再生醫療', group: 'health' },
  { name: '醫病關係', group: 'health' },
  { name: '甲狀腺', group: 'health' },
  { name: '睡眠與疲勞', group: 'health' },
  { name: '減重管理', group: 'health' },
  { name: '過敏', group: 'health' },
  { name: '肝腎健康', group: 'health' },
  { name: '眼睛健康', group: 'health' },
  { name: '疼痛治療', group: 'health' },
  { name: '職場健康', group: 'health' },
  { name: '育兒健康', group: 'health' },
  { name: '菸酒檳榔', group: 'health' },
  { name: '急救常識', group: 'health' },
  { name: '醫事人力', group: 'health' },

  // ── 科技與 AI ───────────────────────────────────────────────
  { name: 'AI', group: 'tech' },
  { name: 'AI agent', group: 'tech' },
  { name: 'AI治理', group: 'tech' },
  { name: '生成式AI', group: 'tech' },
  { name: 'AI基礎建設', group: 'tech' },
  { name: 'AI人才', group: 'tech' },
  { name: '半導體', group: 'tech' },
  { name: '台積電', group: 'tech' },
  { name: '先進封裝', group: 'tech' },
  { name: '資安', group: 'tech' },
  { name: '資料治理', group: 'tech' },
  { name: '個資保護', group: 'tech' },
  { name: '新創', group: 'tech' },
  { name: '創投', group: 'tech' },
  { name: '數位轉型', group: 'tech' },
  { name: '機器人', group: 'tech' },
  { name: '太空科技', group: 'tech' },
  { name: '開源', group: 'tech' },
  { name: '開發工具', group: 'tech' },
  { name: '科技政策', group: 'tech' },
  { name: '數位身分', group: 'tech' },
  { name: '穿戴科技', group: 'tech' },
  { name: '搜尋與內容策略', group: 'tech' },

  // ── 永續與能源 ─────────────────────────────────────────────
  { name: '淨零轉型', group: 'sustainability' },
  { name: '碳費', group: 'sustainability' },
  { name: '碳盤查', group: 'sustainability' },
  { name: '碳市場', group: 'sustainability' },
  { name: 'ESG', group: 'sustainability' },
  { name: '綠色金融', group: 'sustainability' },
  { name: '循環經濟', group: 'sustainability' },
  { name: '再生能源', group: 'sustainability' },
  { name: '離岸風電', group: 'sustainability' },
  { name: '能源政策', group: 'sustainability' },
  { name: '電網', group: 'sustainability' },
  { name: '儲能', group: 'sustainability' },
  { name: '核能', group: 'sustainability' },
  { name: '氣候變遷', group: 'sustainability' },
  { name: '氣候調適', group: 'sustainability' },
  { name: '極端高溫', group: 'sustainability' },
  { name: '水資源', group: 'sustainability' },
  { name: '環境部', group: 'sustainability' },
  { name: '經濟部', group: 'sustainability' },
  { name: '環境汙染', group: 'sustainability' },

  // ── 財經與產業 ─────────────────────────────────────────────
  { name: '資本市場', group: 'finance' },
  { name: '投資理財', group: 'finance' },
  { name: '退休規劃', group: 'finance' },
  { name: '總體經濟', group: 'finance' },
  { name: '貿易政策', group: 'finance' },
  { name: '供應鏈', group: 'finance' },
  { name: '房市', group: 'finance' },
  { name: '電商', group: 'finance' },
  { name: '消費趨勢', group: 'finance' },
  { name: '金融科技', group: 'finance' },
  { name: '企業經營', group: 'finance' },
  { name: '職場趨勢', group: 'finance' },
  { name: '人才競爭', group: 'finance' },
  { name: '生技產業', group: 'finance' },
  { name: '製造業', group: 'finance' },
  { name: '金管會', group: 'finance' },
  { name: '保險', group: 'finance' },
  { name: '藝術市場', group: 'finance' },

  // ── 生活與社會 ─────────────────────────────────────────────
  { name: '便民措施', group: 'society' },
  { name: '市政服務', group: 'society' },
  { name: '停班停課', group: 'society' },
  { name: '颱風', group: 'society' },
  { name: '天然災害', group: 'society' },
  { name: '警察', group: 'society' },
  { name: '好人好事', group: 'society' },
  { name: '協尋', group: 'society' },
  { name: '防詐', group: 'society' },
  { name: '交通', group: 'society' },
  { name: '育兒', group: 'society' },
  { name: '教育', group: 'society' },
  { name: '少子化', group: 'society' },
  { name: '超高齡社會', group: 'society' },
  { name: '居家安全', group: 'society' },
  { name: '美食', group: 'society' },
  { name: '節慶', group: 'society' },
  { name: '旅遊', group: 'society' },
  { name: '文化藝術', group: 'society' },
  { name: '司法', group: 'society' },
  { name: '身心障礙', group: 'society' },
  { name: '寵物與動物', group: 'society' },

  // ── 縣市 ───────────────────────────────────────────────────
  { name: '台北市', group: 'region' },
  { name: '新北市', group: 'region' },
  { name: '桃園市', group: 'region' },
  { name: '台中市', group: 'region' },
  { name: '台南市', group: 'region' },
  { name: '高雄市', group: 'region' },
  { name: '基隆市', group: 'region' },
  { name: '新竹市', group: 'region' },
  { name: '新竹縣', group: 'region' },
  { name: '苗栗縣', group: 'region' },
  { name: '彰化縣', group: 'region' },
  { name: '南投縣', group: 'region' },
  { name: '雲林縣', group: 'region' },
  { name: '嘉義市', group: 'region' },
  { name: '嘉義縣', group: 'region' },
  { name: '屏東縣', group: 'region' },
  { name: '宜蘭縣', group: 'region' },
  { name: '花蓮縣', group: 'region' },
  { name: '台東縣', group: 'region' },
  { name: '澎湖縣', group: 'region' },
  { name: '金門縣', group: 'region' },
  { name: '連江縣', group: 'region' },

  // ── 國際 ───────────────────────────────────────────────────
  { name: '亞太', group: 'world' },
  { name: '日本', group: 'world' },
  { name: '韓國', group: 'world' },
  { name: '新加坡', group: 'world' },
  { name: '印度', group: 'world' },
  { name: '東南亞', group: 'world' },
  { name: '澳洲', group: 'world' },
  { name: '中國', group: 'world' },
  { name: '香港', group: 'world' },
  { name: '美國', group: 'world' },
  { name: '英國', group: 'world' },
  { name: '蘇格蘭', group: 'world' },
  { name: '北愛爾蘭', group: 'world' },
  { name: '愛爾蘭', group: 'world' },
  { name: '歐盟', group: 'world' },
  { name: '中東情勢', group: 'world' },
  { name: '烏克蘭', group: 'world' },
  { name: '地緣政治', group: 'world' },
  { name: '國際組織', group: 'world' },
  { name: '移民', group: 'world' },

  // ── 運動 ───────────────────────────────────────────────────
  { name: '中職', group: 'sports' },
  { name: '棒球', group: 'sports' },
  { name: '籃球', group: 'sports' },
  { name: '足球', group: 'sports' },
  { name: '路跑', group: 'sports' },
  { name: '健身', group: 'sports' },
  { name: '運動科技', group: 'sports' },
  { name: '運動產業', group: 'sports' },
  { name: '運動醫學', group: 'sports' },
  { name: '圍棋', group: 'sports' },
  { name: '桌球', group: 'sports' },
  { name: '學生賽事', group: 'sports' },
  { name: '國際賽事', group: 'sports' },
];

/** `content.config.ts` 的 `z.enum` 約束源。 */
export const TAG_VOCABULARY = TAGS.map((t) => t.name) as [string, ...string[]];

export const TAG_SET: ReadonlySet<string> = new Set(TAG_VOCABULARY);

export const TAG_GROUP_MAP: Record<string, TagGroupSlug> = Object.fromEntries(
  TAGS.map((t) => [t.name, t.group]),
);

/**
 * 每篇文章的標籤數上限。
 * 標籤是主題 hub 不是關鍵詞清單，掛太多等於沒掛；
 * 具體關鍵詞交給 title / description / 內文處理。
 */
export const MAX_TAGS_PER_ARTICLE = 8;

/** 標籤是否在受控詞彙表內 */
export function isValidTag(tag: string): boolean {
  return TAG_SET.has(tag);
}

/** 依 group 取標籤（給 /tags 索引頁分區用） */
export function tagsByGroup(group: TagGroupSlug): string[] {
  return TAGS.filter((t) => t.group === group).map((t) => t.name);
}
