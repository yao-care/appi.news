import { SITE } from '@/config/site';
import { absoluteUrl } from './url';

type SiteUrl = URL | string | undefined;

export function orgLd(site: SiteUrl) {
  const sameAs = (SITE.org.sameAs ?? []).filter(Boolean);
  const contactEmail = SITE.org.contactEmail?.trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE.name,
    legalName: SITE.org.legalName,
    description: SITE.description,
    url: absoluteUrl('/', site),
    foundingDate: String(SITE.org.foundingYear),
    logo: absoluteUrl(SITE.defaultOgImage, site),
    ...(sameAs.length ? { sameAs } : {}),
    ...(contactEmail
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'editorial',
            email: contactEmail,
          },
        }
      : {}),
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
    /** 機構/團隊署名（如編輯部）→ 以 Organization 呈現，省略 jobTitle */
    isOrganization?: boolean;
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': author.isOrganization ? 'Organization' : 'Person',
    name: author.name,
    url: absoluteUrl(author.path, site),
    ...(author.jobTitle && !author.isOrganization ? { jobTitle: author.jobTitle } : {}),
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
      /** 機構/團隊署名（如編輯部）→ author 以 Organization 呈現 */
      isOrganization?: boolean;
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
      '@type': a.author.isOrganization ? 'Organization' : 'Person',
      name: a.author.name,
      ...(a.author.path ? { url: absoluteUrl(a.author.path, site) } : {}),
      ...(a.author.image ? { image: a.author.image } : {}),
      ...(a.author.jobTitle && !a.author.isOrganization ? { jobTitle: a.author.jobTitle } : {}),
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
