import { SITE } from '@/config/site';
import { absoluteUrl } from './url';

type SiteUrl = URL | string | undefined;

export function orgLd(site: SiteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    legalName: SITE.org.legalName,
    description: SITE.description,
    url: absoluteUrl('/', site),
    foundingDate: String(SITE.org.foundingYear),
    logo: absoluteUrl(SITE.defaultOgImage, site),
  };
}

export function websiteLd(site: SiteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    alternateName: SITE.taglineEn,
    url: absoluteUrl('/', site),
    inLanguage: SITE.lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/search/', site)}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(
  site: SiteUrl,
  items: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path, site),
    })),
  };
}

export function personLd(
  site: SiteUrl,
  author: {
    name: string;
    path: string;
    jobTitle?: string;
    description?: string;
    image?: string;
    sameAs?: string[];
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: absoluteUrl(author.path, site),
    ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
    ...(author.description ? { description: author.description } : {}),
    ...(author.image ? { image: author.image } : {}),
    ...(author.sameAs && author.sameAs.length ? { sameAs: author.sameAs } : {}),
  };
}

export function articleLd(
  site: SiteUrl,
  a: {
    headline: string;
    description: string;
    path: string;
    image: string;
    datePublished: string;
    dateModified: string;
    authorName: string;
    authorPath?: string;
    section?: string;
    isNews?: boolean;
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': a.isNews ? 'NewsArticle' : 'Article',
    headline: a.headline,
    description: a.description,
    image: [a.image],
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    inLanguage: SITE.lang,
    ...(a.section ? { articleSection: a.section } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(a.path, site),
    },
    author: {
      '@type': 'Person',
      name: a.authorName,
      ...(a.authorPath ? { url: absoluteUrl(a.authorPath, site) } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(SITE.defaultOgImage, site),
      },
    },
  };
}
