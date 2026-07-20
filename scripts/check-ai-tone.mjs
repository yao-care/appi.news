#!/usr/bin/env node
// check-ai-tone.mjs — 去 AI 腔的「機械守門」（唯一真正掃正文文風的 gate）。
//
// 為什麼存在：站上原本三道硬 gate（validate-content / check-design / check-links）
// 沒有一道讀正文一個字。去 AI 腔一直只是寫作 prompt 裡的「自檢指示」，模型少做就漏出去，
// 「先揭露，免得你覺得我在夾帶」這種自我辯白 meta 旁白就這樣上了線。詳見
// docs/lessons/ai-tone-gate.md。
//
// 設計取捨（重要，別改壞）：
//   * 正文文風無法用 regex 全自動判——破折號在舊站有 123 篇存量、「危言聳聽」「不僅…更」
//     常是正當用法。所以本 gate 只做兩件事，刻意不當「全站硬掃」：
//       - ERROR（exit 1，擋 build）：只擋『機械可判、幾乎零誤判』的簽名句
//         （破折號、免得你、我在夾帶、不怕你笑…）。
//       - WARN（exit 0，只印）：語氣類高誤判 tell，給人/agent 覆查，不擋。
//   * 預設「只掃改動的文章」（相對 origin/main），把 440 篇存量 grandfather 掉——
//     新寫/改寫的文章才受硬 gate 約束，符合 check-design 當初凍結存量的同一套邏輯。
//   * 抓不到 git base（CI 淺 checkout、無 origin/main）→ 掃 0 檔、exit 0，永不誤擋部署。
//
// 用法：
//   node scripts/check-ai-tone.mjs                 # 掃「相對 origin/main 改動的文章」，ERROR 會 exit 1
//   node scripts/check-ai-tone.mjs <file...>       # 掃指定檔（寫作腳本產檔後自檢用）
//   node scripts/check-ai-tone.mjs --all           # 掃全站，report-only（永遠 exit 0，盤點存量用）

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const explicit = args.filter((a) => !a.startsWith('--'));

// ---- 掃描前先剝掉不算「正文」的區塊，避免誤判 ----
function proseOf(src) {
  // 去 frontmatter
  const fm = src.match(/^---\n[\s\S]*?\n---\n/);
  let b = fm ? src.slice(fm[0].length) : src;
  // 去 fenced code / html 註解 / inline code / 連結與圖片的 URL（保留錨文）
  b = b
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\]\([^)]*\)/g, ']') // markdown 連結/圖 的 (url) 段
    .replace(/\bhttps?:\/\/\S+/g, '') // 裸 URL
    .replace(/<[^>]+>/g, ' '); // HTML 標籤本體（含 img src、a href）
  return b;
}

// ERROR：機械可判、近乎零誤判的簽名句。命中即擋。
const ERROR_TELLS = [
  { re: /[—―]{1,3}|(?<![-!])--(?!-)/g, label: '破折號（改句號/逗號/冒號或拆句）' },
  { re: /免得你(覺得|以為|認為|想)/g, label: '自我辯白 meta 旁白「免得你…」' },
  { re: /我在夾帶/g, label: '自我辯白 meta 旁白「我在夾帶」' },
  { re: /不怕你笑/g, label: '自我辯白 meta 旁白「不怕你笑」' },
  { re: /先講清楚[：:，,]?\s*我為什麼(有資格|夠格)/g, label: '自證資格式開場' },
];

// WARN：語氣類高誤判 tell，只提示、不擋。
const WARN_TELLS = [
  { re: /值得注意的是/g, label: '「值得注意的是」' },
  { re: /不僅[^。！？]{0,14}(更|還)|不只是?[^。！？]{0,12}而是/g, label: '「不僅…更」/「不只…而是」排比' },
  { re: /總而言之|歸根結底|綜上所述/g, label: '空泛收束語' },
  { re: /其實是同一(件事|回事)[^。]{0,8}(不同切面|的不同面向)/g, label: '「同一件事的不同切面」空泛升華' },
  { re: /這(是|既是)一個[^，。]{2,12}，也是一個/g, label: '「這是一個 X，也是一個 Y」句式' },
  { re: /危言聳聽|老實承認|說白了|坦白(說|講)/g, label: '可能是自我辯白旁白（覆查語境）' },
];

function lineOf(prose, index) {
  return prose.slice(0, index).split('\n').length;
}

function scan(file) {
  const src = readFileSync(file, 'utf8');
  const prose = proseOf(src);
  const errors = [];
  const warns = [];
  for (const { re, label } of ERROR_TELLS) {
    for (const m of prose.matchAll(re)) {
      errors.push({ line: lineOf(prose, m.index), label, hit: m[0].trim() || m[0] });
    }
  }
  for (const { re, label } of WARN_TELLS) {
    for (const m of prose.matchAll(re)) {
      warns.push({ line: lineOf(prose, m.index), label, hit: m[0].trim() });
    }
  }
  return { errors, warns };
}

// ---- 決定要掃哪些檔 ----
function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
function changedArticles() {
  try {
    const base = sh('git merge-base origin/main HEAD');
    const committed = sh(`git diff --name-only ${base} -- src/content/articles`);
    const untracked = sh('git ls-files --others --exclude-standard -- src/content/articles');
    return [...new Set([...committed.split('\n'), ...untracked.split('\n')])]
      .filter((f) => f && /\.mdx?$/.test(f) && existsSync(f));
  } catch {
    return null; // 抓不到 base → 交給呼叫端決定（預設放行）
  }
}

let files;
let mode;
if (explicit.length) {
  files = explicit.filter((f) => existsSync(f));
  mode = '指定檔';
} else if (ALL) {
  const dir = 'src/content/articles';
  files = sh(`ls ${dir}/*.md`).split('\n').filter(Boolean);
  mode = '全站盤點';
} else {
  files = changedArticles();
  if (files === null) {
    console.log('check:tone — 抓不到 git base（CI 淺 checkout？），略過，exit 0');
    process.exit(0);
  }
  mode = '相對 origin/main 改動';
}

if (!files.length) {
  console.log(`check:tone（${mode}）— 無待掃文章，通過`);
  process.exit(0);
}

let errFiles = 0;
let warnCount = 0;
for (const f of files) {
  const { errors, warns } = scan(f);
  if (errors.length) {
    errFiles++;
    console.log(`\n✗ ${f}`);
    for (const e of errors) console.log(`    [ERROR L${e.line}] ${e.label}  →「${e.hit}」`);
  }
  for (const w of warns) {
    warnCount++;
    if (warnCount <= 60) console.log(`  · ${f} [warn L${w.line}] ${w.label}  →「${w.hit}」`);
  }
}

console.log(`\ncheck:tone（${mode}）掃 ${files.length} 篇：${errFiles} 篇有硬 tell、${warnCount} 條 warn`);

if (ALL) {
  process.exit(0); // 盤點模式永不擋
}
if (errFiles) {
  console.log('去 AI 腔硬 tell 未清（破折號／自我辯白旁白），改掉後再 build。規則見 .claude/skills/newsroom/SKILL.md 步驟三.7');
  process.exit(1);
}
process.exit(0);
