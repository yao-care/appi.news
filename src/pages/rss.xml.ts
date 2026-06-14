import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE } from '@/config/site';
import { getPublishedArticles, getAuthorMap, articleSlug } from '@/utils/content';
import { url, absoluteUrl } from '@/utils/url';

const parser = new MarkdownIt({ html: true });

/** 把內文 root-relative 的 /images、/covers 等資產改成絕對網址（feed reader 需要） */
function absolutizeAssets(html: string, site: URL | string | undefined): string {
  if (!site) return html;
  return html.replace(/(src|href)="(\/[^"]*)"/g, (_m, attr, path) => {
    if (path.startsWith('//')) return `${attr}="${path}"`;
    return `${attr}="${absoluteUrl(path, site)}"`;
  });
}

export async function GET(context: APIContext) {
  const site = context.site;
  const articles = await getPublishedArticles();
  const authorMap = await getAuthorMap();
  return rss({
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
    site: site ?? SITE.taglineEn,
    items: articles.slice(0, 30).map((a) => {
      const author = authorMap.get(a.data.author);
      const html = sanitizeHtml(parser.render(a.body ?? ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
        },
      });
      return {
        title: a.data.title,
        description: a.data.description,
        pubDate: a.data.publishDate,
        link: url(`/articles/${articleSlug(a)}/`),
        categories: a.data.tags,
        author: author?.data.name ?? 'APPI 編輯部',
        content: absolutizeAssets(html, site),
      };
    }),
    customData: `<language>zh-Hant</language>`,
  });
}
