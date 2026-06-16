import { describe, it, expect } from 'vitest';
import { pctChange, categoryOf, isAiReferral, topArticles, searchOpportunities } from './weekly-metrics.mjs';

describe('小工具', () => {
  it('pctChange 四捨五入到整數百分比，前值 0 回 null', () => {
    expect(pctChange(110, 100)).toBe(10);
    expect(pctChange(90, 100)).toBe(-10);
    expect(pctChange(5, 0)).toBeNull();
  });
  it('categoryOf 取路徑第一段，文章/未知歸 other', () => {
    expect(categoryOf('/tech/abc/')).toBe('tech');
    expect(categoryOf('/health/x/')).toBe('health');
    expect(categoryOf('/articles/post-1/')).toBe('other');
    expect(categoryOf('/')).toBe('other');
  });
  it('isAiReferral 認得 AI 來源網域', () => {
    expect(isAiReferral('chatgpt.com')).toBe(true);
    expect(isAiReferral('www.perplexity.ai')).toBe(true);
    expect(isAiReferral('google')).toBe(false);
  });
});

describe('topArticles', () => {
  it('取前 N、算 avgEngagementSec = userEngagementDuration / views', () => {
    const report = {
      rows: [
        { dimensionValues: [{ value: '/tech/a/' }, { value: 'A' }], metricValues: [{ value: '100' }, { value: '500' }] },
        { dimensionValues: [{ value: '/health/b/' }, { value: 'B' }], metricValues: [{ value: '40' }, { value: '80' }] },
      ],
    };
    expect(topArticles(report, 5)).toEqual([
      { path: '/tech/a/', title: 'A', views: 100, avgEngagementSec: 5 },
      { path: '/health/b/', title: 'B', views: 40, avgEngagementSec: 2 },
    ]);
  });
});

describe('searchOpportunities', () => {
  it('只留排名 11-20、依曝光排序、附 ctr/position', () => {
    const resp = {
      rows: [
        { keys: ['ai 對齊'], impressions: 500, clicks: 3, ctr: 0.006, position: 14.2 },
        { keys: ['已經第一名'], impressions: 900, clicks: 200, ctr: 0.22, position: 1.3 },
        { keys: ['機會二'], impressions: 800, clicks: 5, ctr: 0.006, position: 18.0 },
      ],
    };
    expect(searchOpportunities(resp)).toEqual([
      { query: '機會二', impressions: 800, clicks: 5, ctr: 0.006, position: 18.0 },
      { query: 'ai 對齊', impressions: 500, clicks: 3, ctr: 0.006, position: 14.2 },
    ]);
  });
});
