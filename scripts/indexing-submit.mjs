// 把「線上 sitemap 有、但尚未提交過」的文章送 Google Indexing API（URL_UPDATED）。
//
// 設計重點：
// - 以「線上 sitemap」為事實來源 → 不論是即時上線或排程後由 6h cron 轉正的文章，
//   只要實際上線進 sitemap，下次執行就會被撿到送出（自癒、不漏接）。
// - 帳本（ledger）記「已送過」的 URL，確保每篇只送一次、可重跑不重複（idempotent）。
// - 配額保護：Indexing API 預設 200/天，CAP 留餘裕，超過今日上限就停，剩的下次再送。
//
// 誠實前提：Indexing API 官方僅支援 JobPosting/BroadcastEvent，新聞文章屬非官方用途，
// Google「接受（200）不代表保證收錄」。這支是「有送有機會、零人工」的盡力管道；
// 真正的主力仍是 sitemap + 時間 + 網站權重（見 docs/SERVER_HANDOFF.md）。
//
// 用法：
//   node scripts/indexing-submit.mjs            # 正常送出
//   node scripts/indexing-submit.mjs --dry-run  # 只列待送、不實際送
//   DRY_RUN=1 node scripts/indexing-submit.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadServiceAccount, getAccessToken } from './lib/google-data.mjs';
import { SA_KEY_PATH } from './lib/report-config.mjs';

const SITEMAP_INDEX = 'https://appi.news/sitemap-index.xml';
const LEDGER = `${process.env.HOME}/.local/state/appi-news/indexing-submitted.json`;
const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const CAP = 195; // 每次最多送這麼多（配額 200/天，留餘裕）
const DRY = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

const loadLedger = () => {
  try { return JSON.parse(readFileSync(LEDGER, 'utf8')); } catch { return {}; }
};
const saveLedger = (obj) => {
  mkdirSync(dirname(LEDGER), { recursive: true });
  writeFileSync(LEDGER, JSON.stringify(obj, null, 2) + '\n');
};

async function sitemapLocs(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sitemap 取得失敗 ${res.status}: ${url}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

// 撈出線上所有文章頁 URL（/articles/<slug>/）
async function liveArticleUrls() {
  const subs = await sitemapLocs(SITEMAP_INDEX);
  const out = new Set();
  for (const s of subs) {
    for (const loc of await sitemapLocs(s)) {
      if (/\/articles\/[^/]+\/$/.test(loc)) out.add(loc);
    }
  }
  return [...out];
}

async function main() {
  const ledger = loadLedger();
  const articles = await liveArticleUrls();
  const pending = articles.filter((u) => !ledger[u]);
  console.log(`線上文章 ${articles.length}　已送過 ${Object.keys(ledger).length}　待送 ${pending.length}`);

  if (pending.length === 0) {
    console.log('INDEXING_RESULT=NONE'); // 機器標記：本次無待送
    return;
  }

  const batch = pending.slice(0, CAP);
  if (DRY) {
    console.log(`\n[dry-run] 本次會送 ${batch.length} 篇：`);
    for (const u of batch.slice(0, 30)) console.log('  ' + u.replace('https://appi.news', ''));
    if (batch.length > 30) console.log(`  ...另 ${batch.length - 30} 篇`);
    console.log('INDEXING_RESULT=DRYRUN n=' + batch.length);
    return;
  }

  const sa = loadServiceAccount(SA_KEY_PATH);
  const token = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [INDEXING_SCOPE] });

  const nowIso = new Date().toISOString();
  let ok = 0, fail = 0, quotaHit = false;
  for (const url of batch) {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    });
    if (res.status === 200) {
      ledger[url] = nowIso; ok++;
    } else {
      const body = await res.text();
      if (res.status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(body)) {
        quotaHit = true;
        console.log(`⚠ 配額用盡，本次停在 ${ok} 篇`);
        break;
      }
      fail++;
      if (fail <= 3) console.log(`✗ [${res.status}] ${url} :: ${body.slice(0, 120)}`);
    }
  }
  saveLedger(ledger); // 邊送邊累積，中途停也保存進度

  const remain = pending.length - ok;
  console.log(`\n✅ 送出 ${ok}　✗ 失敗 ${fail}　剩餘 ${remain}${quotaHit ? '（配額滿，明天續送）' : ''}`);
  // 機器標記給 cron 包裝判讀
  if (ok > 0) console.log(`INDEXING_RESULT=SENT n=${ok} remain=${remain}`);
  else if (fail > 0) console.log('INDEXING_RESULT=FAIL');
  else console.log('INDEXING_RESULT=NONE');
}

main().catch((e) => { console.error('INDEXING_RESULT=FAIL ' + String(e.message || e)); process.exit(1); });
