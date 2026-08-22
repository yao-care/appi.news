/**
 * 急性症狀居家處置衛教線：題目表、寫作界線與 prompt 建構。
 *
 * 為什麼要有這條線（2026-08-03）：GSC 跨窗複現訊號顯示本站最大的未吃需求在健康類
 * （髖關節疼痛群 501 曝光、中醫美顏針群 338、關節注射群 117，全部 0 點擊），但既有產線
 * 沒有一條負責健康常青題——tech-desk 會正確地跳過（不在它車道），health-days 是日期驅動。
 * 本線補這個缺口，主打「現在很不舒服、想知道當下能做什麼」這種高意圖、年年重複的題型。
 *
 * 產出狀態：**published，直接上線**。原本設計成 draft 等醫師審閱，站長 2026-08-03 表示醫師
 * 已同意，改為直接發佈。下方 BOUNDARY 的寫作界線**照舊保留**——那是內容品質控制（不做個別
 * 診斷、不給劑量、就醫警訊須前置），與發佈與否是兩件事，不要因為改成上線就順手拿掉。
 *
 * 註（踩過的坑）：`status: draft` 在本站**不會產出任何頁面**——`[slug].astro` 的
 * getStaticPaths 只涵蓋 getPublishedArticles ＋ getScheduledPreviewArticles，兩者都排除
 * draft。所以 draft 不能拿來當「給人審閱的預覽」，真要預覽得用 `status: scheduled`
 * ＋未來的 publishDate（那才會產 noindex、不進 sitemap 的預覽頁）。
 */

import { GROWTH_PROMPT } from './growth-prompt.mjs';

/**
 * 寫作界線。這段會原文進 prompt，是整條線的安全核心。
 *
 * 界線的定義來自站長與醫師諮詢時提的版本：只寫公認的居家處置共識，加上何時必須就醫；
 * 不做個別診斷、不給劑量、不暗示可以不看醫生。醫師回覆後若要收緊，改這裡一處即可。
 */
export const BOUNDARY = `【醫療界線（一票否決，違反就整篇不要寫）】
1. **只寫公認的居家處置共識**。內容限於官方衛教單位、專科醫學會、政府機關已經公開建議的做法。
   查不到這種等級的來源就不要寫那一段，寧可整篇少一節。
2. **不做個別診斷**。不可以出現「你這種情況就是 X 病」「這樣就是 Y」的句型。症狀只能用來
   分辨「這屬於可以先自己處理的範圍」還是「這要就醫」，不能用來給病名。
3. **不給藥物劑量、不建議特定藥品**。可以說「有些人會使用市售止痛藥」，不可以寫幾毫克、
   幾顆、多久一次，也不要點名商品。涉及處方藥一律只寫「由醫師評估」。
4. **不可暗示能取代就醫**。禁止「這樣就不用看醫生」「免去跑一趟」這類表述。
5. **「什麼情況要立刻就醫」必須是獨立段落，而且要放在文章前三分之一**，不可以塞到文末。
   警訊要具體（時間、程度、伴隨症狀），不要只寫「不舒服就去看醫生」。
6. **兒童、孕婦、慢性病與長期服藥者**若處置方式不同，一定要單獨點出來；不確定就寫「這幾類
   族群請先問醫師」，不要套用一般成人做法。
7. 文首與文末各一句提醒：本文為衛教整理，不能取代醫師對個別狀況的診斷與處置。`;

/**
 * 題目表。27 題，站長 2026-08-03 裁示全做。
 *
 * `caution` 有值＝該題的臨床共識近年變過或牽涉劑量／急救手法，寫作時要特別處理，
 * prompt 會把它獨立標出來。這些題最容易寫出過時做法。
 */
export const TOPICS = [
  // ── 肌肉骨骼 ──
  { key: 'leg-cramp-relief', group: '肌肉骨骼', query: '小腿抽筋 怎麼辦', title: '半夜小腿抽筋當下怎麼緩解' },
  { key: 'stiff-neck-first-day', group: '肌肉骨骼', query: '落枕 怎麼辦', title: '落枕第一天該怎麼處理' },
  { key: 'acute-low-back-48h', group: '肌肉骨骼', query: '閃到腰 冰敷 熱敷', title: '閃到腰前 48 小時該冰敷還是熱敷',
    caution: '冰熱敷的時機在復健科與運動醫學間有分歧，不要寫死單一答案，要說明各自適用時機與依據。' },
  { key: 'ankle-sprain-peace-love', group: '肌肉骨骼', query: '腳踝扭傷 處理', title: '腳踝扭傷怎麼處理：從 RICE 到 PEACE & LOVE',
    caution: '2019 年 BJSM 提出 PEACE & LOVE 取代 RICE，重點差異在不再鼓勵長時間冰敷與完全休息。務必寫出這個更新與其依據，不可只教 RICE。' },
  { key: 'doms-after-exercise', group: '肌肉骨骼', query: '運動後 肌肉痠痛', title: '運動後痠痛還能不能繼續練' },

  // ── 外傷與皮膚 ──
  { key: 'burn-first-aid-steps', group: '外傷皮膚', query: '燙傷 處理', title: '燙傷「沖脫泡蓋送」正確做法與常見錯誤',
    caution: '沖水時間、水溫、要不要泡、何時該直接送醫都有明確官方建議；冰敷與塗抹偏方是常見錯誤。以消防署／衛福部版本為準。' },
  { key: 'abrasion-wound-care', group: '外傷皮膚', query: '擦傷 傷口 照顧', title: '擦傷該不該讓它結痂' },
  { key: 'sunburn-first-24h', group: '外傷皮膚', query: '曬傷 處理', title: '曬傷後 24 小時該做與不該做的事' },
  { key: 'insect-bite-itch', group: '外傷皮膚', query: '蚊蟲叮咬 止癢', title: '蚊蟲叮咬止癢與抓破後的照護' },
  { key: 'nosebleed-correct-position', group: '外傷皮膚', query: '流鼻血 止血', title: '流鼻血怎麼止：頭往後仰是錯的',
    caution: '頭後仰是普遍流傳的錯誤做法（血流入咽喉），正確為身體前傾並壓迫鼻翼。要明確指出錯誤做法與原因。' },

  // ── 環境與體溫 ──
  { key: 'heat-illness-cooling', group: '環境體溫', query: '中暑 處理', title: '中暑與熱衰竭的現場降溫怎麼做' },
  { key: 'hypothermia-first-steps', group: '環境體溫', query: '失溫 處理', title: '失溫的初步處置與常見錯誤' },

  // ── 腸胃 ──
  { key: 'acute-diarrhea-rehydration', group: '腸胃', query: '腹瀉 補水', title: '急性腹瀉怎麼補水',
    caution: '口服補液鹽涉及配製比例，屬於劑量範疇。以 WHO／衛福部公布的標準配方陳述，並強調嬰幼兒與長者應使用市售 ORS 而非自製。' },
  { key: 'when-to-eat-after-vomiting', group: '腸胃', query: '嘔吐後 進食', title: '吐完之後什麼時候可以開始吃東西' },
  { key: 'acute-constipation-nondrug', group: '腸胃', query: '便秘 怎麼辦', title: '便秘急性期的非藥物做法' },
  { key: 'persistent-hiccups', group: '腸胃', query: '打嗝 停不下來', title: '打嗝一直停不下來怎麼辦' },

  // ── 呼吸與耳鼻喉 ──
  { key: 'sore-throat-home-relief', group: '耳鼻喉', query: '喉嚨痛 舒緩', title: '喉嚨痛的居家舒緩方式' },
  { key: 'night-cough-sleep', group: '耳鼻喉', query: '晚上咳嗽 睡不著', title: '夜間咳嗽怎麼睡得著' },
  { key: 'nasal-congestion-nondrug', group: '耳鼻喉', query: '鼻塞 怎麼辦', title: '鼻塞的非藥物處理' },
  { key: 'choking-heimlich', group: '耳鼻喉', query: '哈姆立克 怎麼做', title: '嗆到與哈姆立克：成人、幼兒與嬰兒的差別',
    caution: '急救手法示範不當有實害風險。嬰兒（未滿一歲）用背擊與胸推、不做腹部推擠；成人與幼兒手法也不同。務必分齡寫清楚，並強調先評估是否還能咳嗽、以及立即撥 119。' },

  // ── 神經與其他 ──
  { key: 'tension-headache-nondrug', group: '神經其他', query: '頭痛 舒緩 不吃藥', title: '緊縮型頭痛的非藥物處理' },
  { key: 'hyperventilation-response', group: '神經其他', query: '過度換氣 怎麼辦', title: '過度換氣當下怎麼辦',
    caution: '紙袋呼吸法已因缺氧風險與可能誤判心肌梗塞等病因而不再被建議。要寫出它為何被推翻，不可沿用。' },
  { key: 'motion-sickness', group: '神經其他', query: '暈車 怎麼辦', title: '暈車與動暈症當下怎麼緩解' },
  { key: 'period-pain-nondrug', group: '神經其他', query: '經痛 緩解', title: '經痛的非藥物緩解方式' },
  { key: 'acute-insomnia-tonight', group: '神經其他', query: '睡不著 怎麼辦', title: '整晚睡不著的當下該怎麼處理' },
  { key: 'hypoglycemia-response', group: '神經其他', query: '低血糖 處理', title: '低血糖當下怎麼處理',
    caution: '牽涉糖尿病用藥族群與意識不清時不可餵食的判斷，屬高風險。務必區分「意識清楚」與「意識不清或抽搐」兩種處置，後者一律送醫／撥 119。' },
  { key: 'eye-foreign-body', group: '神經其他', query: '眼睛 進異物', title: '眼睛進異物與隱形眼鏡卡住怎麼辦' },
];

export const GROUPS = [...new Set(TOPICS.map((t) => t.group))];

/** 依 key 取題；找不到回 null。 */
export const topicByKey = (key) => TOPICS.find((t) => t.key === key) || null;

/** 還沒寫過的題（ledger 為已完成 key 的陣列）。 */
export function pendingTopics(done = []) {
  const s = new Set(done);
  return TOPICS.filter((t) => !s.has(t.key));
}

/**
 * 組寫作 prompt。
 * @param {object} topic TOPICS 的一筆
 * @param {object} [opts]
 * @param {string[]} [opts.recentTitles] 近期已發標題（去重用）
 */
export function buildAcuteCarePrompt(topic, { recentTitles = [] } = {}) {
  const recent = recentTitles.length ? recentTitles.map((x) => `  - ${x}`).join('\n') : '（近期無）';
  return [
    '你是 APPI News 編輯部的健康衛教編輯。寫一篇繁體中文（台灣用語）的急性症狀居家處置整理。',
    '',
    `【本次題目】${topic.title}`,
    `【要吃的搜尋字】${topic.query}（主標必須含這個字的核心詞）`,
    `【分組】${topic.group}`,
    '',
    BOUNDARY,
    '',
    topic.caution
      ? `【本題特別注意（這題最容易寫錯的地方）】\n${topic.caution}\n`
      : '',
    '【結構】',
    '1. 開頭 2~3 句直接給「當下最該做的一件事」，不要暖場。',
    '2. 緊接著一節「什麼情況要立刻就醫」，具體列警訊。',
    '3. 再寫居家處置怎麼做（步驟化，每步說明為什麼）。',
    '4. 常見錯誤做法與它為什麼是錯的。',
    '5. 兒童／孕婦／慢性病或長期服藥者的差異（沒有差異就寫「沒有特別不同」，不要編）。',
    '',
    '【來源（硬性）】每個處置建議都要附 inline 來源超連結，優先順序：衛福部／疾管署／國健署／',
    '消防署等政府單位 > 台灣各專科醫學會 > 國際專科學會或系統性回顧 > 教學醫院衛教頁。',
    '用 WebFetch 逐條確認連得上（2xx）且內容真的支持那句話。附不出這個等級來源的段落一律刪掉。',
    '**禁止**引用內容農場、部落格、診所行銷文、電商賣場。',
    '',
    '【去 AI 腔·統一禁用清單】禁破折號（——）下定義；禁「不是X，而是Y」下定義與「不僅…更/還」',
    '「不只是…而是/更是」「並非…而是」排比；禁「值得注意的是」「換句話說」；禁空泛收束（總而言之／',
    '綜上所述／整體而言）；禁「真正的問題/關鍵是…」拔高與「隨著…的發展」「在…的今天」開場公式；',
    '禁「至關重要/不可或缺」；禁模糊引用（研究顯示／專家認為／普遍認為——要嘛當下附具體可點來源、',
    '要嘛不寫）；禁模板化第一人稱開場。正向：長短句交錯、每段換開法、每段至少一個具體事實。',
    '',
    '【繁中台灣用語】軟體/程式/網路/影片/數位/介面/預設；禁中國用語（軟件/程序/網絡/視頻/數字/接口/默認）。',
    '',
    '【標籤 tags】只能從 `src/config/tags.ts` 的受控詞彙表挑（先讀它），最多 8 個。挑不到就少掛，',
    '**不要自創近義詞**。表外的值會讓 build 失敗、擋住全站部署。',
    '',
    '【配圖（硬性，缺圖就整篇不發）】封面與內文每段都要圖：',
    '`node scripts/get-image.mjs --topic "<該段重點>" --context "<文章脈絡>" --query "<英文圖庫關鍵字>" --caption "<這張圖要傳達什麼>" --alt "<中文畫面描述>" --article-context "<本篇主題>" --out public/covers/<slug>-cover.webp`',
    '內文圖改 `--out public/images/<slug>-s<N>.webp`。**設了 coverImage 就一定要先確認該檔真的存在**。',
    '',
    `【frontmatter】category: "health"、author: "appi-editorial"、contentType: "guide"、sourceType: "editorial"、`,
    `disclaimerType: "medical"、status: "published"、`,
    `slug: "${topic.key}"、publishDate 現在。寫入 src/content/articles/${topic.key}.md，`,
    '**不要 git add/commit/push**（外層處理）。',
    '',
    GROWTH_PROMPT,
    '',
    '【去重】不要重複下列近期已發的題：',
    recent,
    '',
    '【最後輸出】一行：`ACUTE_RESULT=NEW｜<slug>` （有寫）或 `ACUTE_RESULT=SKIP｜<原因>`（查不到足夠',
    '等級的來源、或本題在上面的醫療界線下不該由媒體寫）。若有寫，再附查證報告（每條超連結＋HTTP 狀態）。',
  ]
    .filter(Boolean)
    .join('\n');
}

/** 解析 ACUTE_RESULT 行。回 {action:'new'|'skip', slug, note, infra?}。 */
import { parseSentinelResult } from './claude-cli.mjs';

// 哨兵解析正本＝lib/claude-cli.mjs parseSentinelResult。它的 slug 清洗（只留 [a-z0-9-]）
// 已涵蓋下方 cleanSlug 擋的反引號/粗體案（2026-08-03），cleanSlug 留著給既有呼叫端。
export function parseAcuteCareResult(stdout) {
  return parseSentinelResult(stdout, 'ACUTE');
}

/**
 * 洗掉模型在 slug 外面包的 markdown 裝飾。
 *
 * 2026-08-03 實測：首批 11 題有 4 題「失敗」，其實稿子都寫好了，是這裡沒洗乾淨——
 * 模型寫成 `ACUTE_RESULT=NEW｜`acute-low-back-48h`` 或 `**doms-after-exercise**`，
 * 反引號與星號被當成 slug 的一部分，後續 join 出來的路徑不存在，整篇被判定「缺圖檔」剔除。
 * 剔除時的 rmSync 也指向那個錯路徑，稿子才僥倖沒被刪。**寧可洗過頭也不要漏**：
 * slug 只可能是小寫英數與連字號。
 */
export function cleanSlug(raw) {
  return String(raw || '')
    .trim()
    .replace(/^[`*_"'「『（(\[]+/, '')
    .replace(/[`*_"'」』）)\]]+$/, '')
    .trim();
}
