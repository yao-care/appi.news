import { describe, it, expect } from 'vitest';
import { buildPolicePrompt, parsePoliceResult, POLICE_SOURCES } from './police-good-deeds.mjs';

describe('POLICE_SOURCES', () => {
  it('含主力好人好事來源（高雄/宜蘭/屏東）且都有 URL', () => {
    const areas = POLICE_SOURCES.map((s) => s.area);
    expect(areas).toEqual(expect.arrayContaining(['高雄市', '宜蘭縣', '屏東縣']));
    expect(POLICE_SOURCES.every((s) => /^https:\/\//.test(s.url))).toBe(true);
    expect(POLICE_SOURCES.filter((s) => s.priority).length).toBeGreaterThanOrEqual(3);
  });
});

describe('buildPolicePrompt — 含關鍵規則', () => {
  const p = buildPolicePrompt(['上週各地暖警好事'], 7);
  it('含來源、跟原稿具名、不轉載版權照、附連結、去重清單、自動上架欄位', () => {
    expect(p).toContain('kcpd.kcg.gov.tw'); // 高雄來源
    expect(p).toContain('員警照原稿具名');
    expect(p).toContain('不要轉載');
    expect(p).toContain('近 7 天');
    expect(p).toContain('上週各地暖警好事'); // 去重清單
    expect(p).toContain('status: "published"');
    expect(p).toContain('POLICE_RESULT=');
  });
});

describe('parsePoliceResult', () => {
  it('NEW 取 slug、SKIP、解析失敗視為跳過', () => {
    expect(parsePoliceResult('POLICE_RESULT=NEW｜police-good-deeds-2026-06-21')).toMatchObject({ action: 'new', slug: 'police-good-deeds-2026-06-21' });
    expect(parsePoliceResult('POLICE_RESULT=SKIP｜各家逾時')).toMatchObject({ action: 'skip' });
    expect(parsePoliceResult('亂回').infra).toBe(true);
  });
  it('清掉 slug 帶出的反引號/引號/標點', () => {
    expect(parsePoliceResult('POLICE_RESULT=NEW｜`police-good-deeds-2026-06-23`')).toMatchObject({ slug: 'police-good-deeds-2026-06-23' });
  });
});
