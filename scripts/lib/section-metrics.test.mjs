import { describe, it, expect } from 'vitest';
import { sectionOf, sectionBreakdown, sectionByContentGroup } from './section-metrics.mjs';

const slugMap = { 'tcm-ai': 'health', 'tsmc-cowos': 'tech', 'my-column': 'columns' };
const ga = (path, views, eng) => ({ dimensionValues: [{ value: path }], metricValues: [{ value: String(views) }, { value: String(eng) }] });

describe('sectionOf', () => {
  it('文章內文 → 其分類(slug 映射)', () => {
    expect(sectionOf('/articles/tcm-ai/', slugMap)).toBe('health');
    expect(sectionOf('/articles/my-column/', slugMap)).toBe('columns');
    expect(sectionOf('/articles/unknown/', slugMap)).toBe('uncategorized');
  });
  it('分類索引 → 該分類、作者頁 → authors、首頁 → home', () => {
    expect(sectionOf('/tech/')).toBe('tech');
    expect(sectionOf('/columns/')).toBe('columns');
    expect(sectionOf('/authors/lightman/')).toBe('authors');
    expect(sectionOf('/')).toBe('home');
  });
  it('其餘(topics/tags/靜態) → other', () => {
    expect(sectionOf('/topics/ai/')).toBe('other');
    expect(sectionOf('/about/')).toBe('other');
  });
});

describe('sectionBreakdown', () => {
  const cur = { rows: [
    ga('/articles/tcm-ai/', 100, 6000),   // health
    ga('/health/', 20, 400),               // health 索引
    ga('/articles/tsmc-cowos/', 50, 2500), // tech
    ga('/', 30, 300),                      // home
  ] };
  const prev = { rows: [ ga('/articles/tcm-ai/', 80, 4000) ] }; // health 前期
  it('同區塊(文章+索引)合併、views/停留加總、算每次瀏覽平均停留', () => {
    const out = sectionBreakdown(cur, prev, slugMap);
    const health = out.find((s) => s.section === 'health');
    expect(health.views).toBe(120);
    expect(health.engagedSec).toBe(6400);
    expect(health.avgEngagedSecPerView).toBe(Math.round(6400 / 120));
  });
  it('WoW 對比 views(health 120 vs 80 → +50%)', () => {
    const health = sectionBreakdown(cur, prev, slugMap).find((s) => s.section === 'health');
    expect(health.viewsWoWPct).toBe(50);
  });
  it('依 views 由大到小排序', () => {
    const out = sectionBreakdown(cur, prev, slugMap);
    expect(out[0].section).toBe('health');
  });
});

describe('sectionByContentGroup', () => {
  it('用 contentGroup 維度直接給準確人數', () => {
    const rep = { rows: [
      { dimensionValues: [{ value: 'health' }], metricValues: [{ value: '40' }, { value: '55' }, { value: '2000' }] },
      { dimensionValues: [{ value: 'tech' }], metricValues: [{ value: '25' }, { value: '30' }, { value: '900' }] },
    ] };
    const out = sectionByContentGroup(rep);
    expect(out[0]).toMatchObject({ section: 'health', users: 40, sessions: 55, avgEngagedSecPerUser: 50 });
  });
});
