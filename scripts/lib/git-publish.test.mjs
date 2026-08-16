import { describe, it, expect } from 'vitest';
import { pushToMain } from './git-publish.mjs';

// 注入式 run：依序列回傳結果，並記錄收到的 git 子指令。
function scripted(seq) {
  const calls = [];
  const run = (args) => {
    calls.push(args.join(' '));
    const next = seq.shift();
    if (!next) throw new Error('腳本用完了，未預期的呼叫: ' + args.join(' '));
    return next;
  };
  return { run, calls };
}
const OK = { status: 0, stdout: '', stderr: '' };
const REJECT = { status: 1, stderr: '! [rejected] HEAD -> main (non-fast-forward)\nfetch first' };
const OTHER = { status: 1, stderr: 'fatal: 沒網路' };

// 失敗路徑一律接救援：帶 label 時只多一次 push rescue；不帶 label 再多一次 log 取線名。
const NOW = new Date('2026-08-14T12:07:19Z');
const RESCUE_BRANCH = (name) => `rescue/${name}-20260814-120719`;
const HEAD_SUBJECT = { status: 0, stdout: 'feat(international): 三篇編譯\n' };

describe('pushToMain', () => {
  it('一次就推成功', () => {
    const { run, calls } = scripted([OK]);
    expect(pushToMain({ run })).toEqual({ ok: true, attempts: 1 });
    expect(calls).toEqual(['push origin HEAD:main']);
  });

  it('被拒 → fetch+rebase → 第二次成功', () => {
    const { run, calls } = scripted([REJECT, OK, OK, OK]); // push(拒) fetch rebase push(成)
    expect(pushToMain({ run })).toEqual({ ok: true, attempts: 2 });
    expect(calls).toEqual(['push origin HEAD:main', 'fetch origin main -q', 'rebase FETCH_HEAD', 'push origin HEAD:main']);
  });

  it('rebase 衝突 → abort、推救援分支（線名取自 HEAD 標題）、回失敗', () => {
    const conflict = { status: 1, stderr: 'CONFLICT 衝突' };
    // push(拒) fetch rebase(衝突) abort → 救援：log 取線名、push rescue
    const { run, calls } = scripted([REJECT, OK, conflict, OK, HEAD_SUBJECT, OK]);
    const r = pushToMain({ run, now: NOW });
    expect(r.ok).toBe(false);
    expect(r.err).toContain('rebase 衝突');
    expect(r.err).toContain(RESCUE_BRANCH('international'));
    expect(r.rescue).toEqual({ ok: true, branch: RESCUE_BRANCH('international') });
    expect(calls).toContain('rebase --abort');
    expect(calls).toContain(`push origin HEAD:refs/heads/${RESCUE_BRANCH('international')}`);
  });

  it('非並發類錯誤 → 不重試、帶 label 直接推救援分支', () => {
    const { run, calls } = scripted([OTHER, OK]); // push(炸) → push rescue（有 label 不必 log）
    const r = pushToMain({ run, label: 'forum', now: NOW });
    expect(r.ok).toBe(false);
    expect(r.err).toContain('沒網路');
    expect(r.rescue).toEqual({ ok: true, branch: RESCUE_BRANCH('forum') });
    expect(calls).toEqual(['push origin HEAD:main', `push origin HEAD:refs/heads/${RESCUE_BRANCH('forum')}`]);
  });

  it('HEAD 標題不是 conventional commit → 線名退回 publish', () => {
    const oddSubject = { status: 0, stdout: '隨手改個字\n' };
    const { run } = scripted([OTHER, oddSubject, OK]);
    const r = pushToMain({ run, now: NOW });
    expect(r.rescue).toEqual({ ok: true, branch: RESCUE_BRANCH('publish') });
  });

  it('一直被拒 → 用完次數、推救援分支、回失敗', () => {
    const seq = [];
    for (let i = 0; i < 6; i++) seq.push(REJECT, OK, OK); // 每輪 push(拒) fetch rebase
    seq.push(HEAD_SUBJECT, OK); // 救援
    const { run } = scripted(seq);
    const r = pushToMain({ run, tries: 6, now: NOW });
    expect(r.ok).toBe(false);
    expect(r.err).toContain('重試');
    expect(r.rescue.ok).toBe(true);
  });

  it('連救援分支都推不上去 → err 明確標注成果會消失', () => {
    const rescueFail = { status: 1, stderr: 'remote: 掛了' };
    const { run } = scripted([OTHER, rescueFail]);
    const r = pushToMain({ run, label: 'forum', now: NOW });
    expect(r.ok).toBe(false);
    expect(r.rescue.ok).toBe(false);
    expect(r.err).toContain('連救援分支都推不上去');
  });
});
