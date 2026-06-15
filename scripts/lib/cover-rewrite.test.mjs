import { describe, it, expect } from 'vitest';
import { findArticleCoverSrc, replaceArticleCoverSrc } from './cover-rewrite.mjs';

const tag =
  '<img src="/appi.news/covers/wp-426.jpg" alt="封面" class="article-cover" loading="eager" data-fallback="/appi.news/og/health.png" onerror="x">';
const html = `<div>before</div>${tag}<p>after</p>`;

describe('findArticleCoverSrc', () => {
  it('抓到 article-cover 的 src（src 在 class 之前也行）', () => {
    expect(findArticleCoverSrc(html)).toBe('/appi.news/covers/wp-426.jpg');
  });
  it('沒有 article-cover 時回 null', () => {
    expect(findArticleCoverSrc('<img src="/x.jpg" class="other">')).toBeNull();
  });
});

describe('replaceArticleCoverSrc', () => {
  it('只換 article-cover 的 src，其餘屬性與內容不動', () => {
    const out = replaceArticleCoverSrc(html, '/appi.news/covers/wp-426-a900.abcd1234.webp');
    expect(out).toContain('src="/appi.news/covers/wp-426-a900.abcd1234.webp"');
    expect(out).not.toContain('covers/wp-426.jpg');
    expect(out).toContain('class="article-cover"');
    expect(out).toContain('data-fallback="/appi.news/og/health.png"');
    expect(out).toContain('<p>after</p>');
  });
});
