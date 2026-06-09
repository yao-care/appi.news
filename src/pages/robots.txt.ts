import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const sitemapUrl = context.site
    ? new URL(
        `${import.meta.env.BASE_URL.replace(/\/+$/, '')}/sitemap-index.xml`.replace(/\/{2,}/g, '/'),
        context.site,
      ).toString()
    : '/sitemap-index.xml';
  const body = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${sitemapUrl}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
