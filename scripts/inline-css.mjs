// postbuild：走遍 dist 全站 HTML，把 _astro render-blocking CSS 內聯（排除 choice/admin）。
// 由 inline-home-css.mjs 通用化而來；首頁也走同一支。須在 subset-fonts/optimize-* 之後跑。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { inlineCssLinks } from './lib/inline-css.mjs';

const DIST = 'dist';
const EXCLUDE_TOP = ['choice', 'admin']; // 第一層目錄排除（choice 有 ~592KB CSS）

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkHtml(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const cssCache = new Map();
function getCss(file) {
  if (cssCache.has(file)) return cssCache.get(file);
  const p = join(DIST, '_astro', file);
  const v = existsSync(p) ? readFileSync(p, 'utf8') : null;
  cssCache.set(file, v);
  return v;
}

const pages = walkHtml(DIST).filter((p) => {
  const top = relative(DIST, p).split(sep)[0];
  return !EXCLUDE_TOP.includes(top);
});

let files = 0;
let totalInlined = 0;
let totalBytes = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const { html: out, inlined, bytes } = inlineCssLinks(html, getCss);
  if (inlined) {
    writeFileSync(p, out);
    files++;
    totalInlined += inlined;
    totalBytes += bytes;
  }
}
console.log(
  `[inline-css] ${files} 頁內聯 ${totalInlined} 個 CSS（${(totalBytes / 1024).toFixed(0)}KB），移除 render-blocking link`,
);
