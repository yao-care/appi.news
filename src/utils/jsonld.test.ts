import { describe, it, expect } from 'vitest';
import { articleLd } from './jsonld.ts';

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
    expect(ld.keywords).toContain('LLM');
    expect(JSON.stringify(ld.about)).toContain('數位健康');
  });
  it('isNews 時型別為 NewsArticle', () => {
    const ld = articleLd(site, { ...baseArgs, isNews: true }) as any;
    expect(ld['@type']).toBe('NewsArticle');
  });
  it('author 無 path/image 時仍合法（只有 name）', () => {
    const ld = articleLd(site, { ...baseArgs, author: { name: '編輯部' } }) as any;
    expect(ld.author['@type']).toBe('Person');
    expect(ld.author.name).toBe('編輯部');
    expect(ld.author.url).toBeUndefined();
  });
});
