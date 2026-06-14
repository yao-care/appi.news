import type { APIContext } from 'astro';
import { SITE } from '@/config/site';
import { getPublishedArticles, articleSlug } from '@/utils/content';
import { getCategoryName } from '@/config/categories';
import { absoluteUrl } from '@/utils/url';
import { isoDate } from '@/utils/date';
import { buildLlmsFullTxt } from '@/utils/llms';

export async function GET(context: APIContext) {
  const site = context.site;
  const articles = await getPublishedArticles();
  const body = buildLlmsFullTxt({
    name: SITE.name,
    homeUrl: absoluteUrl('/', site),
    articles: articles.map((a) => ({
      title: a.data.title,
      url: absoluteUrl(`/articles/${articleSlug(a)}/`, site),
      date: isoDate(a.data.publishDate).slice(0, 10),
      category: getCategoryName(a.data.category),
      description: a.data.description,
      highlights: a.data.highlights,
    })),
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
