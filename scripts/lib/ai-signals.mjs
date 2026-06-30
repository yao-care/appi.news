// 純轉換：吃 GA4 runReport 原始回應，吐「來源分桶」訊號（SEO / AI 轉介 / 其他）。
// 無 I/O、好測。AI host 判定重用 weekly-metrics 的 isAiReferral（單一事實來源）。
//
// 重要前提（誠實標註，勿過度解讀）：
//  - 這裡量的「AI」是「真人從 AI 答案點連結進站」的 referral，**不是** AI 爬蟲抓取/引用
//    （爬蟲不跑 JS，GA 看不到；且很多 AI 工具開連結不帶 referrer → 此桶系統性低估）。
//  - 跨多個 source 加總 totalUsers 並非嚴格可加（同一人用兩個來源會重複），但 AI referral
//    量小、跨來源重複極少，誤差可忽略；SEO 桶以 medium=organic 聚合，量大時同理為近似值。
import { isAiReferral } from './weekly-metrics.mjs';

const rows = (report) => report?.rows ?? [];
const dim = (r, i) => r.dimensionValues[i].value;
const met = (r, i) => Number(r.metricValues[i].value);

/** 依 source/medium 把一個 session 來源歸到 seo / ai / other 三桶之一。AI 優先判定。 */
export function acquisitionBucket(source, medium) {
  if (isAiReferral(source)) return 'ai';
  const m = (medium || '').toLowerCase();
  if (m === 'organic') return 'seo';
  return 'other';
}

const round = (n) => Math.round(n);

/**
 * GA4 dimensions=[sessionSource, sessionMedium]
 *     metrics=[totalUsers, sessions, userEngagementDuration]
 * → { seo, ai, other }，每桶 { users, sessions, engagedSec, avgEngagedSecPerUser }。
 */
export function acquisitionSplit(report) {
  const mk = () => ({ users: 0, sessions: 0, engagedSec: 0 });
  const buckets = { seo: mk(), ai: mk(), other: mk() };
  for (const r of rows(report)) {
    const b = buckets[acquisitionBucket(dim(r, 0), dim(r, 1))];
    b.users += met(r, 0);
    b.sessions += met(r, 1);
    b.engagedSec += met(r, 2);
  }
  for (const k of Object.keys(buckets)) {
    const b = buckets[k];
    b.engagedSec = round(b.engagedSec);
    b.avgEngagedSecPerUser = b.users ? round(b.engagedSec / b.users) : 0;
  }
  return buckets;
}

/**
 * 同一份 [sessionSource, sessionMedium, ...] 報告，挑出 AI 來源逐 host 拆。
 * 回 [{ host, users, engagedSec, avgEngagedSecPerUser }]，依 users 由大到小。
 */
export function aiHostBreakdown(report) {
  const m = {};
  for (const r of rows(report)) {
    const source = dim(r, 0);
    if (!isAiReferral(source)) continue;
    const host = source.toLowerCase();
    const e = (m[host] ||= { host, users: 0, engagedSec: 0 });
    e.users += met(r, 0);
    e.engagedSec += met(r, 2);
  }
  return Object.values(m)
    .map((e) => ({ ...e, engagedSec: round(e.engagedSec), avgEngagedSecPerUser: e.users ? round(e.engagedSec / e.users) : 0 }))
    .sort((a, b) => b.users - a.users);
}

/**
 * GA4 dimensions=[landingPagePlusQueryString]、metrics=[totalUsers]（已用 sessionSource
 * inList AI_HOSTS 過濾）→ 「AI 答案把人帶到哪些頁」前 n 名。回 [{ path, users }]。
 */
export function aiLandingPages(report, n = 10) {
  return rows(report)
    .map((r) => ({ path: dim(r, 0), users: met(r, 0) }))
    .sort((a, b) => b.users - a.users)
    .slice(0, n);
}
