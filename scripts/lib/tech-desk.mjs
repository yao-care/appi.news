/**
 * 科技台寫作 prompt（兩條 track，共用同一套選題判準）。
 *
 * 為什麼要有這支：tech 原本只有 `tech-radar`（產候選 → Slack 按鈕 → 人挑 → newsroom-write），
 * 沒有自動產文線；焦點有 `focus-esg.mjs`。本檔補上科技的自動線，並把選題判準寫死在 prompt 裡。
 *
 * 選題判準的由來（GSC 90 天實證，見 docs/lessons/query-targeting-event-vs-concept.md）：
 * tech 有 93 篇進索引、多在 pos 4~10（第一頁），每篇卻只有 13.8 曝光——因為標題瞄準
 * `figure 03 bmw`（11 次）、`fable 5`（3 次）這種事件過就歸零的專有名詞。同期全類曝光第一名
 * 是唯一一篇「是什麼＋運作原理」的概念解釋文（Passkey，177 次），差 16 倍。
 *
 * 兩條 track 的分工（站長指定）：
 * - `editorial`（APPI 編輯部）：事實型概念解釋。中性語氣、無個人觀點，寫「X 是什麼／怎麼運作／
 *   台灣現況」。這是 Passkey 那篇被驗證有效的形狀。
 * - `lightman`（張饒輝）：AI×健康的觀點文，掛《AI 醫療現場》專欄。有第一人稱判斷與本業經驗，
 *   走的是本站唯一有真實資歷、且對手不寫的窄車道。
 */

import { RISKS_PROMPT } from "./risks-prompt.mjs";
import { GROWTH_PROMPT } from "./growth-prompt.mjs";
import { EXPERT_NOTE_PROMPT } from "./expert-note-prompt.mjs";

/** 兩條 track 的設定。key 即 --track 參數值。 */
export const TECH_TRACKS = {
  editorial: {
    author: 'appi-editorial',
    label: 'APPI 編輯部｜概念解釋',
    contentType: 'analysis',
    sourceType: 'wire',
    column: null,
    voice:
      '編輯部中性語氣、事實型、**不加個人立場或第一人稱評論**。目標是把一個概念講到讀者查一次就懂：' +
      '它是什麼、怎麼運作、台灣現在到哪、一般人／企業該注意什麼。',
    topicScope:
      'AI／資安／數位工具／半導體／科技政策裡，**有長期查詢需求的「概念」**。' +
      '優先 AI×健康交叉（醫療 AI、數位健康、健康資料、醫材法規），其次才是泛科技概念。',
  },
  lightman: {
    author: 'lightman',
    label: '張饒輝｜AI 醫療現場',
    contentType: 'column',
    sourceType: 'author',
    column: 'ai-healthcare',
    voice:
      '張饒輝的第一人稱專欄聲音：有明確判斷與取捨，帶得出產品設計／醫療資訊整合（FHIR、健保資料、' +
      '臨床導入）的本業經驗。**可以有立場，但每個事實仍要有可查證來源**。不寫空泛感想。',
    topicScope:
      '**只寫 AI×健康**：醫療 AI 落地與臨床導入、數位健康／長照科技、TFDA/FDA 醫材法規、' +
      '健康資料/EHR/FHIR、AI 醫療的信任與責任分配。離開這條車道就不要寫。',
  },
};

/** 共用選題判準（兩條 track 都套）。 */
function selectionCriteria(striking, demand, evergreen, directedTopic) {
  if (directedTopic) {
    return [
      '【本次選題（已指定，不要自己找題）】',
      `題目方向：${directedTopic}`,
      '照這個方向寫一篇。仍要自己查最新、可查證的事實與數字，不可憑印象。',
      '',
    ];
  }
  return [
    '【選題判準（依序，過不了就不要寫）】',
    '',
    '**判準零：這個字到底有多少人搜？（需求量下限，最容易被忽略的一條）**',
    '本站的病根不是排不上去，是**贏在沒有人的地方**：GSC 90 天實測，已經排到第一頁的 190 個字，',
    '平均每個字只有 6.9 次曝光；523 個字裡 86% 只有 1~5 次曝光。換句話說「排第一名」本身沒有意義，',
    '要看那個字的需求池有多大。**選題前先估量**：這個字是全台幾十萬人一年會搜一次的題（節慶、電價、',
    '疫情、開學、稅務），還是只有幾百人搜的窄題？寧可選「量大但只能排到第 10 名」，',
    '也不要選「量小但能排第 1 名」——後者是本站現在的處境，190 個第一頁只換到 1,306 次曝光。',
    '判斷方法：想想這題有沒有整批內容農場／電商／人力銀行在搶（有＝量大），',
    '以及它是不是每年固定會被搜的生活剛需。',
    '',
    '**判準一：這個題三個月後還有人搜嗎？**',
    '這是唯一一條一票否決的規則。實測資料：本站瞄準事件型專有名詞的文章，排名都很好（pos 4~10）',
    '卻幾乎沒有曝光——`figure 03 bmw` 90 天 11 次、`fable 5` 三次、`work iq` 兩次，因為事件過了就沒人搜。',
    '而唯一一篇「是什麼＋運作原理」的概念文拿到 177 次，是全類第一名。**答不出「三個月後還有人搜」就換題。**',
    '',
    evergreen.length
      ? '**這條判準現在有實測答案，不必再靠猜。** 下列字是把近幾個月切成數個時間窗後，**每個窗都有人搜**的\n' +
        '字（單一窗爆量的事件字已被剔除）。它們就是「三個月後還有人搜」的實證清單：\n' +
        evergreen.map((q) => `  - ${q}`).join('\n') +
        '\n\n  讀法：`pos` 很差（>40）**不是壞消息**，是「有需求但本站還沒吃到」——升級空間最大的位置。\n' +
        '  同判準三，這份清單是**全站**的，只挑落在你「題材範圍」內的，其餘留給別條產線。'
      : '（本次取不到常青訊號，判準一改用自行判斷）',
    '',
    '**判準二：先追擊已經半排名的題，再開新題。**',
    striking.length
      ? '下列頁面已排在第 2 頁（pos 10.5~20.5），只差深度就進第一頁。若能就其中一題寫出「把概念講到底」\n的深度稿（不是再報一次新聞），優先寫它，並在文中連回該既有頁：\n' +
        striking.map((p) => `  - ${p}`).join('\n')
      : '（本次取不到 GSC 訊號，跳過這步）',
    '',
    '**判準三：讀者實際在搜、本站還沒吃到的字。**',
    demand.length
      ? '下列 query 有真實曝光但本站沒拿到點擊，是實證有需求的題目來源（命中的話直接就是合格的 targetQuery）。\n' +
        '⚠️ 這份清單是**全站**的（GSC 的 query 維度沒有分類），裡面多數屬健康／焦點台。\n' +
        '**只挑落在你上面「題材範圍」內的**，其餘一律略過，不要為了用這份清單而寫出車道外的題：\n' +
        demand.map((q) => `  - ${q}`).join('\n')
      : '（本次取不到 GSC 訊號，跳過這步）',
    '',
    '**判準四：這條賽道有沒有被巨頭壟斷？**',
    '若該題的 Google 第一頁已被 iThome／科技新報／Bloomberg／官方 blog 佔滿，本站排不上，換題。',
    '挑他們不會寫或寫不深的角度（台灣落地細節、跨領域交叉、法規實務）。',
    '',
    '> 自問：「這題明天每家科技媒體都會報嗎？」會 → 丟。「三個月後還有人會搜這個概念嗎？」會 → 收。',
    '',
  ];
}

/**
 * 組科技台寫作 prompt。
 * @param {object} o
 * @param {'editorial'|'lightman'} o.track
 * @param {string[]} o.recentTitles 近期已發標題（去重）
 * @param {string[]} o.striking    差一步的 tech 頁（pageOpportunities）
 * @param {string[]} o.demand      有需求沒吃到的 query（searchDemandTopics）
 * @param {string[]} o.evergreen   跨時間窗都複現的常青需求 query（evergreenDemandTopics）
 * @param {string}  [o.topic]      指定題目（有值時跳過自動選題）
 */
export function buildTechDeskPrompt({ track, recentTitles = [], striking = [], demand = [], evergreen = [], topic = '' }) {
  const t = TECH_TRACKS[track];
  if (!t) throw new Error(`未知的 track：${track}`);
  const recent = recentTitles.length ? recentTitles.map((x) => `  - ${x}`).join('\n') : '（近期無）';

  return [
    `你是 APPI News 科技台的「${t.label}」。寫一篇繁體中文（台灣用語）科技稿，自動上架。`,
    '',
    `【聲音與角色】${t.voice}`,
    `【題材範圍】${t.topicScope}`,
    '',
    ...selectionCriteria(striking, demand, evergreen, topic),
    '【標題鐵則（一票否決，寫完自己回頭檢查一次）】',
    '1. 先決定這篇要吃哪個字（`targetQuery`），**那個字不能只由專有名詞組成**（產品名／公司名／型號／版本號）。',
    '   要是概念詞或問題：`人形機器人 產線`、`ai asic`、`ai 模型 選型`、`passkey 原理`、`fhir 是什麼`。',
    '2. **主標必須含那個字的核心詞**。事件可以寫進副標或第一段當引子，主標不行。',
    '3. 反例與改法（同一題材、同一批素材，只換瞄準點）：',
    '   ✗〈Figure 03 量產達每小時一台、BMW 組裝逾 3 萬輛〉→ 吃到 `figure 03 bmw`（11 次，會歸零）',
    '   ✓〈人形機器人真的能上產線了嗎？現在做得到與做不到的事〉→ 吃到 `人形機器人 產線`（長期）',
    '   ✗〈SK 海力士砸 19 兆韓元蓋封裝廠綁台積電做 HBM4〉',
    '   ✓〈HBM4 為什麼把戰場推到封裝？〉',
    '4. 標題不要用破折號分隔，不要「不僅…更…」這類句式。',
    '',
    '【撰寫鐵則】',
    '- **開頭結論前置**：第一段前 2~3 句就給可獨立成立的結論句，直接回答標題的問題。不要暖場、不要背景鋪陳。',
    '- 每個事實、數字、研究、引述都附 **inline 來源超連結**，並用 WebFetch 逐條確認連得上（2xx）且內容真的支持那句。死連結就不用該條。附不出可驗證來源的不准寫。',
    '- 結構用 H2/H3 分段，概念題要有「是什麼 → 怎麼運作 → 台灣現況 → 該注意什麼」的骨架。',
    '- 繁中台灣用語（軟體/程式/網路/演算法/人工智慧/影片/數位/介面/預設），禁中國用語（軟件/程序/網絡/算法/人工智能/視頻/數字/接口/默認）。標題、正文、frontmatter 皆檢查。',
    '- 【去 AI 腔·統一禁用清單，違反即改】禁破折號（——）下定義；禁「不是X，而是Y」下定義與「不僅…更/還」「不只是…而是/更是」「並非…而是」排比；禁「值得注意的是」「值得一提的是」「換句話說」；禁空泛收束（總的來說／綜上所述／總而言之／歸根結底／整體而言）；禁「真正的問題/關鍵是…」拔高與「隨著…的發展/普及」「在…的今天」開場公式；禁「至關重要/不可或缺/舉足輕重」；禁模糊引用（研究顯示／有研究指出／專家認為／學者認為／普遍認為——要嘛當下附具體可點來源、要嘛不寫）；禁模板化第一人稱開場（以「我」起句、老實說、最近有讀者/朋友…）。正向：長短句交錯、每段換開法、每段至少一個具體事實、台灣口語。',
    '- **資安題只寫「揭露／修補／法規／產業影響」層級**，不研究也不描寫任何攻擊手法（碰觸攻擊向細節會讓整批請求被內容政策擋掉）。',
    '- 避開政治（政黨／政治人物／選舉／人事）。',
    '',
    '【標籤 tags】只能從 `src/config/tags.ts` 的受控詞彙表挑（先讀它），最多 8 個。挑不到貼切的就少掛，**不要自創近義詞、不要填人名／產品型號**。表外的值會讓 build 失敗、擋住全站部署。',
    '',
    '【配圖（硬性，缺圖就整篇不發）】封面與內文每段都要圖：',
    '`node scripts/get-image.mjs --topic "<該段重點>" --context "<文章脈絡>" --query "<英文圖庫關鍵字>" --caption "<這張圖要傳達什麼>" --alt "<中文畫面描述>" --article-context "<本篇主題>" --out public/covers/<slug>-cover.webp`',
    '內文圖改 `--out public/images/<slug>-s<N>.webp`。**設了 coverImage 就一定要先確認該檔真的存在**；拿不到圖就不要設 coverImage。',
    '',
    `【frontmatter】category: "tech"、subcategory（合法 tech slug：ai / security / digital-tools / software-products / startup / semiconductor / industry-tech / tech-policy）、author: "${t.author}"、contentType: "${t.contentType}"、sourceType: "${t.sourceType}"${t.column ? `、column: "${t.column}"` : ''}、status: "published"、publishDate 現在；slug 語意化英文 kebab（避免 post-NNN，檔名＝slug）。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。`,
    RISKS_PROMPT,
    GROWTH_PROMPT,
    EXPERT_NOTE_PROMPT,
    '',
    '【去重】不要重複下列近期已發的題：',
    recent,
    '',
    '【最後輸出】一行：`TECH_RESULT=NEW｜<slug>｜<targetQuery>`（有寫）或 `TECH_RESULT=SKIP｜<原因>`（沒有過得了判準的題）。若有寫，再附查證報告（每條超連結＋HTTP 狀態＋是否支持該句）。',
  ].join('\n');
}

/** 解析 TECH_RESULT 行。回 {action:'new'|'skip', slug, targetQuery, note, infra?}。 */
export function parseTechDeskResult(stdout) {
  const m = String(stdout || '').match(/TECH_RESULT\s*=\s*(NEW|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 TECH_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  const parts = rest.split(/[｜|]/).map((x) => x.trim());
  const slug = (parts[0] || '').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action: 'new', slug, targetQuery: parts[1] || '', note: rest };
}
