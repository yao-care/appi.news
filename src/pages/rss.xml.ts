import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/config/site';
import { getPublishedArticles, articleSlug } from '@/utils/content';
import { url } from '@/utils/url';

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();
  return rss({
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
    site: context.site ?? SITE.taglineEn,
    items: articles.slice(0, 30).map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.publishDate,
      link: url(`/articles/${articleSlug(a)}/`),
      categories: a.data.tags,
    })),
    customData: `<language>zh-Hant</language>`,
  });
}
