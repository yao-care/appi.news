import { describe, it, expect } from 'vitest';
import { buildLlmsTxt, buildLlmsFullTxt } from './llms.ts';

const base = {
  name: 'APPI News',
  tagline: '亞太專業觀點',
  description: 'APPI News｜亞太專業觀點…',
  homeUrl: 'https://yao-care.github.io/appi.news/',
  fullTxtUrl: 'https://yao-care.github.io/appi.news/llms-full.txt',
  sitemapUrl: 'https://yao-care.github.io/appi.news/sitemap-index.xml',
  rssUrl: 'https://yao-care.github.io/appi.news/rss.xml',
  authors: [
    { name: 'CΛ / Lightman', title: '科技評論', url: 'https://yao-care.github.io/appi.news/authors/lightman/', specialties: ['醫療 AI'] },
  ],
  categories: [
    { name: '科技', description: '追蹤 AI…', url: 'https://yao-care.github.io/appi.news/tech/' },
  ],
  articles: [
    { title: '測試文章', url: 'https://yao-care.github.io/appi.news/articles/post-1/', description: '一句描述' },
  ],
};

describe('buildLlmsTxt', () => {
  it('含品牌、作者、分類、文章與索引連結', () => {
    const out = buildLlmsTxt(base);
    expect(out).toContain('# APPI News');
    expect(out).toContain('亞太專業觀點');
    expect(out).toContain('CΛ / Lightman');
    expect(out).toContain('科技');
    expect(out).toContain('測試文章');
    expect(out).toContain('https://yao-care.github.io/appi.news/articles/post-1/');
    expect(out).toContain('/llms-full.txt');
    expect(out).toContain('sitemap-index.xml');
    expect(out).toContain('rss.xml');
    expect(out).toContain('引用'); // 含引用指引
  });
});

describe('buildLlmsFullTxt', () => {
  it('每篇含標題、網址、日期、描述與重點', () => {
    const out = buildLlmsFullTxt({
      name: 'APPI News',
      homeUrl: 'https://yao-care.github.io/appi.news/',
      articles: [
        { title: '測試文章', url: 'https://x/articles/post-1/', date: '2026-06-14', category: '科技', description: '一句描述', highlights: ['重點一', '重點二'] },
      ],
    });
    expect(out).toContain('測試文章');
    expect(out).toContain('https://x/articles/post-1/');
    expect(out).toContain('2026-06-14');
    expect(out).toContain('一句描述');
    expect(out).toContain('重點一');
    expect(out).toContain('重點二');
  });
});
