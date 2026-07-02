// 警消好人好事「固定抓取層」（零 LLM）：抓各地警局列表 → 解析 → 近 N 天 + 關鍵字初篩
// → 查證連結 2xx → 抓詳情正文 → 產出候選清單，交給 LLM 只做「挑選＋寫作」。
//
// 設計脈絡：原本整段抓取交給 LLM agent（WebFetch 逐站抓、還自己翻頁重抓），既慢又燒額度、
// 且凌晨多線擠同一 5 小時 session 視窗會撞 rate limit hang→timeout。改成固定抓後，LLM 只讀
// 已備妥的文字清單寫稿。各站 HTML parser 在 ./police-parsers.mjs（純函式、可單元測試）。
import { spawnSync } from 'node:child_process';
import * as P from './police-parsers.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

// 站點配置：cms 決定用哪支 parser；insecure=金門 TLS 中繼憑證；ua=需偽裝瀏覽器。
// priority=好人好事最現成的專欄/頻道。skip=結構不穩定，暫不抓（如實標記，不硬湊）。
export const POLICE_SITES = [
  { area: '高雄市', cms: 'newsAspx', priority: true, url: 'https://kcpd.kcg.gov.tw/News.aspx?n=3FAEF3DDE4DD3CD0&sms=4ED7718667AAD9B5' },
  { area: '宜蘭縣', cms: 'newsAspx', priority: true, url: 'https://www.ilcpb.gov.tw/News.aspx?n=16343&sms=16080' },
  { area: '屏東縣', cms: 'newsAspx', priority: true, url: 'https://www.pthg.gov.tw/pcpb/News.aspx?n=A58BECEB18B19997&sms=B37B36F2CFEB3E64&CategorySN=3404' },
  { area: '臺北市', cms: 'newsAspx', url: 'https://police.gov.taipei/News.aspx?n=72544237BBE4C5F6&sms=72D5A0387A14CF52' },
  { area: '雲林縣', cms: 'newsAspx', url: 'https://ylhpb.yunlin.gov.tw/News.aspx?n=31001&sms=22245' },
  { area: '金門縣', cms: 'newsAspx', insecure: true, url: 'https://kpb.kinmen.gov.tw/News.aspx?n=67F346BB9C4B0172&sms=A2C62D68901B977C' },
  { area: '臺南市', cms: 'tainan', url: 'https://www.tnpd.gov.tw/News/a71f1b44-1f96-8a48-caa5-fe08e13047ee/1' },
  { area: '南投縣', cms: 'nantou', url: 'https://www.ncpd.gov.tw/latestevent/index.aspx?Parser=9,4,36' },
  { area: '彰化縣', cms: 'changhua', url: 'https://www.chpb.gov.tw/Announcement/C002100' },
  { area: '連江縣', cms: 'matsu', url: 'https://www.lchpd.gov.tw/Chhtml/news/2666' },
  { area: '新北市', cms: 'newTaipei', url: 'https://www.police.ntpc.gov.tw/np-3344-1.html' },
  { area: '新竹市', cms: 'hsinchuCity', url: 'https://www.hccp.gov.tw/ch/home.jsp?id=23&parentpath=0' },
  { area: '臺東縣', cms: 'taitung', url: 'https://www.ttcpb.gov.tw/chinese/index.jsp' },
  { area: '新竹縣', cms: 'hsinchuCounty', url: 'https://www.hchpb.gov.tw/' },
];

// parser 分派表（值由 ./police-parsers.mjs 提供；缺的 cms 該站略過）。
const LIST_PARSERS = {
  newsAspx: P.parseListNewsAspx,
  tainan: P.parseListTainan,
  nantou: P.parseListNantou,
  changhua: P.parseListChanghua,
  matsu: P.parseListMatsu,
  newTaipei: P.parseListNewTaipei,
  hsinchuCity: P.parseListHsinchuCity,
  taitung: P.parseListTaitung,
  hsinchuCounty: P.parseListHsinchuCounty,
};
const DETAIL_PARSERS = {
  newsAspx: P.parseDetailNewsAspx,
  tainan: P.parseDetailTainan,
  nantou: P.parseDetailNantou,
  changhua: P.parseDetailChanghua,
  matsu: P.parseDetailMatsu,
  newTaipei: P.parseDetailNewTaipei,
  hsinchuCity: P.parseDetailHsinchuCity,
  taitung: P.parseDetailTaitung,
  hsinchuCounty: P.parseDetailHsinchuCounty,
};

// 好人好事正面訊號（標題初篩，寬鬆納入；最終由 LLM 精挑）。
// 好人好事正面善行詞（民眾取向的助人／尋回／救援）。刻意不含「守護／感謝／致謝／關懷」等
// 泛詞——它們大量出現在「守護青少年（青春專案）」「感謝捐助（查緝）」這類宣導/執法稿，會誤收。
export const GOOD_DEED_KEYWORDS = [
  '救援', '救回', '救起', '救護', '搶救', '及時', '協尋', '尋獲', '尋回', '尋人', '找回',
  '拾金', '拾獲', '歸還', '撿到', '送醫', '送回', '送油', '幫助', '協助', '暖心', '暖警',
  '解圍', '化解', '攙扶', '迷途', '迷路', '走失', '失智', '義舉', '善舉', '救助', '助返家', '助回家',
];
// 明確排除（純執法/宣導/流水帳）。改為「先排除、再看正面詞」，比原本「正面詞繞過排除」嚴謹。
export const EXCLUDE_KEYWORDS = [
  '查獲', '逮捕', '緝獲', '緝毒', '查緝', '取締', '毒品', '販毒', '施用', '酒駕', '毒駕',
  '臨檢', '掃蕩', '通緝', '起訴', '移送', '偵破', '搜索', '拘提', '詐騙集團', '槍', '賭', '妨害', '性侵',
  '青春專案', '專案勤務', '勤前', '獎勵金', '頒發', '頒獎', '捐贈', '捐助', '演習', '公告', '甄選', '簡章', '名冊',
  '車禍', '死亡', '命案', '兇', '宣導', '講座', '表揚大會', '頒獎', '週報', '統計', '記者會', '座談',
];

export function isGoodDeed(title = '') {
  const t = String(title);
  // 先排除：含執法/宣導/流水帳詞就不是好人好事（擋掉「青春專案守護青少年」「感謝捐助查緝毒駕」）。
  if (EXCLUDE_KEYWORDS.some((k) => t.includes(k))) return false;
  // 再要求含正面善行詞。
  return GOOD_DEED_KEYWORDS.some((k) => t.includes(k));
}

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return (Date.now() - d.getTime()) / 86400000;
}

/** 用 curl 抓 HTML（處理 TLS 中繼憑證、瀏覽器 UA、逾時）。抓不到回 null。 */
export function fetchHtml(url, { insecure = false, timeout = 25 } = {}) {
  const args = ['-sL', '--max-time', String(timeout), '-A', UA];
  if (insecure) args.push('-k');
  args.push(url);
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 48 * 1024 * 1024 });
  return r.status === 0 && r.stdout ? r.stdout : null;
}

/** 查證連結可連（HEAD 2xx/3xx）。 */
export function isLive(url, { insecure = false } = {}) {
  const args = ['-sL', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', '-A', UA];
  if (insecure) args.push('-k');
  args.push(url);
  const r = spawnSync('curl', args, { encoding: 'utf8' });
  return /^2\d\d$/.test((r.stdout || '').trim());
}

/**
 * 固定抓取候選清單（零 LLM）。
 * @returns {Promise<Array<{area,title,url,date,summary}>>}
 */
export async function fetchPoliceCandidates({ days = 7, maxPerSite = 4, verify = true, log = () => {} } = {}) {
  const out = [];
  for (const site of POLICE_SITES) {
    if (site.skip) continue;
    const parseList = LIST_PARSERS[site.cms];
    if (!parseList) { log(`  ${site.area}：無 parser，略過`); continue; }
    const html = fetchHtml(site.url, site);
    if (!html) { log(`  ${site.area}：抓不到，略過`); continue; }
    let items = [];
    try { items = parseList(html, site.url) || []; } catch (e) { log(`  ${site.area}：解析失敗（${e.message}），略過`); continue; }
    // 近 N 天（date 無法解析者保守納入，交 LLM 判斷）+ 好人好事關鍵字初篩
    const picked = items
      .filter((it) => it && it.title && it.url)
      // 只留官方文章頁：排除連到 FB/YouTube 等站外、及 /dl- 檔案下載（如新北列表混入者）。
      .filter((it) => /gov\.(tw|taipei)/i.test(it.url) && !/\/dl-|\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(it.url))
      .filter((it) => { const a = daysAgo(it.date); return a === null || a <= days; })
      .filter((it) => isGoodDeed(it.title))
      .slice(0, maxPerSite);
    let kept = 0;
    for (const it of picked) {
      if (verify && !isLive(it.url, site)) continue;
      let summary = '';
      const parseDetail = DETAIL_PARSERS[site.cms];
      if (parseDetail) {
        const dhtml = fetchHtml(it.url, site);
        if (dhtml) { try { summary = (parseDetail(dhtml) || {}).summary || ''; } catch { /* 正文抽取失敗不致命 */ } }
      }
      out.push({ area: site.area, title: it.title.trim(), url: it.url, date: it.date || null, summary: summary.trim() });
      kept++;
    }
    log(`  ${site.area}：列表 ${items.length} → 初篩 ${picked.length} → 收 ${kept}`);
  }
  return out;
}
