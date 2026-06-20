import { describe, it, expect } from 'vitest';
import { validateSubmission, buildSlackBlocks } from './index';

const valid = (over = {}) => ({
  eventName: '113 學年度全國高中籃球聯賽 北區複賽',
  organizer: '某某高中籃球隊',
  contactName: '王教練',
  contactInfo: 'coach@example.edu.tw',
  eventDate: '2026-07-15',
  location: '台北體育館',
  level: '高中',
  description: '歡迎採訪，賽程詳見官網',
  sourceUrl: 'https://example.edu.tw/event',
  ...over,
});

describe('validateSubmission', () => {
  it('完整投稿通過', () => {
    expect(validateSubmission(valid())).toEqual([]);
  });

  it('缺必填欄位被擋', () => {
    expect(validateSubmission(valid({ eventName: '' })).some((e) => e.includes('賽事名稱'))).toBe(true);
    expect(validateSubmission(valid({ contactName: '' })).some((e) => e.includes('聯絡人'))).toBe(true);
  });

  it('聯絡方式非 email/電話被擋；電話可通過', () => {
    expect(validateSubmission(valid({ contactInfo: '隨便寫' })).some((e) => e.includes('聯絡方式'))).toBe(true);
    expect(validateSubmission(valid({ contactInfo: '0912345678' }))).toEqual([]);
  });

  it('連結格式不正確被擋', () => {
    expect(validateSubmission(valid({ sourceUrl: 'not-a-url' })).some((e) => e.includes('連結'))).toBe(true);
  });

  it('過長欄位被擋', () => {
    expect(validateSubmission(valid({ eventName: 'x'.repeat(200) })).some((e) => e.includes('過長'))).toBe(true);
    expect(validateSubmission(valid({ description: 'x'.repeat(2100) })).some((e) => e.includes('補充說明過長'))).toBe(true);
  });

  it('非物件輸入不爆炸', () => {
    expect(validateSubmission(null).length).toBeGreaterThan(0);
    expect(validateSubmission('x').length).toBeGreaterThan(0);
  });
});

describe('buildSlackBlocks', () => {
  it('含待審標頭、賽事資訊、且明確標示不自動回信/不自動發文', () => {
    const blocks = buildSlackBlocks(valid());
    const txt = JSON.stringify(blocks);
    expect(txt).toContain('待人工審核');
    expect(txt).toContain('113 學年度全國高中籃球聯賽');
    expect(txt).toContain('不自動回信');
  });

  it('沒有任何「自動發文」按鈕（actions block）', () => {
    const blocks = buildSlackBlocks(valid()) as { type: string }[];
    expect(blocks.some((b) => b.type === 'actions')).toBe(false);
  });
});
