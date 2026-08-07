#!/usr/bin/env node
/**
 * 「接下來要上什麼？」——列出尚未公開的排程稿與待審草稿。
 *
 * 為什麼要有這支：`status: scheduled` + 未來 `publishDate` 的文章不進列表／sitemap／RSS，
 * 站上看不到、`ls src/content/articles` 也分不出來，以前每次要回答「這週會發什麼」都得臨場
 * 手寫一段 node 掃 frontmatter。判準（`isPublic()`）的正本在 `src/utils/content.ts`，這裡是
 * 唯讀鏡像：draft/archived 不算、publishDate 未到才算「尚未公開」。
 *
 * 用法：
 *   node scripts/upcoming.mjs           # 未來 14 天內要上線的
 *   node scripts/upcoming.mjs 7         # 未來 7 天
 *   node scripts/upcoming.mjs --all     # 全部未公開的（含遠未來日的待審草稿）
 *
 * 時間一律用台北時間顯示（cron 與 crontab 是 UTC，別搞混）。
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');

const argv = process.argv.slice(2);
const ALL = argv.includes('--all');
const DAYS = Number(argv.find((a) => /^\d+$/.test(a))) || 14;

const taipei = (d) =>
  new Date(d.getTime() + 8 * 3600e3).toISOString().replace('T', ' ').slice(0, 16);

const rows = [];
for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
  const raw = readFileSync(path.join(ARTICLES, f), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const get = (k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() ?? '';
  const status = get('status') || 'published';
  if (status === 'draft' || status === 'archived' || get('draft') === 'true') continue;
  const d = new Date(get('publishDate'));
  if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) continue; // 已公開
  rows.push({ f, d, status, kind: get('kind'), category: get('category'), title: get('title') });
}
rows.sort((a, b) => a.d - b.d);

const cutoff = Date.now() + DAYS * 86400e3;
const near = ALL ? rows : rows.filter((r) => r.d.getTime() <= cutoff);
const far = ALL ? [] : rows.filter((r) => r.d.getTime() > cutoff);

console.log(`# 尚未公開的稿｜現在 ${taipei(new Date())} 台北`);
console.log(ALL ? `# 全部 ${rows.length} 篇` : `# 未來 ${DAYS} 天內：${near.length} 篇`);
if (!near.length) console.log('（無）');
for (const r of near) {
  const tag = r.kind === 'factual' ? '待審草稿' : '排程稿';
  console.log(`${taipei(r.d)}  ${tag}  ${(r.category || '-').padEnd(13)} ${r.title}`);
  console.log(`                   預覽 https://appi.news/articles/${r.f.replace(/\.mdx?$/, '')}/`);
}
if (far.length) {
  console.log(`\n# ${DAYS} 天以外還有 ${far.length} 篇（多半是等人工核可的待審草稿，用 --all 看全部）`);
}
