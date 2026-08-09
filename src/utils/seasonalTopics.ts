export interface SeasonalTopicCampaign {
  topicId: string;
  start: string;
  end: string;
  eyebrow: string;
  deadlineLabel: string;
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

/**
 * 七夕／中元仍占主入口時，提早露出開學叢集的次入口。
 * 8/28 起主入口本身已切到開學，次入口必須關閉，避免首頁重複兩個相同專題。
 */
export function showBackToSchoolCompanion(now = new Date()): boolean {
  const day = taipeiDateKey(now);
  return day >= '2026-08-10' && day <= '2026-08-27';
}
