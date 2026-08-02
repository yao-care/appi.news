#!/usr/bin/env node
/**
 * 一次性回填署名人格文章的 `expertNote`（文末「○○○的判讀」）。
 *
 * 範圍：**只掃 author 為具名個人的文章**（188 篇）；`appi-editorial` 組織署名一律跳過，
 * 理由與寫作分工見 scripts/lib/expert-note-prompt.mjs 檔頭。
 *
 * 與 backfill-risks.mjs 同一套安全機制：冪等、--model claude-sonnet-5、
 * 撞用量上限即中止整批（不逐項空打）。
 *
 * 用法：
 *   node scripts/backfill-expert-note.mjs --dry
 *   node scripts/backfill-expert-note.mjs --limit 60
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import { normalizeCjkPunct, hasContrastTell } from './lib/cjk-punct.mjs';

const ARTICLES_DIR = 'src/content/articles';
const AUTHORS_DIR = 'src/content/authors';
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const arg = (n, d) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
const LIMIT = Number(arg('--limit', DRY ? '9999' : '60'));
const BODY_CHARS = 6000;

/** 讀作者檔，供 prompt 描述「這個人是誰、他的專業視角是什麼」 */
function loadAuthors() {
  const map = new Map();
  for (const f of readdirSync(AUTHORS_DIR).filter((x) => x.endsWith('.md'))) {
    const raw = readFileSync(join(AUTHORS_DIR, f), 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) continue;
    let d;
    try {
      d = yaml.load(m[1]) || {};
    } catch {
      continue;
    }
    map.set(f.replace(/\.md$/, ''), { ...d, bio: (m[2] || '').trim() });
  }
  return map;
}

function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  let data;
  try {
    data = yaml.load(m[1]);
  } catch {
    return null;
  }
  return { fmText: m[1], data: data || {}, body: m[2] || '' };
}

function buildPrompt(data, body, author) {
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  const risks = Array.isArray(data.risksAndLimits) ? data.risksAndLimits : [];
  return [
    `你要以「${author.name}」的專業視角，替一篇掛在他名下的文章寫文末的「判讀」段落。`,
    '',
    `作者：${author.name}（${author.displayTitle ?? ''}）`,
    `資歷：${(author.credentials ?? []).join('、') || '（無）'}`,
    `專業領域：${(author.specialties ?? []).join('、') || '（無）'}`,
    '',
    `文章標題：${data.title ?? ''}`,
    `分類：${data.category ?? ''}${data.subcategory ? ` / ${data.subcategory}` : ''}`,
    highlights.length ? `本文重點（已存在，不要覆述）：\n- ${highlights.join('\n- ')}` : '',
    risks.length ? `風險與限制（已存在，不要覆述）：\n- ${risks.join('\n- ')}` : '',
    '',
    '內文（可能截斷）：',
    '"""',
    body.slice(0, BODY_CHARS),
    '"""',
    '',
    '請用 1~3 句、合計 ≤120 字，回答「所以呢」：這件事對誰重要、實務上該怎麼看或怎麼做、',
    '哪個環節最該留意。這是判斷，不是摘要。',
    '',
    '硬性要求：',
    '- **不得虛構個人經歷**：不可寫「我在門診看過」「我經手的案子」這類第一手軼事。',
    '  只能寫從內文與上面列的專業領域推得的判斷。',
    '- 不得覆述「本文重點」或「風險與限制」已經寫過的內容。',
    '- 繁體中文台灣用語。不要用破折號。不要用「不僅…更…」「值得注意的是」「總而言之」這類 AI 套語。',
    '- 不要自稱「主編」或任何未列在上面資歷裡的頭銜。',
    '',
    '只輸出那段判讀文字本身，不要引號、不要標題、不要任何說明或 markdown。',
  ]
    .filter(Boolean)
    .join('\n');
}

function clean(text) {
  let s = normalizeCjkPunct(String(text).trim());
  s = s.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
  s = s.replace(/^["「『]|["」』]$/g, '').trim();
  if (!s || s.length > 200) return null;
  if (/[—–]|--/.test(s)) return null;
  if (hasContrastTell(s)) return null; // 「不是X，而是Y」＝ check-content 的 ERROR // 破折號＝內容 gate 的 ERROR，寧可跳過重跑
  return s;
}

function insertField(fmText, note) {
  const block = `expertNote: ${JSON.stringify(note)}`;
  const lines = fmText.split('\n');
  const at = lines.findIndex((l) => /^risksAndLimits:|^references:/.test(l));
  if (at >= 0) lines.splice(at, 0, block);
  else lines.push(block);
  return lines.join('\n');
}

const authors = loadAuthors();
const files = readdirSync(ARTICLES_DIR)
  .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
  .sort();

const todo = [];
for (const f of files) {
  const p = splitFrontmatter(readFileSync(join(ARTICLES_DIR, f), 'utf8'));
  if (!p) continue;
  if (typeof p.data.expertNote === 'string' && p.data.expertNote.trim()) continue;
  const a = authors.get(p.data.author);
  if (!a || a.isOrganization) continue; // 組織署名不寫判讀
  todo.push({ f, author: a });
}

console.log(`待回填 ${todo.length} 篇（僅署名人格），本次上限 ${LIMIT} 篇`);
if (DRY) {
  const by = {};
  for (const t of todo) by[t.author.name] = (by[t.author.name] ?? 0) + 1;
  for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
  process.exit(0);
}

let done = 0;
let failed = 0;
const batch = todo.slice(0, LIMIT);
for (const [i, t] of batch.entries()) {
  const path = join(ARTICLES_DIR, t.f);
  const raw = readFileSync(path, 'utf8');
  const p = splitFrontmatter(raw);
  if (!p) continue;
  process.stdout.write(`[${i + 1}/${batch.length}] ${t.f} … `);
  let note;
  try {
    const out = await runClaudeOnce(buildPrompt(p.data, p.body, t.author), 'claude-sonnet-5', 120_000);
    note = clean(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`✖ ${msg.slice(0, 80)}`);
    if (/用量上限|limit/i.test(msg)) {
      console.error('\n⛔ 判定為用量上限，中止本批（冪等，稍後再跑即可）。');
      break;
    }
    failed++;
    continue;
  }
  if (!note) {
    console.log('✖ 輸出不合格（空／過長／含破折號），跳過');
    failed++;
    continue;
  }
  writeFileSync(path, raw.replace(p.fmText, insertField(p.fmText, note)));
  console.log(`✓ ${note.length} 字`);
  done++;
}

console.log(`\n本批：寫入 ${done} 篇、失敗 ${failed} 篇；剩餘待處理 ${todo.length - done}`);
