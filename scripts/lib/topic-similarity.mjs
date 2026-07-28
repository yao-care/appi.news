// 選題重複偵測：判斷一篇「即將發佈」的文章，是否與站上既有文章打同一個關鍵字。
//
// 為什麼需要：topic-ledger 只記「近 14 天推薦過的候選題」，且只有 tech-radar 會用。
// 但實際的重複來自兩個它蓋不到的破口：
//   1. 時間跨度——`appi-news-91` 與 `hip-pain-which-specialist`（都是「髖關節痛看哪一科」）
//      相隔 81 天發佈，14 天窗永遠抓不到。
//   2. 產線——健康類走 /admin、newsroom 互動、article-write，完全不經過 tech-radar 的帳本。
// 2026-07-28 的 GSC 比對顯示這已造成實質競食：`髖關節痛` 一個字被 5 個 URL 瓜分、
// 全部卡在 pos 76-83。所以 gate 要下在**寫入端**（同配圖 gate），才能涵蓋所有產線。
//
// 判準怎麼調出來的：單看標題相似度會漏（髖關節那組標題只有 26% 相似），單看標籤重疊會
// 狂誤報（健康文普遍共用「保健／中醫／營養」等泛標籤，實測 100% 標籤重疊者多半無關）。
// 因此用「標題主題詞 + 標籤」的組合判準，並以全站 480 篇實跑校準（見 SIGNALS 註解）。

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLES_DIR = 'src/content/articles';

/** 中文 bigram 集合（英數以詞為單位）。標題先去掉站名後綴與標點。 */
export function bigrams(title) {
  const s = String(title ?? '')
    .replace(/[｜|]\s*APPI.*$/i, '')
    .replace(/[^\p{Script=Han}\p{L}\p{N}]/gu, '');
  const out = new Set();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * 主題詞：標題開頭到第一個分隔符（？！：，、~ 等）為止的那段，去掉語助尾。
 * 「髖關節疼痛看哪一科？先分清楚…」→「髖關節疼痛看哪一科」
 * 兩篇的主題詞若共享 ≥4 字的連續詞根，視為打同一個題。
 */
export function topicTerm(title) {
  return String(title ?? '')
    .replace(/[｜|]\s*APPI.*$/i, '')
    .split(/[？?！!：:，,、。．\-–—]/)[0]
    .replace(/[\s]/g, '')
    .slice(0, 24);
}

/**
 * 標題套語：中文標題常見的鷹架詞。兩篇共享的只有這些字時**不算**打同一個題——
 * 「百菇湯功效有哪些」與「蔓越莓功效有哪些」共享「功效有哪些」5 字，但講的是兩種食材。
 * 校準時這類佔誤報全部（2/11），加上本表後歸零。
 */
const GENERIC_RUNS =
  /^(功效|有哪些|保健功效|一次看懂|完整解析|怎麼選|是什麼|該不該|為什麼|真的比較|重點|解析|整理|指南|比較|風險|副作用|注意事項|懶人包|一次看|先看懂|看懂|要知道|的\d+個|\d+大|好處|方法|原因|症狀)+$/;

/** 兩字串最長共同子字串（回傳字串本身，供判斷是否只是標題套語）。 */
export function longestCommonRun(a, b) {
  if (!a || !b) return '';
  let best = 0;
  let end = 0;
  const dp = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : 0;
      if (dp[j] > best) {
        best = dp[j];
        end = i;
      }
      prev = tmp;
    }
  }
  return a.slice(end - best, end);
}

/** 共同詞根是否為實質主題詞（非純標題套語）。 */
export function isMeaningfulRun(run) {
  return run.length >= 4 && !GENERIC_RUNS.test(run);
}

/** 讀出站上所有文章的 slug / title / tags / category（只讀 frontmatter，不解析內文）。 */
export function loadArticles(dir = ARTICLES_DIR) {
  const out = [];
  for (const f of readdirSync(dir)) {
    if (!/\.mdx?$/.test(f)) continue;
    const head = readFileSync(join(dir, f), 'utf8').slice(0, 3000);
    const pick = (k) => {
      const m = head.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)`, 'm'));
      return m ? m[1].trim() : '';
    };
    const rawTags = (head.match(/^tags:\s*\[([^\]]*)\]/m) || [])[1] || '';
    out.push({
      file: f,
      slug: pick('slug') || f.replace(/\.mdx?$/, ''),
      title: pick('title'),
      category: pick('category'),
      status: pick('status'),
      tags: new Set(
        rawTags
          .split(',')
          .map((s) => s.replace(/["'\s]/g, ''))
          .filter(Boolean),
      ),
    });
  }
  return out;
}

/**
 * SIGNALS：三條判準，命中任一即視為重複候選。以全站 480 篇校準——
 *   titleStrong  標題 bigram ≥ .45  → 抓「完全同標題」（appi-news-82 / desk-worker-neck-pain-habits，100%）
 *   topicShared  主題詞共同詞根 ≥ 4 字 且 標籤重疊 ≥ .30 → 抓髖關節那組（標題僅 26%、標籤 75%）
 *   titleMidTag  標題 ≥ .25 且 標籤 ≥ .60 → 抓改寫過但同題者（綠色金融 4.9兆/5兆）
 * 單看標籤不設判準：健康文泛標籤重疊率極高，會把「咖啡」和「百菇湯」判成重複。
 */
export function scorePair(a, b) {
  const t = jaccard(bigrams(a.title), bigrams(b.title));
  const g = jaccard(a.tags ?? new Set(), b.tags ?? new Set());
  const run = longestCommonRun(topicTerm(a.title), topicTerm(b.title));
  const meaningful = isMeaningfulRun(run);
  const reasons = [];
  if (t >= 0.45) reasons.push(`標題高度相似 ${(t * 100).toFixed(0)}%`);
  if (meaningful && g >= 0.3) reasons.push(`主題詞重疊「${run}」+ 標籤 ${(g * 100).toFixed(0)}%`);
  if (t >= 0.25 && g >= 0.6 && meaningful) reasons.push(`標題 ${(t * 100).toFixed(0)}% + 標籤 ${(g * 100).toFixed(0)}%`);
  return { title: t, tags: g, run, hit: reasons.length > 0, reasons };
}

/**
 * 找出與 candidate 打同題的既有文章。
 * @param candidate {{slug, title, tags:Set|string[], category}}
 * @param articles  loadArticles() 的結果（會自動排除同 slug 自己）
 * @returns 依相似度排序的命中清單
 */
export function findSimilar(candidate, articles) {
  const cand = { ...candidate, tags: candidate.tags instanceof Set ? candidate.tags : new Set(candidate.tags ?? []) };
  const hits = [];
  for (const a of articles) {
    if (a.slug === cand.slug || a.file === cand.file) continue;
    if (cand.category && a.category && a.category !== cand.category) continue;
    if (a.status === 'draft' || a.status === 'archived') continue;
    const s = scorePair(cand, a);
    if (s.hit) hits.push({ ...a, ...s });
  }
  return hits.sort((x, y) => y.title + y.tags - (x.title + x.tags));
}
