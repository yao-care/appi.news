import { describe, it, expect } from 'vitest';
import { classifyWriterRun, writerExecArgs, CODEX_QUOTA_RE, CODEX_FAIL_RE, WRITER_MODEL } from './writer-cli.mjs';

describe('classifyWriterRun — codex 三態分類（語意對齊 classifyClaudeRun）', () => {
  it('撞額度/速率：exit 0 也要抓到，且 stderr 也要掃', () => {
    expect(classifyWriterRun({ status: 0, stdout: "You've reached your usage limit." }).kind).toBe('quota');
    expect(classifyWriterRun({ status: 1, stdout: '', stderr: 'Rate limit exceeded, retry later' }).kind).toBe('quota');
    expect(classifyWriterRun({ status: 0, stdout: 'HTTP 429 Too Many Requests' }).kind).toBe('quota');
  });
  it('限額優先於一般失敗（同時命中必須回 quota，整批停）', () => {
    expect(classifyWriterRun({ status: 1, stdout: 'stream error after usage limit hit' }).kind).toBe('quota');
  });
  it('單則失敗：非 0 退出、spawn error、連線層錯誤', () => {
    expect(classifyWriterRun({ status: 1, stdout: '', stderr: 'boom' })).toMatchObject({ kind: 'fail', detail: 'boom' });
    expect(classifyWriterRun({ error: new Error('spawn ENOENT'), status: null, stdout: '' }).kind).toBe('fail');
    expect(classifyWriterRun({ status: 0, stdout: 'stream disconnected before completion' }).kind).toBe('fail');
  });
  it('正常輸出回 ok 並帶 stdout（哨兵行掃全文）', () => {
    expect(classifyWriterRun({ status: 0, stdout: 'INTL_RESULT=NEW｜x' })).toEqual({ kind: 'ok', stdout: 'INTL_RESULT=NEW｜x' });
  });
  it('QUOTA 與 FAIL regex 不重疊', () => {
    expect(CODEX_FAIL_RE.test('usage limit')).toBe(false);
    expect(CODEX_QUOTA_RE.test('stream error')).toBe(false);
  });
  it('429 只抓獨立 token，不誤傷一般數字', () => {
    expect(CODEX_QUOTA_RE.test('得票 14290 張')).toBe(false);
  });
});

describe('writerExecArgs — codex exec 參數正本', () => {
  it('必帶 bypass 沙箱、skip git check、明確 -m 模型與 effort', () => {
    const args = writerExecArgs('PROMPT');
    expect(args[0]).toBe('exec');
    expect(args).toContain('--dangerously-bypass-approvals-and-sandbox');
    expect(args).toContain('--skip-git-repo-check');
    expect(args[args.indexOf('-m') + 1]).toBe(WRITER_MODEL);
    expect(args[args.length - 1]).toBe('PROMPT');
  });
  it('model 可覆寫', () => {
    const args = writerExecArgs('P', { model: 'gpt-x' });
    expect(args[args.indexOf('-m') + 1]).toBe('gpt-x');
  });
});
