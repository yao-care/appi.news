import { describe, it, expect } from 'vitest';
import { parseArticleIssueBody, slugFromBody, stripArticleTitlePrefix } from './article-issue.mjs';
import { validateJob } from './newsroom-job.mjs';

const BODY = `## 文章寫作工單

- 集合（collection）: articles
- 分類（category）: health
- 標題: 吃到苯駢芘超標沙拉油怎麼辦？
- 目標檔案: \`src/content/articles/benzo-pyrene-oil.md\`
- 網址: \`/articles/benzo-pyrene-oil/\`

### 寫作方向
先講結論：短期少量通常不是急性中毒問題，重點是長期累積暴露。

### 參考資料源
- https://www.fda.gov.tw/example
- 公視新聞報導

### 想表達的結論
未指定

---
### 給寫作者（Claude Code）
- 依 schema 填 frontmatter。
`;

describe('parseArticleIssueBody', () => {
  it('抽出 title/slug/category/angle/mustCite，kind 固定 factual', () => {
    const { job } = parseArticleIssueBody({ title: '[文章] 吃到苯駢芘超標沙拉油怎麼辦？', body: BODY });
    expect(job.title).toBe('吃到苯駢芘超標沙拉油怎麼辦？');
    expect(job.slug).toBe('benzo-pyrene-oil');
    expect(job.category).toBe('health');
    expect(job.kind).toBe('factual');
    expect(job.angle).toContain('長期累積');
    expect(job.mustCite).toEqual(['https://www.fda.gov.tw/example', '公視新聞報導']);
  });

  it('結論「未指定」→ 退回標題（保 conclusion 必填）', () => {
    const { job } = parseArticleIssueBody({ title: '[文章] T', body: BODY });
    expect(job.conclusion).toBe('吃到苯駢芘超標沙拉油怎麼辦？');
  });

  it('產出的 job 在 allowAnyCategory 下通過驗證', () => {
    const { job } = parseArticleIssueBody({ title: '[文章] X', body: BODY });
    expect(validateJob(job, { allowAnyCategory: true })).toEqual([]);
  });

  it('工單沒帶分類 → 套用 fallbackCategory 並記 warning', () => {
    const noCat = BODY.replace('- 分類（category）: health\n', '');
    const { job, warnings } = parseArticleIssueBody({ title: '[文章] X', body: noCat, fallbackCategory: 'tech' });
    expect(job.category).toBe('tech');
    expect(warnings.join()).toContain('預設分類');
  });

  it('沒分類也沒 fallback → category undefined（交給 validateJob 擋）', () => {
    const noCat = BODY.replace('- 分類（category）: health\n', '');
    const { job } = parseArticleIssueBody({ title: '[文章] X', body: noCat });
    expect(job.category).toBeUndefined();
    expect(validateJob(job, { allowAnyCategory: true }).some((e) => e.includes('category'))).toBe(true);
  });
});

describe('slugFromBody / stripArticleTitlePrefix', () => {
  it('從目標檔案路徑抽 slug', () => {
    expect(slugFromBody('目標檔案: `src/content/articles/foo-bar.md`')).toBe('foo-bar');
  });
  it('退回從網址抽 slug', () => {
    expect(slugFromBody('網址: `/articles/foo-bar/`')).toBe('foo-bar');
  });
  it('去掉 [文章] 前綴', () => {
    expect(stripArticleTitlePrefix('[文章] 標題')).toBe('標題');
    expect(stripArticleTitlePrefix('沒前綴')).toBe('沒前綴');
  });
});
