// 便民市政「寫作」純邏輯（可單元測試、無 I/O）。
// 協調器 scripts/lifestyle-civic.mjs 先用 ./civic-fetch.mjs 固定抓好候選、用 ./civic-ledger.mjs
// 濾掉已見，再用本檔的 buildCivicPrompt 組「只挑選＋跨縣市寫作」的 prompt 給 Claude。
//
// 決策（站長定 2026-07-20）：全自動上架、跨縣市統整成「一篇」、有新資料才寫（無則靜默）。
// 抓取＝固定程式（見 civic-fetch.mjs），LLM 不上網、只讀備妥清單挑選＋寫作。

/** 把候選清單格式化成 prompt 素材區塊（依縣市分組，讀起來像編輯桌上的線索表）。 */
import { renderTitleTargeting } from './title-targeting.mjs';

function formatCandidates(candidates = []) {
  if (!candidates.length) return '（無候選）';
  const byArea = new Map();
  for (const c of candidates) {
    if (!byArea.has(c.area)) byArea.set(c.area, []);
    byArea.get(c.area).push(c);
  }
  const out = [];
  for (const [area, list] of byArea) {
    out.push(`【${area}】`);
    list.forEach((c) => {
      const date = c.date ? `（${c.date.slice(0, 10)}）` : '';
      const sum = c.summary ? `\n    摘要：${c.summary}` : '';
      out.push(`  - ${date}${c.title}\n    連結：${c.url}${sum}`);
    });
  }
  return out.join('\n');
}

/**
 * 組 Claude「只挑選＋跨縣市寫作」prompt。抓取已由 civic-fetch 固定完成、已濾掉近 30 天見過的，
 * 這裡不叫 LLM 上網。
 * @param {Array<{area,title,url,date,summary}>} candidates 新候選（已去重）
 * @param {string[]} recentTitles 近 14 天已發便民整理標題（避免同型重複）
 */
export function buildCivicPrompt(candidates = [], recentTitles = []) {
  const recent = recentTitles.length ? recentTitles.map((t) => `  - ${t}`).join('\n') : '（近期無）';
  const today = new Date().toISOString().slice(0, 10);
  return [
    '你是 APPI News 生活線編輯，把全台各縣市政府「今天的便民市政措施」統整成**一篇**繁中（台灣用語）實用整理，給讀者一次看懂各地有哪些跟生活相關的新服務、補助、申辦、交通與健康資訊。全自動上架、編輯部署名、無個人觀點。',
    '',
    '【素材】以下是系統已從各縣市政府官網 RSS「固定抓取＋便民關鍵字初篩＋濾掉近期已報過」的候選（附縣市／連結／日期／摘要）。你的工作是**挑選＋統整寫作**，**不要自己上網、WebFetch 或抓別的來源**——所有事實與連結都用下面提供的：',
    formatCandidates(candidates),
    '',
    '【挑選】',
    '- 只挑**真正對民眾有用的便民措施**：新開辦/擴大的服務、補助與津貼申辦、線上申辦或預約、交通（通車/施工改道/班次調整）、健康（篩檢/疫苗/健檢）、育兒托育長照敬老、規費減免、據點與諮詢窗口等。',
    '- **剔除**：純典禮/剪綵/表揚/競賽/首長行程/施政宣傳/純活動花絮——那些不是便民措施。',
    '- 跨縣市統整，地區盡量分散；同一則新聞不同縣市重覆報導的只留一則。',
    '- 若挑完**沒有任何一則像樣的便民措施**（例如今天候選全是典禮活動），輸出 SKIP，不要硬寫。',
    '',
    '【撰寫鐵則（跟著提供的素材走）】',
    '- 嚴格基於提供的標題與摘要事實、**不杜撰**、不誇大；金額/日期/資格等關鍵細節照摘要，摘要沒有的別自己補。',
    '- 每則**附上面提供的官方連結原封不動**（不要改寫或自己編網址）；讀者要能點進官方原文看細節。',
    '- **依主題分節**（如「交通與工程」「補助與申辦」「健康服務」「育兒與長照」…），每節下用清單列各縣市措施、標明縣市；開頭一段話交代這是今日各地便民整理。',
    '- 繁中台灣用語、去 AI 腔（統一禁用清單見下）、編輯部中性語氣、不加個人評論。',
    '- 【去 AI 腔·統一禁用清單，違反即改】禁破折號（——）下定義；禁「不是X，而是Y」下定義與「不僅…更/還」「不只是…而是/更是」「並非…而是」排比；禁「值得注意的是」「值得一提的是」「換句話說」；禁空泛收束（總的來說／綜上所述／總而言之／歸根結底／整體而言）；禁「真正的問題/關鍵是…」拔高與「隨著…的發展/普及」「在…的今天」開場公式；禁「至關重要/不可或缺/舉足輕重」；禁模糊引用（研究顯示／有研究指出／專家認為／學者認為／普遍認為——要嘛當下附具體可點來源、要嘛不寫）；禁模板化第一人稱開場（以「我」起句、老實說、最近有讀者/朋友…）。正向：長短句交錯、每段換開法、每段至少一個具體事實、台灣口語。',
    '- **封面可有可無**：用 `node scripts/get-image.mjs --out public/covers/<slug>-cover.webp`（圖庫真實照片、市政/生活服務示意，不要 --people、不要 AI 生圖）。**設了 coverImage 就一定要確認該檔真的存在；拿不到圖就不要設 coverImage**，絕不可設了卻沒存到檔（會變壞連結、整篇發不出）。內文不必配圖。',
    '',
    ...renderTitleTargeting('civic'),
    '',
    '【去重】比對近 14 天已發的便民整理，不要與同一天/同型內容重覆：',
    recent,
    '',
    `【frontmatter】category: "lifestyle"、subcategory: "life"、author: "appi-editorial"、contentType: "news"、sourceType: "wire"、status: "published"、publishDate 現在；slug 固定格式 civic-services-${today}（檔名＝slug）；title 像「各地便民措施整理（${today}）」之類清楚可搜尋；description 一句話概述今天涵蓋哪些縣市與主題；tags 帶「便民措施」「市政服務」與涵蓋的主要縣市。disclosure 揭露「整理自各縣市政府公開新聞稿/公告、附原文出處」。寫入 src/content/articles/<slug>.md，**不要 git add/commit/push**（外層處理）。`,
    '',
    '【最後輸出】一行：`CIVIC_RESULT=NEW｜<slug>`（有寫）或 `CIVIC_RESULT=SKIP｜<原因>`（無合適便民措施）。',
  ].join('\n');
}

/** 解析 Claude 輸出的 CIVIC_RESULT 行。回 {action:'new'|'skip', slug, note}。 */
export function parseCivicResult(stdout) {
  const m = String(stdout || '').match(/CIVIC_RESULT\s*=\s*(NEW|SKIP)\s*[｜|:：]\s*(.*)$/im);
  if (!m) return { action: 'skip', slug: null, note: '無法解析 CIVIC_RESULT（視為跳過）', infra: true };
  const action = m[1].toLowerCase();
  const rest = (m[2] || '').trim();
  if (action === 'skip') return { action: 'skip', slug: null, note: rest };
  const raw = rest.split(/[\s｜|]/)[0] || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '') || null;
  return { action: 'new', slug, note: rest };
}
