// 🤖 大腦優化（每日驗收）— 蒐集確定性 SEO/內容訊號 → claude-appi(sonnet) 濃縮成「機會 + 待辦」報告。
// 參考 dreamer868 的 checkup/run.mjs + heartbeat-brain.sh 模式（報告型，不自動改碼）。
// 鐵則：
//   - 模型一律明確 --model claude-sonnet-5（全域預設是 Opus，不帶會燒爆週額度）。
//   - claude-appi 撞週限會 exit 0 只印限額訊息 → 用 regex 偵測，退化成「僅確定性事實」，不沉默。
//   - 效能判讀內嵌冷邊緣 caveat：低流量站 PSI 分數低多半是假象，別建議追 PSI 分數改程式
//     （見 PERFORMANCE.md §3 / docs/lessons/psi-cold-edge.md）。
// 輸出：一段 Slack markdown 到 stdout（由 cron 包裝腳本 pipe 給 cron-report.mjs --dev）。
// 也可手動：GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json node scripts/brain-checkup.mjs
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIMIT_RE = /API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit/i;

/** 跑 seo-opportunities.mjs 取三區塊 JSON；失敗回 null（不擋心跳）。 */
function seoSignals() {
  const r = spawnSync('node', [join(REPO, 'scripts/seo-opportunities.mjs')], {
    cwd: REPO, encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || `${process.env.HOME}/.config/appi-news/ga4-sa.json` },
  });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

/** 把三區塊濃縮成幾行確定性事實（AI 失敗時也用得上）。 */
function seoFacts(seo) {
  if (!seo) return ['• SEO 訊號：_(GSC 取數失敗或無資料，略過本次判讀)_'];
  const pg = (seo.pageOpportunities || []).slice(0, 5);
  const ct = (seo.titleCtrCandidates || []).slice(0, 5);
  const dm = (seo.searchDemandTopics || []).slice(0, 5);
  const out = [];
  out.push(`• 第 2 頁衝刺機會：${(seo.pageOpportunities || []).length} 個頁面（補內鏈/深度可進第一頁）`);
  if (pg.length) out.push(...pg.map((p) => `   ‣ ${p.path || p.page || ''}（排名 ${Math.round((p.position || 0) * 10) / 10}、曝光 ${p.impressions || 0}）`));
  out.push(`• 改標題搶點擊：${(seo.titleCtrCandidates || []).length} 個高曝光低 CTR 配對`);
  out.push(`• 讀者在搜、本站還沒吃到的需求題：${(seo.searchDemandTopics || []).length} 個`);
  if (dm.length) out.push(...dm.map((q) => `   ‣ ${q.query || ''}（曝光 ${q.impressions || 0}）`));
  return out;
}

/** 跑 geo-citation-audit recent 取 AEO 被引用趨勢；失敗回 null（不擋心跳）。 */
function geoSignals() {
  const r = spawnSync('node', [join(REPO, 'scripts/geo-citation-audit.mjs'), 'recent', '30'], {
    cwd: REPO, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024,
  });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

/** AEO 被引用摘要濃縮成幾行事實（無資料時誠實說待累積）。 */
function geoFacts(geo) {
  if (!geo || !geo.totalQuestions) return ['• AEO 能見度：_(近 30 天無 aeo-radar 量測資料，待累積)_'];
  const out = [];
  out.push(`• AEO 被引用：近 30 天 ${geo.rounds} 輪、${geo.citedQuestions}/${geo.totalQuestions} 題引用到 appi.news（率 ${geo.citedRate}）`);
  const blind = Object.entries(geo.byCategory || {}).filter(([, v]) => v.cited === 0).map(([k]) => k);
  if (blind.length) out.push(`   ‣ 完全隱形的 beat：${blind.join('、')}`);
  const comp = (geo.competitorShare || []).slice(0, 5);
  if (comp.length) out.push(`   ‣ 這些題被 AI 當權威的競品：${comp.map((c) => `${c.name}(${c.citedQuestions})`).join('、')}`);
  return out;
}

/** 跑 section-report / funnel-report 取分區塊動能與轉換;失敗回 null（不擋心跳）。 */
function reportSignals(script, args = []) {
  const r = spawnSync('node', [join(REPO, 'scripts', script), ...args], {
    cwd: REPO, encoding: 'utf8', timeout: 90000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || `${process.env.HOME}/.config/appi-news/ga4-sa.json` },
  });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

/** 分區塊動能:哪些 beat 讀者最黏(平均停留高)、量能。 */
function sectionFacts(sec) {
  const list = (sec?.sections || []).filter((s) => !['home', 'other', 'authors'].includes(s.section));
  if (!list.length) return ['• 分區塊人流：_(無資料，待累積)_'];
  const byEng = [...list].sort((a, b) => (b.avgEngagedSecPerView || 0) - (a.avgEngagedSecPerView || 0)).slice(0, 3);
  const byViews = [...list].sort((a, b) => b.views - a.views).slice(0, 3);
  return [
    `• 最黏的分區塊(每次瀏覽平均停留)：${byEng.map((s) => `${s.section}(${s.avgEngagedSecPerView}s)`).join('、')}`,
    `• 量能前段：${byViews.map((s) => `${s.section}(${s.views})`).join('、')}`,
  ];
}

/** 服務漏斗:意向頁→投稿→lead。 */
function funnelFacts(fn) {
  const f = fn?.funnel;
  if (!f) return ['• 服務漏斗：_(無資料，待累積)_'];
  return [`• 服務漏斗：方案/服務頁 ${f.steps?.[0]?.users ?? 0} 人 → 投稿頁 ${f.steps?.[1]?.users ?? 0} 人 → 送出 ${f.leads} 次（generate_lead 需埋點部署後才計）`];
}

function buildPrompt(facts) {
  return `你是 appi.news 的維運/SEO 大腦，每天做一次「優化驗收」。以下是今天的確定性訊號：

${facts}

請產出一段精簡的 Slack 報告，只講「能動手的優化機會」與「具體待辦」，幫編輯/開發決定今天該做什麼。要求：
- 繁體中文、台灣用語；去 AI 腔，禁破折號、禁「不僅…更…」「值得注意的是」這類套語。
- 結構：用「機會」與「待辦」兩小段，各 2-4 條 bullet，每條一句話、可執行（例如「為 X 文補 2 條內鏈指向 Y」）。
- 以 SEO 訊號為主軸（第 2 頁衝刺、改標題搶點擊、補需求題）；若訊號不足就誠實說資料待累積，不要硬湊。
- 若有 AEO 能見度訊號：把「完全隱形的 beat」與「競品在哪些題被 AI 當權威（尤其商周/哈佛商業評論）」轉成一條選題/補稿方向；全站 0 被引用時，結論是先衝收錄與權威內容，別建議追這個數字。
- 若有分區塊/漏斗訊號：把「最黏(平均停留高)的 beat」轉成一條「加碼該 beat 選題」的建議；服務漏斗若卡在某段(意向頁→投稿落差大)，給一條 CTA/文案優化待辦。
- 效能/PSI 注意：本站流量低，PSI mobile 分數低多半是冷邊緣假象，**不要**建議「為了拉高 PSI 分數去改程式」；真要動效能先看 TBT/CLS/render-blocking 與實體資源。
- 全文 800 字內，不要前言結語，直接給內容。`;
}

function runClaude(prompt) {
  const r = spawnSync('claude-appi', ['--model', 'claude-sonnet-5', '-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 300000 });
  const text = r.stdout || '';
  const failed = r.error || r.status !== 0 || LIMIT_RE.test(text) || !text.trim();
  return { text: text.trim(), failed };
}

const seo = seoSignals();
const geo = geoSignals();
const sec = reportSignals('section-report.mjs', ['--days', '28']);
const fn = reportSignals('funnel-report.mjs', ['--days', '28']);
const facts = [...seoFacts(seo), ...geoFacts(geo), ...sectionFacts(sec), ...funnelFacts(fn)].join('\n');

const { text, failed } = runClaude(buildPrompt(facts));

if (failed) {
  // AI 失敗/撞限額：退化成「僅確定性事實」，不沉默。
  process.stdout.write([
    '🤖 *大腦優化（每日驗收）* ⚠️（AI 判讀失敗，僅確定性事實）',
    '',
    ...seoFacts(seo),
    ...geoFacts(geo),
    ...sectionFacts(sec),
    ...funnelFacts(fn),
  ].join('\n'));
} else {
  process.stdout.write(`🤖 *大腦優化（每日驗收）*\n\n${text}`);
}
