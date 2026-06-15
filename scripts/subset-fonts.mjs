// 建置期字形子集化：掃描 dist 全站 HTML 實際用到的字形，把繁中 woff2/woff 子集化成
// 僅含用到的字形，再重新雜湊檔名並改寫 CSS/HTML 的引用。
//
// 為何需要：global.css 改用 chinese-traditional 子集進入點後，每權重是「整包繁中字」
// （sans ~1MB、serif ~1.3MB）。本步把它縮到「只含全站實際出現的字」（數十～數百 KB）。
// 重新雜湊是新聞站正確性關鍵：內容會增長，沿用舊檔名會讓回訪者讀到快取舊字型而對新字缺字。
//
// 來源涵蓋：掃整份 HTML（含內文、標題、alt、meta、JSON-LD），確保任何會顯示的中文都納入。
// 前端動態文字（如 admin 編輯器輸入）不在 dist HTML 內，靠字型堆疊末端的系統 CJK 字 fallback。
import { readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import subsetFont from 'subset-font';
import { pageUsedText, fontStackSwap, miniStyleTag } from './lib/mini-fonts.mjs';

const DIST = 'dist';
const ASTRO_DIR = join(DIST, '_astro');
// 只處理繁中整包字型（要被子集化的大檔）；Inter latin 子集已小，維持原樣。
const TARGET_RE = /chinese-traditional.*\.(woff2|woff)$/;

// 基線白名單：ASCII 可見字 + 常見半形/全形標點、數字、CJK 標點，避免邊角/動態文字缺字。
function baselineChars() {
  let s = '';
  for (let c = 0x20; c <= 0x7e; c++) s += String.fromCodePoint(c); // ASCII printable
  for (let c = 0x3000; c <= 0x303f; c++) s += String.fromCodePoint(c); // CJK 標點
  for (let c = 0xff00; c <= 0xffef; c++) s += String.fromCodePoint(c); // 全形 ASCII/標點
  s += '　、。．，；：？！「」『』（）〔〕【】《》〈〉—…‧·‵′″“”‘’–§¶†‡•○●◎◇◆□■△▲▽▼☆★※←↑→↓№℃℉°±×÷';
  return s;
}

// 遞迴列出 dist 下符合副檔名的檔案（Node 22 readdirSync recursive）。
function listFiles(dir, exts) {
  const out = [];
  for (const rel of readdirSync(dir, { recursive: true })) {
    const p = join(dir, rel);
    if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

// 1) 收集全站用到的字形（逐 code point，正確處理 surrogate pair）。
const used = new Set();
for (const ch of baselineChars()) used.add(ch);
const htmlFiles = listFiles(DIST, ['.html']);
for (const f of htmlFiles) {
  for (const ch of readFileSync(f, 'utf8')) used.add(ch);
}
const usedText = [...used].join('');
console.log(`[subset-fonts] 掃描 ${htmlFiles.length} 個 HTML → ${used.size} 個唯一字形`);

// 2) 找出要子集化的繁中字型檔。
const fontFiles = listFiles(ASTRO_DIR, ['.woff2', '.woff']).filter((p) =>
  TARGET_RE.test(basename(p)),
);
if (fontFiles.length === 0) {
  console.warn('[subset-fonts] 找不到 chinese-traditional 字型檔，略過（import 是否已切換？）');
  process.exit(0);
}

// 3) 逐檔子集化 + 重新雜湊檔名，建立 舊檔名→新檔名 對照表。
const rename = new Map(); // oldBasename -> newBasename
let beforeTotal = 0;
let afterTotal = 0;
for (const file of fontFiles) {
  const buf = readFileSync(file);
  const ext = file.endsWith('.woff2') ? 'woff2' : 'woff';
  const sub = await subsetFont(buf, usedText, { targetFormat: ext });

  const oldName = basename(file);
  // oldName 形如 <base>.<astroHash>.<ext>；剝掉 astroHash，換上子集內容雜湊。
  const noExt = oldName.replace(/\.(woff2|woff)$/, '');
  const base = noExt.includes('.') ? noExt.slice(0, noExt.lastIndexOf('.')) : noExt;
  const hash = createHash('sha256').update(sub).digest('hex').slice(0, 8);
  const newName = `${base}.${hash}.${ext}`;

  writeFileSync(join(dirname(file), newName), sub);
  if (newName !== oldName) rmSync(file);
  rename.set(oldName, newName);

  beforeTotal += buf.length;
  afterTotal += sub.length;
  console.log(
    `[subset-fonts]   ${oldName} ${(buf.length / 1024).toFixed(0)}KB → ${newName} ${(sub.length / 1024).toFixed(0)}KB`,
  );
}

// 4) 改寫 dist 內所有 CSS/HTML 對舊字型檔名的引用（@font-face src）；
//    並把繁中 @font-face 的 font-display 由 swap 改 optional：CJK 字型大，slow-4G 下
//    swap 會讓 LCP 文字等字型晚到才重繪（LCP 飆高）。optional = 首次未命中即用系統
//    fallback 字型立即定版（LCP≈FCP），字型背景載入、之後（已快取）才顯示品牌字。
let rewritten = 0;
for (const f of listFiles(DIST, ['.css', '.html'])) {
  let text = readFileSync(f, 'utf8');
  const before = text;
  for (const [oldName, newName] of rename) {
    if (oldName !== newName && text.includes(oldName)) text = text.split(oldName).join(newName);
  }
  if (f.endsWith('.css')) {
    text = text.replace(/@font-face\{[^}]*\}/g, (block) =>
      block.includes('chinese-traditional')
        ? block.replace(/font-display:\s*swap/g, 'font-display:optional')
        : block,
    );
  }
  if (text !== before) {
    writeFileSync(f, text);
    rewritten++;
  }
}

// 逐頁迷你字型：為指定頁產「只含該頁用字」的子集（每權重一檔，檔名帶內容 hash），
// inline @font-face（獨立 family）+ :root 覆蓋（把站台 web font 從棧中換掉，避免 optional 後備抓大字型）。
const MINI_WEIGHTS = [
  { serif: false, w: 400, re: /noto-sans-tc-chinese-traditional-400-normal\..*\.woff2$/ },
  { serif: false, w: 500, re: /noto-sans-tc-chinese-traditional-500-normal\..*\.woff2$/ },
  { serif: false, w: 700, re: /noto-sans-tc-chinese-traditional-700-normal\..*\.woff2$/ },
  { serif: true, w: 600, re: /noto-serif-tc-chinese-traditional-600-normal\..*\.woff2$/ },
  { serif: true, w: 700, re: /noto-serif-tc-chinese-traditional-700-normal\..*\.woff2$/ },
];

function miniFontCtx() {
  const cssAll = listFiles(DIST, ['.css']).map((f) => readFileSync(f, 'utf8')).join('\n');
  const woff2now = listFiles(ASTRO_DIR, ['.woff2']);
  const hrefFor = (name) => {
    const m = cssAll.match(new RegExp('url\\(["\']?([^"\')]*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'));
    return m ? m[1] : null;
  };
  const varVal = (v) => {
    const m = cssAll.match(new RegExp('--font-' + v + ':\\s*([^;]+);'));
    return m ? m[1].trim() : null;
  };
  return { woff2now, hrefFor, varVal, sansVal: varVal('sans'), serifVal: varVal('serif'), cache: new Map() };
}

async function injectMiniFonts(htmlPath, ctx, families = { sans: 'NotoSansTC-Pg', serif: 'NotoSerifTC-Pg' }) {
  const html0 = readFileSync(htmlPath, 'utf8');
  if (!html0.includes('</head>')) return 0;
  const text = pageUsedText(html0, baselineChars());
  const faces = [];
  for (const wt of MINI_WEIGHTS) {
    const src = ctx.woff2now.find((p) => wt.re.test(basename(p)));
    if (!src) continue;
    const cacheKey = `${basename(src)}::${createHash('sha256').update(text).digest('hex').slice(0, 16)}`;
    let name = ctx.cache.get(cacheKey);
    if (!name) {
      const sub = await subsetFont(readFileSync(src), text, { targetFormat: 'woff2' });
      const hash = createHash('sha256').update(sub).digest('hex').slice(0, 8);
      name = basename(src).replace(/\.woff2$/, '') + `-pg.${hash}.woff2`;
      writeFileSync(join(ASTRO_DIR, name), sub);
      ctx.cache.set(cacheKey, name);
    }
    const prefix = (ctx.hrefFor(basename(src)) || '/_astro/' + basename(src)).replace(/[^/]*$/, '');
    const fam = wt.serif ? families.serif : families.sans;
    faces.push(`@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt.w};font-display:optional;src:url(${prefix}${name}) format('woff2')}`);
  }
  const overrides = [];
  if (ctx.sansVal) overrides.push(`--font-sans:${fontStackSwap(ctx.sansVal, 'Noto Sans TC', families.sans)}`);
  if (ctx.serifVal) overrides.push(`--font-serif:${fontStackSwap(ctx.serifVal, 'Noto Serif TC', families.serif)}`);
  const style = miniStyleTag(faces, overrides);
  if (!style) return 0;
  writeFileSync(htmlPath, html0.replace('</head>', style + '</head>'));
  return faces.length;
}

// 首頁（行為等效於舊版；family 名改為 Pg 但效果相同）。
const miniCtx = miniFontCtx();
let homeInjected = 0;
try {
  homeInjected = await injectMiniFonts(join(DIST, 'index.html'), miniCtx);
  console.log(`[subset-fonts] 首頁迷你字型：${homeInjected} 權重`);
} catch (e) {
  console.warn('[subset-fonts] 首頁迷你字型略過：' + e.message);
}

// PILOT：先驗 5 篇文章，部署後 PSI 量測決定是否全量。
const PILOT = ['post-638', 'post-643', 'post-700', 'post-748', 'post-282'];
let pilotN = 0;
for (const slug of PILOT) {
  const p = join(DIST, 'articles', slug, 'index.html');
  try {
    if (existsSync(p) && (await injectMiniFonts(p, miniCtx))) pilotN++;
  } catch (e) {
    console.warn(`[subset-fonts] pilot ${slug} 略過：${e.message}`);
  }
}
console.log(`[subset-fonts] pilot 迷你字型：${pilotN} 頁`);

console.log(
  `[subset-fonts] ${fontFiles.length} 個字型 ${(beforeTotal / 1024 / 1024).toFixed(2)}MB → ${(afterTotal / 1024).toFixed(0)}KB；改寫 ${rewritten} 個 CSS/HTML；首頁迷你字型 ${homeInjected} 權重`,
);

