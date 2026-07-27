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

// 訂閱頻道。
//
// channelId 怎麼取（2026-07-27 實測）：
//   curl -s -A "Mozilla/5.0 …" "https://www.youtube.com/@<handle>" | grep -o '"externalId":"UC[A-Za-z0-9_-]\{22\}"'
//   **一定要用 `externalId`**：抓 `"channelId"` 會撈到頁面上的推薦頻道（華視就被撈成別人的 ID），
//   而且 handle 打錯時 YouTube 照樣回 200 一個別人的頻道（`@PTSNews` 回的是一個叫「邱福財」的私人頻道）。
//   **加頻道前務必先抓一次 RSS 看 <title> 是不是你要的台**，別憑 handle 猜。
//
// 為什麼是綜合新聞台而不是生活類 YouTuber（站長 2026-07-27 拍板走這條）：
//   本線的硬性 gate 是「≥2 個獨立於該頻道的來源」。生活 YouTuber 去吃一家店不會有第二家媒體報導，
//   永遠湊不齊來源＝天天 SKIP；綜合新聞台的題才過得了。產量本來就低，這是刻意的取捨。
//
// 實測命中率（各台最新 15 支、近 2 天、扣掉 Shorts 後通過生活線初篩的支數，2026-07-27）：
//   華視 4／15、TVBS 2／15、民視 1／15。三台合計約每日 3–4 支候選，足夠餵每天 1 篇。
export const VIDEO_FEEDS = [
  {
    name: '民視新聞網',
    channelId: 'UC2VmWn8dAqkzlQqvy02E1PA',
    handle: '@FTV_News',
    // 量大且什麼都播、Shorts 比例高 → 完全靠下方生活線關鍵字篩。
  },
  {
    name: '華視新聞',
    channelId: 'UCDCJyLpbfgeVE9iZiEam-Kg',
    handle: '@CtsTw',
    // 目前命中率最高（4/15），且不發 Shorts。
  },
  {
    name: 'TVBS NEWS',
    channelId: 'UC5nwNW4KdC0SzrhF9BXEYOQ',
    handle: '@TVBSNEWS01',
    // 健康/醫療題多，適合本站車道。
  },
  // ── 2026-07-27 第二批：handle 猜不到，改從各台官網挖 YouTube 連結再解 externalId，全部驗過 RSS <title> ──
  { name: '公視新聞網', channelId: 'UCexpzYDEnfmAvPSfG4xbcjA', handle: 'channel/UCexpzYDEnfmAvPSfG4xbcjA' },
  { name: '三立新聞網', channelId: 'UCIU8ha-NHmLjtUwU7dFiXUA', handle: 'channel/UCIU8ha-NHmLjtUwU7dFiXUA' },
  { name: '東森新聞', channelId: 'UCR3asjvr_WAaxwJYEDV_Bfw', handle: 'user/newsebc' },
  { name: '台視新聞', channelId: 'UC8ROUUjHzEQm-ndb69CX8Ww', handle: 'user/ttvnewsview' },
  { name: '中天新聞', channelId: 'UCpu3bemTQwAU8PqM4kJdoEQ', handle: '@中天新聞CtiNews' },
  // 鏡新聞：官網沒放 YouTube 連結、handle 也猜不到，待補。
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
  // 政治／選舉／兩岸國際（2026-07-27 補選戰詞：「鹽埔鄉長選戰拋爭取知名漢堡進駐」曾靠美食詞漏進來）
  '選舉', '選戰', '參選', '候選人', '議員', '立委', '總統', '市長', '縣長', '鄉長', '鎮長', '里長',
  '黨', '罷免', '公投', '國會', '兩岸', '共軍', '解放軍', '外交', '戰爭', '飛彈',
  // 社會案件／事故（2026-07-27 補事故詞：「十分放天燈空中解體下火焰雨」曾靠景點詞漏進來）
  '命案', '凶', '槍', '毒品', '詐騙', '車禍', '死亡', '身亡', '墜樓', '性侵', '虐', '起訴', '判刑', '通緝', '火警', '爆炸',
  '解體', '翻覆', '失事', '罹難', '傷者', '送醫', '搜救',
  // 2026-07-27 二次補：同一則天燈事故換標題再溜進來（「天燈秒變火球墜鐵軌險遭燙傷」）
  '燙傷', '灼傷', '火球', '驚魂', '險遭', '受困', '墜',
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
