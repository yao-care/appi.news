// 警消好人好事 — 固定 node parser（純函式，無網路 I/O）
// 三個結構各異的縣市警局：臺南市 / 南投縣 / 彰化縣
// 只用內建能力（無 cheerio / node-html-parser）。相對連結用 baseUrl 轉絕對。

/* ------------------------------------------------------------------ *
 * 共用小工具
 * ------------------------------------------------------------------ */

// 解碼常見 HTML entity（含數字實體）
function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

// 去標籤 + 解實體 + 收斂空白
function stripTags(html) {
  if (!html) return '';
  const noTag = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|dt|dd)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(noTag)
    .replace(/[ \t　]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/^\s+|\s+$/g, '');
}

// 標題等單行文字：去標籤後壓成一行
function cleanInline(html) {
  return stripTags(html).replace(/\s+/g, ' ').trim();
}

// 轉絕對網址（先解 entity 再解析；失敗回原字串）
function absolutize(href, baseUrl) {
  if (!href) return null;
  const clean = decodeEntities(href.trim());
  try {
    return new URL(clean, baseUrl).href;
  } catch {
    return clean;
  }
}

// 解析日期 → 'YYYY-MM-DD' | null
// 支援西元（2026-06-30）與民國（115-06-30 / 115.06.30 / 115/6/30）
function parseDate(raw) {
  if (!raw) return null;
  const m = decodeEntities(raw).match(/(\d{2,4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})/);
  if (!m) return null;
  let [, y, mo, d] = m;
  let year = parseInt(y, 10);
  if (year < 1911) year += 1911; // 民國轉西元
  const mm = String(parseInt(mo, 10)).padStart(2, '0');
  const dd = String(parseInt(d, 10)).padStart(2, '0');
  if (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12) return null;
  if (parseInt(dd, 10) < 1 || parseInt(dd, 10) > 31) return null;
  return `${year}-${mm}-${dd}`;
}

// 擷取第一個 <div class="...cls..."> ... </div>（處理巢狀）
function extractDivByClass(html, cls) {
  const openRe = new RegExp(`<div\\b[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, 'i');
  const m = openRe.exec(html);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 1;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = i;
  let t;
  while ((t = tagRe.exec(html))) {
    depth += t[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(i, t.index);
  }
  return html.slice(i);
}

/* ================================================================== *
 * 1) 臺南市（tnpd.gov.tw）— <table> 版
 *    每列 <tr>：類別 td.title01 / 標題 td>a[href^="/News/Details"] / 日期 td[data-th="發布日期"]（民國）
 * ================================================================== */
export function parseListTainan(html, baseUrl) {
  const out = [];
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let r;
  while ((r = rowRe.exec(html))) {
    const row = r[1];
    const a = row.match(/<a\b[^>]*href="([^"]*\/News\/Details\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!a) continue; // 跳過表頭 / 無連結列
    const url = absolutize(a[1], baseUrl);
    const title = cleanInline(a[2]) || cleanInline(a[0].match(/title="([^"]*)"/i)?.[1] || '');
    const dCell = row.match(/data-th="發布日期"[^>]*>([\s\S]*?)<\/td>/i);
    const date = parseDate(dCell ? dCell[1] : '');
    if (title) out.push({ title, url, date });
  }
  return out;
}

/* ================================================================== *
 * 2) 南投縣（ncpd.gov.tw）— <ul class="list"> 版
 *    每筆 <li>：span.list_word>a[href^="Details.aspx"] / 末個 span.w15 為日期（西元）
 * ================================================================== */
export function parseListNantou(html, baseUrl) {
  const out = [];
  const ul = html.match(/<ul\s+class="list">([\s\S]*?)<\/ul>/i);
  const scope = ul ? ul[1] : html;
  const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let l;
  while ((l = liRe.exec(scope))) {
    const li = l[1];
    if (/list_head/.test(li)) continue;
    const a = li.match(/<a\b[^>]*href="([^"]*Details\.aspx[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!a) continue;
    const url = absolutize(a[1], baseUrl);
    const title =
      cleanInline(a[0].match(/title="([^"]*)"/i)?.[1] || '') || cleanInline(a[2]);
    // 找出符合日期格式的 span（避開發布單位 / 點閱率）
    let date = null;
    const spanRe = /<span\b[^>]*>([\s\S]*?)<\/span>/gi;
    let s;
    while ((s = spanRe.exec(li))) {
      const d = parseDate(s[1]);
      if (d) { date = d; break; }
    }
    if (title) out.push({ title, url, date });
  }
  return out;
}

/* ================================================================== *
 * 3) 彰化縣（chpb.gov.tw）— <div role="row"> 版
 *    每筆 role="row"：a.txt-link[href^="/Announcement"]（標題內可能夾 <span class="badge">New</span>）
 *    日期在 div.kf-date（民國）
 * ================================================================== */
export function parseListChanghua(html, baseUrl) {
  const out = [];
  // 只取 tbody 區塊，避免抓到表頭
  const body = html.match(/<div\b[^>]*class="rowgroup-tbody"[^>]*>([\s\S]*)$/i);
  const scope = body ? body[1] : html;
  const rowRe = /<div\b[^>]*role="row"[^>]*>([\s\S]*?)(?=<div\b[^>]*role="row"|<div\b[^>]*class="[^"]*(?:kf-pagination|pagination)|$)/gi;
  let r;
  while ((r = rowRe.exec(scope))) {
    const row = r[1];
    const a = row.match(/<a\b[^>]*href="([^"]*\/Announcement\/[^"]*ID=[^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!a) continue;
    const url = absolutize(a[1], baseUrl);
    // 標題：移除 badge（New）後取純文字
    const title = cleanInline(a[2].replace(/<span\b[^>]*class="[^"]*badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ''));
    const dCell = row.match(/class="[^"]*kf-date[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const date = parseDate(dCell ? dCell[1] : '');
    if (title) out.push({ title, url, date });
  }
  return out;
}

/* ================================================================== *
 * 詳情頁 parser → { summary }（正文純文字前約 300 字）
 * 三站詳情頁結構「不同」，各寫一支；共用 stripTags/summarize。
 * ================================================================== */

function summarize(text, n = 300) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) : t;
}

// 臺南市：正文在 <!--內容開始--> ... <!--內容結束-->；去標題 h4 / 資訊列 / 相關附件之後
export function parseDetailTainan(html) {
  let block =
    html.match(/<!--內容開始-->([\s\S]*?)<!--內容結束-->/)?.[1] ||
    extractDivByClass(html, 'content-wrap') ||
    html;
  block = block
    .replace(/<h4\b[\s\S]*?<\/h4>/gi, '')                 // 文章標題
    .replace(/<div\b[^>]*class="[^"]*text-info[^"]*"[\s\S]*?<\/div>/i, '') // 發佈單位/點閱列
    .split(/<!---相關/)[0];                                // 砍掉相關附件/連結/圖檔
  return { summary: summarize(stripTags(block)) };
}

// 南投縣：正文在 <div class="content_txt ...">；去 title / 日期單位 / 圖框
export function parseDetailNantou(html) {
  let block = extractDivByClass(html, 'content_txt') || html;
  block = block
    .replace(/<div\b[^>]*class="content_title"[\s\S]*?<\/div>/i, '')
    .replace(/<div\b[^>]*class="[^"]*imgbox[^"]*"[\s\S]*?<\/div>/gi, ''); // 圖框（含圖說）
  let text = stripTags(block)
    .replace(/[\s\S]*?發布單位：\s*\S+/, '')  // 砍到「發布單位：XXX」為止
    .replace(/^\s*公布日期：\s*\S+/, '')
    .trim();
  return { summary: summarize(text) };
}

// 彰化縣：正文在 <div class="kf-det-content">（乾淨段落）
export function parseDetailChanghua(html) {
  const block = extractDivByClass(html, 'kf-det-content') || html;
  return { summary: summarize(stripTags(block)) };
}
