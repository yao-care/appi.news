import { describe, it, expect } from 'vitest';
import { buildIntlPrompt, parseIntlResult, defaultSubcategory } from './intl-write.mjs';

const story = { region: '中東', sourceUrl: 'https://x.com/iran', numArticles: 50, numSources: 12, fullName: 'Tehran, Tehran, Iran' };

describe('defaultSubcategory', () => {
  it('分區對到預設子分類', () => {
    expect(defaultSubcategory('中東')).toBe('middle-east');
    expect(defaultSubcategory('歐洲')).toBe('europe');
    expect(defaultSubcategory('未知')).toBe('global-focus');
  });
});

describe('buildIntlPrompt — 含關鍵規則', () => {
  const p = buildIntlPrompt(story, [{ slug: 'post-1', title: '伊朗談判', updatedDate: '2026-06-20' }]);
  it('帶原文連結、熱度、品質關、不用 AI 圖、更新故事線、事實鐵則', () => {
    expect(p).toContain('https://x.com/iran');
    expect(p).toContain('品質關');
    expect(p).toContain('不用 AI 生圖');
    expect(p).toContain('更新模式');
    expect(p).toContain('嚴格基於事實');
    expect(p).toContain('INTL_RESULT=');
    expect(p).toContain('post-1'); // 近期文進比對清單
  });
});

describe('parseIntlResult', () => {
  it('NEW / UPDATE 取出 slug', () => {
    expect(parseIntlResult('INTL_RESULT=NEW｜iran-us-talks')).toMatchObject({ action: 'new', slug: 'iran-us-talks' });
    expect(parseIntlResult('一些 log\nINTL_RESULT=UPDATE｜post-1 有新進展')).toMatchObject({ action: 'update', slug: 'post-1' });
  });
  it('SKIP', () => {
    expect(parseIntlResult('INTL_RESULT=SKIP｜內容農場')).toMatchObject({ action: 'skip' });
  });
  it('解析不到 → 視為跳過、標 infra', () => {
    const r = parseIntlResult('claude 沒照格式回');
    expect(r.action).toBe('skip');
    expect(r.infra).toBe(true);
  });
});
