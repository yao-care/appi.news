import { describe, it, expect } from 'vitest';
import { isPublicFrontmatter, isScheduledPreviewFrontmatter } from './visibility.mjs';

const now = new Date('2026-08-20T12:00:00Z');
const past = '2026-08-19T00:00:00Z';
const future = '2026-08-22T00:00:00Z';

describe('isPublicFrontmatter — 可見性唯一正本', () => {
  it('已到 publishDate 且非 draft/archived → 公開；Date 物件與字串都吃', () => {
    expect(isPublicFrontmatter({ publishDate: past }, now)).toBe(true);
    expect(isPublicFrontmatter({ publishDate: new Date(past), status: 'published' }, now)).toBe(true);
  });
  it('**任何 status** 只要日期在未來就隱藏（deploy-needed 曾只認 scheduled 而漏重建）', () => {
    expect(isPublicFrontmatter({ status: 'published', publishDate: future }, now)).toBe(false);
    expect(isPublicFrontmatter({ status: 'scheduled', publishDate: future }, now)).toBe(false);
  });
  it('draft 旗標（布林或 regex 撈出的字串）與 status draft/archived 永遠隱藏', () => {
    expect(isPublicFrontmatter({ draft: true, publishDate: past }, now)).toBe(false);
    expect(isPublicFrontmatter({ draft: 'true', publishDate: past }, now)).toBe(false);
    expect(isPublicFrontmatter({ status: 'draft', publishDate: past }, now)).toBe(false);
    expect(isPublicFrontmatter({ status: 'archived', publishDate: past }, now)).toBe(false);
  });
  it('publishDate 缺漏／壞值＝不公開（寧可少列，不提早曝光）', () => {
    expect(isPublicFrontmatter({ status: 'published' }, now)).toBe(false);
    expect(isPublicFrontmatter({ publishDate: 'not-a-date' }, now)).toBe(false);
    expect(isPublicFrontmatter(null, now)).toBe(false);
  });
});

describe('isScheduledPreviewFrontmatter — 排程草稿（noindex 預覽頁那批）', () => {
  it('未來日期＋status 未隱藏 → 是排程草稿；已公開／draft 都不是', () => {
    expect(isScheduledPreviewFrontmatter({ status: 'scheduled', publishDate: future }, now)).toBe(true);
    expect(isScheduledPreviewFrontmatter({ status: 'published', publishDate: future }, now)).toBe(true);
    expect(isScheduledPreviewFrontmatter({ publishDate: past }, now)).toBe(false);
    expect(isScheduledPreviewFrontmatter({ draft: true, publishDate: future }, now)).toBe(false);
    expect(isScheduledPreviewFrontmatter({ status: 'draft', publishDate: future }, now)).toBe(false);
  });
  it('同一篇文章在任一時點，public 與 preview 至多一個成立', () => {
    for (const d of [{ publishDate: past }, { publishDate: future }, { status: 'draft', publishDate: future }]) {
      expect(isPublicFrontmatter(d, now) && isScheduledPreviewFrontmatter(d, now)).toBe(false);
    }
  });
});
