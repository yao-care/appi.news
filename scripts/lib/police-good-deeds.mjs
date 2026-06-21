// 警消好人好事「整理」純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/police-good-deeds.mjs 用它組 Claude 寫作 prompt。
//
// 決策（站長定）：全自動上架、跟著官方公開新聞稿走（員警照原稿具名、民眾比照原稿揭露、
// 不轉載版權照片、連結逐條驗活）。來源＝各縣市警察局官方新聞稿；抓不到的當次略過（可接受）。
// 完整來源狀態見 docs/police-good-deeds-sources.md。

// 主力來源（境外機房實測可達者優先；其餘仍會嘗試、抓不到就跳過）。
// 標 priority 的是好人好事最現成的專欄/頻道。
export const POLICE_SOURCES = [
  { area: '高雄市', url: 'https://kcpd.kcg.gov.tw/News.aspx?n=3FAEF3DDE4DD3CD0&sms=4ED7718667AAD9B5', priority: true, note: '獨立「好人好事」頻道' },
  { area: '宜蘭縣', url: 'https://www.ilcpb.gov.tw/News.aspx?n=16343&sms=16080', priority: true, note: '「警馨錄」專欄' },
  { area: '屏東縣', url: 'https://www.pthg.gov.tw/pcpb/News.aspx?n=A58BECEB18B19997&sms=B37B36F2CFEB3E64&CategorySN=3404', priority: true },
  { area: '臺北市', url: 'https://police.gov.taipei/News.aspx?n=72544237BBE4C5F6&sms=72D5A0387A14CF52' },
  { area: '臺南市', url: 'https://www.tnpd.gov.tw/News/a71f1b44-1f96-8a48-caa5-fe08e13047ee/1' },
  { area: '南投縣', url: 'https://www.ncpd.gov.tw/latestevent/index.aspx?Parser=9,4,36' },
  { area: '新竹縣', url: 'https://www.hchpb.gov.tw/' },
  { area: '連江縣', url: 'https://www.lchpd.gov.tw/Chhtml/news/2666' },
  { area: '金門縣', url: 'https://kpb.kinmen.gov.tw/News.aspx?n=67F346BB9C4B0172&sms=A2C62D68901B977C', note: '須處理 TLS 中繼憑證' },
  { area: '新北市', url: 'https://www.police.ntpc.gov.tw/np-3344-1.html' },
  { area: '新竹市', url: 'https://www.hccp.gov.tw/ch/home.jsp?id=23&parentpath=0' },
  { area: '彰化縣', url: 'https://www.chpb.gov.tw/Announcement/C002100' },
  { area: '雲林縣', url: 'https://ylhpb.yunlin.gov.tw/News.aspx?n=31001&sms=22245' },
  { area: '臺東縣', url: 'https://www.ttcpb.gov.tw/chinese/index.jsp', note: '須偽裝瀏覽器 UA' },
];

/** 組 Claude 寫作 prompt：掃來源 → 挑近 N 天好人好事 → 跟原稿具名寫 roundup → 自動上架。 */
export function buildPolicePrompt(recentTitles = [], days = 7) {
  const srcLines = POLICE_SOURCES.map((s) => `  - ${s.area}：${s.url}${s.note ? `（${s.note}）` : ''}${s.priority ? ' ★好人好事最多' : ''}`).join('\n');
  const recent = recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '（近期無）';
  return [
    '你是 APPI News 生活線編輯，把台灣各地警察的「好人好事」整理成一篇繁中（台灣用語）暖聞，給讀者看。全自動上架、編輯部署名、無個人觀點。',
    '',
    '【來源（逐一 WebFetch 官方新聞稿索引，抓不到/逾時/被擋就跳過該家，不要卡住）】',
    srcLines,
    '（以上是主力；金門需容忍 TLS、臺東需偽裝瀏覽器 UA。抓不到的當次略過可接受。）',
    '',
    '【挑選】',
    `- 只收**近 ${days} 天**的**好人好事**：協助/救援/尋人尋親、拾金不昧、助弱扶老、暖心義舉、阻詐善後等。`,
    '- **排除**：純執法查緝、車禍刑案、防詐宣導、統計週報、長官致詞/表揚大會流水帳。',
    '- 跨縣市挑 5–8 則有代表性的；地區盡量分散。',
    '',
    '【撰寫鐵則（跟著官方原稿走）】',
    '- **員警照原稿具名**（這是公開表揚、官方已對外公布）；**民眾比照原稿的揭露程度**（原稿匿名就匿名、具名就具名），不自行加碼也不自行刪改事實。',
    '- 嚴格基於官方新聞稿事實、不杜撰；**每則附該則官方新聞稿的 inline 超連結**，且逐條查證可連線（2xx）。死連結就不收該則。',
    '- 繁中台灣用語、去 AI 腔、編輯部中性語氣、不加個人評論。',
    '- **不要轉載官方頁或 FB 的版權照片**；封面用 `node scripts/get-image.mjs`（圖庫真實照片，警民互助/警車等示意，不要 --people、不要 AI 生圖）；圖庫拿不到就不配封面也可（暖聞 roundup 可無封面）。',
    '',
    '【去重】比對近 30 天已發的好人好事整理，不要重複同一事件：',
    recent,
    '',
    '【frontmatter】category: "lifestyle"、subcategory: "life"、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate 現在；slug 語意化英文 kebab（如 police-good-deeds-2026-06-21，避免 post-NNN，檔名＝slug）；disclosure 揭露「整理自各地警察局公開新聞稿、附原文出處」。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。',
    '',
    '【最後輸出】一行：`POLICE_RESULT=NEW｜<slug>`（有寫）或 `POLICE_RESULT=SKIP｜<原因>`（各家都抓不到、或近 N 天無合格好人好事）；若有寫，再附查證報告（每條超連結＋HTTP 狀態）。',
  ].join('\n');
}

/** 解析 Claude 輸出的 POLICE_RESULT 行。回 {action:'new'|'skip', slug, note}。 */
export function parsePoliceResult(stdout) {
  const m = String(stdout || '').match(/POLICE_RESULT\s*=\s*(NEW|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 POLICE_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  return { action: 'new', slug: rest.split(/[\s｜|]/)[0] || null, note: rest };
}
