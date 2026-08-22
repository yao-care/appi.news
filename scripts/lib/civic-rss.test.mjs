import { describe, it, expect } from 'vitest';
import { parseRss, parsePubDate, stripTags, decodeEntities } from './civic-rss.mjs';
import { isCivicService } from './civic-feeds.mjs';
import { filterNew, recordSeen, loadSeen } from './civic-ledger.mjs';
import { parseCivicResult, buildCivicPrompt } from './lifestyle-civic.mjs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('parsePubDate', () => {
  it('吃 RFC822', () => {
    expect(parsePubDate('Mon, 20 Jul 2026 09:33:00 GMT')).toBe('2026-07-20T09:33:00.000Z');
  });
  it('吃民國 NNN-M-D（南投）', () => {
    expect(parsePubDate('115-07-20')).toBe('2026-07-20T00:00:00.000Z');
  });
  it('吃民國 NNN年M月D日（內文）', () => {
    expect(parsePubDate('發稿日期：115年7月20日')).toBe('2026-07-20T00:00:00.000Z');
  });
  it('無法解析回 null', () => {
    expect(parsePubDate('')).toBeNull();
    expect(parsePubDate('沒有日期')).toBeNull();
  });
});

describe('decodeEntities / stripTags', () => {
  it('解 CDATA 與實體、去標籤', () => {
    expect(decodeEntities('<![CDATA[a&amp;b]]>')).toBe('a&b');
    expect(stripTags('<p>你好&nbsp;<strong>世界</strong></p>')).toBe('你好 世界');
  });
});

describe('parseRss', () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel>
    <item><title><![CDATA[北市家戶清理廢棄石綿建材 開放補助申請]]></title>
      <link>https://www.gov.taipei/News_Content.aspx?n=A&amp;s=B</link>
      <description><![CDATA[<p>115.7.27起開放補助申請</p>]]></description>
      <pubDate>Sun, 20 Jul 2026 01:00:00 GMT</pubDate>
      <category>公告</category></item>
    <item><title>純典禮活動</title><link>https://x.gov.tw/2</link></item>
  </channel></rss>`;
  it('抽出 item 的欄位（title/link/summary/date/categories）', () => {
    const items = parseRss(xml);
    expect(items).toHaveLength(2);
    expect(items[0].title).toContain('石綿');
    expect(items[0].link).toBe('https://www.gov.taipei/News_Content.aspx?n=A&s=B'); // amp 已解
    expect(items[0].summary).toContain('補助申請');
    expect(items[0].pubDate).toBe('2026-07-20T01:00:00.000Z');
    expect(items[0].categories).toEqual(['公告']);
    expect(items[1].pubDate).toBeNull();
  });
  it('Atom entry + link href', () => {
    const atom = `<feed><entry><title>線上申辦上路</title><link href="https://y.gov.tw/a"/><updated>2026-07-20T00:00:00Z</updated></entry></feed>`;
    const items = parseRss(atom);
    expect(items[0].link).toBe('https://y.gov.tw/a');
    expect(items[0].title).toBe('線上申辦上路');
  });
});

describe('isCivicService', () => {
  it('含便民詞且不含排除詞 → true', () => {
    expect(isCivicService('北市家戶清理廢棄石綿建材 開放補助申請')).toBe(true);
    expect(isCivicService('捷運環狀線北環段工程 施工改道')).toBe(true); // 工程→? 需含正面詞；「改道」非清單，但「捷運」在清單
  });
  it('典禮/表揚/首長行程 → false（排除優先）', () => {
    expect(isCivicService('市長出席光華商場周年慶剪綵典禮')).toBe(false);
    expect(isCivicService('全國語文競賽頒獎典禮')).toBe(false);
  });
  it('與便民無關 → false', () => {
    expect(isCivicService('本府人事異動布達')).toBe(false);
  });
});

describe('civic-ledger', () => {
  it('filterNew 濾掉帳本已有的 url', () => {
    const seen = { 'https://a/1': '2026-07-20T00:00:00Z' };
    const cands = [{ url: 'https://a/1' }, { url: 'https://a/2' }];
    expect(filterNew(cands, seen).map((c) => c.url)).toEqual(['https://a/2']);
  });
  it('recordSeen 寫入並可再讀回', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'civic-led-')), 'seen.json');
    // nowIso 必須用動態近期時間：recordSeen 會用「真實現在」剪 30 天前的紀錄，
    // 寫死日期的版本在 30 天後開始必然紅（2026-08-20 實際發生過）。
    recordSeen([{ url: 'https://a/1' }, { url: 'https://a/2' }], { path, nowIso: new Date().toISOString() });
    const seen = loadSeen(path);
    expect(Object.keys(seen).sort()).toEqual(['https://a/1', 'https://a/2']);
  });
  it('recordSeen 剪除逾 30 天舊紀錄', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'civic-led-')), 'seen.json');
    recordSeen([{ url: 'https://old/1' }], { path, nowIso: '2026-01-01T00:00:00Z' });
    recordSeen([{ url: 'https://new/1' }], { path }); // now＝真實現在 → old 逾 30 天被剪
    const seen = loadSeen(path);
    expect(seen['https://new/1']).toBeTruthy();
    expect(seen['https://old/1']).toBeUndefined();
  });
});

describe('parseCivicResult', () => {
  it('NEW 帶 slug', () => {
    expect(parseCivicResult('CIVIC_RESULT=NEW｜civic-services-2026-07-20')).toMatchObject({
      action: 'new', slug: 'civic-services-2026-07-20', note: 'civic-services-2026-07-20',
    });
  });
  it('SKIP', () => {
    expect(parseCivicResult('CIVIC_RESULT=SKIP｜今天無合適便民措施').action).toBe('skip');
  });
  it('無法解析 → skip+infra', () => {
    const r = parseCivicResult('亂七八糟');
    expect(r.action).toBe('skip');
    expect(r.infra).toBe(true);
  });
});

describe('buildCivicPrompt', () => {
  it('候選依縣市分組、含連結與 SKIP 指示', () => {
    const p = buildCivicPrompt([
      { area: '臺北市', title: '開放補助申請', url: 'https://a/1', date: '2026-07-20T00:00:00Z', summary: 's' },
      { area: '高雄市', title: '免費健檢', url: 'https://b/2', date: null, summary: '' },
    ], []);
    expect(p).toContain('【臺北市】');
    expect(p).toContain('【高雄市】');
    expect(p).toContain('https://a/1');
    expect(p).toContain('CIVIC_RESULT=NEW');
    expect(p).toContain('SKIP');
  });
});
