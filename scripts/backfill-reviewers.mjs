#!/usr/bin/env node
/**
 * 回填 src/content/articles/*.md(x) 的 reviewedBy / factCheckedBy。
 *
 *   reviewedBy    ＝ 依分類對照表（src/config/reviewers.ts）的專業審閱者
 *   factCheckedBy ＝ APPI 編輯部（事實查核）
 *
 * 已有值的檔案一律跳過，不覆蓋人工填的內容。插入位置在 frontmatter 的 author/coAuthors 之後，
 * 找不到就插在 frontmatter 結尾前。
 *
 * 用法：node scripts/backfill-reviewers.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const DIR = 'src/content/articles';

// 與 src/config/reviewers.ts 同步。這支是一次性回填腳本，不引 TS 以免多一層 build。
const CATEGORY_REVIEWER = {
  health: 'huang-ziyan',
  finance: 'wu-fang-jun',
  lifestyle: 'luo-yang',
  international: 'luo-yang',
  tech: 'lightman',
  focus: 'lightman',
  sports: 'chou-jingyan',
  columns: null,
};
const FACT_CHECKER_ID = 'appi-editorial';

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
const stats = { changed: 0, skipped: 0, noReviewer: 0, byReviewer: {} };

for (const f of files) {
  const path = join(DIR, f);
  const src = readFileSync(path, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    console.warn(`跳過（無 frontmatter）：${f}`);
    stats.skipped++;
    continue;
  }
  const fm = m[1];
  if (/^reviewedBy:/m.test(fm) && /^factCheckedBy:/m.test(fm)) {
    stats.skipped++;
    continue;
  }

  const catM = fm.match(/^category:\s*"?([a-z-]+)"?\s*$/m);
  if (!catM) {
    console.warn(`跳過（讀不到 category）：${f}`);
    stats.skipped++;
    continue;
  }
  const reviewer = CATEGORY_REVIEWER[catM[1]];
  if (!reviewer) stats.noReviewer++;

  const lines = [];
  if (!/^reviewedBy:/m.test(fm) && reviewer) {
    lines.push(`reviewedBy:\n  - "${reviewer}"`);
  }
  if (!/^factCheckedBy:/m.test(fm)) {
    lines.push(`factCheckedBy:\n  - "${FACT_CHECKER_ID}"`);
  }
  if (lines.length === 0) {
    stats.skipped++;
    continue;
  }
  const block = lines.join('\n');

  // 插在 author（含其後可能的 coAuthors 陣列）之後，讓署名相關欄位聚在一起
  const fmLines = fm.split('\n');
  let insertAt = -1;
  for (let i = 0; i < fmLines.length; i++) {
    if (/^author:/.test(fmLines[i])) {
      insertAt = i + 1;
      // 吃掉緊接其後的 coAuthors 區塊（含 YAML 陣列項）
      if (/^coAuthors:/.test(fmLines[insertAt] ?? '')) {
        insertAt++;
        while (/^\s+-\s/.test(fmLines[insertAt] ?? '')) insertAt++;
      }
      break;
    }
  }
  if (insertAt === -1) insertAt = fmLines.length;
  fmLines.splice(insertAt, 0, block);

  const out = src.replace(m[0], `---\n${fmLines.join('\n')}\n---`);
  if (!DRY) writeFileSync(path, out);
  stats.changed++;
  const key = reviewer ?? '(無審閱者)';
  stats.byReviewer[key] = (stats.byReviewer[key] ?? 0) + 1;
}

console.log(`${DRY ? '[dry-run] ' : ''}回填完成：改 ${stats.changed} 檔、跳過 ${stats.skipped} 檔`);
for (const [k, v] of Object.entries(stats.byReviewer).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
if (stats.noReviewer) console.log(`  （其中 ${stats.noReviewer} 檔的分類未指定專業審閱者）`);
