import type { APIContext } from 'astro';
import { absoluteUrl } from '@/utils/url';

/**
 * /sitemap.xml 別名頁。
 *
 * @astrojs/sitemap 產出的主索引是 /sitemap-index.xml（符合規格），
 * 但部分 SEO 工具與爬蟲會直接探測 /sitemap.xml 並在 404 時誤判站台無 sitemap。
 * 此頁輸出合法的 <sitemapindex> 並在 <loc> 中指向真正的索引，
 * 讓 /sitemap.xml 回 200 且爬蟲可順著連結找到完整的 sitemap 集合。
 *
 * 不動 @astrojs/sitemap 既有輸出，不動 previewPaths 排除邏輯。
 */
export async function GET(context: APIContext) {
  const sitemapIndexUrl = absoluteUrl('/sitemap-index.xml', context.site);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemapIndexUrl}</loc>
  </sitemap>
</sitemapindex>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
