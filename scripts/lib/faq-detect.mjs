/**
 * 「這篇文章有沒有能被抽成 FAQPage 的常見問題區段？」
 *
 * 為什麼獨立成一支：`growth-lint.mjs` 的 G5 原本自己寫了一條只認 markdown 標題的
 * regex，但真正決定「有沒有 FAQPage」的是 `src/utils/faq.ts` 的 `extractFaq()`，
 * 它 markdown 與 HTML 兩種標題都吃、還額外認全文的「Q1/Q2…」式標題。
 * 兩邊判準不一致的後果：2026-08-07 盤點時 lint 把 152 篇「其實有 FAQ」的文章
 * 報成沒有，等於叫人去補已經做完的事。
 *
 * 🔴 這裡是判準的**鏡像**，`src/utils/faq.ts` 才是唯一事實來源（結構化資料以它為準）。
 *    改任何一邊都要改另一邊——`faq-detect.test.mjs` 會跨兩支比對，不一致就測試失敗。
 *    這裡只回答「有沒有」，不負責抽出 Q&A 內容（那是 faq.ts 的事）。
 */

/** 與 faq.ts `normalizeMarkdown()` 同步：把 markdown 標題轉成抽取器認得的 HTML 形狀。 */
function toHeadingHtml(body) {
  return body
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/^[ \t]*#{2,4}[ \t]+(.+?)[ \t]*$/gm, '<h3>$1</h3>');
}

/**
 * @param {string} body 文章原始 body（frontmatter 之後的部分）
 * @returns {boolean} 是否存在 FAQ 區段起點（明確的「常見問題」標題，或全文 Q1/Q2 式標題）
 */
export function hasFaqSection(body) {
  const html = toHeadingHtml(body);
  // (1) 明確 FAQ 區段：與 faq.ts 的 `start` regex 同形。
  if (/<(h[234])>[^<]*(?:常見問題|FAQ|常見\s*Q\s*&\s*A)[^<]*<\/\1>/i.test(html)) return true;
  // (2) 全文 Q 起頭標題：與 faq.ts 的 `qre` 同形（醫療 AI 系列常用）。
  return /<(h[234])>\s*Q\s*\d+[\s\S]*?<\/\1>/i.test(html);
}
