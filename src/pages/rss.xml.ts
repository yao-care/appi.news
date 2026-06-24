import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/config/site';
import { getPublishedArticles, getAuthorMap } from '@/utils/content';
import { toRssItems } from '@/utils/rss';

export async function GET(context: APIContext) {
  const site = context.site;
  const articles = await getPublishedArticles();
  const authorMap = await getAuthorMap();
  return rss({
    title: `${SITE.name}｜${SITE.tagline}`,
    description: SITE.description,
    site: site ?? SITE.taglineEn,
    items: toRssItems(articles.slice(0, 30), authorMap, site),
    customData: `<language>zh-Hant</language>`,
  });
}
