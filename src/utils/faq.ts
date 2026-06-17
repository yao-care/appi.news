/**
 * 從文章原始 body 抽取 FAQ 的 Q&A（給 FAQPage 結構化資料用）。
 * 與 astro:content 無關，獨立成檔以便單元測試。
 */

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// 非問答的區段標題：用來（a）把它們從問題候選中濾除，（b）標記 FAQ 區段的結尾，
// 避免把「結語/小結」這類結論段當成 FAQ 問題（曾導致 FAQPage 只輸出一筆「結語」）。
const FAQ_EXCLUDE =
  /(參考(文獻|資料|來源)|延伸閱讀|關於作者|免責聲明|作者與編輯|結語|結論|小結|總結|重點摘要|延伸思考|展望|前言|背景)/;

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * 三種來源：
 *   (1a) 明確「常見問題 / FAQ」區段下的標題式 Q&A（<h3>問題</h3><p>答案</p>）；
 *   (1b) 同區段內的段落粗體式 Q&A（<p><strong>問題？</strong><br>答案</p>）——日更文章主要格式；
 *   (2)  全文中以「Q1 / Q2…」起頭的標題（醫療 AI 系列常用）。
 * 皆以問題文字去重；FAQ 區段在遇到「結語/參考/免責…」等非問答標題時結束。
 */
export function extractFaq(body: string): FaqItem[] {
  const out: FaqItem[] = [];
  const seen = new Set<string>();
  const clean = (raw: string): string =>
    stripHtml(raw).replace(/^Q\s*\d*\s*[｜|.:：、]?\s*/i, '').trim();
  const push = (qRaw: string, aRaw: string) => {
    const q = clean(qRaw);
    const a = stripHtml(aRaw);
    if (!q || !a || q.length > 200 || a.length < 8) return;
    if (FAQ_EXCLUDE.test(q) || seen.has(q)) return;
    seen.add(q);
    out.push({ question: q, answer: a });
  };

  // (1) 明確 FAQ 區段
  const start = /<(h[234])>[^<]*(?:常見問題|FAQ|常見\s*Q\s*&\s*A)[^<]*<\/\1>/i.exec(body);
  if (start) {
    let section = body.slice(start.index + start[0].length);
    // 在第一個「結語/參考/免責…」等非問答標題處截斷，界定 FAQ 區段範圍，
    // 同時避免 (1b) 把後續段落的粗體文字誤抓成問題。
    const boundary = /<(h[234])>([\s\S]*?)<\/\1>/g;
    let bm: RegExpExecArray | null;
    while ((bm = boundary.exec(section)) !== null) {
      if (FAQ_EXCLUDE.test(stripHtml(bm[2]))) {
        section = section.slice(0, bm.index);
        break;
      }
    }
    // (1a) 標題式：<h2-4>問題</h2-4> 後接答案段落
    const qa = /<(h[234])>([\s\S]*?)<\/\1>\s*([\s\S]*?)(?=<h[234]>|$)/g;
    let m: RegExpExecArray | null;
    while ((m = qa.exec(section)) !== null) push(m[2], m[3]);
    // (1b) 段落粗體式：<p><strong>問題？</strong><br>答案</p>
    const pq = /<p>\s*<strong>([\s\S]*?)<\/strong>\s*(?:<br\s*\/?>)?\s*([\s\S]*?)<\/p>/gi;
    while ((m = pq.exec(section)) !== null) push(m[1], m[2]);
  }

  // (2) 全文 Q 起頭標題
  const qre = /<(h[234])>\s*(Q\s*\d+[\s\S]*?)<\/\1>\s*([\s\S]*?)(?=<h[234]>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = qre.exec(body)) !== null) push(m[2], m[3]);

  return out.slice(0, 12);
}
