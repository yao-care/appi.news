#!/usr/bin/env node
/**
 * 主題中樞雷達：偵測「已經夠厚、卻還沒有主題中樞」的文章群，自動開一個新的主題頁。
 *
 * 為什麼要有：`relatedArticles()` 的權重是「同 topic 每個 ×3」，遠高於同分類的 +2。
 * 沒歸主題的文章，文末延伸閱讀只能退回同分類最新文。但主題中樞不能亂開——站上既有
 * 中樞的規模中位數約 7 篇，太薄的中樞頁對 SEO 反而是薄頁。所以要等群長到夠厚才開。
 *
 * 站長 2026-08-07 裁示：**全自動建立並上線**，門檻抓嚴（≥15 篇）。
 * 因為是自動上線，把關全部做在機器這端：
 * - **每次最多只開 1 個**（分數最高那個），避免一次洗出一堆中樞頁。
 * - 標題與描述由 Sonnet 產生後**逐條驗證**（長度、禁用句型、禁中國用語），不過就不開。
 * - 主題 id 由標籤推導成固定的 slug 對照表，**不讓模型自由發明 id**（id 進網址，改不得）。
 * - 帳本記已開過與被否決的群，同一個群不會反覆提案。
 * - 真正的建立、build、check:links、commit、push 由 cron 的 .sh 收尾，這支只負責產檔。
 *
 * 門檻（四條全過才開）：
 *   1. 夠厚：群內「還沒歸主題」的已公開文章 ≥ MIN_ARTICLES（預設 15）
 *   2. 夠內聚：群內平均 TF-IDF 餘弦 ≥ MIN_COHESION（預設 0.08）
 *   3. 有需求：群內 ≥ MIN_WITH_IMPRESSIONS 篇在 GSC 有曝光（預設 3；取不到 GSC 就略過這條）
 *   4. 還在長：近 90 天至少 MIN_RECENT 篇（預設 2）
 *   排除：群內已有 topic 的比例 ≥ 30%（既有中樞已涵蓋）
 *
 * 用法：
 *   node scripts/topic-hub-radar.mjs            # dry-run，印出候選與過門檻情形
 *   node scripts/topic-hub-radar.mjs --write    # 產生主題檔並回填成員文章的 topics
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { runClaudeOnce } from './lib/claude-cli.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');
const TOPICS = path.join(ROOT, 'src/content/topics');
const LEDGER_DIR = path.join(os.homedir(), '.config/appi-news');
const LEDGER = path.join(LEDGER_DIR, 'topic-hub-ledger.json');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const envNum = (k, d) => Number(process.env[k] || d);
const MIN_ARTICLES = envNum('HUB_MIN_ARTICLES', 15);
const MIN_COHESION = envNum('HUB_MIN_COHESION', 0.045);
const MIN_WITH_IMPRESSIONS = envNum('HUB_MIN_IMPRESSIONS', 3);
const MIN_RECENT = envNum('HUB_MIN_RECENT', 2);
const COVERED_RATIO = envNum('HUB_COVERED_RATIO', 0.3);

/**
 * 面向標籤（facet）：地理與國別。這些**不是主題**，是「這篇發生在哪裡」。
 *
 * 為什麼要獨立排除，而不是靠內聚度擋：實測「台北市」42 篇內聚 0.058、「急救常識」
 * 35 篇內聚 0.061，兩者幾乎一樣，但前者是地理面向、後者是真主題。內聚度分不開它們，
 * 所以只好把面向明確列出來。列進來的標籤永遠不會被拿來開中樞（照樣可以掛在文章上）。
 */
const FACET_TAGS = new Set([
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '新竹縣',
  '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣', '縣市',
  '亞太', '日本', '韓國', '新加坡', '印度', '東南亞', '歐洲', '中國', '香港', '美國',
  '英國', '蘇格蘭', '北愛爾蘭', '愛爾蘭', '歐盟', '烏克蘭', '國際',
  '健康與醫療', '科技與 AI', '永續與能源', '財經與產業', '生活與社會', '運動',
]);

/** 標題與描述的禁用句型（與 backfill-faq 同源，避免自動產出的公開頁面帶 AI 腔）。 */
const TELLS = [
  /—/, /--/, /不僅[^，。]{0,12}更/, /值得注意的是/, /總而言之/, /不是[^，。]{1,12}，而是/,
  /至關重要/, /不可或缺/, /扮演.{0,6}關鍵角色/, /一次搞定/, /全面解析/,
];
const CN_WORDS = /(軟件|程序員|網絡|算法|人工智能|信息|視頻|質量|項目管理)/;

/* ------------------------------ 讀資料 ------------------------------ */

const fmOf = (raw) => raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
const one = (fm, k) => fm.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';
function listOf(fm, k) {
  const inline = fm.match(new RegExp(`^${k}:[ \\t]*\\[([^\\]]*)\\]`, 'm'))?.[1];
  if (inline) return [...inline.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
  const block = fm.match(new RegExp(`^${k}:\\s*\\n((?:\\s+-\\s+.*\\n?)+)`, 'm'))?.[1];
  if (block) return [...block.matchAll(/-\s+["']?([^"'\n]+?)["']?\s*$/gm)].map((x) => x[1].trim());
  return [];
}

const articles = [];
for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
  const raw = readFileSync(path.join(ARTICLES, f), 'utf8');
  const m = fmOf(raw);
  if (!m) continue;
  const [, fm, body] = m;
  const status = one(fm, 'status') || 'published';
  const d = new Date(one(fm, 'publishDate'));
  articles.push({
    file: f,
    fm,
    body,
    title: one(fm, 'title'),
    slug: one(fm, 'slug') || f.replace(/\.mdx?$/, ''),
    category: one(fm, 'category'),
    tags: listOf(fm, 'tags'),
    topics: listOf(fm, 'topics'),
    column: one(fm, 'column'),
    date: d,
    published:
      one(fm, 'draft') !== 'true' && status !== 'draft' && status !== 'archived' &&
      !Number.isNaN(d.getTime()) && d.getTime() <= Date.now(),
  });
}
const existingTopicIds = new Set(
  readdirSync(TOPICS).filter((x) => /\.mdx?$/.test(x)).map((x) => x.replace(/\.mdx?$/, '')),
);

/* --------------------------- 內聚度（TF-IDF 餘弦） --------------------------- */

function terms(text) {
  const out = new Map();
  const bump = (t) => out.set(t, (out.get(t) || 0) + 1);
  for (const seg of text.replace(/[^一-鿿]+/g, ' ').split(/\s+/).filter(Boolean))
    for (let i = 0; i + 2 <= seg.length; i++) bump(seg.slice(i, i + 2));
  for (const w of text.toLowerCase().match(/[a-z0-9]{3,}/g) || []) bump(w);
  return out;
}
const BAGS = new Map(
  articles.map((a) => [
    a.file,
    terms(`${a.title} ${a.title} ${a.title} ${a.body.replace(/<[^>]+>/g, ' ').slice(0, 2500)}`),
  ]),
);
const DF = new Map();
for (const b of BAGS.values()) for (const t of b.keys()) DF.set(t, (DF.get(t) || 0) + 1);
const idf = (t) => Math.log(articles.length / (1 + (DF.get(t) || 0)));
const VECS = new Map(
  articles.map((a) => {
    const v = new Map();
    let n = 0;
    for (const [t, tf] of BAGS.get(a.file)) {
      const w = (1 + Math.log(tf)) * idf(t);
      if (w > 0) { v.set(t, w); n += w * w; }
    }
    n = Math.sqrt(n) || 1;
    for (const [t, w] of v) v.set(t, w / n);
    return [a.file, v];
  }),
);
const cos = (x, y) => {
  const [s, b] = x.size < y.size ? [x, y] : [y, x];
  let acc = 0;
  for (const [t, w] of s) { const w2 = b.get(t); if (w2) acc += w * w2; }
  return acc;
};
/** 群內平均兩兩餘弦（超過 40 篇時抽樣前 40 篇，避免 O(n²) 爆掉）。 */
function cohesion(members) {
  const m = members.slice(0, 40);
  if (m.length < 2) return 0;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < m.length; i++)
    for (let j = i + 1; j < m.length; j++) { sum += cos(VECS.get(m[i].file), VECS.get(m[j].file)); n++; }
  return n ? sum / n : 0;
}

/* ------------------------------ GSC 曝光 ------------------------------ */

async function impressions() {
  try {
    const { loadServiceAccount, getAccessToken, gscQuery } = await import('./lib/google-data.mjs');
    const { GSC_SCOPE, GSC_SA_KEY_PATH } = await import('./lib/report-config.mjs');
    const sa = loadServiceAccount(GSC_SA_KEY_PATH);
    const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });
    const end = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
    const start = new Date(Date.now() - 91 * 86400e3).toISOString().slice(0, 10);
    const r = await gscQuery({ token, body: { startDate: start, endDate: end, dimensions: ['page'], rowLimit: 5000 } });
    const set = new Set();
    for (const row of r.rows || []) {
      const s = decodeURIComponent((row.keys[0].match(/\/articles\/([^/]+)\//) || [])[1] || '');
      if (s && row.impressions >= 1) set.add(s);
    }
    return set;
  } catch {
    return null; // 取不到就略過「有需求」這條，不讓外部 API 擋住整支
  }
}

/* ------------------------------ 候選群 ------------------------------ */

const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : { created: {}, rejected: {} };
const withImp = await impressions();
const ninetyDaysAgo = Date.now() - 90 * 86400e3;

const byTag = new Map();
for (const a of articles) {
  if (!a.published) continue;
  for (const t of a.tags) {
    if (!byTag.has(t)) byTag.set(t, []);
    byTag.get(t).push(a);
  }
}

const candidates = [];
for (const [tag, group] of byTag) {
  if (FACET_TAGS.has(tag)) continue; // 地理／國別／頻道級標籤不是主題
  const orphans = group.filter((a) => !a.topics.length && !a.column);
  if (orphans.length < MIN_ARTICLES) continue;
  const coveredRatio = (group.length - orphans.length) / group.length;
  if (coveredRatio >= COVERED_RATIO) continue;
  const prev = ledger.created[tag] || ledger.rejected[tag];
  // 同一個群不反覆提案，除非規模比上次成長 50% 以上
  if (prev && orphans.length < prev * 1.5) continue;
  const coh = cohesion(orphans);
  const recent = orphans.filter((a) => a.date.getTime() >= ninetyDaysAgo).length;
  const imp = withImp ? orphans.filter((a) => withImp.has(a.slug)).length : null;
  const cats = {};
  for (const a of orphans) cats[a.category] = (cats[a.category] || 0) + 1;
  const category = Object.entries(cats).sort((a, b) => b[1] - a[1])[0][0];
  const pass =
    coh >= MIN_COHESION && recent >= MIN_RECENT && (imp === null || imp >= MIN_WITH_IMPRESSIONS);
  candidates.push({ tag, orphans, coh, recent, imp, category, pass, score: orphans.length * coh });
}
candidates.sort((a, b) => b.score - a.score);

console.log(`# 主題中樞雷達｜門檻：≥${MIN_ARTICLES} 篇、內聚 ≥${MIN_COHESION}、近90天 ≥${MIN_RECENT} 篇、有曝光 ≥${MIN_WITH_IMPRESSIONS} 篇`);
console.log(`# GSC：${withImp ? `取到 ${withImp.size} 頁曝光資料` : '取不到（略過「有需求」這條）'}`);
if (!candidates.length) {
  console.log('沒有候選群達到門檻，本次不開中樞。');
  process.exit(0);
}
for (const c of candidates.slice(0, 8)) {
  console.log(
    `${c.pass ? '✅' : '－'} ${c.tag.padEnd(10)} 未歸主題 ${String(c.orphans.length).padStart(3)} 篇｜內聚 ${c.coh.toFixed(3)}｜近90天 ${c.recent}｜有曝光 ${c.imp ?? 'n/a'}｜主分類 ${c.category}`,
  );
}

const winner = candidates.find((c) => c.pass);
if (!winner) {
  console.log('\n有夠厚的群，但沒有一個同時通過內聚／新鮮度／需求，本次不開。');
  process.exit(0);
}
console.log(`\n本次要開：「${winner.tag}」（${winner.orphans.length} 篇）`);
if (!WRITE) process.exit(0);

/* --------------------------- 產生主題檔 --------------------------- */

/**
 * id 不讓模型決定，只認人工對照表。
 *
 * 🔴 沒收錄就**放棄本次**，不要用編碼當備案——id 直接進網址 /topics/<id>/，上線後改
 * 就是壞連結。2026-08-07 首次全量跑時備案機制產出過 `topic-k34gad` 這種網址，
 * 得手動改名收拾。缺哪個標籤，補進 scripts/lib/topic-hub-ids.json 再跑即可。
 */
const ID_MAP = JSON.parse(readFileSync(path.join(ROOT, 'scripts/lib/topic-hub-ids.json'), 'utf8'));
const id = ID_MAP[winner.tag];
if (!id) {
  console.error(`✖ 標籤「${winner.tag}」不在 scripts/lib/topic-hub-ids.json 的對照表裡，本次不開。`);
  console.error('  請人工補一列（id 會進網址，上線後不能改），再重跑。');
  process.exit(0);
}
if (existingTopicIds.has(id)) {
  console.log(`主題 id ${id} 已存在，跳過（請人工確認對照表）`);
  process.exit(0);
}

const sample = winner.orphans.slice(0, 25).map((a) => `- ${a.title}`).join('\n');
const prompt = [
  '你在替一個新聞網站開一個新的「主題中樞」頁面，替它寫標題與描述。',
  `這個主題收的是以下這些已發佈文章（共 ${winner.orphans.length} 篇，這裡列前 25 篇）：`,
  sample,
  '',
  '規則：',
  '1. 標題 4 到 12 個字，是這批文章共同的主題名稱，不要用「總整理」「大全」這類詞。',
  '2. 描述 60 到 160 字，講清楚這個主題收什麼、讀者能從這裡拿到什麼。只能根據上面的文章標題推斷，不要編造。',
  '3. 全文繁體中文、台灣用語。禁止中國用語。',
  '4. 禁止破折號與 AI 套語（不僅…更、值得注意的是、總而言之、至關重要、不可或缺、全面解析）。',
  '',
  '只輸出 JSON：{"title":"…","description":"…"}',
].join('\n');

const out = await runClaudeOnce(prompt, 'claude-sonnet-5', 120_000);
let meta;
try {
  const t = out.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  meta = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
} catch {
  console.error('✖ 標題／描述回傳非合法 JSON，本次不開中樞');
  process.exit(1);
}
const bad = (() => {
  if (!meta?.title || !meta?.description) return '缺 title/description';
  const tl = [...meta.title].length;
  const dl = [...meta.description].length;
  if (tl < 4 || tl > 14) return `標題長度 ${tl}`;
  if (dl < 60 || dl > 170) return `描述長度 ${dl}`;
  for (const re of TELLS) if (re.test(meta.title) || re.test(meta.description)) return `禁用句型 ${re}`;
  if (CN_WORDS.test(meta.title) || CN_WORDS.test(meta.description)) return '出現中國用語';
  return null;
})();
if (bad) {
  console.error(`✖ 標題／描述驗證不過（${bad}），本次不開中樞`);
  process.exit(1);
}

const memberSlugs = winner.orphans.map((a) => a.slug);
const topicFile = [
  '---',
  `title: "${meta.title}"`,
  `description: "${meta.description}"`,
  `category: "${winner.category}"`,
  `coverImage: "og/${winner.category}.png"`,
  `tags: ["${winner.tag}"]`,
  'featured: false',
  'status: "active"',
  `articles: [${memberSlugs.slice(0, 12).map((s) => `"${s}"`).join(', ')}]`,
  '---',
  '',
  meta.description,
  '',
].join('\n');
writeFileSync(path.join(TOPICS, `${id}.md`), topicFile);

let assigned = 0;
for (const a of winner.orphans) {
  const p = path.join(ARTICLES, a.file);
  const raw = readFileSync(p, 'utf8');
  if (/^topics:/m.test(raw.split('\n---')[0])) continue;
  writeFileSync(p, raw.replace(/^(---\r?\n[\s\S]*?)(\r?\n---\r?\n)/, (_, h, t) => `${h}\ntopics: ["${id}"]${t}`));
  assigned++;
}

ledger.created[winner.tag] = winner.orphans.length;
mkdirSync(LEDGER_DIR, { recursive: true });
writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));

console.log(`✓ 已建立主題 ${id}「${meta.title}」，回填 ${assigned} 篇`);
console.log(`HUB_ID=${id}`);
console.log(`HUB_TITLE=${meta.title}`);
console.log(`HUB_COUNT=${assigned}`);
