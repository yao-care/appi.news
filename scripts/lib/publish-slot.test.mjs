import { describe, it, expect } from 'vitest';
import { nextOpenPublishDate, takenDatesFromContents } from './publish-slot.mjs';

describe('nextOpenPublishDate', () => {
  it('起算日就空 → 回起算日', () => {
    expect(nextOpenPublishDate([], '2026-06-20')).toBe('2026-06-20');
    expect(nextOpenPublishDate(['2026-06-19'], '2026-06-20')).toBe('2026-06-20');
  });

  it('起算日被佔 → 回下一個空的', () => {
    expect(nextOpenPublishDate(['2026-06-20'], '2026-06-20')).toBe('2026-06-21');
  });

  it('連續多天被佔 → 跳到第一個空的', () => {
    const taken = ['2026-06-20', '2026-06-21', '2026-06-22'];
    expect(nextOpenPublishDate(taken, '2026-06-20')).toBe('2026-06-23');
  });

  it('跨月正確進位', () => {
    const taken = ['2026-06-30'];
    expect(nextOpenPublishDate(taken, '2026-06-30')).toBe('2026-07-01');
  });

  it('接受 Set', () => {
    expect(nextOpenPublishDate(new Set(['2026-06-20']), '2026-06-20')).toBe('2026-06-21');
  });
});

describe('takenDatesFromContents', () => {
  it('從 frontmatter 文字抽出 publishDate 日期', () => {
    const a = 'title: x\npublishDate: "2026-06-16T20:00:00+08:00"\nstatus: published\n';
    const b = "publishDate: 2026-06-18\n";
    const set = takenDatesFromContents([a, b, 'no date here']);
    expect(set.has('2026-06-16')).toBe(true);
    expect(set.has('2026-06-18')).toBe(true);
    expect(set.size).toBe(2);
  });
});
