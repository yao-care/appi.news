import { describe, it, expect } from 'vitest';
import { inlineCssLinks } from './inline-css.mjs';

describe('inlineCssLinks', () => {
  it('把 _astro CSS link 換成內聯 style，外部 link 不動', () => {
    const html =
      '<link rel="stylesheet" href="/appi.news/_astro/a.css">' +
      '<link rel="stylesheet" href="https://cdn.example/ext.css">';
    const getCss = (f) => (f === 'a.css' ? 'body{color:red}' : null);
    const r = inlineCssLinks(html, getCss);
    expect(r.html).toContain('<style>body{color:red}</style>');
    expect(r.html).not.toContain('_astro/a.css');
    expect(r.html).toContain('href="https://cdn.example/ext.css"');
    expect(r.inlined).toBe(1);
    expect(r.bytes).toBe('body{color:red}'.length);
  });
  it('找不到 CSS 內容時保留原 link', () => {
    const html = '<link rel="stylesheet" href="/appi.news/_astro/missing.css">';
    const r = inlineCssLinks(html, () => null);
    expect(r.html).toBe(html);
    expect(r.inlined).toBe(0);
  });
  it('多個 _astro link 全部內聯', () => {
    const html =
      '<link rel="stylesheet" href="/x/_astro/a.css">' +
      '<link rel="stylesheet" href="/x/_astro/b.css">';
    const r = inlineCssLinks(html, (f) => (f === 'a.css' ? 'A{}' : 'B{}'));
    expect(r.inlined).toBe(2);
    expect(r.html).toContain('<style>A{}</style>');
    expect(r.html).toContain('<style>B{}</style>');
  });
});
