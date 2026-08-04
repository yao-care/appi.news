/**
 * 從文章原始 body 抽取 FAQ 的 Q&A（給 FAQPage 結構化資料用）。
 * 與 astro:content 無關，獨立成檔以便單元測試。
 */

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    // markdown 殘留（本檔吃的是原始 body，內文可能是 markdown 而非 HTML）：
    // 圖片整個丟掉、連結只留文字、粗體/斜體/行內程式碼只留內容。
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 把 markdown 正規化成本抽取器認得的 HTML 形狀。
 *
 * 為什麼需要：`extractFaq` 吃的是文章「原始 body」，而三條規則原本只認 HTML 標題。
 * WordPress 搬過來的舊文內嵌 `<h2>常見問題</h2>` 所以能抽到，但新寫的文章一律是
 * markdown（`### 常見問題`），區段起點就比對不到 → FAQPage 整個不輸出。
 * 2026-08-04 盤點：全站 92 篇踩到，等於白寫的常見問題段拿不到 FAQ 結構化資料。
 */
function normalizeMarkdown(body: string): string {
  return (
    body
      // 圍欄程式碼先拿掉，避免裡面的 `#` 註解被當成標題。
      .replace(/^```[\s\S]*?^```/gm, '')
      // ATX 標題 → 統一輸出 <h3>（抽取器對 h2-h4 一視同仁，只需標題邊界）。
      .replace(/^[ \t]*#{2,4}[ \t]+(.+?)[ \t]*$/gm, '<h3>$1</h3>')
      // 獨立粗體行＝問題，其後第一個段落＝答案（日更文章的另一種常見寫法）。
      .replace(
        /^[ \t]*\*\*(.+?)\*\*[ \t]*\n[ \t]*\n(.+(?:\n(?![ \t]*\n)[^\n]+)*)/gm,
        '<p><strong>$1</strong><br>$2</p>',
      )
  );
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
 *
 * markdown 與 HTML 兩種寫法都吃：進來先過 `normalizeMarkdown()` 轉成同一種形狀，
 * 三條規則本身只需維護 HTML 版本。
 */
export function extractFaq(rawBody: string): FaqItem[] {
  const body = normalizeMarkdown(rawBody);
  const out: FaqItem[] = [];
  const seen = new Set<string>();
  const clean = (raw: string): string =>
    stripHtml(raw)
      .replace(/^Q\s*\d*\s*[｜|.:：、]?\s*/i, '')
      // 純數字編號開頭（「1.吃成藥可以配咖啡嗎？」）也去掉，結構化資料的問題不該帶編號。
      // 要求編號後接 . 、 ： 等分隔符，才不會誤砍「1 歲寶寶…」這種以數字開頭的正常問題。
      .replace(/^\d+\s*[.、:：]\s*/, '')
      .trim();
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
