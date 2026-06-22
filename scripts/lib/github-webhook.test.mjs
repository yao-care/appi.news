import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyGithubSignature, parseGithubEvent, SPEC_LABEL } from './github-webhook.mjs';

describe('verifyGithubSignature', () => {
  const secret = 's3cret';
  const body = '{"hello":"world"}';
  const good = 'sha256=' + createHmac('sha256', secret).update(body, 'utf8').digest('hex');

  it('正確簽章過、錯的擋', () => {
    expect(verifyGithubSignature({ secret, signature: good, rawBody: body })).toBe(true);
    expect(verifyGithubSignature({ secret, signature: 'sha256=deadbeef', rawBody: body })).toBe(false);
    expect(verifyGithubSignature({ secret, signature: good, rawBody: body + 'x' })).toBe(false);
    expect(verifyGithubSignature({ secret: 'wrong', signature: good, rawBody: body })).toBe(false);
  });
  it('缺參數安全回 false', () => {
    expect(verifyGithubSignature({ secret, signature: '', rawBody: body })).toBe(false);
    expect(verifyGithubSignature({ secret: '', signature: good, rawBody: body })).toBe(false);
  });
});

describe('parseGithubEvent', () => {
  const labeled = { number: 12, title: '加深色模式', labels: [{ name: SPEC_LABEL }] };

  it('ping', () => {
    expect(parseGithubEvent({ eventType: 'ping', payload: {} })).toEqual({ kind: 'ping' });
  });

  it('dev-bot issue 開 → develop', () => {
    const out = parseGithubEvent({ eventType: 'issues', payload: { action: 'opened', issue: labeled } });
    expect(out).toEqual({ kind: 'develop', issue: 12, branch: 'dev/issue-12', title: '加深色模式' });
  });

  it('沒掛 label 的 issue → ignore', () => {
    expect(parseGithubEvent({ eventType: 'issues', payload: { action: 'opened', issue: { number: 1, labels: [] } } }).kind).toBe('ignore');
  });

  it('非 opened（如 edited）→ ignore', () => {
    expect(parseGithubEvent({ eventType: 'issues', payload: { action: 'edited', issue: labeled } }).kind).toBe('ignore');
  });

  it('dev-bot issue 留言 → iterate', () => {
    const out = parseGithubEvent({
      eventType: 'issue_comment',
      payload: { action: 'created', issue: labeled, comment: { body: '按鈕沒反應', user: { login: 'human' } } },
      botLogin: 'appi-bot',
    });
    expect(out).toEqual({ kind: 'iterate', issue: 12, branch: 'dev/issue-12', comment: '按鈕沒反應', commenter: 'human' });
  });

  it('機器人自己的留言 → ignore（避免 PR 連結回觸發）', () => {
    const out = parseGithubEvent({
      eventType: 'issue_comment',
      payload: { action: 'created', issue: labeled, comment: { body: 'PR #5', user: { login: 'appi-bot' } } },
      botLogin: 'appi-bot',
    });
    expect(out.kind).toBe('ignore');
  });

  it('字串型 label 也認得', () => {
    const out = parseGithubEvent({ eventType: 'issues', payload: { action: 'opened', issue: { number: 9, title: 't', labels: [SPEC_LABEL] } } });
    expect(out.kind).toBe('develop');
  });
});
