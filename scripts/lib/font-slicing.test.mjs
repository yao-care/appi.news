import { describe, it, expect } from 'vitest';
import { partitionCodepoints, unicodeRange, faceCss, replaceFontFaces } from './font-slicing.mjs';

describe('partitionCodepoints', () => {
  it('涵蓋全部唯一字、不超過 target、段間不重疊且遞增', () => {
    const text = 'abc一二三四五';
    const slices = partitionCodepoints(text, 3);
    const all = slices.flatMap((s) => [...s.chars]);
    expect(new Set(all)).toEqual(new Set([...text]));
    for (const s of slices) expect([...s.chars].length).toBeLessThanOrEqual(3);
    for (let i = 1; i < slices.length; i++) expect(slices[i - 1].max).toBeLessThan(slices[i].min);
  });
  it('去重重複字', () => {
    const slices = partitionCodepoints('aaabbb', 10);
    expect(slices).toHaveLength(1);
    expect([...slices[0].chars].sort()).toEqual(['a', 'b']);
  });
});

describe('unicodeRange', () => {
  it('區間格式', () => {
    expect(unicodeRange(0x4e00, 0x9fff)).toBe('U+4e00-9fff');
  });
  it('min==max 為單點', () => {
    expect(unicodeRange(0x4e00, 0x4e00)).toBe('U+4e00');
  });
});

describe('faceCss', () => {
  it('含 optional 與 family/weight/url/unicode-range', () => {
    const css = faceCss({ family: 'Noto Sans TC', weight: 400, url: '/x/a.woff2', range: 'U+4e00-50ff' });
    expect(css).toContain("font-family:'Noto Sans TC'");
    expect(css).toContain('font-weight:400');
    expect(css).toContain('font-display:optional');
    expect(css).toContain("src:url(/x/a.woff2) format('woff2')");
    expect(css).toContain('unicode-range:U+4e00-50ff');
  });
});

describe('replaceFontFaces', () => {
  const base = 'noto-sans-tc-chinese-traditional-400-normal';
  it('移除參照 baseName 的 @font-face 並於尾端插入新規則', () => {
    const css = `a{color:red}@font-face{font-family:'Noto Sans TC';src:url(/_astro/${base}.abc.woff2) format("woff2")}b{color:blue}`;
    const { css: out, changed } = replaceFontFaces(css, base, ['@font-face{X}', '@font-face{Y}']);
    expect(changed).toBe(true);
    expect(out).not.toContain(base);
    expect(out).toContain('@font-face{X}@font-face{Y}');
    expect(out).toContain('a{color:red}');
    expect(out).toContain('b{color:blue}');
  });
  it('其他 family 不動、回報 changed=false', () => {
    const css = `@font-face{font-family:'Inter';src:url(/_astro/inter-latin-400.woff2) format("woff2")}`;
    const { css: out, changed } = replaceFontFaces(css, base, ['@font-face{X}']);
    expect(changed).toBe(false);
    expect(out).toBe(css);
  });
});
