// postbuild：把內頁文章封面（.article-cover）縮成寬 900 的 webp，改寫該頁 src。
// 比照 optimize-home-images：hash 檔名、不變小就不換、原圖小於目標寬不放大。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { findArticleCoverSrc, replaceArticleCoverSrc } from './lib/cover-rewrite.mjs';

const DIST = 'dist';
const ARTICLES = join(DIST, 'articles');
const WIDTH = 900;
const Q = 72;

function walkIndex(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkIndex(p));
    else if (name === 'index.html') out.push(p);
  }
  return out;
}

const cache = new Map(); // 來源 cover 檔 → 產出檔名（或 null=不值得縮）
let count = 0;
let saved = 0;

for (const page of walkIndex(ARTICLES)) {
  let html = readFileSync(page, 'utf8');
  const src = findArticleCoverSrc(html);
  if (!src || !src.includes('/covers/')) continue;
  const prefix = src.split('/covers/')[0];
  const file = src.split('/covers/')[1];
  const input = join(DIST, 'covers', file);
  if (!existsSync(input)) continue;

  let outName = cache.get(input);
  if (outName === undefined) {
    const buf = await sharp(input)
      .resize(WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: Q })
      .toBuffer();
    const orig = readFileSync(input).length;
    if (buf.length >= orig) {
      cache.set(input, null);
      outName = null;
    } else {
      const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
      outName = `${file.replace(/\.[a-z0-9]+$/i, '')}-a${WIDTH}.${hash}.webp`;
      writeFileSync(join(DIST, 'covers', outName), buf);
      cache.set(input, outName);
      saved += orig - buf.length;
    }
  }
  if (!outName) continue;

  html = replaceArticleCoverSrc(html, `${prefix}/covers/${outName}`);
  writeFileSync(page, html);
  count++;
}
console.log(
  `[optimize-article-images] ${count} 篇內頁封面縮為 webp，省 ${(saved / 1024).toFixed(0)}KB`,
);
