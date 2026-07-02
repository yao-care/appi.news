// parsers-matsu-ntpc-hccp-ttcpb-hchpb.mjs
// 5 縣市警局「新聞稿列表 + 詳情頁」純函式 parser（純 regex，零依賴）。
// 介面：parseList*(html, baseUrl) -> Array<{title, url, date:'YYYY-MM-DD'|null}>
//       parseDetail*(html) -> {summary}（正文純文字前約 300 字）
// 不做任何網路 I/O。相對連結用 baseUrl 以內建 URL 轉絕對。

// ---------- 共用小工具 ----------

/** 去標籤 + 解 entity + 收斂空白，回傳純文字。 */
function stripTags(s) {
  if (!s) return '';
  s = s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/&nbsp;|&emsp;|&ensp;/gi, ' ')
       .replace(/&amp;/gi, '&')
       .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
       .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
       .replace(/&#?\w+;/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

/** 相對→絕對；解析失敗回原字串。 */
function toAbs(href, baseUrl) {
  if (!href) return null;
  href = href.trim().replace(/\s+/g, ''); // 有些站 href 內含換行縮排
  try { return new URL(href, baseUrl).href; }
  catch { return href; }
}

/**
 * 正規化日期成 'YYYY-MM-DD'。支援 民國/西元、分隔符 - / . 年月日。
 * 民國判斷：年份 < 1000 視為民國，+1911。抓不到回 null。
 */
function normDate(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{2,4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/);
  if (!m) return null;
  let y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (y < 1000) y += 1911; // 民國
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 從 class marker 起取正文純文字，遇 nav/附件哨兵字串即截斷，回傳前 maxLen 字。 */
function summaryFrom(html, marker, maxLen = 300) {
  if (!html) return '';
  const i = html.indexOf(marker);
  if (i < 0) return '';
  const gt = html.indexOf('>', i); // 從該標籤的 '>' 之後開始，避免帶進 class 名或 CSS
  let txt = stripTags(html.slice(gt >= 0 ? gt + 1 : i + marker.length));
  const sentinels = ['最後異動', '回前頁', '回首頁', '回上一頁', 'OPEN CLOSE',
                     '附加檔案', '相關附件', '相關檔案', '::: 收合', '::: ', '分享至'];
  let cut = txt.length;
  for (const s of sentinels) {
    const k = txt.indexOf(s);
    if (k >= 0 && k < cut) cut = k;
  }
  return txt.slice(0, cut).trim().slice(0, maxLen);
}

// ---------- 連江縣（lchpd.gov.tw） ----------
// 列表：<li class='FIRST'><p class='T03'>2026/07/01</p></li> … <a href='…' class='LINK03' title='…'>標題</a>
// href 樣本為絕對網址。
export function parseListMatsu(html, baseUrl = 'https://www.lchpd.gov.tw/Chhtml/news/2666') {
  const out = [];
  const re = /<li[^>]*class=['"]FIRST['"][^>]*>\s*<p[^>]*class=['"]T03['"][^>]*>([^<]+)<\/p>[\s\S]*?<a\s+href=['"]([^'"]+)['"][^>]*class=['"]LINK03['"][^>]*title=['"]([^'"]*)['"]/gi;
  let m;
  while ((m = re.exec(html)))
    out.push({ title: stripTags(m[3]), url: toAbs(m[2], baseUrl), date: normDate(m[1]) });
  return out;
}
export function parseDetailMatsu(html) {
  return { summary: summaryFrom(html, "CONTENTBOX") };
}

// ---------- 新北市（police.ntpc.gov.tw） ----------
// 列表：<li><a href="…"><span class="numb">N</span><span class="title">標題</span>
//        <span class="from">…</span><time>114-04-09</time></a></li>
// href 可能站內相對（cp-…/dl-…）或外部（facebook，已絕對）。
export function parseListNewTaipei(html, baseUrl = 'https://www.police.ntpc.gov.tw/np-3344-1.html') {
  const out = [];
  const re = /<li>\s*<a\s+[^>]*href="([^"]+)"[^>]*>\s*<span class="numb">\d+<\/span>\s*<span class="title">([\s\S]*?)<\/span>[\s\S]*?<time>([^<]+)<\/time>/gi;
  let m;
  while ((m = re.exec(html)))
    out.push({ title: stripTags(m[2]), url: toAbs(m[1], baseUrl), date: normDate(m[3]) });
  return out;
}
export function parseDetailNewTaipei(html) {
  return { summary: summaryFrom(html, 'cpArticle') };
}

// ---------- 新竹市（hccp.gov.tw） ----------
// 列表：<div class="css_td list_date">115-06-25</div> … <div class="css_td list_title"> … <a href="home.jsp?…" title="標題">
// href 相對於 https://www.hccp.gov.tw/ch/。
export function parseListHsinchuCity(html, baseUrl = 'https://www.hccp.gov.tw/ch/home.jsp?id=23&parentpath=0') {
  const out = [];
  const re = /class=["']css_td list_date["'][^>]*>([^<]+)<\/div>[\s\S]*?class=["']css_td list_title["'][^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*title="([^"]*)"/gi;
  let m;
  while ((m = re.exec(html)))
    out.push({ title: stripTags(m[3]), url: toAbs(m[2], baseUrl), date: normDate(m[1]) });
  return out;
}
export function parseDetailHsinchuCity(html) {
  return { summary: summaryFrom(html, 'content_detail_column02') };
}

// ---------- 臺東縣（ttcpb.gov.tw；抓取端需偽裝瀏覽器 UA） ----------
// 列表（div.news.list_A）：<li> <a href="home.jsp?…">
//   <p class="color01">115.07.01</p><p class="color02">單位</p><p class="item">標題</p></a></li>
// 列表標題可能被截斷（尾綴 …）；href 相對於 https://www.ttcpb.gov.tw/chinese/。
export function parseListTaitung(html, baseUrl = 'https://www.ttcpb.gov.tw/chinese/index.jsp') {
  let scope = html;
  const s = html.indexOf('news list_A'); // 只掃新聞列表區塊，避開頁面其他 color01
  if (s >= 0) scope = html.slice(s, s + 20000);
  const out = [];
  const re = /<a\s+href="([^"]+)"[^>]*>\s*<p class="color01">([^<]+)<\/p>\s*<p class="color02">[^<]*<\/p>\s*<p class="item">([^<]*)<\/p>/gi;
  let m;
  while ((m = re.exec(scope)))
    out.push({ title: stripTags(m[3]), url: toAbs(m[1], baseUrl), date: normDate(m[2]) });
  return out;
}
export function parseDetailTaitung(html) {
  return { summary: summaryFrom(html, 'ed_txt') };
}

// ---------- 新竹縣（hchpb.gov.tw；官網首頁多分頁新聞區塊） ----------
// 列表：<li class="tab_contentlist"><div class="tab_date">2026-06-29 &nbsp; 單位</div>
//        <div class="tab_list_txt"><a title="標題" href="/Tw/Common/BulletinDetail?…">標題</a></div></li>
// href 為站內絕對路徑，相對於 https://www.hchpb.gov.tw。
export function parseListHsinchuCounty(html, baseUrl = 'https://www.hchpb.gov.tw/') {
  const out = [];
  const re = /<div class="tab_date">([^<]+)[\s\S]*?<div class="tab_list_txt"><a\s+title="([^"]*)"\s+href="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html)))
    out.push({ title: stripTags(m[2]), url: toAbs(m[3], baseUrl), date: normDate(m[1]) });
  return out;
}
export function parseDetailHsinchuCounty(html) {
  return { summary: summaryFrom(html, 'icrc_ctxt') };
}
