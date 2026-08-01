#!/usr/bin/env node
/**
 * 一次性回填存量文章的 `risksAndLimits`（文末「風險與限制」區塊）。
 *
 * 為什麼要回填：這個欄位在 schema 存在很久，574 篇只有 7 篇有值——沒有任何產線 prompt 提到它，
 * 而 `[slug].astro` 的渲染區塊早就寫好了。產線端已補（scripts/lib/risks-prompt.mjs），
 * 這支負責存量。背景＝docs/lessons/provenance-disclosure.md。
 *
 * 成本與安全（照 docs/automation-invariants.md）：
 *   - 一律帶 --model claude-sonnet-5（不帶會默默吃 Opus）。
 *   - claude-appi 是單一帳號、用量池與自動產線共用 → **預設每次只跑 --limit 40 篇**，分批跨日跑。
 *   - 撞用量上限時 claude-appi 會 exit 0 只印限額訊息；claude-cli.mjs 會退避重試，
 *     重試用盡仍失敗就**中止整批**（不是 continue），避免像 2026-07 那次逐項空打 24 次。
 *   - 冪等：已有非空 risksAndLimits 的檔直接跳過，所以可以反覆跑到收斂。
 *
 * 用法：
 *   node scripts/backfill-risks.mjs --dry              # 只印會處理哪些、不呼叫 LLM
 *   node scripts/backfill-risks.mjs --limit 40         # 實跑 40 篇
 *   node scripts/backfill-risks.mjs --category health  # 限定分類
 *   node scripts/backfill-risks.mjs --limit 40 --category health
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { runClaudeOnce } from './lib/claude-cli.mjs';

const ARTICLES_DIR = 'src/content/articles';
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const arg = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const LIMIT = Number(arg('--limit', DRY ? '9999' : '40'));
const ONLY_CATEGORY = arg('--category', null);

/** 內文截斷長度：夠模型判斷限制，又不至於每篇都塞滿 context */
const BODY_CHARS = 6000;

function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  let data;
  try {
    data = yaml.load(m[1]);
  } catch {
    return null;
  }
  return { fmText: m[1], data: data || {}, body: m[2] || '', head: m[0] };
}

function buildPrompt(data, body) {
  return [
    '你在替一篇已發佈的繁體中文新聞／專題文章補寫「風險與限制」欄位。',
    '',
    `標題：${data.title ?? ''}`,
    `分類：${data.category ?? ''}${data.subcategory ? ` / ${data.subcategory}` : ''}`,
    `摘要：${data.description ?? ''}`,
    '',
    '內文（可能截斷）：',
    '"""',
    body.slice(0, BODY_CHARS),
    '"""',
    '',
    '請寫出讀者照這篇行動之前該知道的邊界，2~4 條，每條 ≤60 字，繁體中文台灣用語。',
    '可寫：研究的樣本或設計限制、結論適用的族群與範圍、資料的時效與地區限制、',
    '法規或價格可能變動、目前尚無定論之處、單一來源尚未被獨立驗證。',
    '',
    '硬性要求：',
    '- **只根據上面內文寫，不得引入內文沒有的事實、數字或研究**。內文沒提到樣本數就不要編一個。',
    '- 要具體可查證，不要寫「僅供參考」「請諮詢專業人員」「資訊可能有誤」這類空話。',
    '- 不要用破折號，不要用「不僅…更…」「值得注意的是」這類 AI 套語。',
    '- 若本文是純事實整理（公告彙整、優惠整理、警政新聞稿）確實沒有實質限制可寫，回傳空陣列。',
    '',
    '只輸出 JSON 陣列，不要任何其他文字、不要 markdown 圍籬。例如：',
    '["該試驗僅收 86 名 40 歲以上男性，女性與年輕族群不適用","價格為 2026 年 7 月資訊，各縣市與通路可能不同"]',
  ].join('\n');
}

function parseArray(text) {
  const s = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = s.indexOf('[');
  const end = s.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  try {
    const arr = JSON.parse(s.slice(start, end + 1));
    if (!Array.isArray(arr)) return null;
    return arr.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()).slice(0, 4);
  } catch {
    return null;
  }
}

/** 把 risksAndLimits 插進 frontmatter：references 之前，沒有就放結尾 */
function insertField(fmText, items) {
  const block = ['risksAndLimits:', ...items.map((s) => `  - ${JSON.stringify(s)}`)].join('\n');
  const lines = fmText.split('\n');
  const at = lines.findIndex((l) => /^references:/.test(l));
  if (at >= 0) lines.splice(at, 0, block);
  else lines.push(block);
  return lines.join('\n');
}

const files = readdirSync(ARTICLES_DIR)
  .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
  .sort();

const todo = [];
for (const f of files) {
  const parsed = splitFrontmatter(readFileSync(join(ARTICLES_DIR, f), 'utf8'));
  if (!parsed) continue;
  const cur = parsed.data.risksAndLimits;
  if (Array.isArray(cur) && cur.length > 0) continue;
  if (ONLY_CATEGORY && parsed.data.category !== ONLY_CATEGORY) continue;
  todo.push(f);
}

console.log(`待回填 ${todo.length} 篇${ONLY_CATEGORY ? `（限 ${ONLY_CATEGORY}）` : ''}，本次處理上限 ${LIMIT} 篇`);
if (DRY) {
  const byCat = {};
  for (const f of todo) {
    const d = splitFrontmatter(readFileSync(join(ARTICLES_DIR, f), 'utf8'))?.data ?? {};
    byCat[d.category ?? '?'] = (byCat[d.category ?? '?'] ?? 0) + 1;
  }
  for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
  process.exit(0);
}

let done = 0;
let empty = 0;
let failed = 0;
const batch = todo.slice(0, LIMIT);

for (const [i, f] of batch.entries()) {
  const path = join(ARTICLES_DIR, f);
  const raw = readFileSync(path, 'utf8');
  const parsed = splitFrontmatter(raw);
  if (!parsed) continue;
  process.stdout.write(`[${i + 1}/${batch.length}] ${f} … `);

  let items;
  try {
    const out = await runClaudeOnce(buildPrompt(parsed.data, parsed.body), 'claude-sonnet-5', 120_000);
    items = parseArray(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`✖ ${msg.slice(0, 90)}`);
    // 撞用量上限（claude-cli 重試用盡）→ 中止整批，不要逐項空打。
    if (/用量上限|limit/i.test(msg)) {
      console.error('\n⛔ 判定為用量上限，中止本批。稍後或明天再跑一次即可（冪等）。');
      break;
    }
    failed++;
    continue;
  }

  if (items === null) {
    console.log('✖ 回傳非合法 JSON 陣列，跳過');
    failed++;
    continue;
  }
  if (items.length === 0) {
    console.log('－ 無實質限制可寫（不填）');
    empty++;
    continue;
  }

  writeFileSync(path, raw.replace(parsed.fmText, insertField(parsed.fmText, items)));
  console.log(`✓ ${items.length} 條`);
  done++;
}

console.log(`\n本批：寫入 ${done} 篇、判定無限制 ${empty} 篇、失敗 ${failed} 篇；剩餘待處理 ${todo.length - done - empty}`);
