import { describe, it, expect } from 'vitest';
import { closureSignature, diffState } from './typhoon-state.mjs';

describe('closureSignature — 穩定簽章', () => {
  it('順序不影響簽章', () => {
    const a = closureSignature([
      { area: '臺北市', status: '停止上班、停止上課', date: '2026-07-10' },
      { area: '新北市', status: '停止上班、停止上課', date: '2026-07-10' },
    ]);
    const b = closureSignature([
      { area: '新北市', status: '停止上班、停止上課', date: '2026-07-10' },
      { area: '臺北市', status: '停止上班、停止上課', date: '2026-07-10' },
    ]);
    expect(a).toBe(b);
  });

  it('狀態改變 → 簽章不同（新增縣市）', () => {
    const before = closureSignature([{ area: '臺北市', status: '停班停課', date: '2026-07-10' }]);
    const after = closureSignature([
      { area: '臺北市', status: '停班停課', date: '2026-07-10' },
      { area: '基隆市', status: '停班停課', date: '2026-07-10' },
    ]);
    expect(before).not.toBe(after);
  });

  it('同縣市狀態改變 → 簽章不同', () => {
    const a = closureSignature([{ area: '臺中市', status: '照常上班上課', date: '2026-07-10' }]);
    const b = closureSignature([{ area: '臺中市', status: '停止上班、停止上課', date: '2026-07-10' }]);
    expect(a).not.toBe(b);
  });

  it('空清單 → 空字串；忽略空白項', () => {
    expect(closureSignature([])).toBe('');
    expect(closureSignature(undefined)).toBe('');
    expect(closureSignature([{ area: '', status: '', date: '' }])).toBe('');
  });

  it('全形/半形正規化一致', () => {
    const a = closureSignature([{ area: '臺北市', status: 'ＡＢＣ', date: '2026-07-10' }]);
    const b = closureSignature([{ area: '臺北市', status: 'ABC', date: '2026-07-10' }]);
    expect(a).toBe(b);
  });
});

describe('diffState', () => {
  it('相同 → changed:false；不同 → changed:true', () => {
    expect(diffState('x', 'x').changed).toBe(false);
    expect(diffState('x', 'y').changed).toBe(true);
    expect(diffState('', '').changed).toBe(false);
    expect(diffState('', 'y').changed).toBe(true);
  });
});
