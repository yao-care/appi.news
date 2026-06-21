import { describe, it, expect } from 'vitest';
import {
  weekRanges,
  GA4_PROPERTY_ID,
  GSC_SITE,
  SLACK_CHANNEL,
  CATEGORY_CHANNELS,
  DEV_CHANNEL,
  channelForCategory,
} from './report-config.mjs';

describe('report-config 常數', () => {
  it('帶正式 ID', () => {
    expect(GA4_PROPERTY_ID).toBe('541946427');
    expect(GSC_SITE).toBe('sc-domain:appi.news');
    expect(SLACK_CHANNEL).toBe('C0BC4JRQJF6'); // 作者群（預設）
    expect(DEV_CHANNEL).toBe('C0BC4JJDR0C');
  });
});

describe('channelForCategory — 分類路由', () => {
  it('各分類對到自己的頻道', () => {
    expect(channelForCategory('tech')).toBe('C0BC105LB18');
    expect(channelForCategory('international')).toBe('C0BBKF9TN23');
    expect(channelForCategory('sports')).toBe('C0BC106C42E');
    expect(channelForCategory('lifestyle')).toBe('C0BBXBJ7W4V');
  });
  it('未知/未給 → 預設頻道', () => {
    expect(channelForCategory('nope')).toBe(SLACK_CHANNEL);
    expect(channelForCategory(undefined)).toBe(SLACK_CHANNEL);
  });
  it('CATEGORY_CHANNELS 七個分類齊全', () => {
    expect(Object.keys(CATEGORY_CHANNELS).sort()).toEqual(
      ['finance', 'focus', 'health', 'international', 'lifestyle', 'sports', 'tech'].sort(),
    );
  });
});

describe('weekRanges', () => {
  it('回本週與上週各 7 天、不重疊、格式 YYYY-MM-DD', () => {
    const r = weekRanges(new Date('2026-06-16T00:00:00Z'));
    expect(r.cur).toEqual({ start: '2026-06-09', end: '2026-06-15' });
    expect(r.prev).toEqual({ start: '2026-06-02', end: '2026-06-08' });
  });
});
