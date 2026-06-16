// 服務帳號 JWT 自簽換 OAuth token，封裝 GA4 Data API 與 Search Console API（皆唯讀）。
// 設計為子專案 2 共用。無外部相依，只用 node:crypto / node:fs。
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import { GA4_PROPERTY_ID, GSC_SITE, SA_KEY_PATH } from './report-config.mjs';

export const base64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const signingInput = (header, claims) =>
  `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

export function loadServiceAccount(path = SA_KEY_PATH) {
  const j = JSON.parse(readFileSync(path, 'utf8'));
  return { clientEmail: j.client_email, privateKey: j.private_key };
}

/** 自簽 JWT 換 OAuth access token。now 為 epoch 秒（測試可注入）。 */
export async function getAccessToken({ clientEmail, privateKey, scopes, now = Math.floor(Date.now() / 1000) }) {
  const input = signingInput(
    { alg: 'RS256', typ: 'JWT' },
    { iss: clientEmail, scope: scopes.join(' '), aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 },
  );
  const sig = base64url(crypto.createSign('RSA-SHA256').update(input).sign(privateKey));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${input}.${sig}` }),
  });
  if (!res.ok) throw new Error(`token 取得失敗 ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

/** GA4 runReport。body 見 https://developers.google.com/analytics/devguides/reporting/data/v1 */
export async function ga4RunReport({ token, body, propertyId = GA4_PROPERTY_ID }) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GA4 runReport 失敗 ${res.status}: ${await res.text()}`);
  return res.json();
}

/** GSC Search Analytics query。siteUrl 須 URL-encode（sc-domain:appi.news → sc-domain%3Aappi.news）。 */
export async function gscQuery({ token, body, siteUrl = GSC_SITE }) {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`GSC query 失敗 ${res.status}: ${await res.text()}`);
  return res.json();
}
