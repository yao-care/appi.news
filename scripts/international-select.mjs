// 國際編譯台「選題引擎」CLI：下載近 N 小時的 GDELT Events 檔 → 解析 → 每區挑相對熱門題。
// 純邏輯在 scripts/lib/international-select.mjs（可單元測試）；這裡只做下載與輸出。
//
// 用法：
//   node scripts/international-select.mjs                  # 預設近 24h、每區最多 3 則，印出選題
//   node scripts/international-select.mjs --hours 6        # 縮短視窗（快測）
//   node scripts/international-select.mjs --max 2 --json   # 每區上限 2、輸出 JSON（給下游撰寫用）
//
// GDELT Events 原始檔：免費、無 API 流量限制（http://data.gdeltproject.org/gdeltv2/）。

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseEventRow, selectHotByRegion, REGIONS } from './lib/international-select.mjs';

const UA = 'Mozilla/5.0 (appi-news intl-radar)';
const BASE = 'http://data.gdeltproject.org/gdeltv2';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const has = (n) => process.argv.includes(`--${n}`);

/** 取最新 export 檔的時間戳（YYYYMMDDHHMMSS）。 */
function latestStamp() {
  const r = spawnSync('curl', ['-s', '-A', UA, `${BASE}/lastupdate.txt`], { encoding: 'utf8' });
  const m = (r.stdout || '').match(/(\d{14})\.export\.CSV\.zip/);
  if (!m) throw new Error('取不到 lastupdate（GDELT 不可達？）');
  return m[1];
}

/** 從某時間戳往前推 count 個 15 分鐘，回傳時間戳陣列（新到舊）。 */
function priorStamps(latest, count) {
  const y = +latest.slice(0, 4), mo = +latest.slice(4, 6) - 1, d = +latest.slice(6, 8);
  const h = +latest.slice(8, 10), mi = +latest.slice(10, 12);
  const base = Date.UTC(y, mo, d, h, mi, 0);
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = new Date(base - i * 15 * 60 * 1000);
    const p = (n) => String(n).padStart(2, '0');
    out.push(`${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}00`);
  }
  return out;
}

/** 下載 + 解壓一個 export 檔，回傳 CSV 文字（失敗回 ''）。 */
function fetchExport(stamp, dir) {
  const zip = join(dir, `${stamp}.zip`);
  const dl = spawnSync('curl', ['-s', '-A', UA, `${BASE}/${stamp}.export.CSV.zip`, '-o', zip], { encoding: 'utf8' });
  if (dl.status !== 0) return '';
  const un = spawnSync('unzip', ['-p', zip], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return un.status === 0 ? un.stdout || '' : '';
}

function main() {
  const hours = Number(arg('hours', '24'));
  const maxPer = Number(arg('max', '3'));
  const asJson = has('json');
  const count = Math.round(hours * 4);

  const latest = latestStamp();
  const stamps = priorStamps(latest, count);
  const dir = mkdtempSync(join(tmpdir(), 'gdelt-'));
  if (!asJson) console.error(`下載近 ${hours}h（${count} 檔），最新 ${latest}…`);

  const events = [];
  let ok = 0;
  try {
    for (const s of stamps) {
      const csv = fetchExport(s, dir);
      if (!csv) continue;
      ok++;
      for (const line of csv.split('\n')) {
        if (!line) continue;
        const e = parseEventRow(line.split('\t'));
        if (e) events.push(e);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  if (!asJson) console.error(`成功讀取 ${ok}/${count} 檔，事件列 ${events.length} 筆。`);

  const picks = selectHotByRegion(events, maxPer);

  if (asJson) {
    process.stdout.write(JSON.stringify({ window_hours: hours, latest, picks }, null, 2) + '\n');
    return;
  }
  console.log(`\n===== 國際選題（近 ${hours}h，每區最多 ${maxPer} 則，相對熱門）=====`);
  for (const r of REGIONS) {
    const list = picks[r];
    if (!list.length) { console.log(`\n【${r}】（當天無突出熱題，略過）`); continue; }
    console.log(`\n【${r}】`);
    for (const s of list) {
      console.log(`  · 熱度 ${s.numArticles} 篇 / ${s.numSources} 來源 | ${s.fullName}`);
      console.log(`    ${s.sourceUrl}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
}
