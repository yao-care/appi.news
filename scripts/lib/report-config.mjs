// 非機密設定（可進 repo）。機密走 env：GOOGLE_APPLICATION_CREDENTIALS、SLACK_BOT_TOKEN。
export const GA4_PROPERTY_ID = '541946427';
export const GSC_SITE = 'sc-domain:appi.news';
export const SLACK_CHANNEL = 'C0AFYV3TAMV'; // Weiqi.Kids workspace「agent回報」

// Phase 1 互動端點：可觸發無人值守自動產文的授權 Slack user（白名單，預設只有站長）。
// 非機密。新增授權人就加 member ID（U 開頭）。
export const NEWSROOM_AUTHORIZED_SLACK_USERS = ['U0AGB084S2H'];

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
