// 便民市政「已見帳本」：記錄曾經當過候選的 RSS item 連結，讓每日只寫「新資料」。
// 純檔案 I/O（JSON），與 topic-ledger 分離（不同用途）。狀態存在使用者 state 目錄。

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const LEDGER_PATH = process.env.CIVIC_LEDGER_PATH
  || join(homedir(), '.local/state/appi-news/civic-seen.json');
const PRUNE_DAYS = 30;

/** 讀帳本 → { url: isoSeenAt }。缺檔/壞檔回空物件（不致命）。 */
export function loadSeen(path = LEDGER_PATH) {
  try {
    const obj = JSON.parse(readFileSync(path, 'utf8'));
    return obj && typeof obj === 'object' ? obj : {};
  } catch { return {}; }
}

/** 過濾出「不在帳本」的新候選（依 url 去重）。純函式。 */
export function filterNew(candidates = [], seen = {}) {
  return candidates.filter((c) => c && c.url && !seen[c.url]);
}

/**
 * 把這批候選 url 記進帳本（標記為今天已見）＋順手剪除逾 30 天舊紀錄，寫回。
 * nowIso 可注入（測試用）。回寫入後的帳本物件。
 */
export function recordSeen(candidates = [], { path = LEDGER_PATH, nowIso } = {}) {
  const now = nowIso || new Date().toISOString();
  const seen = loadSeen(path);
  for (const c of candidates) if (c && c.url) seen[c.url] = now;
  // 剪除逾期
  const cutoff = Date.now() - PRUNE_DAYS * 86400000;
  for (const [url, iso] of Object.entries(seen)) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t) && t < cutoff) delete seen[url];
  }
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(seen, null, 0));
  } catch { /* 寫入失敗不致命：下一輪頂多重複一次 */ }
  return seen;
}

export { LEDGER_PATH };
