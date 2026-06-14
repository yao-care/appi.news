// 建置期首頁 critical-CSS 內聯：首頁有 3 個 render-blocking 外部 CSS（~28KB），
// slow-4G 下每個都在首屏關鍵路徑上（額外往返 + 傳輸）拖慢 FCP。
// 把它們的內容（已由 subset-fonts 處理過 font-display/檔名）直接內聯進 <head>、
// 移除外部 <link>，首屏只需 HTML 一個往返。CSS 完整內聯故無 FOUC。
// 只動首頁；外部 .css 檔保留（內頁仍用、可快取）。須在 subset-fonts/optimize-images 之後跑。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HOME = 'dist/index.html';
let html = readFileSync(HOME, 'utf8');

// 只內聯指向 _astro 的 render-blocking stylesheet（避免誤動其他 link）
const linkRe = /<link\b[^>]*\brel="stylesheet"[^>]*>/g;
let inlined = 0;
let bytes = 0;
for (const link of html.match(linkRe) || []) {
  const fileM = link.match(/href="[^"]*\/_astro\/([^"]+\.css)"/);
  if (!fileM) continue;
  const cssPath = join('dist', '_astro', fileM[1]);
  if (!existsSync(cssPath)) continue;
  const css = readFileSync(cssPath, 'utf8');
  // 取代為內聯 <style>（保持原位置順序；首頁迷你字型的 :root override 仍在其後生效）
  html = html.replace(link, `<style>${css}</style>`);
  inlined++;
  bytes += css.length;
}

if (inlined) {
  writeFileSync(HOME, html);
  console.log(`[inline-home-css] 內聯 ${inlined} 個 CSS（${(bytes / 1024).toFixed(0)}KB），移除首頁 render-blocking link`);
} else {
  console.log('[inline-home-css] 無可內聯的 CSS');
}
