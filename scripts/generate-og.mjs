/**
 * 產生 OG fallback 圖（1200×630 PNG）→ public/og/
 *
 * 設計對齊網站本體（src/components/blocks/SiteHeader.astro、src/styles/global.css）：
 *   - Wordmark：APPI（藏青 --appi-brand）＋ News（金 --appi-accent），字體 Inter 800
 *   - 品牌標記：藏青漸層圓角方塊內白色 A ＋ 右下金色點
 *   - 中文字樣：Noto Serif TC（站內 h1–h4 為襯線）
 *
 * 採「置中安全區」構圖：主視覺集中在中央 630×630 正方形內，
 * 因 LINE / WhatsApp 等通訊軟體常把 1200×630 寬圖裁成方形小縮圖，
 * 靠邊構圖會被切爛（舊版症狀）。置中後大圖與方縮圖都完整。
 *
 * 字型走系統字（fontconfig）：本機需安裝 Inter 與 Noto Serif/Sans TC，
 * 缺字時 fontconfig 會替換，視覺會跑掉。本地執行一次後 commit，build/CI 不重新產生。
 *   pnpm generate:og
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og');

// 品牌色票（與 src/styles/global.css 的 --appi-* 一致）
const BRAND = '#1f3a5f'; // 藏青 --appi-brand
const BRAND_LIGHT = '#2d5286'; // --appi-brand-light
const GOLD = '#a87515'; // 金 --appi-accent
const SUB = '#64708a'; // 中灰藍：副標
const WHITE = '#ffffff';

// 字型堆疊（對齊網站：Latin = Inter，中文標題 = Noto Serif TC）
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const SERIF = "'Noto Serif TC', 'Songti TC', Georgia, serif";

const TARGETS = [
  { name: 'default', label: '' },
  { name: 'home', label: '' },
  { name: 'focus', label: 'Focus' },
  { name: 'international', label: 'International' },
  { name: 'health', label: 'Health' },
  { name: 'tech', label: 'Tech' },
  { name: 'finance', label: 'Finance' },
  { name: 'sports', label: 'Sports' },
  { name: 'lifestyle', label: 'Lifestyle' },
  { name: 'columns', label: 'Columns' },
  { name: 'author', label: 'Author' },
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function svg({ label }) {
  const W = 1200;
  const H = 630;
  const cx = W / 2; // 水平中心；所有主視覺以此置中，確保方形裁切仍完整
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f9fc"/>
      <stop offset="1" stop-color="#e9eef5"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND}"/>
      <stop offset="1" stop-color="${BRAND_LIGHT}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="64" y="64" width="${W - 128}" height="${H - 128}" rx="20" fill="none" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="2"/>

  <!-- 品牌標記：藏青圓角方塊 + 白色 A + 右下金點（對齊站頭 .brand-mark） -->
  <rect x="${cx - 46}" y="150" width="92" height="92" rx="18" fill="url(#mark)"/>
  <text x="${cx}" y="216" text-anchor="middle" font-family="${SANS}" font-size="58" font-weight="800" fill="${WHITE}">A</text>
  <circle cx="${cx + 34}" cy="232" r="9" fill="${GOLD}" stroke="${WHITE}" stroke-width="2"/>

  <!-- Wordmark：APPI（藏青）+ News（金），Inter 800 -->
  <text x="${cx}" y="330" text-anchor="middle" font-family="${SANS}" font-size="78" font-weight="800" letter-spacing="-1"><tspan fill="${BRAND}">APPI</tspan><tspan fill="${GOLD}" dx="16">News</tspan></text>

  <!-- 金色點綴線 -->
  <rect x="${cx - 64}" y="362" width="128" height="6" rx="3" fill="${GOLD}"/>

  ${label
    ? `<text x="${cx}" y="468" text-anchor="middle" font-family="${SANS}" font-size="72" font-weight="800" fill="${BRAND}">${esc(label)}</text>`
    : `<text x="${cx}" y="462" text-anchor="middle" font-family="${SERIF}" font-size="58" font-weight="700" fill="${BRAND}">亞太專業觀點</text>`}
  <text x="${cx}" y="${label ? 516 : 518}" text-anchor="middle" font-family="${SANS}" font-size="28" fill="${SUB}">Asia-Pacific Press &amp; Insight</text>
</svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const t of TARGETS) {
    const buf = Buffer.from(svg(t));
    const out = join(OUT, `${t.name}.png`);
    await sharp(buf).png().toFile(out);
    console.log('產生', out);
  }
  console.log('OG fallback 圖產生完成。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
