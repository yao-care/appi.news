/**
 * 內部壞連結檢查（上線 gate）。
 * 掃描 dist/ 內所有 HTML 的站內 href/src，解析到實際輸出檔；
 * 有任何壞連結即 exit 1，讓 GitHub Actions 部署失敗、退回、不上線。
 *
 * 為 base-path（/appi.news）感知版本：會先去掉 base 前綴再對應到 dist 檔案。
 *   pnpm check:links
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE = '/appi.news';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const allFiles = walk(DIST);
const existing = new Set(
  allFiles.map((p) => '/' + relative(DIST, p).split(sep).join('/')),
);

function candidates(target) {
  let path = target;
  if (path.startsWith(BASE)) path = path.slice(BASE.length);
  if (!path.startsWith('/')) return null; // 相對連結略過
  path = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (path.endsWith('/')) return [path + 'index.html'];
  return [path, path + '/index.html', path + '.html'];
}

const ATTR = /(?:href|src)\s*=\s*"([^"]*)"/g;
const htmlFiles = allFiles.filter((p) => p.endsWith('.html'));
const broken = new Map();
let checked = 0;

for (const hf of htmlFiles) {
  const rel = '/' + relative(DIST, hf).split(sep).join('/');
  const txt = readFileSync(hf, 'utf8');
  let m;
  while ((m = ATTR.exec(txt))) {
    let t = m[1]
      .replace(/&amp;/g, '&')
      .replace(/&#38;/g, '&')
      .trim();
    if (!t) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:|#)/.test(t)) continue;
    if (!t.startsWith('/')) continue; // 站內一律用 base 絕對連結
    const cands = candidates(t);
    if (!cands) continue;
    checked++;
    if (!cands.some((c) => existing.has(c))) {
      if (!broken.has(t)) broken.set(t, new Set());
      broken.get(t).add(rel);
    }
  }
}

console.log(`掃描 ${htmlFiles.length} 個 HTML、${checked} 條站內連結`);

if (broken.size === 0) {
  console.log('✓ 無內部壞連結');
  process.exit(0);
}

console.error(`✗ 發現 ${broken.size} 種內部壞連結：`);
for (const [link, srcs] of [...broken].slice(0, 60)) {
  const list = [...srcs].slice(0, 2).join(', ');
  console.error(`  ${link}  ← ${list}${srcs.size > 2 ? ` 等 ${srcs.size} 處` : ''}`);
}
if (broken.size > 60) console.error(`  …另有 ${broken.size - 60} 種未列出`);
process.exit(1);
