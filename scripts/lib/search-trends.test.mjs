import { describe, expect, it } from 'vitest';
import {
  GOOGLE_TRENDS_TW_RSS,
  fetchTrendFeed,
  findArticleOverlap,
  parseApproxTraffic,
  parseGoogleTrendsRss,
  rankTrendCandidates,
  scoreTrend,
} from './search-trends.mjs';

const NOW = '2026-08-17T12:00:00.000Z';

const RSS = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>小朋友感冒應該怎麼處理</title>
    <ht:approx_traffic>500+</ht:approx_traffic>
    <pubDate>Mon, 17 Aug 2026 11:30:00 GMT</pubDate>
    <ht:news_item>
      <ht:news_item_title>兒科醫師整理開學季呼吸道感染注意事項</ht:news_item_title>
      <ht:news_item_url>https://example.com/health</ht:news_item_url>
      <ht:news_item_source>Example Health</ht:news_item_source>
    </ht:news_item>
    <ht:news_item>
      <ht:news_item_title>衛生單位提醒家長留意警訊</ht:news_item_title>
      <ht:news_item_url>https://example.com/official</ht:news_item_url>
      <ht:news_item_source>Example Official</ht:news_item_source>
    </ht:news_item>
  </item>
  <item>
    <title>2426</title>
    <ht:approx_traffic>100+</ht:approx_traffic>
    <pubDate>Mon, 17 Aug 2026 11:00:00 GMT</pubDate>
  </item>
</channel></rss>`;

describe('search trend parser', () => {
  it('解析 Google Trends 熱度、時間與新聞佐證', () => {
    const [item] = parseGoogleTrendsRss(RSS);
    expect(item.title).toBe('小朋友感冒應該怎麼處理');
    expect(item.approxTraffic).toBe(500);
    expect(item.pubDate).toBe('2026-08-17T11:30:00.000Z');
    expect(item.newsItems).toHaveLength(2);
  });

  it('解析不同熱度單位', () => {
    expect(parseApproxTraffic('1.2K+')).toBe(1200);
    expect(parseApproxTraffic('2M+')).toBe(2_000_000);
    expect(parseApproxTraffic('')).toBe(0);
  });
});

describe('search trend scoring', () => {
  it('健康且新鮮、具多個來源的題目可進 GO', () => {
    const [item] = parseGoogleTrendsRss(RSS);
    const scored = scoreTrend(item, { now: NOW });
    expect(scored.categories).toContain('health');
    expect(scored.decision).toBe('GO');
    expect(scored.score).toBeGreaterThanOrEqual(8);
  });

  it('純數字熱搜一定丟棄', () => {
    const [, item] = parseGoogleTrendsRss(RSS);
    expect(scoreTrend(item, { now: NOW }).decision).toBe('DROP');
  });

  it('只有兩個字且沒有問題意圖的泛題要人工複核', () => {
    const scored = scoreTrend({ title: '棒球', approxTraffic: 1000, pubDate: '2026-08-17T11:30:00.000Z', newsItems: [] }, { now: NOW });
    expect(scored.risks).toContain('too-broad');
    expect(scored.decision).toBe('REVIEW');
  });

  it('撞到既有標題時標記 overlap，不再自動 GO', () => {
    const [item] = parseGoogleTrendsRss(RSS);
    const scored = scoreTrend(item, {
      now: NOW,
      articles: [{ slug: 'cold-guide', title: '小朋友感冒應該怎麼處理：家長先做這幾件事' }],
    });
    expect(findArticleOverlap(item.title, [{ slug: 'cold-guide', title: '小朋友感冒應該怎麼處理：家長先做這幾件事' }]).slug).toBe('cold-guide');
    expect(scored.decision).not.toBe('GO');
  });

  it('過期項目與純數字項目不會進候選清單', () => {
    const items = parseGoogleTrendsRss(RSS).map((item) => ({ ...item, pubDate: item.title === '2426' ? '2026-08-10T00:00:00.000Z' : item.pubDate }));
    const result = rankTrendCandidates(items, { now: NOW });
    expect(result.candidates.map((item) => item.title)).toEqual(['小朋友感冒應該怎麼處理']);
    expect(result.dropped.map((item) => item.title)).toContain('2426');
  });
});

describe('fetchTrendFeed', () => {
  it('接受可注入 fetch，維持來源 URL 契約', async () => {
    let requested;
    const body = await fetchTrendFeed(GOOGLE_TRENDS_TW_RSS, {
      fetchImpl: async (url, options) => {
        requested = { url, options };
        return { ok: true, text: async () => RSS };
      },
    });
    expect(requested.url).toBe(GOOGLE_TRENDS_TW_RSS);
    expect(requested.options.headers['user-agent']).toContain('appi.news-search-trend-radar');
    expect(body).toContain('<item>');
  });
});
