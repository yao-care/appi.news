// 「影片心得」線的已見帳本：記錄曾經當過候選的 videoId，讓每日只看新片、不重覆寫同一支。
// 與 civic-ledger 同構但獨立檔案（不同用途、不共用命名空間）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const LEDGER_PATH = process.env.VIDEO_LEDGER_PATH
  || join(homedir(), '.local/state/appi-news/video-seen.json');
const PRUNE_DAYS = 60;

/** 讀帳本 → { videoId: isoSeenAt }。缺檔/壞檔回空物件（不致命）。 */
export function loadSeen(path = LEDGER_PATH) {
  try {
    const obj = JSON.parse(readFileSync(path, 'utf8'));
    return obj && typeof obj === 'object' ? obj : {};
  } catch { return {}; }
}

/** 過濾出「不在帳本」的新候選（依 videoId 去重）。純函式。 */
export function filterNew(candidates = [], seen = {}) {
  return candidates.filter((c) => c && c.videoId && !seen[c.videoId]);
}

/** 把這批候選記進帳本＋剪除逾 60 天舊紀錄，寫回。回寫入後的帳本物件。 */
export function recordSeen(candidates = [], { path = LEDGER_PATH, nowIso } = {}) {
  const now = nowIso || new Date().toISOString();
  const seen = loadSeen(path);
  for (const c of candidates) if (c && c.videoId) seen[c.videoId] = now;
  const cutoff = Date.now() - PRUNE_DAYS * 86400000;
  for (const [id, iso] of Object.entries(seen)) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t) && t < cutoff) delete seen[id];
  }
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(seen, null, 0));
  } catch { /* 寫入失敗不致命：下一輪頂多重複一次 */ }
  return seen;
}

export { LEDGER_PATH };
