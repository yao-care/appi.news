import { describe, it, expect } from 'vitest';
import { computeSlackSignature, verifySlackSignature } from './slack-verify.mjs';

const SECRET = 'test_signing_secret_abc';
const BODY = 'payload=%7B%22type%22%3A%22view_submission%22%7D';
const TS = 1718000000; // 固定 unix 秒
const NOW = TS + 5; // 收到請求時，比 timestamp 晚 5 秒

const goodSig = () => computeSlackSignature(SECRET, String(TS), BODY);

describe('verifySlackSignature', () => {
  it('正確簽章 + 時間相近 → 通過', () => {
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: goodSig(), rawBody: BODY, now: NOW }),
    ).toBe(true);
  });

  it('body 被竄改 → 失敗', () => {
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: goodSig(), rawBody: BODY + 'x', now: NOW }),
    ).toBe(false);
  });

  it('簽章用錯誤 secret → 失敗', () => {
    const wrong = computeSlackSignature('wrong_secret', String(TS), BODY);
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: wrong, rawBody: BODY, now: NOW }),
    ).toBe(false);
  });

  it('timestamp 太舊（超過 maxSkew）→ 失敗（防重放）', () => {
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: goodSig(), rawBody: BODY, now: TS + 301 }),
    ).toBe(false);
  });

  it('未來時間偏移過大 → 失敗', () => {
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: goodSig(), rawBody: BODY, now: TS - 301 }),
    ).toBe(false);
  });

  it('缺 signature 或 timestamp → 失敗（不丟例外）', () => {
    expect(verifySlackSignature({ signingSecret: SECRET, timestamp: '', signature: goodSig(), rawBody: BODY, now: NOW })).toBe(false);
    expect(verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: '', rawBody: BODY, now: NOW })).toBe(false);
  });

  it('非數字 timestamp → 失敗', () => {
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: 'abc', signature: goodSig(), rawBody: BODY, now: NOW }),
    ).toBe(false);
  });

  it('缺 signingSecret → 丟例外（設定錯誤要早爆）', () => {
    expect(() => verifySlackSignature({ timestamp: String(TS), signature: goodSig(), rawBody: BODY, now: NOW })).toThrow();
  });

  it('長度不同的簽章 → 失敗（不讓 timingSafeEqual 丟錯）', () => {
    expect(
      verifySlackSignature({ signingSecret: SECRET, timestamp: String(TS), signature: 'v0=short', rawBody: BODY, now: NOW }),
    ).toBe(false);
  });
});
