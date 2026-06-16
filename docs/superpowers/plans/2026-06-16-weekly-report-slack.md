# 每週數據週報 → Slack 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 每週把 GA4 + GSC 數據彙整成一份 Slack 週報（四區塊數據 + 動態 2–6 個建議寫作方向），由伺服器 cron 跑 headless claude 自動發送。

**Architecture:** 方案 A — 純資料與投遞用可測 `.mjs` 腳本（`scripts/lib/*`），唯一需要 Claude 推理（雷達掃描 + 合成建議 + 套文風守則）的部分放在 `/weekly-report` 技能；cron shell 載入金鑰後叫 `claude -p "/weekly-report"`。資料讀取層 `google-data.mjs` 設計為子專案 2 共用。

**Tech Stack:** Node ESM（`.mjs`）、`node:crypto`（服務帳號 JWT 自簽）、vitest（`scripts/**/*.test.mjs`，mock fetch 用 `vi.stubGlobal`）、GA4 Data API、Search Console API、Slack `chat.postMessage`、Claude Code 技能。

**Spec:** `docs/superpowers/specs/2026-06-16-weekly-report-slack-design.md`

---

## 檔案結構

| 檔案 | 職責 |
|---|---|
| `scripts/lib/report-config.mjs` | 非機密常數（GA4 property、GSC site、Slack 頻道、scopes、金鑰路徑）+ `weekRanges()` 日期區間 |
| `scripts/lib/google-data.mjs` | 服務帳號 JWT → token；`ga4RunReport` / `gscQuery` |
| `scripts/lib/weekly-metrics.mjs` | 純轉換：GA4/GSC 原始回應 → 週報四區塊 JSON |
| `scripts/weekly-data.mjs` | 薄編排：呼叫 google-data 抓資料 → weekly-metrics 轉換 → 印 JSON |
| `scripts/lib/slack.mjs` | `postMessage` 打 `chat.postMessage` |
| `scripts/slack-post.mjs` | 薄 CLI：讀 payload 檔 + env token + config 頻道 → slack.postMessage |
| `.claude/skills/weekly-report/SKILL.md` | 技能：讀 JSON → 雷達 → 合成建議 → 組訊息 → 發 Slack |
| `scripts/cron/weekly-report.sh` | cron 進入點：載入金鑰 → `claude -p "/weekly-report"` |

測試檔與來源同目錄（`scripts/lib/<name>.test.mjs`）。

---

## Task 1: report-config.mjs（設定 + 日期區間）

**Files:**
- Create: `scripts/lib/report-config.mjs`
- Test: `scripts/lib/report-config.test.mjs`

- [ ] **Step 1: 寫失敗測試**

```js
// scripts/lib/report-config.test.mjs
import { describe, it, expect } from 'vitest';
import { weekRanges, GA4_PROPERTY_ID, GSC_SITE, SLACK_CHANNEL } from './report-config.mjs';

describe('report-config 常數', () => {
  it('帶正式 ID', () => {
    expect(GA4_PROPERTY_ID).toBe('541946427');
    expect(GSC_SITE).toBe('sc-domain:appi.news');
    expect(SLACK_CHANNEL).toBe('C0AFYV3TAMV');
  });
});

describe('weekRanges', () => {
  it('回本週與上週各 7 天、不重疊、格式 YYYY-MM-DD', () => {
    const r = weekRanges(new Date('2026-06-16T00:00:00Z'));
    expect(r.cur).toEqual({ start: '2026-06-09', end: '2026-06-15' });
    expect(r.prev).toEqual({ start: '2026-06-02', end: '2026-06-08' });
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm vitest run scripts/lib/report-config.test.mjs`
Expected: FAIL（找不到模組 `./report-config.mjs`）

- [ ] **Step 3: 寫實作**

```js
// scripts/lib/report-config.mjs
// 非機密設定（可進 repo）。機密走 env：GOOGLE_APPLICATION_CREDENTIALS、SLACK_BOT_TOKEN。
export const GA4_PROPERTY_ID = '541946427';
export const GSC_SITE = 'sc-domain:appi.news';
export const SLACK_CHANNEL = 'C0AFYV3TAMV'; // Weiqi.Kids workspace「agent回報」

export const GA_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export const SA_KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || `${process.env.HOME}/.config/appi-news/ga4-sa.json`;

const iso = (d) => d.toISOString().slice(0, 10);

/** 回「截至 today 前一天」的本週 7 天與上週 7 天（不重疊）。today 為 Date。 */
export function weekRanges(today) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - 1); // 不含今天（資料未滿日）
  const curStart = new Date(end);
  curStart.setUTCDate(curStart.getUTCDate() - 6);
  const prevEnd = new Date(curStart);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - 6);
  return {
    cur: { start: iso(curStart), end: iso(end) },
    prev: { start: iso(prevStart), end: iso(prevEnd) },
  };
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm vitest run scripts/lib/report-config.test.mjs`
Expected: PASS（4 個 assert 綠）

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/report-config.mjs scripts/lib/report-config.test.mjs
git commit -m "feat(report): report-config 常數與 weekRanges 日期區間"
```

---

## Task 2: google-data.mjs（JWT 簽署 + 取 token）

**Files:**
- Create: `scripts/lib/google-data.mjs`
- Test: `scripts/lib/google-data.test.mjs`

- [ ] **Step 1: 寫失敗測試（signingInput 純函式 + getAccessToken mock fetch）**

```js
// scripts/lib/google-data.test.mjs
import { describe, it, expect, vi, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { base64url, signingInput, getAccessToken } from './google-data.mjs';

afterEach(() => vi.restoreAllMocks());

describe('base64url / signingInput', () => {
  it('base64url 去掉 +/= 換成 -_', () => {
    expect(base64url(Buffer.from([251, 255, 191]))).toBe('-_-_'); // fb ff bf
  });
  it('signingInput 串 header.claims（皆 base64url JSON）', () => {
    const s = signingInput({ alg: 'RS256' }, { iss: 'x' });
    const [h, c] = s.split('.');
    expect(JSON.parse(Buffer.from(h, 'base64url').toString())).toEqual({ alg: 'RS256' });
    expect(JSON.parse(Buffer.from(c, 'base64url').toString())).toEqual({ iss: 'x' });
  });
});

describe('getAccessToken', () => {
  it('用私鑰簽 JWT、POST token 端點、回 access_token', async () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const spy = vi.fn(async () => new Response(JSON.stringify({ access_token: 'tok-123' }), { status: 200 }));
    vi.stubGlobal('fetch', spy);
    const tok = await getAccessToken({
      clientEmail: 'sa@x.iam.gserviceaccount.com',
      privateKey: pem,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      now: 1_700_000_000,
    });
    expect(tok).toBe('tok-123');
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('https://oauth2.googleapis.com/token');
    const body = new URLSearchParams(init.body);
    expect(body.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    expect(body.get('assertion').split('.')).toHaveLength(3); // header.claims.sig
  });

  it('token 端點非 2xx → 丟錯', async () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('bad', { status: 400 })));
    await expect(
      getAccessToken({ clientEmail: 'a', privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }), scopes: ['s'], now: 1 }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm vitest run scripts/lib/google-data.test.mjs`
Expected: FAIL（找不到 `./google-data.mjs` 匯出）

- [ ] **Step 3: 寫實作（含 ga4RunReport / gscQuery / loadServiceAccount）**

```js
// scripts/lib/google-data.mjs
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm vitest run scripts/lib/google-data.test.mjs`
Expected: PASS（base64url、signingInput、getAccessToken 成功與失敗共 4 個 it 綠）

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/google-data.mjs scripts/lib/google-data.test.mjs
git commit -m "feat(report): google-data 服務帳號 JWT + GA4/GSC 唯讀封裝"
```

---

## Task 3: weekly-metrics.mjs（純轉換 → 四區塊 JSON）

**Files:**
- Create: `scripts/lib/weekly-metrics.mjs`
- Test: `scripts/lib/weekly-metrics.test.mjs`

- [ ] **Step 1: 寫失敗測試**

```js
// scripts/lib/weekly-metrics.test.mjs
import { describe, it, expect } from 'vitest';
import { pctChange, categoryOf, isAiReferral, topArticles, searchOpportunities } from './weekly-metrics.mjs';

describe('小工具', () => {
  it('pctChange 四捨五入到整數百分比，前值 0 回 null', () => {
    expect(pctChange(110, 100)).toBe(10);
    expect(pctChange(90, 100)).toBe(-10);
    expect(pctChange(5, 0)).toBeNull();
  });
  it('categoryOf 取路徑第一段，文章/未知歸 other', () => {
    expect(categoryOf('/tech/abc/')).toBe('tech');
    expect(categoryOf('/health/x/')).toBe('health');
    expect(categoryOf('/articles/post-1/')).toBe('other');
    expect(categoryOf('/')).toBe('other');
  });
  it('isAiReferral 認得 AI 來源網域', () => {
    expect(isAiReferral('chatgpt.com')).toBe(true);
    expect(isAiReferral('www.perplexity.ai')).toBe(true);
    expect(isAiReferral('google')).toBe(false);
  });
});

describe('topArticles', () => {
  it('取前 N、算 avgEngagementSec = userEngagementDuration / views', () => {
    const report = {
      rows: [
        { dimensionValues: [{ value: '/tech/a/' }, { value: 'A' }], metricValues: [{ value: '100' }, { value: '500' }] },
        { dimensionValues: [{ value: '/health/b/' }, { value: 'B' }], metricValues: [{ value: '40' }, { value: '80' }] },
      ],
    };
    expect(topArticles(report, 5)).toEqual([
      { path: '/tech/a/', title: 'A', views: 100, avgEngagementSec: 5 },
      { path: '/health/b/', title: 'B', views: 40, avgEngagementSec: 2 },
    ]);
  });
});

describe('searchOpportunities', () => {
  it('只留排名 11-20、依曝光排序、附 ctr/position', () => {
    const resp = {
      rows: [
        { keys: ['ai 對齊'], impressions: 500, clicks: 3, ctr: 0.006, position: 14.2 },
        { keys: ['已經第一名'], impressions: 900, clicks: 200, ctr: 0.22, position: 1.3 },
        { keys: ['機會二'], impressions: 800, clicks: 5, ctr: 0.006, position: 18.0 },
      ],
    };
    expect(searchOpportunities(resp)).toEqual([
      { query: '機會二', impressions: 800, clicks: 5, ctr: 0.006, position: 18.0 },
      { query: 'ai 對齊', impressions: 500, clicks: 3, ctr: 0.006, position: 14.2 },
    ]);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm vitest run scripts/lib/weekly-metrics.test.mjs`
Expected: FAIL（找不到 `./weekly-metrics.mjs`）

- [ ] **Step 3: 寫實作**

```js
// scripts/lib/weekly-metrics.mjs
// 純轉換：吃 GA4 runReport / GSC query 的原始回應，吐週報四區塊資料。無 I/O、好測。

const AI_HOSTS = ['chatgpt.com', 'openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];

export function pctChange(cur, prev) {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

export function categoryOf(path) {
  const KNOWN = ['focus', 'international', 'health', 'tech', 'finance', 'sports', 'lifestyle', 'columns'];
  const seg = (path || '').split('/').filter(Boolean)[0];
  return KNOWN.includes(seg) ? seg : 'other';
}

export function isAiReferral(source) {
  const s = (source || '').toLowerCase();
  return AI_HOSTS.some((h) => s === h || s.endsWith(`.${h}`) || s.includes(h));
}

const rows = (report) => report?.rows ?? [];
const dim = (r, i) => r.dimensionValues[i].value;
const met = (r, i) => Number(r.metricValues[i].value);

/** GA4 dimensions=[pagePath,pageTitle] metrics=[screenPageViews,userEngagementDuration] */
export function topArticles(report, n = 5) {
  return rows(report)
    .slice(0, n)
    .map((r) => {
      const views = met(r, 0);
      const eng = met(r, 1);
      return { path: dim(r, 0), title: dim(r, 1), views, avgEngagementSec: views ? Math.round(eng / views) : 0 };
    });
}

/** GA4 dimensions=[pagePath] metrics=[screenPageViews]，cur/prev 兩份報告 → 分類彙整 + 週對比 */
export function categoryBreakdown(curReport, prevReport) {
  const sum = (report) => {
    const m = {};
    for (const r of rows(report)) m[categoryOf(dim(r, 0))] = (m[categoryOf(dim(r, 0))] || 0) + met(r, 0);
    return m;
  };
  const cur = sum(curReport);
  const prev = sum(prevReport);
  return Object.keys(cur)
    .map((category) => ({ category, views: cur[category], wowPct: pctChange(cur[category], prev[category] || 0) }))
    .sort((a, b) => b.views - a.views);
}

/** GA4 dimensions=[sessionSource] metrics=[totalUsers] → 主要來源 + AI 轉介 */
export function trafficSources(report) {
  const all = rows(report).map((r) => ({ source: dim(r, 0), users: met(r, 0) }));
  return { sources: all.slice(0, 6), aiReferrals: all.filter((s) => isAiReferral(s.source)) };
}

/** GSC dimensions=[query]，留排名 11-20、依曝光排序 */
export function searchOpportunities(resp, n = 5) {
  return (resp?.rows ?? [])
    .filter((r) => r.position >= 11 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, n)
    .map((r) => ({ query: r.keys[0], impressions: r.impressions, clicks: r.clicks, ctr: r.ctr, position: r.position }));
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm vitest run scripts/lib/weekly-metrics.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/weekly-metrics.mjs scripts/lib/weekly-metrics.test.mjs
git commit -m "feat(report): weekly-metrics 純轉換 → 四區塊資料"
```

---

## Task 4: weekly-data.mjs（薄編排，印 JSON）

**Files:**
- Create: `scripts/weekly-data.mjs`

此檔是薄 I/O 編排（抓 token → 跑數個 GA4/GSC query → 組裝 → 印 JSON），純邏輯都在 Task 3 測過，故不寫單元測試，用真打唯讀手動驗收。

- [ ] **Step 1: 寫實作**

```js
// scripts/weekly-data.mjs
// 抓 GA4 + GSC，輸出週報四區塊 JSON 到 stdout（不含 LLM）。供 /weekly-report 技能讀。
// 用法：node scripts/weekly-data.mjs   （需 env GOOGLE_APPLICATION_CREDENTIALS）
import { loadServiceAccount, getAccessToken, ga4RunReport, gscQuery } from './lib/google-data.mjs';
import { GA_SCOPE, GSC_SCOPE, weekRanges } from './lib/report-config.mjs';
import { topArticles, categoryBreakdown, trafficSources, searchOpportunities, pctChange } from './lib/weekly-metrics.mjs';

const { cur, prev } = weekRanges(new Date());
const sa = loadServiceAccount();

const gaTok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GA_SCOPE] });
const gscTok = await getAccessToken({ clientEmail: sa.clientEmail, privateKey: sa.privateKey, scopes: [GSC_SCOPE] });

const dr = (range) => [{ startDate: range.start, endDate: range.end }];

const [topRep, catCur, catPrev, srcRep, usersCur, usersPrev] = await Promise.all([
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 5 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 1000 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 1000 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'totalUsers' }], orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }], limit: 50 } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(cur), metrics: [{ name: 'totalUsers' }] } }),
  ga4RunReport({ token: gaTok, body: { dateRanges: dr(prev), metrics: [{ name: 'totalUsers' }] } }),
]);

const gscOpp = await gscQuery({ token: gscTok, body: { startDate: cur.start, endDate: cur.end, dimensions: ['query'], rowLimit: 200 } });

const usersOf = (rep) => Number(rep?.rows?.[0]?.metricValues?.[0]?.value ?? 0);
const { sources, aiReferrals } = trafficSources(srcRep);

console.log(
  JSON.stringify(
    {
      period: { ...cur, prev },
      articlePerf: { topArticles: topArticles(topRep, 5), byCategory: categoryBreakdown(catCur, catPrev) },
      searchOpportunities: searchOpportunities(gscOpp, 5),
      trafficHealth: { users: usersOf(usersCur), usersWoWPct: pctChange(usersOf(usersCur), usersOf(usersPrev)), sources, aiReferrals },
    },
    null,
    2,
  ),
);
```

- [ ] **Step 2: 真打唯讀手動驗收**

Run: `node scripts/weekly-data.mjs`
Expected: 印出含 `period` / `articlePerf` / `searchOpportunities` / `trafficHealth` 四鍵的 JSON，數字合理（剛上線可能多為 0/空陣列，結構正確即通過）。失敗時看錯誤是 auth 還是欄位名。

- [ ] **Step 3: Commit**

```bash
git add scripts/weekly-data.mjs
git commit -m "feat(report): weekly-data 抓 GA4+GSC 輸出四區塊 JSON"
```

---

## Task 5: slack.mjs + slack-post.mjs（投遞）

**Files:**
- Create: `scripts/lib/slack.mjs`
- Test: `scripts/lib/slack.test.mjs`
- Create: `scripts/slack-post.mjs`

- [ ] **Step 1: 寫失敗測試**

```js
// scripts/lib/slack.test.mjs
import { describe, it, expect, vi, afterEach } from 'vitest';
import { postMessage } from './slack.mjs';

afterEach(() => vi.restoreAllMocks());

describe('postMessage', () => {
  it('POST chat.postMessage 帶 Bearer 與 channel/text/blocks', async () => {
    const spy = vi.fn(async () => new Response(JSON.stringify({ ok: true, ts: '1.2' }), { status: 200 }));
    vi.stubGlobal('fetch', spy);
    await postMessage({ token: 'xoxb-t', channel: 'C1', text: 'hi', blocks: [{ type: 'section' }] });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('https://slack.com/api/chat.postMessage');
    expect(init.headers.Authorization).toBe('Bearer xoxb-t');
    const body = JSON.parse(init.body);
    expect(body).toEqual({ channel: 'C1', text: 'hi', blocks: [{ type: 'section' }] });
  });

  it('Slack 回 ok:false → 丟錯帶 error 字串', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: false, error: 'not_in_channel' }), { status: 200 })));
    await expect(postMessage({ token: 'x', channel: 'C1', text: 'hi' })).rejects.toThrow('not_in_channel');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm vitest run scripts/lib/slack.test.mjs`
Expected: FAIL（找不到 `./slack.mjs`）

- [ ] **Step 3: 寫實作（slack.mjs）**

```js
// scripts/lib/slack.mjs
// Slack chat.postMessage 薄封裝。Slack 即使 HTTP 200 也可能 ok:false，要看 body。
export async function postMessage({ token, channel, text, blocks }) {
  const payload = { channel, text };
  if (blocks) payload.blocks = blocks;
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({ ok: false, error: `http_${res.status}` }));
  if (!j.ok) throw new Error(`Slack postMessage 失敗: ${j.error}`);
  return j;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm vitest run scripts/lib/slack.test.mjs`
Expected: PASS

- [ ] **Step 5: 寫 slack-post.mjs（薄 CLI，無單元測試，靠真發驗收）**

```js
// scripts/slack-post.mjs
// 讀 payload JSON 檔（{ text, blocks? }）→ 用 env SLACK_BOT_TOKEN 發到 config 頻道。
// 用法：node scripts/slack-post.mjs <payload.json> [channelId]
import { readFileSync } from 'node:fs';
import { postMessage } from './lib/slack.mjs';
import { SLACK_CHANNEL } from './lib/report-config.mjs';

const [, , payloadPath, channelArg] = process.argv;
const token = process.env.SLACK_BOT_TOKEN;
if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
if (!payloadPath) { console.error('用法：node scripts/slack-post.mjs <payload.json> [channelId]'); process.exit(1); }

const { text, blocks } = JSON.parse(readFileSync(payloadPath, 'utf8'));
try {
  const r = await postMessage({ token, channel: channelArg || SLACK_CHANNEL, text, blocks });
  console.log('sent ts=' + r.ts);
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
```

- [ ] **Step 6: 真發驗收（發到測試或正式頻道）**

Run:
```bash
printf '{"text":"週報管線測試 ✅"}' > /tmp/slack-test.json
set -a; source ~/.config/appi-news/report.env; set +a
node scripts/slack-post.mjs /tmp/slack-test.json
```
Expected: 印 `sent ts=...`，Slack「agent回報」頻道收到「週報管線測試 ✅」。

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/slack.mjs scripts/lib/slack.test.mjs scripts/slack-post.mjs
git commit -m "feat(report): slack postMessage 封裝 + slack-post CLI"
```

---

## Task 6: /weekly-report 技能

**Files:**
- Create: `.claude/skills/weekly-report/SKILL.md`

技能是 prose，不寫單元測試，靠 Task 7 端到端驗收。

- [ ] **Step 1: 寫技能**

````markdown
---
name: weekly-report
description: APPI News 每週數據週報。讀 GA4+GSC 四區塊數據、跑外部熱題雷達、融合產出動態 2-6 個建議寫作方向，組成 Block Kit 訊息發到 Slack。供伺服器 cron headless 呼叫。
---

# Weekly Report

你是 APPI News 的每週數據編輯。全程繁體中文 + 台灣用語、去 AI 腔。被呼叫時跑完下列步驟，最後發一則 Slack 週報。

## 步驟 1：抓數據
跑 `node scripts/weekly-data.mjs`，取得四區塊 JSON（period / articlePerf / searchOpportunities / trafficHealth）。
- 若指令失敗：直接跳到「失敗處理」。

## 步驟 2：外部熱題雷達
用 WebSearch / WebFetch 掃 Anthropic / OpenAI / Google 官方 blog、arXiv cs.AI、Hacker News 高分科技題，列出近一週熱題。
**套專案內容鐵律**：避開政治（政黨/政治人物/選舉/人事）、台灣視角、tech/APPI 相關，比照 147 內容庫定調。雷達失敗 → 降級成「只有數據、無建議」，繼續。

## 步驟 3：合成動態 2-6 個建議方向
融合「站內需求」（GSC searchOpportunities 高曝光低點擊 + articlePerf 分類動能）與「外部熱題」。
- 每個候選用 `站內需求強度 × 外部熱度 × APPI相關` 質性評估，**過門檻才收**；強訊號多就到 6，弱就少，**沒強訊號就明說「本週無強建議」**。
- 讀 `.claude/skills/newsroom/author-memory.json` 去重，已寫過的題不重複推。
- 每個建議欄位（對齊 newsroom 雷達格式）：標題 / 訊號依據 / 建議切角 / 候選結論 / 建議分類，編號。

## 步驟 4：組訊息並發送
把四區塊數據 + 建議方向組成 Block Kit，依此格式（數字深入處附 GA/GSC 連結）：
```
📊 APPI News 週報  <period.start>–<period.end>
① 文章/分類表現：Top3 文章(瀏覽/停留秒) + 各分類週對比(wowPct)
② 🔍 搜尋切入機會：Top searchOpportunities(query/曝光/排名/CTR)
③ 📈 流量健康度：users + usersWoWPct + 主要 sources
④ 🤖 AI 轉介點擊（非被引用）：trafficHealth.aiReferrals
──
💡 本週建議方向（2-6，編號）
  1. <標題> — 依據:<訊號> | 切角 | 結論 | 分類
（頁尾：資料區間、來源 GA4+GSC、產生時間）
```
把 `{ "text": "<純文字摘要>", "blocks": [...] }` 寫到 `/tmp/weekly-report-payload.json`（text 是 blocks 的純文字 fallback，給通知預覽用）。
跑 `node scripts/slack-post.mjs /tmp/weekly-report-payload.json` 發送。回報 `sent ts=` 即成功。

## 失敗處理
任一步驟致命失敗（資料抓不到、token 失效）：把
`{ "text": "⚠️ APPI News 週報失敗：<原因一句>" }` 寫到 `/tmp/weekly-report-payload.json`，
跑 `node scripts/slack-post.mjs /tmp/weekly-report-payload.json`，讓失敗在 Slack 出聲，不要靜默。
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/weekly-report/SKILL.md
git commit -m "feat(report): /weekly-report 技能（數據+雷達+建議→Slack）"
```

---

## Task 7: cron 進入點 + 端到端驗收

**Files:**
- Create: `scripts/cron/weekly-report.sh`

- [ ] **Step 1: 寫 cron shell**

```bash
#!/usr/bin/env bash
# 每週 cron 進入點：載入金鑰 → 跑 /weekly-report 技能。
# crontab 範例（每週一 09:00）：0 9 * * 1 /path/to/appi.news/scripts/cron/weekly-report.sh >> /tmp/weekly-report.log 2>&1
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
exec claude -p "/weekly-report"
```

- [ ] **Step 2: 設可執行 + 端到端驗收（本機）**

Run:
```bash
chmod +x scripts/cron/weekly-report.sh
./scripts/cron/weekly-report.sh
```
Expected: 技能跑完，Slack「agent回報」頻道收到一則格式正確的週報（或在資料為空時收到結構正確、建議為「本週無強建議」的訊息）。確認長相、數字、建議合理。

- [ ] **Step 3: Commit**

```bash
git add scripts/cron/weekly-report.sh
git commit -m "feat(report): cron 進入點 weekly-report.sh + 端到端驗收"
```

- [ ] **Step 4: 部署到伺服器（搬機時做，非本機）**

把 `~/.config/appi-news/{ga4-sa.json,report.env}` 佈到伺服器（同路徑、chmod 600）、確認伺服器有 `claude` 可 headless 跑、加 crontab：`0 9 * * 1 <repo>/scripts/cron/weekly-report.sh >> /tmp/weekly-report.log 2>&1`。先手動跑一次 `./scripts/cron/weekly-report.sh` 確認伺服器端也通，再交給 cron。

---

## 收尾

- [ ] 全測試綠：`pnpm test`（既有 152 + 新增 report 測試）
- [ ] `pnpm build && pnpm check:links` 不受影響（本案不碰 build 流程；確認沒誤觸）
- [ ] 用 superpowers:finishing-a-development-branch 收尾（合併 `feat/weekly-report` → main、push、清分支）

## Self-Review 對照

- Spec §3 元件 → Task 1-7 全覆蓋（report-config / google-data / weekly-metrics / weekly-data / slack(.mjs+CLI) / 技能 / cron）。
- Spec §4 介面（getAccessToken/ga4RunReport/gscQuery、JSON 結構）→ Task 2、3、4。
- Spec §5 四區塊 + AEO 限制（區塊④= aiReferrals GA 轉介）→ Task 3 trafficSources/searchOpportunities + Task 6 格式。
- Spec §6 建議門檻 + author-memory 去重 → Task 6 步驟 3。
- Spec §7 Slack Block Kit → Task 5 + Task 6 步驟 4。
- Spec §8 排程/金鑰 → Task 7 + report-config。
- Spec §9 失敗出聲 → Task 6 失敗處理。
- Spec §10 測試 → 各 Task 的 TDD + 真打/真發驗收。
- 命名一致性：`getAccessToken`/`ga4RunReport`/`gscQuery`/`postMessage`/`topArticles`/`categoryBreakdown`/`trafficSources`/`searchOpportunities`/`weekRanges`/`loadServiceAccount` 跨 Task 一致。
