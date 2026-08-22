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

import { pathToFileURL } from 'node:url';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import {
  CATEGORY_NAMES,
  parseSuggestions,
  recentSiteTitles,
  writeAndPublish,
  postToSlack,
  fetchAlertPath,
  noteFetchFailure,
  clearFetchFailure,
  describeStreak,
} from './lib/radar-shared.mjs';
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

// 全板抓取失敗的告警節流 state（與 forum-seen 同一個 state 目錄）。
// 機制與 2026-08-08 事故緣由見 lib/radar-shared.mjs（第 1 輪一定報，之後每 6 小時再報一次）。
const FETCH_ALERT_PATH = fetchAlertPath('forum');

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

async function selectTopics(cands, max) {
  // 近期已發標題餵進 prompt 做去重（緣由見 radar-shared 的 recentSiteTitles；
  // 本線窗開 45 天，比高爾夫線寬——PTT 熱議常翻炒一個多月前的舊題）。
  const recent = recentSiteTitles({ days: 45 });
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

// 逐則自動產文並上架（站長 2026-08-06 裁示：論壇雷達走全自動上架，同國際／警消／便民；不設每日上限）。
// 機制（配圖鐵則 NO_AI_IMAGE、publishDate 給今天、四道 gate）在 radar-shared 的 writeAndPublish。
const publishOne = (s) => writeAndPublish(s, { tmpPrefix: 'forum-radar-' });

// 上架回報發各分類台（訊息格式與 2026-08-08「不可只報篇數」裁示見 radar-shared 的 postToSlack）。
function reportToSlack(published, category) {
  const name = CATEGORY_NAMES[category] || category;
  return postToSlack(published, {
    category,
    heading: `🧭 *論壇選題雷達*（${name}）`,
    notifyTitle: `🧭 論壇選題雷達｜${name}`,
    sourceNote: '來源：PTT 熱門討論',
    payloadPath: `/tmp/forum-radar-${category}.json`,
  });
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
    const wave = noteFetchFailure(FETCH_ALERT_PATH, Date.now(), { persist: go }); // dry-run 只算不寫，免得吃掉 cron 的告警
    if (wave.shouldAlert) {
      console.log(`FETCH_ALL_FAILED ${failures.length}/${scanned}｜${describeStreak(wave)}`);
      console.log('FORUM_RESULT=FAIL'); // → .sh 判定失敗 → ❌ 進 dev 台
      process.exitCode = 1;
      return;
    }
    console.log(`（全板抓取失敗｜${describeStreak(wave)}；6 小時內已報過一次，本輪靜默）`);
  } else if (candidates.length > 0 && go) {
    clearFetchFailure(FETCH_ALERT_PATH); // 抓得到就結束這一波，下次壞掉才會立刻出聲
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
      const url = publishOne(s);
      // PUBLISHED= 行給 cron `.sh` 組「標題＋連結」清單用（格式與其他自動線一致，勿改）。
      if (url) { done.push({ ...s, url }); published++; console.log(`  ✓ 已上架：${s.title}`); console.log(`PUBLISHED=${url} ｜ ${s.title}`); }
    }
    // 只回報真的上架的；一篇都沒成功就不吵那個分類台。
    if (done.length && reportToSlack(done, cat)) console.log(`  ✓ ${CATEGORY_NAMES[cat]}台：回報 ${done.length} 篇`);
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
