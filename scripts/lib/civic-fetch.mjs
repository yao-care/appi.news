// 便民市政「固定抓取層」（零 LLM）：抓各縣市政府 RSS → 解析 → 便民關鍵字初篩 → 近 N 天
// → 產出候選清單，交給 LLM 只做「挑選＋跨縣市寫作」。抓取用 curl（同警消，處理 IPv4/UA/TLS）。

import { spawnSync } from 'node:child_process';
import { CIVIC_FEEDS, isCivicService } from './civic-feeds.mjs';
import { parseRss, daysAgo } from './civic-rss.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** curl 抓 feed（IPv4、瀏覽器 UA、逾時、金門容忍 TLS 中繼憑證）。抓不到/非 XML 回 null。 */
export function fetchFeed(url, { insecure = false, timeout = 20 } = {}) {
  const args = ['-sL', '-4', '--max-time', String(timeout), '-A', UA];
  if (insecure) args.push('-k');
  args.push(url);
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 48 * 1024 * 1024 });
  const body = r.status === 0 ? r.stdout : '';
  if (!body || !/<(rss|feed|item|entry)\b/i.test(body)) return null;
  return body;
}

/**
 * 固定抓取候選清單（零 LLM）。跳過 reachable:false（本機非台灣 IP 抓不到者）與抓失敗的站。
 * @returns {Promise<{candidates:Array<{area,title,url,date,summary}>, stats:{reached:number,skipped:number,areas:string[]}}>}
 */
export async function fetchCivicCandidates({ days = 2, maxPerSite = 12, log = () => {} } = {}) {
  const candidates = [];
  const areas = new Set();
  let reached = 0;
  let skipped = 0;
  for (const feed of CIVIC_FEEDS) {
    if (feed.reachable === false) { skipped++; continue; }
    const xml = fetchFeed(feed.url, feed);
    if (!xml) { log(`  ${feed.area}：抓不到/非 RSS，略過`); skipped++; continue; }
    let items = [];
    try { items = parseRss(xml); } catch (e) { log(`  ${feed.area}：解析失敗（${e.message}），略過`); skipped++; continue; }
    reached++;
    const picked = items
      // 只留官方 gov 文章連結，排除站外與檔案下載
      .filter((it) => /gov\.(tw|taipei)/i.test(it.link) && !/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(it.link))
      // 近 N 天（無日期者保守納入，交 LLM 判斷）
      .filter((it) => { const a = daysAgo(it.pubDate); return a === null || a <= days; })
      // 便民措施初篩
      .filter((it) => isCivicService(it.title))
      .slice(0, maxPerSite);
    for (const it of picked) {
      candidates.push({ area: feed.area, title: it.title.trim(), url: it.link, date: it.pubDate, summary: it.summary });
      areas.add(feed.area);
    }
    log(`  ${feed.area}：${items.length} 則 → 便民初篩 ${picked.length}`);
  }
  return { candidates, stats: { reached, skipped, areas: [...areas] } };
}
