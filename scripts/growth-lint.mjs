#!/usr/bin/env node
/**
 * 成長規則自檢：逐篇檢查文章有沒有做到 GROWTH_PROMPT（scripts/lib/growth-prompt.mjs）的 G1–G5。
 *
 * 為什麼要有這支：那些規則寫在 prompt 裡，模型會忘、會打折。這支把「有沒有真的做到」變成
 * 可以量的東西——既給產線寫完後自檢，也給人盤點存量、排出補內鏈的工作清單。
 *
 * 🔴 **預設 report-only（永遠 exit 0）**：內鏈是品質而不是正確性，不該擋掉半夜的自動產線。
 *    唯一例外是 `--strict`，只有那時候「連到不存在的文章」與「零內鏈」才 exit 1（供人工把關用）。
 *    連到不存在的文章在 build 端本來就會被 check:links 擋，這裡只是早一步講人話。
 *
 * 用法：
 *   node scripts/growth-lint.mjs                 # 掃相對 origin/main 的變動檔（同 check-tags.mjs）
 *   node scripts/growth-lint.mjs --all           # 盤點全部存量
 *   node scripts/growth-lint.mjs --all --summary # 只印統計（排工作清單用）
 *   node scripts/growth-lint.mjs --all --worst 30 # 印最該補的前 30 篇（依站內曝光價值粗排：內鏈 0 條者優先）
 *   node scripts/growth-lint.mjs <file> [file…]  # 指定檔案（產線自檢用）
 *   node scripts/growth-lint.mjs --strict <file> # 嚴格模式，硬錯誤 exit 1
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { hasFaqSection } from './lib/faq-detect.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'src/content/articles');

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const STRICT = flag('--strict');
const SUMMARY = flag('--summary');
const WORST = flag('--worst') ? Number(argv[argv.indexOf('--worst') + 1]) || 20 : 0;
const files = argv.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));

/** 站上所有合法的文章 slug（含 frontmatter 自訂 slug），用來驗內鏈目標是否存在。 */
function knownSlugs() {
  const set = new Set();
  for (const f of readdirSync(ARTICLES_DIR).filter((x) => /\.mdx?$/.test(x))) {
    set.add(f.replace(/\.mdx?$/, ''));
    const m = readFileSync(path.join(ARTICLES_DIR, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const s = m?.[1].match(/^slug:\s*["']?([^"'\n]+)/m)?.[1]?.trim();
    if (s) set.add(s);
  }
  return set;
}

function changedFiles() {
  try { execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'ignore' }); }
  catch { return null; } // 抓不到 base（CI 淺 checkout）→ 掃 0 檔，永不誤擋
  const out = execSync('git diff --name-only origin/main...HEAD; git diff --name-only; git ls-files -o --exclude-standard', { cwd: ROOT, encoding: 'utf8' });
  return [...new Set(out.split('\n').filter(Boolean))].filter((f) => /^src\/content\/articles\/.*\.mdx?$/.test(f));
}

const allFiles = () =>
  execSync('git ls-files "src/content/articles/*.md*"', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

/** 全形字寬（CJK 算 1、ASCII 算 0.5），用來近似搜尋結果的截斷長度。 */
const width = (s) => [...s].reduce((n, c) => n + (/[\x00-\x7F]/.test(c) ? 0.5 : 1), 0);

const BAD_ANCHOR = /^(這裡|點此|點這裡|詳見本站|看這篇|連結|更多|請點|按這裡)$/;

export function auditArticle(raw, slugs = new Set()) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const fm = m ? m[1] : '';
  const body = m ? m[2] : raw;
  const get = (k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';
  const hasList = (k) => new RegExp(`^${k}:\\s*\\n(\\s+-\\s+\\S)`, 'm').test(fm) || /\[.+\]/.test(get(k));

  const links = [...body.matchAll(/\[([^\]]+)\]\(\s*(\/articles\/[^)\s]+?)\s*\)/g)].map((x) => ({
    anchor: x[1].trim(), href: x[2], at: x.index,
  }));
  const firstThird = body.length / 3;
  const bad = [];

  // G1 站內導流
  if (links.length === 0) bad.push({ level: 'ERROR', code: 'G1-none', msg: '內文沒有任何站內連結（至少要 2 條）' });
  else if (links.length === 1) bad.push({ level: 'WARN', code: 'G1-few', msg: '內文只有 1 條站內連結（目標 2 條以上）' });
  if (links.length && !links.some((l) => l.at < firstThird))
    bad.push({ level: 'WARN', code: 'G1-late', msg: '站內連結全部落在文章後三分之二（至少 1 條要在前三分之一）' });
  for (const l of links) {
    const slug = decodeURIComponent(l.href.replace(/^\/articles\//, '').replace(/\/$/, ''));
    if (slugs.size && !slugs.has(slug)) bad.push({ level: 'ERROR', code: 'G1-404', msg: `連到不存在的文章：${l.href}` });
    if (BAD_ANCHOR.test(l.anchor)) bad.push({ level: 'WARN', code: 'G1-anchor', msg: `錨文字沒有資訊量：「${l.anchor}」` });
  }
  // G2 topics / column
  if (!hasList('topics') && !get('column'))
    bad.push({ level: 'WARN', code: 'G2-cluster', msg: 'topics 與 column 都沒填（延伸閱讀只能退回同分類最新文）' });
  // G3 title / description
  const title = get('title');
  if (title && width(title) > 30) bad.push({ level: 'WARN', code: 'G3-title', msg: `title 約 ${width(title)} 全形字，搜尋結果會被截斷（目標 30 內）` });
  const desc = get('description');
  if (desc && (width(desc) < 60 || width(desc) > 160))
    bad.push({ level: 'WARN', code: 'G3-desc', msg: `description 約 ${Math.round(width(desc))} 全形字（目標 60–160）` });
  // G5 FAQ（判準與 src/utils/faq.ts 共用，見 scripts/lib/faq-detect.mjs 檔頭）
  if (!hasFaqSection(body))
    bad.push({ level: 'INFO', code: 'G5-faq', msg: '沒有「常見問題」區段（可拿 FAQPage 結構化資料）' });

  return { links: links.length, issues: bad };
}

/* ------------------------------- CLI ------------------------------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const slugs = knownSlugs();
  let targets = files.length ? files : flag('--all') ? allFiles() : changedFiles();
  if (targets === null) { console.log('growth-lint：抓不到 git base，掃 0 檔（fail-open）'); process.exit(0); }
  targets = targets.filter((f) => existsSync(path.resolve(ROOT, f)));

  const rows = [];
  for (const f of targets) {
    const r = auditArticle(readFileSync(path.resolve(ROOT, f), 'utf8'), slugs);
    rows.push({ f, ...r });
  }

  const count = (code) => rows.filter((r) => r.issues.some((i) => i.code === code)).length;
  if (SUMMARY || WORST) {
    console.log(`# growth-lint 盤點｜掃描 ${rows.length} 篇`);
    console.log(`零內鏈           ${count('G1-none')} 篇`);
    console.log(`只有 1 條內鏈    ${count('G1-few')} 篇`);
    console.log(`內鏈全在後段     ${count('G1-late')} 篇`);
    console.log(`連到不存在的文章 ${count('G1-404')} 篇 ← 會讓 build 失敗，優先修`);
    console.log(`topics/column 皆空 ${count('G2-cluster')} 篇`);
    console.log(`title 過長       ${count('G3-title')} 篇`);
    console.log(`description 不在區間 ${count('G3-desc')} 篇`);
    console.log(`無常見問題區段   ${count('G5-faq')} 篇`);
    if (WORST) {
      console.log(`\n# 最該補的前 ${WORST} 篇（零內鏈且無主題叢集者優先）`);
      rows
        .map((r) => ({ ...r, score: (r.issues.some((i) => i.code === 'G1-none') ? 2 : 0) + (r.issues.some((i) => i.code === 'G2-cluster') ? 1 : 0) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, WORST)
        .forEach((r) => console.log(`  [${r.score}] ${r.f}`));
    }
  } else {
    for (const r of rows) {
      if (!r.issues.length) { console.log(`✓ ${r.f}（站內連結 ${r.links} 條）`); continue; }
      console.log(`${r.issues.some((i) => i.level === 'ERROR') ? '✗' : '△'} ${r.f}（站內連結 ${r.links} 條）`);
      r.issues.forEach((i) => console.log(`    ${i.level.padEnd(5)} ${i.code}  ${i.msg}`));
    }
  }

  const hardErrors = rows.reduce((n, r) => n + r.issues.filter((i) => i.level === 'ERROR').length, 0);
  if (STRICT && hardErrors) { console.error(`\ngrowth-lint --strict：${hardErrors} 個硬錯誤`); process.exit(1); }
  process.exit(0);
}
