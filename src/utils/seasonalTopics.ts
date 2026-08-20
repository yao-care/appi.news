export interface SeasonalTopicCampaign {
  topicId: string;
  /** 檔期本身的起訖（台北日曆日，含頭尾）：決定「當令」主入口輪替 */
  start: string;
  end: string;
  eyebrow: string;
  deadlineLabel: string;
  /** 主打期起訖：期間內此檔期強制升為首頁主入口（帶 lead 圖強化版型） */
  promoteStart?: string;
  promoteEnd?: string;
  /** 主打期主入口的覆寫標題；未設定時渲染端用專題本身的標題 */
  displayTitle?: string;
  /** 主打期主入口左側大圖的 lead 文章 slug */
  leadArticleSlug?: string;
  /** 次入口（提早露出）起訖：期間內以精簡卡露出，讓讀者提前準備 */
  companionStart?: string;
  companionEnd?: string;
  /** 次入口的覆寫 eyebrow／標題；未設定時分別退回 eyebrow 與專題標題 */
  companionEyebrow?: string;
  companionTitle?: string;
}

export const SEASONAL_TOPIC_CAMPAIGNS: SeasonalTopicCampaign[] = [
  {
    topicId: 'qixi-2026',
    start: '2026-08-01',
    end: '2026-08-19',
    eyebrow: '8 月 19 日七夕',
    deadlineLabel: '日期、祭拜與成年禮一次查',
  },
  {
    topicId: 'zhongyuan-2026',
    start: '2026-08-20',
    end: '2026-08-27',
    eyebrow: '8 月 27 日中元節',
    deadlineLabel: '住家、公司普渡與鬼月查證',
  },
  {
    topicId: 'back-to-school-2026',
    start: '2026-08-28',
    end: '2026-08-31',
    eyebrow: '8 月 31 日開學',
    deadlineLabel: '收心、護眼與校園防疫清單',
    promoteStart: '2026-08-17',
    promoteEnd: '2026-08-31',
    displayTitle: '2026 開學準備清單',
    leadArticleSlug: 'first-grade-school-supplies-2026',
    companionStart: '2026-08-10',
    companionEnd: '2026-08-27',
    companionEyebrow: '提早準備｜8 月 31 日開學',
    companionTitle: '小一用品、收心與校園防疫',
  },
];

/** 用台北日曆日判斷，避免 UTC 晚間部署提早切換隔日專題。 */
export function taipeiDateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function activeSeasonalTopic(
  now = new Date(),
  campaigns = SEASONAL_TOPIC_CAMPAIGNS,
): SeasonalTopicCampaign | undefined {
  const day = taipeiDateKey(now);
  return campaigns.find((campaign) => day >= campaign.start && day <= campaign.end);
}

/** 首頁季節槽位的渲染內容：index.astro 只需展開渲染，不再做任何日期／檔期決策 */
export interface SeasonalSlot {
  campaign: SeasonalTopicCampaign;
  topicId: string;
  /** 已組好的 eyebrow 文字（主打期含「現在主打｜」前綴），直接渲染 */
  eyebrow: string;
  /** 覆寫標題；未設定時渲染端用專題本身的標題 */
  title?: string;
  /** 主入口說明列（deadlineLabel）；次入口不顯示說明 */
  description?: string;
  /** 主打期主入口的 lead 文章 slug（左側大圖）；無則純文字卡 */
  leadArticleSlug?: string;
  /** 是否為主打強化版（首頁套 home-seasonal--with-image 版型） */
  promoted?: boolean;
}

/**
 * 決定首頁 primary／companion 兩個季節槽位。規則（皆以台北日曆日、含頭尾判斷）：
 * - primary：主打期（promoteStart–promoteEnd）內的檔期優先，否則當令（start–end）檔期；都沒有則整節不出現。
 * - companion：主打期時露出「當令且不同於主入口」的檔期（避免同專題重複佔兩個槽位）；
 *   非主打期則露出次入口窗（companionStart–companionEnd）內的檔期，帶 companion 覆寫文案。
 * - 沒有 primary 時一律不回傳 companion（次入口掛在主入口區塊內，無主入口就沒有位置）。
 */
export function resolveSeasonalSlots(
  now = new Date(),
  campaigns = SEASONAL_TOPIC_CAMPAIGNS,
): { primary?: SeasonalSlot; companion?: SeasonalSlot } {
  const day = taipeiDateKey(now);
  const inRange = (start?: string, end?: string) =>
    Boolean(start && end && day >= start && day <= end);

  const active = activeSeasonalTopic(now, campaigns);
  const promoted = campaigns.find((c) => inRange(c.promoteStart, c.promoteEnd));

  const primary: SeasonalSlot | undefined = promoted
    ? {
        campaign: promoted,
        topicId: promoted.topicId,
        eyebrow: `現在主打｜${promoted.eyebrow}`,
        title: promoted.displayTitle,
        description: promoted.deadlineLabel,
        leadArticleSlug: promoted.leadArticleSlug,
        promoted: true,
      }
    : active
      ? {
          campaign: active,
          topicId: active.topicId,
          eyebrow: active.eyebrow,
          description: active.deadlineLabel,
        }
      : undefined;
  if (!primary) return {};

  let companion: SeasonalSlot | undefined;
  if (promoted) {
    if (active && active.topicId !== promoted.topicId) {
      companion = { campaign: active, topicId: active.topicId, eyebrow: active.eyebrow };
    }
  } else {
    const early = campaigns.find((c) => inRange(c.companionStart, c.companionEnd));
    if (early && early.topicId !== primary.topicId) {
      companion = {
        campaign: early,
        topicId: early.topicId,
        eyebrow: early.companionEyebrow ?? early.eyebrow,
        title: early.companionTitle,
      };
    }
  }

  return { primary, companion };
}
