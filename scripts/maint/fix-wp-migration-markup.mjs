#!/usr/bin/env node
// 一次性掃修 WP→Astro 遷移遺留的破損 inline HTML（保守版：只改 100% 確定的，曖昧整檔跳過並記錄）。
// 型態 A：頂部沒包 HTML 的重複裸問句 FAQ（且該問句在檔內再次出現＝有底部真 FAQ，刪頂部安全）
// 型態 B：巢狀 <table><table> … </table> … </table>（刪外層開＋其後第 2 個 </table>）
// 型態 C：跑進 <blockquote> 的 <hr>（<hr> 緊接 </blockquote> → 移到 </blockquote> 之後）
// 用法：node fix-wp-migration-markup.mjs [--dry-run] [--only wp-426,wp-428]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'content', 'articles');
const DRY = process.argv.includes('--dry-run');
const onlyArg = process.argv.indexOf('--only');
const ONLY = onlyArg >= 0 ? new Set(process.argv[onlyArg + 1].split(',')) : null;

const skipped = []; // {file, pattern, reason}
const stats = { A: 0, B: 0, C: 0, D: 0, filesA: 0, filesB: 0, filesC: 0, filesD: 0, filesChanged: 0 };

function splitFrontmatter(text) {
  // 期望格式：--- \n fm \n --- \n body
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const afterClose = text.indexOf('\n', end + 1); // 第二個 --- 那行的行尾
  if (afterClose < 0) return null;
  return { head: text.slice(0, afterClose + 1), body: text.slice(afterClose + 1) };
}

// 型態 A：刪頂部重複裸問句 FAQ
function fixTopFaq(body, file) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++; // 跳過前導空行
  // 收集 lead block：從 i 起連續非空行，到下一個空行
  let j = i;
  const block = [];
  while (j < lines.length && lines[j].trim() !== '') { block.push(lines[j]); j++; }
  if (block.length < 2) return { body, n: 0 };
  // 必須偶數行、Q/A 交替：偶 index 問句以 ？結尾，奇 index（答）不以 ？結尾
  if (block.length % 2 !== 0) return { body, n: 0 };
  for (let k = 0; k < block.length; k += 2) {
    if (!block[k].trim().endsWith('？')) return { body, n: 0 };
    if (block[k + 1].trim().endsWith('？')) return { body, n: 0 };
    // 問句不能是 HTML（頂部裸問句才是遷移產物）
    if (block[k].trim().startsWith('<')) return { body, n: 0 };
  }
  // 安全閘：首問句必須在 block 之後的內文再次出現（＝底部有真 FAQ，刪頂部不丟內容）
  const firstQ = block[0].trim();
  const rest = lines.slice(j).join('\n');
  if (!rest.includes(firstQ)) {
    skipped.push({ file, pattern: 'A', reason: '頂部問句在文末未重複，恐為唯一 FAQ，跳過不刪' });
    return { body, n: 0 };
  }
  // 刪除：前導空行 + lead block，直到 j（保留 j 之後）。再清掉開頭多餘空行。
  let newLines = lines.slice(j);
  while (newLines.length && newLines[0].trim() === '') newLines.shift();
  return { body: newLines.join('\n'), n: block.length / 2 };
}

// 型態 B：巢狀 table（外層殼包住 [可選的<p>說明] + 內層真表）
// 判定：某個 <table> 在遇到 <tr>/<thead>/<tbody>/<caption> 之前，先遇到另一個 <table> 開
//       → 該 <table> 是多餘外層殼（中間夾 <p>/文字/空行皆算）。刪它＋其後第 2 個 </table>。
const ROW_TAGS = /^<(thead|tbody|tr|caption|colgroup)\b/i;
function fixNestedTables(body, file) {
  let lines = body.split('\n');
  let count = 0;
  let guard = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '<table>') continue;
    // 從 i+1 起找第一個「結構性 token」：真表列標籤 / 另一個 <table> / </table>
    let inner = -1, real = false, closedEmpty = false;
    for (let k = i + 1; k < lines.length; k++) {
      const t = lines[k].trim();
      if (t === '') continue;
      if (ROW_TAGS.test(t)) { real = true; break; }      // 直接是真表 → i 不是殼
      if (t === '<table>') { inner = k; break; }          // 先遇到另一個 table → i 是殼
      if (t === '</table>') { closedEmpty = true; break; } // 空表（罕見）
      // 其他（<p>、純文字、<img>…）：繼續往下看，可能是被誤包的 caption
    }
    if (real || inner === -1) continue; // i 是正常表，或找不到內層 → 不動
    // i 是外層殼，inner 是內層真表開。找 i 之後頭兩個 </table>
    const closes = [];
    for (let k = i + 1; k < lines.length && closes.length < 2; k++) {
      if (lines[k].trim() === '</table>') closes.push(k);
    }
    if (closes.length < 2) {
      skipped.push({ file, pattern: 'B', reason: `外層 <table> 於行#${i} 找不到第 2 個 </table>` });
      continue;
    }
    // closes[0] 之後、closes[1] 之前若又冒出 <table> 開 → 結構更深，保守跳過
    let complex = false;
    for (let k = closes[0] + 1; k < closes[1]; k++) if (lines[k].trim() === '<table>') complex = true;
    if (complex) { skipped.push({ file, pattern: 'B', reason: `行#${i} 表結構更深，保守跳過` }); continue; }
    // 刪外層開（i 這行）+ 外層閉（closes[1]）；中間的 <p> caption 保留（成為表前說明）
    const del = new Set([i, closes[1]]);
    lines = lines.filter((_, idx) => !del.has(idx));
    count++;
    i = -1; // 重掃（索引已變）
    if (++guard > 80) { skipped.push({ file, pattern: 'B', reason: 'guard 上限，防無限迴圈' }); break; }
  }
  return { body: lines.join('\n'), n: count };
}

// 型態 C：<hr> 緊接 </blockquote> → 移出
function fixHrInBlockquote(body) {
  let n = 0;
  const out = body.replace(/<hr>\s*\n(?:[ \t]*\n)*[ \t]*<\/blockquote>/g, () => {
    n++;
    return '</blockquote>\n\n<hr>';
  });
  return { body: out, n };
}

// 型態 D：孤兒 <h4>標籤</h4> 緊接（僅空行/<img>）<h3> → 刪 h4（h4→h3 是層級倒置的遷移殘留，h3 才是真標題）
function fixOrphanH4(body) {
  let n = 0;
  const out = body.replace(
    /<h4>[^<]+<\/h4>[ \t]*\n(?=(?:[ \t]*\n|[ \t]*<img[^>]*>[ \t]*\n)*[ \t]*<h3>)/g,
    () => { n++; return ''; },
  );
  return { body: out, n };
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
let changedFiles = [];
for (const f of files) {
  const base = f.replace(/\.md$/, '');
  if (ONLY && !ONLY.has(base)) continue;
  const path = join(DIR, f);
  const orig = readFileSync(path, 'utf8');
  const parts = splitFrontmatter(orig);
  if (!parts) { skipped.push({ file: base, pattern: '-', reason: 'frontmatter 解析失敗' }); continue; }
  let body = parts.body;
  const a = fixTopFaq(body, base); body = a.body;
  const b = fixNestedTables(body, base); body = b.body;
  const c = fixHrInBlockquote(body); body = c.body;
  const d = fixOrphanH4(body); body = d.body;
  if (a.n) { stats.A += a.n; stats.filesA++; }
  if (b.n) { stats.B += b.n; stats.filesB++; }
  if (c.n) { stats.C += c.n; stats.filesC++; }
  if (d.n) { stats.D += d.n; stats.filesD++; }
  const newText = parts.head + body;
  if (newText !== orig) {
    changedFiles.push({ base, a: a.n, b: b.n, c: c.n });
    stats.filesChanged++;
    if (!DRY) writeFileSync(path, newText);
  }
}

console.log(`\n===== ${DRY ? 'DRY-RUN（不寫檔）' : '已寫檔'} =====`);
console.log(`改動檔數：${stats.filesChanged}`);
console.log(`型態 A 頂部重複 FAQ：${stats.A} 處 / ${stats.filesA} 檔`);
console.log(`型態 B 巢狀 table：   ${stats.B} 處 / ${stats.filesB} 檔`);
console.log(`型態 C blockquote 內 hr：${stats.C} 處 / ${stats.filesC} 檔`);
console.log(`型態 D 孤兒 h4→h3：   ${stats.D} 處 / ${stats.filesD} 檔`);
console.log(`\n改動明細（前 60）：`);
for (const c of changedFiles.slice(0, 60)) console.log(`  ${c.base}: A=${c.a} B=${c.b} C=${c.c}`);
if (changedFiles.length > 60) console.log(`  …其餘 ${changedFiles.length - 60} 檔`);
console.log(`\n跳過/需人工（${skipped.length}）：`);
for (const s of skipped) console.log(`  [${s.pattern}] ${s.file}: ${s.reason}`);
