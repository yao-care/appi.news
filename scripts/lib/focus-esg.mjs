// 焦點／ESG「整理」純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/focus-esg.mjs 用它組 Claude 寫作 prompt。
//
// 決策（站長定）：焦點分類的 ESG/環境/能源/永續題「自動發佈上線」（比照國際/警消，非待審）。
// 涵蓋 6 個議題群；跟主管機關與權威來源走，連結逐條驗活，數字照官方、零杜撰。

import { RISKS_PROMPT } from "./risks-prompt.mjs";

// 6 個議題群 + 權威來源（claude 以 WebSearch/WebFetch 在這些範圍內找近期新進展）。
export const FOCUS_ESG_THEMES = [
  {
    key: '碳定價（碳費／CBAM）',
    sub: 'policy-watch',
    sources: ['環境部氣候變遷署（碳費、碳盤查、碳洩漏、自願減量）moenv.gov.tw', '歐盟執委會 CBAM', '環境部新聞稿'],
  },
  {
    key: '永續揭露／ESG／綠色金融',
    sub: 'trend-watch',
    sources: ['金管會（永續揭露、IFRS S1/S2、綠色金融行動方案、ESG 評鑑）fsc.gov.tw', '證交所／櫃買中心（永續板、公司治理評鑑）', 'ISSB／IFRS 基金會'],
  },
  {
    key: '能源轉型／電力',
    sub: 'trend-watch',
    sources: ['經濟部能源署（再生能源、能源轉型、用電大戶）moeaea.gov.tw', '台電（電網韌性、供電、儲能）taipower.com.tw', 'IEA', 'BloombergNEF（BNEF）'],
  },
  {
    key: '循環經濟',
    sub: 'policy-watch',
    sources: ['環境部資源循環署（資源循環推動法、循環經濟）', '歐盟循環經濟立法', 'UNEP 全球塑膠公約'],
  },
  {
    key: '水資源',
    sub: 'policy-watch',
    sources: ['經濟部水利署（水治理、防旱、流域韌性）wra.gov.tw', '產業用水／節水政策'],
  },
  {
    key: '氣候／國際',
    sub: 'policy-watch',
    sources: ['UNFCCC／COP', '環境部氣候變遷署（國家自定貢獻、淨零路徑）', '國發會淨零'],
  },
];

/** 組 Claude 寫作 prompt：跨 6 議題群掃近 N 天新進展 → 挑最強一則 → 事實型整理 → 自動上架（focus）。 */
export function buildFocusEsgPrompt(recentTitles = [], days = 7, strikingPages = [], topic = '') {
  const themeLines = FOCUS_ESG_THEMES
    .map((t) => `  - ${t.key}（建議子分類 ${t.sub}）：${t.sources.join('；')}`)
    .join('\n');
  const recent = recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '（近期無）';
  return [
    '你是 APPI News 焦點線編輯，專責「ESG／環境／能源／永續」。把主管機關或權威來源近期的**新進展**整理成一篇繁中（台灣用語）事實型報導，自動上架、編輯部署名、無個人觀點、中性語氣、去 AI 腔（統一禁用清單見「撰寫鐵則」）。**涉及政策數字、法規細節，零杜撰、零臆測，每條附官方/權威來源 inline 超連結並逐條查證可連線（2xx）；數字照官方原文、標單位與基準年/生效日。**',
    '',
    '【涵蓋 6 個議題群（逐一用 WebSearch/WebFetch 在來源範圍內找近期新進展，抓不到/被擋就跳過該源）】',
    themeLines,
    '',
    ...(topic ? [
      '【本次選題（已指定，不要自己找題，跳過下面的選題判準）】',
      `題目方向：${topic}`,
      '照這個方向寫一篇，仍要自己查最新、可查證的官方事實與數字，不可憑印象。',
      '',
    ] : [
      '【選題判準（依序，過不了就輸出 SKIP，不要硬擠）】',
      '',
      '**判準零：這個字到底有多少人搜？（需求量下限）**',
      '本站的病根是**贏在沒有人的地方**：GSC 90 天實測，已排到第一頁的 190 個字平均只有 6.9 次曝光，',
      '523 個字裡 86% 只有 1~5 次曝光。「排第一名」本身沒有意義，要看需求池多大。',
      '**寧可選「量大但只排到第 10 名」，不要選「量小但能排第 1 名」。**',
      '焦點台量大的方向：電價與水價（全台每戶）、稅務與補助申辦、能源與環境政策影響到誰要付多少錢。',
      '',
      '**判準一：這個字明年還有人搜嗎？**',
      '焦點打得贏，靠的是「台灣產業界得反覆查的制度代號」——耗水費、離岸風電 3-3、CBAM、161kV、碳費、',
      'IFRS 永續揭露。這類字的需求不會像事件新聞那樣過幾天就歸零。**若這題只有這週有人搜，跳過。**',
      '',
      '**判準二：先追擊已經半排名的題，再開新題。**',
      '焦點線是全站每篇曝光最高的分類（90 天 38.5／篇），瓶頸不是題不夠，而是**已經半排名的政策字沒人回頭補**。',
      strikingPages.length
        ? '下列頁面已排在第 2 頁（pos 10.5~20.5），只差深度就能進第一頁。若近期有相關新進展，優先寫一篇\n**把該題講到底**的續稿（新事實 + 制度全貌 + 影響對象 + 時程表），並在文中連回該既有頁：\n'
          + strikingPages.map((p) => `  - ${p}`).join('\n')
        : '（本次取不到 GSC 訊號，跳過這步）',
      '',
      '**判準三：沒有可追擊的，才掃 6 群的近期新進展。**',
      `只收**近 ${days} 天**內「新的、具體、可查證」的政策發布／法規上路／數據報告／重大裁罰或標準變更，`,
      '且**對台灣讀者有意義**（台灣政策，或國際規範牽動台灣產業如 CBAM、IFRS 永續揭露）。',
      '跨 6 群挑最值得寫的一則（多則相關可整併成 roundup）。避開政治（政黨/政治人物/選舉）。',
      '',
      '**判準四：這題是不是只有事件、沒有制度？**',
      '純粹「某某機關今天開了個會」而沒有可查的制度內容 → 跳過。要有讀者三個月後回來查還用得上的東西。',
      '',
    ]),
    '【標題（焦點線專用，雙軌命中）】',
    '焦點的讀者有兩種，兩種都要接得到，所以標題要同時帶「制度名」與「影響」：',
    '',
    '1. **必含制度名或官方代號**——產業界靠這個字找：耗水費、離岸風電 3-3、CBAM、資源循環推動法、碳費、161kV、IFRS 永續揭露。',
    '   代號一字不差照官方寫法（`離岸風電 3-3` 不要寫成「第三期第三階段」），因為那就是他們會打進搜尋框的字。',
    '2. **標題或 description 必須回答「誰要付多少／誰要做什麼／什麼時候生效」**——一般讀者靠這個字找。',
    '3. **不要只寫公告體**（「某某機關發布某某辦法」）。公告體只接得到第 1 種讀者，等於丟掉一半的需求。',
    '',
    '實證（本站 90 天 GSC，兩篇都在第一頁、是焦點線最好的兩篇）：',
    '- 〈用水大戶耗水費 2026 年起恢復全額徵收：每度最高 3 元、約 1300 家受影響〉',
    '  → 同時吃到 `水費漲價2026`（pos 2.8）、`水費一度`（pos 1）、`2026水費有漲價嗎`——制度名 + 具體金額 + 影響範圍。',
    '- 〈台電強韌電網計畫加速：193億元161kV電纜標案決標，目標2028年完成〉',
    '  → 吃到 `161kv`（pos 8.5）、`台電 強韌電網 計畫`——技術代號 + 金額 + 時程。',
    '',
    '【撰寫鐵則】',
    '- 嚴格基於官方/權威來源事實、不杜撰；每個事實、數字、引述都附 inline 來源超連結，逐條查證可連線（2xx 且內容支持該句）。死連結就不用該條。',
    '- 台灣讀者視角的繁中，編輯部中性語氣，去 AI 腔（統一禁用清單見下），不加個人立場/評論。',
    '- 【去 AI 腔·統一禁用清單，違反即改】禁破折號（——）下定義；禁「不是X，而是Y」下定義與「不僅…更/還」「不只是…而是/更是」「並非…而是」排比；禁「值得注意的是」「值得一提的是」「換句話說」；禁空泛收束（總的來說／綜上所述／總而言之／歸根結底／整體而言）；禁「真正的問題/關鍵是…」拔高與「隨著…的發展/普及」「在…的今天」開場公式；禁「至關重要/不可或缺/舉足輕重」；禁模糊引用（研究顯示／有研究指出／專家認為／學者認為／普遍認為——要嘛當下附具體可點來源、要嘛不寫）；禁模板化第一人稱開場（以「我」起句、老實說、最近有讀者/朋友…）。正向：長短句交錯、每段換開法、每段至少一個具體事實、台灣口語。',
    '- **封面與內文配圖**：用 `node scripts/get-image.mjs --out public/covers/<slug>-cover.webp`（圖庫真實照片，能源/工廠/太陽能/電網/環境等概念示意，不要 --people、不要 AI 生圖）；內文每段配圖同樣用 get-image.mjs。**鐵則：設了 coverImage 就一定要先確認該檔真的存在；拿不到圖就乾脆不設 coverImage，絕不要設了卻沒存到檔**（會變壞連結、整篇發不出）。',
    '',
    '【去重】比對近 30 天已推/已寫的焦點題，不要重複同一進展：',
    recent,
    '',
    '【frontmatter】category: "focus"、subcategory（依議題群選 focus 合法子分類：法規/政策→policy-watch；能源市場/數據/綠色金融趨勢→trend-watch；跨領域重大→major-issues）、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate 現在；slug 語意化英文 kebab（避免 post-NNN，檔名＝slug）；disclosure 揭露「整理自主管機關／權威來源公開資料，附原文出處」。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。',
    RISKS_PROMPT,
    '',
    '【最後輸出】一行：`FOCUS_RESULT=NEW｜<slug>`（有寫）或 `FOCUS_RESULT=SKIP｜<原因>`（無夠新夠強可查證的題）；若有寫，再附查證報告（每條超連結＋HTTP 狀態＋是否支持該句）。',
  ].join('\n');
}

/** 解析 Claude 輸出的 FOCUS_RESULT 行。回 {action:'new'|'skip', slug, note}。 */
export function parseFocusEsgResult(stdout) {
  const m = String(stdout || '').match(/FOCUS_RESULT\s*=\s*(NEW|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 FOCUS_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  // 清掉模型偶爾帶出的反引號/引號/標點，slug 只留 [a-z0-9-]（同 intl/police）。
  const raw = rest.split(/[\s｜|]/)[0] || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action: 'new', slug, note: rest };
}
