import { describe, it, expect } from 'vitest';
import { parseLocalVerdict } from './forum-radar.mjs';
// parseSuggestions 與告警節流已收斂到 lib/radar-shared.mjs，測試在 lib/radar-shared.test.mjs。

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
