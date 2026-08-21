// 影片心得協調器：抓訂閱 YouTube 頻道 RSS → 濾掉已看過 → Claude 挑一支＋交叉查證＋寫一篇 → 自動上架。
// 寫作純邏輯在 scripts/lib/lifestyle-video.mjs；抓取在 scripts/lib/video-fetch.mjs；
// 去重帳本在 scripts/lib/video-ledger.mjs。每日由 cron 呼叫（台北 20:00 = UTC 12:00）。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push、不記帳本；--go 寫+commit+push 上架＋記帳本。
//   node scripts/lifestyle-video.mjs            # dry-run
//   node scripts/lifestyle-video.mjs --stage    # 產樣稿（不上線、不動帳本）
//   node scripts/lifestyle-video.mjs --go       # 自動上架
//
// 「有新片才寫」：候選經帳本濾掉近 60 天看過的；濾完為 0 → 不呼叫 LLM、安靜結束。

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildVideoPrompt, parseVideoResult } from './lib/lifestyle-video.mjs';
import { fetchVideoCandidates } from './lib/video-fetch.mjs';
import { loadSeen, filterNew, recordSeen } from './lib/video-ledger.mjs';
import { runWriterArticle } from './lib/writer-cli.mjs'; // 寫作＝codex（站長 2026-08-22 裁示），查核仍走 claude-cli
import { runArticleGates } from './lib/publish-pipeline.mjs';
import { articleTitle, recentTitles } from './lib/article-index.mjs';
import { salvageArticle } from './lib/changed-articles.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';

const ARTICLES_DIR = 'src/content/articles';
const has = (n) => process.argv.includes(`--${n}`);
/** `--max N`：**只給手動除錯用**的候選上限（省額度）。cron 不帶 → 無上限（站長 2026-07-27 指示）。 */
function maxCandidates() {
  const i = process.argv.indexOf('--max');
  const n = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : Infinity;
}
function die(m) { console.error(`✖ ${m}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}


/**
 * 丟掉本輪剛產出、但沒過逐篇 gate 的一篇（不連累同批其他篇）。
 * **只刪 git 眼中未追蹤的檔**——確保絕不會誤刪既有內容，最壞情況是留幾個孤兒檔（無害，worktree 用完即丟）。
 */
function dropArticle(slug) {
  let untracked = [];
  try {
    untracked = sh('git', ['ls-files', '--others', '--exclude-standard', '--', ARTICLES_DIR, 'public/covers', 'public/images'])
      .split('\n').filter(Boolean);
  } catch { return; }
  const mine = untracked.filter((p) => p.includes(`/${slug}.md`) || p.includes(`/${slug}-`));
  for (const p of mine) {
    try { rmSync(p, { force: true }); console.error(`     已移除 ${p}`); } catch { /* 留著也無妨 */ }
  }
}

/**
 * 近 N 天這條線已發過的標題，給去重（索引正本＝lib/article-index.mjs）。
 * 這條線的 slug 是主題式的（沒有固定前綴），改以「正文帶影片出處卡」當識別。
 */
const recentVideoTitles = (days = 14) => recentTitles({ days, filter: (e) => e.raw.includes('class="video-embed"') });

async function main() {
  const go = has('go');
  const stage = has('stage');
  const recent = recentVideoTitles(14);

  console.log('→ 固定抓取訂閱頻道的 YouTube RSS 候選中（零 LLM）…');
  const { candidates, stats } = await fetchVideoCandidates({ days: 2, log: (m) => console.log(m) });
  const seen = loadSeen();
  const all = filterNew(candidates, seen);
  const cap = maxCandidates();
  const fresh = all.slice(0, cap);
  if (all.length > fresh.length) console.log(`（--max ${cap}：${all.length} 支只處理前 ${fresh.length} 支，其餘留在帳本外、下輪再看）`);
  console.log(`抓到 ${stats.reached} 個頻道（${stats.channels.join('、') || '無'}）；生活線候選 ${candidates.length} 支，濾掉已看過後新候選 ${fresh.length} 支。`);
  for (const c of fresh) console.log(`CANDIDATE=${c.source}｜${c.title}｜${c.url}`);

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 14 天已發：${recent.length} 篇；新候選：${fresh.length} 支（每支各喚一次 Claude，無篇數上限）`);
    if (fresh.length) {
      console.log('\n===== Claude 寫作指令（第 1 支示例）=====\n');
      console.log(buildVideoPrompt(fresh[0], recent));
    }
    return;
  }

  // 有新片才寫：新候選為 0 → 不呼叫 LLM，安靜結束。
  if (!fresh.length) { console.log('✓ 本次無新影片候選（訂閱頻道近 2 天無新的生活線影片），不呼叫 LLM，安靜結束。'); return; }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 影片線索整理（分支 ${branch}，${fresh.length} 支候選逐支處理，${go ? '上架' : 'stage 不 push'}）`);

  // 站長 2026-07-27 拿掉「一天一篇」上限：逐支候選各喚一次 Claude，過 gate 的都寫。
  // 撞用量上限就 break 中止整批（別再空打剩下的，見 lessons/automation-model-and-account-split.md）。
  const written = [];
  let quotaHit = false;
  // 因故障（API error／解析不出結果）而沒拿到判斷的候選：不可記進帳本，留給下輪重試。
  const failed = new Set();
  for (const [i, c] of fresh.entries()) {
    console.log(`\n[${i + 1}/${fresh.length}] ${c.source}｜${c.title}`);
    const prompt = buildVideoPrompt(c, [...recent, ...written.map((w) => w.title)]);
    // 成功判定三態的正本＝lib/claude-cli.mjs：quota 中止整批；fail 跳過這支（不記帳本）。
    const run = runWriterArticle({ prompt });
    if (run.kind === 'quota') {
      console.error(`  ✖ 撞用量上限，中止整批（已寫 ${written.length} 篇）：${run.detail}`);
      quotaHit = true;
      break;
    }
    if (run.kind === 'fail') {
      console.error(`  ✖ claude 失敗，跳過這支：${run.detail}`);
      failed.add(c);
      continue;
    }
    const v = parseVideoResult(run.stdout);
    console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);
    // 解析不出 VIDEO_RESULT＝故障，不是「這支不值得寫」：不可記進帳本（記了就永遠不再被提），
    // 且模型可能已把稿寫好在工作區 → 先撿回來走既有 gate。
    if (v.infra) {
      failed.add(c);
      const found = salvageArticle(ARTICLES_DIR, written.map((w) => w.slug));
      if (!found || found.action !== 'new') { console.error(`  ✖ ${v.note}：不記帳本、下輪重試`); continue; }
      console.log(`  ⚠️ 無 VIDEO_RESULT，但工作區有寫好的 ${found.slug} → 撿回，續走既有關卡`);
      v.action = 'new';
      v.slug = found.slug;
    }
    if (v.action !== 'new' || !v.slug) continue;

    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    if (!existsSync(file)) { console.error(`  ✖ 回報 NEW 但檔案不存在（${file}），跳過`); continue; }
    // 用系統時間蓋掉模型寫的 publishDate（模型無可靠時鐘，常把「現在」填成未來 → 變排程稿）。
    writeFileSync(file, readFileSync(file, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${new Date().toISOString()}"`));

    // 逐篇 gate（集合與順序的正本＝lib/publish-pipeline.mjs）：不合格的**只丟這一篇**，不連累同批其他篇。
    const g = runArticleGates(v.slug, { log: (m) => console.log(m) });
    if (!g.ok) { console.error(`  ✖ ${g.label} 未過，丟棄這篇：${(g.detail || '').slice(-400)}`); dropArticle(v.slug); continue; }
    written.push({ slug: v.slug, title: articleTitle(v.slug) || v.slug });
    console.log(`  ✓ 通過逐篇 gate`);
  }

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  if (!written.length || !produced) {
    // 沒有任何一支通得過：把這批候選記進帳本（已判過、不再重覆提供）——僅 --go 且非額度問題。
    if (go && !quotaHit) recordSeen(fresh.filter((c) => !failed.has(c)));
    console.log(`\n✓ 本次無產出（${quotaHit ? '撞用量上限，候選保留下輪重試' : '無合適題目或未寫檔'}）。`);
    return;
  }
  console.log(`\n→ 本輪通過 ${written.length} 篇，進 build/check:links`);

  // worktree 無殘留 dist → 先 build 再 check:links；失敗同步最新 main 自癒重試一次（並發防護）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', `feat(article): 影片線索整理 ${written.length} 篇\n\n線索來自訂閱 YouTube 頻道，事實經公開來源交叉查證、附出處，編輯部署名。\n\n${written.map((w) => `- ${w.title}`).join('\n')}`]);
  if (go) {
    const pr = pushToMain({ cwd: process.cwd() });
    if (!pr.ok) die(`推送 main 失敗：${pr.err}`);
    // 上架成功才記帳本（發佈失敗則保留、下輪重試）；因故障沒拿到判斷的那幾支同樣不記。
    recordSeen(fresh.filter((c) => !failed.has(c)));
    console.log(`✓ 已上架 ${written.length} 篇。`);
    for (const w of written) console.log(`PUBLISHED=https://appi.news/articles/${w.slug}/ ｜ ${w.title}`);
  } else {
    console.log(`✓ 已 stage ${written.length} 篇（未 push、未記帳本）。`);
    for (const w of written) console.log(`STAGED=${w.slug} ｜ ${w.title}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
