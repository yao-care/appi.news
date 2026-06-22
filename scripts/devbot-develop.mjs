// 步驟二開發引擎：依 GitHub Issue 的需求確認書，在專屬 worktree 用 Agent SDK 開發，
// 開/更新 PR。被 slack-actions-server 的 devbot 車道 spawn；完成寫 result.json。
//
//   node scripts/devbot-develop.mjs <out-dir> --issue <N> [--iterate "<追加問題>"]
//
// 安全：canUseTool 接 lib/devbot.mjs 的 evaluateTool（只擋 sudo/rm 系統/毀滅性/機密/越界寫入）。
// 絕不 merge、不部署——這由發佈鈕（人工）與設計把關，不是引擎的事。
// 環境：在 /root/appi.news-devbridge 專屬 clone 開 worktree；claude CLI 已 authed（SDK 沿用）。

import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, symlinkSync } from 'node:fs';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { branchForIssue, evaluateTool } from './lib/devbot.mjs';

const BASE_CLONE = process.env.DEVBOT_BASE || '/root/appi.news-devbridge';
const WT_ROOT = process.env.DEVBOT_WT_ROOT || '/root/appi.news-devbridge-wt';
const MAX_TURNS = Number(process.env.DEVBOT_MAX_TURNS || 120);
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

// 開/沿用 issue 專屬 worktree（同 issue 多次開發=迭代，沿用同分支累積 commit）。
function ensureWorktree(issue) {
  const branch = branchForIssue(issue);
  const wt = `${WT_ROOT}/issue-${issue}`;
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

function buildPrompt({ spec, iterate }) {
  const base = `你是 APPI News 的自動開發引擎，正在一個專屬 git worktree 裡工作（分支已開好、base 是 origin/main 最新狀態）。請依下面這份「需求確認書」完成開發：

────────────── 需求確認書 ──────────────
${spec}
─────────────────────────────────────────

工作規則：
- 在目前這個 worktree／分支上完成程式修改。動到字型/CSS/首頁圖/build 流程前先讀 PERFORMANCE.md；遵守 CLAUDE.md（繁中台灣用語、一律 pnpm）。
- 完成後務必：\`git add\` 你改的檔 → \`git commit\`（訊息用繁中、說清楚改了什麼）→ \`git push -u origin <目前分支>\`。
- **不要自己開 PR、不要 merge、不要部署**（這些後續由系統與人工處理）。
- 自檢：能跑就跑 \`pnpm build\`（必要時 \`pnpm check:links\`）確認沒壞。
- 最後用 2-4 句繁中摘要「你改了什麼、怎麼驗收」，這段會貼到 Slack 給人看。`;
  if (iterate) {
    return `${base}\n\n──────── 這是接續既有開發的「追加修正」，請在現有分支上接著改：────────\n${iterate}`;
  }
  return base;
}

async function runClaude({ worktree, prompt }) {
  let sessionId = null;
  let finalText = '';
  let errSubtype = null;
  const q = query({
    prompt,
    options: {
      cwd: worktree,
      permissionMode: 'default',
      settingSources: ['project'],
      maxTurns: MAX_TURNS,
      systemPrompt: { type: 'preset', preset: 'claude_code' },
      canUseTool: async (toolName, input) => evaluateTool(toolName, input, { worktree }),
    },
  });
  for await (const msg of q) {
    if (msg.session_id) sessionId = msg.session_id;
    if (msg.type === 'result') {
      if (msg.subtype === 'success') finalText = msg.result || '';
      else errSubtype = msg.subtype;
    }
  }
  return { sessionId, finalText, errSubtype };
}

async function main() {
  const outDir = process.argv[2];
  const issue = Number(arg('--issue'));
  const iterate = arg('--iterate');
  if (!outDir || !Number.isInteger(issue)) {
    console.error('用法：node scripts/devbot-develop.mjs <out-dir> --issue <N> [--iterate "<追加>"]');
    process.exit(2);
  }
  if (!existsSync(BASE_CLONE)) throw new Error(`缺專屬 clone ${BASE_CLONE}`);
  mkdirSync(outDir, { recursive: true });
  const resultPath = `${outDir}/result.json`;
  const writeResult = (o) => writeFileSync(resultPath, JSON.stringify(o, null, 2));

  // 1) 取需求確認書（issue 內文）
  const view = gh(['issue', 'view', String(issue), '--repo', REPO, '--json', 'title,body']);
  const { title, body: spec } = JSON.parse(view.out);

  // 2) worktree + 開發
  const { branch, worktree } = ensureWorktree(issue);
  const { finalText, errSubtype } = await runClaude({ worktree, prompt: buildPrompt({ spec, iterate }) });
  if (errSubtype) {
    writeResult({ ok: false, issue, branch, title, error: errSubtype });
    console.error(`開發中斷：${errSubtype}`);
    process.exit(1);
  }

  // 3) 確認分支真的有 push 出去（Claude 該自己 push；保險起見補推）
  const ahead = git(['rev-list', '--count', `origin/main..${branch}`], worktree, { allowFail: true }).out;
  if (ahead === '0' || ahead === '') {
    writeResult({ ok: true, issue, branch, title, noChanges: true, summary: finalText.slice(0, 1500) });
    console.log('NO_CHANGES');
    return;
  }
  git(['push', '-u', 'origin', branch], worktree, { allowFail: true });

  // 4) 開 PR（已存在就沿用，迭代時 push 已自動更新該 PR）
  let prNum = gh(['pr', 'list', '--repo', REPO, '--head', branch, '--json', 'number', '--jq', '.[0].number'], { allowFail: true }).out;
  if (!prNum) {
    const created = gh(['pr', 'create', '--repo', REPO, '--base', 'main', '--head', branch,
      '--title', title, '--body', `Closes #${issue}\n\n${finalText.slice(0, 1500)}`], { allowFail: true });
    prNum = (created.out.match(/\/pull\/(\d+)/) || [])[1] || '';
  }

  writeResult({ ok: true, issue, branch, title, pr: prNum ? Number(prNum) : null, summary: finalText.slice(0, 1500) });
  console.log(`DONE pr=${prNum} branch=${branch}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
