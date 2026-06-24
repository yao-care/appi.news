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
//   國際線「嵌入可授權原圖」（只接受白名單來源，否則 fail-closed 退非零）:
//   node scripts/get-image.mjs --topic "..." --out public/images/x.webp \
//        --embed-url "https://upload.wikimedia.org/...jpg" --credit "作者 — CC BY-SA 4.0, Wikimedia Commons" --page-url "https://commons.wikimedia.org/..."
// 輸出: 一行 JSON：{ mode:"stock"|"generated"|"embedded", reason, file, src, width, height, tag, credit?, source?, pageUrl?, license? }
//   mode=stock 時附 credit/source/pageUrl（封面請寫進 coverImageCredit；圖庫授權允許免署名，內文可省）。
//   mode=embedded 時 credit 為必填（嵌入原圖一律署名），license/source 記錄授權與來源。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateImage, imgTag, toWebp } from './lib/ai-image.mjs';
import { searchStock } from './lib/stock.mjs';
import { classifyImageSource } from './lib/image-sources.mjs';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(`--${name}`);

const topic = arg('topic');
const context = arg('context', '');
let out = arg('out');
// 封面（covers/）需 ≥1200px（Discover/Top Stories 大圖門檻）；內文圖（images/）維持 960
// （單篇多圖、且無 postbuild 縮圖，控文章頁重量）。--width 明確帶入時一律以其為準。
const isCover = /(^|\/)covers\//.test(String(out ?? ''));
const width = Number(arg('width', isCover ? '1200' : '960'));
const query = arg('query', topic);
const wantPeople = has('people');
const dryRun = has('dry-run');
const embedUrl = arg('embed-url');
const credit = arg('credit');
const pageUrl = arg('page-url');

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

/**
 * 嵌入可授權原圖：只接受白名單來源（image-sources.mjs），否則 fail-closed 退非零，
 * 讓起草端據此退回圖庫/AI。署名為必填（嵌入原圖一律署名）。
 */
async function embed() {
  const cls = classifyImageSource(embedUrl);
  if (!cls.allowed) {
    console.error(`embed 來源未授權，拒絕嵌入：${cls.reason}`);
    process.exit(2); // 非 1：與一般錯誤區分，代表「來源不在白名單、請改用圖庫/AI」
  }
  if (!credit || !credit.trim()) {
    console.error(`embed 需 --credit（嵌入原圖一律署名）。此來源署名格式：${cls.source.creditHint}`);
    process.exit(1);
  }
  if (dryRun) {
    return { mode: 'embedded', file: out, src, credit: credit.trim(), license: cls.source.license, source: cls.source.id, pageUrl: pageUrl || embedUrl, dry: true };
  }
  let raw;
  try {
    const res = await fetch(embedUrl, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.error(`embed 下載失敗 HTTP ${res.status}`);
      process.exit(1);
    }
    raw = Buffer.from(await res.arrayBuffer());
    if (raw.length < 5000) {
      console.error('embed 下載檔過小，疑似非圖片');
      process.exit(1);
    }
  } catch (e) {
    console.error(`embed 下載錯誤：${e.message}`);
    process.exit(1);
  }
  const webp = await toWebp(raw, width);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, webp.buffer);
  return {
    mode: 'embedded',
    file: out,
    src,
    width: webp.width,
    height: webp.height,
    tag: imgTag({ src, width: webp.width, height: webp.height, alt: '' }),
    credit: credit.trim(),
    license: cls.source.license,
    source: cls.source.id,
    pageUrl: pageUrl || embedUrl,
  };
}

async function main() {
  // 嵌入可授權原圖（國際線）：白名單把關，非白名單退非零→起草端改圖庫/AI。
  if (embedUrl) {
    return embed();
  }
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
