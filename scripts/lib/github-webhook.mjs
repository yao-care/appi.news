// GitHub webhook 的純函式：HMAC 驗章 + 事件解析。無 I/O、可單元測試。
//
// 步驟二觸發：dev-bot 標籤的 issue 被開（develop）或被留言（iterate）→ 觸發開發引擎。

import { createHmac, timingSafeEqual } from 'node:crypto';
import { branchForIssue } from './devbot.mjs';

export const SPEC_LABEL = 'dev-bot'; // 由「建立需求單」開的 issue 都掛這個 label
export const ARTICLE_LABEL = 'article-draft'; // /admin「新增寫作任務」開的 issue（走 newsroom 產線寫成文章 → PR）

/** article-draft issue #N → 專屬分支名（與 dev/issue-N 區隔）。與 article-write.mjs 一致。 */
const branchForArticle = (n) => `article/issue-${Number(n)}`;

/**
 * 驗 GitHub webhook 簽章（X-Hub-Signature-256: sha256=<hex>）。
 * @returns {boolean}
 */
export function verifyGithubSignature({ secret, signature, rawBody }) {
  if (!secret || !signature || typeof signature !== 'string') return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody || '', 'utf8').digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const hasLabel = (issue, label) =>
  Array.isArray(issue?.labels) && issue.labels.some((l) => (typeof l === 'string' ? l : l?.name) === label);

/**
 * 解析 GitHub 事件 → 管線動作。
 * @param {{eventType:string, payload:object, botLogin?:string}} p
 * @returns {{kind:'develop'|'iterate'|'writeArticle'|'ping'|'ignore', issue?:number, branch?:string, title?:string, comment?:string, commenter?:string}}
 */
export function parseGithubEvent({ eventType, payload, botLogin } = {}) {
  if (eventType === 'ping') return { kind: 'ping' };
  if (!payload || typeof payload !== 'object') return { kind: 'ignore' };

  if (eventType === 'issues' && payload.action === 'opened' && hasLabel(payload.issue, SPEC_LABEL)) {
    const n = payload.issue.number;
    return { kind: 'develop', issue: n, branch: branchForIssue(n), title: payload.issue.title || '' };
  }

  // /admin「新增寫作任務」開的 article-draft issue → 走 newsroom 產線寫成文章、開 PR。
  if (eventType === 'issues' && payload.action === 'opened' && hasLabel(payload.issue, ARTICLE_LABEL)) {
    const n = payload.issue.number;
    return { kind: 'writeArticle', issue: n, branch: branchForArticle(n), title: payload.issue.title || '' };
  }

  if (eventType === 'issue_comment' && payload.action === 'created' && hasLabel(payload.issue, SPEC_LABEL)) {
    const commenter = payload.comment?.user?.login;
    if (botLogin && commenter === botLogin) return { kind: 'ignore' }; // 機器人自己的留言（PR 連結等）不回觸發
    const n = payload.issue.number;
    return { kind: 'iterate', issue: n, branch: branchForIssue(n), comment: payload.comment?.body || '', commenter };
  }

  return { kind: 'ignore' };
}
