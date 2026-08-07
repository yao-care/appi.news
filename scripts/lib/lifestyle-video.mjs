// 「影片心得」線的寫作純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/lifestyle-video.mjs 先用 ./video-fetch.mjs 抓好候選、用 ./video-ledger.mjs
// 濾掉已看過的，再用本檔的 buildVideoPrompt 組 prompt 給 Claude。
//
// 決策（站長定 2026-07-26）：訂閱頻道每日挑片、編輯部事實整理、全自動上架。
// 與 civic 線最大的不同：**LLM 必須上網**。因為本機抓不到影片逐字稿（見 video-feeds.mjs 檔頭），
// 影片只是「線索」，事實一律靠公開文字來源交叉查證；查不到就不寫。

/** 把一支候選影片格式化成 prompt 素材區塊。 */
import { renderTitleTargeting } from './title-targeting.mjs';
import { RISKS_PROMPT } from "./risks-prompt.mjs";
import { GROWTH_PROMPT } from "./growth-prompt.mjs";

function formatCandidate(c) {
  if (!c) return '（無候選）';
  const d = c.published ? `（${c.published.slice(0, 10)}）` : '';
  const sum = c.summary ? `\n  影片描述：${c.summary}` : '';
  return `  ${d}${c.title}\n  頻道：${c.channel}\n  videoId：${c.videoId}\n  連結：${c.url}${sum}`;
}

/** 去 AI 腔統一禁用清單（與 civic 線同一份文字，改請兩邊一起改）。 */
const TONE_RULES = '【去 AI 腔·統一禁用清單，違反即改】禁破折號（——）下定義；禁「不是X，而是Y」下定義與「不僅…更/還」「不只是…而是/更是」「並非…而是」排比；禁「值得注意的是」「值得一提的是」「換句話說」；禁空泛收束（總的來說／綜上所述／總而言之／歸根結底／整體而言）；禁「真正的問題/關鍵是…」拔高與「隨著…的發展/普及」「在…的今天」開場公式；禁「至關重要/不可或缺/舉足輕重」；禁模糊引用（研究顯示／有研究指出／專家認為／學者認為／普遍認為——要嘛當下附具體可點來源、要嘛不寫）；禁模板化第一人稱開場（以「我」起句、老實說、最近有讀者/朋友…）。正向：長短句交錯、每段換開法、每段至少一個具體事實、台灣口語。';

/**
 * 組 Claude「就這一支影片 → 交叉查證 → 寫一篇事實整理」的 prompt。
 *
 * 站長 2026-07-27 拿掉「一天一篇」上限 → 協調器改為**逐支候選各喚一次**，
 * 所以這裡收單一候選、不再要模型自己挑；通不過查證 gate 就 SKIP 這一支。
 *
 * @param {object} candidate 單一候選影片
 * @param {string[]} recentTitles 近 14 天已發＋本輪已寫的標題（避免撞題）
 */
export function buildVideoPrompt(candidate, recentTitles = []) {
  const recent = recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '（近期無）';
  const today = new Date().toISOString().slice(0, 10);
  return [
    '你是 APPI News 生活線編輯。系統訂閱的 YouTube 頻道出現一支通過生活線初篩的影片。你的工作是把它當**線索**，查證後寫成**一篇**繁中（台灣用語）的事實型整理。編輯部署名、中性語氣、無個人觀點、全自動上架。',
    '',
    '【素材】以下候選由系統固定抓取 YouTube 頻道 RSS 取得（標題／描述／連結／videoId），已濾掉近 60 天看過的：',
    formatCandidate(candidate),
    '',
    '【最重要的一條：你看不到影片本身】',
    '- 本機抓不到 YouTube 逐字稿（出口 IP 被擋），你也**不要嘗試**用 yt-dlp 或去 fetch youtube.com/watch，那會失敗浪費時間。',
    '- 上面的「影片描述」是頻道自己寫的稿頭，**只能當線索**，不能當唯一事實來源。',
    '- 你要做的是：用 WebSearch／WebFetch 去找**同一件事的公開文字報導**，用那些來源把事實建立起來。',
    '',
    '【硬性 gate：查不到就不要寫】',
    '- 必須找到**至少 2 個獨立於該影片頻道的來源**（不同媒體／官方網站／店家官方資訊），且彼此事實一致。',
    '- 只找得到 0～1 個獨立來源，或各家說法互相矛盾 → 直接輸出 SKIP，換題或不寫。**寧可不寫，也不要靠單一頻道的描述改寫成一篇**（那是洗稿，不是整理）。',
    '- 影片描述裡的頻道自家連結（看新聞／APP 下載／社群）**不算**獨立來源。',
    '',
    '【這一支值不值得寫】',
    '- 該寫的是對讀者**真的有用、且查得到公開資料**的生活題：美食餐飲、旅遊景點住宿、健康養生、居家消費、育兒銀髮、在地職人與老店故事。',
    '- 不該寫就 SKIP：政治／選舉／社會案件／事故／股市／體育賽事、純活動花絮、純業配、查不到第二來源的獨家軟訊息。**機械初篩會有漏網，你是最後一道**，看到不對的題直接 SKIP，不要硬寫。',
    '- 只寫這一支，不要自己去找別的題。',
    '',
    '【寫作】',
    '- **不是逐字轉述影片**，是「以這支影片為切入點的事實整理」：這件事是什麼、為什麼現在被討論、讀者實際需要知道的資訊（地點／時間／價格／怎麼去／怎麼申辦…）、以及可延伸的背景。',
    '- **絕對不要**大段照抄影片描述或任一來源的文字；用自己的組織方式重寫，事實才是共用的。',
    '- 所有關鍵事實（金額、日期、地點、名稱、頭銜）**附 inline 超連結**指向你實際查證過的那個來源，連結必須是你真的讀過、確認可連線的網址，**不要自己編**。',
    '- 開頭一段交代這件事與讀者的關係；中間依主題分節；結尾給實用資訊，不要空泛收束。',
    `- ${TONE_RULES}`,
    '',
    '【影片出處卡（必做）】挑定影片後，跑：',
    '```',
    'node scripts/save-video-thumb.mjs --id <videoId> --slug <文章slug> --title "<影片標題>" --channel "<頻道名>"',
    '```',
    '它會把縮圖存成 `public/images/<slug>-video.webp` 並印出一段 `<figure class="video-embed">…</figure>`，**原封不動貼進文章正文**（建議放在開頭第一段之後）。指令失敗就不要硬貼、改用純文字連結標明出處。',
    '',
    '【封面】用 `node scripts/get-image.mjs --out public/covers/<slug>-cover.webp`（圖庫真實照片、主題示意，不要 --people、不要 AI 生圖）。**設了 coverImage 就一定要確認該檔真的存在**；拿不到圖就不要設 coverImage。影片縮圖**不可**拿來當封面（版權）。',
    '',
    ...renderTitleTargeting('video'),
    '',
    '【去重】近 14 天這條線已發過：',
    recent,
    '',
    `【frontmatter】category: "lifestyle"、subcategory: "life"、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate 現在；slug 用能描述主題的 kebab-case 英文（不要用 videoId、不要用日期流水號），檔名＝slug；title 講清楚這篇在講什麼、可被搜尋；description 一句話概述；tags 帶主題詞（如「美食」「米其林」「高雄」）。disclosure 揭露「線索來自 <頻道名> YouTube 影片，內容經公開資料查證整理、附原始出處」。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。`,
    RISKS_PROMPT,
    GROWTH_PROMPT,
    '',
    '【最後輸出】一行：`VIDEO_RESULT=NEW｜<slug>`（有寫）或 `VIDEO_RESULT=SKIP｜<原因>`（沒有通得過 gate 的題）。',
  ].join('\n');
}

/** 解析 Claude 輸出的 VIDEO_RESULT 行。回 {action:'new'|'skip', slug, note}。 */
export function parseVideoResult(stdout) {
  const m = String(stdout || '').match(/VIDEO_RESULT\s*=\s*(NEW|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 VIDEO_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  const raw = rest.split(/[\s｜|]/)[0] || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action: 'new', slug, note: rest };
}
