// article-draft 消費端協調器：把 /admin「文章寫作工單」issue 走 newsroom 正規產線寫成文章、開 PR。
// 被 slack-actions-server 的 devbot 車道（type: writeArticle）spawn；完成寫 result.json。
//
//   node scripts/article-write.mjs <out-dir> --issue <N> [--fallback-category <slug>]
//
// 設計脈絡見 CLAUDE.md「自動發文 pipeline」與 docs/lessons/article-draft-consumer.md：
//   - 在 /root/appi.news-devbridge 專屬 clone 開 issue 專屬 worktree（分支 article/issue-N，base origin/main）。
//   - 寫作步驟＝ newsroom-write.mjs --stage --allow-any-category（保留配圖硬性 gate、連結查證、build+check:links，
//     只寫＋commit、不 push），一律 kind=factual → 產 noindex 待審草稿（排遠未來，人工核可才上線）。
//   - 外層負責 push 分支 + gh pr create（Closes #N），PR 當程式審查閘；merge 後仍是待審草稿，
//     由編輯器/Slack 發佈鈕轉正上線（雙閘，符合站上既有 factual 流程）。
//   - 絕不 merge、不部署、不繞過配圖 gate。

import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { parseArticleIssueBody } from './lib/article-issue.mjs';
import { validateJob } from './lib/newsroom-job.mjs';

const BASE_CLONE = process.env.DEVBOT_BASE || '/root/appi.news-devbridge';
const WT_ROOT = process.env.DEVBOT_WT_ROOT || '/root/appi.news-devbridge-wt';
const REPO = 'yao-care/appi.news';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function sh(cmd, args, cwd, { allowFail = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: process.env });
  if (r.status !== 0 && !allowFail) {
    throw new Error(`${cmd} ${args.join(' ')} 失敗: ${(r.stderr || r.stdout || '').trim().slice(-400)}`);
  }
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}
const git = (args, cwd = BASE_CLONE, opts) => sh('git', args, cwd, opts);
const gh = (args, opts) => sh('gh', args, BASE_CLONE, opts);

/** article-draft issue #N → 專屬分支名（與 dev/issue-N 區隔，避免語意混淆）。 */
function branchForArticle(n) {
  return `article/issue-${Number(n)}`;
}

/** 開/沿用 issue 專屬 worktree（同 issue 多次觸發＝在同分支上重寫，沿用同 PR）。 */
function ensureWorktree(issue) {
  const branch = branchForArticle(issue);
  const wt = `${WT_ROOT}/article-issue-${issue}`;
  git(['fetch', 'origin', '--prune']);
  if (!existsSync(wt)) {
    mkdirSync(WT_ROOT, { recursive: true });
    git(['worktree', 'add', '-B', branch, wt, 'origin/main']);
    const baseModules = `${BASE_CLONE}/node_modules`;
    if (existsSync(baseModules) && !existsSync(`${wt}/node_modules`)) {
      try { symlinkSync(baseModules, `${wt}/node_modules`, 'dir'); } catch { /* build 時自行 install */ }
    }
  }
  return { branch, worktree: wt };
}

function main() {
  const outDir = process.argv[2];
  const issue = Number(arg('--issue'));
  const fallbackCategory = arg('--fallback-category');
  if (!outDir || !Number.isInteger(issue)) {
    console.error('用法：node scripts/article-write.mjs <out-dir> --issue <N> [--fallback-category <slug>]');
    process.exit(2);
  }
  if (!existsSync(BASE_CLONE)) throw new Error(`缺專屬 clone ${BASE_CLONE}`);
  mkdirSync(outDir, { recursive: true });
  const resultPath = join(outDir, 'result.json');
  const writeResult = (o) => writeFileSync(resultPath, JSON.stringify(o, null, 2));

  // 1) 取工單（issue 內文）→ 解析成 newsroom job
  const view = gh(['issue', 'view', String(issue), '--repo', REPO, '--json', 'title,body']);
  const { title: issueTitle, body } = JSON.parse(view.out);
  const { job, warnings } = parseArticleIssueBody({ title: issueTitle, body, fallbackCategory });
  const errors = validateJob(job, { allowAnyCategory: true });
  if (errors.length) {
    writeResult({ ok: false, issue, title: issueTitle, error: `工單無法轉成有效稿件：\n- ${errors.join('\n- ')}`, warnings });
    console.error(`工單驗證失敗：${errors.join('；')}`);
    process.exit(1);
  }

  // 2) worktree（分支 article/issue-N，base origin/main）
  const { branch, worktree } = ensureWorktree(issue);

  // 3) 寫 job.json（放 outDir/job/，newsroom-write 的 result.json 會落同目錄，不與本協調器 result.json 撞名）
  const jobDir = join(outDir, 'job');
  mkdirSync(jobDir, { recursive: true });
  const jobPath = join(jobDir, 'job.json');
  writeFileSync(jobPath, JSON.stringify(job, null, 2));

  // 4) 走 newsroom 正規產線：--stage（寫＋配圖 gate＋連結查證＋build+check:links＋commit、不 push）
  //    --allow-any-category（放寬白名單，允許 health/focus/finance/columns 等真人下單分類）
  console.log(`→ newsroom-write --stage（${job.category}／${job.kind}）：${job.title}`);
  const nw = spawnSync('node', ['scripts/newsroom-write.mjs', jobPath, '--stage', '--allow-any-category'],
    { cwd: worktree, encoding: 'utf8', env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  const nwOut = `${nw.stdout || ''}${nw.stderr || ''}`;
  process.stdout.write(nwOut);

  // 5) 判斷是否真的產出並 commit（配圖 gate/連結 gate/驗證失敗 → 無 commit）
  const ahead = git(['rev-list', '--count', `origin/main..${branch}`], worktree, { allowFail: true }).out;
  if (nw.status !== 0 || ahead === '0' || ahead === '') {
    writeResult({ ok: false, issue, branch, title: job.title, error: '寫作未完成（配圖 gate／連結／驗證未過或起草中止，未產生 commit）', log: nwOut.slice(-1200), warnings });
    console.error('NO_COMMIT');
    process.exit(1);
  }

  // newsroom-write 寫的 result.json（摘要/重點/封面/待審狀態/slug）
  let nwResult = {};
  try { nwResult = JSON.parse(readFileSync(join(jobDir, 'result.json'), 'utf8')); } catch { /* 容缺 */ }

  // 6) push 分支 + 開 PR（已存在就沿用；同 issue 再觸發＝更新該 PR）
  git(['push', '-u', 'origin', branch], worktree, { allowFail: true });
  let prNum = gh(['pr', 'list', '--repo', REPO, '--head', branch, '--json', 'number', '--jq', '.[0].number'], { allowFail: true }).out;
  if (!prNum) {
    const highlights = Array.isArray(nwResult.highlights) && nwResult.highlights.length
      ? `\n\n重點：\n${nwResult.highlights.map((h) => `- ${h}`).join('\n')}` : '';
    const prBody = `Closes #${issue}\n\n**${nwResult.title || job.title}**（${job.category}／待審草稿）\n\n${(nwResult.excerpt || '').slice(0, 600)}${highlights}\n\n> 自動走 newsroom 正規產線產出（含配圖 gate、連結查證）。merge 後為 noindex 待審草稿，需以編輯器／Slack 發佈鈕轉正上線。`;
    const created = gh(['pr', 'create', '--repo', REPO, '--base', 'main', '--head', branch,
      '--title', `[文章] ${nwResult.title || job.title}`, '--body', prBody], { allowFail: true });
    prNum = (created.out.match(/\/pull\/(\d+)/) || [])[1] || '';
  }

  writeResult({
    ok: true, issue, branch, title: nwResult.title || job.title,
    pr: prNum ? Number(prNum) : null,
    category: job.category,
    slug: nwResult.slug || job.slug || null,
    url: nwResult.url || null,
    pendingApproval: nwResult.pendingApproval !== false, // factual 一律待審
    excerpt: nwResult.excerpt || '',
    highlights: Array.isArray(nwResult.highlights) ? nwResult.highlights.slice(0, 5) : [],
    coverImage: nwResult.coverImage || '',
    warnings,
  });
  console.log(`DONE pr=${prNum} branch=${branch}`);
}

try {
  main();
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
}
