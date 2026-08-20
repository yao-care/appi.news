// 文章目錄的唯讀索引工具（純 fs＋yaml，零 LLM、零 git）。
//
// 為什麼要有這支：articleTitle()／recentXTitles() 曾在各產線入口檔逐字複製十餘份，
// 每份只差一行過濾條件；改讀法（例如 frontmatter regex）得改遍所有產線。
// 收成一處後，各線只提供自己的 filter。
//
// 慣例：讀不到／解析不了一律回空值（''/null/[]），絕不 throw——索引壞掉不該讓產線炸掉。

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const ARTICLES_DIR = 'src/content/articles';

/** 讀單篇 frontmatter（物件）；讀不到回 {}。 */
export function articleFrontmatter(slug, { articlesDir = ARTICLES_DIR } = {}) {
  try {
    const m = readFileSync(join(articlesDir, `${slug}.md`), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return (m && yaml.load(m[1])) || {};
  } catch { return {}; }
}

/** 讀單篇 title（給 Slack 回報帶標題用）；讀不到回 ''。 */
export function articleTitle(slug, opts) {
  return articleFrontmatter(slug, opts).title || '';
}

/**
 * 列出全部文章的 {slug, file, data, raw}。data＝frontmatter 物件；raw＝全文（給需要看正文的
 * filter 用，例如影片線以「正文帶影片出處卡」識別自己的稿）。單篇壞掉直接略過。
 */
export function listArticleFrontmatters({ articlesDir = ARTICLES_DIR } = {}) {
  let files = [];
  try { files = readdirSync(articlesDir).filter((f) => f.endsWith('.md')); } catch { return []; }
  const out = [];
  for (const f of files) {
    try {
      const raw = readFileSync(join(articlesDir, f), 'utf8');
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      const data = yaml.load(m[1]);
      if (!data) continue;
      out.push({ slug: f.replace(/\.md$/, ''), file: join(articlesDir, f), data, raw });
    } catch { /* 單篇壞掉不影響索引 */ }
  }
  return out;
}

/**
 * 近 N 天已發文章的標題（給選題去重塞 prompt 用）。
 * filter({slug, data, raw}) 由各產線提供自己的識別條件（分類／slug 前綴／正文特徵）。
 * 以 publishDate 判定「近 N 天」，與各線原實作一致。
 */
export function recentTitles({ days = 30, filter = () => true, articlesDir = ARTICLES_DIR } = {}) {
  const cutoff = Date.now() - days * 86400 * 1000;
  const out = [];
  for (const entry of listArticleFrontmatters({ articlesDir })) {
    try {
      if (!filter(entry)) continue;
      if (new Date(entry.data.publishDate || 0).getTime() >= cutoff) out.push(entry.data.title || entry.slug);
    } catch { /* filter 壞掉當不命中 */ }
  }
  return out;
}
