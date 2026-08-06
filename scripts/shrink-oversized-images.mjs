// 一次性維運：把 public/ 底下過大的 png/jpg **原地**壓縮（副檔名與路徑不變）。
//
// 為什麼需要：GitHub Pages 的 deploy 階段有 600 秒上限，而本站 artifact 已達 335 MB
// （dist 420 MB，其中 png+jpg 555 檔佔 138 MB，多是 WordPress 遷移進來的未壓縮原圖）。
// 2026-08-06 連續四次 `build: success / deploy: failure（Timeout reached）`，全站無法上線。
//
// 為什麼原地壓縮而不是轉 webp：轉檔要改副檔名 → 得改寫每篇文章的引用 → 有壞連結風險。
// 原地壓縮同名同路徑，任何 .md 都不用動，check:links 不受影響，出事 `git checkout` 就還原。
//
// 安全規則：
//   - 只處理 >MIN_BYTES 的檔（小圖壓不出效益，白花時間）。
//   - 寬度超過 MAX_WIDTH 才縮；封面顯示最大約 1200px，留餘裕設 1600。
//   - **壓完比原檔大就不寫回**（有些圖已經最佳化過，重壓反而變大）。
//   - 有 alpha 的 png 保留 alpha（不轉調色盤），避免透明背景變黑。
//
// 用法：node scripts/shrink-oversized-images.mjs [--go]   # 不帶 --go 為 dry-run
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const GO = process.argv.includes('--go');
const MIN_BYTES = 150 * 1024;
const MAX_WIDTH = 1600;
const DIRS = ['public/images', 'public/covers'];

function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(png|jpe?g)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const files = DIRS.flatMap(walk).filter((f) => {
  try { return statSync(f).size > MIN_BYTES; } catch { return false; }
});

let before = 0, after = 0, changed = 0, skipped = 0;
for (const f of files) {
  const orig = statSync(f).size;
  before += orig;
  try {
    const img = sharp(f);
    const m = await img.metadata();
    let pipe = sharp(f);
    if (m.width > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    const isPng = extname(f).toLowerCase() === '.png';
    const buf = await (isPng
      ? pipe.png({ compressionLevel: 9, palette: !m.hasAlpha })
      : pipe.jpeg({ quality: 82, mozjpeg: true })).toBuffer();
    if (buf.length >= orig) { after += orig; skipped++; continue; } // 壓不小就不動
    if (GO) writeFileSync(f, buf);
    after += buf.length;
    changed++;
  } catch (e) {
    after += orig;
    skipped++;
    console.error(`  ⚠ 略過 ${f}：${e.message}`);
  }
}

const mb = (n) => (n / 1048576).toFixed(0);
console.log(
  `${GO ? '已壓縮' : 'DRY RUN'}：掃 ${files.length} 檔（>${MIN_BYTES / 1024}KB）→ 壓縮 ${changed}、略過 ${skipped}\n` +
  `總量 ${mb(before)} MB → ${mb(after)} MB（省 ${mb(before - after)} MB）`,
);
