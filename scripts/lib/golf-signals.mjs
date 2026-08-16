// 高爾夫選手動態訊號：純資料層（**零 LLM**）。抓 YouTube／新聞 RSS → 台灣選手命中標記 → 跨次去重。
//
// 站長 2026-08-16 裁示：台灣選手動態＝必報導（mustCover，有新料就寫），其他高爾夫題（大賽賽果等）
// ＝視情況（situational，選題模型判斷夠重大才寫）。分類掛 sports，自動上架（不走待審），
// 比照論壇雷達（forum-signals.mjs）的站長裁示模式：抓取／比對／去重全部用 node 做完，
// 沒有新資料就給協調器一個「別喚模型」的訊號（見 scripts/golf-radar.mjs）。
//
// 來源選擇依據：2026-08-16 站長要求先做資料源可行性研究（純研究、未動程式碼）。實測結論：
//   - 台灣三大高球協會（TPGA／TLPGA／GAROC）官網**皆無 RSS、也無公開文件化 API**，
//     TPGA 有內部 proxy 端點但需要逆參數，不符合「純資料判斷」的既有產線哲學，**不採用**。
//   - ESPN 隱藏 JSON scoreboard API 從本機與 WebFetch 皆被 Akamai 擋 403，**打不通、不採用**。
//   - 下面 SOURCES 皆為**實測可連線、有標準 RSS/Atom 結構**的來源，機器可讀性最高。
// 完整報告（含失效來源清單，避免後人重查）已交站長留存；本檔只留「查得到的」。
//
// 用法（純資料，可單獨跑來看撈到什麼）：
//   node scripts/lib/golf-signals.mjs            # 印出本次候選（JSON）
//   node scripts/lib/golf-signals.mjs --pretty   # 人看的格式

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fetchFeed } from './civic-fetch.mjs';
import { parseRss, daysAgo } from './civic-rss.mjs';

/**
 * 台灣旅外／現役職業高爾夫選手名冊（SOT）。**新增選手改這裡**。
 *
 * 中英文皆列，因為 YouTube／ESPN／Golf.com 標題有時用英文名、有時用中文譯名（華文媒體轉載）。
 * en 陣列比對時不分大小寫、可有多種常見拼法（含有無句點/連字號）。
 * 2026-08-16 由 WebSearch 查證現役旅外／國際賽事常見選手名單後定稿；名單會隨選手退役／新人升上巡迴賽
 * 而變動，發現名單過期（漏了活躍選手、或列了已退役許久的），直接更新這裡，不必等站長交辦。
 */
export const TAIWAN_PLAYERS = [
  { zh: '潘政琮', en: ['C.T. Pan', 'C.T.Pan', 'Cheng-Tsung Pan', 'Cheng Tsung Pan'], tour: 'PGA Tour' },
  { zh: '俞俊安', en: ['Kevin Yu'], tour: 'PGA Tour' },
  { zh: '徐薇淩', en: ['Wei-Ling Hsu', 'Wei Ling Hsu'], tour: 'LPGA' },
  { zh: '程思嘉', en: ['Ssu-Chia Cheng', 'Ssu Chia Cheng'], tour: 'LPGA' },
  { zh: '錢珮芸', en: ['Pei-Yun Chien', 'Peiyun Chien', 'Pei Yun Chien'], tour: 'LPGA' },
  { zh: '李旻', en: ['Min Lee'], tour: 'TLPGA／國際賽事' },
  { zh: '吳佳晏', en: ['Chia-Yen Wu', 'Wu Chia-Yen', 'Chia Yen Wu'], tour: 'LPGA of Japan Tour／TLPGA' },
  { zh: '曾雅妮', en: ['Yani Tseng'], tour: 'LPGA（資深）' },
  // 國內線（TPGA 台巡）——首輪 dry-run 驗收即發現 TPGA 源的奪冠影片沒被名冊接住，國內現役也要收
  { zh: '王偉軒', en: ['Wang Wei-hsuan', 'Wei-Hsuan Wang'], tour: 'TPGA 台巡' },
  { zh: '詹世昌', en: ['Chan Shih-chang', 'Shih-Chang Chan'], tour: '亞巡／TPGA' },
  { zh: '洪健堯', en: ['Hung Chien-yao', 'Chien-Yao Hung'], tour: '亞巡／TPGA' },
];

/**
 * 資料來源。`kind: 'youtube'` 為 YouTube 官方標準 RSS（Atom），`kind: 'rss'` 為一般新聞 RSS 2.0；
 * 兩者都吃 civic-rss.mjs 的通用 `parseRss`（item/entry 皆比對得到）。
 *
 * 換來源／加來源前，先在本機 `curl -sL -4 -A "Mozilla/5.0..." <url>` 實測 200 且含 item/entry，
 * 不要只憑文件宣稱——2026-08-16 的研究報告發現多個「文件說有 RSS」的來源實測是 403 或索引頁。
 */
export const SOURCES = [
  {
    name: 'TPGA 台灣職業高爾夫協會 YouTube',
    kind: 'youtube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCH98uMmkZOV8E2270Dr5VIw',
  },
  {
    name: 'PGA TOUR 官方 YouTube',
    kind: 'youtube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZoQ6VBnQGF2T3hwevWLJUA',
  },
  {
    name: 'LPGA 官方 YouTube',
    kind: 'youtube',
    // 提醒（2026-08-16 實測）：LPGA 官方頻道近期上傳大量韓語標題影片，標題比對抓不到中文/英文選手名
    // 是正常現象，不代表來源壞了；台灣選手動態仍靠標題命中或由 ESPN/Golf.com 補位。
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJd73FoI70yaZdSC173HcVw',
  },
  // 2026-08-16 研究報告實測 curl 200；同日稍晚實作驗收時改觀察到間歇性 202（AWS WAF
  // x-amzn-waf-action: challenge，空 body）——research 與 build 之間該端點疑似新上了 bot 防護。
  // 保留在清單：collectCandidates 對單一來源失敗本就 fail-soft（記進 failures、其餘來源照跑），
  // 抓不到不會拖垮整條線；哪天 WAF 解除會自動恢復。若長期穩定 403/202，再拿掉即可。
  { name: 'ESPN Golf 新聞', kind: 'rss', url: 'https://www.espn.com/espn/rss/golf/news' },
  { name: 'Golf.com 新聞', kind: 'rss', url: 'https://golf.com/feed/' },
];

/** 標題或摘要是否命中台灣選手名冊；命中回選手物件（含 zh/en/tour），否則回 null。純函式。 */
export function matchPlayer(text) {
  const t = String(text || '');
  for (const p of TAIWAN_PLAYERS) {
    if (t.includes(p.zh)) return p;
    for (const en of p.en) {
      if (t.toLowerCase().includes(en.toLowerCase())) return p;
    }
  }
  return null;
}

/**
 * 明顯無新聞價值的標題（頻道宣傳／花絮／與賽事無關）。純函式。
 * 刻意寧可少擋——來源已是高爾夫專屬 RSS，雜訊比 PTT 少很多，不需要重過濾。
 */
export function isNoiseTitle(title) {
  const t = String(title || '');
  return /^(Trailer|Promo|Coming Soon|預告|花絮|頻道介紹|Subscribe|訂閱)/i.test(t.trim());
}

/** 去重用的正規化鍵：拿掉空白與標點、轉小寫，只留可比對的主體。純函式。 */
export function normalizeKey(title) {
  return String(title || '')
    .replace(/[\s\p{P}\p{S}]/gu, '')
    .toLowerCase()
    .slice(0, 48);
}

// ── 抓取 ────────────────────────────────────────────────────────────────────

/**
 * 掃全部來源 → 台灣選手命中標記（mustCover/situational）→ 回候選。
 * **不做跨次去重**（去重要對帳本，見下方 seen 段），也不喚任何 LLM。
 */
export async function collectCandidates({ sources = SOURCES, days = 5, maxPerSource = 12, log = () => {} } = {}) {
  const candidates = [];
  const failures = [];
  const reachedSources = new Set();

  for (const src of sources) {
    const xml = fetchFeed(src.url);
    if (!xml) {
      failures.push({ source: src.name, error: '抓不到/非 XML' });
      log(`  ${src.name}：抓不到 feed，略過`);
      continue;
    }
    let items = [];
    try {
      items = parseRss(xml);
    } catch (e) {
      failures.push({ source: src.name, error: `解析失敗（${e.message}）` });
      log(`  ${src.name}：解析失敗（${e.message}），略過`);
      continue;
    }
    reachedSources.add(src.name);
    const picked = items
      .filter((it) => { const a = daysAgo(it.pubDate); return a === null || a <= days; })
      .filter((it) => !isNoiseTitle(it.title))
      .slice(0, maxPerSource);
    for (const it of picked) {
      const player = matchPlayer(`${it.title} ${it.summary || ''}`);
      candidates.push({
        source: src.name,
        kind: src.kind,
        title: it.title.trim(),
        url: it.link,
        summary: it.summary || '',
        pubDate: it.pubDate,
        player: player ? { zh: player.zh, en: player.en[0], tour: player.tour } : null,
        mustCover: !!player,
        key: normalizeKey(it.title),
      });
    }
    log(`  ${src.name}：${items.length} 則 → 近 ${days} 天且非雜訊 ${picked.length} 則`);
  }

  // 同 key（同標題）只留一則，優先保留 mustCover 的那則（同題可能被多來源轉載）。
  const byKey = new Map();
  for (const c of candidates) {
    const prev = byKey.get(c.key);
    if (!prev || (c.mustCover && !prev.mustCover)) byKey.set(c.key, c);
  }

  const deduped = [...byKey.values()].sort((a, b) => Number(b.mustCover) - Number(a.mustCover));
  return {
    candidates: deduped,
    failures,
    scanned: sources.length,
    reached: reachedSources.size,
  };
}

// ── 跨次去重帳本（每日跑，沒有帳本會每天重推同一則 RSS 條目）────────────────────

const SEEN_WINDOW_DAYS = 14; // 這麼久之內看過的條目不再推
const SEEN_RETENTION_DAYS = 30;

export function seenPath() {
  return (
    process.env.GOLF_SEEN_PATH ||
    join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'golf-seen.json')
  );
}

export function loadSeen(path = seenPath()) {
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(j) ? j : [];
  } catch {
    return []; // 帳本不存在／壞掉＝當作沒看過（寧可重推一次，不要整條啞掉）
  }
}

/** 純函式：從候選中濾掉帳本裡近期看過的。 */
export function filterUnseen(candidates, seen, now = new Date()) {
  const cutoff = new Date(now.getTime() - SEEN_WINDOW_DAYS * 86400 * 1000).toISOString().slice(0, 10);
  const recent = new Set(seen.filter((s) => (s.date || '') >= cutoff).map((s) => s.key));
  return candidates.filter((c) => !recent.has(c.key));
}

/** 純函式：把本次推出去（或已判過）的條目併進帳本，並砍掉過期紀錄。 */
export function mergeSeen(seen, picked, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const cutoff = new Date(now.getTime() - SEEN_RETENTION_DAYS * 86400 * 1000).toISOString().slice(0, 10);
  const merged = [...seen.filter((s) => (s.date || '') >= cutoff)];
  const have = new Set(merged.map((s) => s.key));
  for (const p of picked) {
    if (have.has(p.key)) continue;
    merged.push({ key: p.key, date: today, title: p.title, source: p.source });
    have.add(p.key);
  }
  return merged;
}

export function saveSeen(seen, path = seenPath()) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(seen, null, 2));
}

// ── CLI（純資料，方便人工檢視撈到什麼；不寫帳本）────────────────────────────
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pretty = process.argv.includes('--pretty');
  const { candidates, failures, scanned, reached } = await collectCandidates({ log: console.log });
  const fresh = filterUnseen(candidates, loadSeen());
  if (pretty) {
    const must = fresh.filter((c) => c.mustCover);
    console.log(`掃 ${scanned} 源（抓到 ${reached}）；候選 ${candidates.length}；扣帳本後新資料 ${fresh.length}（mustCover ${must.length}）`);
    if (failures.length) console.log(`抓取失敗：${failures.map((f) => `${f.source}（${f.error}）`).join('、')}`);
    for (const c of fresh) {
      const tag = c.mustCover ? `★${c.player.zh}` : '　　';
      console.log(`  [${tag}] ${c.source.padEnd(18)} ${c.title}`);
    }
  } else {
    console.log(JSON.stringify({ scanned, reached, failures, candidates: fresh }, null, 2));
  }
}
