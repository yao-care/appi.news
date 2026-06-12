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

const FAQ_EXCLUDE = /(參考(文獻|資料|來源)|延伸閱讀|關於作者|免責聲明|作者與編輯)/;

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * 兩種來源：(1) 明確「常見問題 / FAQ」區段下的所有標題；
 *          (2) 全文中以「Q1 / Q2…」起頭的標題（醫療 AI 系列常用）。
 * 皆以標題為問題、其後段落為答案；以問題文字去重。
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

  // (1) 明確 FAQ 區段：區段標題之後的所有 h2-4 視為問題（問題可能與區段同為 h2，
  //     如「常見問題」下接多個 <h2>問題；參考文獻/免責等由 FAQ_EXCLUDE 濾除）
  const start = /<(h[234])>[^<]*(?:常見問題|FAQ|常見\s*Q\s*&\s*A)[^<]*<\/\1>/i.exec(body);
  if (start) {
    const section = body.slice(start.index + start[0].length);
    const qa = /<(h[234])>([\s\S]*?)<\/\1>\s*([\s\S]*?)(?=<h[234]>|$)/g;
    let m: RegExpExecArray | null;
    while ((m = qa.exec(section)) !== null) {
      if (FAQ_EXCLUDE.test(stripHtml(m[2]))) break; // 到達參考文獻/免責等 → FAQ 區段結束
      push(m[2], m[3]);
    }
  }

  // (2) 全文 Q 起頭標題
  const qre = /<(h[234])>\s*(Q\s*\d+[\s\S]*?)<\/\1>\s*([\s\S]*?)(?=<h[234]>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = qre.exec(body)) !== null) push(m[2], m[3]);

  return out.slice(0, 12);
}
