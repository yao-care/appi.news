// 全台縣市便民市政 RSS 通用解析（純函式、可單元測試、零 I/O）。
// 各縣市政府新聞/公告 feed 多為標準 RSS 2.0（少數 Atom），欄位大同小異，故用一支通用 parser，
// 不像警消要各站 HTML parser。日期格式不統一（RFC822 / 民國年），一併在此吸收。

/** 解 HTML 實體（含數字實體）。 */
export function decodeEntities(s = '') {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&'); // amp 最後解，避免二次解碼
}

/** 去標籤 + 壓空白，取純文字摘要。 */
export function stripTags(html = '', maxLen = 200) {
  const t = decodeEntities(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return maxLen && t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

/** 取單一標籤內容（CDATA/一般皆可）。回 '' 若無。 */
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1]).trim() : '';
}

/** 取所有同名標籤內容陣列。 */
function tagAll(block, name) {
  const out = [];
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'gi');
  let m;
  while ((m = re.exec(block))) out.push(decodeEntities(m[1]).trim());
  return out;
}

/** Atom <link href="..."/> 或 RSS <link>...</link>。 */
function linkOf(block) {
  const rss = tag(block, 'link');
  if (rss) return rss;
  const atom = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return atom ? decodeEntities(atom[1]).trim() : '';
}

/**
 * 解析日期字串 → ISO（UTC）或 null。吃三種：
 *   RFC822（Mon, 20 Jul 2026 09:33:00 GMT）、民國「115-07-20」、民國「115年7月20日」。
 */
export function parsePubDate(raw = '') {
  const s = String(raw).trim();
  if (!s) return null;
  // 民國「NNN年M月D日」
  let m = s.match(/(\d{2,3})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (m) return rocToIso(m[1], m[2], m[3]);
  // 民國「NNN-M-D」（南投）：頭段 100–199 視為民國年
  m = s.match(/^(\d{3})-(\d{1,2})-(\d{1,2})/);
  if (m && Number(m[1]) >= 100 && Number(m[1]) <= 199) return rocToIso(m[1], m[2], m[3]);
  // 其餘交給 Date（RFC822 / ISO）
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function rocToIso(y, mo, d) {
  const dt = new Date(Date.UTC(Number(y) + 1911, Number(mo) - 1, Number(d)));
  return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
}

/**
 * 解析一份 RSS/Atom feed。
 * @returns {Array<{title,link,summary,pubDate:(string|null),categories:string[]}>}
 */
export function parseRss(xml = '') {
  const src = String(xml);
  const blocks = [];
  const itemRe = /<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = itemRe.exec(src))) blocks.push(m[2]);
  return blocks.map((b) => {
    const rawDate = tag(b, 'pubDate') || tag(b, 'pubdate') || tag(b, 'updated') || tag(b, 'published') || tag(b, 'dc:date');
    return {
      title: tag(b, 'title'),
      link: linkOf(b),
      summary: stripTags(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content'), 200),
      pubDate: parsePubDate(rawDate),
      categories: tagAll(b, 'category').filter(Boolean),
    };
  }).filter((it) => it.title && it.link);
}

/** 距今幾天（pubDate 為 null 時回 null，呼叫端保守納入）。 */
export function daysAgo(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : (Date.now() - t) / 86400000;
}
