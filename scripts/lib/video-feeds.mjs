// 「影片心得」線的 YouTube 頻道訂閱清單 ＋ 生活線初篩（純資料／純函式，零 I/O）。
//
// 為什麼是 RSS 而不是 yt-dlp（2026-07-26 實測，別再走回頭路）：
//   本機出口 IP（日本 Osaka）被 YouTube 標記，yt-dlp 五種 player_client
//   （tv_simply/web_embedded/mweb/ios/tv）全數回 "Sign in to confirm you're not a bot"，
//   拿不到字幕；WebFetch 對 youtube.com/watch 也只回頁尾。
//   但 https://www.youtube.com/feeds/videos.xml?channel_id=... 是 200，且帶完整
//   <media:description>（新聞頻道會把稿頭放這），i.ytimg.com 縮圖也抓得到。
//   → 這條線「不解析影片本身」，只把影片當線索，事實靠公開文字來源交叉查證。
//   脈絡見 docs/lessons/youtube-video-digest.md。

/** 訂閱頻道。channelId 取法：開頻道任一影片頁，抓 HTML 裡的 "channelId":"UC..."。 */
export const VIDEO_FEEDS = [
  {
    name: '民視新聞網',
    channelId: 'UC2VmWn8dAqkzlQqvy02E1PA',
    handle: '@FTV_News',
    // 該頻道量大且什麼都播 → 完全靠下方生活線關鍵字篩。
  },
];

/** 由 channelId 組 RSS 網址（YouTube 官方 feed，無需金鑰）。 */
export function feedUrl(channelId) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

// 生活線正面詞：美食／旅遊／健康養生／居家消費／育兒銀髮／在地人物故事。
const LIFESTYLE_HINTS = [
  // 美食
  '美食', '餐廳', '小吃', '夜市', '米其林', '必比登', '甜點', '咖啡', '麵包', '料理', '主廚', '菜單', '手搖', '早餐', '便當', '火鍋', '燒肉', '排隊',
  // 旅遊
  '旅遊', '觀光', '景點', '打卡', '住宿', '飯店', '民宿', '溫泉', '露營', '步道', '賞花', '祭典', '花季', '燈會', '一日遊', '秘境',
  // 健康養生
  '健康', '養生', '營養', '飲食', '睡眠', '運動習慣', '減重', '中醫', '保健', '過敏', '防曬', '中暑',
  // 居家消費
  '開箱', '省錢', '優惠', '折扣', '物價', '漲價', '電費', '水費', '租屋', '居家', '收納', '家電', '寵物',
  // 育兒銀髮
  '育兒', '托育', '親子', '長照', '銀髮', '樂齡',
  // 人物／在地故事
  '職人', '老店', '傳承', '返鄉', '創業',
];

// 生活線排除詞：其他線已經在做的（便民市政／颱風／警消）＋ 完全不屬生活線的硬新聞。
const OFF_BEAT = [
  // 政治／選舉／兩岸國際
  '選舉', '議員', '立委', '總統', '市長', '黨', '罷免', '公投', '國會', '兩岸', '共軍', '解放軍', '外交', '戰爭', '飛彈',
  // 社會案件／事故
  '命案', '凶', '槍', '毒品', '詐騙', '車禍', '死亡', '身亡', '墜樓', '性侵', '虐', '起訴', '判刑', '通緝', '火警', '爆炸',
  // 財經股市
  '股', '台積電', '匯率', '央行', '關稅', '財報',
  // 體育賽事（另有運動線）
  '中職', '職棒', '大聯盟', '奧運', 'NBA',
  // 已有專線：颱風（lifestyle-typhoon）、警消好人好事（lifestyle-police）、便民市政（lifestyle-civic）
  '颱風', '停班', '停課', '地震',
  '消防', '救護', '急救', 'CPR', 'OHCA', '搶救', '救援', '員警', '警方', '警察', '分隊',
];

const RE = (list) => new RegExp(list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
const HINT_RE = RE(LIFESTYLE_HINTS);
const OFF_RE = RE(OFF_BEAT);

/**
 * 生活線初篩（高召回、低精度，最後由 LLM 精挑）。
 * 命中生活線關鍵字且未命中排除詞 → true。
 */
export function isLifestyleVideo(title = '', description = '') {
  const text = `${title}\n${String(description).split('\n').slice(0, 3).join('\n')}`;
  if (OFF_RE.test(text)) return false;
  return HINT_RE.test(text);
}

/** Shorts（直式短影音）判定：描述帶 #Shorts 標籤，或標題以 #shorts 結尾。 */
export function isShorts(title = '', description = '') {
  return /#shorts?\b/i.test(`${title} ${description}`);
}
