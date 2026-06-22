import { describe, it, expect } from 'vitest';
import {
  pctChange,
  pageTypeOf,
  articleSlugOf,
  isAiReferral,
  topArticles,
  searchOpportunities,
  pageTypeBreakdown,
  articleCategoryBreakdown,
  seoHealth,
} from './weekly-metrics.mjs';

const ga = (path, views) => ({ dimensionValues: [{ value: path }], metricValues: [{ value: String(views) }] });

describe('小工具', () => {
  it('pctChange 四捨五入到整數百分比，前值 0 回 null', () => {
    expect(pctChange(110, 100)).toBe(10);
    expect(pctChange(90, 100)).toBe(-10);
    expect(pctChange(5, 0)).toBeNull();
  });
  it('pageTypeOf 依路徑判頁面類型；文章內文一律 article（不誤判成 other）', () => {
    expect(pageTypeOf('/')).toBe('home');
    expect(pageTypeOf('/articles/post-1/')).toBe('article');
    expect(pageTypeOf('/articles/post-1/?utm=x')).toBe('article');
    expect(pageTypeOf('/authors/lightman/')).toBe('author');
    expect(pageTypeOf('/columns/abc/')).toBe('column');
    expect(pageTypeOf('/topics/ai/')).toBe('topic');
    expect(pageTypeOf('/tags/foo/')).toBe('tag');
    expect(pageTypeOf('/tech/')).toBe('category');
    expect(pageTypeOf('/about/')).toBe('page');
  });
  it('articleSlugOf 只從 /articles/<slug>/ 取 slug，否則 null', () => {
    expect(articleSlugOf('/articles/post-1/')).toBe('post-1');
    expect(articleSlugOf('/articles/post-1')).toBe('post-1');
    expect(articleSlugOf('/articles/post-1/?cb=9')).toBe('post-1');
    expect(articleSlugOf('/tech/')).toBeNull();
    expect(articleSlugOf('/')).toBeNull();
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
        { dimensionValues: [{ value: '/articles/a/' }, { value: 'A' }], metricValues: [{ value: '100' }, { value: '500' }] },
        { dimensionValues: [{ value: '/articles/b/' }, { value: 'B' }], metricValues: [{ value: '40' }, { value: '80' }] },
      ],
    };
    expect(topArticles(report, 5)).toEqual([
      { path: '/articles/a/', title: 'A', views: 100, avgEngagementSec: 5 },
      { path: '/articles/b/', title: 'B', views: 40, avgEngagementSec: 2 },
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

describe('pageTypeBreakdown', () => {
  it('依頁面類型彙整、依瀏覽排序，並算 wowPct', () => {
    const cur = { rows: [ga('/', 50), ga('/articles/a/', 30), ga('/articles/b/', 10), ga('/authors/x/', 60)] };
    const prev = { rows: [ga('/', 100), ga('/authors/x/', 20)] };
    expect(pageTypeBreakdown(cur, prev)).toEqual([
      { type: 'author', views: 60, wowPct: 200 },
      { type: 'home', views: 50, wowPct: -50 },
      { type: 'article', views: 40, wowPct: null },
    ]);
  });
});

describe('articleCategoryBreakdown', () => {
  it('只算文章內文、依真實分類彙整；映射不到歸 uncategorized；非文章不計入', () => {
    const map = { a: 'tech', b: 'tech', c: 'health' };
    const cur = {
      rows: [ga('/articles/a/', 30), ga('/articles/b/', 10), ga('/articles/c/', 5), ga('/articles/z/', 7), ga('/', 999), ga('/tech/', 999)],
    };
    const prev = { rows: [ga('/articles/a/', 20)] };
    expect(articleCategoryBreakdown(cur, prev, map)).toEqual([
      { category: 'tech', views: 40, wowPct: 100 },
      { category: 'uncategorized', views: 7, wowPct: null },
      { category: 'health', views: 5, wowPct: null },
    ]);
  });
});

describe('seoHealth', () => {
  it('彙總曝光/點擊/出現頁數，算曝光加權平均排名', () => {
    const resp = {
      rows: [
        { keys: ['https://appi.news/a/'], impressions: 100, clicks: 2, position: 10 },
        { keys: ['https://appi.news/b/'], impressions: 300, clicks: 0, position: 20 },
      ],
    };
    expect(seoHealth(resp)).toEqual({ pagesInSearch: 2, totalImpressions: 400, totalClicks: 2, avgPosition: 17.5 });
  });
  it('無資料時 avgPosition 為 null', () => {
    expect(seoHealth({ rows: [] })).toEqual({ pagesInSearch: 0, totalImpressions: 0, totalClicks: 0, avgPosition: null });
  });
});
