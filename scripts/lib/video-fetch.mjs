// 「影片心得」線的固定抓取層（零 LLM）：抓訂閱頻道的 YouTube RSS → 解析 Atom entry
// → 生活線初篩 → 近 N 天 → 產出候選清單，交給 LLM 只做「挑一支＋交叉查證＋寫作」。
//
// 解析是純函式（parseYouTubeFeed），抓取用 curl（同 civic-fetch，處理 IPv4/UA/逾時）。

import { spawnSync } from 'node:child_process';
import { decodeEntities, stripTags } from './civic-rss.mjs';
import { VIDEO_FEEDS, feedUrl, isLifestyleVideo, isShorts } from './video-feeds.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** 取單一標籤內容（支援帶命名空間如 media:description）。回 '' 若無。 */
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1]).trim() : '';
}

/**
 * 解析 YouTube 頻道 Atom feed → entry 陣列（純函式、零 I/O、可單元測試）。
 * @returns {Array<{videoId,title,url,channel,published,description,thumbnail}>}
 */
export function parseYouTubeFeed(xml = '') {
  const out = [];
  const channel = tag(xml.split('<entry')[0] || '', 'title');
  for (const m of String(xml).matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
    const b = m[1];
    const videoId = tag(b, 'yt:videoId');
    if (!videoId) continue;
    const thumb = b.match(/<media:thumbnail\b[^>]*url=["']([^"']+)["']/i);
    out.push({
      videoId,
      title: tag(b, 'title') || tag(b, 'media:title'),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      channel: tag(b, 'name') || channel,
      published: tag(b, 'published') || null,
      description: tag(b, 'media:description'),
      thumbnail: thumb ? decodeEntities(thumb[1]) : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    });
  }
  return out;
}

/** 影片發布距今幾天（浮點）。無法解析回 null。 */
export function daysOld(published) {
  if (!published) return null;
  const t = new Date(published).getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 86400000;
}

/** curl 抓 feed。抓不到／非 Atom 回 null。 */
export function fetchFeed(url, { timeout = 20 } = {}) {
  const r = spawnSync('curl', ['-sL', '-4', '--max-time', String(timeout), '-A', UA, url], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  const body = r.status === 0 ? r.stdout : '';
  if (!body || !/<entry\b/i.test(body)) return null;
  return body;
}

/**
 * 抓所有訂閱頻道的候選影片（零 LLM）。
 * 篩選順序：近 N 天 → 排除 Shorts → 生活線關鍵字 → 同標題去重（頻道常同時發長片＋Shorts）。
 * @returns {Promise<{candidates:Array, stats:{reached:number,skipped:number,channels:string[]}}>}
 */
export async function fetchVideoCandidates({ days = 2, maxPerChannel = 8, log = () => {} } = {}) {
  const candidates = [];
  const channels = new Set();
  const seenTitle = new Set();
  let reached = 0;
  let skipped = 0;
  for (const feed of VIDEO_FEEDS) {
    if (feed.enabled === false) { skipped++; continue; }
    const xml = fetchFeed(feedUrl(feed.channelId));
    if (!xml) { log(`  ${feed.name}：抓不到 feed，略過`); skipped++; continue; }
    let items = [];
    try { items = parseYouTubeFeed(xml); } catch (e) { log(`  ${feed.name}：解析失敗（${e.message}），略過`); skipped++; continue; }
    reached++;
    const picked = [];
    for (const it of items) {
      const age = daysOld(it.published);
      if (age !== null && age > days) continue;
      if (isShorts(it.title, it.description)) continue;
      if (!isLifestyleVideo(it.title, it.description)) continue;
      const key = it.title.replace(/\s+/g, '');
      if (seenTitle.has(key)) continue;
      seenTitle.add(key);
      picked.push(it);
      if (picked.length >= maxPerChannel) break;
    }
    for (const it of picked) {
      candidates.push({
        ...it,
        source: feed.name,
        // 描述只留前段（後面都是頻道的固定推廣連結，對寫作沒用）
        summary: stripTags(it.description.split(/\n\s*-{2,}\s*\n|\n#/)[0] || '', 400),
      });
      channels.add(feed.name);
    }
    log(`  ${feed.name}：${items.length} 支 → 生活線初篩 ${picked.length}`);
  }
  return { candidates, stats: { reached, skipped, channels: [...channels] } };
}
