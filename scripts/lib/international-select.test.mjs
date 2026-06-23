import { describe, it, expect } from 'vitest';
import { regionForFullName, parseEventRow, aggregateStories, relativeHotPicks, selectHotByRegion, COL } from './international-select.mjs';

// 造一列 61 欄的 Events 列，只填我們用到的欄位。
function row({ id = '1', numArticles = 1, numSources = 1, fullName = 'New Delhi, Delhi, India', url = 'https://x.com/a' }) {
  const c = new Array(61).fill('');
  c[COL.eventId] = id;
  c[COL.numArticles] = String(numArticles);
  c[COL.numSources] = String(numSources);
  c[COL.actionGeoFullName] = fullName;
  c[COL.sourceUrl] = url;
  return c;
}

describe('regionForFullName', () => {
  it('取最後一段國名對應分區', () => {
    expect(regionForFullName('New Delhi, Delhi, India')).toBe('東南亞與南亞');
    expect(regionForFullName('Tokyo, Japan')).toBe('東亞');
    expect(regionForFullName('Cairo, Egypt')).toBe('非洲');
    expect(regionForFullName('Washington, District of Columbia, United States')).toBe('北美');
  });
  it('未知國家/空 → null', () => {
    expect(regionForFullName('Somewhere, Atlantis')).toBeNull();
    expect(regionForFullName('')).toBeNull();
  });
});

describe('parseEventRow', () => {
  it('合格列解析出標準物件', () => {
    const e = parseEventRow(row({ numArticles: 5, fullName: 'Seoul, South Korea', url: 'https://a.kr/1' }));
    expect(e).toMatchObject({ numArticles: 5, region: '東亞', sourceUrl: 'https://a.kr/1' });
  });
  it('無效 URL / 未知地區 / 欄數不足 → null', () => {
    expect(parseEventRow(row({ url: 'not-a-url' }))).toBeNull();
    expect(parseEventRow(row({ fullName: 'X, Atlantis' }))).toBeNull();
    expect(parseEventRow(['too', 'few'])).toBeNull();
  });
});

describe('aggregateStories — 去重（以來源家數為熱度）', () => {
  it('同 eventId 取最高來源數；同 url 去重；歸正確分區', () => {
    const events = [
      parseEventRow(row({ id: 'e1', numSources: 2, url: 'https://a/1', fullName: 'Tokyo, Japan' })),
      parseEventRow(row({ id: 'e1', numSources: 9, url: 'https://a/1', fullName: 'Tokyo, Japan' })), // 同事件累積
      parseEventRow(row({ id: 'e2', numSources: 3, url: 'https://a/2', fullName: 'Osaka, Japan' })),
    ];
    const agg = aggregateStories(events);
    expect(agg['東亞']).toHaveLength(2);
    expect(agg['東亞'][0].numSources).toBe(9); // 取最高、排前
  });
});

describe('relativeHotPicks — 相對熱門（看來源家數）', () => {
  it('砍掉 1–2 來源的假熱門，只留多家報導者', () => {
    // 文章數都很高，但只有一則是多家來源 → 只該留那則
    const stories = [
      { numSources: 12, numArticles: 30, sourceUrl: 'a' },
      { numSources: 1, numArticles: 40, sourceUrl: 'b' }, // 農場狂發：文章多但 1 家
      { numSources: 1, numArticles: 35, sourceUrl: 'c' },
      { numSources: 2, numArticles: 20, sourceUrl: 'd' },
    ];
    const hot = relativeHotPicks(stories);
    expect(hot).toHaveLength(1);
    expect(hot[0].sourceUrl).toBe('a');
  });
  it('來源數全平 → 不挑', () => {
    const flat = [1, 1, 1, 1].map((n, i) => ({ numSources: n, numArticles: 5, sourceUrl: 'u' + i }));
    expect(relativeHotPicks(flat)).toEqual([]);
  });
  it('上限 maxPer（多則同樣多家報時取前 maxPer）', () => {
    const many = [
      ...Array.from({ length: 4 }, (_, i) => ({ numSources: 15, numArticles: 50, sourceUrl: 'hot' + i })),
      ...Array.from({ length: 12 }, (_, i) => ({ numSources: 1, numArticles: 1, sourceUrl: 'lo' + i })),
    ];
    expect(relativeHotPicks(many, 3)).toHaveLength(3);
  });
});

describe('selectHotByRegion — 端到端', () => {
  it('多區各自挑（多家來源者勝出）', () => {
    const events = [
      ...Array.from({ length: 5 }, (_, i) => parseEventRow(row({ id: 'jp' + i, numSources: 1, url: 'https://jp/' + i, fullName: 'Tokyo, Japan' }))),
      parseEventRow(row({ id: 'jpHot', numSources: 12, url: 'https://jp/hot', fullName: 'Tokyo, Japan' })),
    ];
    const picks = selectHotByRegion(events, 3);
    expect(picks['東亞'][0].sourceUrl).toBe('https://jp/hot');
  });
});
