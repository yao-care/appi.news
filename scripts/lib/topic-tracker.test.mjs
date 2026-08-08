import { describe, it, expect } from 'vitest';
import {
  fmList, parseArticle, parseTopic, membersOf, diffMembers, aggregate,
  recentCount, topicStatus, delta, summaryTable, updateTable, summaryFallbackText,
} from './topic-tracker.mjs';

const article = (fm) => `---\n${fm}\n---\n內文`;

describe('frontmatter 解析', () => {
  it('清單吃行內與區塊兩種 YAML 寫法', () => {
    expect(fmList('topics: ["a", "b"]', 'topics')).toEqual(['a', 'b']);
    expect(fmList('topics:\n  - a\n  - b\nx: 1', 'topics')).toEqual(['a', 'b']);
    expect(fmList('title: 無此欄', 'topics')).toEqual([]);
  });

  it('文章：slug 缺就用檔名、topics 讀得到', () => {
    const a = parseArticle(article('title: "標題"\ncategory: "health"\ntopics: ["t1"]'), 'file-slug');
    expect(a.slug).toBe('file-slug');
    expect(a.title).toBe('標題');
    expect(a.topics).toEqual(['t1']);
    expect(a.isPublic).toBe(true);
  });

  it('排程稿（未到時間）與 draft 不算已公開', () => {
    const now = new Date('2026-08-08T00:00:00Z');
    const sched = parseArticle(article('title: "A"\nstatus: "scheduled"\npublishDate: 2026-08-20T00:00:00Z'), 's', now);
    expect(sched.isPublic).toBe(false);
    const past = parseArticle(article('title: "A"\nstatus: "scheduled"\npublishDate: 2026-08-01T00:00:00Z'), 's', now);
    expect(past.isPublic).toBe(true);
    expect(parseArticle(article('title: "A"\ndraft: true'), 's', now).isPublic).toBe(false);
  });

  it('主題：預設 status active', () => {
    const t = parseTopic(`---\ntitle: "主題"\ncategory: "tech"\narticles: ["m1"]\n---`, 'hub');
    expect(t).toMatchObject({ id: 'hub', title: '主題', category: 'tech', status: 'active', articles: ['m1'] });
  });
});

describe('membersOf — 手動指定 ∪ 反向關聯，且只收已公開', () => {
  const topic = { id: 'hub', articles: ['manual'] };
  const arts = [
    { slug: 'manual', topics: [], isPublic: true, publishDate: '2026-08-01' },
    { slug: 'reverse', topics: ['hub'], isPublic: true, publishDate: '2026-08-05' },
    { slug: 'both', topics: ['hub'], isPublic: true, publishDate: '2026-08-03' },
    { slug: 'hidden', topics: ['hub'], isPublic: false, publishDate: '2026-08-09' },
    { slug: 'other', topics: ['x'], isPublic: true, publishDate: '2026-08-06' },
  ];
  it('聯集、去重、排除未公開、依日期新到舊', () => {
    expect(membersOf(topic, arts).map((m) => m.slug)).toEqual(['reverse', 'both', 'manual']);
  });
});

describe('diffMembers', () => {
  it('算出新增與移除', () => {
    expect(diffMembers(['a', 'b'], ['b', 'c'])).toEqual({ added: ['c'], removed: ['a'] });
    expect(diffMembers(['a'], ['a'])).toEqual({ added: [], removed: [] });
  });
});

describe('aggregate — 平均排名用曝光加權', () => {
  const members = [{ slug: 'x' }, { slug: 'y' }, { slug: 'z' }];
  const byPath = {
    '/articles/x/': { impressions: 100, clicks: 5, position: 10, views: 40 },
    '/articles/y/': { impressions: 900, clicks: 5, position: 20, views: 60 },
    // z 沒有任何資料 → 不該把排名拉歪，也不該噴錯
  };
  it('加總曝光/點擊/瀏覽，排名依曝光加權', () => {
    const a = aggregate(members, byPath);
    expect(a).toMatchObject({ impressions: 1000, clicks: 10, views: 100, withImpressions: 2 });
    expect(a.position).toBeCloseTo(19, 5); // (100*10 + 900*20) / 1000
  });
  it('零曝光時排名回 null（不是 0，0 會被誤讀成第一名）', () => {
    expect(aggregate(members, {}).position).toBeNull();
  });
});

describe('狀態燈號（純規則）', () => {
  const now = new Date('2026-08-08T00:00:00Z');
  it('近 90 天有無新文', () => {
    const members = [{ publishDate: '2026-08-01' }, { publishDate: '2025-01-01' }];
    expect(recentCount(members, 90, now)).toBe(1);
  });
  it('🔴 停滯 / 🟢 成長 / 🟡 放緩', () => {
    expect(topicStatus({ recent90: 0, impressions: 100, prevImpressions: 10 })).toBe('🔴');
    expect(topicStatus({ recent90: 2, impressions: 100, prevImpressions: 90 })).toBe('🟢');
    expect(topicStatus({ recent90: 2, impressions: 90, prevImpressions: 100 })).toBe('🟡');
  });
});

describe('delta', () => {
  it('漲用 🔺、跌用 - 、持平用 —', () => {
    expect(delta(120, 100)).toBe('🔺20');
    expect(delta(80, 100)).toBe('-20');
    expect(delta(100, 100)).toBe('—');
    expect(delta(24.5, 25.7, { digits: 1 })).toBe('-1.2');
  });
  it('排名：數字變小是進步 → 🔺（符號是語意方向，不是數值方向）', () => {
    expect(delta(8.4, 9.1, { digits: 1, betterWhenLower: true })).toBe('🔺0.7');
    expect(delta(9.1, 8.4, { digits: 1, betterWhenLower: true })).toBe('-0.7');
  });
});

describe('Slack table blocks', () => {
  const rows = [{
    id: 'hub', title: '主題 A', url: 'https://appi.news/topics/hub/', members: 34,
    impressions: 3412, prevImpressions: 3192, clicks: 88, prevClicks: 83,
    position: 31.24, prevPosition: 31.64, status: '🟢',
  }];

  it('總表：第一列是表頭、欄數一致、主題名是連結', () => {
    const t = summaryTable(rows);
    expect(t.type).toBe('table');
    expect(t.rows[0].map((c) => c.text)).toEqual(['主題', '收錄（篇）', '曝光（次）', '點擊（次）', '排名', '狀態']);
    expect(t.rows.every((r) => r.length === 6)).toBe(true);
    expect(t.column_settings).toHaveLength(6);
    const first = t.rows[1][0];
    expect(first.type).toBe('rich_text');
    expect(first.elements[0].elements[0]).toMatchObject({ type: 'link', url: rows[0].url, text: '主題 A' });
  });

  it('總表：數字帶千分位與週比較', () => {
    const t = summaryTable(rows);
    expect(t.rows[1][2].text).toBe('3,412 🔺220');
    expect(t.rows[1][4].text).toBe('31.2 🔺0.4'); // 31.64 → 31.24＝排名進步，語意方向要顯示 ▲
  });

  it('Slack 上限：100 列、20 欄', () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ ...rows[0], id: `t${i}` }));
    const t = summaryTable(many.slice(0, 99));
    expect(t.rows.length).toBeLessThanOrEqual(100);
    expect(t.rows[0].length).toBeLessThanOrEqual(20);
  });

  it('更新表：動作/文章/分類三欄', () => {
    const t = updateTable([{ sign: '＋', title: 'A', url: 'https://appi.news/articles/a/', category: '健康' }]);
    expect(t.rows[0].map((c) => c.text)).toEqual(['動作', '文章', '分類']);
    expect(t.rows[1][0].text).toBe('＋');
    expect(t.rows[1][2].text).toBe('健康');
  });

  it('退路文字：兩行制，粗體不緊接全形標點（週報那條坑）', () => {
    const s = summaryFallbackText(rows);
    expect(s.split('\n')).toHaveLength(2);
    expect(s).not.toMatch(/\*[^*\n]+\*[（）〔〕「」　·]/);
  });
});
