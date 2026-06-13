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
