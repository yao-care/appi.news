import { describe, it, expect } from 'vitest';
import { weeklyReportBlocks } from './weekly-blocks.mjs';

const sample = {
  period: { start: '2026-06-18', end: '2026-06-24' },
  articlePerf: {
    topArticles: [
      { path: '/', title: '首頁', views: 154, avgEngagementSec: 13 },
      { path: '/finance', title: '財經', views: 17, avgEngagementSec: 25 },
    ],
    byPageType: [
      { type: 'article', views: 97, wowPct: 670 },
      { type: 'home', views: 97, wowPct: 362 },
      { type: 'author', views: 7, wowPct: -83 },
    ],
    byArticleCategory: [
      { category: 'health', views: 31, wowPct: 417 },
      { category: 'tech', views: 14, wowPct: null },
    ],
  },
  seoHealth: { pagesInSearch: 251, totalImpressions: 1384, totalClicks: 21, avgPosition: 1.5 },
  searchOpportunities: [
    { query: '台積電用水量', impressions: 13, clicks: 0, ctr: 0, position: 11.7 },
    { query: 'daraxonrasib 價格', impressions: 1, clicks: 1, ctr: 1, position: 16 },
  ],
  seoOpportunities: {
    pageOpportunities: [{ page: '/articles/claude-fable-5-mythos-class-model-tiering', category: 'tech', impressions: 43, position: 10.9, ctr: 0 }],
    titleCtrCandidates: [{ query: 'pingtung semiconductor zone', page: '/articles/pingtung-zone', category: 'tech', impressions: 22, position: 12.9, ctr: 0 }],
  },
  trafficHealth: {
    users: 154, usersWoWPct: -83,
    sources: [{ source: 'google', users: 90 }, { source: '(direct)', users: 40 }],
    aiReferrals: [{ source: 'chatgpt.com', users: 3 }],
  },
  notes: { pageType: '流量主力是讀者讀文章', seoHealth: '索引在累積但 CTR 待優化', traffic: '使用者下滑因前週活動結束' },
};

const allText = (blocks) =>
  blocks.map((b) => b.text?.text || (b.elements || []).map((e) => e.text).join('')).join('\n');

describe('weeklyReportBlocks', () => {
  it('產 header 用 M/D 區間', () => {
    const b = weeklyReportBlocks(sample);
    expect(b[0].type).toBe('header');
    expect(b[0].text.text).toContain('6/18–6/24');
  });

  it('多欄數據用兩行制（標的一行、metrics 縮排另一行），不在同一行塞 4 欄', () => {
    const t = allText(weeklyReportBlocks(sample));
    // 每個搜尋機會：query 與 metrics 分行
    expect(t).toContain('• *台積電用水量*\n　曝光 13・排名 11.7・CTR 0%');
  });

  it('CTR 由分數轉百分比、排名四捨五入到 1 位', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('CTR 0%');
    expect(t).toContain('CTR 100%'); // ctr:1 → 100%
    expect(t).toContain('排名 16'); // 16 → 16
  });

  it('頁面類型/分類用中文標籤、WoW 帶正負號、null 顯示 —', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('文章內文　97 瀏覽（+670%）');
    expect(t).toContain('作者頁　7 瀏覽（-83%）');
    expect(t).toContain('健康　31 瀏覽（+417%）');
    expect(t).toContain('科技　14 瀏覽（—）'); // wowPct null
  });

  it('seoHealth 含全站 CTR（總點擊/總曝光）', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('總曝光　1,384');
    expect(t).toContain('總點擊　21（CTR 1.5%）');
    expect(t).toContain('平均排名　1.5');
  });

  it('模型 notes 以斜體一句話接在區塊後', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('_流量主力是讀者讀文章_');
  });

  it('長路徑會被縮短，含省略號', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('…');
    expect(t).toContain('〔科技〕');
  });

  it('AI 轉介有資料時列出、無資料顯示 無', () => {
    expect(allText(weeklyReportBlocks(sample))).toContain('chatgpt.com 3');
    const noAi = { ...sample, trafficHealth: { ...sample.trafficHealth, aiReferrals: [] } };
    expect(allText(weeklyReportBlocks(noAi))).toContain('*④ 🤖 AI 轉介點擊*');
  });

  it('缺區塊不炸、仍出 header 與頁尾', () => {
    const b = weeklyReportBlocks({ period: { start: '2026-06-18', end: '2026-06-24' } });
    expect(b[0].type).toBe('header');
    expect(b[b.length - 1].type).toBe('context');
  });

  it('所有 section text 不超過 Slack 3000 字上限', () => {
    for (const blk of weeklyReportBlocks(sample)) {
      if (blk.type === 'section') expect(blk.text.text.length).toBeLessThanOrEqual(3000);
    }
  });
});
