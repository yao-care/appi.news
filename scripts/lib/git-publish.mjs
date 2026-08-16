// 並發安全地把目前 HEAD 推到 origin/main。
// 多工後各 cron 在自己的 detached worktree 提交，最後都推 main；若別人先推了（non-fast-forward）
// 就 fetch + rebase 後重試，讓同時上線的多支 cron 不互相把對方擠掉。
//
// 在 main checkout（按鈕發佈路徑）也成立：HEAD 即 main，push origin HEAD:main 等同推 main。
// 純邏輯靠注入 run 單元測試；預設用 spawnSync 實跑。
//
// ── 🔴 推不上去時，成果必須留在遠端 ────────────────────────────────────────
// 這支的每一條失敗路徑，呼叫端都跑在 `scripts/cron/_worktree.sh` 開的**臨時 worktree** 裡，
// 而那支的 EXIT trap 會 `worktree remove --force`。所以「回傳 ok:false」＝那個 commit
// 從此沒有任何 ref 指著它，等著被 gc 收走——跑了幾十分鐘、燒了額度的稿子就這樣消失。
//
// 2026-08-01 國際編譯的 8 篇新稿就是這樣沒的（rebase 撞衝突 → 放棄 → worktree 移除），
// 到 2026-08-14 才被發現，那時已經 404 了兩週。同型的問題在 appi.news-mirror 更嚴重
// （13 批、約 230 篇），因為那邊的回報還會謊稱「上架」。
//
// 所以失敗時**先把 HEAD 推到 rescue/* 分支再回報**。推救援分支不會動到 main，
// 所以它永遠是安全的；有了遠端 ref，成果就不可能被 gc 收走，在 GitHub 上也看得見。
// 要不要併回 main 仍然是人的決定——衝突本來就該人看，這一層不做自動解衝突。

import { spawnSync } from 'node:child_process';

/** UTC 時間戳，形狀 20260814-120719。分支名要能排序、且不含冒號。 */
function stamp(now) {
  return now.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}

/**
 * 從 HEAD 的 commit 標題推出這條產線的名字，讓救援分支看得出是誰留下的。
 * 慣例是 conventional commit：`feat(international): …` → `international`。
 * 推不出來就用 `publish`——名字只是給人看的，取不到不該讓救援本身失敗。
 */
function lineName(exec) {
  const r = exec(['log', '-1', '--format=%s']);
  const scope = /^[a-z]+\(([a-z0-9._-]+)\)/i.exec(`${r?.stdout || ''}`.trim());
  return scope ? scope[1] : 'publish';
}

/**
 * 把目前 HEAD 推到一條救援分支。
 * @returns {{ok:true, branch:string} | {ok:false, err:string}}
 */
function pushRescue(exec, { label, now }) {
  const branch = `rescue/${label || lineName(exec)}-${stamp(now)}`;
  const r = exec(['push', 'origin', `HEAD:refs/heads/${branch}`]);
  if (r.status === 0) return { ok: true, branch };
  return { ok: false, err: `${r.stderr || r.stdout || ''}`.trim().slice(-200) || '救援分支推送失敗' };
}

/**
 * @param {{cwd?:string, tries?:number, label?:string, now?:Date,
 *          run?:(args:string[])=>{status:number,stdout?:string,stderr?:string}}} opts
 * @returns {{ok:true, attempts:number} |
 *           {ok:false, attempts?:number, err:string, rescue:{ok:true,branch:string}|{ok:false,err:string}}}
 */
export function pushToMain({ cwd, tries = 6, label, now = new Date(), run } = {}) {
  const exec = run || ((args) => spawnSync('git', args, { cwd, encoding: 'utf8' }));

  /** 每一條失敗路徑都走這裡——沒有例外，因為每一條的後果都是「commit 變孤兒」。 */
  const fail = (attempts, err) => {
    const rescue = pushRescue(exec, { label, now });
    const suffix = rescue.ok
      ? `｜成果已保在遠端分支 ${rescue.branch}，等人決定怎麼併回`
      : `｜⚠️ 連救援分支都推不上去（${rescue.err}），commit 只在臨時 worktree 裡，移除後就找不回來`;
    return { ok: false, attempts, err: err + suffix, rescue };
  };

  for (let attempt = 1; attempt <= tries; attempt++) {
    const r = exec(['push', 'origin', 'HEAD:main']);
    if (r.status === 0) return { ok: true, attempts: attempt };
    const msg = `${r.stderr || ''}${r.stdout || ''}`;
    const racey = /(non-fast-forward|fetch first|\[rejected\]|tip of your current branch is behind|stale info|cannot lock ref)/i.test(msg);
    if (!racey) return fail(attempt, msg.trim().slice(-300) || 'push 失敗');
    // 別人先推了：拉最新 main、把本地 commit 疊上去，再推。
    const f = exec(['fetch', 'origin', 'main', '-q']);
    if (f.status !== 0) return fail(attempt, 'fetch 失敗：' + `${f.stderr || f.stdout || ''}`.trim().slice(-200));
    const rb = exec(['rebase', 'FETCH_HEAD']);
    if (rb.status !== 0) {
      exec(['rebase', '--abort']);
      return fail(attempt, 'rebase 衝突，需人工處理：' + `${rb.stderr || rb.stdout || ''}`.trim().slice(-200));
    }
  }
  return fail(tries, `推送重試 ${tries} 次仍失敗（main 變動太頻繁）`);
}
