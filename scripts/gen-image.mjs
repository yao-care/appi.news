// 用法:
//   node scripts/gen-image.mjs --topic "段落主題" --context "可選脈絡" \
//        --out public/images/post-282-s2.webp [--width 960]
// 輸出: 一行 JSON，含可直接貼進文章的 <img> tag 與尺寸。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateImage, imgTag } from './lib/ai-image.mjs';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

const topic = arg('topic');
const context = arg('context', '');
const out = arg('out');
const width = Number(arg('width', '960'));
if (!Number.isFinite(width)) { console.error('--width must be a number'); process.exit(1); }

if (!topic || !out) {
  console.error('need --topic and --out');
  process.exit(1);
}

// NO_AI_IMAGE=1：全站禁用 AI 生圖的開關。get-image.mjs 早就有，本檔 2026-08-06 補上——
// 只堵 get-image 是不夠的：任何產線只要改叫 gen-image 就繞過了，而事後從檔案無法驗證
// （sharp 會剝掉 metadata）。禁生圖要禁得徹底，才能事後說得出「這批沒有生成圖」。
if (process.env.NO_AI_IMAGE === '1') {
  console.error('NO_AI_IMAGE=1：本批禁用 AI 生圖。請改用 get-image.mjs 搜圖庫，或重用站內既有圖。');
  process.exit(1);
}

const { buffer, width: w, height: h } = await generateImage({ topic, context, width });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buffer);

// src 用站內 root-relative；base(/appi.news) 由 rehypeBaseImages 於 build 期自動補
const src = '/' + out.replace(/^public\//, '');
console.log(JSON.stringify({
  file: out,
  src,
  width: w,
  height: h,
  tag: imgTag({ src, width: w, height: h, alt: '' }),
}));
