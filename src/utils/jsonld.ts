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

export function faqLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
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
    author: {
      name: string;
      path?: string;
      image?: string;
      jobTitle?: string;
      sameAs?: string[];
    };
    section?: string;
    isNews?: boolean;
    keywords?: string[];
    about?: string[];
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
    ...(() => {
      const kw = (a.keywords ?? []).filter(Boolean);
      return kw.length ? { keywords: kw.join(', ') } : {};
    })(),
    ...(() => {
      const ab = (a.about ?? []).filter(Boolean);
      return ab.length ? { about: ab.map((name) => ({ '@type': 'Thing', name })) } : {};
    })(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(a.path, site),
    },
    author: {
      '@type': 'Person',
      name: a.author.name,
      ...(a.author.path ? { url: absoluteUrl(a.author.path, site) } : {}),
      ...(a.author.image ? { image: a.author.image } : {}),
      ...(a.author.jobTitle ? { jobTitle: a.author.jobTitle } : {}),
      ...(a.author.sameAs && a.author.sameAs.length ? { sameAs: a.author.sameAs } : {}),
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
