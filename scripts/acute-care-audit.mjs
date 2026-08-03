#!/usr/bin/env node
// 急性症狀衛教線的逐篇合規稽核：對線上頁面驗 BOUNDARY 的每一條。
//
// 為什麼要有這支：這條線的內容涉及居家醫療處置，「build 過了」只代表格式沒錯，
// 不代表寫作界線有守住。BOUNDARY 的六條要求（就醫警訊獨立成節且置前、不給劑量、
// 不做個別診斷、特殊族群單列、來源等級、文首文末提醒）都要能被機械檢查一次看完，
// 否則只能靠人抽驗，而抽驗會漏。
//
// 用法：node scripts/acute-care-audit.mjs            # 驗線上
//       node scripts/acute-care-audit.mjs --local    # 驗本地 dist/

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TOPICS } from './lib/acute-care.mjs';

const LOCAL = process.argv.includes('--local');
const BASE = 'https://appi.news';

/** 抓一頁的 HTML（線上或本地 dist）。回 {status, html}。 */
async function fetchPage(slug) {
  if (LOCAL) {
    const p = join('dist/articles', slug, 'index.html');
    return existsSync(p) ? { status: 200, html: readFileSync(p, 'utf8') } : { status: 404, html: '' };
  }
  const r = await fetch(`${BASE}/articles/${slug}/?cb=${Date.now()}`);
  return { status: r.status, html: r.ok ? await r.text() : '' };
}

/** 去掉標籤，留純文字（用來判「就醫警訊出現在文章的哪個位置」）。 */
const textOf = (html) => {
  const body = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html;
  return body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
};

// 劑量樣式：數字＋單位／服用頻次。BOUNDARY 第 3 條禁止。
// 刻意**不**攔「10 到 15 分鐘」這種處置時間、也不攔溫度與濃度（0.9% 生理食鹽水），
// 那些是操作說明不是用藥指示；只攔藥物劑量與服用頻次。
//
// `mg/dL` 等**濃度**單位要排除：低血糖那篇寫「血糖低於 70 mg/dl」是判斷閾值，
// 不是叫人吃 70 毫克的藥。2026-08-03 首跑就是被這個誤判成唯一一筆不合規。
const DOSAGE = [
  /\d+\s*(?:毫克|mg|公絲)(?!\s*\/\s*(?:dl|dL|l|L|ml|mL|kg))\b/i,
  /(?:每日|一天|每天)\s*\d+\s*(?:顆|錠|粒|包)/,
  /\d+\s*(?:顆|錠|粒)\s*(?:止痛藥|普拿疼|藥)/,
];

// 個別診斷樣式：直接把症狀判成病名。BOUNDARY 第 2 條禁止。
const DIAGNOSIS = [/你(?:這種情況|的症狀)(?:就)?是/, /這(?:種情形|樣)(?:就)?是[^，。]{0,8}(?:症|病|炎)\b/];

// 暗示可取代就醫。BOUNDARY 第 4 條禁止。
const REPLACE_CARE = [/就不用(?:看醫生|就醫|去醫院)/, /免去(?:跑一趟|就醫)/, /不必(?:看醫生|就醫)/];

const results = [];
for (const t of TOPICS) {
  const { status, html } = await fetchPage(t.key);
  const r = { key: t.key, caution: !!t.caution, status, issues: [], ok: true };
  if (status !== 200) {
    r.issues.push(`HTTP ${status}`); r.ok = false; results.push(r); continue;
  }
  const text = textOf(html);
  const len = text.length;

  // ① 就醫警訊必須存在，且落在前三分之一
  const seekIdx = text.search(/立刻就醫|盡快就醫|馬上就醫|立即就醫|撥打\s*119|要就醫/);
  if (seekIdx < 0) { r.issues.push('找不到就醫警訊'); r.ok = false; }
  else if (seekIdx > len / 3) r.issues.push(`就醫警訊偏後（${Math.round((seekIdx / len) * 100)}% 處，應在前 33%）`);

  // ② 不得出現藥物劑量
  for (const re of DOSAGE) { const m = text.match(re); if (m) { r.issues.push(`疑似劑量：「${m[0]}」`); r.ok = false; } }

  // ③ 不得做個別診斷
  for (const re of DIAGNOSIS) { const m = text.match(re); if (m) { r.issues.push(`疑似個別診斷：「${m[0]}」`); r.ok = false; } }

  // ④ 不得暗示可取代就醫
  for (const re of REPLACE_CARE) { const m = text.match(re); if (m) { r.issues.push(`疑似取代就醫：「${m[0]}」`); r.ok = false; } }

  // ⑤ 特殊族群要提到
  const groups = ['兒童', '幼兒', '小孩', '孕婦', '懷孕', '慢性病', '長期服藥', '長者', '嬰兒'];
  if (!groups.some((g) => text.includes(g))) { r.issues.push('未提及兒童／孕婦／慢性病等特殊族群'); r.ok = false; }

  // ⑥ 來源：外部參考連結數（政府／學會／期刊等級靠人看，這裡只驗有沒有附）
  const refs = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1])
    .filter((u) => !u.includes('appi.news') && !u.includes('facebook.com') && !u.includes('twitter.com') && !u.includes('line.me'));
  r.refs = new Set(refs).size;
  if (r.refs < 2) { r.issues.push(`外部來源只有 ${r.refs} 條`); r.ok = false; }

  // ⑦ 醫療免責聲明
  if (!/不能取代|不構成|請諮詢|由醫師/.test(text)) { r.issues.push('未見醫療免責語'); r.ok = false; }

  results.push(r);
}

const pass = results.filter((r) => r.ok && r.issues.length === 0);
const warn = results.filter((r) => r.ok && r.issues.length > 0);
const fail = results.filter((r) => !r.ok);

for (const r of results) {
  const mark = !r.ok ? '✗' : r.issues.length ? '⚠' : '✓';
  console.log(`${mark} ${r.caution ? '⚑' : ' '} ${r.key.padEnd(30)} HTTP ${r.status}  來源 ${String(r.refs ?? '-').padStart(2)} 條${r.issues.length ? '  ｜ ' + r.issues.join('；') : ''}`);
}
console.log(`\n共 ${results.length} 篇：✓ 完全通過 ${pass.length}｜⚠ 有提醒 ${warn.length}｜✗ 未通過 ${fail.length}`);
process.exit(fail.length ? 1 : 0);
