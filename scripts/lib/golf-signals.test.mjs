import { describe, it, expect } from 'vitest';
import {
  TAIWAN_PLAYERS,
  SOURCES,
  matchPlayer,
  isNoiseTitle,
  normalizeKey,
  filterUnseen,
  mergeSeen,
} from './golf-signals.mjs';

describe('台灣選手命中（mustCover 的判定來源）', () => {
  it('中文名命中，回完整選手物件（含 tour）', () => {
    const p = matchPlayer('潘政琮 本週在 PGA 錦標賽並列第 12');
    expect(p).toMatchObject({ zh: '潘政琮', tour: 'PGA Tour' });
  });

  it('英文名命中且不分大小寫、吃多種拼法', () => {
    expect(matchPlayer('C.T. Pan makes the cut at Memphis')?.zh).toBe('潘政琮');
    expect(matchPlayer('KEVIN YU shoots 65 in round two')?.zh).toBe('俞俊安');
    expect(matchPlayer('Wei Ling Hsu climbs leaderboard')?.zh).toBe('徐薇淩');
  });

  it('摘要文字也比對得到（協調器把 title+summary 串起來餵）', () => {
    expect(matchPlayer('Highlights | 決賽輪精華：詹世昌逆轉奪冠')?.zh).toBe('詹世昌');
  });

  it('沒命中回 null；空值不丟例外', () => {
    expect(matchPlayer('Scottie Scheffler wins FedEx St. Jude')).toBe(null);
    expect(matchPlayer('')).toBe(null);
    expect(matchPlayer(null)).toBe(null);
  });

  it('名冊每位選手都有中文名、至少一個英文拼法與所屬巡迴賽', () => {
    for (const p of TAIWAN_PLAYERS) {
      expect(p.zh).toBeTruthy();
      expect(p.en.length).toBeGreaterThan(0);
      expect(p.tour).toBeTruthy();
    }
  });
});

describe('噪音過濾（刻意寧可少擋：來源已是高爾夫專屬 RSS）', () => {
  it('擋頻道宣傳與花絮', () => {
    expect(isNoiseTitle('Trailer: 2026 Season Preview')).toBe(true);
    expect(isNoiseTitle('Subscribe for more golf highlights')).toBe(true);
    expect(isNoiseTitle('預告：下週決賽轉播')).toBe(true);
    expect(isNoiseTitle('花絮｜球員練習日')).toBe(true);
  });

  it('**不擋**真正的賽事與選手動態', () => {
    expect(isNoiseTitle('Kevin Yu fires 64 to take lead')).toBe(false);
    expect(isNoiseTitle('2026 TPGA 錦標賽 最終回合')).toBe(false);
    // 關鍵字出現在句中（非開頭）不誤擋
    expect(isNoiseTitle('冠軍賽事精華與 Trailer 花絮整理')).toBe(false);
  });
});

describe('去重鍵正規化', () => {
  it('標點與空白不影響、轉小寫', () => {
    expect(normalizeKey('Kevin Yu Fires 64!')).toBe(normalizeKey('kevin yu fires 64'));
    expect(normalizeKey('潘政琮：晉級了')).toBe(normalizeKey('潘政琮晉級了'));
  });

  it('不同題目不會撞 key', () => {
    expect(normalizeKey('Kevin Yu fires 64')).not.toBe(normalizeKey('C.T. Pan fires 64'));
  });

  it('截前 48 字元（同題長尾差異收斂成同 key）', () => {
    const base = 'a'.repeat(48);
    expect(normalizeKey(base + 'xxx')).toBe(normalizeKey(base + 'yyy'));
  });
});

describe('跨次去重帳本（滾動窗：14 天內看過不再推、保留 30 天）', () => {
  const today = new Date('2026-08-16T00:00:00Z');

  it('濾掉近期看過的條目', () => {
    const seen = [{ key: normalizeKey('Kevin Yu fires 64'), date: '2026-08-10' }];
    const cands = [
      { key: normalizeKey('Kevin Yu fires 64'), title: 'A' },
      { key: normalizeKey('C.T. Pan makes cut'), title: 'B' },
    ];
    expect(filterUnseen(cands, seen, today).map((c) => c.title)).toEqual(['B']);
  });

  it('超過比對窗（14 天）的舊紀錄不再擋，條目可以重新被提', () => {
    const seen = [{ key: 'k', date: '2026-07-20' }];
    expect(filterUnseen([{ key: 'k', title: 'A' }], seen, today)).toHaveLength(1);
  });

  it('帳本壞掉/空的時候全部放行（寧可重推，不要整條啞掉）', () => {
    expect(filterUnseen([{ key: 'k1', title: 'A' }], [], today)).toHaveLength(1);
  });

  it('mergeSeen 併入新條目（帶來源）並砍掉超過保留期（30 天）的紀錄', () => {
    const seen = [
      { key: 'old', date: '2026-07-01' }, // 超過保留期
      { key: 'keep', date: '2026-08-01' },
    ];
    const merged = mergeSeen(seen, [{ key: 'new', title: 'N', source: 'ESPN Golf 新聞' }], today);
    const keys = merged.map((s) => s.key);
    expect(keys).toContain('keep');
    expect(keys).toContain('new');
    expect(keys).not.toContain('old');
    expect(merged.find((s) => s.key === 'new').source).toBe('ESPN Golf 新聞');
  });

  it('mergeSeen 不重複記同一個 key', () => {
    const seen = [{ key: 'k', date: '2026-08-01' }];
    const merged = mergeSeen(seen, [{ key: 'k', title: 'X', source: 'S' }], today);
    expect(merged.filter((s) => s.key === 'k')).toHaveLength(1);
  });
});

describe('來源清單健檢', () => {
  it('每個來源都有名稱、kind 與 https 網址', () => {
    for (const s of SOURCES) {
      expect(s.name).toBeTruthy();
      expect(['youtube', 'rss']).toContain(s.kind);
      expect(s.url.startsWith('https://')).toBe(true);
    }
  });
});
