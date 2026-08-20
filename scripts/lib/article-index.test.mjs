import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { articleFrontmatter, articleTitle, listArticleFrontmatters, recentTitles } from './article-index.mjs';

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'ai-'));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return dir;
}

const daysAgo = (n) => new Date(Date.now() - n * 86400 * 1000).toISOString();

describe('articleFrontmatter / articleTitle', () => {
  it('讀 frontmatter；讀不到回空值不 throw', () => {
    const dir = fixture({ 'a.md': `---\ntitle: 標題A\ncategory: tech\n---\n內文` });
    expect(articleFrontmatter('a', { articlesDir: dir })).toMatchObject({ title: '標題A', category: 'tech' });
    expect(articleTitle('a', { articlesDir: dir })).toBe('標題A');
    expect(articleTitle('missing', { articlesDir: dir })).toBe('');
    expect(articleFrontmatter('missing', { articlesDir: dir })).toEqual({});
  });
});

describe('listArticleFrontmatters', () => {
  it('列出 slug/data/raw；壞檔略過、目錄不存在回空陣列', () => {
    const dir = fixture({
      'a.md': `---\ntitle: A\n---\n本文帶 class="video-embed" 標記`,
      'broken.md': '沒有 frontmatter',
      'not-md.txt': 'x',
    });
    const list = listArticleFrontmatters({ articlesDir: dir });
    expect(list.map((e) => e.slug)).toEqual(['a']);
    expect(list[0].raw).toContain('video-embed');
    expect(listArticleFrontmatters({ articlesDir: '/no/such/dir' })).toEqual([]);
  });
});

describe('recentTitles', () => {
  it('依 publishDate 截止、filter 用 data/slug/raw 自訂條件', () => {
    const dir = fixture({
      'tech-new.md': `---\ntitle: 新科技文\ncategory: tech\npublishDate: "${daysAgo(3)}"\n---\nx`,
      'tech-old.md': `---\ntitle: 舊科技文\ncategory: tech\npublishDate: "${daysAgo(90)}"\n---\nx`,
      'health-new.md': `---\ntitle: 新健康文\ncategory: health\npublishDate: "${daysAgo(3)}"\n---\nx`,
      'civic-services-2026.md': `---\ntitle: 便民\npublishDate: "${daysAgo(1)}"\n---\nx`,
    });
    expect(recentTitles({ days: 30, articlesDir: dir, filter: (e) => e.data.category === 'tech' })).toEqual(['新科技文']);
    expect(recentTitles({ days: 30, articlesDir: dir, filter: (e) => e.slug.startsWith('civic-services') })).toEqual(['便民']);
    expect(recentTitles({ days: 30, articlesDir: dir })).toHaveLength(3);
  });
  it('filter 丟例外當不命中，不炸整個索引', () => {
    const dir = fixture({ 'a.md': `---\ntitle: A\npublishDate: "${daysAgo(1)}"\n---\nx` });
    expect(recentTitles({ articlesDir: dir, filter: () => { throw new Error('boom'); } })).toEqual([]);
  });
});
