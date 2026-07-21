#!/usr/bin/env node
// verify-dethin.mjs — 存量去 AI 腔批次改稿的「確定性驗收」（一次性工具，非常駐 gate）。
//
// 逐篇比對 git HEAD 版 vs 工作區版，機械確認 LLM 只動了正文、沒破壞結構：
//   1. frontmatter（首兩個 --- 之間）必須逐字不變（agent 不准碰）。
//   2. 原文每個 URL 都還在（不准刪連結；允許新增，理論上不會）。
//   3. <img> 標籤數不變（不准刪圖）。
//   4. 正文不得殘留破折號（—/―）。
// 任何一項不過 → 印出、列入 FAIL 清單（呼叫端據此 git checkout 還原該檔）。
// 用法：node scripts/verify-dethin.mjs <files.json 路徑>

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const listPath = process.argv[2];
if (!listPath) { console.error('用法：node scripts/verify-dethin.mjs <files.json>'); process.exit(2); }
const files = JSON.parse(readFileSync(listPath, 'utf8'));

const fmOf = (s) => { const m = s.match(/^---\n[\s\S]*?\n---\n/); return m ? m[0] : ''; };
const bodyOf = (s) => { const m = s.match(/^---\n[\s\S]*?\n---\n/); let b = m ? s.slice(m[0].length) : s; return b.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']').replace(/\bhttps?:\/\/\S+/g, '').replace(/<[^>]+>/g, ' '); };
const urls = (s) => (s.match(/https?:\/\/[^\s)<>"']+/g) || []).map((u) => u.replace(/[.,)]+$/, '')).sort();
const imgs = (s) => (s.match(/<img\b/g) || []).length;
const headVersion = (f) => { try { return execSync(`git show HEAD:${f}`, { encoding: 'utf8' }); } catch { return null; } };

const fails = [];
let changed = 0, unchanged = 0;
for (const f of files) {
  const now = readFileSync(f, 'utf8');
  const old = headVersion(f);
  if (old === null) { fails.push([f, 'HEAD 無此檔（新檔？跳過）']); continue; }
  if (old === now) { unchanged++; continue; }
  changed++;
  const problems = [];
  if (fmOf(old) !== fmOf(now)) problems.push('frontmatter 被改動');
  const oldU = new Set(urls(old)); const nowU = new Set(urls(now));
  const dropped = [...oldU].filter((u) => !nowU.has(u));
  if (dropped.length) problems.push(`掉了 ${dropped.length} 個連結：${dropped.slice(0, 3).join(' , ')}`);
  if (imgs(old) !== imgs(now)) problems.push(`<img> 數變了：${imgs(old)}→${imgs(now)}`);
  if (/[—―]/.test(bodyOf(now))) problems.push('正文仍殘留破折號');
  if (problems.length) fails.push([f, problems.join('；')]);
}

console.log(`\n驗收 ${files.length} 篇：改動 ${changed}、未動 ${unchanged}、FAIL ${fails.length}`);
for (const [f, why] of fails) console.log(`  ✗ ${f} — ${why}`);
if (fails.length) {
  console.log('\n以上 FAIL 建議 git checkout 還原後重跑或人工處理。');
  // 印出可直接複製的還原指令
  console.log('還原：git checkout -- ' + fails.map(([f]) => f).join(' '));
}
process.exit(0);
