// 高爾夫選手動態雷達協調器：純資料層（零 LLM）→ 有新資料才喚 LLM 選題 → 逐題撰寫並自動上架 → 回報運動台。
//
// 站長 2026-08-16 裁示：
//   - 台灣選手動態＝**必報導**（mustCover，有新料就寫；同日多條同選手/同賽事合併成一篇動態整理）。
//   - 其他高爾夫題（大賽賽果等）＝**視情況**（situational，選題模型判斷「夠重大」才寫，其餘 SKIP）。
//   - 分類掛 sports，**全自動上架**（不走待審），比照論壇雷達／警消／便民的站長裁示模式。
//
// 額度保護（同論壇雷達）：claude-appi 的額度是每 5 小時一個共用視窗、24 小時排程已排滿。
// 第一階段（scripts/lib/golf-signals.mjs）純 node——抓 YouTube／新聞 RSS、台灣選手命中標記、
// 跨次去重帳本——**沒有新資料就 exit 0、完全不動用 Claude**。只有真的撈到新資料才往下喚 Sonnet 選題
// ＋逐題走 newsroom-write（走它的配圖／去 AI 腔／標籤/查證 gate，不自己重寫一套）。
//
// 用法：
//   node scripts/golf-radar.mjs           # dry-run：只跑純資料層，印候選，不喚 LLM、不發 Slack、不寫帳本
//   node scripts/golf-radar.mjs --go      # 完整流程
//   node scripts/golf-radar.mjs --go --max 20   # 限制送進 LLM 的候選數（預設 30）

import { pathToFileURL } from 'node:url';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import {
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
} from './lib/golf-signals.mjs';

const has = (n) => process.argv.includes(`--${n}`);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

// 全源抓取失敗的告警節流 state（與 golf-seen 同一個 state 目錄）。
// 機制與 2026-08-08 事故緣由見 lib/radar-shared.mjs（第 1 輪一定報，之後每 6 小時再報一次）。
const FETCH_ALERT_PATH = fetchAlertPath('golf');

const SPORTS_SUBCATEGORIES = [
  'events', 'baseball', 'basketball', 'football', 'tennis',
  'sports-industry', 'sports-science', 'fitness-training', 'sports-health',
];

/** 組選題 prompt：mustCover 一律要成文（可合併同選手/同賽事），situational 只有夠重大才收。 */
function buildSelectionPrompt(cands, max, recent) {
  const list = cands
    .slice(0, max)
    .map((c, i) => {
      const tag = c.mustCover ? `【必報導：${c.player.zh}／${c.player.tour}】` : '【視情況】';
      const date = c.pubDate ? `（${c.pubDate.slice(0, 10)}）` : '';
      return `${i + 1}. ${tag}${date} [${c.source}] ${c.title}\n   連結：${c.url}\n   摘要：${c.summary || '（無）'}`;
    })
    .join('\n');

  return [
    '你是 APPI News 運動線編輯，負責高爾夫選手動態整理（事實型、編輯部署名、無個人觀點、全自動上架）。',
    '下面是系統固定抓取的 YouTube／新聞 RSS 候選，每則已標記「必報導」或「視情況」。',
    '',
    '【核心規則】',
    '- 標記「必報導」的候選＝台灣選手（旅外／現役職業選手）動態，**一律要幫它產出一篇文章**。',
    '  同一位選手、或同一場賽事的多條候選，**合併成一篇**動態整理（不要拆成好幾篇）。',
    '  唯一可以不寫的情況：內容完全沒有實質資訊（例如純頻道宣傳片、與該選手無關的訪談花絮）——',
    '  這種情況要在輸出裡明講理由，不能悄悄漏掉。',
    '- 標記「視情況」的候選＝其他高爾夫新聞（賽事、其他選手），**只有達到「大賽冠軍產生」「重大紀錄」',
    '  等級才寫**，其餘一律不選。**寧缺勿濫**，不要為了湊數硬選一般例行賽況。',
    '',
    '【硬性排除】',
    '- 查不到可連線來源就不要選（本站嚴禁杜撰；寫作階段會逐條查證超連結，選題階段先確保候選本身有實質資訊可查）。',
    '- 標題語意重複、或與下方「近期已發」重複的不要選。',
    '',
    '【輸出格式】只輸出一個 JSON 陣列（不要其他文字），每則：',
    '{"title":"文章標題（繁中台灣用語，事實陳述，不下標題黨）",',
    ' "conclusion":"核心結論一句（這則動態在講什麼）",',
    ' "angle":"建議切角一句（例如：合併哪幾條候選、鎖定哪個面向）",',
    ' "signal":"訊號依據（寫來源、幾則候選、發布時間）",',
    ' "category":"sports",',
    ` "subcategory":"合法子分類之一（${SPORTS_SUBCATEGORIES.join('/')}；高爾夫沒有專屬子分類，一般用 events）",`,
    ' "kind":"factual",',
    ' "mustCite":["候選清單裡的原始連結，逐字複製，不要自己編網址"]}',
    '',
    '寧缺勿濫，但**「必報導」的候選不能整批漏掉**——若這批完全沒有必報導候選，就照視情況規則挑；',
    '若有必報導候選卻一篇都不選，要在你心裡確認是真的「無實質資訊」，不是嫌麻煩。上限 6 則。',
    '',
    '【站上近期已經寫過的題目——語意重複的一律不要再選】',
    recent.length ? recent.map((t) => `- ${t}`).join('\n') : '（近期無）',
    '',
    '【本次候選】',
    list,
  ].join('\n');
}

async function selectTopics(cands, max) {
  // 近期已發標題餵進 prompt 做去重（緣由見 radar-shared 的 recentSiteTitles；本線每日一跑、
  // 賽事以週為單位，窗開 30 天即可）。
  const recent = recentSiteTitles({ days: 30 });
  const prompt = buildSelectionPrompt(cands, max, recent);
  const out = await runClaudeOnce(prompt, 'claude-sonnet-5', 600_000);
  return parseSuggestions(out);
}

// 逐則自動產文並上架（站長 2026-08-16 裁示：高爾夫線走全自動上架，同論壇雷達/國際/警消/便民）。
// 機制在 radar-shared 的 writeAndPublish。配圖鐵則對本線特別重要：**真實選手與賽事不可 AI 生圖**，
// NO_AI_IMAGE=1 由共用層在 spawn 時強制帶上，`.sh` 那邊再帶一次是雙重保險；封面與內文取圖 query
// 錯開由 get-image.mjs 各段落各自帶 query，本檔不用重做。
const publishOne = (s) => writeAndPublish(s, { tmpPrefix: 'golf-radar-' });

// 上架回報發運動台（訊息格式與 2026-08-08「不可只報篇數」裁示見 radar-shared 的 postToSlack）。
function reportToSlack(published) {
  return postToSlack(published, {
    category: 'sports',
    heading: '⛳ *高爾夫選手動態雷達*',
    notifyTitle: '⛳ 高爾夫選手動態雷達',
    sourceNote: '來源：YouTube／新聞 RSS',
    payloadPath: '/tmp/golf-radar-sports.json',
  });
}

async function main() {
  const go = has('go');
  const max = Number(arg('max', '30'));

  // ── 階段一：純資料（零 LLM）────────────────────────────────────────────
  const { candidates, failures, scanned, reached } = await collectCandidates({ log: (m) => console.log(m) });
  const fresh = filterUnseen(candidates, loadSeen());
  const mustCoverCount = fresh.filter((c) => c.mustCover).length;
  console.log(`掃 ${scanned} 源（抓到 ${reached}）／候選 ${candidates.length}／扣帳本後新資料 ${fresh.length}（必報導 ${mustCoverCount}）`);
  if (failures.length) {
    console.log(`抓取失敗 ${failures.length} 源：${failures.map((f) => `${f.source}（${f.error}）`).join('、')}`);
  }

  // 🔴 「全源都抓不到」≠「今天沒新料」，是來源掛了，要出聲；但告警照論壇雷達的節流語意：
  // **第 1 輪一定報**，同一波之後每 6 小時再報一次（狀態在 git 外帳本，機制見 radar-shared）。
  // 本線每日一跑，相隔 24 小時已算新一波（一定報），節流主要保護「同日手動重跑／密集除錯」不洗頻；
  // 訊息一律帶連續輪數與起始時間，讓收到的人不必翻 log 就知道壞多久了。
  const allFailed = candidates.length === 0 && failures.length >= scanned && scanned > 0;
  if (allFailed) {
    const wave = noteFetchFailure(FETCH_ALERT_PATH, Date.now(), { persist: go }); // dry-run 只算不寫，免得吃掉 cron 的告警
    if (wave.shouldAlert) {
      console.log(`FETCH_ALL_FAILED ${failures.length}/${scanned}｜${describeStreak(wave)}`);
      console.log('GOLF_RESULT=FAIL'); // → .sh 判定失敗 → ❌ 進 dev 台
      process.exitCode = 1;
      return;
    }
    console.log(`（全源抓取失敗｜${describeStreak(wave)}；6 小時內已報過一次，本輪靜默）`);
  } else if (candidates.length > 0 && go) {
    clearFetchFailure(FETCH_ALERT_PATH); // 抓得到就結束這一波，下次壞掉才會立刻出聲
  }

  // 沒有新資料就收工——這是每天跑也不燒額度的關鍵，不要改成「照樣問一次 LLM」。
  if (!fresh.length) {
    console.log('無新資料，安靜結束（未動用 Claude）。');
    console.log('GOLF_RESULT=NONE');
    return;
  }

  if (!go) {
    console.log('— DRY RUN（不帶 --go：不喚 LLM、不發 Slack、不寫帳本）—');
    for (const c of fresh.slice(0, max)) {
      const tag = c.mustCover ? `★${c.player.zh}` : '　　';
      console.log(`  [${tag}] ${c.source.padEnd(22)} ${c.title}`);
    }
    return;
  }

  // ── 階段二：選題（Sonnet）────────────────────────────────────────────
  console.log(`→ 選題（送 ${Math.min(fresh.length, max)} 則候選給 Sonnet，含 ${mustCoverCount} 則必報導）`);
  let res;
  try {
    res = await selectTopics(fresh, max);
  } catch (e) {
    // 撞用量上限／API 失敗＝infra 故障：**不記帳本**（記了等於把故障固化成「已判過」，
    // 那些台灣選手動態再也不會被提，見 docs/automation-invariants.md）。
    console.error(`✖ 選題失敗（infra）：${e.message}`);
    console.log('GOLF_RESULT=FAIL');
    process.exitCode = 1;
    return;
  }
  if (!res.ok) {
    console.error('✖ 選題輸出無法解析（infra）→ 不記帳本，下輪重試');
    console.log('GOLF_RESULT=FAIL');
    process.exitCode = 1;
    return;
  }

  const suggestions = res.suggestions.filter((s) => s && s.title && s.category === 'sports');
  if (!suggestions.length) {
    // 模型真的判斷「這批沒有可寫的」——這是編輯判斷，與 infra 故障不同，要記帳本，
    // 否則下一輪會拿同一批資料再問一次、每天燒一次額度。
    console.log('本輪無可寫題目（模型判定），記帳本避免重複詢問。');
    saveSeen(mergeSeen(loadSeen(), fresh));
    console.log('GOLF_RESULT=NONE');
    return;
  }

  // ── 階段三：逐題撰寫並上架 ─────────────────────────────────────────────
  const done = [];
  for (const s of suggestions) {
    const url = publishOne(s);
    // PUBLISHED= 行給 cron `.sh` 組「標題＋連結」清單用（格式與其他自動線一致，勿改）。
    if (url) {
      done.push({ ...s, url });
      console.log(`  ✓ 已上架：${s.title}`);
      console.log(`PUBLISHED=${url} ｜ ${s.title}`);
    }
  }

  if (done.length && reportToSlack(done)) console.log(`  ✓ 運動台：回報 ${done.length} 篇`);

  // 只有真的產出文章才記帳本（全軍覆沒＝可能是 infra 問題，留著下輪重試）。
  if (done.length) saveSeen(mergeSeen(loadSeen(), fresh));
  console.log(done.length ? `GOLF_RESULT=PUBLISHED ${done.length}` : 'GOLF_RESULT=FAIL');
  if (!done.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e?.stack || e?.message || String(e));
    console.log('GOLF_RESULT=FAIL');
    process.exit(1);
  });
}
