// 警消好人好事「寫作」純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/lifestyle-police.mjs 先用 ./police-fetch.mjs 固定抓好候選清單（零 LLM），
// 再用本檔的 buildPolicePrompt 組「只挑選＋寫作」的 prompt 給 Claude。
//
// 決策（站長定）：全自動上架、跟著官方公開新聞稿走（員警照原稿具名、民眾比照原稿揭露、
// 不轉載版權照片、連結逐條驗活）。抓取＝固定程式（見 police-fetch.mjs），LLM 不再自己上網抓。
//
// 重構脈絡：原本整段抓取交給 LLM agent（WebFetch 逐站抓、還自己翻第二頁重抓），既慢又燒
// session 額度、凌晨多線疊加撞 rate limit hang→timeout(exit124)。改成「固定抓→LLM 只寫」。

// 站點清單保留供測試/文件參考；實際運行的站配置在 ./police-fetch.mjs 的 POLICE_SITES。
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

/** 把固定抓好的候選清單格式化成 prompt 內的素材區塊。 */
function formatCandidates(candidates = []) {
  if (!candidates.length) return '（無候選）';
  return candidates
    .map((c, i) => {
      const date = c.date ? `（${c.date}）` : '';
      const sum = c.summary ? `\n     摘要：${c.summary}` : '';
      return `  ${i + 1}. [${c.area}]${date} ${c.title}\n     連結：${c.url}${sum}`;
    })
    .join('\n');
}

/**
 * 組 Claude「只挑選＋寫作」prompt。抓取已由 police-fetch 固定完成，這裡不叫 LLM 上網。
 * @param {Array<{area,title,url,date,summary}>} candidates 已抓好＋已驗證的候選清單
 * @param {string[]} recentTitles 近 30 天已發標題（去重）
 * @param {number} days 收錄天數（僅用於文案說明）
 */
export function buildPolicePrompt(candidates = [], recentTitles = [], days = 7) {
  const recent = recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '（近期無）';
  return [
    '你是 APPI News 生活線編輯，把台灣各地警察的「好人好事」整理成一篇繁中（台灣用語）暖聞，給讀者看。全自動上架、編輯部署名、無個人觀點。',
    '',
    `【素材】以下是系統已從各地警局官網「固定抓取並逐條驗證連結可連」的近 ${days} 天好人好事候選（已幫你初篩、附區域／連結／日期／摘要）。你的工作是**挑選＋寫作**，**不需要、也不要自己上網抓取、WebFetch 或翻頁**——所有事實與連結都用下面提供的：`,
    formatCandidates(candidates),
    '',
    '【挑選】',
    '- 從上面候選挑 5–8 則有代表性、地區盡量分散的，整理成一篇 roundup。',
    '- 若合適的候選不足 5 則，就用現有的寫（有幾則寫幾則）；若完全沒有像樣的好人好事，輸出 SKIP。',
    '- 明顯不是好人好事的（純執法、宣導、流水帳）不要選。',
    '',
    '【撰寫鐵則（跟著提供的素材走）】',
    '- 嚴格基於提供的標題與摘要事實、**不杜撰**；每則附上面**提供的官方新聞稿連結原封不動**（不要改寫網址、不要自己編網址）。',
    '- 員警照摘要具名（公開表揚）；民眾比照摘要的揭露程度，不自行加碼也不刪改事實。',
    '- 繁中台灣用語、去 AI 腔、編輯部中性語氣、不加個人評論。',
    '- **不要轉載官方頁或 FB 的版權照片**；封面可有可無，用 `node scripts/get-image.mjs --out public/covers/<slug>-cover.webp`（圖庫真實照片、警民互助/警車等示意，不要 --people、不要 AI 生圖）。**設了 coverImage 就一定要確認該檔真的存在；拿不到圖就不要設 coverImage**（暖聞 roundup 可無封面），絕不可設了卻沒存到檔（會變壞連結、整篇發不出）。',
    '',
    '【去重】比對近 30 天已發的好人好事整理，不要重複同一事件：',
    recent,
    '',
    '【frontmatter】category: "lifestyle"、subcategory: "life"、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate 現在；slug 語意化英文 kebab（如 police-good-deeds-2026-06-21，避免 post-NNN，檔名＝slug）；disclosure 揭露「整理自各地警察局公開新聞稿、附原文出處」。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。',
    '',
    '【最後輸出】一行：`POLICE_RESULT=NEW｜<slug>`（有寫）或 `POLICE_RESULT=SKIP｜<原因>`（無合適候選）。',
  ].join('\n');
}

/** 解析 Claude 輸出的 POLICE_RESULT 行。回 {action:'new'|'skip', slug, note}。 */
export function parsePoliceResult(stdout) {
  const m = String(stdout || '').match(/POLICE_RESULT\s*=\s*(NEW|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 POLICE_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  // 清掉模型偶爾帶出的反引號/引號/標點，slug 只留 [a-z0-9-]，避免壞 URL／壞資料夾名（同 intl）。
  const raw = rest.split(/[\s｜|]/)[0] || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action: 'new', slug, note: rest };
}
