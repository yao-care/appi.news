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

  it('rebase 衝突 → abort 並回失敗', () => {
    const conflict = { status: 1, stderr: 'CONFLICT 衝突' };
    const { run, calls } = scripted([REJECT, OK, conflict, OK]); // push(拒) fetch rebase(衝突) abort
    const r = pushToMain({ run });
    expect(r.ok).toBe(false);
    expect(r.err).toContain('rebase 衝突');
    expect(calls).toContain('rebase --abort');
  });

  it('非並發類錯誤 → 立刻回失敗、不重試', () => {
    const { run, calls } = scripted([OTHER]);
    const r = pushToMain({ run });
    expect(r.ok).toBe(false);
    expect(r.err).toContain('沒網路');
    expect(calls).toEqual(['push origin HEAD:main']);
  });

  it('一直被拒 → 用完次數回失敗', () => {
    const seq = [];
    for (let i = 0; i < 6; i++) seq.push(REJECT, OK, OK); // 每輪 push(拒) fetch rebase
    const { run } = scripted(seq);
    const r = pushToMain({ run, tries: 6 });
    expect(r.ok).toBe(false);
    expect(r.err).toContain('重試');
  });
});
