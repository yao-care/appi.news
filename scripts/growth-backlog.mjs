#!/usr/bin/env node
/**
 * 成長工作待辦盤點：把「還有多少沒做完」變成每週固定送到眼前的一則訊息。
 *
 * 為什麼要有這支：補內鏈／補 topics／補 FAQ／升級零點擊頁這些工作**短期不做也不會壞**，
 * 所以最容易被無限延後；而進度又刻意不寫在文件裡（會過期）。這支每次跑都現算一次，
 * 並和上一次的快照相減，直接講「這週做掉幾篇、還剩幾篇」。站長 2026-08-07 指示：
 * 這批要分批做完，沒做完的要定期提醒。
 *
 * 下一批做誰不是照檔名排的：拿 GSC「有曝光但 0 點擊」的名單去和「零內鏈」交集，
 * 依曝光量由高到低挑——這批同時吃到 B2（補內鏈）與 A1（升級零點擊頁）兩份效益，
 * 是 docs/growth-playbook.md 明訂的優先序。取不到 GSC 就退回純 lint 排序。
 *
 * 純資料，不喚 Claude（不吃 claude-appi 額度）。
 *
 * 用法：
 *   node scripts/growth-backlog.mjs            # 印報告到 stdout
 *   node scripts/growth-backlog.mjs --save     # 同時更新快照（給 cron 用）
 *   node scripts/growth-backlog.mjs --slack    # 同時發一則到 Slack（作者群）
 *
 * 快照放 `~/.config/appi-news/growth-backlog.json`——**不能放 repo 裡**，發佈端每次
 * 產文都會 reset 到 origin/main，放 repo 會被洗掉。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { auditArticle } from './growth-lint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES = path.join(ROOT, 'src/content/articles');
const STATE_DIR = path.join(os.homedir(), '.config/appi-news');
const STATE = path.join(STATE_DIR, 'growth-backlog.json');

const argv = process.argv.slice(2);
const SAVE = argv.includes('--save');
const SLACK = argv.includes('--slack');

/** 逐篇跑 growth-lint 的判準（直接用它的正本函式，不解析文字輸出）。 */
function scanArticles() {
  const rows = [];
  for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
    const r = auditArticle(readFileSync(path.join(ARTICLES, f), 'utf8'));
    rows.push({ slug: f.replace(/\.mdx?$/, ''), codes: new Set(r.issues.map((i) => i.code)) });
  }
  return rows;
}

/**
 * GSC「有曝光但 0 點擊」的頁面，依曝光由高到低。
 * 拿不到金鑰／逾時就回 null——這支是提醒工具，不該因為外部 API 掛掉就整個不報。
 */
function zeroClickRanked(limit = 300) {
  try {
    const out = execFileSync('node', ['scripts/growth-audit.mjs', '--gate1', '--top', String(limit)], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 240_000,
    });
    const total = Number(out.match(/有曝光但 0 點擊 (\d+) 頁/)?.[1] ?? NaN) || null;
    const list = [...out.matchAll(/imp\s+(\d+)\s+pos\s+[\d.]+\s+https:\/\/appi\.news\/articles\/([^\s/]+)\//g)]
      .map((m) => ({ slug: decodeURIComponent(m[2]), imp: Number(m[1]) }));
    return { total, list };
  } catch {
    return null;
  }
}

const rows = scanArticles();
const count = (code) => rows.filter((r) => r.codes.has(code)).length;
const gsc = zeroClickRanked();

const now = {
  at: new Date().toISOString(),
  total: rows.length,
  noLink: count('G1-none'),
  oneLink: count('G1-few'),
  noFaq: count('G5-faq'),
  noCluster: count('G2-cluster'),
  longTitle: count('G3-title'),
  zeroClick: gsc?.total ?? null,
};

/** 下一批：零內鏈 ∩ 有曝光沒人點，依曝光排序；沒有 GSC 就退回零內鏈且沒歸主題的。 */
function nextBatch(n = 10) {
  const noLink = new Set(rows.filter((r) => r.codes.has('G1-none')).map((r) => r.slug));
  if (gsc?.list?.length) {
    const hit = gsc.list.filter((x) => noLink.has(x.slug)).slice(0, n);
    if (hit.length) return { mode: 'gsc', items: hit.map((x) => `${x.slug}（曝光 ${x.imp}）`) };
  }
  const fallback = rows.filter((r) => r.codes.has('G1-none') && r.codes.has('G2-cluster')).slice(0, n);
  return { mode: 'lint', items: fallback.map((r) => r.slug) };
}

const prev = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : null;
/** 「上次 → 這次」的變化；數字要往下掉才是進度。 */
const delta = (k) => {
  if (!prev || !Number.isFinite(prev[k]) || !Number.isFinite(now[k])) return '';
  const d = now[k] - prev[k];
  if (d === 0) return '（沒動）';
  return d < 0 ? `（做掉 ${-d} 篇 ✅）` : `（多了 ${d} 篇）`;
};

const batch = nextBatch(10);
const since = prev ? new Date(prev.at).toISOString().slice(0, 10) : null;
const text = [
  `📋 成長工作待辦盤點${since ? `（對比 ${since}）` : '（首次盤點，還沒有對比基準）'}`,
  '',
  `存量共 ${now.total} 篇，還沒做完的：`,
  `• 零內鏈　　　　${now.noLink} 篇 ${delta('noLink')}`,
  `• 只有 1 條內鏈　${now.oneLink} 篇 ${delta('oneLink')}`,
  `• 沒有常見問題　${now.noFaq} 篇 ${delta('noFaq')}`,
  `• 沒歸主題／專欄 ${now.noCluster} 篇 ${delta('noCluster')}`,
  `• 標題過長　　　${now.longTitle} 篇 ${delta('longTitle')}（只改有曝光的那些，其餘是白工）`,
  now.zeroClick
    ? `• 有曝光但沒人點 ${now.zeroClick} 頁 ${delta('zeroClick')}（最便宜的流量）`
    : '• 有曝光但沒人點：這次取不到 GSC 數據，略過',
  '',
  batch.mode === 'gsc'
    ? '下一批建議做這 10 篇（有曝光卻沒人點、而且零內鏈——補內鏈順手改標題，一次吃兩份效益）：'
    : '下一批建議做這 10 篇（零內鏈且沒歸主題；這次沒有 GSC 數據可排優先序）：',
  ...batch.items.map((s) => `  ${s}`),
  '',
  'SOP 在 docs/growth-playbook.md（B2／B3／A1）。回一句「做下一批」我就開工。',
].join('\n');

console.log(text);

if (SAVE) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE, JSON.stringify(now, null, 2));
}
if (SLACK) {
  execFileSync('node', ['scripts/cron-report.mjs', '--text', text], { cwd: ROOT, stdio: 'inherit' });
}
