import type { APIContext } from 'astro';
import { absoluteUrl } from '@/utils/url';

export async function GET(context: APIContext) {
  const sitemapUrl = context.site
    ? new URL(
        `${import.meta.env.BASE_URL.replace(/\/+$/, '')}/sitemap-index.xml`.replace(/\/{2,}/g, '/'),
        context.site,
      ).toString()
    : '/sitemap-index.xml';
  const newsSitemapUrl = absoluteUrl('/news-sitemap.xml', context.site);
  const aiBots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'PerplexityBot',
    'Google-Extended',
    'CCBot',
    'Bytespider',
    'Amazonbot',
  ];
  const aiBlock =
    aiBots.map((b) => `User-agent: ${b}`).join('\n') +
    '\nAllow: /\nDisallow: /admin/\n';
  const body = `${aiBlock}
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${sitemapUrl}
Sitemap: ${newsSitemapUrl}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
