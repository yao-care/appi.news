#!/usr/bin/env node
/**
 * 封面規格守門：coverImage 必須是站內檔案、橫式、寬 ≥1200（Discover/Top Stories 大圖門檻）。
 * 規格 SOT＝scripts/lib/cover-spec.mjs；為什麼＝docs/lessons/discover-image-and-meta-signals.md。
 *
 * 判定（只看有沒有設 coverImage，「必須有封面」是各產線自己的規則，這裡不管）：
 *   - 沒設 coverImage → 通過（警消暖聞等 roundup 允許無封面）
 *   - coverImage 是外部網址 → 擋（熱連結繞過所有尺寸保證，對方撤圖即破圖）
 *   - 檔案不存在 → 擋
 *   - 尺寸不符規格（寬 <1200 或非橫式）→ 擋
 *
 * 用法：
 *   node scripts/check-cover-spec.mjs <file.md> [file…]   # 產線寫檔後 spawnSync 自檢（失敗 exit 1）
 *   node scripts/check-cover-spec.mjs --all               # 盤點全部存量（report-only，永遠 exit 0）
 *
 * 刻意**不接進 pnpm build**：存量有大量歷史封面不符規格（盤點用 --all），
 * grandfather 策略同 check-content.mjs——只有「新產出」在各產線 gate 被硬擋。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import { checkCoverFile } from './lib/cover-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'src/content/articles');

/** 讀 frontmatter 的 coverImage（讀不到 frontmatter → null，交給 build 的 zod 去炸） */
function coverOf(file) {
  const m = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  try {
    const data = yaml.load(m[1]);
    return data?.coverImage ? String(data.coverImage) : null;
  } catch {
    return null;
  }
}

/** 單檔檢查 → 通過回 null，否則回原因字串 */
async function problemOf(file) {
  const cover = coverOf(file);
  if (!cover) return null; // 無封面：規格 gate 不管「必須有」，那是各產線的規則
  if (/^https?:\/\//i.test(cover)) {
    return `coverImage 是外部熱連結（${cover}）：繞過尺寸保證且對方撤圖即破圖，請下載自我托管`;
  }
  const abs = path.join(ROOT, 'public', cover.replace(/^\//, ''));
  if (!existsSync(abs)) return `coverImage 檔不存在：public/${cover.replace(/^\//, '')}`;
  const r = await checkCoverFile(abs);
  if (!r.ok) return `封面不符 Discover 規格：${r.problem}。請換一張橫式、寬 ≥1200px 的圖`;
  return null;
}

const args = process.argv.slice(2);

if (args.includes('--all')) {
  // 存量盤點（report-only）：給回填工作排清單用，不擋任何流程。
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  const bad = [];
  for (const f of files) {
    const p = await problemOf(path.join(ARTICLES_DIR, f));
    if (p) bad.push([f, p]);
  }
  for (const [f, p] of bad) console.log(`${f}: ${p}`);
  console.log(`\n共 ${files.length} 篇，封面不符規格 ${bad.length} 篇（report-only，不擋）`);
  process.exit(0);
}

const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.log('check-cover-spec：未指定檔案（產線自檢請帶文章路徑；盤點存量用 --all）');
  process.exit(0);
}

let failed = false;
for (const f of files) {
  const abs = path.isAbsolute(f) ? f : path.join(ROOT, f);
  if (!existsSync(abs)) {
    console.error(`check-cover-spec：找不到檔案 ${f}`);
    failed = true;
    continue;
  }
  const p = await problemOf(abs);
  if (p) {
    console.error(`✖ ${path.basename(f)}: ${p}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
