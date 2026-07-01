import { describe, it, expect } from 'vitest';
import { totals, deviceBreakdown, geoBreakdown, returningSplit } from './audience-metrics.mjs';
import { pageMetric, eventCount, funnel } from './funnel-metrics.mjs';

const row = (dims, mets) => ({ dimensionValues: dims.map((v) => ({ value: String(v) })), metricValues: mets.map((v) => ({ value: String(v) })) });

describe('audience-metrics', () => {
  it('totals 算每人平均停留', () => {
    const t = totals({ rows: [row([], [100, 130, 400, 5000])] });
    expect(t).toMatchObject({ users: 100, sessions: 130, views: 400, avgEngagedSecPerUser: 50 });
  });
  it('totals 空報告不炸', () => {
    expect(totals({ rows: [] }).users).toBe(0);
  });
  it('deviceBreakdown 算占比、依人數排序', () => {
    const d = deviceBreakdown({ rows: [row(['mobile'], [70, 80, 3500]), row(['desktop'], [30, 35, 1800])] });
    expect(d[0]).toMatchObject({ device: 'mobile', users: 70, sharePct: 70, avgEngagedSecPerUser: 50 });
  });
  it('geoBreakdown 取縣市前 n', () => {
    const g = geoBreakdown({ rows: [row(['Taipei City'], [40]), row(['Taichung City'], [10])] }, 1);
    expect(g).toHaveLength(1);
    expect(g[0]).toMatchObject({ region: 'Taipei City', users: 40 });
  });
  it('returningSplit 算回訪率', () => {
    const r = returningSplit({ rows: [row(['new'], [80, 0]), row(['returning'], [20, 0])] });
    expect(r).toMatchObject({ new: 80, returning: 20, returningRate: 0.2 });
  });
});

describe('funnel-metrics', () => {
  const pageRep = { rows: [
    row(['/pricing/', ''], [50, 40]),
    row(['/services/', ''], [30, 25]),
    row(['/submit/', ''], [20, 18]),
    row(['/articles/x/', ''], [500, 400]),
  ] };
  const evRep = { rows: [row(['page_view'], [1000]), row(['generate_lead'], [4])] };
  it('pageMetric 依前綴加總', () => {
    expect(pageMetric(pageRep, '/pricing/')).toEqual({ views: 50, users: 40 });
  });
  it('eventCount 取事件數,無則 0', () => {
    expect(eventCount(evRep, 'generate_lead')).toBe(4);
    expect(eventCount(evRep, 'nope')).toBe(0);
  });
  it('funnel 組步驟 + 轉換率', () => {
    const f = funnel(pageRep, evRep);
    expect(f.leads).toBe(4);
    expect(f.steps[0].users).toBe(65); // pricing40 + services25
    expect(f.steps[1].users).toBe(18); // submit
    expect(f.submitToLeadRate).toBe(rateOf(4, 18));
  });
});

function rateOf(n, d) { return Math.round((n / d) * 1000) / 10; }
