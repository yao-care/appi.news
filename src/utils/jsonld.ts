import { SITE } from '@/config/site';
import { absoluteUrl } from './url';

type SiteUrl = URL | string | undefined;

/** 全站共用的穩定實體 @id：讓多個 JSON-LD 區塊（含跨頁）由消費端依 @id 合併成同一實體。 */
export const orgId = (site: SiteUrl) => `${absoluteUrl('/', site)}#organization`;
export const websiteId = (site: SiteUrl) => `${absoluteUrl('/', site)}#website`;
export const personId = (site: SiteUrl, path: string) =>
  `${absoluteUrl(path, site)}#person`;

export function orgLd(site: SiteUrl) {
  const sameAs = (SITE.org.sameAs ?? []).filter(Boolean);
  const contactEmail = SITE.org.contactEmail?.trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': orgId(site),
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
    '@id': websiteId(site),
    name: SITE.name,
    alternateName: SITE.taglineEn,
    url: absoluteUrl('/', site),
    inLanguage: SITE.lang,
    publisher: { '@id': orgId(site) },
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
    /** 專長領域 → schema.org knowsAbout，向 AI 標示作者權威領域 */
    knowsAbout?: string[];
    /** 學經歷／資格 → schema.org hasCredential */
    credentials?: string[];
    /** 機構/團隊署名（如編輯部）→ 以 Organization 呈現，省略 jobTitle */
    isOrganization?: boolean;
  },
) {
  const knowsAbout = (author.knowsAbout ?? []).filter(Boolean);
  const credentials = (author.credentials ?? []).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': author.isOrganization ? 'Organization' : 'Person',
    '@id': personId(site, author.path),
    name: author.name,
    url: absoluteUrl(author.path, site),
    ...(author.jobTitle && !author.isOrganization ? { jobTitle: author.jobTitle } : {}),
    ...(author.description ? { description: author.description } : {}),
    ...(author.image ? { image: author.image } : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(credentials.length
      ? {
          hasCredential: credentials.map((c) => ({
            '@type': 'EducationalOccupationalCredential',
            name: c,
          })),
        }
      : {}),
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
      knowsAbout?: string[];
      /** 機構/團隊署名（如編輯部）→ author 以 Organization 呈現 */
      isOrganization?: boolean;
    };
    section?: string;
    isNews?: boolean;
    keywords?: string[];
    about?: string[];
    /** 文章參考來源 → 輸出 schema.org citation，強化可溯源性與 AI 引用信任 */
    citations?: { title: string; url?: string; publisher?: string }[];
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': a.isNews ? 'NewsArticle' : 'Article',
    '@id': `${absoluteUrl(a.path, site)}#article`,
    headline: a.headline,
    description: a.description,
    image: [a.image],
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    inLanguage: SITE.lang,
    isPartOf: { '@id': websiteId(site) },
    ...(a.section ? { articleSection: a.section } : {}),
    ...(() => {
      const kw = (a.keywords ?? []).filter(Boolean);
      return kw.length ? { keywords: kw.join(', ') } : {};
    })(),
    ...(() => {
      const ab = (a.about ?? []).filter(Boolean);
      return ab.length ? { about: ab.map((name) => ({ '@type': 'Thing', name })) } : {};
    })(),
    ...(() => {
      const cites = (a.citations ?? []).filter((c) => c && c.title);
      return cites.length
        ? {
            citation: cites.map((c) => ({
              '@type': 'CreativeWork',
              name: c.title,
              ...(c.url ? { url: c.url } : {}),
              ...(c.publisher
                ? { publisher: { '@type': 'Organization', name: c.publisher } }
                : {}),
            })),
          }
        : {};
    })(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(a.path, site),
    },
    author: {
      '@type': a.author.isOrganization ? 'Organization' : 'Person',
      // 有作者頁時用與作者頁 Person 相同的 @id，讓消費端把「文章作者」與「作者實體」合併
      ...(a.author.path ? { '@id': personId(site, a.author.path) } : {}),
      name: a.author.name,
      ...(a.author.path ? { url: absoluteUrl(a.author.path, site) } : {}),
      ...(a.author.image ? { image: a.author.image } : {}),
      ...(a.author.jobTitle && !a.author.isOrganization ? { jobTitle: a.author.jobTitle } : {}),
      ...(() => {
        const ka = (a.author.knowsAbout ?? []).filter(Boolean);
        return ka.length ? { knowsAbout: ka } : {};
      })(),
      ...(a.author.sameAs && a.author.sameAs.length ? { sameAs: a.author.sameAs } : {}),
    },
    // publisher 以 @id 參照頁面上的 NewsMediaOrganization 節點（含 logo），避免重複定義
    publisher: { '@id': orgId(site) },
  };
}
