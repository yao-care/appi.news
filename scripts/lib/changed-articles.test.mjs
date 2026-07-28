import { describe, it, expect } from 'vitest';
import { parsePorcelain } from './changed-articles.mjs';

describe('parsePorcelain', () => {
  it('未追蹤＝new、已追蹤有改＝update，非 .md 一律忽略', () => {
    const out = [
      '?? src/content/articles/foo-bar.md',
      ' M src/content/articles/baz.md',
      'M  src/content/articles/qux.md',
      '?? public/covers/foo-cover.webp',
      '',
    ].join('\n');
    expect(parsePorcelain(out)).toEqual([
      { slug: 'foo-bar', action: 'new' },
      { slug: 'baz', action: 'update' },
      { slug: 'qux', action: 'update' },
    ]);
  });
  it('帶引號的路徑（含空白/非 ASCII）去引號', () => {
    expect(parsePorcelain('?? "src/content/articles/a b.md"')).toEqual([{ slug: 'a b', action: 'new' }]);
  });
  it('空輸入回空陣列', () => {
    expect(parsePorcelain('')).toEqual([]);
    expect(parsePorcelain(null)).toEqual([]);
  });
});
