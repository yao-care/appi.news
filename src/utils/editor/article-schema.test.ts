import { describe, it, expect } from 'vitest';
import { validateArticleFrontmatter, CORE_FIELDS } from './article-schema';

describe('validateArticleFrontmatter', () => {
  const ok = {
    title: 't', description: 'd', publishDate: '2026-01-01', category: 'health',
  };
  it('接受合法 frontmatter（補預設後通過）', () => {
    const r = validateArticleFrontmatter(ok);
    expect(r.ok).toBe(true);
  });
  it('缺 title 回 ok:false 並標示欄位', () => {
    const r = validateArticleFrontmatter({ ...ok, title: undefined });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.path.includes('title'))).toBe(true);
  });
  it('category 非法值被擋', () => {
    const r = validateArticleFrontmatter({ ...ok, category: 'not-a-cat' });
    expect(r.ok).toBe(false);
  });
  it('CORE_FIELDS 含 category 且為 enum 型', () => {
    const cat = CORE_FIELDS.find((f) => f.key === 'category');
    expect(cat?.type).toBe('enum');
    expect(Array.isArray(cat?.options)).toBe(true);
  });
});
