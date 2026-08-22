import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseSuggestions,
  recentSiteTitles,
  fetchAlertPath,
  noteFetchFailure,
  clearFetchFailure,
  describeStreak,
} from './radar-shared.mjs';

describe('選題結果解析（forum／golf 兩支雷達共用）', () => {
  const sample = [
    { title: 'A', conclusion: 'c', angle: 'g', signal: 's', category: 'tech', subcategory: 'ai', kind: 'factual' },
  ];

  it('吃純 JSON 陣列', () => {
    const r = parseSuggestions(JSON.stringify(sample));
    expect(r.ok).toBe(true);
    expect(r.suggestions).toHaveLength(1);
  });

  it('吃 ```json 圍欄', () => {
    const r = parseSuggestions('這是我的選題：\n```json\n' + JSON.stringify(sample) + '\n```\n以上');
    expect(r.ok).toBe(true);
    expect(r.suggestions[0].title).toBe('A');
  });

  it('吃前後夾雜文字的裸陣列', () => {
    const r = parseSuggestions('結果如下\n' + JSON.stringify(sample) + '\n請確認');
    expect(r.ok).toBe(true);
  });

  it('空陣列＝編輯判斷「這批沒可寫的」，是成功不是故障', () => {
    const r = parseSuggestions('[]');
    expect(r.ok).toBe(true);
    expect(r.suggestions).toEqual([]);
  });

  it('**解析不出來＝infra 故障**，要與「空陣列」明確區分', () => {
    expect(parseSuggestions('我今天沒辦法回答').ok).toBe(false);
    expect(parseSuggestions('').ok).toBe(false);
    expect(parseSuggestions('{"not":"an array"}').ok).toBe(false);
  });
});

describe('recentSiteTitles（近期已發標題，餵選題 prompt 去重）', () => {
  const daysAgo = (n) => new Date(Date.now() - n * 86400 * 1000).toISOString().slice(0, 10);
  const art = (title, date) => `---\ntitle: ${title}\npublishDate: ${date}\n---\n內文`;

  it('只取窗內、由新到舊、可設上限', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rst-'));
    writeFileSync(join(dir, 'old.md'), art('太舊', daysAgo(60)));
    writeFileSync(join(dir, 'a.md'), art('較舊', daysAgo(10)));
    writeFileSync(join(dir, 'b.md'), art('最新', daysAgo(1)));
    writeFileSync(join(dir, 'broken.md'), '沒有 frontmatter');
    expect(recentSiteTitles({ days: 30, articlesDir: dir })).toEqual(['最新', '較舊']);
    expect(recentSiteTitles({ days: 30, limit: 1, articlesDir: dir })).toEqual(['最新']);
  });

  it('目錄不存在回空陣列，不因去重資料缺失而丟例外', () => {
    expect(recentSiteTitles({ articlesDir: '/nonexistent-dir-for-test' })).toEqual([]);
  });
});

describe('全源抓取失敗的告警節流（path 可注入）', () => {
  const H = 3600 * 1000;
  const t0 = Date.parse('2026-08-18T00:00:00Z');
  const newPath = () => join(mkdtempSync(join(tmpdir(), 'alert-')), 'fetch-alert.json');

  it('fetchAlertPath 一雷達一個 key，落在 state 目錄', () => {
    expect(fetchAlertPath('forum').endsWith('appi-news/forum-fetch-alert.json')).toBe(true);
    expect(fetchAlertPath('golf').endsWith('appi-news/golf-fetch-alert.json')).toBe(true);
    expect(fetchAlertPath('forum')).not.toBe(fetchAlertPath('golf'));
  });

  it('**一波故障的第 1 輪一定報**，6 小時內不重報', () => {
    const path = newPath();
    const first = noteFetchFailure(path, t0);
    expect(first).toMatchObject({ streak: 1, shouldAlert: true });

    const second = noteFetchFailure(path, t0 + 1 * H);
    expect(second).toMatchObject({ streak: 2, shouldAlert: false });
    const third = noteFetchFailure(path, t0 + 2 * H);
    expect(third).toMatchObject({ streak: 3, shouldAlert: false });
  });

  it('同一波超過冷卻期再報一次，且帶連續輪數與起始時間', () => {
    const path = newPath();
    noteFetchFailure(path, t0);
    noteFetchFailure(path, t0 + 3 * H);
    // 距上次失敗（t0+3h）6 小時內＝同一波；距上次告警（t0）已滿 6 小時＝再報。
    const wave = noteFetchFailure(path, t0 + 8 * H);
    expect(wave).toMatchObject({ streak: 3, streakStartMs: t0, shouldAlert: true });
    expect(describeStreak(wave)).toContain('連續第 3 輪');
    expect(describeStreak(wave)).toContain('2026-08-18 00:00');
  });

  it('隔太久沒失敗算新一波：streak 重算、立刻報', () => {
    const path = newPath();
    noteFetchFailure(path, t0);
    // 高爾夫線每日一跑：相隔 24 小時已超過 STREAK_GAP，一定是新一波（一定報）。
    const nextDay = noteFetchFailure(path, t0 + 24 * H);
    expect(nextDay).toMatchObject({ streak: 1, shouldAlert: true });
  });

  it('persist=false（dry-run）只算不寫，不吃掉下一輪 cron 的告警', () => {
    const path = newPath();
    const dry = noteFetchFailure(path, t0, { persist: false });
    expect(dry.shouldAlert).toBe(true);
    expect(() => readFileSync(path, 'utf8')).toThrow(); // 沒有落地
    // 下一輪（cron，persist）仍是第 1 輪、照樣告警。
    expect(noteFetchFailure(path, t0 + 1 * H)).toMatchObject({ streak: 1, shouldAlert: true });
  });

  it('clearFetchFailure 結束這一波，下次失敗從第 1 輪重算並立刻出聲', () => {
    const path = newPath();
    noteFetchFailure(path, t0);
    noteFetchFailure(path, t0 + 1 * H);
    clearFetchFailure(path);
    expect(noteFetchFailure(path, t0 + 2 * H)).toMatchObject({ streak: 1, shouldAlert: true });
  });

  it('state 檔寫不進去時寧可多報不可不報（每輪都當第 1 輪）', () => {
    const dir = mkdtempSync(join(tmpdir(), 'alert-')); // path 指向目錄＝讀寫都失敗
    expect(noteFetchFailure(dir, t0).shouldAlert).toBe(true);
    expect(noteFetchFailure(dir, t0 + 1 * H).shouldAlert).toBe(true);
  });

  it('describeStreak 第 1 輪與多輪的敘述不同', () => {
    expect(describeStreak({ streak: 1, streakStartMs: t0, elapsedMs: 0 })).toBe('本波第 1 輪（剛開始失敗）');
    expect(describeStreak({ streak: 5, streakStartMs: t0, elapsedMs: 4 * H })).toContain('約 4 小時');
    expect(describeStreak({ streak: 2, streakStartMs: t0, elapsedMs: 0.5 * H })).toContain('不到 1 小時');
  });
});
