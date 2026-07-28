#!/usr/bin/env node
/**
 * 標籤守門：確保文章的 tags 都在 src/config/tags.ts 的受控詞彙表內。
 *
 * 為什麼要有這支（而不是只靠 content.config.ts 的 z.enum）：
 *   z.enum 已經是 100% 的硬約束，表外標籤一定會讓 astro build 失敗。
 *   但那個錯誤訊息是 zod 的原始輸出，對半夜跑的自動產線幫助不大。
 *   這支的用途是「早一步、講人話」——五條產線寫檔後立刻 spawnSync 自檢，
 *   當場印出哪個標籤不合法、可以改掛哪些，讓產線能就地修正而不是等 CI 才炸。
 *
 * 用法：
 *   node scripts/check-tags.mjs                 # 掃相對 origin/main 的變動檔（同 check-content.mjs）
 *   node scripts/check-tags.mjs --all           # 盤點全部存量
 *   node scripts/check-tags.mjs <file> [file…]  # 指定檔案（產線自檢用）
 *
 * 失敗即 exit 1。抓不到 git base（CI 淺 checkout）時掃 0 檔 exit 0，永不誤擋——
 * 與 check-content.mjs 同一套 grandfather 策略。
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 直接從 tags.ts 解析詞彙表，避免為了讀一個常數而拉進 TypeScript 編譯。
// 格式固定為 `{ name: '…', group: '…' }`，tags.ts 檔頭有註明勿改動此格式。
function loadVocabulary() {
  const src = readFileSync(path.join(ROOT, 'src/config/tags.ts'), 'utf8');
  const entries = [...src.matchAll(/\{ name: '([^']+)', group: '([^']+)' \}/g)].map((m) => ({
    name: m[1],
    group: m[2],
  }));
  if (entries.length === 0) {
    // 解析不出來＝這支自己壞了，不是內容有問題：fail-open，別擋住產線。
    console.error('check-tags：無法從 src/config/tags.ts 解析詞彙表，跳過檢查（fail-open）');
    process.exit(0);
  }
  const maxMatch = src.match(/MAX_TAGS_PER_ARTICLE\s*=\s*(\d+)/);
  return { entries, max: maxMatch ? Number(maxMatch[1]) : 8 };
}

function changedFiles() {
  try {
    execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'ignore' });
  } catch {
    return null; // 抓不到 base
  }
  const out = execSync('git diff --name-only origin/main...HEAD; git diff --name-only; git ls-files -o --exclude-standard', {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return [...new Set(out.split('\n').filter(Boolean))].filter((f) =>
    /^src\/content\/(articles|topics)\/.*\.mdx?$/.test(f),
  );
}

function allFiles() {
  const out = execSync('git ls-files "src/content/articles/*.md*" "src/content/topics/*.md*"', {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return out.split('\n').filter(Boolean);
}

const { entries, max } = loadVocabulary();
const vocab = new Set(entries.map((e) => e.name));

const argFiles = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const all = process.argv.includes('--all');

let files;
if (argFiles.length) {
  files = argFiles.map((f) => path.relative(ROOT, path.resolve(f)));
} else if (all) {
  files = allFiles();
} else {
  files = changedFiles();
  if (files === null) {
    console.log('check-tags：抓不到 git base，跳過（掃 0 檔）');
    process.exit(0);
  }
}

/** 給不合法標籤找幾個像樣的替代建議（共同子字串），純粹是為了讓錯誤訊息可行動 */
function suggest(bad) {
  const lower = bad.toLowerCase();
  const hits = entries
    .map((e) => {
      const n = e.name.toLowerCase();
      let score = 0;
      if (lower.includes(n) || n.includes(lower)) score = Math.min(n.length, lower.length) * 2;
      else {
        for (let i = 0; i < n.length - 1; i++) if (lower.includes(n.slice(i, i + 2))) score++;
      }
      return { name: e.name, score };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((h) => h.name);
  return hits;
}

const problems = [];
for (const rel of files) {
  const full = path.join(ROOT, rel);
  if (!existsSync(full)) continue;
  const raw = readFileSync(full, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) continue;
  let fm;
  try {
    fm = yaml.load(m[1]);
  } catch {
    continue; // frontmatter 壞掉是 validate-content 的守備範圍
  }
  const tags = Array.isArray(fm?.tags) ? fm.tags : [];
  for (const t of tags) {
    if (!vocab.has(t)) {
      problems.push({ rel, kind: 'invalid', tag: t });
    }
  }
  if (tags.length > max) {
    problems.push({ rel, kind: 'too-many', count: tags.length });
  }
}

if (problems.length === 0) {
  console.log(`check-tags：${files.length} 檔，標籤全部合法 ✓`);
  process.exit(0);
}

console.error(`\ncheck-tags：發現 ${problems.length} 個問題\n`);
for (const p of problems) {
  if (p.kind === 'invalid') {
    const s = suggest(p.tag);
    console.error(`  ✗ ${p.rel}`);
    console.error(`    標籤「${p.tag}」不在受控詞彙表內`);
    if (s.length) console.error(`    可改掛：${s.join('、')}`);
  } else {
    console.error(`  ✗ ${p.rel}`);
    console.error(`    標籤 ${p.count} 個，超過上限 ${max}`);
  }
}
console.error(`
標籤是受控詞彙表，正本在 src/config/tags.ts（共 ${vocab.size} 個）。
先找現有標籤掛，寧可少掛也不要發明近義詞；真的要新增看 tags.ts 檔頭的流程。
為什麼這樣設計：docs/lessons/tag-taxonomy.md
`);
process.exit(1);
