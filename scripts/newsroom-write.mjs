// 無人值守自動產文（子專案 2 / Phase 0）協調器。
//
// 與 /newsroom 日更一致：寫完直接發佈（status: published、push main 上線），
// 作者事後進編輯器修改。不走 PR。
//
// 職責（deterministic 部分，LLM 起草交給 claude -p）：
//   1. 讀 + 驗工單（scripts/lib/newsroom-job.mjs 把關：只限 tech、看法必填）。
//   2. 以批次模式 prompt 呼叫 claude -p，由它依 newsroom 規則起草（status: published）。
//   3. gate：pnpm check:links 全綠才往下（壞連結會擋整站部署，這關自動、非人工）。
//   4. commit + push（上線）。發佈後由作者在編輯器修改。
//
// 安全預設：不帶 --go 就是 dry-run（只驗證 + 印計畫 + 印 prompt，零副作用）。
//
// 用法：
//   node scripts/newsroom-write.mjs <job.json>          # dry-run（零副作用）
//   node scripts/newsroom-write.mjs <job.json> --stage   # 起草 + check:links + commit 在分支，不 push（先審）
//   node scripts/newsroom-write.mjs <job.json> --go      # 起草 + check:links + commit + push 上線
//
// 設計依據：docs/superpowers/specs/2026-06-16-unattended-newsroom-design.md

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateJob, normalizeJob } from './lib/newsroom-job.mjs';
import { nextOpenPublishDate, takenDatesFromContents } from './lib/publish-slot.mjs';

const ARTICLES_DIR = 'src/content/articles';

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  }
  return (r.stdout || '').trim();
}

/** 決定發佈狀態與日期：指定日 > 下一個空檔；今天/過去→published、未來→scheduled。 */
function computeSchedule(job) {
  const taipeiToday = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
  let target = job.publishDate || null;
  if (!target) {
    let contents = [];
    try {
      contents = readdirSync(ARTICLES_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => readFileSync(join(ARTICLES_DIR, f), 'utf8'));
    } catch {
      contents = [];
    }
    target = nextOpenPublishDate(takenDatesFromContents(contents), taipeiToday);
  }
  const scheduled = target > taipeiToday;
  return {
    status: scheduled ? 'scheduled' : 'published',
    dateYmd: target,
    publishDate: scheduled ? `${target}T08:00:00+08:00` : new Date().toISOString(),
    scheduled,
  };
}

/** 批次模式起草 prompt：跳雷達/問答、保留起草與查證、不 push（由協調器 gate 後處理）。 */
export function buildDraftPrompt(job, schedule = null) {
  const cite = job.mustCite.length ? `\n必引來源：\n${job.mustCite.map((c) => `- ${c}`).join('\n')}` : '';
  const len = job.length === 'deep' ? '深稿（3000+ 字）' : '短稿（800–1500 字）';
  const status = schedule?.status ?? 'published';
  const pubDate = schedule?.publishDate ?? new Date().toISOString();
  return [
    '你正在以「無人值守批次模式」執行 APPI News 的 /newsroom 科技類起草，寫完直接發佈。',
    '先讀 .claude/skills/newsroom/SKILL.md、persona.md、author-memory.json。',
    '',
    '【本批工單（取代 newsroom 步驟一雷達與步驟二問答）】',
    `- 題目（標題）：${job.title}`,
    `- 核心結論（Q1）：${job.conclusion}`,
    `- 切角（Q2）：${job.angle || '（依結論自訂）'}`,
    `- 真人觀點／本業經驗（Q3，作者本人提供，務必融入，不得稀釋成中性）：${job.viewpoint}`,
    `- 篇幅（Q4）：${len}`,
    `- 數據依據：${job.signal || '（無）'}`,
    `- 分類：tech${job.subcategory ? ` / ${job.subcategory}` : ''}`,
    cite,
    '',
    '【務必照做】',
    '1. 完整執行 newsroom 步驟三：查料、擴寫、每段必配圖、超連結逐條查證（每條 2xx 且內容支持該句，死連結一律換或刪），去 AI 腔複查、繁中台灣用語複查。',
    `2. frontmatter：status: "${status}"、publishDate: "${pubDate}"、category: "tech"、author: "lightman"、sourceType: "editorial"（須為 src/content.config.ts 的 sourceType enum 合法值），並用 disclosure 欄位揭露「以 AI 輔助起草、經人工查證編輯」。`,
    '3. 寫入 src/content/articles/<slug>.md（slug 你自訂，英文 kebab），並依步驟三.9 把本篇追加進 author-memory.json。',
    '4. 嚴禁杜撰：數據/事實/引述都要可連線來源；Q3 真人觀點只用工單給的那段，不得自行虛構作者經歷。',
    '5. **不要 git add / commit / push**——版控與發佈由外層腳本在 check:links gate 後處理。',
    '6. 完成後，最後輸出一段「查證報告」：條列文中每一條超連結 + 其 HTTP 狀態 + 是否支持該句。',
  ].join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const go = args.includes('--go');
  const stage = args.includes('--stage');
  const jobPath = args.find((a) => !a.startsWith('--'));
  if (!jobPath) die('用法：node scripts/newsroom-write.mjs <job.json> [--go]');

  // 1) 讀 + 驗
  let raw;
  try {
    raw = JSON.parse(readFileSync(jobPath, 'utf8'));
  } catch (e) {
    die(`讀不到/解析不了工單 ${jobPath}：${e.message}`);
  }
  const errors = validateJob(raw);
  if (errors.length) {
    die(`工單未過驗證（零副作用退出）：\n  - ${errors.join('\n  - ')}`);
  }
  const job = normalizeJob(raw);
  const schedule = computeSchedule(job);
  const prompt = buildDraftPrompt(job, schedule);

  if (!go && !stage) {
    console.log('— DRY RUN（不帶 --go/--stage，零副作用）—');
    console.log(`工單通過：${job.title}（tech${job.subcategory ? '/' + job.subcategory : ''}，${job.length}）`);
    console.log(`排程：${schedule.status}（${schedule.scheduled ? '排到 ' + schedule.dateYmd : '今天，立即發佈'}）`);
    console.log('將呼叫：claude -p <批次起草 prompt>');
    console.log('gate：pnpm check:links（壞連結擋整站部署）；然後 git commit + push');
    console.log('\n===== 批次起草 prompt 預覽 =====\n');
    console.log(prompt);
    return;
  }

  // --go：真的起草並發佈。安全前置——工作區乾淨（避免把無關改動掃進發佈 commit）。
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (sh('git', ['status', '--porcelain'])) {
    die('工作區不乾淨，請先清乾淨再跑（避免把無關改動掃進發佈 commit）');
  }
  console.log(`→ 在分支 ${branch} 上起草並發佈`);

  console.log('→ claude 起草中…');
  const draft = spawnSync('claude', ['-p', prompt], { stdio: 'inherit' });
  if (draft.status !== 0) die(`claude 起草失敗（exit ${draft.status}）`);

  // 必須真的產出了文章
  const produced = sh('git', ['status', '--porcelain', 'src/content/articles/']);
  if (!produced) die('claude 沒有在 src/content/articles/ 產出文章，中止（不發佈）');
  // 從產出檔推出 slug → 文章網址（給 Slack 回報帶連結）
  const artLine = produced.split('\n').map((l) => l.trim()).find((l) => l.endsWith('.md'));
  const slug = artLine ? artLine.replace(/^.*src\/content\/articles\//, '').replace(/\.md$/, '') : null;
  const url = slug ? `https://appi.news/articles/${slug}/` : null;

  // gate：壞連結會擋整站部署，沒過就不發佈（改動留在工作區供檢查，不自動還原）
  console.log('→ pnpm check:links（唯一自動關卡）');
  try {
    sh('pnpm', ['check:links'], { stdio: 'inherit' });
  } catch (e) {
    die(`check:links 未過，不發佈（改動留在工作區待你處理）：${e.message}`);
  }

  console.log('→ commit（只加文章產物，不用 git add -A）');
  // 只 stage 自動產文會產生的東西：文章、封面、內文圖、跨文記憶。
  // 不用 git add -A——否則 job 起跑後到這裡之間，工作區若有其他未提交改動
  // （例如有人同時在開發），會被掃進這篇發佈 commit。起點的乾淨檢查擋不了中途新增的檔。
  sh('git', ['add', '--', 'src/content/articles', 'public/covers', 'public/images', '.claude/skills/newsroom/author-memory.json']);
  sh('git', ['commit', '-m', `feat(article): 自動產文 — ${job.title}\n\n科技類自動產文（status: ${schedule.status}${schedule.scheduled ? '，' + schedule.dateYmd : ''}）。真人觀點由作者提供。`]);
  if (go) {
    console.log('→ push');
    sh('git', ['push']);
    console.log(schedule.scheduled ? `✓ 已排程 ${schedule.dateYmd} 發佈。` : '✓ 已發佈上線。可進編輯器修改。');
    if (schedule.scheduled) console.log(`SCHEDULED_DATE=${schedule.dateYmd}`); // 給外層解析
    if (url) console.log(`PUBLISHED_URL=${url}`);
  } else {
    console.log(`✓ 已 stage（commit 在分支 ${branch}，未 push）。審稿 OK 後 cherry-pick 到 main push 上線。`);
    if (url) console.log(`STAGED_SLUG=${slug}`);
  }
}

main();
