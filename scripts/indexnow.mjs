#!/usr/bin/env node
/**
 * IndexNow 即時索引提交。
 *
 * 為什麼：Bing 的索引同時餵 ChatGPT Search 與 Copilot；IndexNow 一次提交會分享給
 * Bing / Yandex / Seznam / Naver / Yep 等所有參與引擎。新文章越快進 Bing，越快被
 * 這些 LLM 答案引擎引用。GitHub Pages 無伺服器端 hook，故由 deploy 工作流在
 * 「部署完成、線上可取得後」呼叫本腳本（見 .github/workflows/deploy.yml）。
 *
 * 只提交「目前線上且近期變動」的網址：
 *   - 比照 src/utils/content.ts 的 isPublic（非 draft / 非 archived / publishDate <= now）；
 *   - 且 publishDate 或 updatedDate 落在 INDEXNOW_WINDOW_HOURS（預設 48 小時）內。
 *   這樣新上線（含排程到點）與剛更新的文章會被推送，過量重送由 IndexNow 端容忍。
 *
 * 設計成「best-effort」：任何網路或 API 錯誤都只印警告、以 0 結束，絕不擋部署。
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 換網域時改這裡（或設環境變數 SITE_ORIGIN）。與 astro.config.mjs 的 SITE 一致。
const ORIGIN = (process.env.SITE_ORIGIN || 'https://appi.news').replace(/\/+$/, '');
const HOST = new URL(ORIGIN).host;
// 公開金鑰：對應 public/<KEY>.txt（IndexNow 用來驗證網域擁有權，本來就公開）。
const KEY = process.env.INDEXNOW_KEY || '5fbbdf2ac7ee86291791de7038c92704';
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const WINDOW_HOURS = Number(process.env.INDEXNOW_WINDOW_HOURS || 48);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'content', 'articles');

/** 取 frontmatter 單一欄位（quote-agnostic：title/slug 在本專案引號不一致）。 */
function field(fm, key) {
  const m = fm.match(new RegExp(`^${key}\\s*:\\s*(.+?)\\s*$`, 'm'));
  if (!m) return undefined;
  return m[1].replace(/^['"]|['"]$/g, '').trim();
}

async function collectUrls() {
  const now = Date.now();
  const cutoff = now - WINDOW_HOURS * 3600 * 1000;
  let entries;
  try {
    entries = await readdir(ARTICLES_DIR);
  } catch (e) {
    console.warn(`[indexnow] 無法讀取文章目錄：${e.message}`);
    return [];
  }
  const files = entries.filter((f) => /\.mdx?$/.test(f));
  const urls = new Set();
  for (const file of files) {
    const raw = await readFile(path.join(ARTICLES_DIR, file), 'utf8');
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];

    const draft = field(fm, 'draft') === 'true';
    const status = field(fm, 'status');
    if (draft || status === 'draft' || status === 'archived') continue;

    const publish = Date.parse(field(fm, 'publishDate') ?? '');
    if (!Number.isFinite(publish) || publish > now) continue; // 尚未上線

    const updated = Date.parse(field(fm, 'updatedDate') ?? '');
    const lastChange = Number.isFinite(updated) ? Math.max(publish, updated) : publish;
    if (lastChange < cutoff) continue; // 不在近期變動窗內

    const slug = field(fm, 'slug') || file.replace(/\.mdx?$/, '');
    urls.add(`${ORIGIN}/articles/${slug}/`);
  }

  // 近期有新文章時，首頁與 RSS 也應重爬（列表頁內容已變）。
  if (urls.size > 0) {
    urls.add(`${ORIGIN}/`);
    urls.add(`${ORIGIN}/rss.xml`);
  }
  return [...urls];
}

async function main() {
  const urlList = await collectUrls();
  if (urlList.length === 0) {
    console.log(`[indexnow] 近 ${WINDOW_HOURS}h 無上線/更新文章，略過提交。`);
    return;
  }
  console.log(`[indexnow] 提交 ${urlList.length} 筆網址至 IndexNow（host=${HOST}）：`);
  for (const u of urlList) console.log(`  - ${u}`);

  if (process.env.INDEXNOW_DRY_RUN) {
    console.log('[indexnow] DRY_RUN：略過實際提交。');
    return;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    // IndexNow：200/202 成功；其他狀態印出供排查，但不視為部署失敗。
    const text = await res.text().catch(() => '');
    if (res.ok) {
      console.log(`[indexnow] ✓ 提交成功（HTTP ${res.status}）`);
    } else {
      console.warn(`[indexnow] API 回應 HTTP ${res.status} ${text}`.trim());
    }
  } catch (e) {
    console.warn(`[indexnow] 提交失敗（忽略，不擋部署）：${e.message}`);
  }
}

await main();
