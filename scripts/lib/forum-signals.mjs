// 論壇熱議訊號：純資料層（**零 LLM**）。抓 PTT 白名單看板的高推文 → 政治過濾 → 跨次去重。
//
// 為什麼是純 script：本線每小時跑一次（追時效），但 claude-appi 的額度是每 5 小時一個共用視窗、
// 24 小時的排程已經排滿。若每小時都喚一次 Claude，既有的內容線會被餓死（警消那條出過事）。
// 所以照 lifestyle-typhoon.sh 的前置 gate 思路：**抓取、過濾、去重全部用 node 做完，
// 沒有新熱題就 exit 0、完全不動用 Claude**；只有真的撈到新題才把結果餵給 LLM 選題。
//
// 政治排除是**兩層**，因為站長要求 100% 避開：
//   ① 看板白名單——Gossiping / HatePolitics / Military / PublicServan 根本不在名單裡。
//      黑名單永遠會漏，白名單才是可保證的那一層。
//   ② 標題關鍵字——擋政黨政治（政黨、政治人物、選舉、罷免、民代）。
//      **刻意不擋行政機關**（金管會、衛福部、勞動部…）：那是監理與政策，屬財經/生活的正當題材，
//      站長 2026-08-06 已核可寫金管會理財周轉金那篇。擋的是政黨與人物鬥爭，不是政府作為。
//   ③ 地方板（Tainan/Kaohsiung/TaichungBun）另外再過一層 LLM 逐則判斷（站長 2026-08-06 指定）。
//      實測台南板前 12 篇有 6 篇是南市府 vs 高市府的攻防，而它們字面上沒有政黨也沒有人物名，
//      關鍵字擋不住。那一層在協調器做（要喚 Haiku），不在本檔。
//
// 用法（純資料，可單獨跑來看撈到什麼）：
//   node scripts/lib/forum-signals.mjs            # 印出本次候選（JSON）
//   node scripts/lib/forum-signals.mjs --pretty   # 人看的格式

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * 白名單看板 → 分類 + 推文門檻。
 *
 * 門檻依看板實際流量調整（熱門大板要高門檻，否則整頁都是候選）：實測 2026-08-06，
 * Stock/Baseball 一天上百篇破 50 推，iOS/BabyMother 破 10 推就算熱門。
 * `local: true` 的板需要協調器再跑一次 LLM 逐則判斷（市政攻防關鍵字擋不掉）。
 *
 * 刻意不收：Gossiping / HatePolitics（政治）、Military（軍事政治敏感）、
 * PublicServan（年金與人事政策，政治性高）、Beauty / sex / japanavgirls / AC_In（18+）、
 * MacShop / Gamesale / HardwareSale / DC_SALE / CarShop（交易板，整頁黑名單糾紛無新聞價值）、
 * joke（無查證價值）。要加看板就往這張表加，門檻寧可設高不設低。
 */
export const BOARDS = [
  // 科技
  { board: 'PC_Shopping', category: 'tech', minPush: 30 },
  { board: 'MobileComm', category: 'tech', minPush: 20 },
  { board: 'Tech_Job', category: 'tech', minPush: 30 },
  { board: 'Soft_Job', category: 'tech', minPush: 20 },
  { board: 'iOS', category: 'tech', minPush: 10 },
  { board: 'NSwitch', category: 'tech', minPush: 20 },
  { board: 'Steam', category: 'tech', minPush: 20 },
  { board: 'Headphone', category: 'tech', minPush: 15 },
  // 財經
  { board: 'Stock', category: 'finance', minPush: 50 },
  { board: 'home-sale', category: 'finance', minPush: 30 },
  { board: 'creditcard', category: 'finance', minPush: 20 },
  { board: 'Bank_Service', category: 'finance', minPush: 10 },
  // 健康
  { board: 'MuscleBeach', category: 'health', minPush: 10 },
  { board: 'BabyMother', category: 'health', minPush: 10 },
  // 生活
  { board: 'Lifeismoney', category: 'lifestyle', minPush: 30 },
  { board: 'CVS', category: 'lifestyle', minPush: 20 },
  { board: 'WomenTalk', category: 'lifestyle', minPush: 20 },
  { board: 'marriage', category: 'lifestyle', minPush: 20 },
  { board: 'car', category: 'lifestyle', minPush: 30 },
  { board: 'biker', category: 'lifestyle', minPush: 15 },
  { board: 'watch', category: 'lifestyle', minPush: 15 },
  { board: 'movie', category: 'lifestyle', minPush: 40 },
  // 生活·地方（需 LLM 逐則判斷，見檔頭 ③）
  { board: 'Tainan', category: 'lifestyle', minPush: 15, local: true },
  { board: 'Kaohsiung', category: 'lifestyle', minPush: 15, local: true },
  { board: 'TaichungBun', category: 'lifestyle', minPush: 15, local: true },
  // 國際
  { board: 'Japan_Travel', category: 'international', minPush: 20 },
  { board: 'Aviation', category: 'international', minPush: 15 },
  // 運動
  { board: 'Baseball', category: 'sports', minPush: 50 },
  { board: 'NBA', category: 'sports', minPush: 40 },
  { board: 'basketballTW', category: 'sports', minPush: 20 },
];

/**
 * 政治關鍵字（第二層過濾）。針對**政黨與人物鬥爭**，不針對政府機關作為。
 * 新增字詞前先想：這個字出現時，文章是不是必然在講政黨/選舉/人物？不是就別加
 * （例如「政策」「補助」「法規」不可加——那會把便民與監理題全砍掉）。
 */
export const POLITICAL_PATTERNS = [
  // 政黨
  '民進黨', '國民黨', '民眾黨', '時代力量', '基進', '綠營', '藍營', '白營', '藍白', '綠共', '817', '柯粉', '英粉',
  // 職位與選務
  '總統', '副總統', '行政院長', '閣揆', '立委', '立法院', '議員', '市議會', '縣議會', '監察院', '考試院',
  '選舉', '大選', '初選', '補選', '罷免', '公投', '投票率', '民調', '參選', '輔選', '競選', '造勢',
  // 高頻政治人物（只列會單獨成題的）
  '賴清德', '蕭美琴', '柯文哲', '侯友宜', '盧秀燕', '蔣萬安', '陳其邁', '黃國昌', '韓國瑜', '馬英九', '蔡英文', '鄭文燦',
  // 兩岸與統獨
  '統獨', '一中', '九二共識', '武統', '台獨', '親中', '舔共', '中共',
  // 政治性爭議
  '年金改革', '停砍年金', '大罷免', '索資', '政治獻金', '黑金', '弊案',
  // 國際政治（國際線寫的是災害/航空/民生，不是大國政治；這些一律排除）
  '川普', '拜登', '普丁', '習近平', '金正恩', '澤倫斯基', '馬克宏', '梅克爾',
  '白宮', '克里姆林', '聯合國安理會', '關稅戰', '貿易戰', '制裁', '停火', '和談',
];

const POLITICAL_RE = new RegExp(POLITICAL_PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));

/** 標題是否命中政治關鍵字（第二層過濾）。純函式。 */
export function isPolitical(title) {
  return POLITICAL_RE.test(String(title || ''));
}

/**
 * PTT 推文數欄位 → 數字。`爆`＝100+、`XN`＝噓文（負）、空白＝0。
 * 純函式（HTML 解析的一部分，單獨拆出來好測）。
 */
export function parsePush(raw) {
  const s = String(raw || '').trim();
  if (!s) return 0;
  if (s === '爆') return 100;
  if (/^X/i.test(s)) return -1; // 噓文多，一律排除
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** HTML entity 解碼（只處理 PTT 標題會出現的那幾個，不引外部套件）。純函式。 */
export function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * 解析 PTT 看板索引/搜尋結果 HTML → 文章清單。純函式（給測試餵固定 HTML）。
 * 被刪除的文章沒有 <a>，自動略過。
 * @returns {Array<{push:number, title:string, href:string, date:string}>}
 */
export function parseBoardIndex(html) {
  const out = [];
  const ents = String(html || '').matchAll(/<div class="r-ent">([\s\S]*?)<\/div>\s*<\/div>/g);
  for (const [, block] of ents) {
    const link = block.match(/class="title">\s*<a href="([^"]+)">([\s\S]*?)<\/a>/);
    if (!link) continue; // 已刪除的文章
    const push = block.match(/class="nrec">(?:<span[^>]*>([^<]*)<\/span>)?/);
    // 不要求結尾的 `<`：r-ent 區塊的非貪婪切法可能剛好切在 date 內容之後、下一個標籤之前。
    const date = block.match(/class="date">([^<]*)/);
    out.push({
      push: parsePush(push?.[1]),
      title: decodeEntities(link[2]).trim(),
      href: link[1].startsWith('http') ? link[1] : `https://www.ptt.cc${link[1]}`,
      date: (date?.[1] || '').trim(),
    });
  }
  return out;
}

/**
 * 去重用的正規化鍵：拿掉標籤前綴、Re:/Fw:、空白與標點，只留可比對的主體。
 * 純函式。同一事件的 Re: 串會收斂成同一個 key，避免同題連推。
 */
export function normalizeKey(title) {
  return String(title || '')
    .replace(/^(Re|Fw):\s*/i, '')
    .replace(/^\[[^\]]{1,8}\]\s*/, '')
    .replace(/[\s\p{P}\p{S}]/gu, '')
    .toLowerCase()
    .slice(0, 40);
}

/**
 * 標題是否為「無新聞價值」的板務／交易／例行文。純函式。
 *
 * 例行文那一段很重要：Stock 每天有盤中閒聊、三大法人、外資買賣超、信用交易統計；
 * Baseball/NBA 每天有 LIVE、炸裂、今日某某、戰績、花邊。它們必然高推但寫不成文章，
 * 不擋掉會把 LLM 選題層的輸入灌滿雜訊（實測 2026-08-06 首跑 547 則，過半是這類）。
 */
export function isNoiseTitle(title) {
  const t = String(title || '');
  return (
    // 板務／交易／廣告
    /^\[(公告|黑名|販售|徵求|徵|交易|購買|贈送|活動|廣宣|水桶|檢舉|協尋|測試)\]/.test(t) ||
    /板主|徵選|信任投票|板規|開臺|開台/.test(t) ||
    // 賽事即時串與逐日例行文
    /^(Re:\s*|Fw:\s*)?\[(LIVE|live|Live|直播|轉播|炸裂|情蒐|戰報|票數|閒聊)\]/.test(t) ||
    /^(Re:\s*)?\[(今日|分享)\]\s*(今日|CPBL|中職|MLB|NPB|戰績)/.test(t) ||
    /^\[花邊\]/.test(t) ||
    // 股市逐日例行統計
    /盤中閒聊|盤後閒聊|買賣超排行|三大法人|信用交易統計|融資融券|月營收|法說會逐字|除權息表/.test(t) ||
    // 純情緒／無資訊
    /^(Re:\s*)?\[(心情|抱怨|問卦|閒聊)\]\s*$/.test(t)
  );
}

// ── 抓取 ────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 抓單一看板的高推文（用 PTT 搜尋 `recommend:N`，回最新一頁）。
 *
 * **帶一次重試**：實測併發抓 30 板時，PTT 會零星拒連（2026-08-06 一次跑有 4 板失敗，
 * 單獨重抓全部 200），推測是限速。單板失敗＝該分類這一輪完全沒有候選，
 * 若剛好是 tech 那幾板連續失敗，科技就會長期沒題，所以值得retry 而不是放著。
 */
export async function fetchBoard({ board, minPush }, { fetchImpl = fetch, timeoutMs = 15000, retries = 1 } = {}) {
  const url = `https://www.ptt.cc/bbs/${board}/search?q=recommend%3A${minPush}`;
  let last = '';
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await sleep(800 * attempt);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        headers: { 'User-Agent': UA, Cookie: 'over18=1' },
        signal: ctl.signal,
      });
      if (!res.ok) {
        last = `HTTP ${res.status}`;
        continue;
      }
      return { board, ok: true, posts: parseBoardIndex(await res.text()) };
    } catch (e) {
      last = e?.message || String(e);
    } finally {
      clearTimeout(timer);
    }
  }
  return { board, ok: false, error: last, posts: [] };
}

/**
 * 掃全部白名單看板 → 過濾（推文門檻／噪音／政治）→ 回候選。
 * **不做去重**（去重要對帳本，見 forum-ledger 段），也不喚任何 LLM。
 */
export async function collectCandidates({
  boards = BOARDS,
  // 併發壓低到 3：實測 4 併發時 PTT 會零星拒連。這條每小時跑，30 板慢幾秒無所謂。
  concurrency = 3,
  fetchImpl = fetch,
  // 每板最多取推文最高的前幾則。首跑會撈到數百則（多數是同一板的例行文），
  // 灌進 LLM 選題層既貴又稀釋判斷；每板取頭部就夠代表該板當下在討論什麼。
  perBoardLimit = 6,
} = {}) {
  const results = [];
  const queue = [...boards];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const b = queue.shift();
      results.push({ cfg: b, ...(await fetchBoard(b, { fetchImpl })) });
    }
  });
  await Promise.all(workers);

  const candidates = [];
  const failures = [];
  for (const r of results) {
    if (!r.ok) {
      failures.push({ board: r.board, error: r.error });
      continue;
    }
    for (const p of r.posts) {
      if (p.push < r.cfg.minPush) continue;
      if (isNoiseTitle(p.title)) continue;
      if (isPolitical(p.title)) continue;
      candidates.push({
        board: r.board,
        category: r.cfg.category,
        local: !!r.cfg.local,
        push: p.push,
        title: p.title,
        url: p.href,
        date: p.date,
        key: normalizeKey(p.title),
      });
    }
  }
  // 同 key 只留推文最高的那則（Re: 串會收斂到本文）
  const byKey = new Map();
  for (const c of candidates) {
    const prev = byKey.get(c.key);
    if (!prev || c.push > prev.push) byKey.set(c.key, c);
  }
  // 每板取頭部
  const perBoard = new Map();
  for (const c of [...byKey.values()].sort((a, b) => b.push - a.push)) {
    const arr = perBoard.get(c.board) || [];
    if (arr.length < perBoardLimit) {
      arr.push(c);
      perBoard.set(c.board, arr);
    }
  }
  return {
    candidates: [...perBoard.values()].flat().sort((a, b) => b.push - a.push),
    failures,
    scanned: results.length,
  };
}

// ── 跨次去重帳本（每小時跑，沒有帳本會每小時重推同一題）────────────────────────

const SEEN_WINDOW_DAYS = 10; // 這麼久之內看過的題不再推
const SEEN_RETENTION_DAYS = 30;

export function seenPath() {
  return (
    process.env.FORUM_SEEN_PATH ||
    join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'forum-seen.json')
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

/** 純函式：把本次推出去的題併進帳本，並砍掉過期紀錄。 */
export function mergeSeen(seen, picked, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const cutoff = new Date(now.getTime() - SEEN_RETENTION_DAYS * 86400 * 1000).toISOString().slice(0, 10);
  const merged = [...seen.filter((s) => (s.date || '') >= cutoff)];
  const have = new Set(merged.map((s) => s.key));
  for (const p of picked) {
    if (have.has(p.key)) continue;
    merged.push({ key: p.key, date: today, title: p.title, board: p.board });
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
  const { candidates, failures, scanned } = await collectCandidates();
  const fresh = filterUnseen(candidates, loadSeen());
  if (pretty) {
    console.log(`掃 ${scanned} 板，候選 ${candidates.length}，扣掉帳本後新題 ${fresh.length}`);
    if (failures.length) console.log(`抓取失敗 ${failures.length} 板：${failures.map((f) => f.board).join(', ')}`);
    for (const c of fresh) {
      console.log(`  [${String(c.push).padStart(3)}] ${c.category.padEnd(13)} ${c.board.padEnd(13)} ${c.title}`);
    }
  } else {
    console.log(JSON.stringify({ scanned, failures, candidates: fresh }, null, 2));
  }
}
