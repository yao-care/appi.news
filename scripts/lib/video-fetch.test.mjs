import { describe, it, expect } from 'vitest';
import { parseYouTubeFeed, daysOld } from './video-fetch.mjs';
import { isLifestyleVideo, isShorts, feedUrl } from './video-feeds.mjs';
import { videoEmbed } from './video-embed.mjs';
import { filterNew } from './video-ledger.mjs';
import { parseVideoResult } from './lifestyle-video.mjs';

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <title>民視新聞網 Formosa TV News network</title>
  <entry>
    <yt:videoId>W7coofVavrU</yt:videoId>
    <title>獨家／開業不到1年摘星！Hābu小餐館成全台首間漢方米其林餐廳－民視新聞</title>
    <author><name>民視新聞網</name></author>
    <published>2026-07-22T09:00:00+00:00</published>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/W7coofVavrU/hqdefault.jpg" width="480" height="360"/>
      <media:description>【民視即時新聞】高雄前鎮區的Hābu小餐館拿下一星。
--
看新聞：https://www.ftvnews.com.tw/news/detail/x
#民視新聞</media:description>
    </media:group>
  </entry>
  <entry>
    <yt:videoId>shortsAAA</yt:videoId>
    <title>米其林餐廳直擊－民視新聞</title>
    <published>2026-07-22T09:05:00+00:00</published>
    <media:group>
      <media:description>【民視即時新聞】同一則的短影音版。 #Shorts #民視新聞</media:description>
    </media:group>
  </entry>
</feed>`;

describe('parseYouTubeFeed', () => {
  it('解析出 videoId／標題／連結／描述／縮圖', () => {
    const items = parseYouTubeFeed(FEED);
    expect(items).toHaveLength(2);
    expect(items[0].videoId).toBe('W7coofVavrU');
    expect(items[0].url).toBe('https://www.youtube.com/watch?v=W7coofVavrU');
    expect(items[0].title).toContain('漢方米其林餐廳');
    expect(items[0].channel).toBe('民視新聞網');
    expect(items[0].description).toContain('高雄前鎮區');
    expect(items[0].thumbnail).toBe('https://i.ytimg.com/vi/W7coofVavrU/hqdefault.jpg');
  });

  it('沒有 entry 的 XML 回空陣列，不丟例外', () => {
    expect(parseYouTubeFeed('<feed></feed>')).toEqual([]);
    expect(parseYouTubeFeed('')).toEqual([]);
  });

  it('缺 media:thumbnail 時退回 i.ytimg 慣例網址', () => {
    const items = parseYouTubeFeed(FEED);
    expect(items[1].thumbnail).toBe('https://i.ytimg.com/vi/shortsAAA/hqdefault.jpg');
  });
});

describe('daysOld', () => {
  it('無日期或壞日期回 null（保守納入交 LLM 判斷）', () => {
    expect(daysOld(null)).toBeNull();
    expect(daysOld('不是日期')).toBeNull();
  });
  it('算得出天數', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(daysOld(twoDaysAgo)).toBeGreaterThan(1.9);
    expect(daysOld(twoDaysAgo)).toBeLessThan(2.1);
  });
});

describe('isLifestyleVideo', () => {
  it('美食／旅遊／健康題命中', () => {
    expect(isLifestyleVideo('全台首間漢方米其林餐廳')).toBe(true);
    expect(isLifestyleVideo('南投東埔溫泉泡湯吃美食好療癒')).toBe(true);
  });
  it('政治／社會案件／颱風等他線題目排除', () => {
    expect(isLifestyleVideo('立委補選開票結果出爐')).toBe(false);
    expect(isLifestyleVideo('知名餐廳老闆遭起訴 涉嫌詐騙')).toBe(false);
    expect(isLifestyleVideo('颱風來襲 各地停班停課一覽')).toBe(false);
  });
  it('與生活無關且無關鍵字者不納入', () => {
    expect(isLifestyleVideo('行政院會後記者會')).toBe(false);
  });
  it('選戰題不因為提到美食就漏進來（2026-07-27 實測漏網）', () => {
    expect(isLifestyleVideo('鹽埔鄉長選戰掀話題　參選人拋「爭取知名漢堡進駐」')).toBe(false);
  });
  it('景點事故題不因為提到景點就漏進來（2026-07-27 實測漏網）', () => {
    expect(isLifestyleVideo('十分放天燈「空中解體」　下火焰雨遊客尖叫四起')).toBe(false);
  });
  it('警消好人好事屬 lifestyle-police 線，即使提到餐廳也不搶題', () => {
    expect(isLifestyleVideo(
      '休假遇兄分隊出勤 桃機消防員加入救援搶回一命',
      '男子到餐廳用餐後倒地OHCA，消防員跪地CPR搶命。',
    )).toBe(false);
  });
});

describe('isShorts', () => {
  it('描述帶 #Shorts 判為短影音', () => {
    expect(isShorts('米其林餐廳直擊', '同一則的短影音版。 #Shorts')).toBe(true);
    expect(isShorts('米其林餐廳直擊', '一般描述')).toBe(false);
  });
});

describe('feedUrl', () => {
  it('組出 YouTube 官方 feed 網址', () => {
    expect(feedUrl('UC2VmWn8dAqkzlQqvy02E1PA'))
      .toBe('https://www.youtube.com/feeds/videos.xml?channel_id=UC2VmWn8dAqkzlQqvy02E1PA');
  });
});

describe('filterNew', () => {
  it('依 videoId 濾掉帳本裡看過的', () => {
    const cands = [{ videoId: 'a' }, { videoId: 'b' }];
    expect(filterNew(cands, { a: '2026-07-20T00:00:00Z' })).toEqual([{ videoId: 'b' }]);
  });
});

describe('videoEmbed', () => {
  const ok = {
    url: 'https://www.youtube.com/watch?v=W7coofVavrU',
    title: '漢方米其林餐廳', channel: '民視新聞網',
    src: '/images/x-video.webp', width: 960, height: 540,
  };
  it('產出帶寬高（CLS 安全）的 facade，不含 iframe', () => {
    const html = videoEmbed(ok);
    expect(html).toContain('class="video-embed"');
    expect(html).toContain('width="960" height="540"');
    expect(html).toContain('rel="noopener nofollow"');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('影片來源：民視新聞網');
  });
  it('缺寬高就丟例外（不准無尺寸圖進正文）', () => {
    expect(() => videoEmbed({ ...ok, width: undefined })).toThrow(/width and height/);
  });
  it('非 YouTube watch 網址丟例外', () => {
    expect(() => videoEmbed({ ...ok, url: 'https://example.com/v' })).toThrow(/youtube/);
  });
  it('標題含引號時不炸掉屬性', () => {
    expect(videoEmbed({ ...ok, title: '帶"引號"的標題' })).toContain('alt="帶&quot;引號&quot;的標題"');
  });
});

describe('parseVideoResult', () => {
  it('解析 NEW', () => {
    expect(parseVideoResult('...\nVIDEO_RESULT=NEW｜habu-michelin-herbal')).toMatchObject({
      action: 'new', slug: 'habu-michelin-herbal', note: 'habu-michelin-herbal',
    });
  });
  it('解析 SKIP', () => {
    const r = parseVideoResult('VIDEO_RESULT=SKIP｜找不到第二個獨立來源');
    expect(r.action).toBe('skip');
    expect(r.slug).toBeNull();
  });
  it('沒有結果行視為跳過並標記 infra', () => {
    expect(parseVideoResult('模型亂講一通').infra).toBe(true);
  });
});
