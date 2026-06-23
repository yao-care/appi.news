// 國際編譯台「撰寫指令」純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/international-write.mjs 用它對每則選到的熱題組 Claude 寫作 prompt。
//
// 規則全部來自與站長談定的國際線規格：
//   - 來源 GDELT 選題（已初篩熱門）；寫作以「實際讀原文」為準。
//   - 嚴格基於事實、繁中台灣讀者視角、每條附原文超連結、不杜撰、編輯部中性語氣（無個人觀點）。
//   - 品質關：農場/論壇/促銷/清單/節目評論等非新聞 → 跳過（輸出 SKIP）。
//   - 地理/主題以原文為準：GDELT 分區只是初篩，標錯就重新歸區或跳過。
//   - 圖片：可授權原圖（跨同事件多篇找）→ 圖庫真實照片 → 都沒有就跳過（不用 AI 假圖）。
//   - 去重/更新（故事線）：同一進行中事件已寫過且有新進展 → 更新原文；無進展 → 跳過；全新 → 新文。
//   - 全自動上架（status: published），編輯部署名。

const SUBCATS = ['global-focus', 'asia', 'americas', 'europe', 'middle-east', 'global-trends', 'cross-strait', 'international-organizations'];

/** GDELT 分區 → 預設 international 子分類（寫作可依實際內容覆寫）。 */
const REGION_SUBCAT = {
  東亞: 'asia',
  東南亞與南亞: 'asia',
  中東: 'middle-east',
  非洲: 'global-focus',
  歐洲: 'europe',
  北美: 'americas',
  拉美: 'americas',
  大洋洲: 'global-focus',
};

export function defaultSubcategory(region) {
  return REGION_SUBCAT[region] || 'global-focus';
}

/**
 * 組單則熱題的 Claude 寫作 prompt。
 * @param {object} story  {region, sourceUrl, numArticles, numSources, fullName}
 * @param {Array}  recentActive  近 30 天「進行中」國際文 [{slug,title,updatedDate}]，給去重/更新比對
 */
export function buildIntlPrompt(story, recentActive = []) {
  const recent = recentActive.length
    ? recentActive.map((a) => `- [${a.slug}] ${a.title}${a.updatedDate ? `（最後更新 ${a.updatedDate}）` : ''}`).join('\n')
    : '（近 30 天無進行中國際文）';
  const subcat = defaultSubcategory(story.region);
  return [
    '你是 APPI News 的國際編譯，把一則國際熱門新聞用繁體中文（台灣用語）寫給台灣讀者看。全自動上架，編輯部署名、無個人觀點。',
    '',
    '【這則熱題（來自 GDELT 初篩，地點僅供參考）】',
    `- GDELT 粗分區：${story.region}（標的地點：${story.fullName}）`,
    `- 熱度：被 ${story.numSources} 家來源、${story.numArticles} 篇報導`,
    `- 代表原文：${story.sourceUrl}`,
    '',
    '【步驟】',
    '1. WebFetch 讀代表原文；再找 2–3 篇報導同一事件的其他來源交叉查證（同一事件多篇＝也是多個可授權圖片來源）。',
    '2. **品質關（從嚴）**：若代表原文其實是內容農場、論壇貼文、促銷/廣編、清單文、節目/影評、與國際新聞無關者 → **不要寫**，只輸出一行 `INTL_RESULT=SKIP｜<原因>` 後結束。',
    '3. **地理/主題以實際內容為準**：GDELT 可能標錯地點。依原文判斷真正的國家/地區，挑正確的 international 子分類（可選：' + SUBCATS.join(' / ') + '）。若內容根本不屬國際新聞 → 同 2 輸出 SKIP。',
    '4. **去重/更新（故事線）**：比對下方「近 30 天進行中國際文」清單：',
    '   - 同一進行中事件、且這次有**新進展** → **更新模式**：改寫那篇（保留 slug 與原始 publishDate、更新 updatedDate；頂部「事件概要」更新到最新、下方「更新時間軸」逆時序加一條「（更新 YYYY-MM-DD：…）」＋新來源連結）。輸出 `INTL_RESULT=UPDATE｜<slug>`。',
    '   - 同一事件但**無新進展** → 輸出 `INTL_RESULT=SKIP｜已寫過且無新進展` 結束。',
    '   - 全新事件 → 寫新文。輸出 `INTL_RESULT=NEW｜<slug>`。',
    '5. **撰寫（新文或更新）**：',
    '   - 嚴格基於事實、不杜撰；每個事實、數字、引述都附 inline 來源超連結，且逐條查證可連線（2xx 且內容支持該句）。',
    '   - 台灣讀者視角的繁中，編輯部中性語氣，去 AI 腔；**不要加入個人觀點/立場**。',
    `   - frontmatter：category: "international"、subcategory（你依內容判定）、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate: 現在（更新模式則保留原 publishDate、設 updatedDate 為現在），disclosure 揭露「以 AI 編譯、附原文出處」。`,
    '6. **封面圖＝動筆前的前置關卡（鐵則：不用 AI 生圖；先過這關才准寫內文）**：**動筆寫內文之前，先取得封面圖**——用 `node scripts/get-image.mjs --embed-url <圖URL> --credit "<署名>" --page-url <來源頁> --out public/covers/<slug>-cover.webp` 嵌入**可授權**原圖（跨同事件多篇找：白名單來源見 image-sources.mjs；外媒原圖會被拒）；找不到可授權原圖就改用 `node scripts/get-image.mjs --out public/covers/<slug>-cover.webp`（圖庫真實照片，不要 --people、不要 AI）。**封面圖拿不到（指令非零或檔案沒生出來）→ 立刻輸出 `INTL_RESULT=SKIP｜無可授權封面圖` 結束，不要寫文章（不要只設 coverImage 卻沒有真的存到檔）。** 封面到手後才寫內文；frontmatter `coverImage: "covers/<slug>-cover.webp"`（mode:stock 時把 credit 寫進 `coverImageCredit`）；內文配圖同樣用 get-image.mjs（圖庫真實照片）。',
    '7. **slug/檔名**：新文用語意化英文 kebab slug（例 uk-rejoin-eu-march），**檔名＝frontmatter slug＝INTL_RESULT 回報的 slug，三者一致；不要用 post-NNN**。寫入/更新 src/content/articles/<slug>.md。**不要 git add/commit/push**（外層處理）。',
    '',
    '【近 30 天進行中國際文（去重/更新比對用）】',
    recent,
    '',
    '【最後輸出】先一行 `INTL_RESULT=NEW｜<slug>` 或 `UPDATE｜<slug>` 或 `SKIP｜<原因>`；若有寫作，再附查證報告（每條超連結 + HTTP 狀態 + 是否支持該句）。',
    `（預設子分類建議 ${subcat}，但以你判定為準。）`,
  ].join('\n');
}

/** 解析 Claude 輸出的 INTL_RESULT 行。回 {action:'new'|'update'|'skip', slug, note}。 */
export function parseIntlResult(stdout) {
  const m = String(stdout || '').match(/INTL_RESULT\s*=\s*(NEW|UPDATE|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 INTL_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  // NEW/UPDATE 後面是 slug；清掉模型偶爾帶出的反引號/引號/標點（曾見 `uk-starmer-resigns``），
  // 只留合法 slug 字元（小寫英數與連字號），避免產出壞 URL／壞資料夾名。
  const raw = rest.split(/[\s｜|]/)[0] || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action, slug, note: rest };
}
