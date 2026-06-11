import { describe, it, expect } from 'vitest';
import { extractFaq } from './faq';

describe('extractFaq', () => {
  it('extracts Q&A from an explicit 常見問題 section', () => {
    const body = `
<h2>內文</h2>
<p>正文段落。</p>
<h2>常見問題（FAQ）</h2>
<h3>Q1｜這安全嗎？</h3>
<p>多數情況下是安全的，但仍應諮詢專業人員。</p>
<h3>Q2｜需要多久？</h3>
<p>通常需要數週時間才會見效。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[0].question).toBe('這安全嗎？');
    expect(faq[0].answer).toContain('安全');
  });

  it('detects Q-prefixed headings without an explicit FAQ section', () => {
    const body = `
<h3>Q1：這是什麼？</h3>
<p>這是一個說明段落，內容足夠長。</p>
<h3>Q2：怎麼用？</h3>
<p>依照步驟操作即可完成設定。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[1].question).toBe('怎麼用？');
  });

  it('excludes 參考文獻 / 免責 headings and dedupes', () => {
    const body = `
<h2>常見問題</h2>
<h3>真的有效嗎？</h3>
<p>研究顯示有一定效果。</p>
<h2>參考文獻</h2>
<h3>來源清單</h3>
<p>不應被當成問題。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(1);
    expect(faq[0].question).toBe('真的有效嗎？');
  });

  it('returns empty when there is no FAQ', () => {
    expect(extractFaq('<h2>前言</h2><p>沒有問答。</p>')).toEqual([]);
  });
});
