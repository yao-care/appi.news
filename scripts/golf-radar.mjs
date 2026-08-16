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

import { writeFileSync, readFileSync, readdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
} from './lib/golf-signals.mjs';

const has = (n) => process.argv.includes(`--${n}`);
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

const SPORTS_SUBCATEGORIES = [
  'events', 'baseball', 'basketball', 'football', 'tennis',
  'sports-industry', 'sports-science', 'fitness-training', 'sports-health',
];

/**
 * 近期已發文章標題（餵進選題 prompt 做去重，跨全站分類，同論壇雷達的作法）。
 * forum-seen／golf-seen 帳本只記「這條 RSS 條目推過沒」，記不住「這個題目站上已經寫過」。
 */
function recentTitles(days = 30, limit = 150) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let files = [];
  try {
    files = readdirSync('src/content/articles').filter((f) => f.endsWith('.md'));
  } catch {
    return [];
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
  const recent = recentTitles();
  const prompt = buildSelectionPrompt(cands, max, recent);
  const out = await runClaudeOnce(prompt, 'claude-sonnet-5', 600_000);
  return parseSuggestions(out);
}

/**
 * 逐則自動產文並上架（站長 2026-08-16 裁示：高爾夫線走全自動上架，同論壇雷達/國際/警消/便民）。
 *
 * **配圖鐵則**：一律 `NO_AI_IMAGE=1`——真實人物與賽事不可 AI 生圖（站長明確要求）。這裡在
 * spawn 時強制帶上，不依賴呼叫端 `.sh` 的環境變數，任一邊被改掉都還有另一邊擋著。
 *
 * 走 newsroom-write 而不是自己寫一套：配圖／選題重複／去 AI 腔／標籤四道 gate、以及封面與內文
 * 取圖 query 錯開（NO_AI_IMAGE 模式下圖庫查詢由 get-image.mjs 各段落各自帶 query，本檔不用重做）
 * 全部由該引擎保留。單篇失敗只丟那一篇（回 null），不連累同批。
 */
function writeAndPublish(s) {
  const dir = mkdtempSync(join(tmpdir(), 'golf-radar-'));
  const jobPath = join(dir, 'job.json');
  // publishDate 明確給「今天（台北）」＝立刻上線，不給的話 newsroom-write 會退回下一個空檔（可能排到
  // 一週後）。自動上架線一律用系統時間蓋日期（docs/automation-invariants.md）。
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

// 上架回報一律「一篇一行、標題帶連結」，比照論壇雷達（站長 2026-08-08 裁示：自動上架訊息不可只報篇數）。
function postToSlack(published) {
  const list = published.map((s) => `• <${s.url}|${s.title}>`).join('\n');
  const body = `⛳ *高爾夫選手動態雷達*\n來源：YouTube／新聞 RSS，以下已自動撰寫並上架。要改就進編輯器。\n\n${list}`;
  const payload = {
    category: 'sports',
    text: `⛳ 高爾夫選手動態雷達（已上架 ${published.length} 篇）`,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: body } }],
  };
  const path = `/tmp/golf-radar-sports.json`;
  writeFileSync(path, JSON.stringify(payload));
  const r = spawnSync('node', ['scripts/slack-post.mjs', path], { encoding: 'utf8' });
  const ok = r.status === 0 && /sent ts=/.test(r.stdout || '');
  if (!ok) console.error(`  ✖ 運動台發送失敗：${(r.stderr || r.stdout || '').trim().slice(0, 200)}`);
  return ok;
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

  // 全源都抓不到：不是「今天沒新料」，是來源掛了，但這裡刻意只印一行、不告警。
  // 高爾夫線頻率是每日一次（見 scripts/cron/golf-radar.sh 排程說明），單日全軍覆沒的告警急迫性
  // 遠低於每小時跑的論壇雷達；且來源分散（3 個 YouTube + 2 個新聞 RSS），同一天全掛的機率低。
  // 若之後要加告警節流，比照 forum-radar.mjs 的 noteFetchFailure／describeStreak 機制即可。
  if (candidates.length === 0 && failures.length >= scanned && scanned > 0) {
    console.log('全部來源本輪皆抓取失敗，安靜結束。');
    console.log('GOLF_RESULT=FAIL');
    process.exitCode = 1;
    return;
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
    const url = writeAndPublish(s);
    // PUBLISHED= 行給 cron `.sh` 組「標題＋連結」清單用（格式與其他自動線一致，勿改）。
    if (url) {
      done.push({ ...s, url });
      console.log(`  ✓ 已上架：${s.title}`);
      console.log(`PUBLISHED=${url} ｜ ${s.title}`);
    }
  }

  if (done.length && postToSlack(done)) console.log(`  ✓ 運動台：回報 ${done.length} 篇`);

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
