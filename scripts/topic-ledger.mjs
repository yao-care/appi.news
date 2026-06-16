// 「已推薦候選題」滾動帳本：讓選題雷達（daily-tech-radar / weekly-report）跨次去重。
//
// 為什麼需要：原本去重只比對 author-memory.json（已寫的文章），不記「推薦過但還沒寫」的候選題。
// 一天一次時影響小，但一天多次會在幾小時內重掃同批熱題、狂推重複。此帳本補上這個破口。
//
// 設計：
//   - 帳本放 git 工作區外（預設 ~/.local/state/appi-news/suggested-topics.json），
//     避免弄髒 repo → 踩到 newsroom-write --go 的「工作區乾淨」檢查。
//   - 純函式（normalizeKey / mergeSuggestions / prune / recentLines）可單元測試；CLI 是薄殼。
//   - 去重主力仍是模型語意比對：`recent` 把近期清單印出來餵進 prompt，雷達自行排除「實質重複」。
//     normalizeKey 只做廉價的字面去重（避免帳本自己存重複列），抓不到改寫，那交給模型。
//
// 用法：
//   node scripts/topic-ledger.mjs recent [windowDays]      # 印近 N 天推薦過的題（餵進雷達 prompt）
//   node scripts/topic-ledger.mjs append <payload.json>    # 把 payload.suggestions 記進帳本（發送成功後才跑）
//
// 環境變數：TOPIC_LEDGER_PATH 可覆寫帳本路徑（測試用）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const WINDOW_DAYS = 14; // recent：去重比對窗（近 N 天推薦過的都排除）
const RETENTION_DAYS = 45; // append：超過 N 天的舊紀錄砍掉，帳本不無限長大

export function ledgerPath() {
  return (
    process.env.TOPIC_LEDGER_PATH ||
    join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'suggested-topics.json')
  );
}

/** 台北日期 YYYY-MM-DD（帳本內部用；只影響滾動窗的天數計算）。 */
export function taipeiToday(now = new Date()) {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }); // en-CA = ISO 格式
}

/** 標題正規化成廉價比對 key：NFKC + 轉小寫 + 去空白/標點/符號。只擋字面重複，改寫交給模型。 */
export function normalizeKey(title) {
  return String(title ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

function daysBetween(a, b) {
  return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 86400000);
}

/** 把新建議併入帳本：同 key 已存在就跳過（不重複存列），新的補上 date。回傳新陣列。 */
export function mergeSuggestions(ledger, suggestions, date) {
  const out = Array.isArray(ledger) ? ledger.slice() : [];
  const seen = new Set(out.map((e) => e.key));
  for (const s of Array.isArray(suggestions) ? suggestions : []) {
    const title = s && s.title;
    if (!title) continue;
    const key = normalizeKey(title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ date, title: String(title), key, category: s.category ?? null, subcategory: s.subcategory ?? null });
  }
  return out;
}

/** 砍掉超過 retentionDays 的舊紀錄（以 today 為基準）。 */
export function prune(ledger, today, retentionDays = RETENTION_DAYS) {
  return (Array.isArray(ledger) ? ledger : []).filter((e) => e.date && daysBetween(today, e.date) <= retentionDays);
}

/** 近 windowDays 推薦過的題，組成餵 prompt 的文字（新到舊）。空則回提示字串。 */
export function recentLines(ledger, today, windowDays = WINDOW_DAYS) {
  const rows = (Array.isArray(ledger) ? ledger : [])
    .filter((e) => e.date && daysBetween(today, e.date) <= windowDays)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  if (rows.length === 0) return '（近期無推薦紀錄）';
  return rows.map((e) => `- [${e.date}]${e.subcategory ? ` (${e.subcategory})` : ''} ${e.title}`).join('\n');
}

// ───────────────────────── CLI 薄殼 ─────────────────────────

function readLedger(path) {
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(j) ? j : [];
  } catch {
    return []; // 不存在/壞檔 → 當空帳本，不致命
  }
}

function writeLedger(path, ledger) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(ledger, null, 2) + '\n');
}

function main() {
  const [cmd, arg] = process.argv.slice(2);
  const path = ledgerPath();
  const today = taipeiToday();

  if (cmd === 'recent') {
    const windowDays = Number(arg) > 0 ? Number(arg) : WINDOW_DAYS;
    process.stdout.write(recentLines(readLedger(path), today, windowDays) + '\n');
    return;
  }

  if (cmd === 'append') {
    if (!arg) {
      console.error('用法：node scripts/topic-ledger.mjs append <payload.json>');
      process.exit(1);
    }
    let payload;
    try {
      payload = JSON.parse(readFileSync(arg, 'utf8'));
    } catch (e) {
      console.error(`讀不到/解析不了 payload ${arg}：${e.message}`);
      process.exit(1);
    }
    const before = readLedger(path);
    const merged = prune(mergeSuggestions(before, payload.suggestions, today), today);
    writeLedger(path, merged);
    console.log(`ledger appended：+${merged.length - prune(before, today).length} 筆，共 ${merged.length} 筆（${path}）`);
    return;
  }

  console.error('用法：node scripts/topic-ledger.mjs <recent [windowDays] | append <payload.json>>');
  process.exit(1);
}

// 只有「直接執行」才跑 CLI；被 import（測試）時不執行。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
