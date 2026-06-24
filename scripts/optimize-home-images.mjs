// 建置期首頁圖片最佳化：首頁 cover 圖原為 1080px JPG（48-192KB），卡片實際只顯示
// ~360-640px，過大且非 webp。用 sharp 縮成顯示尺寸的 webp（每張省 ~85%）並改寫
// index.html 的 <img src>。只動首頁；內頁 cover 維持原樣（其 hero 圖顯示較大）。
// CLS 由 CSS aspect-ratio 處理（已 0），故不需加 width/height。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const HOME = 'dist/index.html';
const COVERS = 'dist/covers';
const Q = 72;

let html = readFileSync(HOME, 'utf8');

// 逐個 <img ...covers...> 標籤，依「實際顯示尺寸」分檔（×~2.5 涵蓋 retina）：
//  - feature-img：主圖顯示 ~651px → 900
//  - side-img   ：側欄縮圖固定 .side-thumb 88px（行動版 ~142px）→ 360
//  - 其餘(acard 卡片)：~360px 顯示 → 600
const imgTagRe = /<img\b[^>]*?\/covers\/[^>]*?>/g;
const jobs = new Map(); // srcFile -> { width }
const tags = html.match(imgTagRe) || [];
for (const tag of tags) {
  const m = tag.match(/src="([^"]*\/covers\/([^"?]+))"/);
  if (!m) continue;
  const file = m[2];
  const width = /feature-img/.test(tag) ? 900 : /side-img/.test(tag) ? 360 : 600;
  const prev = jobs.get(file);
  if (!prev || width > prev.width) jobs.set(file, { width }); // 同檔取較大需求
}

let saved = 0;
let count = 0;
const rename = new Map(); // 原 covers/<file> -> 新 covers/<out>
for (const [file, { width }] of jobs) {
  const input = join(COVERS, file);
  if (!existsSync(input)) continue;
  const buf = await sharp(input).resize(width, null, { withoutEnlargement: true }).webp({ quality: Q }).toBuffer();
  const orig = readFileSync(input).length;
  if (buf.length >= orig) continue; // 沒變小就不換（避免反效果）
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const out = `${basename(file).replace(/\.[a-z]+$/i, '')}-h${width}.${hash}.webp`;
  writeFileSync(join(COVERS, out), buf);
  rename.set(file, out);
  saved += orig - buf.length;
  count++;
}

// 改寫首頁所有對這些 cover 的引用（src 與 data-fallback 不動：fallback 維持 og 圖）
for (const [file, out] of rename) {
  html = html.split('/covers/' + file).join('/covers/' + out);
}

// 編輯精選大圖（feature-img）：全站無寬度上限下，它會被拉到整列寬。手機/平板沿用上面
// 的 900px webp（src 不變→ LCP/流量零退步）；桌機（≥1200px）改用原圖原生寬度的高解 webp
// （最高 ~1536px，withoutEnlargement 不放大）以免在 1600px+/4K 變糊。手法＝把 <img> 包進
// <picture>，只在 ≥1200px 命中 <source>。
let featureFile = null;
for (const tag of tags) {
  if (/feature-img/.test(tag)) {
    const m = tag.match(/src="[^"]*\/covers\/([^"?]+)"/);
    if (m) featureFile = m[1];
  }
}
if (featureFile && existsSync(join(COVERS, featureFile))) {
  const buf = await sharp(join(COVERS, featureFile))
    .resize(1600, null, { withoutEnlargement: true })
    .webp({ quality: Q })
    .toBuffer();
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const outLarge = `${basename(featureFile).replace(/\.[a-z]+$/i, '')}-hlarge.${hash}.webp`;
  writeFileSync(join(COVERS, outLarge), buf);
  // 此時 html 內 feature 的 <img src> 已被改寫成 900px webp；把該 <img> 包進 <picture>
  const featTag = (html.match(/<img\b[^>]*feature-img[^>]*>/) || [])[0];
  if (featTag) {
    const prefix = (featTag.match(/src="([^"]*\/covers\/)/) || [])[1] || '/covers/';
    const picture =
      `<picture><source media="(min-width: 1200px)" srcset="${prefix}${outLarge}" type="image/webp" />` +
      `${featTag}</picture>`;
    html = html.replace(featTag, picture);
    console.log(`[optimize-home-images] feature 大圖 <picture> 換高解：${outLarge}`);
  }
}

writeFileSync(HOME, html);

console.log(
  `[optimize-home-images] ${count} 張首頁圖片縮為 webp，省 ${(saved / 1024).toFixed(0)}KB`,
);
