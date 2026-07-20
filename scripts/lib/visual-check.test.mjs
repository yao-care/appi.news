import { describe, it, expect } from 'vitest';
import { parseVerdict, buildCheckPrompt } from './visual-check.mjs';

describe('parseVerdict', () => {
  it('第一行 ok → 合格', () => {
    expect(parseVerdict('ok')).toEqual({ ok: true });
    expect(parseVerdict('OK\n')).toEqual({ ok: true });
  });
  it('第一行 no → 不合格，第二行為原因', () => {
    expect(parseVerdict('no\n右手有六根手指')).toEqual({ ok: false, reason: '右手有六根手指' });
  });
  it('no 但無原因', () => {
    expect(parseVerdict('no')).toEqual({ ok: false, reason: undefined });
  });
  it('空白/雜訊視為合格（不阻斷）', () => {
    expect(parseVerdict('')).toEqual({ ok: true });
    expect(parseVerdict('   ')).toEqual({ ok: true });
  });
});

describe('buildCheckPrompt', () => {
  it('帶檔名與擬真照四維判準', () => {
    const p = buildCheckPrompt('check.jpg', 'a woman in a clinic', '中年女性');
    expect(p).toContain('check.jpg');
    expect(p).toContain('a woman in a clinic');
    expect(p).toContain('中年女性');
    expect(p).toContain('東亞）面孔'); // 驗族裔
    expect(p).toContain('浮水印'); // 驗圖內文字
  });
});
