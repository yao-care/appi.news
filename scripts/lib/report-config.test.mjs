import { describe, it, expect } from 'vitest';
import { weekRanges, GA4_PROPERTY_ID, GSC_SITE, SLACK_CHANNEL } from './report-config.mjs';

describe('report-config 常數', () => {
  it('帶正式 ID', () => {
    expect(GA4_PROPERTY_ID).toBe('541946427');
    expect(GSC_SITE).toBe('sc-domain:appi.news');
    expect(SLACK_CHANNEL).toBe('C0AFYV3TAMV');
  });
});

describe('weekRanges', () => {
  it('回本週與上週各 7 天、不重疊、格式 YYYY-MM-DD', () => {
    const r = weekRanges(new Date('2026-06-16T00:00:00Z'));
    expect(r.cur).toEqual({ start: '2026-06-09', end: '2026-06-15' });
    expect(r.prev).toEqual({ start: '2026-06-02', end: '2026-06-08' });
  });
});
