#!/usr/bin/env node
// 選題重複 gate：擋「站上已經有一篇幾乎同標題」的新文，並對「同主題」出示既有篇供作者決定。
//
// 為什麼＝docs/lessons/duplicate-topic-gate.md
//   2026-07-28 的 GSC 比對發現 `髖關節痛` 一個字被 5 個 URL 瓜分、全卡 pos 76-83；
//   `appi-news-82` 與 `desk-worker-neck-pain-habits` 更是 100% 同標題。既有的 topic-ledger
//   只記「近 14 天推薦過的候選題」且只有 tech-radar 會用，這兩個破口都蓋不到。
//
// 兩級判定（沿用 check-content.mjs 的哲學，避免誤擋正當的新聞追蹤報導）：
//   ERROR（exit 1，擋發佈）標題相似度 ≥ 45%＝幾乎同一篇，屬於真的寫重複了。
//   WARN （只印，exit 0）同主題詞＋標籤重疊＝可能是後續報導（離岸風電 R3.3 續報就是正當的），
//                        由作者決定要另開新篇還是回去更新既有那篇。
//
// 用法：
//   node scripts/check-duplicate-topic.mjs <檔案路徑…>   # 檢查指定檔（產線用）
//   node scripts/check-duplicate-topic.mjs --all          # 盤點存量（不 exit 1，純報告）

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { loadArticles, scorePair } from './lib/topic-similarity.mjs';

const BLOCK_TITLE_SIMILARITY = 0.45;
/** 每日系列（civic-services-2026-07-20…）本來就同名不同日，不是重複。 */
const SERIES = /-20\d\d-\d\d-\d\d$|-\d{8}$/;

function parseFile(path) {
  const head = readFileSync(path, 'utf8').slice(0, 3000);
  const pick = (k) => {
    const m = head.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)`, 'm'));
    return m ? m[1].trim() : '';
  };
  const rawTags = (head.match(/^tags:\s*\[([^\]]*)\]/m) || [])[1] || '';
  return {
    file: basename(path),
    slug: pick('slug') || basename(path).replace(/\.mdx?$/, ''),
    title: pick('title'),
    category: pick('category'),
    status: pick('status'),
    tags: new Set(
      rawTags
        .split(',')
        .map((s) => s.replace(/["'\s]/g, ''))
        .filter(Boolean),
    ),
  };
}

const args = process.argv.slice(2);
const all = args.includes('--all');
const targets = args.filter((a) => !a.startsWith('--'));
const articles = loadArticles();

const subjects = all ? articles : targets.map(parseFile);
if (!subjects.length) {
  console.log('選題重複 gate：沒有要檢查的檔案，略過。');
  process.exit(0);
}

let blocked = 0;
let warned = 0;
const seenPair = new Set();

for (const cand of subjects) {
  if (!cand.title) continue;
  for (const a of articles) {
    if (a.slug === cand.slug || a.file === cand.file) continue;
    if (cand.category && a.category && a.category !== cand.category) continue;
    if (a.status === 'draft' || a.status === 'archived') continue;
    if (SERIES.test(a.slug) && SERIES.test(cand.slug)) continue;
    const s = scorePair(cand, a);
    if (!s.hit) continue;
    const key = [cand.slug, a.slug].sort().join('||');
    if (seenPair.has(key)) continue;
    seenPair.add(key);

    const isBlock = s.title >= BLOCK_TITLE_SIMILARITY;
    if (isBlock) blocked++;
    else warned++;
    console.log(
      `${isBlock ? '❌ ERROR' : '⚠️  WARN '} [${cand.category || '?'}] ${s.reasons.join(' ; ')}\n` +
        `    新：${cand.slug}\n        ${cand.title}\n` +
        `    既有：${a.slug}\n        ${a.title}\n` +
        `    → ${
          isBlock
            ? '幾乎是同一篇，不發佈。請改為更新既有那篇，或換一個真正不同的切角。'
            : '同主題。若這是後續報導可放行；若只是換句話說，請回去更新既有那篇而不是另開新篇。'
        }\n`,
    );
  }
}

if (!blocked && !warned) {
  console.log(`選題重複 gate：檢查 ${subjects.length} 篇，無重複選題 ✅`);
} else {
  console.log(`選題重複 gate：ERROR ${blocked} 組、WARN ${warned} 組。`);
}

process.exit(!all && blocked ? 1 : 0);
