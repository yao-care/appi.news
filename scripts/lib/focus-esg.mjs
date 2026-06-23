// 焦點／ESG「整理」純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/focus-esg.mjs 用它組 Claude 寫作 prompt。
//
// 決策（站長定）：焦點分類的 ESG/環境/能源/永續題「自動發佈上線」（比照國際/警消，非待審）。
// 涵蓋 6 個議題群；跟主管機關與權威來源走，連結逐條驗活，數字照官方、零杜撰。

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
export function buildFocusEsgPrompt(recentTitles = [], days = 7) {
  const themeLines = FOCUS_ESG_THEMES
    .map((t) => `  - ${t.key}（建議子分類 ${t.sub}）：${t.sources.join('；')}`)
    .join('\n');
  const recent = recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '（近期無）';
  return [
    '你是 APPI News 焦點線編輯，專責「ESG／環境／能源／永續」。把主管機關或權威來源近期的**新進展**整理成一篇繁中（台灣用語）事實型報導，自動上架、編輯部署名、無個人觀點、中性語氣、去 AI 腔。**涉及政策數字、法規細節，零杜撰、零臆測，每條附官方/權威來源 inline 超連結並逐條查證可連線（2xx）；數字照官方原文、標單位與基準年/生效日。**',
    '',
    '【涵蓋 6 個議題群（逐一用 WebSearch/WebFetch 在來源範圍內找近期新進展，抓不到/被擋就跳過該源）】',
    themeLines,
    '',
    '【挑選】',
    `- 只收**近 ${days} 天**內「新的、具體、可查證」的政策發布／法規上路／數據報告／重大裁罰或標準變更，且**對台灣讀者有意義**（台灣政策，或國際規範牽動台灣產業如 CBAM、IFRS 永續揭露）。`,
    '- **跨 6 群挑出最值得寫的「一則」**（多則相關可整併成一篇 roundup）。寧缺勿濫：掃完若沒有夠新夠強、可查證的題 → 直接輸出 SKIP、不要硬擠。避開政治（政黨/政治人物/選舉）。',
    '',
    '【撰寫鐵則】',
    '- 嚴格基於官方/權威來源事實、不杜撰；每個事實、數字、引述都附 inline 來源超連結，逐條查證可連線（2xx 且內容支持該句）。死連結就不用該條。',
    '- 台灣讀者視角的繁中，編輯部中性語氣，去 AI 腔，不加個人立場/評論。',
    '- **封面與內文配圖**：用 `node scripts/get-image.mjs --out public/covers/<slug>-cover.webp`（圖庫真實照片，能源/工廠/太陽能/電網/環境等概念示意，不要 --people、不要 AI 生圖）；內文每段配圖同樣用 get-image.mjs。**鐵則：設了 coverImage 就一定要先確認該檔真的存在；拿不到圖就乾脆不設 coverImage，絕不要設了卻沒存到檔**（會變壞連結、整篇發不出）。',
    '',
    '【去重】比對近 30 天已推/已寫的焦點題，不要重複同一進展：',
    recent,
    '',
    '【frontmatter】category: "focus"、subcategory（依議題群選 focus 合法子分類：法規/政策→policy-watch；能源市場/數據/綠色金融趨勢→trend-watch；跨領域重大→major-issues）、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate 現在；slug 語意化英文 kebab（避免 post-NNN，檔名＝slug）；disclosure 揭露「整理自主管機關／權威來源公開資料，附原文出處」。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。',
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
