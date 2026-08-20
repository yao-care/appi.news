// 選題雷達共用層：論壇（scripts/forum-radar.mjs）與高爾夫（scripts/golf-radar.mjs）兩支雷達
// 逐字重複的機制收斂到這裡。**只收兩支語意完全相同的段落**：選題輸出解析、站上近期標題、
// 逐題產文上架、Slack 送訊、全源抓取失敗的告警節流。
// 各雷達自己的選題邏輯（論壇的政治過濾與地方板判斷、高爾夫的 mustCover 選手命中）留在各自檔案。

import { writeFileSync, readFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { listArticleFrontmatters } from './article-index.mjs';

/** 分類 slug → 中文台名（Slack 回報與選題 prompt 共用）。 */
export const CATEGORY_NAMES = {
  tech: '科技', finance: '財經', health: '健康',
  lifestyle: '生活', international: '國際', sports: '運動',
};

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

/**
 * 近期已發文章標題（餵進選題 prompt 做去重，跨全站分類）。
 *
 * **為什麼一定要有**：各雷達的 seen 帳本只記「這則來源條目推過沒」，記不住「這個題目站上已經
 * 寫過」。2026-08-06 論壇雷達首次實跑就推薦了當天稍早才發佈的同一題（手術機器人）。寫作端的
 * check-duplicate-topic gate 雖然擋得下來，但那是**整篇寫完才擋**，白燒一篇額度。
 *
 * 由新到舊取上限：整窗塞進 prompt 太肥（實測 45 天窗有數百篇），而撞題風險本來就集中在最近幾天。
 */
export function recentSiteTitles({ days = 30, limit = 150, articlesDir } = {}) {
  const cutoff = Date.now() - days * 86400 * 1000;
  const out = [];
  for (const e of listArticleFrontmatters(articlesDir ? { articlesDir } : {})) {
    const t = new Date(e.data.publishDate || 0).getTime();
    if (t >= cutoff && e.data.title) out.push({ t, title: e.data.title });
  }
  return out.sort((a, b) => b.t - a.t).slice(0, limit).map((x) => x.title);
}

/**
 * 單則自動產文並上架（雷達線皆為站長裁示的全自動上架模式；裁示緣由見各雷達檔頭）。
 *
 * **配圖鐵則**：一律 `NO_AI_IMAGE=1`，禁 OpenAI 生圖（論壇線是站長明確要求只用站內既有圖或圖庫；
 * 高爾夫線是真實選手與賽事不可 AI 生圖）。這裡在 spawn 時強制帶上，不依賴呼叫端 `.sh` 的環境變數，
 * 任一邊被改掉都還有另一邊擋著。
 *
 * 走 newsroom-write 而不是自己寫一套：配圖／選題重複／去 AI 腔／標籤四道 gate 全部保留。
 * 單則失敗只丟那一則（回 null），不連累同批（比照影片線的作法）。
 *
 * publishDate 明確給「今天（台北）」＝立刻上線。不給的話 newsroom-write 會退回
 * 「下一個還沒有文章的日子」，而日更早把未來一週佔滿，結果會排到八天後才見天日——
 * 那不是全自動上架。自動線一律用系統時間蓋日期（docs/automation-invariants.md）。
 */
export function writeAndPublish(s, { tmpPrefix }) {
  const dir = mkdtempSync(join(tmpdir(), tmpPrefix));
  const jobPath = join(dir, 'job.json');
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

/**
 * 上架回報發 Slack。一律「一篇一行、標題帶連結」（站長 2026-08-08 裁示：自動上架訊息不可只報篇數）。
 * 刻意不走 suggestionBlocks：那是給「還沒寫的候選」用的，會渲染切角/依據並掛上「我要寫這題」鈕，
 * 對已經上架的文章既沒有連結、按鈕也是誤導。
 *
 * 作法沿用兩支雷達原本的：寫 payload 到 /tmp JSON → spawn scripts/slack-post.mjs → 驗 `sent ts=`。
 * heading／notifyTitle 由呼叫端帶完整 mrkdwn（含 emoji 與粗體記號），本函式只補共用的說明句與篇數。
 */
export function postToSlack(published, { category, heading, notifyTitle, sourceNote, payloadPath }) {
  const list = published.map((s) => `• <${s.url}|${s.title}>`).join('\n');
  const body = `${heading}\n${sourceNote}，以下已自動撰寫並上架。要改就進編輯器。\n\n${list}`;
  const payload = {
    category,
    text: `${notifyTitle}（已上架 ${published.length} 篇）`,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: body } }],
  };
  writeFileSync(payloadPath, JSON.stringify(payload));
  const r = spawnSync('node', ['scripts/slack-post.mjs', payloadPath], { encoding: 'utf8' });
  const ok = r.status === 0 && /sent ts=/.test(r.stdout || '');
  const label = `${CATEGORY_NAMES[category] || category}台`;
  if (!ok) console.error(`  ✖ ${label}發送失敗：${(r.stderr || r.stdout || '').trim().slice(0, 200)}`);
  return ok;
}

// ── 全源抓取失敗的告警節流 ──────────────────────────────────────────────────
//
// 🔴 **一波故障的第 1 輪一定要報，之後才節流**——只看「距上次報過多久」會讓
// 「剛壞掉」與「壞了一整夜」長得一模一樣。2026-08-08 站長收到一則 ❌ 無法判斷那是
// 單次還是連續第 8 輪，得翻 log 才知道，所以訊息一律帶連續輪數與起始時間。
// state 檔一雷達一份（路徑由呼叫端帶入，測試可注入暫存路徑），與各自的 seen 帳本同一個目錄。

const ALERT_COOLDOWN_MS = 6 * 3600 * 1000;
// 隔太久沒失敗就算新一波（cron 停擺／主機重開後不該把舊 streak 接著算）。
const STREAK_GAP_MS = 6 * 3600 * 1000;

/** 各雷達的告警 state 檔預設路徑（key 例：'forum'、'golf'）。 */
export function fetchAlertPath(key) {
  return join(
    process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'),
    'appi-news', `${key}-fetch-alert.json`,
  );
}

function readAlertState(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')) || {}; } catch { return {}; }
}

function writeAlertState(path, state) {
  try {
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, JSON.stringify(state));
  } catch { /* 寫不進去不影響本輪判斷，寧可多報不可不報 */ }
}

/**
 * 記一次「全源抓取失敗」，回報這一波的連續狀況與這輪該不該出聲。
 * 寫不進帳本時 streak 會退回 1、shouldAlert 恆真——寧可多報不可不報。
 *
 * `persist=false`（dry-run）只算不寫：手動跑 dry-run 剛好撞上故障時，
 * 若寫進帳本會把 lastAlertMs 蓋成現在，**吃掉下一輪 cron 的告警**。
 */
export function noteFetchFailure(path, now = Date.now(), { persist = true } = {}) {
  const prev = readAlertState(path);
  const continued = prev.lastFailMs && now - prev.lastFailMs <= STREAK_GAP_MS;
  const streak = continued ? (prev.streak || 1) + 1 : 1;
  const streakStartMs = continued ? (prev.streakStartMs || now) : now;
  // 第 1 輪一定報；同一波之後每 ALERT_COOLDOWN_MS 才再報一次。
  const shouldAlert = streak === 1 || now - (prev.lastAlertMs || 0) >= ALERT_COOLDOWN_MS;
  if (persist) {
    writeAlertState(path, {
      streak,
      streakStartMs,
      lastFailMs: now,
      lastAlertMs: shouldAlert ? now : (prev.lastAlertMs || 0),
    });
  }
  return { streak, streakStartMs, shouldAlert, elapsedMs: now - streakStartMs };
}

/** 抓得到東西就結束這一波，下次失敗要從第 1 輪重新算（也才會立刻出聲）。 */
export function clearFetchFailure(path) {
  const prev = readAlertState(path);
  if (prev.lastFailMs) writeAlertState(path, {});
}

export function describeStreak({ streak, streakStartMs, elapsedMs }) {
  const hours = elapsedMs / 3600000;
  const span = hours < 1 ? '不到 1 小時' : `約 ${Math.round(hours)} 小時`;
  const since = new Date(streakStartMs).toISOString().slice(0, 16).replace('T', ' ');
  return streak === 1
    ? '本波第 1 輪（剛開始失敗）'
    : `連續第 ${streak} 輪、${span}（起於 ${since} UTC）`;
}
