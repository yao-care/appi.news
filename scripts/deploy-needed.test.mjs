import { describe, it, expect } from 'vitest';
import { hasDueScheduled } from './deploy-needed.mjs';

// deploy.yml 改成每 15 分鐘排程後，沒變動就不該 build/deploy（一天 96 次、每次 335MB 太浪費）。
// 但判斷不能只看 commit：排程稿靠「build 當下時間」轉正，沒有新 commit 也可能該重建。
describe('hasDueScheduled：排程稿有沒有在這段區間到期', () => {
  const now = new Date('2026-08-06T15:00:00Z');
  const last = '2026-08-06T14:00:00Z';

  it('排程稿在區間內到期 → 要部署', () => {
    const e = [{ status: 'scheduled', publishDate: '2026-08-06T14:30:00Z' }];
    expect(hasDueScheduled(e, last, now)).toBe(true);
  });

  it('排程稿還沒到時間 → 不用部署', () => {
    const e = [{ status: 'scheduled', publishDate: '2026-08-07T06:17:00+08:00' }];
    expect(hasDueScheduled(e, last, now)).toBe(false);
  });

  it('排程稿在上次部署前就到期（已經上線過）→ 不用重複部署', () => {
    const e = [{ status: 'scheduled', publishDate: '2026-08-06T09:00:00Z' }];
    expect(hasDueScheduled(e, last, now)).toBe(false);
  });

  it('已發佈的文章不影響判斷', () => {
    const e = [{ status: 'published', publishDate: '2026-08-06T14:30:00Z' }];
    expect(hasDueScheduled(e, last, now)).toBe(false);
  });

  it('待審草稿（排到遠未來）不會誤觸發', () => {
    const e = [{ status: 'scheduled', publishDate: '2027-08-06T08:00:00+08:00' }];
    expect(hasDueScheduled(e, last, now)).toBe(false);
  });

  it('多篇混合：只要有一篇到期就要部署', () => {
    const e = [
      { status: 'published', publishDate: '2026-08-01T00:00:00Z' },
      { status: 'scheduled', publishDate: '2027-01-01T00:00:00Z' },
      { status: 'scheduled', publishDate: '2026-08-06T14:45:00Z' },
    ];
    expect(hasDueScheduled(e, last, now)).toBe(true);
  });

  it('**上次時間不可解讀一律 fail-open**（寧可多部署，不可漏內容）', () => {
    expect(hasDueScheduled([], 'not-a-date', now)).toBe(true);
  });

  it('空清單／缺欄位不炸', () => {
    expect(hasDueScheduled([], last, now)).toBe(false);
    expect(hasDueScheduled(null, last, now)).toBe(false);
    expect(hasDueScheduled([{}, { status: 'scheduled' }], last, now)).toBe(false);
  });
});
