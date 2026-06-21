// 非機密設定（可進 repo）。機密走 env：GOOGLE_APPLICATION_CREDENTIALS、SLACK_BOT_TOKEN。
export const GA4_PROPERTY_ID = '541946427';
export const GSC_SITE = 'sc-domain:appi.news';

// appi.news workspace（T0BCV23MAJU）。一分類一頻道，對齊網站 header 欄位。
// 預設/跨類訊息（週報、錯誤哨兵）走 SLACK_CHANNEL（作者群）。
export const SLACK_CHANNEL = 'C0BC4JRQJF6'; // 作者群（預設/跨類）

// 分類 → 頻道。category 對齊 src/config/categories.ts 的 slug。
export const CATEGORY_CHANNELS = {
  focus: 'C0BBUJZN0KV', // 焦點
  international: 'C0BBKF9TN23', // 國際
  health: 'C0BC4JP7G84', // 健康
  tech: 'C0BC105LB18', // 科技
  finance: 'C0BC4JR40A0', // 財經
  sports: 'C0BC106C42E', // 運動
  lifestyle: 'C0BBKFCD6MV', // 生活
};

// 「請 claude 幫我做」開發頻道（讀此頻道訊息 → 跑 Claude）。
export const DEV_CHANNEL = 'C0BC4JJDR0C';

/** 分類 → 發文頻道；未知/未給 → 預設頻道。 */
export function channelForCategory(category) {
  return CATEGORY_CHANNELS[category] || SLACK_CHANNEL;
}

// Phase 1 互動端點：可觸發無人值守自動產文 / 核可上線的授權 Slack user（白名單）。
// 非機密。新增授權人就加 member ID（U 開頭）。appi.news workspace 的站長 ID。
export const NEWSROOM_AUTHORIZED_SLACK_USERS = ['U0BBK944P1D'];

export const GA_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export const SA_KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || `${process.env.HOME}/.config/appi-news/ga4-sa.json`;

const iso = (d) => d.toISOString().slice(0, 10);

/** 回「截至 today 前一天」的本週 7 天與上週 7 天（不重疊）。today 為 Date。 */
export function weekRanges(today) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - 1); // 不含今天（資料未滿日）
  const curStart = new Date(end);
  curStart.setUTCDate(curStart.getUTCDate() - 6);
  const prevEnd = new Date(curStart);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - 6);
  return {
    cur: { start: iso(curStart), end: iso(end) },
    prev: { start: iso(prevStart), end: iso(prevEnd) },
  };
}
