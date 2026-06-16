// Slack 請求簽章驗證（子專案 2 / Phase 1 互動端點用）。
// 依 https://api.slack.com/authentication/verifying-requests-from-slack
//
//   basestring = `v0:${timestamp}:${rawBody}`
//   signature  = 'v0=' + HMAC_SHA256(signingSecret, basestring) 的 hex
//
// 安全要點：
//   - 用 raw body（未經 JSON.parse／重新序列化）計算，否則簽章對不上。
//   - timingSafeEqual 比對，避免時序側通道。
//   - 防重放：timestamp 與 now 相差超過 maxSkewSec（預設 300 秒）即拒。
//
// 純函式、無 I/O，方便單元測試。

import { createHmac, timingSafeEqual } from 'node:crypto';

export function computeSlackSignature(signingSecret, timestamp, rawBody) {
  const base = `v0:${timestamp}:${rawBody}`;
  return 'v0=' + createHmac('sha256', signingSecret).update(base, 'utf8').digest('hex');
}

/**
 * 驗證一個 Slack 請求。回 true/false（不丟例外，除非缺 signingSecret）。
 * @param {object} p
 * @param {string} p.signingSecret  Slack app 的 Signing Secret
 * @param {string} p.timestamp      X-Slack-Request-Timestamp 標頭
 * @param {string} p.signature      X-Slack-Signature 標頭（v0=...）
 * @param {string} p.rawBody        原始請求 body 字串
 * @param {number} [p.now]          現在的 unix 秒（測試可注入；預設系統時間）
 * @param {number} [p.maxSkewSec]   允許的時間偏移（預設 300）
 */
export function verifySlackSignature({ signingSecret, timestamp, signature, rawBody, now, maxSkewSec = 300 }) {
  if (!signingSecret) throw new Error('缺 signingSecret');
  if (!timestamp || !signature || rawBody == null) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;

  const nowSec = now != null ? Number(now) : Math.floor(Date.now() / 1000);
  if (!Number.isFinite(nowSec)) return false;
  if (Math.abs(nowSec - ts) > maxSkewSec) return false; // 防重放：太舊或時間異常

  const expected = computeSlackSignature(signingSecret, timestamp, rawBody);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  if (a.length !== b.length) return false; // timingSafeEqual 要求等長
  return timingSafeEqual(a, b);
}
