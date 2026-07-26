#!/usr/bin/env node
// 下載 YouTube 影片縮圖 → webp → 存進 public/images/，並印出可貼進文章的影片出處卡 HTML。
//
// 為什麼要存本地：站上禁外部 CDN 請求＋要 CLS 0，所以不 hotlink i.ytimg.com、不用 iframe，
// 改成「本地縮圖 + 連出去」的 facade（見 scripts/lib/video-embed.mjs 檔頭）。
//
// 用法：
//   node scripts/save-video-thumb.mjs --id <videoId> --slug <article-slug> \
//        --title "影片標題" --channel "頻道名"
//
// 輸出：最後一段是 <figure class="video-embed">…</figure>，整段貼進文章正文。

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { toWebp } from './lib/ai-image.mjs';
import { videoEmbed } from './lib/video-embed.mjs';

const argv = process.argv.slice(2);
const arg = (n, d = '') => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
function die(m) { console.error(`✖ ${m}`); process.exit(1); }

const id = arg('id');
const slug = arg('slug');
const title = arg('title');
const channel = arg('channel');
if (!/^[\w-]{6,20}$/.test(id)) die('--id 需為 YouTube videoId');
if (!/^[a-z0-9-]+$/.test(slug)) die('--slug 需為 kebab-case 文章 slug');
if (!title) die('--title 必填（縮圖 alt 與連結標籤要用）');
if (!channel) die('--channel 必填（出處署名要用）');

// maxres 不是每支都有，缺就退 hq（480x360，仍夠內文寬度用）。
async function download(videoId) {
  for (const q of ['maxresdefault', 'hqdefault']) {
    const r = await fetch(`https://i.ytimg.com/vi/${videoId}/${q}.jpg`);
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    // YouTube 對不存在的畫質會回一張 120x90 的灰底佔位圖，用大小把它擋掉。
    if (buf.length < 8000) continue;
    return { buf, quality: q };
  }
  return null;
}

const got = await download(id);
if (!got) die(`抓不到 ${id} 的縮圖（i.ytimg.com 無回應或只有佔位圖）`);

const out = join('public/images', `${slug}-video.webp`);
mkdirSync('public/images', { recursive: true });
const webp = await toWebp(got.buf, 960);
writeFileSync(out, webp.buffer);
if (!existsSync(out)) die(`寫檔失敗：${out}`);

console.log(`✓ ${out}（${got.quality} → ${webp.width}×${webp.height}, ${(webp.buffer.length / 1024).toFixed(0)} KB）`);
console.log('\n貼進文章正文：\n');
console.log(videoEmbed({
  url: `https://www.youtube.com/watch?v=${id}`,
  title, channel,
  src: `/images/${slug}-video.webp`,
  width: webp.width, height: webp.height,
}));
