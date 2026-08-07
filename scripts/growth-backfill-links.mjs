#!/usr/bin/env node
/**
 * 存量內鏈回填：把「零內鏈／只有 1 條內鏈」的舊文，機械地補上站內連結。
 *
 * 為什麼要做成程式而不是一篇篇手改：站長 2026-08-07 指示這批要全部做完，量級是數百篇，
 * 手工不可能收斂。相關度用站上「延伸閱讀」本來就在用的那套權重（src/utils/content.ts 的
 * `relatedArticles()`：同 topic ×3 ＞ 同 column +3 ＞ 同分類 +2 ＞ 同子分類 +1 ＞ 共同 tag +1），
 * 再加標題詞重疊，所以補出來的連結和站上推薦邏輯一致，不是亂連。
 *
 * 🔴 三條安全設計（每一條都是為了避開已知的坑）：
 * 1. **只新增獨立行，絕不改動既有行**。`check-content.mjs` 的掃描粒度是「新增的內容」，
 *    一旦把連結塞進既有句子，那整行變成新增 → 存量文章的舊句子會被 AI 味硬 gate 攔下來
 *    （2026-08-07 手工改 appi-news-193 時就踩到，整條 build 被擋）。
 * 2. **連結目標一律用「有效 slug」**（frontmatter slug 優先，沒有才用檔名），且只連
 *    已公開的文章。連到檔名或未公開稿會過得了 growth-lint 卻擋 `check:links`。
 * 3. **不插進程式區塊、表格、清單、figure 等容器裡**，只接在「純段落」後面自成一段，
 *    否則 markdown 結構會壞掉（清單被打斷、HTML 容器被截斷）。
 *
 * 用法：
 *   node scripts/growth-backfill-links.mjs            # dry-run，印出會怎麼改
 *   node scripts/growth-backfill-links.mjs --write    # 實際寫檔
 *   node scripts/growth-backfill-links.mjs --limit 20 # 只處理前 20 篇（試跑用）
 *   node scripts/growth-backfill-links.mjs --sample 3 # dry-run 時印出前 3 篇的完整插入段落
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditArticle } from './growth-lint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const num = (f, d) => (argv.includes(f) ? Number(argv[argv.indexOf(f) + 1]) || d : d);
const LIMIT = num('--limit', Infinity);
const SAMPLE = num('--sample', 2);

/** 一個目標最多被本次回填指到幾次——避免所有舊文都灌向同幾篇熱門文。 */
const MAX_INBOUND = Number(process.env.MAX_INBOUND || 6);

/**
 * 標題本身踩到去 AI 腔硬 gate 的文章，不拿來當連結目標。
 *
 * 錨文字用的是對方的標題，而 `check-content.mjs` 掃的是「新增的內容」——所以即使那個
 * 句型是對方標題早就有的、也早就上線了，一旦被我抄成新的一行就會擋 build。
 * （2026-08-07 全量回填實際踩到：連到「疼痛不是症狀，而是身體失衡的訊號」時被擋。）
 * 這裡只擋「拿它當錨文字」，不影響那些文章本身。
 */
const TITLE_TELLS = [/不是[^，。]{1,12}，而是/, /不僅[^，。]{0,12}更/, /值得注意的是/];

/* ------------------------------ 讀取與解析 ------------------------------ */

function parse(file) {
  const raw = readFileSync(path.join(ARTICLES, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const [, fm, body] = m;
  const one = (k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';
  const list = (k) => {
    const inline = fm.match(new RegExp(`^${k}:[ \\t]*\\[([^\\]]*)\\]`, 'm'))?.[1];
    if (inline) return [...inline.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
    const block = fm.match(new RegExp(`^${k}:\\s*\\n((?:\\s+-\\s+.*\\n?)+)`, 'm'))?.[1];
    if (block) return [...block.matchAll(/-\s+["']?([^"'\n]+?)["']?\s*$/gm)].map((x) => x[1].trim());
    return [];
  };
  const status = one('status') || 'published';
  const publishDate = new Date(one('publishDate'));
  return {
    file,
    raw,
    fm,
    body,
    title: one('title'),
    slug: one('slug') || file.replace(/\.mdx?$/, ''),
    category: one('category'),
    subcategory: one('subcategory'),
    column: one('column'),
    tags: list('tags'),
    topics: list('topics'),
    published:
      one('draft') !== 'true' &&
      status !== 'draft' &&
      status !== 'archived' &&
      !Number.isNaN(publishDate.getTime()) &&
      publishDate.getTime() <= Date.now(),
  };
}

const all = readdirSync(ARTICLES)
  .filter((f) => /\.mdx?$/.test(f))
  .map(parse)
  .filter(Boolean);
const published = all.filter((a) => a.published);

/* ------------------------------ 相關度計分 ------------------------------ */

/** 標題裡有意義的詞：中日韓字連續 2 字以上的片段（粗略但夠用），加上英數字詞。 */
function terms(title) {
  const out = new Set();
  const zh = title.replace(/[^一-鿿]+/g, ' ').split(/\s+/).filter(Boolean);
  for (const seg of zh) for (let i = 0; i + 2 <= seg.length; i++) out.add(seg.slice(i, i + 2));
  for (const w of title.toLowerCase().match(/[a-z0-9]{3,}/g) || []) out.add(w);
  return out;
}

/**
 * 題目相似度用 TF-IDF 餘弦，語料是「標題（加權）＋內文前段」。
 *
 * 為什麼不能只比標題：本站標題有大量模板句型（「⋯⋯一次看懂」「這些警訊要立刻就醫」
 * 「⋯⋯調高多少」），只比標題 2-gram 會把模板詞當成題目相關，實際 dry-run 連出
 * 「擦傷→經痛」「冷氣→數位銀行」。改用內文之後，兩篇要真的在講同一批概念才會高分；
 * idf 也會自動把「就醫」「時機」「看懂」這種到處都有的詞壓到接近 0。
 */
function docTerms(a) {
  const bag = new Map();
  const add = (text, w) => {
    for (const t of terms(text)) bag.set(t, (bag.get(t) || 0) + w);
  };
  add(a.title, 3);
  // 內文取前段（導言＋前兩節通常就決定了題目），並去掉網址與 HTML 標籤避免雜訊。
  const clean = a.body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .slice(0, 2500);
  add(clean, 1);
  return bag;
}

const BAGS = new Map(all.map((a) => [a.slug, docTerms(a)]));
const DF = new Map();
for (const bag of BAGS.values()) for (const t of bag.keys()) DF.set(t, (DF.get(t) || 0) + 1);
const N = all.length;
const idf = (t) => Math.log(N / (1 + (DF.get(t) || 0)));

/** 稀疏向量（idf 加權後 L2 normalize），用來算餘弦。 */
function vec(slug) {
  const bag = BAGS.get(slug);
  const v = new Map();
  let norm = 0;
  for (const [t, tf] of bag) {
    const w = (1 + Math.log(tf)) * idf(t);
    if (w <= 0) continue;
    v.set(t, w);
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [t, w] of v) v.set(t, w / norm);
  return v;
}
const VECS = new Map(all.map((a) => [a.slug, vec(a.slug)]));

function cosine(x, y) {
  const [small, big] = x.size < y.size ? [x, y] : [y, x];
  let s = 0;
  for (const [t, w] of small) {
    const w2 = big.get(t);
    if (w2) s += w * w2;
  }
  return s;
}

const TAG_DF = new Map();
for (const a of all) for (const t of a.tags) TAG_DF.set(t, (TAG_DF.get(t) || 0) + 1);

/** 餘弦低於這條線就當作不同題，再高的分類分數也不准連。 */
const MIN_COSINE = Number(process.env.MIN_COSINE || 0.05);
/** 第二層放寬水位：同子分類的最佳鄰居至少要到這個相似度。 */
const LOOSE_COSINE = Number(process.env.LOOSE_COSINE || 0.03);

/**
 * 相關度。回傳 {s, ok}：`ok=false` 代表就算分數夠也不准連。
 *
 * 為什麼要有 ok 這道否決：只靠「同分類＋共同標籤」會連出「擦傷→經痛」「冷氣→數位銀行」
 * 這種同台但不同題的組合（2026-08-07 首次 dry-run 實際跑出來的）。分類與標籤只證明
 * 「在同一個台」，不證明「在講同一件事」，所以一定要有題目本身的證據：
 * 共同 topic／同專欄／標題詞重疊，三者至少要有一個。
 */
function score(a, b) {
  let s = 0;
  let sharedTopics = 0;
  for (const t of a.topics) if (b.topics.includes(t)) sharedTopics++;
  s += sharedTopics * 3;
  const sameColumn = Boolean(a.column) && a.column === b.column;
  if (sameColumn) s += 3;
  if (a.category && a.category === b.category) s += 2;
  if (a.subcategory && a.subcategory === b.subcategory) s += 1;
  // 標籤也看稀有度：兩篇都掛「健康與醫療」不算證據，都掛「甲狀腺」才算。
  let sharedTags = 0;
  let sharedRareTags = 0;
  for (const t of a.tags) {
    if (!b.tags.includes(t)) continue;
    sharedTags++;
    if ((TAG_DF.get(t) || 0) <= 40) sharedRareTags++;
  }
  s += sharedTags + sharedRareTags;

  const cos = cosine(VECS.get(a.slug), VECS.get(b.slug));
  s += cos * 30;

  // 題目證據：內文夠像，或有共同 topic／同專欄。分類與標籤只證明「在同一個台」。
  const crossCategory = a.category !== b.category;
  const need = crossCategory ? MIN_COSINE * 1.5 : MIN_COSINE;
  const ok = cos >= need || ((sharedTopics > 0 || sameColumn) && cos >= MIN_COSINE * 0.7);
  // 第二層（放寬）：一次性的單篇新聞常常真的沒有近親，這時退而求其次——同子分類、
  // 相似度仍要在最低水位之上的最佳鄰居。品質比第一層鬆，但仍限制在同一個子分類內。
  const loose =
    !ok &&
    !crossCategory &&
    a.subcategory &&
    a.subcategory === b.subcategory &&
    cos >= LOOSE_COSINE;
  const evidence = `cos${cos.toFixed(2)}${sharedTopics ? '+topic' : sameColumn ? '+column' : ''}${loose ? ' 放寬' : ''}`;
  return { s, ok: ok || loose, tier: ok ? 1 : 2, evidence, cos };
}

/* --------------------------- 找可插入的位置 --------------------------- */

/**
 * 把 body 切成「區塊」（以空行分隔），並標出哪些區塊後面可以安全插入新段落。
 * 不可插入的情況：程式圍欄內、HTML 容器（figure/table/ul/ol/blockquote/details）內、
 * markdown 清單或表格中間、標題行正下方（會把標題和它的首段拆開）。
 */
function blocks(body) {
  const lines = body.split('\n');
  const out = [];
  let cur = [];
  let start = 0;
  let pos = 0;
  const push = (endPos) => {
    if (cur.length) out.push({ text: cur.join('\n'), start, end: endPos });
    cur = [];
  };
  let fence = false;
  let html = 0;
  for (const line of lines) {
    if (!cur.length) start = pos;
    if (/^```/.test(line)) fence = !fence;
    const open = (line.match(/<(figure|table|ul|ol|blockquote|details|thead|tbody|tr)\b/gi) || []).length;
    const close = (line.match(/<\/(figure|table|ul|ol|blockquote|details|thead|tbody|tr)>/gi) || []).length;
    html += open - close;
    if (line.trim() === '' && !fence && html <= 0) {
      push(pos);
      cur = [];
    } else {
      cur.push(line);
    }
    pos += line.length + 1;
  }
  push(pos);
  return out.map((b) => ({
    ...b,
    insertable: (() => {
      const t = b.text.trim();
      // 純段落才接。用「排除法」而不是「白名單開頭字元」——有些段落以英文、數字、
      // 引號、粗體開頭，用白名單會把它們全判成不可插入（實測有文章因此整篇找不到位置）。
      if (t.length < 40) return false;
      if (/^#{1,6}\s/.test(t)) return false; // 標題（插在標題後會把標題和首段拆開）
      if (/^([-*+]\s|\d+[.)]\s)/m.test(t)) return false; // 清單
      if (/^\|/m.test(t)) return false; // 表格
      if (/^>/m.test(t)) return false; // 引言
      if (/^</.test(t)) return false; // HTML 區塊
      if (/^!\[/.test(t)) return false; // 圖片
      if (/^\[\^/.test(t)) return false; // 註腳
      if (/^```/.test(t)) return false; // 程式碼
      return true;
    })(),
  }));
}

/* ------------------------------- 主流程 ------------------------------- */

const slugSet = new Set(published.map((a) => a.slug));
const inbound = new Map();

const targets = all
  .filter((a) => a.published)
  .map((a) => ({ a, audit: auditArticle(a.raw, slugSet) }))
  .filter(({ audit }) => audit.issues.some((i) => i.code === 'G1-none' || i.code === 'G1-few'))
  .map(({ a, audit }) => ({ a, have: audit.links }));

let changed = 0;
let skipped = [];
let printed = 0;

for (const { a, have } of targets.slice(0, LIMIT)) {
  const need = have === 0 ? 2 : 1;
  const existing = new Set(
    [...a.body.matchAll(/\/articles\/([^)"'\s/]+)\//g)].map((x) => decodeURIComponent(x[1])),
  );

  const cands = published
    .filter(
      (b) =>
        b.slug !== a.slug &&
        !existing.has(b.slug) &&
        // 舊文有一批 slug 是中文（甚至被截斷）的，網址難讀又不好當錨點，不拿來當目標
        /^[a-z0-9-]+$/.test(b.slug) &&
        !TITLE_TELLS.some((re) => re.test(b.title)),
    )
    .map((b) => ({ b, ...score(a, b) }))
    .filter((x) => x.ok && x.s >= 6 && (inbound.get(x.b.slug) || 0) < MAX_INBOUND)
    .sort((x, y) => y.s - x.s)
    .slice(0, need);

  if (cands.length < need) {
    skipped.push(`${a.slug}（找不到夠相關的候選，僅 ${cands.length} 條）`);
    if (!cands.length) continue;
  }

  const bs = blocks(a.body);
  const third = a.body.length / 3;
  // 第一條要落在前三分之一：挑「結束位置在 1/3 之前」的最後一個可插入段落。
  const early = [...bs].filter((b) => b.insertable && b.end <= third).pop() || bs.find((b) => b.insertable);
  const late =
    [...bs].filter((b) => b.insertable && b.end > a.body.length * 0.55 && b !== early).pop() ||
    [...bs].filter((b) => b.insertable && b !== early).pop();

  const picks = [];
  if (cands[0] && early) picks.push({ at: early.end, art: cands[0].b, why: `${cands[0].evidence} ${cands[0].s.toFixed(1)}` });
  if (cands[1] && late && late !== early) picks.push({ at: late.end, art: cands[1].b, why: `${cands[1].evidence} ${cands[1].s.toFixed(1)}` });
  if (!picks.length) {
    skipped.push(`${a.slug}（找不到安全的插入位置）`);
    continue;
  }

  let body = a.body;
  for (const p of [...picks].sort((x, y) => y.at - x.at)) {
    const line = `延伸閱讀：[${p.art.title}](/articles/${p.art.slug}/)`;
    body = `${body.slice(0, p.at)}\n${line}\n${body.slice(p.at)}`;
    inbound.set(p.art.slug, (inbound.get(p.art.slug) || 0) + 1);
  }
  body = body.replace(/\n{3,}/g, '\n\n');

  const next = `---\n${a.fm}\n---\n${body}`;
  if (WRITE) writeFileSync(path.join(ARTICLES, a.file), next);
  changed++;

  if (!WRITE && picks.some((p) => /放寬/.test(p.why)) && printed < SAMPLE) {
    printed++;
    console.log(`\n──── ${a.slug}（原有 ${have} 條，補 ${picks.length} 條）`);
    picks.forEach((p) => console.log(`   → [${p.why}] ${p.art.title}  (/articles/${p.art.slug}/)`));
  }
}

console.log(`\n待補目標 ${targets.length} 篇｜本次處理 ${Math.min(targets.length, LIMIT)} 篇｜實際改動 ${changed} 篇${WRITE ? '（已寫檔）' : '（dry-run，未寫檔）'}`);
if (skipped.length) {
  console.log(`跳過 ${skipped.length} 篇：`);
  skipped.slice(0, 15).forEach((s) => console.log(`  - ${s}`));
  if (skipped.length > 15) console.log(`  …其餘 ${skipped.length - 15} 篇`);
}
const hot = [...inbound.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
if (hot.length) console.log(`被指到最多次的目標：${hot.map(([s, n]) => `${s}(${n})`).join('、')}`);
