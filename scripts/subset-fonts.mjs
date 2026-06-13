// 建置期字形子集化：掃描 dist 全站 HTML 實際用到的字形，把繁中 woff2/woff 子集化成
// 僅含用到的字形，再重新雜湊檔名並改寫 CSS/HTML 的引用。
//
// 為何需要：global.css 改用 chinese-traditional 子集進入點後，每權重是「整包繁中字」
// （sans ~1MB、serif ~1.3MB）。本步把它縮到「只含全站實際出現的字」（數十～數百 KB）。
// 重新雜湊是新聞站正確性關鍵：內容會增長，沿用舊檔名會讓回訪者讀到快取舊字型而對新字缺字。
//
// 來源涵蓋：掃整份 HTML（含內文、標題、alt、meta、JSON-LD），確保任何會顯示的中文都納入。
// 前端動態文字（如 admin 編輯器輸入）不在 dist HTML 內，靠字型堆疊末端的系統 CJK 字 fallback。
import { readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import subsetFont from 'subset-font';

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

// 4) 改寫 dist 內所有 CSS/HTML 對舊字型檔名的引用（@font-face src、preload 等）。
let rewritten = 0;
for (const f of listFiles(DIST, ['.css', '.html'])) {
  let text = readFileSync(f, 'utf8');
  let changed = false;
  for (const [oldName, newName] of rename) {
    if (oldName !== newName && text.includes(oldName)) {
      text = text.split(oldName).join(newName);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(f, text);
    rewritten++;
  }
}

// 5) 首頁 LCP 是 hero 文字（intro-desc/intro-title），其字型若與十多張 lazy 圖、
//    其他字重搶頻寬會晚到、swap 晚 → LCP 飆高。對首頁 head 注入這兩個 hero 字型的
//    preload（最終雜湊檔名），讓它們優先抵達。只動 index.html，避免影響以圖片為 LCP 的內頁。
const PRELOAD = [
  /noto-sans-tc-chinese-traditional-400-normal\..*\.woff2$/, // intro-desc 內文
  /noto-serif-tc-chinese-traditional-700-normal\..*\.woff2$/, // intro-title 標題
];
const HOME = join(DIST, 'index.html');
try {
  const woff2 = listFiles(ASTRO_DIR, ['.woff2']);
  const cssTexts = listFiles(DIST, ['.css']).map((f) => readFileSync(f, 'utf8'));
  // 直接用該字型「在 CSS @font-face 裡的實際 url」當 preload href，確保 base path 完全一致
  // （換網域時自動跟著變），避免自行拼前綴出錯。
  function hrefInCss(name) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const css of cssTexts) {
      const m = css.match(new RegExp('url\\(["\']?([^"\')]*' + esc + ')["\']?\\)'));
      if (m) return m[1];
    }
    return null;
  }
  const links = PRELOAD.map((re) => woff2.find((p) => re.test(basename(p))))
    .filter(Boolean)
    .map((p) => hrefInCss(basename(p)))
    .filter(Boolean)
    .map(
      (href) =>
        `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`,
    );
  let html = readFileSync(HOME, 'utf8');
  if (links.length && !html.includes('rel="preload"') ) {
    html = html.replace('</head>', links.join('') + '</head>');
    writeFileSync(HOME, html);
    console.log(`[subset-fonts] 首頁注入 ${links.length} 個 hero 字型 preload`);
  }
} catch (e) {
  console.warn('[subset-fonts] 首頁 preload 注入略過：' + e.message);
}

console.log(
  `[subset-fonts] ${fontFiles.length} 個字型 ${(beforeTotal / 1024 / 1024).toFixed(2)}MB → ${(afterTotal / 1024).toFixed(0)}KB；改寫 ${rewritten} 個 CSS/HTML`,
);
