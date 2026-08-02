#!/usr/bin/env node
/**
 * 一次性：把已寫入的 `risksAndLimits` / `expertNote` 裡中文夾的半形標點轉全形。
 *
 * 只動這兩個欄位（本輪由 LLM 回填產生的），**不碰內文與其他既有欄位**——
 * 存量內文的標點是歷史狀態，要不要一起清是另一個決定，不在這支的範圍。
 * 病灶與轉換條件見 scripts/lib/cjk-punct.mjs 檔頭。
 *
 * 用法：node scripts/fix-cjk-punct.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeCjkPunct } from './lib/cjk-punct.mjs';

const DIR = 'src/content/articles';
const DRY = process.argv.includes('--dry');

let changed = 0;
const samples = [];

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.md') || x.endsWith('.mdx'))) {
  const path = join(DIR, f);
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) continue;

  const before = m[1];
  const after = before
    .split('\n')
    .map((line) => {
      // 只處理這兩個欄位：expertNote 的值行，與 risksAndLimits 底下的陣列項。
      if (/^expertNote:\s/.test(line)) return normalizeCjkPunct(line);
      return line;
    })
    .join('\n');

  // risksAndLimits 是多行陣列，另外掃它的區塊
  const lines = after.split('\n');
  let inRisks = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^risksAndLimits:/.test(lines[i])) {
      inRisks = true;
      continue;
    }
    if (inRisks) {
      if (/^\s+-\s/.test(lines[i])) lines[i] = normalizeCjkPunct(lines[i]);
      else if (/^\S/.test(lines[i])) inRisks = false;
    }
  }
  const final = lines.join('\n');

  if (final === before) continue;
  changed++;
  if (samples.length < 3) {
    const b = before.split('\n').find((l, i) => l !== final.split('\n')[i]);
    const a = final.split('\n').find((l, i) => l !== before.split('\n')[i]);
    samples.push(`  ${f}\n    前：${b?.trim().slice(0, 78)}\n    後：${a?.trim().slice(0, 78)}`);
  }
  if (!DRY) writeFileSync(path, raw.replace(before, final));
}

console.log(`${DRY ? '[dry-run] ' : ''}修正 ${changed} 個檔案`);
if (samples.length) console.log(samples.join('\n'));
