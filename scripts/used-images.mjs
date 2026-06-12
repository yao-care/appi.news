// 建置期掃所有文章，抽出「已使用的免費圖庫圖」穩定識別，產出 public/admin/used-images.json。
// 編輯器「AI 找圖庫」載入後當 exclude 傳給 worker，避免推薦已用過的圖。
// 識別規則須與 workers/ai-suggest/src/index.ts 的 stockImageId 一致。
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLES_DIR = 'src/content/articles';
const OUT_DIR = 'public/admin';
const OUT_FILE = join(OUT_DIR, 'used-images.json');

const PATTERNS = [
  [/images\.unsplash\.com\/photo-([\w-]+)/g, 'unsplash'],
  [/images\.pexels\.com\/photos\/(\d+)/g, 'pexels'],
];

function collectIds(text, set) {
  for (const [re, provider] of PATTERNS) {
    for (const m of text.matchAll(re)) set.add(`${provider}:${m[1]}`);
  }
}

const ids = new Set();
let files = [];
try {
  files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
} catch {
  console.warn(`[used-images] 找不到 ${ARTICLES_DIR}，輸出空清單`);
}

for (const f of files) {
  try {
    collectIds(readFileSync(join(ARTICLES_DIR, f), 'utf8'), ids);
  } catch {
    /* 略過讀取失敗的單檔 */
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify({ ids: [...ids].sort() }, null, 0));
console.log(`[used-images] ${files.length} 篇文章 → ${ids.size} 個已用圖庫圖 → ${OUT_FILE}`);
