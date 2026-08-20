// 警消好人好事協調器：掃各地警局新聞稿 → Claude 寫暖聞 roundup → 自動上架。
// 純寫作邏輯在 scripts/lib/lifestyle-police.mjs。一週一次由 cron 呼叫。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push；--go 寫+commit+push 上架。
//   node scripts/lifestyle-police.mjs            # dry-run
//   node scripts/lifestyle-police.mjs --stage    # 產樣稿（不上線）
//   node scripts/lifestyle-police.mjs --go        # 自動上架

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildPolicePrompt, parsePoliceResult } from './lib/lifestyle-police.mjs';
import { fetchPoliceCandidates } from './lib/police-fetch.mjs';
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

/** 近 N 天已發的警消好人好事整理（slug 以 police-good-deeds 起頭）標題，給去重（索引正本＝lib/article-index.mjs）。 */
const recentPoliceTitles = (days = 30) => recentTitles({ days, filter: (e) => e.slug.startsWith('police-good-deeds') });

async function main() {
  const go = has('go');
  const stage = has('stage');
  const recent = recentPoliceTitles(30);

  // 固定抓取（零 LLM）：各站列表 → 近 7 天 + 關鍵字初篩 → 查證 2xx → 抓詳情正文 → 候選清單。
  console.log('→ 固定抓取各地警局好人好事候選中（零 LLM）…');
  const candidates = await fetchPoliceCandidates({ days: 7, log: (m) => console.log(m) });
  console.log(`共 ${candidates.length} 則候選（近 7 天、關鍵字初篩、連結已驗證）。`);
  // 逐則印出候選（含 CANDIDATE= 前綴供 .sh 失敗回報擷取）：否則只看得到各縣市計數，
  // 撞額度失敗時完全不知道收到的是哪幾則、白抓一場。
  for (const c of candidates) console.log(`CANDIDATE=${c.area}｜${c.title}｜${c.url}`);
  const prompt = buildPolicePrompt(candidates, recent, 7);

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 30 天已發：${recent.length} 篇；候選：${candidates.length} 則`);
    console.log('\n===== Claude 寫作指令 =====\n');
    console.log(prompt);
    return;
  }

  // 零候選 → 不呼叫 LLM（省額度、避免撞 rate limit）。
  if (!candidates.length) { console.log('✓ 本次無候選（各站近 7 天無合格好人好事），不呼叫 LLM，安靜結束。'); return; }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 警消好人好事整理（分支 ${branch}，${go ? '上架' : 'stage 不 push'}）`);
  // 成功判定三態的正本＝lib/claude-cli.mjs。單發線 quota/fail 都中止（候選下輪重抓）。
  const c = runClaudeArticle({ prompt });
  if (c.kind === 'quota') die(`撞用量上限（候選下輪重抓）：${c.detail}`);
  if (c.kind === 'fail') die(`claude 失敗：${c.detail}`);
  const v = parsePoliceResult(c.stdout);
  console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  // 解析不出 POLICE_RESULT＝故障，不是「無合格好人好事」：模型可能已把稿寫好在工作區，
  // 舊碼會讓它隨 worktree 被刪掉（已燒的查證 token 全白費）。→ 撿回來走既有 gate。
  if (v.infra) {
    const found = salvageArticle(ARTICLES_DIR);
    if (found && found.action === 'new') {
      console.log(`  ⚠️ 無 POLICE_RESULT，但工作區有寫好的 ${found.slug} → 撿回，續走既有關卡`);
      v.action = 'new';
      v.slug = found.slug;
    } else {
      console.log(`✗ ${v.note}（工作區沒有可歸屬的稿），本次無產出。`);
      return;
    }
  } else if (v.action !== 'new' || !produced) { console.log('✓ 本次無產出（各家抓不到或無合格好人好事）。'); return; }

  // 用系統時間蓋掉模型寫的 publishDate（模型無可靠時鐘，常把「現在」填成未來整點 → 變排程稿、
  // 不立即上線）。警消是全自動即時發，必須當下上線（同 international-write 的處理）。
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

  // worktree 無殘留 dist → 先 build 再 check:links；失敗時同步最新 main 自癒重試一次（並發防護，不序列化）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', `feat(article): 警消好人好事整理\n\n整理自各地警察局公開新聞稿、附原文出處、編輯部署名。`]);
  if (go) {
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    console.log('✓ 已上架。');
    if (v.slug) console.log(`PUBLISHED=https://appi.news/articles/${v.slug}/ ｜ ${articleTitle(v.slug) || v.slug}`);
  } else {
    console.log('✓ 已 stage（未 push）。');
    if (v.slug) console.log(`STAGED=${v.slug} ｜ ${articleTitle(v.slug) || v.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
