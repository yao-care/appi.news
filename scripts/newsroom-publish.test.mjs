import { describe, it, expect } from 'vitest';
import { promoteFrontmatter } from './newsroom-publish.mjs';

const NOW = '2026-06-20T10:00:00.000Z';

const draft = (over = '') => `---
title: "颱風停班課整理"
status: "scheduled"
publishDate: "2027-06-19T08:00:00+08:00"
category: "lifestyle"${over}
---

內文不要被動到。
`;

describe('promoteFrontmatter — 待審草稿轉正', () => {
  it('status→published、publishDate→now、其餘原樣、內文不動', () => {
    const { text, changed, before } = promoteFrontmatter(draft(), NOW);
    expect(changed).toBe(true);
    expect(before.status).toBe('"scheduled"');
    expect(text).toContain('status: "published"');
    expect(text).toContain(`publishDate: "${NOW}"`);
    expect(text).toContain('category: "lifestyle"'); // 其他欄位保留
    expect(text).toContain('內文不要被動到。'); // body 不動
  });

  it('沒有 updatedDate 時補上', () => {
    const { text } = promoteFrontmatter(draft(), NOW);
    expect(text).toContain(`updatedDate: "${NOW}"`);
  });

  it('已有 updatedDate 時更新而非重複', () => {
    const { text } = promoteFrontmatter(draft('\nupdatedDate: "2026-01-01"'), NOW);
    expect((text.match(/updatedDate:/g) || []).length).toBe(1);
    expect(text).toContain(`updatedDate: "${NOW}"`);
  });

  it('無 frontmatter → 丟錯', () => {
    expect(() => promoteFrontmatter('沒有 frontmatter 的內容', NOW)).toThrow();
  });

  it('不動其它 key 的值（不重排 YAML）', () => {
    const { text } = promoteFrontmatter(draft(), NOW);
    expect(text).toContain('title: "颱風停班課整理"');
  });
});
