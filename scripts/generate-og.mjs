/**
 * 產生 OG fallback 圖（1200×630 PNG）→ public/og/
 * 為避免 CI 缺中文字型，文字一律使用拉丁字（英文分類名 + 品牌字樣）。
 * 本地執行一次後 commit，build/CI 不重新產生。
 *   pnpm generate:og
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og');

const BRAND = '#1f3a5f';

const TARGETS = [
  { name: 'default', label: '', color: BRAND },
  { name: 'home', label: '', color: BRAND },
  { name: 'focus', label: 'Focus', color: '#1f6feb' },
  { name: 'health', label: 'Health', color: '#11a884' },
  { name: 'tech', label: 'Tech', color: '#6e40c9' },
  { name: 'finance', label: 'Finance', color: '#b08800' },
  { name: 'society', label: 'Society', color: '#cf4a2d' },
  { name: 'sports', label: 'Sports', color: '#1a7f6b' },
  { name: 'lifestyle', label: 'Lifestyle', color: '#bf5b9b' },
  { name: 'columns', label: 'Columns', color: '#57606a' },
  { name: 'author', label: 'Author', color: BRAND },
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function svg({ label, color }) {
  const W = 1200;
  const H = 630;
  // 淺藍灰雅緻：淺底漸層 + 藏青品牌字 + 金色點綴 + 分類色名（保留辨識），對標 K 風格
  const ink = '#1f3a5f'; // 藏青：品牌字
  const gold = '#a87515'; // 金：點綴線與細框
  const sub = '#64708a'; // 中灰藍：副標
  const labelColor = label ? color : ink; // 有分類用分類色名（辨識），無分類用藏青
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f9fc"/>
      <stop offset="1" stop-color="#e9eef5"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="64" y="64" width="${W - 128}" height="${H - 128}" rx="20" fill="none" stroke="${gold}" stroke-opacity="0.45" stroke-width="2"/>
  <text x="100" y="170" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="${ink}" letter-spacing="2">APPI News</text>
  <text x="100" y="230" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${sub}">Asia-Pacific Press &amp; Insight</text>
  ${label ? `<text x="100" y="540" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="${labelColor}">${esc(label)}</text>` : `<text x="100" y="540" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="${ink}">亞太專業觀點</text>`}
  <rect x="100" y="${label ? 270 : 290}" width="120" height="6" fill="${gold}"/>
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
