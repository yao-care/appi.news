import { describe, it, expect } from 'vitest';
import {
  isPrimarySourceHost,
  signalPresence,
  aggregateProfiles,
  checklist,
  gapVsOurs,
  SIGNALS,
} from './citeability.mjs';

// 高分被引用頁(全訊號具備)
const strong = {
  url: 'https://commonhealth.com.tw/article/1',
  answerUpfront: true, headingStructure: true, primarySourceCount: 3,
  hasData: true, authorByline: true, dateVisible: true, wordCount: 2000,
};
// 弱頁(幾乎都缺)
const weak = {
  url: 'https://example.com/x',
  answerUpfront: false, headingStructure: false, primarySourceCount: 0,
  hasData: false, authorByline: false, dateVisible: false, wordCount: 300,
};

describe('isPrimarySourceHost', () => {
  it('gov/edu 後綴與學術期刊算一手來源', () => {
    expect(isPrimarySourceHost('www.mohw.gov.tw')).toBe(true);
    expect(isPrimarySourceHost('ntu.edu.tw')).toBe(true);
    expect(isPrimarySourceHost('pubmed.ncbi.nlm.nih.gov')).toBe(true);
    expect(isPrimarySourceHost('who.int')).toBe(true);
  });
  it('一般媒體/商業站不算', () => {
    expect(isPrimarySourceHost('commonhealth.com.tw')).toBe(false);
    expect(isPrimarySourceHost('businessweekly.com.tw')).toBe(false);
    expect(isPrimarySourceHost('')).toBe(false);
  });
});

describe('signalPresence 門檻', () => {
  it('primarySources 需 ≥1、depth 需 ≥800 字', () => {
    const p = signalPresence({ primarySourceCount: 0, wordCount: 799 });
    expect(p.primarySources).toBe(false);
    expect(p.depth).toBe(false);
    const q = signalPresence({ primarySourceCount: 1, wordCount: 800 });
    expect(q.primarySources).toBe(true);
    expect(q.depth).toBe(true);
  });
  it('缺欄位不炸,視為 false', () => {
    const p = signalPresence({});
    expect(Object.values(p).every((v) => v === false)).toBe(true);
  });
});

describe('aggregateProfiles', () => {
  it('每訊號算具備比例、依比例排序', () => {
    const agg = aggregateProfiles([strong, weak]);
    expect(agg).toHaveLength(SIGNALS.length);
    // strong 全有、weak 全無 → 每訊號 rate 0.5
    expect(agg.every((s) => s.presentRate === 0.5)).toBe(true);
    expect(agg[0].total).toBe(2);
  });
  it('空輸入 → rate 0、不除零', () => {
    expect(aggregateProfiles([]).every((s) => s.presentRate === 0)).toBe(true);
  });
});

describe('checklist / gapVsOurs', () => {
  it('checklist 只留一致具備(≥threshold)的訊號', () => {
    // 三頁都 strong → 全訊號 rate 1 → 全上榜
    const cl = checklist([strong, strong, strong], 0.6);
    expect(cl).toHaveLength(SIGNALS.length);
    // 一 strong 兩 weak → rate 0.33 → 低於 0.6 → 空
    expect(checklist([strong, weak, weak], 0.6)).toHaveLength(0);
  });
  it('gapVsOurs 列「被引用頁一致有、我方缺」的訊號', () => {
    const ours = { answerUpfront: true, headingStructure: true, primarySourceCount: 0, hasData: false, authorByline: true, dateVisible: true, wordCount: 1500 };
    const gap = gapVsOurs([strong, strong], ours, 0.6);
    const keys = gap.map((g) => g.key);
    // 我方缺:一手來源、數據 → 應在 gap;已有的(結論前置/H2/作者/日期/深度)不在
    expect(keys).toContain('primarySources');
    expect(keys).toContain('hasData');
    expect(keys).not.toContain('answerUpfront');
  });
  it('我方無此文(ourProfile=null)→ 整份 checklist 都是待補', () => {
    const gap = gapVsOurs([strong, strong], null, 0.6);
    expect(gap).toHaveLength(SIGNALS.length);
    expect(gap.every((g) => g.ourHas === null)).toBe(true);
  });
});
