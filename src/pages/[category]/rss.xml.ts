import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { CATEGORIES } from '@/config/categories';
import { SITE } from '@/config/site';
import { getPublishedArticles, getAuthorMap, byCategory } from '@/utils/content';
import { toRssItems } from '@/utils/rss';

// 各分類一支 feed（/<category>/rss.xml），供 Google Publisher Center 的 section
// 對應分類來源。columns 由 /columns/ 專屬路由處理，比照 [category]/index.astro 排除。
export function getStaticPaths() {
  return CATEGORIES.filter((c) => c.slug !== 'columns').map((c) => ({
    params: { category: c.slug },
    props: { category: c },
  }));
}

export async function GET(context: APIContext) {
  const site = context.site;
  const { category } = context.props as { category: (typeof CATEGORIES)[number] };
  const articles = byCategory(await getPublishedArticles(), category.slug);
  const authorMap = await getAuthorMap();
  return rss({
    title: `${SITE.name}｜${category.name}`,
    description: category.description,
    site: site ?? SITE.taglineEn,
    items: toRssItems(articles.slice(0, 30), authorMap, site),
    customData: `<language>zh-Hant</language>`,
  });
}
