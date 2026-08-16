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
  sports: 'C0BP04QD4TE', // 運動
  lifestyle: 'C0BBKFCD6MV', // 生活
};

// 「請 claude 幫我做」開發頻道（讀此頻道訊息 → 跑 Claude）。
export const DEV_CHANNEL = 'C0BC4JJDR0C';

// 主題追蹤頻道（站長 2026-08-08 指定）：每週一則「主題總表」在主層，
// 每個主題一條 thread 只記成員增減。刻意不一主題一頻道——側欄會被幾十個低流量頻道塞爆。
export const TOPIC_CHANNEL = 'C0BNF97AXQX';

/** 分類 → 發文頻道；未知/未給 → 預設頻道。 */
export function channelForCategory(category) {
  return CATEGORY_CHANNELS[category] || SLACK_CHANNEL;
}

// ── 失敗／略過一律進 dev 台（站長 2026-08-08 裁示，無例外）─────────────────
// 判準寫在這一處、不散落到各產線：訊息開頭是 ❌ 或 ⚠️ 就是告警，不論哪條線、哪個分類，
// 都不進內容頻道（分類台只留「有產出、人要看的東西」）。集中判斷的理由：舊作法是每支
// `.sh`／SKILL 自己記得帶 `--dev`，漏一支就把錯誤洗進作者群或分類台，而且新產線一定會忘。
export const ALERT_PREFIXES = ['❌', '⚠️'];

/** 這則訊息是不是失敗／略過告警（看開頭的 emoji，允許前面有空白）。 */
export function isAlert(text) {
  const t = String(text ?? '').trimStart();
  return ALERT_PREFIXES.some((p) => t.startsWith(p));
}

/** 統一路由：告警 ＞ 明示 dev ＞ 主題追蹤台 ＞ 分類頻道 ＞ 預設作者群。 */
export function routeChannel({ text, category, dev, topics } = {}) {
  if (isAlert(text) || dev) return DEV_CHANNEL;
  if (topics) return TOPIC_CHANNEL;
  return channelForCategory(category);
}

// Phase 1 互動端點：可觸發無人值守自動產文 / 核可上線的授權 Slack user（白名單）。
// 非機密。新增授權人就加 member ID（U 開頭）。appi.news workspace 的站長 ID。
export const NEWSROOM_AUTHORIZED_SLACK_USERS = ['U0BBK944P1D'];

export const GA_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export const SA_KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || `${process.env.HOME}/.config/appi-news/ga4-sa.json`;

/**
 * Indexing API 專用服務帳號金鑰（appi.news 專屬 Google Cloud 專案）。
 *
 * 為什麼要跟 GA4/GSC 那把分開：Indexing API 的配額是 **200/天、per Google Cloud 專案**，
 * 不是 per 網站也不是 per 金鑰。原本共用 `ga4-sa.json`（專案 `yaocare`），該專案同時被
 * folk.tw、sutta.io、twdro.net 使用，appi 每天搶不到額度、待送一路累積到 84 篇卻沒人發現
 * （腳本 exit 0、設計成有送才報）。給 appi 自己的專案才有獨立配額。
 * 完整排錯見 docs/lessons/google-indexing-api-gray-area.md 2026-07-31 追記。
 *
 * **沒有 fallback**（2026-08-11 更正）：本常數只是「路徑」，`loadServiceAccount()` 是直球
 * `readFileSync`，檔案不在就 ENOENT 拋錯、整支中止。這裡曾註明「專屬金鑰還沒放上來時照舊用
 * 共用那把」，但程式從來沒有 `existsSync` 判斷，照著讀會誤判缺檔是安全的。刻意不補這個
 * fallback：共用金鑰自 2026-08-01 起對 appi.news 的 GSC 已無權限（見下方 GSC_SA_KEY_PATH），
 * 退回去只會把「缺檔」換成更難查的 403。缺檔就該大聲炸掉。
 */
export const INDEXING_SA_KEY_PATH =
  process.env.INDEXING_SA_KEY || `${process.env.HOME}/.config/appi-news/indexing-sa.json`;

/**
 * GSC 專用金鑰。與 Indexing API 同一把（都是專案 `appi-news-504107` 的
 * `appi-indexing@appi-news-504107.iam.gserviceaccount.com`，在 GSC 是 `sc-domain:appi.news`
 * 的 siteOwner）。**GA4 不能用這把**——它在 GA4 沒有身分，GA4 仍走 SA_KEY_PATH。
 *
 * 為什麼要分開（2026-08-02）：共用金鑰 `ga4-insights@yaocare` 於 2026-08-01 起對
 * appi.news 回 403（該帳號現在看得到其他 10 站、就是沒有 appi），每日 seo-daily 的 gsc
 * 區塊連兩天只寫得出 {"error"}。新專案金鑰早在 07-31 就放上來了，但當時只接了 Indexing
 * API，GSC 這條沒切過去，且該專案未啟用 searchconsole.googleapis.com（已於本日啟用）。
 *
 * **沒有 fallback**（2026-08-11 更正）：這裡曾註明「專屬金鑰不存在時退回 SA_KEY_PATH，不會
 * 因缺檔而整條掛掉」——程式沒有這段邏輯。實測未放金鑰時 `weekly-data.mjs` 直接
 * `ENOENT: open '~/.config/appi-news/indexing-sa.json'` 中止。理由同上：退回共用金鑰只會拿到
 * 403。要在非伺服器環境看歷史數據請讀 `data/seo-daily/`，不要試圖用別站金鑰硬跑。
 */
export const GSC_SA_KEY_PATH = process.env.GSC_SA_KEY || INDEXING_SA_KEY_PATH;

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
