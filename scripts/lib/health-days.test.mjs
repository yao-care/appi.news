import { describe, it, expect } from 'vitest';
import {
  HEALTH_DAYS,
  resolveHealthDate,
  healthDaysOn,
  healthDaysAhead,
  healthDaysWithin,
  articleSlugFor,
  ledgerKey,
  buildHealthDayPrompt,
  parseHealthDayResult,
} from './health-days.mjs';

describe('resolveHealthDate — 固定日', () => {
  it('直接把年份接上 MM-DD', () => {
    expect(resolveHealthDate({ md: '02-04' }, 2027)).toBe('2027-02-04');
    expect(resolveHealthDate({ md: '12-01' }, 2030)).toBe('2030-12-01');
  });
});

describe('resolveHealthDate — 第 n 個星期幾', () => {
  it('世界腎臟病日＝3 月第二個星期四', () => {
    // 2026-03-01 是星期日 → 第一個星期四 3/5、第二個 3/12
    expect(resolveHealthDate({ month: 3, weekday: 4, nth: 2 }, 2026)).toBe('2026-03-12');
    expect(resolveHealthDate({ month: 3, weekday: 4, nth: 2 }, 2027)).toBe('2027-03-11');
  });

  it('世界癲癇日＝2 月第二個星期一', () => {
    expect(resolveHealthDate({ month: 2, weekday: 1, nth: 2 }, 2026)).toBe('2026-02-09');
    expect(resolveHealthDate({ month: 2, weekday: 1, nth: 2 }, 2027)).toBe('2027-02-08');
  });

  it('國際社工日＝3 月第三個星期二', () => {
    expect(resolveHealthDate({ month: 3, weekday: 2, nth: 3 }, 2026)).toBe('2026-03-17');
    expect(resolveHealthDate({ month: 3, weekday: 2, nth: 3 }, 2027)).toBe('2027-03-16');
  });

  it('當月當星期幾不足 n 個時要炸開，不要默默回傳下個月', () => {
    // 2026 年 2 月只有 4 個星期一（2、9、16、23）
    expect(() => resolveHealthDate({ month: 2, weekday: 1, nth: 5 }, 2026)).toThrow();
  });
});

describe('resolveHealthDate — 最後一個星期幾', () => {
  it('世界防治漢生病日＝1 月最後一個星期日', () => {
    expect(resolveHealthDate({ month: 1, weekday: 0, nth: 'last' }, 2026)).toBe('2026-01-25');
    expect(resolveHealthDate({ month: 1, weekday: 0, nth: 'last' }, 2027)).toBe('2027-01-31');
  });

  it('月底剛好就是該星期幾時要取到當天', () => {
    // 2027-01-31 是星期日，等於當月最後一天
    expect(resolveHealthDate({ month: 1, weekday: 0, nth: 'last' }, 2027)).toBe('2027-01-31');
  });

  it('閏年 2 月照樣算對', () => {
    // 2028-02-29 是星期二 → 2 月最後一個星期二＝2/29
    expect(resolveHealthDate({ month: 2, weekday: 2, nth: 'last' }, 2028)).toBe('2028-02-29');
  });
});

describe('healthDaysOn', () => {
  it('抓得到固定日', () => {
    const hits = healthDaysOn('2027-02-04');
    expect(hits.map((h) => h.slug)).toEqual(['world-cancer-day']);
  });

  it('一天可以有多個主題（11/12 醫師節＋世界肺炎日）', () => {
    const hits = healthDaysOn('2027-11-12');
    expect(hits.map((h) => h.slug).sort()).toEqual(['doctors-day-taiwan', 'world-pneumonia-day']);
  });

  it('沒有紀念日的日子回空陣列', () => {
    expect(healthDaysOn('2027-08-15')).toEqual([]);
  });

  it('浮動日要跟著年份走，不能寫死', () => {
    expect(healthDaysOn('2026-02-09').map((h) => h.slug)).toEqual(['international-epilepsy-day']);
    expect(healthDaysOn('2027-02-09')).toEqual([]);
    expect(healthDaysOn('2027-02-08').map((h) => h.slug)).toEqual(['international-epilepsy-day']);
  });
});

describe('healthDaysAhead', () => {
  it('往後數 2 天', () => {
    const hits = healthDaysAhead('2027-02-02', 2);
    expect(hits).toHaveLength(1);
    expect(hits[0].entry.slug).toBe('world-cancer-day');
    expect(hits[0].date).toBe('2027-02-04');
  });

  it('跨月成立（1/30 往後 5 天＝2/4 世界癌症日）', () => {
    const hits = healthDaysAhead('2027-01-30', 5);
    expect(hits[0]?.date).toBe('2027-02-04');
    expect(hits[0]?.entry.slug).toBe('world-cancer-day');
  });

  it('跨年成立（12/30 往後 2 天＝隔年 1/1）', () => {
    const hits = healthDaysAhead('2026-12-30', 2);
    expect(hits).toEqual([]); // 1/1 沒有紀念日，但不應該炸
    expect(healthDaysAhead('2026-12-31', 14)[0]?.date).toBe('2027-01-14');
  });

  it('沒撞到就回空陣列', () => {
    expect(healthDaysAhead('2027-08-10', 2)).toEqual([]);
  });
});

describe('HEALTH_DAYS 資料完整性', () => {
  it('slug 不重複', () => {
    const slugs = HEALTH_DAYS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('每筆都有必要欄位', () => {
    for (const d of HEALTH_DAYS) {
      expect(d.slug, `${d.name} 缺 slug`).toMatch(/^[a-z0-9-]+$/);
      expect(d.name, `${d.slug} 缺 name`).toBeTruthy();
      expect(d.org, `${d.slug} 缺 org`).toBeTruthy();
      expect(d.angle, `${d.slug} 缺 angle`).toBeTruthy();
      expect(d.category, `${d.slug} 缺 category`).toBe('health');
      expect(d.sub, `${d.slug} 缺 sub`).toBeTruthy();
      expect(d.tags.length, `${d.slug} 缺 tags`).toBeGreaterThan(0);
      // img＝生圖畫面主題，必須是英文（會直接餵 get-image --topic）
      expect(d.img, `${d.slug} 缺 img`).toBeTruthy();
      expect(d.img, `${d.slug} 的 img 不該有中文`).not.toMatch(/[\u4e00-\u9fff]/);
    }
  });

  it('每筆日期規則在任意年份都解得出來（2026-2036 各年皆試）', () => {
    for (let year = 2026; year <= 2036; year++) {
      for (const d of HEALTH_DAYS) {
        expect(() => resolveHealthDate(d.rule, year), `${d.slug} @ ${year}`).not.toThrow();
        expect(resolveHealthDate(d.rule, year)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('已知的三筆坊間錯誤日期沒有被抄進來', () => {
    // 世界癲癇日不是 2/14
    expect(healthDaysOn('2027-02-14')).toEqual([]);
    // 世界肥胖日是 3/4，不是 10/11
    expect(healthDaysOn('2027-03-04').map((h) => h.slug)).toEqual(['world-obesity-day']);
    expect(healthDaysOn('2027-10-11')).toEqual([]);
    // 世界高血壓日是固定 5/17，不是 5 月第二個星期六
    expect(healthDaysOn('2027-05-17').map((h) => h.slug)).toEqual(['world-hypertension-day']);
  });

  it('subcategory 都是 health 分類下的合法子分類', () => {
    const valid = new Set([
      'medical', 'preventive', 'nutrition', 'tcm-integrative', 'mental-health',
      'aging-health', 'medtech', 'health-policy', 'supplement-regulation',
    ]);
    for (const d of HEALTH_DAYS) {
      expect(valid.has(d.sub), `${d.slug} 的 sub=${d.sub} 不合法`).toBe(true);
    }
  });

  it('一年 51 個主題，且沒有一天塞超過 2 篇', () => {
    expect(HEALTH_DAYS).toHaveLength(51);
    const byDate = new Map();
    for (const d of HEALTH_DAYS) {
      const date = resolveHealthDate(d.rule, 2027);
      byDate.set(date, (byDate.get(date) || 0) + 1);
    }
    for (const [date, n] of byDate) {
      expect(n, `${date} 撞了 ${n} 篇`).toBeLessThanOrEqual(2);
    }
  });
});

describe('slug 與帳本鍵值', () => {
  it('文章 slug 帶年份，每年一篇不互相覆蓋', () => {
    const entry = HEALTH_DAYS.find((d) => d.slug === 'world-cancer-day');
    expect(articleSlugFor(entry, 2027)).toBe('world-cancer-day-2027');
    expect(articleSlugFor(entry, 2028)).toBe('world-cancer-day-2028');
  });

  it('帳本鍵值以 slug@年份 為單位', () => {
    const entry = HEALTH_DAYS.find((d) => d.slug === 'world-cancer-day');
    expect(ledgerKey(entry, 2027)).toBe('world-cancer-day@2027');
  });
});

describe('buildHealthDayPrompt', () => {
  const entry = HEALTH_DAYS.find((d) => d.slug === 'world-cancer-day');

  it('把日期、slug、子分類、排程時間都填進 frontmatter 指示', () => {
    const p = buildHealthDayPrompt(entry, '2027-02-04');
    expect(p).toContain('slug: "world-cancer-day-2027"');
    expect(p).toContain('publishDate: "2027-02-04T06:17:00+08:00"');
    expect(p).toContain('status: "scheduled"');
    expect(p).toContain('subcategory: "medical"');
    expect(p).toContain('author: "appi-editorial"');
    expect(p).toContain('topics: ["health-days"]');
  });

  it('明講「不是介紹由來的百科文」，主體要當年度新資訊', () => {
    const p = buildHealthDayPrompt(entry, '2027-02-04');
    expect(p).toContain('這**不是**一篇');
    expect(p).toContain('2027 年的官方主題');
    expect(p).toMatch(/至少 3 條「當年度或最新可得年度」的可查證來源/);
  });

  it('帶入企劃時定的切入方向與權威來源', () => {
    const p = buildHealthDayPrompt(entry, '2027-02-04');
    expect(p).toContain('國際抗癌聯盟（UICC）');
    expect(p).toContain('國健署最新癌症登記報告');
  });

  it('沒有往年文章時說明這是第一篇', () => {
    expect(buildHealthDayPrompt(entry, '2027-02-04')).toContain('這是第一篇');
  });

  it('有往年文章時列出來要求角度不得重複', () => {
    const p = buildHealthDayPrompt(entry, '2028-02-04', {
      priorTitles: ['2027 世界癌症日：篩檢涵蓋率停滯'],
    });
    expect(p).toContain('2027 世界癌症日：篩檢涵蓋率停滯');
    expect(p).toContain('角度不得重複');
    expect(p).not.toContain('這是第一篇');
  });

  it('帶去 AI 腔禁用清單與配圖鐵則', () => {
    const p = buildHealthDayPrompt(entry, '2027-02-04');
    expect(p).toContain('去 AI 腔·統一禁用清單');
    expect(p).toContain('get-image.mjs');
    expect(p).toContain('拿不到圖就不要設 coverImage');
  });

  it('配圖一律 OpenAI 生圖：帶 --generate、用表裡寫死的畫面主題、不用圖庫署名', () => {
    const p = buildHealthDayPrompt(entry, '2027-02-04');
    expect(p).toContain('--generate');
    expect(p).toContain(`--topic "${entry.img}"`);
    expect(p).toContain(`--out public/covers/world-cancer-day-2027-cover.webp`);
    expect(p).toContain('不要加 `--people`');
    expect(p).toContain('不要**填 `coverImageCredit`');
  });
});

describe('parseHealthDayResult', () => {
  it('解得出 OK 與 slug', () => {
    const r = parseHealthDayResult('前面雜訊\nHEALTHDAY_RESULT=OK｜world-cancer-day-2027\n後面查證報告');
    expect(r).toEqual({ action: 'ok', slug: 'world-cancer-day-2027', note: '已寫' });
  });

  it('解得出 SKIP 與原因', () => {
    const r = parseHealthDayResult('HEALTHDAY_RESULT=SKIP｜找不到當年度主題');
    expect(r.action).toBe('skip');
    expect(r.note).toBe('找不到當年度主題');
  });

  it('沒有結果行時當 skip，不要誤判成成功', () => {
    expect(parseHealthDayResult('模型胡言亂語').action).toBe('skip');
    expect(parseHealthDayResult('').action).toBe('skip');
    expect(parseHealthDayResult(undefined).action).toBe('skip');
  });
});

describe('healthDaysWithin — 區間掃描（讓寫失敗能重試）', () => {
  it('T+1..T+lead 都涵蓋，所以隔天仍看得到同一篇', () => {
    // 8/31 國際藥物過量意識日：8/29 是 T+2、8/30 是 T+1，兩天都該看得到
    expect(healthDaysWithin('2026-08-29', 2).map((h) => h.date)).toEqual(['2026-08-31']);
    expect(healthDaysWithin('2026-08-30', 2).map((h) => h.date)).toEqual(['2026-08-31']);
  });

  it('舊的單日版會漏掉，這正是改成區間的原因', () => {
    expect(healthDaysAhead('2026-08-29', 2).map((h) => h.date)).toEqual(['2026-08-31']);
    expect(healthDaysAhead('2026-08-30', 2)).toEqual([]); // ← 漏掉
  });

  it('不含 T+0（當天寫已經來不及，上線 cron 06:17 早就跑過）', () => {
    // 7/28 當天是世界肝炎日，掃 7/28 起的區間不該把它算進來
    expect(healthDaysWithin('2026-07-28', 2).some((h) => h.date === '2026-07-28')).toBe(false);
  });

  it('由近到遠排序', () => {
    // 11/12 有兩篇、11/14 一篇：11/11 起算 3 天內應先 11/12 再 11/14
    const dates = healthDaysWithin('2026-11-11', 3).map((h) => h.date);
    expect(dates).toEqual(['2026-11-12', '2026-11-12', '2026-11-14']);
  });

  it('區間跨年也成立', () => {
    // 1/14 醫事檢驗師節：1/12 起算 2 天內看得到
    expect(healthDaysWithin('2027-01-12', 2).map((h) => h.date)).toEqual(['2027-01-14']);
    expect(healthDaysWithin('2026-12-31', 2)).toEqual([]); // 1/1、1/2 沒紀念日，但不該炸
  });

  it('沒撞到就回空陣列', () => {
    expect(healthDaysWithin('2027-08-10', 2)).toEqual([]);
  });
});
