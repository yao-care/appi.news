// 便民市政協調器：抓各縣市政府 RSS → 濾掉已見 → Claude 跨縣市統整一篇 → 自動上架。
// 純寫作邏輯在 scripts/lib/lifestyle-civic.mjs；抓取在 scripts/lib/civic-fetch.mjs；去重帳本在
// scripts/lib/civic-ledger.mjs。每日由 cron 呼叫（台北 18:00 = UTC 10:00）。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push、不記帳本；--go 寫+commit+push 上架＋記帳本。
//   node scripts/lifestyle-civic.mjs            # dry-run
//   node scripts/lifestyle-civic.mjs --stage    # 產樣稿（不上線、不動帳本）
//   node scripts/lifestyle-civic.mjs --go        # 自動上架
//
// 「有新資料才寫」：候選經帳本濾掉近 30 天見過的；濾完為 0 → 不呼叫 LLM、安靜結束。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildCivicPrompt, parseCivicResult } from './lib/lifestyle-civic.mjs';
import { fetchCivicCandidates } from './lib/civic-fetch.mjs';
import { loadSeen, filterNew, recordSeen } from './lib/civic-ledger.mjs';
import { runClaudeArticle } from './lib/claude-cli.mjs';
import { runArticleGates } from './lib/publish-pipeline.mjs';
import { articleTitle, recentTitles } from './lib/article-index.mjs';
import { salvageArticle } from './lib/changed-articles.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';

const ARTICLES_DIR = 'src/content/articles';
const has = (n) => process.argv.includes(`--${n}`);
function die(m) { console.error(`✖ ${m}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

/** 近 N 天已發的便民整理（slug 以 civic-services 起頭）標題，給去重（索引正本＝lib/article-index.mjs）。 */
const recentCivicTitles = (days = 14) => recentTitles({ days, filter: (e) => e.slug.startsWith('civic-services') });

async function main() {
  const go = has('go');
  const stage = has('stage');
  const recent = recentCivicTitles(14);

  console.log('→ 固定抓取各縣市政府便民 RSS 候選中（零 LLM）…');
  const { candidates, stats } = await fetchCivicCandidates({ days: 2, log: (m) => console.log(m) });
  const seen = loadSeen();
  const fresh = filterNew(candidates, seen);
  console.log(`抓到 ${stats.reached} 站（涵蓋 ${stats.areas.length} 縣市）；便民候選 ${candidates.length} 則，濾掉已見後新候選 ${fresh.length} 則。`);
  for (const c of fresh) console.log(`CANDIDATE=${c.area}｜${c.title}｜${c.url}`);
  const prompt = buildCivicPrompt(fresh, recent);

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 14 天已發：${recent.length} 篇；新候選：${fresh.length} 則`);
    console.log('\n===== Claude 寫作指令 =====\n');
    console.log(prompt);
    return;
  }

  // 有新資料才寫：新候選為 0 → 不呼叫 LLM，安靜結束（符合站長「沒新資料就不寫」）。
  if (!fresh.length) { console.log('✓ 本次無新便民資料（各站近 2 天無新的便民措施），不呼叫 LLM，安靜結束。'); return; }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 便民市政整理（分支 ${branch}，${go ? '上架' : 'stage 不 push'}）`);
  // 成功判定三態的正本＝lib/claude-cli.mjs。單發線 quota/fail 都中止（infra 失敗，不記帳本、下輪重試）。
  const c = runClaudeArticle({ prompt });
  if (c.kind === 'quota') die(`撞用量上限（不記帳本、候選保留下輪重試）：${c.detail}`);
  if (c.kind === 'fail') die(`claude 失敗：${c.detail}`);
  const v = parseCivicResult(c.stdout);
  console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  // 解析不出 CIVIC_RESULT＝故障，不是 Claude 的判斷。舊碼在這裡照樣 recordSeen(fresh)，
  // 等於**一次故障就把當天整批候選永久記成「已判過」**，那些題再也不會被提；而且模型可能
  // 已經把稿寫好在工作區，會隨 worktree 被刪掉。→ 先撿稿，撿不到就不記帳本、留給下輪重試。
  if (v.infra) {
    const found = salvageArticle(ARTICLES_DIR);
    if (found && found.action === 'new') {
      console.log(`  ⚠️ 無 CIVIC_RESULT，但工作區有寫好的 ${found.slug} → 撿回，續走既有關卡`);
      v.action = 'new';
      v.slug = found.slug;
    } else {
      console.log(`✗ ${v.note}：不記帳本、候選保留下輪重試（故障不等於判斷）。`);
      return;
    }
  } else if (v.action !== 'new' || !produced) {
    // Claude 判定無合適便民措施：把這批新候選記進帳本（已判過、不再重覆提供）——僅 --go。
    if (go) recordSeen(fresh);
    console.log('✓ 本次無產出（無合適便民措施或未寫檔）。');
    return;
  }

  // 用系統時間蓋掉模型寫的 publishDate（模型無可靠時鐘，常把「現在」填成未來 → 變排程稿）。
  if (v.slug) {
    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${new Date().toISOString()}"`));
  }

  // gate 集合與順序的正本＝lib/publish-pipeline.mjs（缺圖→growth report-only→標籤→去 AI 腔→封面規格）。
  // 單發線一篇＝整批，未過即中止（改動留工作區待修）。
  if (v.slug) {
    const g = runArticleGates(v.slug, { log: (m) => console.log(m) });
    if (!g.ok) die(`${g.label} 未過，不發佈（改動留工作區）：${g.detail || ''}`);
  }

  // worktree 無殘留 dist → 先 build 再 check:links；失敗同步最新 main 自癒重試一次（並發防護）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', `feat(article): 便民市政整理\n\n整理自各縣市政府公開新聞稿/公告、附原文出處、編輯部署名。`]);
  if (go) {
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    recordSeen(fresh); // 上架成功才記帳本（發佈失敗則保留、下輪重試）
    console.log('✓ 已上架。');
    if (v.slug) console.log(`PUBLISHED=https://appi.news/articles/${v.slug}/ ｜ ${articleTitle(v.slug) || v.slug}`);
  } else {
    console.log('✓ 已 stage（未 push、未記帳本）。');
    if (v.slug) console.log(`STAGED=${v.slug} ｜ ${articleTitle(v.slug) || v.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
