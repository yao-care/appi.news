#!/usr/bin/env node
/**
 * 存量主題（topics）回填：把沒歸主題的舊文，掛進既有的主題叢集。
 *
 * 為什麼重要：`relatedArticles()`（src/utils/content.ts）的權重是「同 topic 每個 ×3」，
 * 遠高於同分類的 +2。兩個欄位都空的文章，文末「延伸閱讀」只能退回同分類最新文，
 * 等於推薦不相干的東西。站長 2026-08-07 指示這批要做完。
 *
 * 怎麼判：對每個主題算一個向量＝**主題頁定義（標題＋描述＋標籤）** 與
 * **該主題既有文章的重心** 的合併，再和文章比 TF-IDF 餘弦。用既有文章當重心很關鍵——
 * 主題描述只有兩三句，單靠它會偏向字面；既有成員才真正定義了這個叢集在收什麼題。
 *
 * 🔴 只掛既有主題，**絕不自創 topic id**（會產生壞連結，擋部署）。
 * 🔴 只寫 frontmatter 的 topics 欄位，不動內文一個字。
 *
 * 用法：
 *   node scripts/growth-backfill-topics.mjs           # dry-run
 *   node scripts/growth-backfill-topics.mjs --write   # 實際寫檔
 *   node scripts/growth-backfill-topics.mjs --sample 20
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');
const TOPICS = path.join(ROOT, 'src/content/topics');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const SAMPLE = argv.includes('--sample') ? Number(argv[argv.indexOf('--sample') + 1]) || 20 : 20;
/** 低於這條線就不掛——寧可留空，也不要把文章掛進不相干的叢集。 */
const MIN = Number(process.env.TOPIC_MIN || 0.11);

const fmOf = (raw) => raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
const one = (fm, k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';
function listOf(fm, k) {
  const inline = fm.match(new RegExp(`^${k}:[ \\t]*\\[([^\\]]*)\\]`, 'm'))?.[1];
  if (inline) return [...inline.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
  const block = fm.match(new RegExp(`^${k}:\\s*\\n((?:\\s+-\\s+.*\\n?)+)`, 'm'))?.[1];
  if (block) return [...block.matchAll(/-\s+["']?([^"'\n]+?)["']?\s*$/gm)].map((x) => x[1].trim());
  return [];
}

function terms(text) {
  const out = new Map();
  const bump = (t) => out.set(t, (out.get(t) || 0) + 1);
  for (const seg of text.replace(/[^一-鿿]+/g, ' ').split(/\s+/).filter(Boolean))
    for (let i = 0; i + 2 <= seg.length; i++) bump(seg.slice(i, i + 2));
  for (const w of text.toLowerCase().match(/[a-z0-9]{3,}/g) || []) bump(w);
  return out;
}

/* ------------------------------- 讀資料 ------------------------------- */

const articles = [];
for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
  const raw = readFileSync(path.join(ARTICLES, f), 'utf8');
  const m = fmOf(raw);
  if (!m) continue;
  const [, fm, body] = m;
  const status = one(fm, 'status') || 'published';
  articles.push({
    file: f,
    raw,
    fm,
    body,
    title: one(fm, 'title'),
    category: one(fm, 'category'),
    column: one(fm, 'column'),
    tags: listOf(fm, 'tags'),
    topics: listOf(fm, 'topics'),
    usable: one(fm, 'draft') !== 'true' && status !== 'draft' && status !== 'archived',
  });
}

const topics = [];
for (const f of readdirSync(TOPICS).filter((x) => /\.mdx?$/.test(x))) {
  const raw = readFileSync(path.join(TOPICS, f), 'utf8');
  const m = fmOf(raw);
  if (!m) continue;
  const [, fm] = m;
  if ((one(fm, 'status') || 'active') !== 'active') continue;
  topics.push({
    id: f.replace(/\.mdx?$/, ''),
    title: one(fm, 'title'),
    description: one(fm, 'description'),
    category: one(fm, 'category'),
    tags: listOf(fm, 'tags'),
  });
}

/* ------------------------------ 向量 ------------------------------ */

const docText = (a) =>
  `${a.title} ${a.title} ${a.title} ${a.body.replace(/```[\s\S]*?```/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/<[^>]+>/g, ' ').slice(0, 2500)}`;

const BAGS = new Map(articles.map((a) => [a.file, terms(docText(a))]));
const DF = new Map();
for (const bag of BAGS.values()) for (const t of bag.keys()) DF.set(t, (DF.get(t) || 0) + 1);
const N = articles.length;
const idf = (t) => Math.log(N / (1 + (DF.get(t) || 0)));

function toVec(bag) {
  const v = new Map();
  let norm = 0;
  for (const [t, tf] of bag) {
    const w = (1 + Math.log(tf)) * idf(t);
    if (w <= 0) continue;
    v.set(t, w);
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [t, w] of v) v.set(t, w / norm);
  return v;
}
const AVEC = new Map(articles.map((a) => [a.file, toVec(BAGS.get(a.file))]));

const cosine = (x, y) => {
  const [s, b] = x.size < y.size ? [x, y] : [y, x];
  let acc = 0;
  for (const [t, w] of s) {
    const w2 = b.get(t);
    if (w2) acc += w * w2;
  }
  return acc;
};

/** 主題向量＝定義文字 + 既有成員文章的重心（成員才真正定義叢集在收什麼題）。 */
for (const t of topics) {
  const bag = terms(`${t.title} ${t.title} ${t.description} ${t.tags.join(' ')}`);
  t.members = articles.filter((a) => a.usable && a.topics.includes(t.id));
  for (const a of t.members) {
    for (const [term, tf] of BAGS.get(a.file)) bag.set(term, (bag.get(term) || 0) + tf / t.members.length);
  }
  t.vec = toVec(bag);
}

/* ------------------------------ 主流程 ------------------------------ */

const targets = articles.filter((a) => a.usable && !a.topics.length && !a.column);
let changed = 0;
const printed = [];
const perTopic = new Map();

for (const a of targets) {
  const best = topics
    .filter((t) => !t.category || !a.category || t.category === a.category)
    .map((t) => ({ t, c: cosine(AVEC.get(a.file), t.vec) }))
    .sort((x, y) => y.c - x.c)[0];
  if (!best || best.c < MIN) continue;

  const next = a.raw.replace(
    /^(---\r?\n[\s\S]*?)(\r?\n---\r?\n)/,
    (_, head, tail) => `${head}\ntopics: ["${best.t.id}"]${tail}`,
  );
  if (next === a.raw) continue;
  if (WRITE) writeFileSync(path.join(ARTICLES, a.file), next);
  changed++;
  perTopic.set(best.t.id, (perTopic.get(best.t.id) || 0) + 1);
  if (printed.length < SAMPLE) printed.push(`  ${best.c.toFixed(2)}  ${best.t.id}  ←  ${a.title}`);
}

console.log(`主題 ${topics.length} 個｜沒歸主題的文章 ${targets.length} 篇｜掛上 ${changed} 篇${WRITE ? '（已寫檔）' : '（dry-run）'}`);
console.log(`\n樣本（相似度 主題 ← 文章）：`);
printed.forEach((l) => console.log(l));
console.log(`\n各主題新增篇數：`);
[...perTopic.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k.padEnd(34)} +${v}`));
