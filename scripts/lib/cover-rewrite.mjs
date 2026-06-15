// 純函式：定位文章封面 <img class="article-cover"> 並讀/換其 src。
const COVER_RE = /<img\b[^>]*\bclass="[^"]*\barticle-cover\b[^"]*"[^>]*>/;

export function findArticleCoverSrc(html) {
  const tag = html.match(COVER_RE);
  if (!tag) return null;
  const m = tag[0].match(/\bsrc="([^"]+)"/);
  return m ? m[1] : null;
}

export function replaceArticleCoverSrc(html, newSrc) {
  return html.replace(COVER_RE, (tag) =>
    tag.replace(/\bsrc="[^"]+"/, `src="${newSrc}"`),
  );
}
