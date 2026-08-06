import { describe, it, expect } from 'vitest';
import { parseLocalVerdict, parseSuggestions } from './forum-radar.mjs';

describe('地方板判斷輸出解析', () => {
  it('解析要排除的編號（1-based → 0-based）', () => {
    const { ok, drop } = parseLocalVerdict('LOCAL_DROP=2,5', 6);
    expect(ok).toBe(true);
    expect([...drop].sort()).toEqual([1, 4]);
  });

  it('空的代表全部保留', () => {
    const { ok, drop } = parseLocalVerdict('LOCAL_DROP=', 3);
    expect(ok).toBe(true);
    expect(drop.size).toBe(0);
  });

  it('忽略超出範圍的編號', () => {
    const { drop } = parseLocalVerdict('LOCAL_DROP=1,99,0,-3', 3);
    expect([...drop]).toEqual([0]);
  });

  it('**解析失敗一律保守全排除**（地方板是加值，寧可少推也不要漏政治）', () => {
    const { ok, drop } = parseLocalVerdict('模型講了一堆但沒印標記', 4);
    expect(ok).toBe(false);
    expect(drop.size).toBe(4);
  });

  it('容忍前後有其他文字與大小寫', () => {
    const { ok, drop } = parseLocalVerdict('我的判斷如下\nlocal_drop=3\n以上', 5);
    expect(ok).toBe(true);
    expect([...drop]).toEqual([2]);
  });
});

describe('選題結果解析', () => {
  const sample = [
    { title: 'A', conclusion: 'c', angle: 'g', signal: 's', category: 'tech', subcategory: 'ai', kind: 'factual' },
  ];

  it('吃純 JSON 陣列', () => {
    const r = parseSuggestions(JSON.stringify(sample));
    expect(r.ok).toBe(true);
    expect(r.suggestions).toHaveLength(1);
  });

  it('吃 ```json 圍欄', () => {
    const r = parseSuggestions('這是我的選題：\n```json\n' + JSON.stringify(sample) + '\n```\n以上');
    expect(r.ok).toBe(true);
    expect(r.suggestions[0].title).toBe('A');
  });

  it('吃前後夾雜文字的裸陣列', () => {
    const r = parseSuggestions('結果如下\n' + JSON.stringify(sample) + '\n請確認');
    expect(r.ok).toBe(true);
  });

  it('空陣列＝編輯判斷「這批沒可寫的」，是成功不是故障', () => {
    const r = parseSuggestions('[]');
    expect(r.ok).toBe(true);
    expect(r.suggestions).toEqual([]);
  });

  it('**解析不出來＝infra 故障**，要與「空陣列」明確區分', () => {
    expect(parseSuggestions('我今天沒辦法回答').ok).toBe(false);
    expect(parseSuggestions('').ok).toBe(false);
    expect(parseSuggestions('{"not":"an array"}').ok).toBe(false);
  });
});
