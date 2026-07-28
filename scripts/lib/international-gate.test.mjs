import { describe, it, expect } from 'vitest';
import { normalizeTitle, titleSimilarity, dedupeByEvent, filterSeen, mergeSeen, buildTriagePrompt, parseTriage } from './international-gate.mjs';

const mk = (o) => ({ region: '歐洲', fullName: 'United Kingdom', numArticles: 10, numSources: 3, ...o });

describe('normalizeTitle / titleSimilarity', () => {
  it('正規化去空白標點大小寫', () => {
    expect(normalizeTitle('Quake Hits Japan!')).toBe(normalizeTitle('quake  hits japan'));
  });
  it('同事件的轉載標題相似度高、無關標題相似度低', () => {
    const a = 'Magnitude 7.1 earthquake shakes part of southern Japan, no tsunami detected';
    const b = 'Magnitude 7.1 earthquake shakes southern Japan; no tsunami detected';
    expect(titleSimilarity(a, b)).toBeGreaterThan(0.5);
    expect(titleSimilarity(a, 'Australian grill masters top tips for barbecue')).toBeLessThan(0.1);
  });
});

describe('dedupeByEvent — 同批同事件只留最熱', () => {
  const stories = [
    mk({ sourceUrl: 'https://a/1', title: 'Magnitude 7.1 earthquake shakes part of southern Japan, no tsunami detected', numSources: 8 }),
    mk({ sourceUrl: 'https://b/2', title: 'Magnitude 7.1 earthquake shakes southern Japan; no tsunami detected', numSources: 3 }),
    mk({ sourceUrl: 'https://c/3', title: 'Gunmen kill high-ranking Taliban official in Afghanistan', numSources: 3 }),
  ];
  const { kept, dropped } = dedupeByEvent(stories);
  it('轉載版被砍、留下來源家數最多那則', () => {
    expect(kept.map((s) => s.sourceUrl)).toEqual(['https://a/1', 'https://c/3']);
    expect(dropped).toHaveLength(1);
    expect(dropped[0].story.sourceUrl).toBe('https://b/2');
    expect(dropped[0].dupOf.sourceUrl).toBe('https://a/1');
  });
  it('抓不到標題的一律保留（不錯殺）', () => {
    const r = dedupeByEvent([mk({ sourceUrl: 'https://x/1', title: '' }), mk({ sourceUrl: 'https://x/2', title: '' })]);
    expect(r.kept).toHaveLength(2);
    expect(r.dropped).toHaveLength(0);
  });
});

describe('filterSeen / mergeSeen — 跨日帳本', () => {
  const entries = [
    { url: 'https://seen/1', key: normalizeTitle('Old story'), date: '2026-07-20' },
    { url: 'https://old/9', key: normalizeTitle('Ancient story'), date: '2026-06-01' },
  ];
  it('窗內同 URL 或同標題被擋，窗外的不擋', () => {
    const { kept, dropped } = filterSeen(
      [
        mk({ sourceUrl: 'https://seen/1', title: 'Whatever' }),
        mk({ sourceUrl: 'https://other/2', title: 'Old story' }),
        mk({ sourceUrl: 'https://old/9', title: 'Ancient story' }),
        mk({ sourceUrl: 'https://fresh/3', title: 'Brand new event' }),
      ],
      entries,
      { windowDays: 14, today: '2026-07-28' },
    );
    expect(kept.map((s) => s.sourceUrl)).toEqual(['https://old/9', 'https://fresh/3']);
    expect(dropped).toHaveLength(2);
  });
  it('mergeSeen 併入不重複、砍掉超過保留期的', () => {
    const out = mergeSeen(entries, [mk({ sourceUrl: 'https://seen/1', title: 'Whatever' }), mk({ sourceUrl: 'https://fresh/3', title: 'Brand new event' })], '2026-07-28', 45);
    expect(out.map((e) => e.url)).toEqual(['https://seen/1', 'https://fresh/3']);
  });
});

describe('buildTriagePrompt / parseTriage', () => {
  const stories = [mk({ sourceUrl: 'https://a/1', title: 'Quake hits Japan' }), mk({ sourceUrl: 'https://b/2', title: 'Top tips for barbecue' })];
  it('prompt 帶標題、標地誤標警告、放行優先原則', () => {
    const p = buildTriagePrompt(stories, [{ title: '日本地震' }]);
    expect(p).toContain('Top tips for barbecue');
    expect(p).toContain('地點標記經常錯誤');
    expect(p).toContain('一律 write');
    expect(p).toContain('日本地震');
    expect(p).toContain('0 到 1');
  });
  it('解析 JSON（含 ``` 包裹與前後雜訊）', () => {
    const m = parseTriage('好的：\n```json\n[{"i":0,"verdict":"write","reason":"新聞"},{"i":1,"verdict":"skip","reason":"生活風格"}]\n```', 2);
    expect(m.get(0).verdict).toBe('write');
    expect(m.get(1).verdict).toBe('skip');
  });
  it('解析不出來回 null（呼叫端須 fail-open）', () => {
    expect(parseTriage('我沒辦法判斷', 2)).toBeNull();
    expect(parseTriage('[]', 2)).toBeNull();
    expect(parseTriage('[{"i":9,"verdict":"skip"}]', 2)).toBeNull();
  });
  it('未知 verdict 一律當 write（不錯殺）', () => {
    expect(parseTriage('[{"i":0,"verdict":"maybe"}]', 1).get(0).verdict).toBe('write');
  });
});
