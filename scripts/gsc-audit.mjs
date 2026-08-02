#!/usr/bin/env node
// GSC 結構稽核：把「站台在賺什麼字、哪些字被自家頁互打、轉址殘骸還吃多少曝光」一次算出來。
//
// 為什麼需要（跟 weekly-data.mjs 的分工）：
//   weekly-data.mjs 是**週報用**，只給 top 5 機會字、看的是「這週怎麼樣」。
//   本腳本是**結構稽核用**，看 90 天的長趨勢與跨頁關係，回答的是三個 weekly-data 答不了的問題：
//     1. 內容投資 vs 實際需求對不對得上（每分類每篇曝光）
//     2. 有沒有同一個字被自家多個 URL 瓜分（cannibalization）
//     3. 轉址殘骸（noindex 空殼）還持有多少曝光——即權重到底併過去了沒
//
// 2026-07-28 首次跑出來的結論見 docs/lessons/duplicate-topic-gate.md。
// **驗收用法**：那批修正（轉址頁去 noindex + 3 組整併）的效果要數週才顯現，
//   兩到四週後重跑本腳本，看「轉址殘骸曝光佔比」有沒有從 15% 往下掉、
//   健康長尾正本排名有沒有從 pos 76-83 往前移。
//
// 用法：
//   node scripts/gsc-audit.mjs [天數，預設 90]   # 完整稽核報告
//   node scripts/gsc-audit.mjs --verify          # 只出「對基準的驗收比較」（供 cron 發 Slack）
// 需要 ~/.config/appi-news/ga4-sa.json（同 weekly-data.mjs 的服務帳號）。
//
// ⚠️ --verify 為什麼同時看 90 天與 14 天：90 天窗每過一天只位移 1/90，修正後第 7 天
//    重跑 90 天指標只會位移 ~8%，被舊資料稀釋到看不出變化。真正的早期訊號在短窗
//    （修正後新產生的曝光）。所以兩個都印，並以短窗為早期判讀依據、90 天窗為最終驗收。

import { readFileSync, readdirSync } from 'node:fs';
import { loadServiceAccount, getAccessToken, gscQuery } from './lib/google-data.mjs';
import { GSC_SCOPE, GSC_SA_KEY_PATH } from './lib/report-config.mjs';

const VERIFY = process.argv.includes('--verify');
const DAYS = Number(process.argv.find((a) => /^\d+$/.test(a)) || 90);
const LAG = 3; // GSC 資料延遲約 2-3 天，往前推免得取到空窗
const ARTICLES_DIR = 'src/content/articles';

/**
 * 2026-07-28 修正（轉址頁去 noindex + 3 組整併）當下量到的基準，供日後比較。
 * **每個窗長各有自己的基準**——不同窗長的殘骸佔比本來就不同（短窗只含近期曝光，
 * 舊網址殘骸的比重天生較低），拿 14 天的值去比 90 天的基準會得到假訊號。
 * 兩個值都是修正部署當天量的，窗都結束於 2026-07-25，完全早於修正生效，故為乾淨的「修正前」讀數。
 */
const BASELINE = { date: '2026-07-28', d90: 16.7, d14: 8.0 };

const day = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const window = { startDate: day(DAYS + LAG), endDate: day(LAG) };

const sa = loadServiceAccount(GSC_SA_KEY_PATH); // GSC 專屬金鑰，非 GA4 那把
const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });

// 站上正本 slug（用來區分「真文章頁」與「轉址空殼」）——verify 與完整報告共用。
const canonicalSlugs = new Map();
for (const f of readdirSync(ARTICLES_DIR)) {
  if (!/\.mdx?$/.test(f)) continue;
  const head = readFileSync(`${ARTICLES_DIR}/${f}`, 'utf8').slice(0, 2000);
  const pick = (k) => (head.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)`, 'm')) || [])[1]?.trim();
  canonicalSlugs.set(pick('slug') || f.replace(/\.mdx?$/, ''), pick('category') || '?');
}
const slugFrom = (url) => decodeURIComponent(url).match(/\/articles\/([^/]+)\/?$/)?.[1];

/** 算一個時間窗的轉址殘骸佔比。 */
async function stubShare(days) {
  const w = { startDate: day(days + LAG), endDate: day(LAG) };
  const res = await gscQuery({ token, body: { ...w, dimensions: ['page'], rowLimit: 1000 } });
  let si = 0;
  let ri = 0;
  let sp = 0;
  for (const x of res.rows || []) {
    const s = slugFrom(x.keys[0]);
    if (!s) continue;
    if (canonicalSlugs.has(s)) ri += x.impressions;
    else {
      si += x.impressions;
      sp++;
    }
  }
  return { w, stubPages: sp, stubImpr: si, realImpr: ri, pct: si + ri ? (100 * si) / (si + ri) : 0 };
}

if (VERIFY) {
  const [long, short] = await Promise.all([stubShare(90), stubShare(14)]);
  // 容差 0.05 個百分點：避免四捨五入後相同的值被判成有變化。
  const arrow = (now, base) => {
    const d = now - base;
    if (Math.abs(d) < 0.05) return '⬜ 持平';
    return d < 0 ? `🟢 下降 ${Math.abs(d).toFixed(1)}pp` : `🔴 上升 ${d.toFixed(1)}pp`;
  };
  console.log(`📉 *轉址殘骸驗收*（基準＝${BASELINE.date} 修正前讀數，各窗長分開比）\n`);
  console.log(
    `*14 天窗* ${short.w.startDate}~${short.w.endDate}　←　早期訊號，先看這個\n` +
      `　殘骸 ${short.stubPages} 頁 / ${short.stubImpr} 曝光 → *${short.pct.toFixed(1)}%*　` +
      `${arrow(short.pct, BASELINE.d14)}（基準 ${BASELINE.d14}%）\n`,
  );
  console.log(
    `*90 天窗* ${long.w.startDate}~${long.w.endDate}　←　最終驗收，短期內幾乎不會動\n` +
      `　殘骸 ${long.stubPages} 頁 / ${long.stubImpr} 曝光 → *${long.pct.toFixed(1)}%*　` +
      `${arrow(long.pct, BASELINE.d90)}（基準 ${BASELINE.d90}%）\n` +
      `　⚠️ 90 天窗每天只位移 1/90，修正後第 7 天只換掉約 8% 的資料，看不出變化屬正常。\n`,
  );
  console.log(
    `判讀：殘骸佔比要往下走才代表 Google 開始把權重併回正本。若 14 天窗仍未下降，` +
      `多半是重新抓取還沒輪到（251 頁通常要數週），下次再看；若持續數週不動才需要檢討做法。\n` +
      `完整稽核：\`node scripts/gsc-audit.mjs\`　脈絡：docs/lessons/duplicate-topic-gate.md`,
  );
  process.exit(0);
}

const [byQuery, byPage, byQueryPage] = await Promise.all([
  gscQuery({ token, body: { ...window, dimensions: ['query'], rowLimit: 1000 } }),
  gscQuery({ token, body: { ...window, dimensions: ['page'], rowLimit: 1000 } }),
  gscQuery({ token, body: { ...window, dimensions: ['query', 'page'], rowLimit: 2000 } }),
]);

const rows = (r, keys) =>
  (r.rows || []).map((x) => {
    const o = {};
    keys.forEach((k, i) => (o[k] = x.keys[i]));
    return { ...o, clicks: x.clicks, impr: x.impressions, pos: +x.position.toFixed(1) };
  });

const q = rows(byQuery, ['query']);
const p = rows(byPage, ['page']);
const qp = rows(byQueryPage, ['query', 'page']);

// 正本 slug 對照與 slug 抽取共用上面 verify 區塊建好的那份，避免兩處各建一次而分歧。
const canonical = canonicalSlugs;
const slugOf = slugFrom;
const sum = (a, k) => a.reduce((s, r) => s + r[k], 0);

console.log(`\n=== GSC 結構稽核  ${window.startDate} ~ ${window.endDate}（${DAYS} 天）`);
console.log(`總計：${sum(p, 'clicks')} clicks / ${sum(p, 'impr')} impressions`);

// ── 1. 轉址殘骸佔比 ───────────────────────────────────────────────
let stub = { i: 0, c: 0, n: 0 };
let real = { i: 0, c: 0, n: 0 };
const stubs = [];
for (const r of p) {
  const s = slugOf(r.page);
  if (!s) continue;
  const bucket = canonical.has(s) ? real : stub;
  bucket.i += r.impr;
  bucket.c += r.clicks;
  bucket.n++;
  if (!canonical.has(s)) stubs.push({ s, ...r });
}
const stubPct = ((100 * stub.i) / (stub.i + real.i)).toFixed(1);
console.log(`\n【轉址殘骸】${stub.n} 頁，${stub.i} 曝光（佔文章曝光 ${stubPct}%）、${stub.c} 點擊`);
console.log(`  對照正本：${real.n} 頁，${real.i} 曝光、${real.c} 點擊`);
console.log(`  ⚑ 基準：2026-07-28 修正後＝133 頁 / 2,269 曝光 / 16.7%（修正前為 131 頁 / 2,208 / 15.0%，`);
console.log(`     差額是 appi-news-91、appi-news-82 整併後改列殘骸所致）。此數字應隨時間下降。`);
stubs
  .sort((a, b) => b.impr - a.impr)
  .slice(0, 8)
  .forEach((x) => console.log(`     i${String(x.impr).padStart(4)} pos${String(x.pos).padStart(5)}  ${x.s.slice(0, 46)}`));

// ── 2. 自家頁互打 ─────────────────────────────────────────────────
const perQuery = {};
for (const r of qp) {
  const s = slugOf(r.page);
  if (!s) continue;
  (perQuery[r.query] ??= []).push({ s, ...r });
}
const canni = Object.entries(perQuery)
  .filter(([, v]) => v.length > 1)
  .map(([query, v]) => ({ query, pages: v.sort((a, b) => b.impr - a.impr), total: sum(v, 'impr') }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 10);
console.log(`\n【自家頁互打】${Object.values(perQuery).filter((v) => v.length > 1).length} 個字被多頁瓜分，前 10：`);
for (const c of canni) {
  console.log(`  「${c.query}」總曝光 ${c.total}，${c.pages.length} 頁：`);
  c.pages.forEach((x) => console.log(`     i${String(x.impr).padStart(4)} pos${String(x.pos).padStart(5)}  ${x.s.slice(0, 46)}`));
}

// ── 3. 內容投資 vs 需求 ───────────────────────────────────────────
const catCount = {};
for (const c of canonical.values()) catCount[c] = (catCount[c] || 0) + 1;
const catPerf = {};
for (const r of p) {
  const s = slugOf(r.page);
  const cat = s && canonical.get(s);
  if (!cat) continue;
  (catPerf[cat] ??= { i: 0, c: 0 });
  catPerf[cat].i += r.impr;
  catPerf[cat].c += r.clicks;
}
console.log('\n【內容投資 vs 需求】');
console.log('  分類          文章數   曝光  點擊  每篇曝光');
Object.entries(catPerf)
  .sort((a, b) => b[1].i - a[1].i)
  .forEach(([k, v]) =>
    console.log(
      `  ${k.padEnd(14)}${String(catCount[k] || 0).padStart(5)}${String(v.i).padStart(7)}${String(v.c).padStart(6)}   ${(v.i / (catCount[k] || 1)).toFixed(1)}`,
    ),
  );

// ── 4. 沉睡金礦 / 高機會 ──────────────────────────────────────────
console.log('\n【沉睡金礦】曝光 ≥15 但排名 >50（有需求、排不上）');
q.filter((r) => r.impr >= 15 && r.pos > 50)
  .sort((a, b) => b.impr - a.impr)
  .slice(0, 12)
  .forEach((r) => console.log(`  i${String(r.impr).padStart(4)} pos${String(r.pos).padStart(5)}  ${r.query}`));

console.log('\n【差一步】曝光 ≥10、排名 11-25（推一把就上第一頁）');
q.filter((r) => r.impr >= 10 && r.pos >= 11 && r.pos <= 25)
  .sort((a, b) => b.impr - a.impr)
  .slice(0, 12)
  .forEach((r) => console.log(`  i${String(r.impr).padStart(4)} pos${String(r.pos).padStart(5)}  ${r.query}`));
console.log();
