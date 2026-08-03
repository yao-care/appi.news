#!/usr/bin/env node
// 修「標題階層全平」：整篇只有 h2、一個 h3 都沒有的文章，把該當子節的標題降成 h3。
//
// 為什麼是問題：WP 遷移過來的文章常把每一層都寫成 <h2>，於是「天麻5大健康功效」與它底下的
// 「1 改善頭暈與眩暈」同級、「FAQ 常見問題」與每一題問句同級。對讀者是失去層次，對搜尋引擎
// 與 AI 抽取則是拿不到「這幾點從屬於那個主題」的結構訊號。2026-08-03 實測 38 篇如此。
//
// 判準（保守，寧可不改也不要改錯）：只處理 h2>=8 且 h3=0 的文章，且只把下列兩種降級：
//   ① 編號型子節：標題以數字或「第N」開頭（1 改善頭暈、2 輔助穩定血壓…）
//   ② FAQ 問句：出現在「FAQ／常見問題」這個 h2 之後、且以問號結尾的 h2
// 其餘一律不動。降級後若某篇的 h3 仍為 0，代表判準沒命中，該篇維持原狀。
//
// 用法：node scripts/fix-heading-depth.mjs [--apply]   （不帶 --apply 只印會怎麼改）

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const files = globSync('src/content/articles/*.md*');

const isNumbered = (s) => /^\s*(?:\d+[\s.、)]|第\s*[一二三四五六七八九十\d]+\s*[、.）)]?)/.test(s);
const isQuestion = (s) => /[？?]\s*$/.test(s);
const isFaqHead = (s) => /FAQ|常見問題|Q\s*&\s*A/i.test(s);

let changed = 0;
const report = [];

for (const f of files) {
  const raw = readFileSync(f, 'utf8');
  const i = raw.indexOf('---', 3);
  const head = raw.slice(0, i + 3);
  let body = raw.slice(i + 3);

  const h2n = (body.match(/^##\s/gm) || []).length + (body.match(/<h2/g) || []).length;
  const h3n = (body.match(/^###\s/gm) || []).length + (body.match(/<h3/g) || []).length;
  if (h2n < 8 || h3n > 0) continue;

  let inFaq = false, demoted = 0;

  // HTML 體：<h2>…</h2>
  body = body.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attr, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (isFaqHead(text)) { inFaq = true; return m; }
    if (isNumbered(text) || (inFaq && isQuestion(text))) { demoted++; return `<h3${attr}>${inner}</h3>`; }
    // 遇到下一個非問句的一般 h2＝離開 FAQ 區
    if (inFaq && !isQuestion(text)) inFaq = false;
    return m;
  });

  // Markdown 體：## …
  inFaq = false;
  body = body.replace(/^##\s+(.+)$/gm, (m, text) => {
    const t = text.trim();
    if (isFaqHead(t)) { inFaq = true; return m; }
    if (isNumbered(t) || (inFaq && isQuestion(t))) { demoted++; return `### ${text}`; }
    if (inFaq && !isQuestion(t)) inFaq = false;
    return m;
  });

  if (!demoted) continue;
  changed++;
  report.push(`  ${f.split('/').pop().padEnd(46)} h2 ${h2n} → 降級 ${demoted} 個為 h3`);
  if (APPLY) writeFileSync(f, head + body);
}

console.log(report.join('\n'));
console.log(`\n${APPLY ? '已修改' : '會修改'} ${changed} 篇（判準沒命中的維持原狀）`);
