import { describe, it, expect } from 'vitest';
import { normalizeRound, recentSummary, pruneRounds } from './geo-citation-audit.mjs';

describe('normalizeRound', () => {
  it('從 citedUrls+category 自動判本站/競品', () => {
    const r = normalizeRound(
      {
        date: '2026-07-01',
        items: [
          { question: 'Q1', category: 'finance', engine: 'claude-websearch', citedUrls: ['https://cnyes.com/a', 'https://appi.news/articles/x/'] },
          { question: 'Q2', category: 'finance', engine: 'claude-websearch', citedUrls: ['https://money.udn.com/y'] },
        ],
      },
      '2026-07-01',
    );
    expect(r.items[0].cited).toBe(true);
    expect(r.items[0].rank).toBe(2);
    expect(r.items[0].competitors).toContain('cnyes.com');
    expect(r.items[1].cited).toBe(false);
    expect(r.items[1].competitors).toContain('money.udn.com');
  });
  it('相容舊格式（直接給 cited）', () => {
    const r = normalizeRound({ items: [{ question: 'Q', engine: 'perplexity', cited: true, rank: 1, url: 'https://appi.news/a' }] }, '2026-07-01');
    expect(r.items[0].cited).toBe(true);
    expect(r.items[0].competitors).toEqual([]);
  });
});

describe('recentSummary', () => {
  const ledger = {
    rounds: [
      {
        date: '2026-07-01',
        items: [
          { question: 'Q1', category: 'finance', engine: 'claude-websearch', cited: true, competitors: ['cnyes.com'] },
          { question: 'Q2', category: 'finance', engine: 'claude-websearch', cited: false, competitors: ['cnyes.com', 'businessweekly.com.tw'] },
          { question: 'Q3', category: 'health', engine: 'claude-websearch', cited: false, competitors: ['commonhealth.com.tw'] },
        ],
      },
    ],
  };
  it('總被引用率 + 分分類 + 競品份額', () => {
    const s = recentSummary(ledger, '2026-07-01', 30);
    expect(s.totalQuestions).toBe(3);
    expect(s.citedQuestions).toBe(1);
    expect(s.byCategory.finance).toMatchObject({ total: 2, cited: 1 });
    expect(s.byCategory.health).toMatchObject({ total: 1, cited: 0 });
    // cnyes 在 2 題出現 → 排最前
    expect(s.competitorShare[0]).toMatchObject({ domain: 'cnyes.com', citedQuestions: 2, name: '鉅亨網' });
  });
  it('視窗外的輪次不計入', () => {
    const old = { rounds: [{ date: '2026-01-01', items: [{ question: 'x', cited: true }] }] };
    expect(recentSummary(old, '2026-07-01', 30).totalQuestions).toBe(0);
  });
});

describe('pruneRounds', () => {
  it('砍掉超過保留天數的輪次', () => {
    const led = { rounds: [{ date: '2025-01-01', items: [] }, { date: '2026-07-01', items: [] }] };
    expect(pruneRounds(led, '2026-07-01', 180).rounds).toHaveLength(1);
  });
});
