// 論壇選題雷達協調器：純資料層（零 LLM）→ 有新熱題才喚 LLM 選題 → Slack 分類台（帶「我要寫這題」按鈕）。
//
// 每小時由 cron 呼叫（追議題時效）。**額度保護是本線的設計核心**：
// claude-appi 的額度是每 5 小時一個共用視窗、24 小時排程已排滿，每小時喚一次 Claude 會餓死既有內容線。
// 所以抓取／政治過濾／跨次去重全部用 node 做完（scripts/lib/forum-signals.mjs），
// **沒有新題就 exit 0、完全不動用 Claude**（同 lifestyle-typhoon.sh 的前置 gate 思路）。
//
// 政治排除三層（站長要求 100% 避開）：
//   ① 看板白名單、② 標題關鍵字 —— 都在 forum-signals.mjs（純 script）。
//   ③ LLM 判斷 —— 在本檔。地方板逐則判斷（市政攻防關鍵字擋不掉），
//      且選題 prompt 內另有一道全域政治 backstop：**PTT 索引標題會被截斷**
//      （實測「伊朗開出這驚人條件 川」——「川普」被切掉、關鍵字沒中），
//      所以 script 層不可能 100%，最後一關一定要由讀得懂上下文的模型把。
//
// 用法：
//   node scripts/forum-radar.mjs           # dry-run：只跑純資料層，印候選，不喚 LLM、不發 Slack、不寫帳本
//   node scripts/forum-radar.mjs --go      # 完整流程
//   node scripts/forum-radar.mjs --go --max 12   # 限制送進 LLM 的候選數（預設 40）

import { writeFileSync, readFileSync, readdirSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import {
  collectCandidates,
  filterUnseen,
  mergeSeen,
  loadSeen,
  saveSeen,
} from './lib/forum-signals.mjs';

const has = (n) => process.argv.includes(`--${n}`);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

// 全板抓取失敗的告警節流。與 forum-seen 同一個 state 目錄。
//
// 🔴 **一波故障的第 1 輪一定要報，之後才節流**——只看「距上次報過多久」會讓
// 「剛壞掉」與「壞了一整夜」長得一模一樣。2026-08-08 站長收到一則 ❌ 無法判斷那是
// 單次還是連續第 8 輪，得翻 log 才知道，所以訊息一律帶連續輪數與起始時間。
const FETCH_ALERT_PATH = join(
  process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'),
  'appi-news', 'forum-fetch-alert.json',
);
const ALERT_COOLDOWN_MS = 6 * 3600 * 1000;
// 隔太久沒失敗就算新一波（cron 停擺／主機重開後不該把舊 streak 接著算）。
const STREAK_GAP_MS = 6 * 3600 * 1000;

function readAlertState() {
  try { return JSON.parse(readFileSync(FETCH_ALERT_PATH, 'utf8')) || {}; } catch { return {}; }
}

function writeAlertState(state) {
  try {
    mkdirSync(join(FETCH_ALERT_PATH, '..'), { recursive: true });
    writeFileSync(FETCH_ALERT_PATH, JSON.stringify(state));
  } catch { /* 寫不進去不影響本輪判斷，寧可多報不可不報 */ }
}

/**
 * 記一次「全板抓取失敗」，回報這一波的連續狀況與這輪該不該出聲。
 * 寫不進帳本時 streak 會退回 1、shouldAlert 恆真——寧可多報不可不報。
 *
 * `persist=false`（dry-run）只算不寫：手動跑 dry-run 剛好撞上故障時，
 * 若寫進帳本會把 lastAlertMs 蓋成現在，**吃掉下一輪 cron 的告警**。
 */
export function noteFetchFailure(now = Date.now(), { persist = true } = {}) {
  const prev = readAlertState();
  const continued = prev.lastFailMs && now - prev.lastFailMs <= STREAK_GAP_MS;
  const streak = continued ? (prev.streak || 1) + 1 : 1;
  const streakStartMs = continued ? (prev.streakStartMs || now) : now;
  // 第 1 輪一定報；同一波之後每 ALERT_COOLDOWN_MS 才再報一次。
  const shouldAlert = streak === 1 || now - (prev.lastAlertMs || 0) >= ALERT_COOLDOWN_MS;
  if (persist) {
    writeAlertState({
      streak,
      streakStartMs,
      lastFailMs: now,
      lastAlertMs: shouldAlert ? now : (prev.lastAlertMs || 0),
    });
  }
  return { streak, streakStartMs, shouldAlert, elapsedMs: now - streakStartMs };
}

/** 抓得到東西就結束這一波，下次失敗要從第 1 輪重新算（也才會立刻出聲）。 */
export function clearFetchFailure() {
  const prev = readAlertState();
  if (prev.lastFailMs) writeAlertState({});
}

export function describeStreak({ streak, streakStartMs, elapsedMs }) {
  const hours = elapsedMs / 3600000;
  const span = hours < 1 ? '不到 1 小時' : `約 ${Math.round(hours)} 小時`;
  const since = new Date(streakStartMs).toISOString().slice(0, 16).replace('T', ' ');
  return streak === 1
    ? '本波第 1 輪（剛開始失敗）'
    : `連續第 ${streak} 輪、${span}（起於 ${since} UTC）`;
}

const CATEGORY_NAMES = {
  tech: '科技', finance: '財經', health: '健康',
  lifestyle: '生活', international: '國際', sports: '運動',
};

/** 地方板逐則政治判斷（Haiku，一次批次呼叫）。回傳「應排除」的 index Set。
 *  解析失敗＝infra 故障：**保守全部排除**（地方板本來就是加值，寧可少推也不要漏政治）。 */
export function parseLocalVerdict(stdout, count) {
  const m = String(stdout || '').match(/LOCAL_DROP\s*=\s*([0-9,\s]*)/i);
  if (!m) return { ok: false, drop: new Set(Array.from({ length: count }, (_, i) => i)) };
  const drop = new Set(
    (m[1] || '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= count)
      .map((n) => n - 1),
  );
  return { ok: true, drop };
}

async function judgeLocal(localCands) {
  if (!localCands.length) return { kept: [], dropped: 0, infra: false };
  const list = localCands.map((c, i) => `${i + 1}. [${c.board}] ${c.title}`).join('\n');
  const prompt = [
    '你是 APPI News 的選題守門員。下面是 PTT 地方看板（台南/高雄/台中）的熱門標題。',
    '這個站的鐵律是「100% 避開政治」。請挑出**必須排除**的項目。',
    '',
    '必須排除：政黨或政治人物的攻防、市府與市府之間的互相指控、議會質詢、選舉、罷免、人事鬥爭、',
    '　　　　　以及表面上是行政事件、實質是政治攻防的（例：某市府查某企業、另一市府回嗆）。',
    '可以保留：純民生與在地生活資訊（美食、交通、天氣、店家、活動、建設進度的客觀說明、',
    '　　　　　消費資訊、地方特色）。行政機關單純的便民措施或監理公告可以保留。',
    '',
    list,
    '',
    '只輸出一行：LOCAL_DROP=<要排除的編號，逗號分隔；沒有要排除的就留空>',
    '例：LOCAL_DROP=2,5,7　或　LOCAL_DROP=',
  ].join('\n');

  let out = '';
  try {
    out = await runClaudeOnce(prompt, 'haiku', 90_000);
  } catch (e) {
    console.error(`  ⚠️ 地方板判斷失敗（${e.message}）→ 保守排除全部地方板候選`);
    return { kept: [], dropped: localCands.length, infra: true };
  }
  const { ok, drop } = parseLocalVerdict(out, localCands.length);
  if (!ok) console.error('  ⚠️ 地方板判斷輸出無法解析 → 保守排除全部地方板候選');
  return {
    kept: localCands.filter((_, i) => !drop.has(i)),
    dropped: drop.size,
    infra: !ok,
  };
}

/**
 * 近期已發文章標題（餵進選題 prompt 做去重）。
 *
 * **為什麼一定要有**：forum-seen 帳本只記「這則 PTT 文推過沒」，記不住「這個題目站上已經寫過」。
 * 2026-08-06 首次實跑就推薦了當天稍早才發佈的同一題（手術機器人）。寫作端的
 * check-duplicate-topic gate 雖然擋得下來，但那是**整篇寫完才擋**，白燒一篇額度，
 * 還佔掉 Slack 清單一個位子。
 */
function recentTitles(days = 45, limit = 150) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let files = [];
  try {
    files = readdirSync('src/content/articles').filter((f) => f.endsWith('.md'));
  } catch {
    return []; // 讀不到就當沒有，不因去重資料缺失而中斷選題
  }
  const out = [];
  for (const f of files) {
    try {
      const m = readFileSync(join('src/content/articles', f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      const d = yaml.load(m[1]) || {};
      const t = new Date(d.publishDate || 0).getTime();
      if (t >= cutoff && d.title) out.push({ t, title: d.title });
    } catch {
      /* 單篇壞掉不影響其餘 */
    }
  }
  // 由新到舊取上限：本線每小時可能跑一次，整窗塞進 prompt 太肥
  // （實測 45 天窗有數百篇），而撞題風險本來就集中在最近幾天。
  return out.sort((a, b) => b.t - a.t).slice(0, limit).map((x) => x.title);
}

/** 解析選題結果：模型回一段 JSON 陣列。解析不出來＝infra 故障（不是「今天沒題」）。 */
export function parseSuggestions(stdout) {
  const s = String(stdout || '');
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : s.slice(s.indexOf('['), s.lastIndexOf(']') + 1);
  try {
    const j = JSON.parse(raw);
    return Array.isArray(j) ? { ok: true, suggestions: j } : { ok: false, suggestions: [] };
  } catch {
    return { ok: false, suggestions: [] };
  }
}

async function selectTopics(cands, max) {
  const recent = recentTitles();
  const list = cands
    .slice(0, max)
    .map((c, i) => `${i + 1}. [${CATEGORY_NAMES[c.category]}/${c.board}] (${c.push}推) ${c.title}`)
    .join('\n');

  const prompt = [
    '你是 APPI News 的選題編輯。下面是 PTT 各看板此刻的熱門討論，代表台灣讀者真實在問的問題。',
    '請從中挑出**適合本站寫成文章**的題目，輸出結構化 JSON。',
    '',
    '【硬性排除，違反就是重大事故】',
    '- **任何政治相關一律不選**：政黨、政治人物、選舉、罷免、議會、市府互鬥、兩岸、國際大國政治。',
    '  注意 PTT 標題會被截斷，看起來中性的標題也可能是政治題（例如結尾出現人名的殘字）。有疑慮就不要選。',
    '- 個人情緒抒發、感情糾紛、單一網友的個人遭遇（沒有公共資訊價值）。',
    '- 賽事即時結果、球員八卦、逐日行情統計（寫成文章當天就過期）。',
    '- 需要引用他人版權內容才寫得成的（影劇雷文、轉載全文）。',
    '',
    '【選題判準：可贏性，不是熱度】',
    '- 優先「一般人會打進搜尋框、而且大媒體沒在好好寫」的題：怎麼辦／要多少／該不該／怎麼申請／權益是什麼。',
    '- 本站主力車道是 AI×數位健康/醫療，這類題優先。',
    '- 題目要能靠**可連線的官方或權威來源**查證；查不到就不要選（本站嚴禁杜撰）。',
    '- 標題用大眾語彙，不要用只有該圈子懂的專有名詞。',
    '',
    '【輸出格式】只輸出一個 JSON 陣列（不要其他文字），每則：',
    '{"title":"文章標題（繁中台灣用語，不含PTT標籤）",',
    ' "conclusion":"核心結論一句",',
    ' "angle":"建議切角一句",',
    ' "signal":"訊號依據（寫 PTT 哪個板、幾推、在討論什麼）",',
    ' "category":"tech|finance|health|lifestyle|international|sports",',
    ' "subcategory":"該分類的合法子分類 slug",',
    ' "kind":"factual"}',
    '',
    '寧缺勿濫：**挑不到就回空陣列 []**，不要為了湊數硬選。上限 8 則。',
    '',
    '【站上近期已經寫過的題目——語意重複的一律不要再選】',
    recent.length ? recent.map((t) => `- ${t}`).join('\n') : '（近期無）',
    '',
    '【本次候選】',
    list,
  ].join('\n');

  const out = await runClaudeOnce(prompt, 'claude-sonnet-5', 600_000);
  return parseSuggestions(out);
}

/**
 * 逐則自動產文並上架（站長 2026-08-06 裁示：論壇雷達走全自動上架，同國際／警消／便民；不設每日上限）。
 *
 * **配圖鐵則**：一律 `NO_AI_IMAGE=1`，禁 OpenAI 生圖，只用站內既有圖或圖庫
 * （站長明確要求）。這裡在 spawn 時強制帶上，不依賴呼叫端的環境——`.sh` 忘了設也不會破功。
 *
 * 走 newsroom-write 而不是自己寫一套：配圖／選題重複／去 AI 腔／標籤四道 gate 全部保留。
 * 單篇失敗只丟那一篇（回 false），不連累同批——比照影片線的作法。
 */
function writeAndPublish(s) {
  const dir = mkdtempSync(join(tmpdir(), 'forum-radar-'));
  const jobPath = join(dir, 'job.json');
  // publishDate 明確給「今天（台北）」＝立刻上線。不給的話 newsroom-write 會退回
  // 「下一個還沒有文章的日子」，而日更早把未來一週佔滿，結果會排到八天後才見天日——
  // 那不是全自動上架。自動線一律用系統時間蓋日期（docs/automation-invariants.md）。
  const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
  writeFileSync(jobPath, JSON.stringify({ ...s, kind: 'factual', autoPublish: true, publishDate: today }));
  const r = spawnSync('node', ['scripts/newsroom-write.mjs', jobPath, '--go', '--allow-any-category'], {
    encoding: 'utf8',
    env: { ...process.env, NO_AI_IMAGE: '1' },
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const url = out.match(/PUBLISHED_URL=(\S+)/)?.[1] || null;
  const ok = r.status === 0 && !!url;
  if (!ok) {
    const why = out.match(/✖ [^\n]+/)?.[0] || `exit ${r.status}`;
    console.error(`  ✖ 未產出：${s.title}｜${why.slice(0, 160)}`);
  }
  return ok ? url : null;
}

// 上架回報一律「一篇一行、標題帶連結」（站長 2026-08-08 裁示：自動上架訊息不可只報篇數）。
// 刻意不走 suggestionBlocks：那是給「還沒寫的候選」用的，會渲染切角/依據並掛上「我要寫這題」鈕，
// 對已經上架的文章既沒有連結、按鈕也是誤導。
function postToSlack(published, category) {
  const name = CATEGORY_NAMES[category] || category;
  const list = published.map((s) => `• <${s.url}|${s.title}>`).join('\n');
  const body = `🧭 *論壇選題雷達*（${name}）\n來源：PTT 熱門討論，以下已自動撰寫並上架。要改就進編輯器。\n\n${list}`;
  const payload = {
    category,
    text: `🧭 論壇選題雷達｜${name}（已上架 ${published.length} 篇）`,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: body } }],
  };
  const path = `/tmp/forum-radar-${category}.json`;
  writeFileSync(path, JSON.stringify(payload));
  const r = spawnSync('node', ['scripts/slack-post.mjs', path], { encoding: 'utf8' });
  const ok = r.status === 0 && /sent ts=/.test(r.stdout || '');
  if (!ok) console.error(`  ✖ ${name}台發送失敗：${(r.stderr || r.stdout || '').trim().slice(0, 200)}`);
  return ok;
}

async function main() {
  const go = has('go');
  const max = Number(arg('max', '40'));

  // ── 階段一：純資料（零 LLM）────────────────────────────────────────────
  const { candidates, failures, scanned } = await collectCandidates();
  const fresh = filterUnseen(candidates, loadSeen());
  console.log(`掃 ${scanned} 板／候選 ${candidates.length}／扣帳本後新題 ${fresh.length}`);
  if (failures.length) {
    console.log(`抓取失敗 ${failures.length} 板：${failures.map((f) => f.board).join(', ')}`);
  }

  // 🔴 「全部板都抓不到」≠「今天沒有熱題」，但兩者在下面都走「安靜結束」——2026-08-06 起
  // PTT 對本機 IP 連線逾時，本線每小時空跑、完全靜默沒人發現。全軍覆沒要出聲，但每小時
  // 喊一次會洗頻，所以：**第 1 輪一定報**，同一波之後每 6 小時再報一次（狀態在 git 外帳本），
  // 且訊息一律帶連續輪數與起始時間，讓收到的人不必翻 log 就知道壞多久了。
  const allFailed = candidates.length === 0 && failures.length >= scanned && scanned > 0;
  if (allFailed) {
    const wave = noteFetchFailure(Date.now(), { persist: go }); // dry-run 只算不寫，免得吃掉 cron 的告警
    if (wave.shouldAlert) {
      console.log(`FETCH_ALL_FAILED ${failures.length}/${scanned}｜${describeStreak(wave)}`);
      console.log('FORUM_RESULT=FAIL'); // → .sh 判定失敗 → ❌ 進 dev 台
      process.exitCode = 1;
      return;
    }
    console.log(`（全板抓取失敗｜${describeStreak(wave)}；6 小時內已報過一次，本輪靜默）`);
  } else if (candidates.length > 0 && go) {
    clearFetchFailure(); // 抓得到就結束這一波，下次壞掉才會立刻出聲
  }

  // 沒有新題就收工——**這是每小時跑也不燒額度的關鍵**，不要改成「照樣問一次 LLM」。
  if (!fresh.length) {
    console.log('無新熱題，安靜結束（未動用 Claude）。');
    console.log('FORUM_RESULT=NONE');
    return;
  }

  if (!go) {
    console.log('— DRY RUN（不帶 --go：不喚 LLM、不發 Slack、不寫帳本）—');
    for (const c of fresh.slice(0, max)) {
      console.log(`  [${String(c.push).padStart(3)}] ${c.category.padEnd(13)} ${c.board.padEnd(13)} ${c.title}`);
    }
    return;
  }

  // ── 階段二：地方板逐則 LLM 判斷（Haiku）──────────────────────────────
  const local = fresh.filter((c) => c.local);
  const nonLocal = fresh.filter((c) => !c.local);
  const { kept: localKept, dropped } = await judgeLocal(local);
  if (local.length) console.log(`地方板 ${local.length} 則 → 排除 ${dropped}、保留 ${localKept.length}`);
  const pool = [...nonLocal, ...localKept].sort((a, b) => b.push - a.push);

  // ── 階段三：選題（Sonnet）────────────────────────────────────────────
  console.log(`→ 選題（送 ${Math.min(pool.length, max)} 則候選給 Sonnet）`);
  let res;
  try {
    res = await selectTopics(pool, max);
  } catch (e) {
    // 撞用量上限／API 失敗＝infra 故障：**不記帳本**（記了等於把故障固化成「已判過」，
    // 那些題再也不會被提，且不會自己復原。見 docs/automation-invariants.md）。
    console.error(`✖ 選題失敗（infra）：${e.message}`);
    console.log('FORUM_RESULT=FAIL');
    process.exitCode = 1;
    return;
  }
  if (!res.ok) {
    console.error('✖ 選題輸出無法解析（infra）→ 不記帳本，下輪重試');
    console.log('FORUM_RESULT=FAIL');
    process.exitCode = 1;
    return;
  }

  const suggestions = res.suggestions.filter((s) => s && s.title && CATEGORY_NAMES[s.category]);
  if (!suggestions.length) {
    // 模型真的判斷「這批沒有可寫的」——這是**編輯判斷**，與 infra 故障不同，要記帳本，
    // 否則下一輪會拿同一批題再問一次、每小時燒一次額度。
    console.log('本輪無可寫題目（模型判定），記帳本避免重複詢問。');
    saveSeen(mergeSeen(loadSeen(), pool));
    console.log('FORUM_RESULT=NONE');
    return;
  }

  // ── 階段四：分類分流發 Slack ─────────────────────────────────────────
  const byCat = new Map();
  for (const s of suggestions) {
    const arr = byCat.get(s.category) || [];
    arr.push(s);
    byCat.set(s.category, arr);
  }
  let published = 0;
  for (const [cat, list] of byCat) {
    const done = [];
    for (const s of list) {
      const url = writeAndPublish(s);
      // PUBLISHED= 行給 cron `.sh` 組「標題＋連結」清單用（格式與其他自動線一致，勿改）。
      if (url) { done.push({ ...s, url }); published++; console.log(`  ✓ 已上架：${s.title}`); console.log(`PUBLISHED=${url} ｜ ${s.title}`); }
    }
    // 只回報真的上架的；一篇都沒成功就不吵那個分類台。
    if (done.length && postToSlack(done, cat)) console.log(`  ✓ ${CATEGORY_NAMES[cat]}台：回報 ${done.length} 篇`);
  }

  // 只有真的產出文章才記帳本（全軍覆沒＝可能是 infra 問題，留著下輪重試）。
  if (published) saveSeen(mergeSeen(loadSeen(), pool));
  console.log(published ? `FORUM_RESULT=PUBLISHED ${published}` : 'FORUM_RESULT=FAIL');
  if (!published) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e?.stack || e?.message || String(e));
    console.log('FORUM_RESULT=FAIL');
    process.exit(1);
  });
}
