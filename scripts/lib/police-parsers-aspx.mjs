// Parser for the "News.aspx" family of Taiwanese government police CMS sites.
// Covers two list templates and two detail templates that share the News.aspx /
// News_Content.aspx URL scheme:
//   - Modern CCMS (jGridView tables, or <li><i class="date"> lists): 宜蘭/雲林/金門/台北
//   - Older CCMS (cell-table / ASP.NET GridView, data_midlle_news_box detail): 高雄/屏東
//
// Pure functions only. No network I/O — callers supply already-fetched HTML.

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Decode the small set of HTML entities that show up in these pages. */
function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => {
      try { return String.fromCodePoint(Number(d)); } catch { return ''; }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ''; }
    });
}

/** Strip all tags, decode entities, collapse whitespace. */
function stripTags(html) {
  return decodeEntities(
    String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|td|tr|h[1-6])>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

/** Normalise a ROC/Gregorian date string to YYYY-MM-DD, or null. */
function normalizeDate(context) {
  const m = String(context).match(/(\d{2,4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!m) return null;
  let y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (!y || !mo || !d || mo > 12 || d > 31) return null;
  if (y < 1911) y += 1911; // ROC (民國) year -> Gregorian
  const pad = (n) => String(n).padStart(2, '0');
  return `${y}-${pad(mo)}-${pad(d)}`;
}

/** Given the full html and an index, return the tightest enclosing <tr>/<li> block. */
function enclosingRow(html, anchorStart, anchorEnd) {
  const trOpen = html.lastIndexOf('<tr', anchorStart);
  const liOpen = html.lastIndexOf('<li', anchorStart);
  const start = Math.max(trOpen, liOpen);

  const trClose = html.indexOf('</tr>', anchorEnd);
  const liClose = html.indexOf('</li>', anchorEnd);
  const ends = [trClose, liClose].filter((i) => i !== -1);
  const end = ends.length ? Math.min(...ends) : anchorEnd + 400;

  if (start === -1) {
    // no row container: fall back to a bounded window around the anchor
    return html.slice(Math.max(0, anchorStart - 400), end);
  }
  return html.slice(start, end);
}

// ---------------------------------------------------------------------------
// list parser
// ---------------------------------------------------------------------------

/**
 * Parse a News.aspx list page.
 * @param {string} html    raw HTML of the list page
 * @param {string} baseUrl the list page URL (used to absolutise relative links)
 * @returns {Array<{title:string,url:string,date:(string|null)}>}
 */
export function parseListNewsAspx(html, baseUrl) {
  if (!html) return [];
  const results = [];
  const seen = new Set();

  // Match every opening <a ...> tag that links to a News_Content.aspx detail page.
  const anchorRe = /<a\b[^>]*\bhref\s*=\s*"([^"]*News_Content\.aspx[^"]*)"[^>]*>/gi;
  let m;
  while ((m = anchorRe.exec(html)) !== null) {
    const rawHref = m[1];
    const tag = m[0];
    const anchorStart = m.index;
    const openTagEnd = anchorStart + tag.length;

    // inner text runs from the end of the opening tag to the matching </a>
    const closeIdx = html.indexOf('</a>', openTagEnd);
    const innerText = closeIdx === -1 ? '' : html.slice(openTagEnd, closeIdx);
    const anchorEnd = closeIdx === -1 ? openTagEnd : closeIdx + 4;

    // detail links must carry an item id (?...&s=... or ?s=...); this drops the
    // handful of section landing links that also point at News_Content.aspx.
    const decodedHref = decodeEntities(rawHref);
    if (!/[?&]s=[^&]+/i.test(decodedHref)) continue;

    // absolutise
    let url;
    try {
      url = new URL(decodedHref, baseUrl).href;
    } catch {
      continue;
    }

    // Only keep items that live in a dated row/list-item. This filters out
    // navigation / promo links (which reuse News_Content.aspx but have no date).
    const rowCtx = enclosingRow(html, anchorStart, anchorEnd);
    const date = normalizeDate(rowCtx);
    if (!date) continue;

    // title: prefer the anchor's title="" attribute, else its inner text.
    let title = '';
    const titleAttr = tag.match(/\btitle\s*=\s*"([^"]*)"/i);
    if (titleAttr) title = decodeEntities(titleAttr[1]);
    if (!title.trim()) title = stripTags(innerText);
    title = title.replace(/\[另開新視窗\]/g, '').replace(/\s+/g, ' ').trim();
    if (!title) continue;

    if (seen.has(url)) continue;
    seen.add(url);
    results.push({ title, url, date });
  }

  return results;
}

// ---------------------------------------------------------------------------
// detail parser
// ---------------------------------------------------------------------------

/**
 * Parse a News_Content.aspx detail page and return a short plain-text summary.
 * @param {string} html raw HTML of the detail page
 * @returns {{summary:string}}
 */
export function parseDetailNewsAspx(html) {
  if (!html) return { summary: '' };

  let body = null;

  // 1) Modern CCMS: article body lives in <div class="...essay..."> inside an
  //    <div class="area-essay ...">. Cut at the trailing address/system-info blocks.
  const essayStart = html.search(/<div[^>]*\bclass="[^"]*\bessay\b[^"]*"/i);
  if (essayStart !== -1) {
    let end = html.indexOf('area-editor', essayStart);
    if (end === -1) end = html.length;
    body = html.slice(essayStart, end);
  }

  // 2) Older CCMS (高雄/屏東): body in <div class="data_midlle_news_box02">.
  if (!body) {
    const boxRe = /<div[^>]*\bclass="[^"]*data_midlle_news_box02[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
    const bm = html.match(boxRe);
    if (bm) body = bm[1];
  }

  // 3) Fallback: ASP.NET content placeholder.
  if (!body) {
    const cm = html.match(/id="ContentPlaceHolder1_divContent"[^>]*>([\s\S]*?)<\/div>/i);
    if (cm) body = cm[1];
  }

  if (!body) return { summary: '' };

  let text = stripTags(body);
  if (text.length > 300) text = text.slice(0, 300).trim();
  return { summary: text };
}
