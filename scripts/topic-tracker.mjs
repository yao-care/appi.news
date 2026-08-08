#!/usr/bin/env node
/**
 * 主題追蹤：每週把各主題中樞的成效與成員變動發到主題追蹤頻道。
 *
 * 呈現（站長 2026-08-08 拍板，形狀別自己改）：
 *   ① 頻道主層一則「主題總表」——唯一放成效的地方（曝光/點擊/排名＝**收錄文章加總**，
 *      不是主題頁自己；主題頁本身量太小，看不出東西）。
 *   ② 每個主題一條 thread：父訊息只發一次（主題卡片），之後**只有成員增減才回覆**，
 *      沒有增減就完全安靜。成效不進 thread。
 *
 * 版面用 Slack 原生 table block；工作區不支援時自動退回兩行制 mrkdwn
 * （為什麼不能用 `|` 假表格＝docs/lessons/weekly-report-mobile-layout.md）。
 *
 * 純資料、不喚 Claude（狀態燈號是規則判斷），所以可以每週固定跑、不吃 claude-appi 額度。
 *
 * 用法：
 *   node scripts/topic-tracker.mjs                 # 正式跑（發 Slack）
 *   node scripts/topic-tracker.mjs --dry-run       # 只印，不發（可加 --no-metrics 跳過 Google）
 *   node scripts/topic-tracker.mjs --topic <id>    # 只替單一主題建 thread 父訊息（雷達建立新主題時呼叫）
 *
 * 帳本：~/.config/appi-news/topic-threads.json（git 外，存 thread_ts 與上次成員快照）。
 * 需要 SLACK_BOT_TOKEN；成效需要 GA4/GSC 金鑰（缺就自動降級成「只報成員數與變動」）。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { postMessage } from './lib/slack.mjs';
import { TOPIC_CHANNEL, GA_SCOPE, GSC_SCOPE, GSC_SA_KEY_PATH, SA_KEY_PATH, weekRanges } from './lib/report-config.mjs';
import { loadServiceAccount, getAccessToken, ga4RunReport, gscQuery } from './lib/google-data.mjs';
import {
  parseArticle, parseTopic, membersOf, diffMembers, aggregate, recentCount, topicStatus,
  summaryTable, updateTable, summaryFallbackText, updateFallbackText,
} from './lib/topic-tracker.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');
const TOPICS = path.join(ROOT, 'src/content/topics');
const LEDGER_DIR = path.join(os.homedir(), '.config/appi-news');
const LEDGER = path.join(LEDGER_DIR, 'topic-threads.json');
const SITE = 'https://appi.news';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(`--${f}`);
const arg = (f) => { const i = argv.indexOf(`--${f}`); return i >= 0 ? argv[i + 1] : undefined; };
const DRY = has('dry-run');
const NO_METRICS = has('no-metrics');
const ONLY_TOPIC = arg('topic');

const readLedger = () => (existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {});
function saveLedger(l) {
  if (DRY) return;
  mkdirSync(LEDGER_DIR, { recursive: true });
  writeFileSync(LEDGER, JSON.stringify(l, null, 2));
}

const CATEGORY_LABEL = {
  focus: '焦點', international: '國際', health: '健康', tech: '科技',
  finance: '財經', sports: '運動', lifestyle: '生活',
};

function loadContent() {
  const now = new Date();
  const articles = readdirSync(ARTICLES)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => parseArticle(readFileSync(path.join(ARTICLES, f), 'utf8'), f.replace(/\.mdx?$/, ''), now));
  const topics = readdirSync(TOPICS)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => parseTopic(readFileSync(path.join(TOPICS, f), 'utf8'), f.replace(/\.mdx?$/, '')))
    .filter((t) => t.status === 'active');
  return { articles, topics };
}

/** GSC + GA4 → { '/articles/<slug>/': { impressions, clicks, position, views } }，一週一份。 */
async function fetchMetrics(range) {
  const out = {};
  const put = (p, patch) => { out[p] = { ...(out[p] || {}), ...patch }; };
  try {
    const sa = loadServiceAccount(GSC_SA_KEY_PATH);
    const token = await getAccessToken({ ...sa, scopes: [GSC_SCOPE] });
    const r = await gscQuery({
      token,
      body: { startDate: range.start, endDate: range.end, dimensions: ['page'], rowLimit: 25000 },
    });
    for (const row of r.rows || []) {
      let p = String(row.keys[0]).replace(/^https?:\/\/[^/]+/, '');
      try { p = decodeURIComponent(p); } catch { /* 壞編碼就原樣 */ }
      put(p, { impressions: row.impressions, clicks: row.clicks, position: row.position });
    }
  } catch (e) {
    console.error(`⚠ GSC 讀取失敗（成效降級）：${e.message}`);
  }
  try {
    const sa = loadServiceAccount(SA_KEY_PATH);
    const token = await getAccessToken({ ...sa, scopes: [GA_SCOPE] });
    const r = await ga4RunReport({
      token,
      body: {
        dateRanges: [{ startDate: range.start, endDate: range.end }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        limit: 20000,
      },
    });
    for (const row of r.rows || []) {
      let p = String(row.dimensionValues[0].value);
      try { p = decodeURIComponent(p); } catch { /* 同上 */ }
      put(p, { views: Number(row.metricValues[0].value || 0) });
    }
  } catch (e) {
    console.error(`⚠ GA4 讀取失敗（成效降級）：${e.message}`);
  }
  return out;
}

/** 發訊：table block 被工作區擋下（invalid_blocks）就退回純文字，不讓整批啞掉。 */
async function post({ token, channel, text, table, fallback, thread_ts }) {
  if (DRY) {
    console.log(`\n──[dry] channel=${channel}${thread_ts ? ` thread=${thread_ts}` : ''}\n${text}\n${fallback}`);
    return { ts: 'dry' };
  }
  try {
    return await postMessage({ token, channel, text, blocks: table ? [table] : undefined, thread_ts });
  } catch (e) {
    if (!/invalid_blocks|invalid_arguments/.test(e.message)) throw e;
    console.error(`⚠ table block 不被支援（${e.message}），退回純文字排版`);
    return postMessage({ token, channel, text: `${text}\n${fallback}`, thread_ts });
  }
}

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token && !DRY) { console.error('缺 SLACK_BOT_TOKEN（請 source ~/.config/appi-news/report.env）'); process.exit(1); }

  const { articles, topics } = loadContent();
  const ledger = readLedger();
  const now = new Date();

  // 只建單一主題的 thread（雷達剛開新主題時呼叫），不跑週報。
  if (ONLY_TOPIC) {
    const t = topics.find((x) => x.id === ONLY_TOPIC);
    if (!t) { console.error(`找不到 active 主題：${ONLY_TOPIC}`); process.exit(1); }
    if (ledger[t.id]?.threadTs) { console.log(`已有 thread，略過：${t.id}`); return; }
    const members = membersOf(t, articles);
    const r = await postParent(token, t, members);
    ledger[t.id] = { threadTs: r.ts, members: members.map((m) => m.slug), createdAt: now.toISOString().slice(0, 10) };
    saveLedger(ledger);
    console.log(`已建立 thread：${t.id} ts=${r.ts}`);
    return;
  }

  const { cur, prev } = weekRanges(now);
  const curM = NO_METRICS ? {} : await fetchMetrics(cur);
  const prevM = NO_METRICS ? {} : await fetchMetrics(prev);

  const rows = [];
  const threadJobs = [];
  for (const t of topics) {
    const members = membersOf(t, articles);
    const a = aggregate(members, curM);
    const b = aggregate(members, prevM);
    rows.push({
      id: t.id,
      title: t.title,
      url: `${SITE}/topics/${t.id}/`,
      members: members.length,
      impressions: a.impressions, prevImpressions: b.impressions,
      clicks: a.clicks, prevClicks: b.clicks,
      position: a.position, prevPosition: b.position,
      status: topicStatus({ recent90: recentCount(members, 90, now), impressions: a.impressions, prevImpressions: b.impressions }),
    });

    const known = new Map(articles.map((x) => [x.slug, x]));
    const curSlugs = members.map((m) => m.slug);
    const entry = ledger[t.id];
    if (!entry?.threadTs) { threadJobs.push({ topic: t, members, curSlugs, kind: 'new' }); continue; }
    const { added, removed } = diffMembers(entry.members || [], curSlugs);
    if (added.length || removed.length) {
      const changes = [
        ...added.map((s) => ({ sign: '＋', slug: s })),
        ...removed.map((s) => ({ sign: '－', slug: s })),
      ].map((c) => {
        const art = known.get(c.slug);
        return {
          sign: c.sign,
          title: art?.title || c.slug,
          url: `${SITE}/articles/${c.slug}/`,
          category: CATEGORY_LABEL[art?.category] || art?.category || '—',
        };
      });
      threadJobs.push({ topic: t, members, curSlugs, kind: 'update', changes, threadTs: entry.threadTs });
    } else {
      ledger[t.id] = { ...entry, members: curSlugs };
    }
  }

  rows.sort((x, y) => y.impressions - x.impressions || y.members - x.members);

  // ① 主層總表
  const period = `${cur.start} ~ ${cur.end}`;
  // 只有標題與期間，不加任何說明文字（站長 2026-08-08 指定：符號自己會講，不要贅述）。
  // 🔴 粗體 closing `*` 後面只能接 ASCII 空白或換行，接全形空白會讓 `*` 原樣外露（週報踩過）。
  const head = `📊 *主題總表* ${period}`;
  const r = await post({
    token, channel: TOPIC_CHANNEL,
    text: head,
    table: summaryTable(rows),
    fallback: summaryFallbackText(rows),
  });
  console.log(`總表已發（${rows.length} 個主題）ts=${r.ts}`);

  // ② thread：新主題建父訊息；既有主題只在成員有增減時回覆
  for (const job of threadJobs) {
    if (job.kind === 'new') {
      const p = await postParent(token, job.topic, job.members);
      ledger[job.topic.id] = { threadTs: p.ts, members: job.curSlugs, createdAt: now.toISOString().slice(0, 10) };
      console.log(`建立 thread：${job.topic.id}`);
      continue;
    }
    await post({
      token, channel: TOPIC_CHANNEL, thread_ts: job.threadTs,
      text: `📌 ${job.topic.title}：本週收錄異動 ${job.changes.length} 筆`,
      table: updateTable(job.changes),
      fallback: updateFallbackText(job.changes),
    });
    ledger[job.topic.id] = { ...ledger[job.topic.id], members: job.curSlugs };
    console.log(`thread 更新：${job.topic.id}（${job.changes.length} 筆）`);
  }

  saveLedger(ledger);
}

/** thread 父訊息（主題卡片，一個主題只發一次）。 */
function postParent(token, topic, members) {
  const cat = CATEGORY_LABEL[topic.category] || topic.category || '—';
  const text = `📚 *主題追蹤｜${topic.title}*\n${SITE}/topics/${topic.id}/ ・${cat}・收錄 ${members.length} 篇\n之後只有收錄文章增減才會回這串。`;
  if (DRY) { console.log(`\n──[dry] 父訊息\n${text}`); return Promise.resolve({ ts: `dry-${topic.id}` }); }
  return postMessage({ token, channel: TOPIC_CHANNEL, text });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
}
