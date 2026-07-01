import { describe, it, expect } from 'vitest';
import {
  QUESTION_SET,
  flatQuestions,
  competitorsFor,
  hostOf,
  hostMatches,
  classifyCitedUrls,
  competitorName,
} from './geo-question-set.mjs';

describe('題庫', () => {
  it('7 分類、每類 3 題、皆非空、不含專欄', () => {
    expect(QUESTION_SET).toHaveLength(7);
    for (const c of QUESTION_SET) expect(c.questions).toHaveLength(3);
    expect(QUESTION_SET.map((c) => c.category)).not.toContain('columns');
  });
  it('flatQuestions 攤平成 21 題、每題帶 category', () => {
    const f = flatQuestions();
    expect(f).toHaveLength(21);
    expect(f[0]).toHaveProperty('question');
    expect(f[0]).toHaveProperty('category');
  });
});

describe('hostOf / hostMatches', () => {
  it('取 hostname、去 www.', () => {
    expect(hostOf('https://www.appi.news/articles/x/')).toBe('appi.news');
    expect(hostOf('not a url')).toBe('');
  });
  it('相等或子網域才命中', () => {
    expect(hostMatches('appi.news', 'appi.news')).toBe(true);
    expect(hostMatches('m.appi.news', 'appi.news')).toBe(true);
    expect(hostMatches('notappi.news', 'appi.news')).toBe(false);
  });
});

describe('competitorsFor', () => {
  it('分類專屬 + 共通、domain 去重', () => {
    const fin = competitorsFor('finance').map((c) => c.domain);
    expect(fin).toContain('businessweekly.com.tw'); // 商周
    expect(fin).toContain('hbrtaiwan.com'); // 哈佛商業評論
    expect(fin).toContain('cna.com.tw'); // 共通
    expect(new Set(fin).size).toBe(fin.length);
  });
});

describe('classifyCitedUrls', () => {
  it('本站被引用 → cited/rank/url，rank 是 1-based 顯著度序', () => {
    const r = classifyCitedUrls(
      ['https://cnyes.com/a', 'https://appi.news/articles/x/', 'https://cw.com.tw/b'],
      'finance',
    );
    expect(r.cited).toBe(true);
    expect(r.rank).toBe(2);
    expect(r.url).toBe('https://appi.news/articles/x/');
  });
  it('沒有本站 → cited false、rank null', () => {
    const r = classifyCitedUrls(['https://money.udn.com/x'], 'finance');
    expect(r.cited).toBe(false);
    expect(r.rank).toBeNull();
  });
  it('競品命中去重、跨分類共通媒體也算', () => {
    const r = classifyCitedUrls(
      ['https://money.udn.com/x', 'https://www.businessweekly.com.tw/y', 'https://cna.com.tw/z'],
      'finance',
    );
    expect(r.competitors).toContain('money.udn.com');
    expect(r.competitors).toContain('businessweekly.com.tw');
    expect(r.competitors).toContain('cna.com.tw');
  });
  it('巢狀網域取最specific：良醫(health.businessweekly) 不誤判成商周', () => {
    const r = classifyCitedUrls(['https://health.businessweekly.com.tw/x'], 'health');
    expect(r.competitors).toEqual(['health.businessweekly.com.tw']);
    expect(r.competitors).not.toContain('businessweekly.com.tw');
  });
});

describe('competitorName', () => {
  it('domain → 顯示名，查不到回自己', () => {
    expect(competitorName('businessweekly.com.tw')).toBe('商業周刊');
    expect(competitorName('hbrtaiwan.com')).toBe('哈佛商業評論');
    expect(competitorName('unknown.com')).toBe('unknown.com');
  });
});
