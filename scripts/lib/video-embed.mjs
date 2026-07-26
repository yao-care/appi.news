// 文章內「影片出處卡」的 HTML 組裝（純函式、零 I/O、可單元測試）。
//
// 為什麼不用 YouTube <iframe>：站上效能基準是 mobile 90+／TBT 0／CLS 0（PERFORMANCE.md §4），
// 一個 YouTube 播放器會拉進數百 KB 第三方 JS，就算 lazy 也會壓垮 TBT。
// 這裡改用「本地縮圖 + 連出去 YouTube」的 facade：零第三方請求、零 JS、寬高寫死＝CLS 0。
// 樣式在 src/styles/global.css 的 .video-embed（.article-body 內）。

/** HTML 屬性值轉義（同 ai-image.mjs 的做法，避免引號炸掉標籤）。 */
function attr(s = '') {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * 組影片出處卡。
 * @param {object} o
 * @param {string} o.url      YouTube 影片網址（原封不動，不要自己編）
 * @param {string} o.title    影片標題
 * @param {string} o.channel  頻道名（出處署名用）
 * @param {string} o.src      本地縮圖路徑（/images/xxx-video.webp）
 * @param {number} o.width    縮圖寬（CLS 必填）
 * @param {number} o.height   縮圖高（CLS 必填）
 */
export function videoEmbed({ url, title, channel, src, width, height }) {
  if (!url || !/^https:\/\/www\.youtube\.com\/watch\?v=/.test(url)) {
    throw new Error('videoEmbed 需要 https://www.youtube.com/watch?v=... 形式的 url');
  }
  if (!src) throw new Error('videoEmbed requires src');
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error('videoEmbed requires numeric width and height (CLS safety)');
  }
  const label = `在 YouTube 觀看：${title}`;
  return [
    '<figure class="video-embed">',
    `  <a href="${attr(url)}" target="_blank" rel="noopener nofollow" aria-label="${attr(label)}">`,
    `    <img src="${attr(src)}" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${attr(title)}">`,
    '  </a>',
    `  <figcaption>影片來源：${attr(channel)}（YouTube）　<a href="${attr(url)}" target="_blank" rel="noopener nofollow">觀看原影片</a></figcaption>`,
    '</figure>',
  ].join('\n');
}
