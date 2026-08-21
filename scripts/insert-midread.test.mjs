import { describe, it, expect } from 'vitest';
import { extractRelatedLinks, injectMidread } from './insert-midread.mjs';

const card = (href, title) => `<h3 class="acard-title"><a href="${href}">${title}</a></h3>`;
const page = (bodyH2s, related = true) => `
<div class="article-body">${'<p>x</p><h2>節</h2><p>y</p>'.repeat(bodyH2s)}</div>
<aside class="risks"><h2>風險與限制</h2></aside>
${related ? `<section class="related section"><div class="section-head"><h2>延伸閱讀</h2></div>${card('/articles/a/', 'A 文')}${card('/articles/b/', 'B 文')}${card('/articles/c/', 'C 文')}</section>` : ''}`;

describe('extractRelatedLinks', () => {
  it('抽延伸閱讀前 2 條、去重、剝 tag', () => {
    expect(extractRelatedLinks(page(3))).toEqual([
      { href: '/articles/a/', title: 'A 文' },
      { href: '/articles/b/', title: 'B 文' },
    ]);
  });
  it('無延伸閱讀回空陣列', () => {
    expect(extractRelatedLinks(page(3, false))).toEqual([]);
  });
});

describe('injectMidread', () => {
  it('body 內 h2 ≥3 才插、插在第 3 個 h2 前、且不越過文後 aside', () => {
    const out = injectMidread(page(3), [{ href: '/articles/a/', title: 'A 文' }]);
    expect(out).toContain('data-midread');
    expect(out.indexOf('data-midread')).toBeLessThan(out.indexOf('<aside class="risks"'));
    const third = [...out.matchAll(/<h2[\s>]/g)][2];
    expect(out.indexOf('data-midread')).toBeLessThan(third.index);
  });
  it('h2 不足 3 個不插（短文保持乾淨）', () => {
    expect(injectMidread(page(2), [{ href: '/a', title: 'A' }])).toBe(page(2));
  });
  it('冪等：已含 data-midread 不重插', () => {
    const once = injectMidread(page(3), [{ href: '/a', title: 'A' }]);
    expect(injectMidread(once, [{ href: '/a', title: 'A' }])).toBe(once);
  });
  it('文後 aside 的 h2 不算進 body 計數', () => {
    const html = page(2); // body 2 個 + risks 1 個 = 全頁 3 個，但 body 內只有 2
    expect(injectMidread(html, [{ href: '/a', title: 'A' }])).toBe(html);
  });
});
