import { describe, it, expect } from 'vitest';
import { normalizeKey, mergeSuggestions, prune, recentLines } from './topic-ledger.mjs';

const TODAY = '2026-06-16';

describe('normalizeKey — 字面去重', () => {
  it('去空白/標點/符號、轉小寫', () => {
    expect(normalizeKey('HBM4 量產競賽：三星 vs SK 海力士')).toBe('hbm4量產競賽三星vssk海力士');
  });
  it('同題不同標點 → 同 key', () => {
    expect(normalizeKey('AI 基本法，上路')).toBe(normalizeKey('AI基本法 上路'));
  });
  it('空輸入 → 空字串', () => {
    expect(normalizeKey(null)).toBe('');
    expect(normalizeKey(undefined)).toBe('');
  });
});

describe('mergeSuggestions — 併入帳本', () => {
  it('新題補上 date/key/分類', () => {
    const out = mergeSuggestions([], [{ title: 'HBM4 量產競賽', category: 'tech', subcategory: 'semiconductor' }], TODAY);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ date: TODAY, title: 'HBM4 量產競賽', subcategory: 'semiconductor' });
    expect(out[0].key).toBe(normalizeKey('HBM4 量產競賽'));
  });

  it('字面重複（既有 key）跳過，不重複存列', () => {
    const before = mergeSuggestions([], [{ title: 'AI 基本法上路' }], '2026-06-10');
    const after = mergeSuggestions(before, [{ title: 'AI 基本法，上路' }], TODAY); // 只差標點
    expect(after).toHaveLength(1);
    expect(after[0].date).toBe('2026-06-10'); // 保留原紀錄、不被新日期覆蓋
  });

  it('無 title 的項目略過', () => {
    const out = mergeSuggestions([], [{ conclusion: '沒標題' }, { title: '' }, { title: '有題' }], TODAY);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('有題');
  });

  it('suggestions 非陣列 → 原帳本不變', () => {
    const before = [{ date: TODAY, title: 'x', key: 'x' }];
    expect(mergeSuggestions(before, undefined, TODAY)).toHaveLength(1);
  });
});

describe('prune — 砍舊紀錄', () => {
  const ledger = [
    { date: '2026-06-16', title: '今天', key: 'a' },
    { date: '2026-05-20', title: '27 天前', key: 'b' },
    { date: '2026-04-01', title: '76 天前', key: 'c' },
  ];
  it('保留 retention 天內，砍更舊的', () => {
    const out = prune(ledger, TODAY, 45);
    expect(out.map((e) => e.key)).toEqual(['a', 'b']); // c（76 天）被砍
  });
});

describe('recentLines — 餵 prompt 的近期清單', () => {
  const ledger = [
    { date: '2026-06-16', title: '今天的題', key: 'a', subcategory: 'ai' },
    { date: '2026-06-10', title: '六天前的題', key: 'b', subcategory: 'security' },
    { date: '2026-05-01', title: '太舊的題', key: 'c', subcategory: 'startup' },
  ];
  it('只列窗內、新到舊、含子分類', () => {
    const out = recentLines(ledger, TODAY, 14);
    expect(out).toContain('[2026-06-16] (ai) 今天的題');
    expect(out).toContain('[2026-06-10] (security) 六天前的題');
    expect(out).not.toContain('太舊的題'); // 46 天 > 14 天窗
    expect(out.indexOf('今天的題')).toBeLessThan(out.indexOf('六天前的題')); // 新在前
  });
  it('窗內無紀錄 → 提示字串', () => {
    expect(recentLines([{ date: '2026-05-01', title: '太舊', key: 'c' }], TODAY, 14)).toBe('（近期無推薦紀錄）');
    expect(recentLines([], TODAY)).toBe('（近期無推薦紀錄）');
  });
});
