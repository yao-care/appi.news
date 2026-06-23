import type { APIContext } from 'astro';
import { SITE } from '@/config/site';
import { getPublishedArticles, articleSlug } from '@/utils/content';
import { absoluteUrl } from '@/utils/url';

/**
 * Google News sitemap。
 * Google News 只吃「近兩天內發佈」的文章，故這裡只收最近 48 小時內
 * （以 publishDate 判斷）的已發佈文章；48h 內若無文章則輸出合法的空 <urlset>。
 * 規格：https://support.google.com/news/publisher-center/answer/9606710
 */

const NEWS_NS = 'http://www.google.com/schemas/sitemap-news/0.9';
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const WINDOW_MS = 48 * 60 * 60 * 1000;
// Google News 的 news:language 對中文只認 zh-cn / zh-tw（非 BCP-47 的 zh-Hant）；
// 故此處固定 zh-tw，不沿用 SITE.lang（後者 zh-Hant 用於 HTML lang 屬性是對的）。
const NEWS_LANGUAGE = 'zh-tw';

/** XML 特殊字元跳脫（標題可能含 & < > " '） */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const site = context.site;
  const now = Date.now();
  const articles = (await getPublishedArticles()).filter(
    (a) => now - a.data.publishDate.getTime() <= WINDOW_MS,
  );

  const urls = articles
    .map((a) => {
      const loc = absoluteUrl(`/articles/${articleSlug(a)}/`, site);
      return [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        '    <news:news>',
        '      <news:publication>',
        `        <news:name>${xmlEscape(SITE.name)}</news:name>`,
        `        <news:language>${NEWS_LANGUAGE}</news:language>`,
        '      </news:publication>',
        `      <news:publication_date>${a.data.publishDate.toISOString()}</news:publication_date>`,
        `      <news:title>${xmlEscape(a.data.title)}</news:title>`,
        '    </news:news>',
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NS}" xmlns:news="${NEWS_NS}">
${urls}${urls ? '\n' : ''}</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
