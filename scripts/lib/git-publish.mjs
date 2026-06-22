// 並發安全地把目前 HEAD 推到 origin/main。
// 多工後各 cron 在自己的 detached worktree 提交，最後都推 main；若別人先推了（non-fast-forward）
// 就 fetch + rebase 後重試，讓同時上線的多支 cron 不互相把對方擠掉。
//
// 在 main checkout（按鈕發佈路徑）也成立：HEAD 即 main，push origin HEAD:main 等同推 main。
// 純邏輯靠注入 run 單元測試；預設用 spawnSync 實跑。

import { spawnSync } from 'node:child_process';

/**
 * @param {{cwd?:string, tries?:number, run?:(args:string[])=>{status:number,stdout?:string,stderr?:string}}} opts
 * @returns {{ok:true, attempts:number} | {ok:false, attempts?:number, err:string}}
 */
export function pushToMain({ cwd, tries = 6, run } = {}) {
  const exec = run || ((args) => spawnSync('git', args, { cwd, encoding: 'utf8' }));
  for (let attempt = 1; attempt <= tries; attempt++) {
    const r = exec(['push', 'origin', 'HEAD:main']);
    if (r.status === 0) return { ok: true, attempts: attempt };
    const msg = `${r.stderr || ''}${r.stdout || ''}`;
    const racey = /(non-fast-forward|fetch first|\[rejected\]|tip of your current branch is behind|stale info|cannot lock ref)/i.test(msg);
    if (!racey) return { ok: false, attempts: attempt, err: msg.trim().slice(-300) || 'push 失敗' };
    // 別人先推了：拉最新 main、把本地 commit 疊上去，再推。
    const f = exec(['fetch', 'origin', 'main', '-q']);
    if (f.status !== 0) return { ok: false, attempts: attempt, err: 'fetch 失敗：' + `${f.stderr || f.stdout || ''}`.trim().slice(-200) };
    const rb = exec(['rebase', 'FETCH_HEAD']);
    if (rb.status !== 0) {
      exec(['rebase', '--abort']);
      return { ok: false, attempts: attempt, err: 'rebase 衝突，需人工處理：' + `${rb.stderr || rb.stdout || ''}`.trim().slice(-200) };
    }
  }
  return { ok: false, attempts: tries, err: `推送重試 ${tries} 次仍失敗（main 變動太頻繁）` };
}
