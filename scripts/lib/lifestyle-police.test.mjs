import { describe, it, expect } from 'vitest';
import { buildPolicePrompt, parsePoliceResult, POLICE_SOURCES } from './lifestyle-police.mjs';
import { isGoodDeed } from './police-fetch.mjs';

describe('POLICE_SOURCES', () => {
  it('含主力好人好事來源（高雄/宜蘭/屏東）且都有 URL', () => {
    const areas = POLICE_SOURCES.map((s) => s.area);
    expect(areas).toEqual(expect.arrayContaining(['高雄市', '宜蘭縣', '屏東縣']));
    expect(POLICE_SOURCES.every((s) => /^https:\/\//.test(s.url))).toBe(true);
    expect(POLICE_SOURCES.filter((s) => s.priority).length).toBeGreaterThanOrEqual(3);
  });
});

describe('buildPolicePrompt — 吃固定抓好的候選、只挑選＋寫作', () => {
  const candidates = [
    { area: '臺北市', title: '松山警助迷途日籍旅客平安返宿', url: 'https://police.gov.taipei/News_Content.aspx?s=DC34', date: '2026-07-02', summary: '日籍老翁迷途，員警協助返回飯店。' },
  ];
  const p = buildPolicePrompt(candidates, ['上週各地暖警好事'], 7);
  it('內含候選素材（標題＋連結）、禁止自己上網抓、附連結原封不動、去重清單、自動上架欄位、輸出格式', () => {
    expect(p).toContain('松山警助迷途日籍旅客平安返宿'); // 候選標題
    expect(p).toContain('police.gov.taipei/News_Content.aspx?s=DC34'); // 候選連結原封
    expect(p).toContain('不需要、也不要自己上網抓取'); // 只挑選＋寫作
    expect(p).toContain('近 7 天');
    expect(p).toContain('不要轉載');
    expect(p).toContain('上週各地暖警好事'); // 去重清單
    expect(p).toContain('status: "published"');
    expect(p).toContain('POLICE_RESULT=');
  });
  it('無候選時素材區塊標「（無候選）」', () => {
    expect(buildPolicePrompt([], [], 7)).toContain('（無候選）');
  });
});

describe('isGoodDeed — 先排除執法/宣導、再看正面善行詞', () => {
  it('收真好人好事', () => {
    expect(isGoodDeed('手機遺落計程車 警10分鐘迅速尋回 暖民心')).toBe(true);
    expect(isGoodDeed('松山警助迷途日籍旅客平安返宿')).toBe(true);
    expect(isGoodDeed('暴雨困69歲獨居翁 枋警及時涉水救援')).toBe(true);
    expect(isGoodDeed('老婦捷運迷途，大同暖警跨區護送返家')).toBe(true);
  });
  it('排除執法/宣導/流水帳（實測曾誤收的案例）', () => {
    expect(isGoodDeed('東港警啟動青春專案 全力執行守護青少年')).toBe(false);
    expect(isGoodDeed('北市保大感謝松山慈惠堂捐助鼓勵員警查緝毒(酒)駕')).toBe(false);
    expect(isGoodDeed('全國同步擴大取締毒駕 彰警鐵拳出擊守護彰化')).toBe(false);
    expect(isGoodDeed('感謝分局長頒發')).toBe(false);
    expect(isGoodDeed('警察刑事紀錄證明網路申請新制宣導')).toBe(false);
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
