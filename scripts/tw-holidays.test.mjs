import { describe, it, expect } from 'vitest';
import { parseCalendarCsv, findLongWeekends, upcomingLongWeekend } from './tw-holidays.mjs';

// 合成 CSV：一般週末(2天) + 一個 4 天中秋連假 + 平日。
const CSV = `西元日期,星期,是否放假,備註
20260920,日,2,
20260921,一,0,
20260922,二,0,
20260925,五,2,中秋節
20260926,六,2,
20260927,日,2,
20260928,一,2,中秋節補假
20260929,二,0,
`;

describe('parseCalendarCsv', () => {
  it('跳表頭、解析放假旗標與備註', () => {
    const rows = parseCalendarCsv(CSV);
    expect(rows).toHaveLength(8);
    expect(rows[0]).toMatchObject({ date: '20260920', isHoliday: true });
    expect(rows.find((r) => r.date === '20260921').isHoliday).toBe(false);
    expect(rows.find((r) => r.date === '20260925').note).toBe('中秋節');
  });
  it('BOM 與空行容錯', () => {
    expect(parseCalendarCsv('﻿西元日期,星期,是否放假,備註\n20260101,四,2,開國紀念日\n\n')).toHaveLength(1);
  });
});

describe('findLongWeekends — 連假 >=3 天，排除一般週末', () => {
  it('單獨週日不算；4 天中秋連假算', () => {
    const lws = findLongWeekends(parseCalendarCsv(CSV));
    expect(lws).toHaveLength(1);
    expect(lws[0]).toMatchObject({ start: '20260925', end: '20260928', days: 4, name: '中秋節' });
  });
});

describe('upcomingLongWeekend', () => {
  const rows = parseCalendarCsv(CSV);
  it('視窗內回最近連假', () => {
    expect(upcomingLongWeekend(rows, '20260918', 10)).toMatchObject({ name: '中秋節', days: 4 });
  });
  it('視窗外回 null', () => {
    expect(upcomingLongWeekend(rows, '20260901', 10)).toBeNull(); // 距 9/25 有 24 天
  });
  it('連假進行中（今天在區間內）也算', () => {
    expect(upcomingLongWeekend(rows, '20260926', 10)).toMatchObject({ name: '中秋節' });
  });
  it('連假已過 → null', () => {
    expect(upcomingLongWeekend(rows, '20260929', 10)).toBeNull();
  });
});
