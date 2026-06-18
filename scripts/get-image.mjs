// 取得文章配圖（整合：圖庫優先 / AI 生成）。
//
// 規則（見 .claude/skills/newsroom/SKILL.md 與記憶 newsroom-image-stock-first-taiwanese-people）：
//   - 概念/物件/場景圖（無人物）：先搜圖庫（Unsplash/Pexels），命中合適圖才用；
//     找不到、無金鑰或下載失敗 → 退回 AI 生成。
//   - 人物圖（--people）：直接 AI 生成，由模組強制「台灣人」鐵律（圖庫難保證台灣人臉孔）。
//
// 用法:
//   node scripts/get-image.mjs --topic "段落主題" --context "文章脈絡" \
//        --out public/images/<slug>-s<N>.webp [--width 960] [--query "english stock query"] [--people] [--dry-run]
// 輸出: 一行 JSON：{ mode:"stock"|"generated", reason, file, src, width, height, tag, credit?, source?, pageUrl? }
//   mode=stock 時附 credit/source/pageUrl（封面請寫進 coverImageCredit；圖庫授權允許免署名，內文可省）。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateImage, imgTag, toWebp } from './lib/ai-image.mjs';
import { searchStock } from './lib/stock.mjs';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(`--${name}`);

const topic = arg('topic');
const context = arg('context', '');
let out = arg('out');
const width = Number(arg('width', '960'));
const query = arg('query', topic);
const wantPeople = has('people');
const dryRun = has('dry-run');

if (!topic || !out) {
  console.error('need --topic and --out');
  process.exit(1);
}
if (!Number.isFinite(width)) {
  console.error('--width must be a number');
  process.exit(1);
}
// 一律輸出 webp（圖庫圖也轉 webp，確保 CLS 安全的尺寸與檔案大小）
out = out.replace(/\.(jpe?g|png|webp)$/i, '') + '.webp';
const src = '/' + out.replace(/^public\//, '');

/** AI 生成（人物鐵律由模組強制）→ 寫檔 → 回 result。 */
async function generate(reason) {
  if (dryRun) return { mode: 'generated', reason, file: out, src, dry: true };
  const { buffer, width: w, height: h } = await generateImage({ topic, context, width });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buffer);
  return { mode: 'generated', reason, file: out, src, width: w, height: h, tag: imgTag({ src, width: w, height: h, alt: '' }) };
}

/** 下載一張圖庫候選 → webp → 寫檔。失敗回 null。 */
async function tryStock(cand) {
  if (dryRun) return { mode: 'stock', file: out, src, credit: cand.credit, source: cand.source, pageUrl: cand.pageUrl, description: cand.description, dry: true };
  let raw;
  try {
    const res = await fetch(cand.downloadUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    raw = Buffer.from(await res.arrayBuffer());
    if (raw.length < 5000) return null; // 過小 = 多半不是真圖
  } catch {
    return null;
  }
  let webp;
  try {
    webp = await toWebp(raw, width);
  } catch {
    return null;
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, webp.buffer);
  return {
    mode: 'stock',
    file: out,
    src,
    width: webp.width,
    height: webp.height,
    tag: imgTag({ src, width: webp.width, height: webp.height, alt: '' }),
    credit: cand.credit,
    source: cand.source,
    pageUrl: cand.pageUrl,
    description: cand.description,
  };
}

async function main() {
  // 人物圖：直接生成（保證台灣人）。
  if (wantPeople) {
    return generate('people');
  }
  // 概念圖：先圖庫。無金鑰 / 搜尋失敗 / 無候選 / 下載失敗 → 退回生成。
  let candidates = [];
  try {
    const { unsplash, pexels } = await searchStock(query, 8);
    // 交錯兩家來源，提高命中相關圖的機會
    const max = Math.max(unsplash.length, pexels.length);
    for (let i = 0; i < max; i++) {
      if (unsplash[i]?.downloadUrl) candidates.push(unsplash[i]);
      if (pexels[i]?.downloadUrl) candidates.push(pexels[i]);
    }
  } catch {
    return generate('no-stock-keys');
  }
  if (!candidates.length) return generate('no-stock-result');
  // 依序試前幾張，第一張成功就用
  for (const cand of candidates.slice(0, 4)) {
    const r = await tryStock(cand);
    if (r) return r;
  }
  return generate('stock-fetch-failed');
}

main()
  .then((r) => console.log(JSON.stringify(r)))
  .catch((e) => {
    console.error(`get-image 失敗：${e.message}`);
    process.exit(1);
  });
