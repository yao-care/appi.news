// 台灣國定假日 / 連假偵測：用行政院人事行政總處「辦公日曆表」開放資料（data.gov.tw #14718）。
// 純函式（parse/偵測）可單元測試；CLI 負責抓資料。連假優惠 roundup 用它判斷「即將到來的連假」，不硬編日期。
//
// 資料來源（已實測）：
//   - 資料集 API：https://data.gov.tw/api/v2/rest/dataset/14718（純 JSON，回 distribution[].resourceDownloadUrl）
//   - CSV 欄位：西元日期(YYYYMMDD), 星期, 是否放假(0=上班 2=放假), 備註（連假名稱在此）
//
// 用法：
//   node scripts/tw-holidays.mjs upcoming [withinDays]   # 印今天起 N 天內（預設10）的連假；無則印 NONE
//   node scripts/tw-holidays.mjs list                    # 印今明年所有連假（>=3 天）

import { pathToFileURL } from 'node:url';

const DATASET_API = 'https://data.gov.tw/api/v2/rest/dataset/14718';

/** 解析辦公日曆 CSV → [{date:'YYYYMMDD', isHoliday:bool, note}]。容錯：跳表頭與壞行。 */
export function parseCalendarCsv(text) {
  const out = [];
  const lines = String(text || '').replace(/^﻿/, '').split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(',');
    const date = (cols[0] || '').trim();
    if (!/^\d{8}$/.test(date)) continue; // 跳表頭/壞行
    out.push({ date, isHoliday: (cols[2] || '').trim() === '2', note: (cols[3] || '').trim() });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

function ymdToMs(ymd) {
  return Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8));
}
function daysBetween(a, b) {
  return Math.round((ymdToMs(a) - ymdToMs(b)) / 86400000);
}
function fmt(ymd) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

/** 找連假：連續放假日 >= minDays（預設 3，排除一般兩天週末）。回 [{start,end,days,name}]。 */
export function findLongWeekends(rows, minDays = 3) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length >= minDays) {
      const name = run.map((r) => r.note).find((n) => n) || '連假';
      out.push({ start: run[0].date, end: run[run.length - 1].date, days: run.length, name });
    }
    run = [];
  };
  for (const r of rows) {
    if (r.isHoliday && (run.length === 0 || daysBetween(r.date, run[run.length - 1].date) === 1)) {
      run.push(r);
    } else {
      flush();
      if (r.isHoliday) run = [r];
    }
  }
  flush();
  return out;
}

/** 今天起 withinDays 天內「即將到來或進行中」的最近連假；無則 null。 */
export function upcomingLongWeekend(rows, todayYmd, withinDays = 10) {
  const lws = findLongWeekends(rows);
  const cand = lws
    .filter((lw) => daysBetween(lw.end, todayYmd) >= 0 && daysBetween(lw.start, todayYmd) <= withinDays)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  return cand[0] || null;
}

// ───────────────────────── CLI ─────────────────────────

async function fetchCalendarRows() {
  const res = await fetch(DATASET_API, { headers: { 'user-agent': 'appi-news-holidays' } });
  if (!res.ok) throw new Error(`dataset API ${res.status}`);
  const j = await res.json();
  const dists = (j?.result?.distribution || []).filter((d) => /csv/i.test(d.resourceFormat || '') || /\.csv/i.test(d.resourceDownloadUrl || ''));
  if (!dists.length) throw new Error('找不到 CSV distribution');
  const byDate = new Map();
  for (const d of dists) {
    try {
      const r = await fetch(d.resourceDownloadUrl, { headers: { 'user-agent': 'appi-news-holidays' } });
      if (!r.ok) continue;
      for (const row of parseCalendarCsv(await r.text())) byDate.set(row.date, row);
    } catch { /* 跳過壞檔 */ }
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

function taipeiTodayYmd() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const rows = await fetchCalendarRows();
  if (cmd === 'list') {
    for (const lw of findLongWeekends(rows)) console.log(`${fmt(lw.start)} ~ ${fmt(lw.end)}（${lw.days}天）${lw.name}`);
    return;
  }
  // 預設 upcoming
  const within = Number(arg) > 0 ? Number(arg) : 10;
  const lw = upcomingLongWeekend(rows, taipeiTodayYmd(), within);
  if (!lw) { console.log('NONE'); return; }
  console.log(JSON.stringify({ name: lw.name, start: fmt(lw.start), end: fmt(lw.end), days: lw.days }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1); });
}
