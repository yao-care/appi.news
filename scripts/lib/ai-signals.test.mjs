import { describe, it, expect } from 'vitest';
import { acquisitionBucket, acquisitionSplit, aiHostBreakdown, aiLandingPages } from './ai-signals.mjs';

// source, medium, users, sessions, engSec
const row = (source, medium, users, sessions, engSec) => ({
  dimensionValues: [{ value: source }, { value: medium }],
  metricValues: [{ value: String(users) }, { value: String(sessions) }, { value: String(engSec) }],
});
const lp = (path, users) => ({ dimensionValues: [{ value: path }], metricValues: [{ value: String(users) }] });

describe('acquisitionBucket', () => {
  it('organic medium → seo', () => {
    expect(acquisitionBucket('google', 'organic')).toBe('seo');
    expect(acquisitionBucket('bing', 'organic')).toBe('seo');
  });
  it('AI host → ai（優先於 medium 判定）', () => {
    expect(acquisitionBucket('chatgpt.com', 'referral')).toBe('ai');
    expect(acquisitionBucket('perplexity.ai', 'referral')).toBe('ai');
    expect(acquisitionBucket('www.perplexity.ai', 'referral')).toBe('ai');
  });
  it('其餘 → other', () => {
    expect(acquisitionBucket('(direct)', '(none)')).toBe('other');
    expect(acquisitionBucket('t.co', 'referral')).toBe('other');
    expect(acquisitionBucket('facebook.com', 'referral')).toBe('other');
  });
});

describe('acquisitionSplit', () => {
  const report = {
    rows: [
      row('google', 'organic', 100, 120, 6000),
      row('bing', 'organic', 20, 22, 1000),
      row('chatgpt.com', 'referral', 10, 11, 900),
      row('perplexity.ai', 'referral', 5, 5, 600),
      row('(direct)', '(none)', 50, 60, 1500),
    ],
  };
  it('三桶各自加總人數/工作階段/互動秒數', () => {
    const s = acquisitionSplit(report);
    expect(s.seo.users).toBe(120);
    expect(s.seo.sessions).toBe(142);
    expect(s.ai.users).toBe(15);
    expect(s.other.users).toBe(50);
  });
  it('avgEngagedSecPerUser = 互動秒數 / 人數（四捨五入）', () => {
    const s = acquisitionSplit(report);
    expect(s.seo.avgEngagedSecPerUser).toBe(Math.round(7000 / 120));
    expect(s.ai.avgEngagedSecPerUser).toBe(Math.round(1500 / 15));
  });
  it('空報告三桶皆 0、不除以零', () => {
    const s = acquisitionSplit({ rows: [] });
    expect(s.seo.users).toBe(0);
    expect(s.ai.avgEngagedSecPerUser).toBe(0);
  });
});

describe('aiHostBreakdown', () => {
  it('只留 AI 來源、逐 host 加總、依人數排序', () => {
    const report = {
      rows: [
        row('google', 'organic', 100, 120, 6000),
        row('chatgpt.com', 'referral', 10, 11, 900),
        row('perplexity.ai', 'referral', 5, 5, 600),
      ],
    };
    const out = aiHostBreakdown(report);
    expect(out.map((h) => h.host)).toEqual(['chatgpt.com', 'perplexity.ai']);
    expect(out[0].users).toBe(10);
    expect(out[1].avgEngagedSecPerUser).toBe(Math.round(600 / 5));
  });
});

describe('aiLandingPages', () => {
  it('依人數排序取前 n', () => {
    const report = { rows: [lp('/a/', 3), lp('/b/', 9), lp('/c/', 1)] };
    expect(aiLandingPages(report, 2)).toEqual([
      { path: '/b/', users: 9 },
      { path: '/a/', users: 3 },
    ]);
  });
});
