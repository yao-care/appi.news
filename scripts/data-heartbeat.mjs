// 📊 數據心跳（每日）— 純讀本地狀態的內容存量 + 產線訊號，非 LLM，夜間照常能發。
// 參考 dreamer868 pipeline/slack/heartbeat-data.sh 的模式，移植到 appi.news 脈絡。
// 來源：src/content/articles（文章存量/狀態/分類/最新發佈）、src/content/authors（作者數）、
//       src/redirects.json（轉址表）、去重帳本 suggested-topics.json（雷達+週報共用）。
// 輸出：一段 Slack 訊息文字到 stdout（由 cron 包裝腳本 pipe 給 cron-report.mjs --dev）。
// 也可手動：node scripts/data-heartbeat.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = process.env.APPI_LEDGER || '/root/.local/state/appi-news/suggested-topics.json';

// 分類 slug → 中文（對齊 src/config/categories.ts / report-config CATEGORY_CHANNELS）
const CAT_LABEL = { focus: '焦點', international: '國際', health: '健康', tech: '科技', finance: '財經', sports: '運動', lifestyle: '生活' };

const unq = (s) => s.trim().replace(/^['"]|['"]$/g, '').trim();
function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const o = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm) o[mm[1]] = unq(mm[2]);
  }
  return o;
}
function safeReaddir(p) { try { return readdirSync(p); } catch { return []; } }

const now = new Date();
const artDir = join(REPO, 'src/content/articles');
const files = safeReaddir(artDir).filter((f) => /\.(md|mdx)$/.test(f));

const byStatus = { published: 0, scheduled: 0, draft: 0, archived: 0 };
const byCat = {};
let latestPub = null; // 最新「已上線」文章日期
let scheduledUpcoming = 0; // 未來排程（status=scheduled 且 publishDate 在未來）
let liveCount = 0; // 實際已上線（published，或 scheduled 但 publishDate 已到）
for (const f of files) {
  const d = frontmatter(readFileSync(join(artDir, f), 'utf8'));
  const status = d.status || 'published';
  byStatus[status] = (byStatus[status] || 0) + 1;
  const cat = d.category || 'uncategorized';
  byCat[cat] = (byCat[cat] || 0) + 1;
  const pub = d.publishDate ? new Date(d.publishDate) : null;
  const future = pub && !Number.isNaN(+pub) && pub > now;
  if (status === 'scheduled' && future) scheduledUpcoming++;
  const isLive = status === 'published' || (status === 'scheduled' && !future);
  if (isLive) {
    liveCount++;
    if (pub && !Number.isNaN(+pub) && (!latestPub || pub > latestPub)) latestPub = pub;
  }
}

const authors = safeReaddir(join(REPO, 'src/content/authors')).filter((f) => /\.(md|mdx|json|ya?ml)$/.test(f)).length;

let redirects = 0;
try { redirects = Object.keys(JSON.parse(readFileSync(join(REPO, 'src/redirects.json'), 'utf8'))).length; } catch {}

let ledger = 0;
try { const j = JSON.parse(readFileSync(LEDGER, 'utf8')); ledger = Array.isArray(j) ? j.length : Object.keys(j).length; } catch {}

// 最新發佈距今天數
let freshness = '—';
if (latestPub) {
  const days = Math.floor((now - latestPub) / 86400000);
  freshness = days <= 0 ? '今天' : `${days} 天前`;
}

const catLine = Object.entries(byCat)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${CAT_LABEL[k] || k}${v}`)
  .join('／');

const lines = [
  '📊 *數據心跳*',
  `• 站上文章：*${liveCount}* 篇已上線　（草稿 ${byStatus.draft || 0}／封存 ${byStatus.archived || 0}）`,
  `• 分類分布：${catLine || '—'}`,
  `• 最新發佈：${freshness}　｜　未來排程待上線：${scheduledUpcoming} 篇`,
  `• 作者：${authors} 位　｜　舊網址轉址表：${redirects} 條　｜　選題帳本：${ledger} 筆`,
];
process.stdout.write(lines.join('\n'));
