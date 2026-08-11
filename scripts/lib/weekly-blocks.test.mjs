import { describe, it, expect } from 'vitest';
import { weeklyReportBlocks } from './weekly-blocks.mjs';

const sample = {
  period: { start: '2026-06-18', end: '2026-06-24' },
  sprint: {
    milestoneDate: '2026-08-16', targetPageViews: 1800, pageViews: 1131,
    gapPageViews: 669, targetMet: false, sessions: 1019, pvPerSession: 1.11,
    pvPerSessionTarget: 1.35, topArticleSharePct: 6, concentrationPass: true,
    middleTrafficPages: { atLeast10Pv: 15, atLeast20Pv: 5 },
    topics: [{ id: 'qixi-2026', title: '2026七夕與七娘媽指南', members: 1, views: 12, impressions: 953, clicks: 2, position: 7.4 }],
  },
  articlePerf: {
    topArticles: [
      { path: '/', views: 154, avgEngagementSec: 13 },
      { path: '/finance/', views: 17, avgEngagementSec: 25 },
    ],
    byPageType: [
      { type: 'article', views: 154, wowPct: 670 },
      { type: 'author', views: 7, wowPct: -83 },
    ],
    byArticleCategory: [
      { category: 'health', views: 31, wowPct: 417 },
      { category: 'tech', views: 14, wowPct: null },
    ],
  },
  seoHealth: { pagesInSearch: 251, totalImpressions: 1384, totalClicks: 21, avgPosition: 21 },
  searchOpportunities: [
    { query: '台積電用水量', impressions: 13, ctr: 0, position: 11.666 },
    { query: '綠色及轉型金融行動方案', impressions: 1, ctr: 1, position: 17 },
  ],
  seoOpportunities: {
    pageOpportunities: [{ page: 'https://appi.news/articles/%E6%B2%B9%E7%94%98%E6%9E%9C/', category: 'health', impressions: 25, position: 17, ctr: 0 }],
    titleCtrCandidates: [{ query: '髖關節痛', page: 'https://appi.news/articles/post-426/', category: 'uncategorized', impressions: 25, position: 78.4, ctr: 0 }],
  },
  trafficHealth: {
    pageViews: 1131, pageViewsWoWPct: 151, sessions: 1019, sessionsWoWPct: 174, pvPerSession: 1.11,
    users: 118, usersWoWPct: 157,
    sources: [{ source: '(direct)', users: 69 }, { source: 'google', users: 28 }],
    aiReferrals: [{ source: 'gemini.google.com', users: 2 }],
  },
  notes: { pageType: '讀者在讀文章', seoHealth: '排名待優化', traffic: '直接流量為主' },
};

const blockText = (b) => b.text?.text || (b.elements || []).map((e) => e.text).join('');
const allText = (blocks) => blocks.map(blockText).join('\n');

describe('weeklyReportBlocks', () => {
  it('header 用 M/D 區間', () => {
    const b = weeklyReportBlocks(sample);
    expect(b[0].type).toBe('header');
    expect(b[0].text.text).toContain('6/18–6/24');
  });

  it('衝刺看板列出完整週口徑、里程碑缺口、閱讀深度與集中度', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('最近 7 天 PV 1,131 / 1,800（8/16，還差 669）');
    expect(t).toContain('sessions 1,019・PV/session 1.11（目標 1.35）');
    expect(t).toContain('腰部頁 ≥10PV 15・≥20PV 5');
    expect(t).toContain('單篇最高占比 6%（上限 25%，通過）');
    expect(t).toContain('2026七夕與七娘媽指南：PV 12・曝光 953・點擊 2・排名 7.4');
  });

  it('粗體鐵律：任何 section/context 文字裡 closing `*` 後面都不接全形標點或全形空格', () => {
    // 這條就是 2026-06「*（…）」破粗體那個 bug 的回歸測試
    const bad = /\*[^*\n]+\*[（）〔〕「」　·]/;
    for (const blk of weeklyReportBlocks(sample)) {
      const t = blockText(blk);
      expect(t, `壞粗體邊界：${t}`).not.toMatch(bad);
    }
  });

  it('區塊標題不掛冗長括號說明（緊湊）', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).not.toContain('第 2 頁衝刺*（');
    expect(t).not.toContain('（補內鏈');
    expect(t).toContain('*②b 🎯 第 2 頁衝刺*');
  });

  it('搜尋機會為單行、標籤跟著數字', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('• *台積電用水量* 曝光 13・排名 11.7・CTR 0%');
  });

  it('CTR 分數轉百分比、排名四捨五入到 1 位', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('CTR 0%');
    expect(t).toContain('CTR 100%'); // ctr:1
  });

  it('頁面類型/分類用中文標籤、WoW 帶括號、null 不顯示百分比', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('文章內文　154（+670%）');
    expect(t).toContain('作者頁　7（-83%）');
    expect(t).toContain('科技　14'); // wowPct null → 無括號
    expect(t).not.toContain('科技　14（');
  });

  it('seoHealth 壓成一行、含全站 CTR', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('頁數 251・曝光 1,384・點擊 21（CTR 1.5%）・均排名 21');
  });

  it('notes 走 context 小灰字、以 ↳ 開頭', () => {
    const ctxs = weeklyReportBlocks(sample).filter((b) => b.type === 'context').map(blockText);
    expect(ctxs.some((t) => t === '↳ 讀者在讀文章')).toBe(true);
  });

  it('GSC 編碼 URL 路徑會去網域 + 解碼成中文', () => {
    const t = allText(weeklyReportBlocks(sample));
    expect(t).toContain('/articles/油甘果/');
    expect(t).not.toContain('%E6');
  });

  it('AI 轉介併入流量塊；缺資料顯示 無', () => {
    expect(allText(weeklyReportBlocks(sample))).toContain('AI 轉介（真人點進站）：gemini.google.com 2');
    const noAi = { ...sample, trafficHealth: { ...sample.trafficHealth, aiReferrals: [] } };
    expect(allText(weeklyReportBlocks(noAi))).toContain('AI 轉介（真人點進站）：無');
  });

  it('流量健康度固定比較 PV、sessions 與 PV/session', () => {
    expect(allText(weeklyReportBlocks(sample))).toContain('PV 1,131（+151%）・sessions 1,019（+174%）・PV/session 1.11');
  });

  it('缺區塊不炸、仍出 header 與頁尾', () => {
    const b = weeklyReportBlocks({ period: { start: '2026-06-18', end: '2026-06-24' } });
    expect(b[0].type).toBe('header');
    expect(b[b.length - 1].type).toBe('context');
  });

  it('section text 不超過 Slack 3000 字上限', () => {
    for (const blk of weeklyReportBlocks(sample)) {
      if (blk.type === 'section') expect(blk.text.text.length).toBeLessThanOrEqual(3000);
    }
  });
});
