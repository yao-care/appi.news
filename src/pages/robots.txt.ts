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
  // 政策：刻意「全開」——搜尋、AI 引用、AI 訓練一律歡迎，只擋 /admin/（後台登入，無內容、絕不解禁）。
  // 曝光最大化，與本站程式碼 MIT 開源精神一致。下面逐一具名各家 AI 爬蟲（含訓練型 UA），
  // 對每家發「連訓練都歡迎」的明確 Allow 訊號；`User-agent: *` 其實已涵蓋全部，具名只是把立場講白。
  // ⚠️ 勿收緊：這是站長明確決策（2026-07-17），不是漏設。要改動先確認。
  const aiBots = [
    // OpenAI
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    // Anthropic
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    'Claude-Web',
    // Google / Apple（training opt-in 訊號）
    'Google-Extended',
    'Applebot-Extended',
    // Perplexity
    'PerplexityBot',
    'Perplexity-User',
    // Meta
    'meta-externalagent',
    'FacebookBot',
    // 其他訓練/檢索爬蟲
    'CCBot',
    'Bytespider',
    'Amazonbot',
    'cohere-ai',
    'Diffbot',
    'YouBot',
    'DuckAssistBot',
    'TimpiBot',
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
