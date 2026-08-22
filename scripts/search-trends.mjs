#!/usr/bin/env node
// 搜尋趨勢雷達：外部熱搜 → 純資料排序 → Codex 可審核候選清單。
//
// 預設讀 Google Trends 台灣 RSS。這支程式不呼叫 LLM、不寫文章、不推送上線；
// 它只產生候選與證據，後續寫作必須回到 docs/search-trend-sop.md 的查證與 growth gate。

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_MAX_AGE_HOURS,
  GOOGLE_TRENDS_TW_RSS,
  fetchTrendFeed,
  normalizeTrendText,
  parseGoogleTrendsRss,
  rankTrendCandidates,
} from './lib/search-trends.mjs';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const ARTICLES_DIR = resolve(ROOT, 'src/content/articles');
const DEFAULT_STATE = resolve(process.env.XDG_STATE_HOME || `${process.env.HOME || '/tmp'}/.local/state`, 'appi-news/search-trends/latest.json');

function hasFlag(name) {
  return process.argv.includes(name);
}

function valueOf(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}

function valuesOf(name) {
  const out = [];
  for (let i = 0; i < process.argv.length; i += 1) {
    if (process.argv[i] === name && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) out.push(process.argv[i + 1]);
  }
  return out;
}

function scalar(raw) {
  const value = String(raw || '').trim();
  const quoted = value.match(/^(?:"([\s\S]*)"|'([\s\S]*)')$/);
  return (quoted ? quoted[1] ?? quoted[2] : value).trim();
}

function frontmatterField(raw, key) {
  const block = String(raw).match(/^---\s*\n([\s\S]*?)\n---/);
  if (!block) return '';
  const match = block[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return match ? scalar(match[1]) : '';
}

function loadArticleIndex() {
  return readdirSync(ARTICLES_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const raw = readFileSync(resolve(ARTICLES_DIR, file), 'utf8');
      return {
        slug: frontmatterField(raw, 'slug') || file.replace(/\.mdx?$/, ''),
        title: frontmatterField(raw, 'title'),
      };
    })
    .filter((article) => article.title);
}

function statePath() {
  const requested = valueOf('--out', DEFAULT_STATE);
  return resolve(requested);
}

function sourceId(url) {
  if (url === GOOGLE_TRENDS_TW_RSS) return 'google-trends-tw';
  try { return new URL(url).hostname; } catch { return url; }
}

function ageText(hoursAgo) {
  if (hoursAgo === null) return '時間未知';
  if (hoursAgo < 1) return '不到 1 小時';
  return `${Math.round(hoursAgo)} 小時前`;
}

function decisionIcon(decision) {
  return { GO: '🟢', REVIEW: '🟡', WATCH: '⚪' }[decision] || '⚪';
}

function formatCandidate(candidate, index) {
  const fit = candidate.categories.length ? candidate.categories.join('/') : '待判斷分類';
  const risk = candidate.risks.length ? `；風險=${candidate.risks.join(',')}` : '';
  const duplicate = candidate.overlap ? `；撞題=${candidate.overlap.slug}` : '';
  return `${index}. ${decisionIcon(candidate.decision)} [${candidate.decision}] ${candidate.title}｜分數 ${candidate.score}｜熱度 ${candidate.approxTrafficRaw || '未知'}｜${ageText(candidate.hoursAgo)}｜${fit}${risk}${duplicate}\n   角度：${candidate.angle}`;
}

async function collect(urls) {
  const successes = [];
  const errors = [];
  for (const url of urls) {
    try {
      const xml = await fetchTrendFeed(url);
      successes.push({ url, source: sourceId(url), items: parseGoogleTrendsRss(xml) });
    } catch (error) {
      errors.push({ url, error: String(error.message || error) });
    }
  }
  if (!successes.length) throw new Error(`所有搜尋趨勢來源都失敗：${errors.map((x) => `${x.url} (${x.error})`).join('；')}`);
  return { successes, errors };
}

function dedupeItems(feeds) {
  const seen = new Set();
  const items = [];
  for (const feed of feeds) {
    for (const item of feed.items) {
      const key = normalizeTrendText(item.title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({ ...item, source: feed.source, sourceUrl: feed.url });
    }
  }
  return items;
}

function buildReport({ urls, fetchedAt, feeds, errors, candidates, dropped, articleCount, maxAgeHours }) {
  return {
    schemaVersion: 1,
    fetchedAt,
    sources: urls,
    feeds: feeds.map((feed) => ({ source: feed.source, url: feed.url, itemCount: feed.items.length })),
    sourceErrors: errors,
    maxAgeHours,
    articleCount,
    rawItemCount: feeds.reduce((sum, feed) => sum + feed.items.length, 0),
    candidateCount: candidates.length,
    droppedCount: dropped.length,
    candidates,
  };
}

function saveReport(report) {
  const target = statePath();
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
  return target;
}

async function main() {
  const urls = valuesOf('--feed');
  const feedsToRead = urls.length ? urls : [GOOGLE_TRENDS_TW_RSS];
  const limit = Math.max(1, Number(valueOf('--limit', '20')) || 20);
  const maxAgeHours = Math.max(1, Number(valueOf('--max-age-hours', String(DEFAULT_MAX_AGE_HOURS))) || DEFAULT_MAX_AGE_HOURS);
  const fetchedAt = new Date().toISOString();
  const articleIndex = loadArticleIndex();
  const { successes, errors } = await collect(feedsToRead);
  const items = dedupeItems(successes);
  const { candidates, dropped } = rankTrendCandidates(items, {
    now: fetchedAt,
    maxAgeHours,
    limit,
    articles: articleIndex,
  });
  const report = buildReport({
    urls: feedsToRead,
    fetchedAt,
    feeds: successes,
    errors,
    candidates,
    dropped,
    articleCount: articleIndex.length,
    maxAgeHours,
  });

  if (hasFlag('--save')) {
    console.error(`已保存趨勢候選：${saveReport(report)}`);
  }
  if (hasFlag('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`🔎 外部搜尋趨勢雷達（${fetchedAt}）`);
    console.log(`來源：${successes.map((feed) => feed.source).join('、')}｜RSS ${report.rawItemCount} 則｜既有文章索引 ${articleIndex.length} 篇`);
    if (errors.length) console.log(`⚠️ 部分來源失敗：${errors.map((x) => `${x.url} (${x.error})`).join('；')}`);
    if (!candidates.length) console.log('本輪沒有符合時效與資料品質的候選，保留下一輪觀察。');
    else candidates.forEach((candidate, index) => console.log(formatCandidate(candidate, index + 1)));
    const result = errors.length ? 'PARTIAL' : candidates.length ? 'CANDIDATES' : 'NONE';
    console.log(`TRENDS_RESULT=${result}｜GO=${candidates.filter((x) => x.decision === 'GO').length}｜REVIEW=${candidates.filter((x) => x.decision === 'REVIEW').length}｜WATCH=${candidates.filter((x) => x.decision === 'WATCH').length}`);
  }
}

main().catch((error) => {
  console.error(`TRENDS_RESULT=FAIL｜${error.message || error}`);
  process.exitCode = 1;
});
