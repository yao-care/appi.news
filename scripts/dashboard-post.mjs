// 單一 Slack 統整報表:8 區塊(中文,置頂)+ 受眾 + 漏斗 + AEO + 連結。
// 一則搞定、附連結,釘在 dev 頻道就記得去看。供 cron 每日/每週呼叫。
// 用法:node scripts/dashboard-post.mjs | node scripts/cron-report.mjs --dev --stdin
//   (需 GOOGLE_APPLICATION_CREDENTIALS;純讀,不碰 git)
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SECTION_ORDER, sectionLabel } from './lib/section-metrics.mjs';
import { GA4_PROPERTY_ID } from './lib/report-config.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
function run(script, args = []) {
  const r = spawnSync('node', [join(REPO, 'scripts', script), ...args], {
    cwd: REPO, encoding: 'utf8', timeout: 90000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || `${process.env.HOME}/.config/appi-news/ga4-sa.json` },
  });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

const days = 28;
const sec = run('section-report.mjs', ['--days', String(days)]);
const aud = run('audience-report.mjs', ['--days', String(days)]);
const fn = run('funnel-report.mjs', ['--days', String(days)]);
const geo = run('geo-citation-audit.mjs', ['recent', '30']);

const lines = [];
lines.push(`📊 *APPI News 數據總覽*（近 ${days} 天）`);

// ── 8 區塊(中文置頂)──
lines.push('');
lines.push('*分區塊人流*（瀏覽 · 每次瀏覽平均停留）');
if (sec?.sections?.length) {
  const map = Object.fromEntries(sec.sections.map((s) => [s.section, s]));
  for (const key of SECTION_ORDER) {
    const s = map[key];
    if (!s) continue;
    lines.push(`• ${sectionLabel(key)}：${s.views} 瀏覽 · ${s.avgEngagedSecPerView}s`);
  }
  lines.push('_（準確「人數」由 content_group 中文埋點累積中，見下方 GA 連結的「各頻道人數」）_');
} else {
  lines.push('_（分區塊資料待累積）_');
}

// ── 受眾 ──
if (aud?.totals) {
  const t = aud.totals;
  const dev = (aud.device || []).map((d) => `${d.device} ${d.sharePct}%`).join('、');
  const geo5 = (aud.taiwanRegions || []).slice(0, 5).map((g) => `${g.region} ${g.sharePct}%`).join('、');
  const ret = aud.returning?.returningRate != null ? `${Math.round(aud.returning.returningRate * 100)}%` : 'n/a';
  lines.push('');
  lines.push('*受眾*');
  lines.push(`• 使用者 ${t.users}、每人平均停留 ${t.avgEngagedSecPerUser}s、回訪率 ${ret}`);
  lines.push(`• 裝置：${dev}`);
  lines.push(`• 台灣縣市 Top5：${geo5}`);
}

// ── 服務漏斗 ──
if (fn?.funnel) {
  const f = fn.funnel;
  lines.push('');
  lines.push('*服務漏斗*');
  lines.push(`• 方案/服務頁 ${f.steps?.[0]?.users ?? 0} 人 → 投稿頁 ${f.steps?.[1]?.users ?? 0} 人 → 送出 ${f.leads} 次`);
}

// ── AEO 能見度 ──
if (geo?.totalQuestions) {
  lines.push('');
  lines.push('*AEO 能見度*');
  lines.push(`• 近 30 天 ${geo.citedQuestions}/${geo.totalQuestions} 題被 AI 引用到 appi.news`);
  const comp = (geo.competitorShare || []).slice(0, 3).map((c) => `${c.name}(${c.citedQuestions})`).join('、');
  if (comp) lines.push(`• 被 AI 當權威的競品：${comp}`);
}

// ── 連結(留著方便點) ──
lines.push('');
lines.push('*連結*');
lines.push(`• GA（探索 →「各頻道人數」看分區塊中文）：https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/intelligenthome`);
lines.push('• 線上站：https://appi.news/');
lines.push('• GEO 寫作洞察：https://github.com/yao-care/appi.news/blob/main/.claude/skills/newsroom/geo-insights/health.md');

console.log(lines.join('\n'));
