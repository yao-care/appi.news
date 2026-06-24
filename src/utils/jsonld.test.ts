import { describe, it, expect } from 'vitest';
import { articleLd, articleSchemaType, isGoogleNewsEligible } from './jsonld.ts';

const site = 'https://yao-care.github.io/appi.news/';
const baseArgs = {
  headline: '標題',
  description: '描述',
  path: '/articles/post-1/',
  image: 'https://x/cover.webp',
  datePublished: '2026-06-14T09:00:00+08:00',
  dateModified: '2026-06-14T09:00:00+08:00',
  author: {
    name: 'CΛ / Lightman',
    path: '/authors/lightman/',
    image: 'https://x/lightman.jpg',
    jobTitle: '科技評論',
    sameAs: ['https://weiqi.kids/'],
  },
  section: '科技',
  keywords: ['LLM', '醫療AI'],
  about: ['數位健康'],
};

describe('articleLd', () => {
  it('author 展開為完整 Person（含 image/jobTitle/sameAs/url）', () => {
    const ld = articleLd(site, baseArgs) as any;
    expect(ld.author['@type']).toBe('Person');
    expect(ld.author.name).toBe('CΛ / Lightman');
    expect(ld.author.image).toBe('https://x/lightman.jpg');
    expect(ld.author.jobTitle).toBe('科技評論');
    expect(ld.author.sameAs).toContain('https://weiqi.kids/');
    expect(ld.author.url).toContain('/authors/lightman/');
  });
  it('keywords 與 about 輸出', () => {
    const ld = articleLd(site, baseArgs) as any;
    expect(ld.keywords).toBe('LLM, 醫療AI');
    expect(JSON.stringify(ld.about)).toContain('數位健康');
  });
  it('未傳 schemaType 時退到安全的 Article（不過度宣稱新聞）', () => {
    const ld = articleLd(site, baseArgs) as any;
    expect(ld['@type']).toBe('Article');
  });
  it('傳入 schemaType 時依其輸出 @type', () => {
    const ld = articleLd(site, { ...baseArgs, schemaType: 'NewsArticle' }) as any;
    expect(ld['@type']).toBe('NewsArticle');
    const ld2 = articleLd(site, { ...baseArgs, schemaType: 'AnalysisNewsArticle' }) as any;
    expect(ld2['@type']).toBe('AnalysisNewsArticle');
  });
  it('keywords/about 空陣列或空字串時不輸出該欄位', () => {
    const ld1 = articleLd(site, { ...baseArgs, keywords: [], about: [] }) as any;
    expect(ld1.keywords).toBeUndefined();
    expect(ld1.about).toBeUndefined();
    const ld2 = articleLd(site, { ...baseArgs, keywords: ['', 'AI'], about: [''] }) as any;
    expect(ld2.keywords).toBe('AI');
    expect(ld2.about).toBeUndefined();
  });
  it('author 無 path/image 時仍合法（只有 name）', () => {
    const ld = articleLd(site, { ...baseArgs, author: { name: '編輯部' } }) as any;
    expect(ld.author['@type']).toBe('Person');
    expect(ld.author.name).toBe('編輯部');
    expect(ld.author.url).toBeUndefined();
  });
  it('citations 輸出 schema.org citation（CreativeWork，含 url/publisher）', () => {
    const ld = articleLd(site, {
      ...baseArgs,
      citations: [
        { title: 'MCP 公告', url: 'https://example.com/mcp', publisher: 'Anthropic' },
        { title: '無連結來源' },
      ],
    }) as any;
    expect(ld.citation).toHaveLength(2);
    expect(ld.citation[0]['@type']).toBe('CreativeWork');
    expect(ld.citation[0].url).toBe('https://example.com/mcp');
    expect(ld.citation[0].publisher.name).toBe('Anthropic');
    expect(ld.citation[1].url).toBeUndefined();
  });
  it('citations 空陣列時不輸出 citation', () => {
    const ld = articleLd(site, { ...baseArgs, citations: [] }) as any;
    expect(ld.citation).toBeUndefined();
  });
});

describe('articleSchemaType', () => {
  it('時效新聞類 → NewsArticle', () => {
    for (const ct of ['news', 'feature', 'interview', 'video', 'photo-story']) {
      expect(articleSchemaType(ct)).toBe('NewsArticle');
    }
  });
  it('legacy 無 contentType（任意未列值）→ NewsArticle', () => {
    expect(articleSchemaType('')).toBe('NewsArticle');
  });
  it('分析類 → AnalysisNewsArticle', () => {
    expect(articleSchemaType('analysis')).toBe('AnalysisNewsArticle');
    expect(articleSchemaType('research-brief')).toBe('AnalysisNewsArticle');
  });
  it('評論類 → OpinionNewsArticle', () => {
    expect(articleSchemaType('column')).toBe('OpinionNewsArticle');
    expect(articleSchemaType('opinion')).toBe('OpinionNewsArticle');
  });
  it('常青/廣編/新聞稿 → Article', () => {
    expect(articleSchemaType('guide')).toBe('Article');
    expect(articleSchemaType('press-release')).toBe('Article');
    expect(articleSchemaType('sponsored')).toBe('Article');
  });
  it('sourceType 廣編/新聞稿覆寫為 Article（不論 contentType）', () => {
    expect(articleSchemaType('news', 'sponsored')).toBe('Article');
    expect(articleSchemaType('analysis', 'press-release')).toBe('Article');
  });
});

describe('isGoogleNewsEligible', () => {
  it('一般新聞與評論允許進 Google News', () => {
    expect(isGoogleNewsEligible('news', 'editorial')).toBe(true);
    expect(isGoogleNewsEligible('column', 'author')).toBe(true);
    expect(isGoogleNewsEligible('analysis', 'editorial')).toBe(true);
  });
  it('廣編/新聞稿/常青指南不得進 Google News', () => {
    expect(isGoogleNewsEligible('sponsored')).toBe(false);
    expect(isGoogleNewsEligible('press-release')).toBe(false);
    expect(isGoogleNewsEligible('guide')).toBe(false);
  });
  it('sourceType 廣編/新聞稿覆寫為不准入', () => {
    expect(isGoogleNewsEligible('news', 'sponsored')).toBe(false);
    expect(isGoogleNewsEligible('news', 'press-release')).toBe(false);
  });
});
