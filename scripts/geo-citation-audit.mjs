// GEO / AI 引用量測閉環（ledger + 週報實查）。
//
// 為什麼：沒有 AI 引擎 API 金鑰，無法自動跑「問 AI、看有沒有引用 appi.news」。
// 所以拆兩段：
//   1. questions  ── 從本站近期主打主題（seo-opportunities 的 searchDemandTopics + 既有文章標題）
//                    產出「讀者會問 AI 的自然語言問題」清單（JSON），給人/skill 拿去問 AI 引擎。
//   2. record     ── 把一輪量測結果（每題：問了哪個引擎、是否引用 appi.news、引用排序/連結）追加進帳本。
//   3. recent     ── 印近期帳本摘要（被引用率趨勢），供週報「🤖 AI 引用量測」段落引用。
//
// 帳本放 git 工作區外（比照 topic-ledger）：~/.local/state/appi-news/geo-citation-ledger.json
// 帳本結構：{ rounds: [ { date, engine?, items: [ { question, engine, cited(bool), rank?(num), url?(str) } ] } ] }
//
// 注意：這量到的是「本站被 AI 引擎引用」（GEO/AEO），與 GA 的「AI 轉介點擊」（真人從 AI 答案點連結進站）不同。
//
// 用法：
//   node scripts/geo-citation-audit.mjs questions [n]          # 產 5~8 題（預設 6）；讀 GSC 需 GOOGLE_APPLICATION_CREDENTIALS
//   node scripts/geo-citation-audit.mjs record <round.json>    # 追加一輪量測結果
//   node scripts/geo-citation-audit.mjs recent [windowDays]    # 印近 N 天（預設 30）被引用率摘要
//
// 環境變數：GEO_LEDGER_PATH 可覆寫帳本路徑（測試用）。

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_QUESTIONS = 6;
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 8;
const RECENT_WINDOW_DAYS = 30;
const RETENTION_DAYS = 180; // 帳本保留半年趨勢，超過砍掉

const ARTICLES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'articles');

export function ledgerPath() {
  return (
    process.env.GEO_LEDGER_PATH ||
    join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'geo-citation-ledger.json')
  );
}

/** 台北日期 YYYY-MM-DD。 */
export function taipeiToday(now = new Date()) {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

function daysBetween(a, b) {
  return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000);
}

// ───────────────────────── questions：產問題清單 ─────────────────────────

/** 取近期文章標題（quote-agnostic 解析 frontmatter title），新到舊，最多 limit 個。 */
export function recentArticleTitles(dir = ARTICLES_DIR, limit = 20) {
  let files;
  try {
    files = readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
  } catch {
    return [];
  }
  const out = [];
  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const m = fm[1].match(/^title:[ \t]*(.+?)[ \t]*$/m);
    const date = (fm[1].match(/^publishDate:[ \t]*(.+?)[ \t]*$/m) || [])[1];
    if (!m) continue;
    out.push({ title: m[1].replace(/^["']|["']$/g, '').trim(), date: (date || '').replace(/^["']|["']$/g, '').trim() });
  }
  return out
    .filter((a) => a.title)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

/**
 * 把搜尋需求題 + 文章標題揉成「讀者會問 AI 的自然語言問題」。
 * 純啟發式包裝（不需 LLM）：搜尋 query 直接當問題核心；文章標題取冒號前主詞。
 * demandTopics：[{query, impressions, ...}]；titles：[{title}]。
 */
export function buildQuestions(demandTopics = [], titles = [], n = DEFAULT_QUESTIONS) {
  const count = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, n));
  const seen = new Set();
  const questions = [];
  const push = (q, source) => {
    const key = q.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
    if (!key || seen.has(key)) return;
    seen.add(key);
    questions.push({ question: q, source });
  };

  // 先吃搜尋需求（讀者真的在搜的）：包成自然語言問句。
  for (const t of demandTopics) {
    if (questions.length >= count) break;
    const q = String(t.query || '').trim();
    if (!q) continue;
    push(q.endsWith('?') || q.endsWith('？') ? q : `${q}是什麼？有哪些重點？`, 'search-demand');
  }
  // 不足再用文章標題補（冒號前主詞）。
  for (const a of titles) {
    if (questions.length >= count) break;
    const head = String(a.title || '').split(/[:：]/)[0].trim();
    if (!head) continue;
    push(`${head}是怎麼回事？`, 'article-title');
  }
  return questions.slice(0, count);
}

// ───────────────────────── record / recent：帳本讀寫與摘要 ─────────────────────────

export function readLedger(path) {
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    return j && Array.isArray(j.rounds) ? j : { rounds: [] };
  } catch {
    return { rounds: [] };
  }
}

function writeLedger(path, ledger) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(ledger, null, 2) + '\n');
}

/** 砍掉超過 retentionDays 的舊輪次。 */
export function pruneRounds(ledger, today, retentionDays = RETENTION_DAYS) {
  const rounds = (ledger?.rounds ?? []).filter((r) => r.date && daysBetween(today, r.date) <= retentionDays);
  return { rounds };
}

/** 正規化一輪量測（補 date、強制 items 欄位型別）。 */
export function normalizeRound(round, today) {
  const items = (Array.isArray(round?.items) ? round.items : []).map((it) => ({
    question: String(it.question ?? ''),
    engine: String(it.engine ?? round?.engine ?? 'unknown'),
    cited: Boolean(it.cited),
    rank: it.rank == null ? null : Number(it.rank),
    url: it.url == null ? null : String(it.url),
  }));
  return { date: round?.date || today, engine: round?.engine ?? null, items };
}

/** 近 windowDays 的被引用率摘要：總題數/被引用題數/比率，依輪次與引擎細分。 */
export function recentSummary(ledger, today, windowDays = RECENT_WINDOW_DAYS) {
  const rounds = (ledger?.rounds ?? [])
    .filter((r) => r.date && daysBetween(today, r.date) <= windowDays)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  let total = 0;
  let cited = 0;
  const byEngine = {};
  const examples = [];
  for (const r of rounds) {
    for (const it of r.items ?? []) {
      total += 1;
      const e = it.engine || 'unknown';
      byEngine[e] = byEngine[e] || { total: 0, cited: 0 };
      byEngine[e].total += 1;
      if (it.cited) {
        cited += 1;
        byEngine[e].cited += 1;
        if (examples.length < 5) examples.push({ date: r.date, engine: e, question: it.question, rank: it.rank, url: it.url });
      }
    }
  }
  return {
    windowDays,
    rounds: rounds.length,
    totalQuestions: total,
    citedQuestions: cited,
    citedRate: total ? Math.round((cited / total) * 100) / 100 : null,
    byEngine,
    perRound: rounds.map((r) => {
      const t = (r.items ?? []).length;
      const c = (r.items ?? []).filter((x) => x.cited).length;
      return { date: r.date, total: t, cited: c, rate: t ? Math.round((c / t) * 100) / 100 : null };
    }),
    examples,
  };
}

// ───────────────────────── CLI 薄殼 ─────────────────────────

async function cmdQuestions(n) {
  let demandTopics = [];
  try {
    const { run } = await import('./seo-opportunities.mjs');
    const out = await run();
    demandTopics = out.searchDemandTopics || [];
  } catch (e) {
    // GSC 抓不到（缺金鑰/網路）→ 降級只用文章標題，不致命。
    process.stderr.write(`（seo-opportunities 取需求題失敗，降級用文章標題）：${e.message}\n`);
  }
  const titles = recentArticleTitles();
  const questions = buildQuestions(demandTopics, titles, n);
  console.log(
    JSON.stringify(
      {
        date: taipeiToday(),
        note: '把這些問題拿去問 Perplexity / Gemini / Google AI 概覽等，觀察 appi.news 是否被引用，再用 record 子指令記回帳本。',
        questions,
      },
      null,
      2,
    ),
  );
}

function cmdRecord(file) {
  if (!file) {
    console.error('用法：node scripts/geo-citation-audit.mjs record <round.json>');
    process.exit(1);
  }
  let round;
  try {
    round = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`讀不到/解析不了 ${file}：${e.message}`);
    process.exit(1);
  }
  const path = ledgerPath();
  const today = taipeiToday();
  const ledger = readLedger(path);
  ledger.rounds.push(normalizeRound(round, today));
  const pruned = pruneRounds(ledger, today);
  writeLedger(path, pruned);
  const last = pruned.rounds[pruned.rounds.length - 1];
  const c = last.items.filter((x) => x.cited).length;
  console.log(`ledger recorded：${last.date} 共 ${last.items.length} 題、被引用 ${c} 題（${path}）`);
}

function cmdRecent(windowDays) {
  const path = ledgerPath();
  const today = taipeiToday();
  const summary = recentSummary(readLedger(path), today, windowDays > 0 ? windowDays : RECENT_WINDOW_DAYS);
  console.log(JSON.stringify(summary, null, 2));
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === 'questions') return cmdQuestions(Number(arg) || DEFAULT_QUESTIONS);
  if (cmd === 'record') return cmdRecord(arg);
  if (cmd === 'recent') return cmdRecent(Number(arg));
  console.error('用法：node scripts/geo-citation-audit.mjs <questions [n] | record <round.json> | recent [windowDays]>');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`geo-citation-audit 失敗：${e.message}`);
    process.exit(1);
  });
}
