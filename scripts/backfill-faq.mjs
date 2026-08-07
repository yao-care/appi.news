#!/usr/bin/env node
/**
 * 回填存量文章的「常見問題」區塊（給 FAQPage 結構化資料用）。
 *
 * 為什麼要做：`src/utils/faq.ts` 會把文末的常見問題抽成 FAQPage 結構化資料，那是最容易
 * 被 Google 摘要與 AI 答案直接引用的格式。站上每天在跑 aeo-radar／cited-teardown 量
 * 「有沒有被引用」，但存量有數百篇根本沒有這個區塊，等於量得到卻沒東西可被引。
 *
 * 🔴 只准用文章裡已經有的內容出題，不准新增任何事實、數字或來源。
 *    禁杜撰是本專案硬規則；這支的 prompt 與寫入前驗證都照這條設計。
 *
 * 安全設計：
 * - **冪等**：已有常見問題區段的直接跳過（判準與 growth-lint 共用 lib/faq-detect.mjs），
 *   所以可以反覆跑到收斂，中途中斷也不會重做。
 * - **只新增獨立區塊**，絕不改動既有行（check-content 掃的是新增內容，改到舊句會讓
 *   存量文章被 AI 味硬 gate 攔下）。
 * - **寫入前驗證**：條數、問句格式、答案長度、破折號與 AI 套語、答案不得出現本文沒有的
 *   網址。任何一條不過就整篇跳過，不寫半套。
 * - 一律 `--model claude-sonnet-5`（不帶會默默吃 Opus）。
 *
 * 用法：
 *   node scripts/backfill-faq.mjs --dry                    # 只印會處理哪些
 *   node scripts/backfill-faq.mjs --limit 20               # 實跑 20 篇
 *   node scripts/backfill-faq.mjs --all --concurrency 6    # 全量、6 條並行
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import { hasFaqSection } from './lib/faq-detect.mjs';

const ARTICLES_DIR = 'src/content/articles';
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const arg = (n, d) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
const LIMIT = argv.includes('--all') ? Infinity : Number(arg('--limit', '20'));
const CONCURRENCY = Number(arg('--concurrency', '6'));
const BODY_CHARS = 8000;

/**
 * 寫入前的硬性驗證：踩到任何一條就整篇不寫。
 *
 * 後半那組「模糊引用」是實跑才發現的：因為規則禁止答案放連結，模型會改用
 * 「研究顯示」「數據指出」這種沒有出處的說法，正好踩到 check-content 的
 * 「模糊引用（無出處）」硬 gate，一次擋下 25 篇。既然 FAQ 不放連結，就一律不准
 * 出現需要出處的措辭——有結論就直接講結論。
 */
const AI_TELLS = [
  /—/, /--/, /不僅[^，。]{0,12}更/, /值得注意的是/, /總而言之/, /綜上所述/, /不是[^，。]{1,12}，而是/,
  /研究(顯示|指出|發現|證實)/, /數據(顯示|指出)/, /大型研究/, /多項研究/, /文獻(顯示|指出)/,
  /專家(建議|指出|認為)/, /醫師(建議|指出)(?!.{0,6}就醫)/, /整體而言/, /一般而言/, /根據研究/,
  /業界(普遍)?認為/, /外界認為/, /普遍認為/, /不可或缺/, /至關重要/, /扮演.{0,6}關鍵角色/,
];

function split(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] || '' } : null;
}
const one = (fm, k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';

function buildPrompt(fm, body) {
  return [
    '你在替一篇已發佈的繁體中文文章，補寫文末的「常見問題」區塊。',
    '',
    `標題：${one(fm, 'title')}`,
    `摘要：${one(fm, 'description')}`,
    '',
    '文章內容：',
    '"""',
    body.slice(0, BODY_CHARS),
    '"""',
    '',
    '規則（違反任何一條都算失敗）：',
    '1. 問題與答案**只能用上面文章裡已經寫到的內容**。禁止補充文章沒有的事實、數字、機構、來源或建議。',
    '2. 出 3 到 5 題。挑「讀者看完最可能還想問、而文章確實有回答」的問題，不要把小標題改寫成問句。',
    '3. 問題用一句話，以「？」結尾。答案 60 到 160 字，直接回答，不要鋪陳。',
    '4. 全文繁體中文、台灣用語。禁止中國用語（軟件／程序／網絡／算法／人工智能等）。',
    '5. 禁止破折號（—、--）。禁止 AI 套語：「不僅…更…」「值得注意的是」「總而言之」「不是X，而是Y」。',
    '6. 答案裡不要放網址、不要放 Markdown 連結。',
    '7. 因為不放連結，**一律不准寫需要出處的措辭**：「研究顯示」「數據指出」「大型研究」「多項研究」',
    '   「文獻指出」「專家建議」「根據研究」「整體而言」「一般而言」都禁止。有結論就直接講結論，',
    '   例如不要寫「研究顯示每小時起身活動有幫助」，改寫成「每小時起身活動可以打斷靜態負荷」。',
    '8. 禁止拔高措辭：「不可或缺」「至關重要」「扮演關鍵角色」「業界普遍認為」「外界認為」。',
    '   要講重要性就講具體後果，例如不要寫「ESM 不可或缺」，改寫成「沒有 ESM，任務就無法執行」。',
    '',
    '輸出格式：**只輸出一個 JSON 陣列**，不要任何說明文字、不要程式碼圍欄。',
    '格式：[{"q":"問題？","a":"答案"}, ...]',
    '如果文章內容太短或性質不適合出常見問題，輸出空陣列 []。',
  ].join('\n');
}

function parseItems(out) {
  const t = out.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  const s = t.indexOf('[');
  const e = t.lastIndexOf(']');
  if (s < 0 || e < s) return null;
  try {
    const arr = JSON.parse(t.slice(s, e + 1));
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/** 回傳 null 代表通過，否則回傳不通過的理由。 */
function reject(items, body) {
  if (items.length < 3 || items.length > 5) return `題數 ${items.length}（要 3-5）`;
  const urls = new Set([...body.matchAll(/https?:\/\/[^\s)"']+/g)].map((m) => m[0]));
  for (const it of items) {
    if (typeof it?.q !== 'string' || typeof it?.a !== 'string') return '欄位缺 q/a';
    // 半形問號照收，寫入前才正規化成全形——因為這個而整篇丟掉太浪費（實測會發生）。
    if (!/[？?]$/.test(it.q.trim())) return `問題沒有以問號結尾：${it.q.slice(0, 20)}`;
    if (it.q.length > 60) return '問題過長';
    const len = [...it.a].length;
    if (len < 30 || len > 220) return `答案長度 ${len}（要 30-220）`;
    for (const re of AI_TELLS) if (re.test(it.q) || re.test(it.a)) return `踩到禁用句型 ${re}`;
    for (const m of it.a.matchAll(/https?:\/\/[^\s)"']+/g)) if (!urls.has(m[0])) return '答案出現本文沒有的網址';
    if (/\[[^\]]+\]\(/.test(it.a)) return '答案含 Markdown 連結';
  }
  const qs = new Set(items.map((i) => i.q.trim()));
  if (qs.size !== items.length) return '有重複問題';
  return null;
}

/** 接在文末，但要在「參考資料」這類收尾區塊之前。只新增區塊，不動既有行。 */
function insert(body, items) {
  const q = (s) => s.trim().replace(/\?$/, '？'); // 半形問號正規化成全形（站上全形為準）
  const block = ['## 常見問題', '', ...items.flatMap((i) => [`### ${q(i.q)}`, i.a.trim(), ''])]
    .join('\n')
    .trimEnd();
  const lines = body.split('\n');
  const at = lines.findIndex((l) => /^#{2,4}\s*(參考資料|參考來源|資料來源|延伸閱讀)\s*$/.test(l.trim()));
  if (at >= 0) {
    lines.splice(at, 0, block, '');
    return lines.join('\n');
  }
  return `${body.replace(/\s*$/, '')}\n\n${block}\n`;
}

/* ------------------------------- 主流程 ------------------------------- */

const todo = [];
for (const f of readdirSync(ARTICLES_DIR).filter((x) => /\.mdx?$/.test(x)).sort()) {
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  const p = split(raw);
  if (!p) continue;
  const status = one(p.fm, 'status') || 'published';
  if (one(p.fm, 'draft') === 'true' || status === 'draft' || status === 'archived') continue;
  if (hasFaqSection(p.body)) continue;
  todo.push(f);
}

console.log(`待回填常見問題 ${todo.length} 篇；本次上限 ${LIMIT === Infinity ? '全部' : LIMIT}，並行 ${CONCURRENCY}`);
if (DRY) process.exit(0);

const batch = todo.slice(0, LIMIT === Infinity ? todo.length : LIMIT);
let done = 0;
let empty = 0;
let failed = 0;
let aborted = false;
let cursor = 0;

async function worker(id) {
  while (!aborted) {
    const i = cursor++;
    if (i >= batch.length) return;
    const f = batch[i];
    const path = join(ARTICLES_DIR, f);
    const raw = readFileSync(path, 'utf8');
    const p = split(raw);
    if (!p) continue;
    let items;
    try {
      const out = await runClaudeOnce(buildPrompt(p.fm, p.body), 'claude-sonnet-5', 180_000);
      items = parseItems(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/用量上限|weekly limit|usage limit/i.test(msg)) {
        console.error(`\n⛔ [w${id}] 判定為用量上限，中止全批（冪等，稍後再跑即可）`);
        aborted = true;
        return;
      }
      failed++;
      console.log(`✖ ${f} ${msg.slice(0, 70)}`);
      continue;
    }
    if (items === null) {
      failed++;
      console.log(`✖ ${f} 回傳非合法 JSON`);
      continue;
    }
    if (items.length === 0) {
      empty++;
      console.log(`－ ${f} 模型判定不適合出題`);
      continue;
    }
    const bad = reject(items, p.body);
    if (bad) {
      failed++;
      console.log(`✖ ${f} 驗證不過：${bad}`);
      continue;
    }
    // 讀當下最新內容再寫，避免與其他 worker 或產線互相覆蓋。
    const fresh = readFileSync(path, 'utf8');
    const fp = split(fresh);
    if (!fp || hasFaqSection(fp.body)) continue;
    writeFileSync(path, `---\n${fp.fm}\n---\n${insert(fp.body, items)}`);
    done++;
    if (done % 10 === 0 || done < 5) console.log(`✓ [${done}] ${f}（${items.length} 題）`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));
console.log(`\n本批：寫入 ${done} 篇、判定不適合 ${empty} 篇、失敗 ${failed} 篇；剩餘 ${todo.length - done - empty}`);
