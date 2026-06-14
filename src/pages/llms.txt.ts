import type { APIContext } from 'astro';
import { SITE } from '@/config/site';
import { CATEGORIES } from '@/config/categories';
import {
  getPublishedArticles,
  getAuthors,
  authorHasPage,
  articleSlug,
} from '@/utils/content';
import { absoluteUrl } from '@/utils/url';
import { buildLlmsTxt } from '@/utils/llms';

export async function GET(context: APIContext) {
  const site = context.site;
  const articles = await getPublishedArticles();
  const authors = (await getAuthors()).filter((a) => a.data.active && authorHasPage(a));

  const body = buildLlmsTxt({
    name: SITE.name,
    tagline: SITE.tagline,
    description: SITE.description,
    homeUrl: absoluteUrl('/', site),
    fullTxtUrl: absoluteUrl('/llms-full.txt', site),
    sitemapUrl: absoluteUrl('/sitemap-index.xml', site),
    rssUrl: absoluteUrl('/rss.xml', site),
    authors: authors.map((a) => ({
      name: a.data.name,
      title: a.data.displayTitle,
      url: absoluteUrl(`/authors/${a.id}/`, site),
      specialties: a.data.specialties,
    })),
    categories: CATEGORIES.map((c) => ({
      name: c.name,
      description: c.description,
      url: absoluteUrl(`/${c.slug}/`, site),
    })),
    articles: articles.slice(0, 20).map((a) => ({
      title: a.data.title,
      url: absoluteUrl(`/articles/${articleSlug(a)}/`, site),
      description: a.data.description,
    })),
  });

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
