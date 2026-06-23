import { describe, it, expect } from 'vitest';
import { buildFocusEsgPrompt, parseFocusEsgResult, FOCUS_ESG_THEMES } from './focus-esg.mjs';

describe('buildFocusEsgPrompt', () => {
  it('涵蓋 6 議題群、要求 focus 分類與自動上架欄位', () => {
    const p = buildFocusEsgPrompt(['碳費首度開徵'], 7);
    expect(FOCUS_ESG_THEMES.length).toBe(6);
    expect(p).toContain('碳定價');
    expect(p).toContain('永續揭露');
    expect(p).toContain('能源轉型');
    expect(p).toContain('循環經濟');
    expect(p).toContain('水資源');
    expect(p).toContain('氣候');
    expect(p).toContain('category: "focus"');
    expect(p).toContain('FOCUS_RESULT=NEW');
    expect(p).toContain('碳費首度開徵'); // 去重清單帶入
  });
});

describe('parseFocusEsgResult', () => {
  it('NEW 取 slug、SKIP、解析失敗視為跳過', () => {
    expect(parseFocusEsgResult('FOCUS_RESULT=NEW｜taiwan-carbon-fee')).toMatchObject({ action: 'new', slug: 'taiwan-carbon-fee' });
    expect(parseFocusEsgResult('FOCUS_RESULT=SKIP｜近期無夠新的題')).toMatchObject({ action: 'skip' });
    expect(parseFocusEsgResult('亂回').infra).toBe(true);
  });
  it('清掉 slug 帶出的反引號/引號/標點', () => {
    expect(parseFocusEsgResult('FOCUS_RESULT=NEW｜`taiwan-carbon-fee`')).toMatchObject({ slug: 'taiwan-carbon-fee' });
  });
});
