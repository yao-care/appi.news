// build + check:links 的並發自癒關卡（給自動發佈線共用）。
//
// 為什麼：各自動發佈線在各自 worktree 並行跑（多工，不序列化）。偶爾兩條線同時跑時，
// 某條的 build 可能撈到另一條剛推、但本 worktree 尚未同步完整的內容（例如有文章 .md
// 卻缺其圖），導致 check:links 假失敗、白白卡掉這次發佈。
//
// 解法（保持多工、不加鎖）：check:links 失敗時，先把本 worktree 同步到最新 origin/main
// （把另一條線已完成的內容補齊），再 build + check 一次。真正壞才放棄。

import { spawnSync } from 'node:child_process';

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exit ${r.status}`);
}

/**
 * build → check:links；失敗就同步最新 origin/main 後重試一次（並發自癒）。
 * 成功回 true；最終仍失敗則拋出（由呼叫端 die，改動留工作區）。
 */
export function buildCheckWithResync(cwd = process.cwd()) {
  const buildCheck = () => {
    console.log('→ pnpm build（產 dist 供 check:links）');
    run('pnpm', ['build'], cwd);
    console.log('→ pnpm check:links');
    run('pnpm', ['check:links'], cwd);
  };
  try {
    buildCheck();
  } catch (e) {
    console.log(`⚠️ build/check:links 失敗（${e.message}）；同步最新 origin/main 後自癒重試一次（並發競態防護，不序列化）…`);
    spawnSync('git', ['fetch', 'origin'], { cwd, stdio: 'inherit' });
    // 本 worktree 是 detached HEAD（origin/main 的祖先）；merge 會快進補齊其他線已完成的內容，
    // 本次未提交的新文章/圖（untracked）路徑不同、不衝突，會保留。
    spawnSync('git', ['merge', '--no-edit', 'origin/main'], { cwd, stdio: 'inherit' });
    buildCheck(); // 再失敗就拋出（真壞）
  }
  return true;
}
