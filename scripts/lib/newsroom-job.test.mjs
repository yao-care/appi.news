import { describe, it, expect } from 'vitest';
import {
  validateJob,
  normalizeJob,
  TECH_CATEGORY,
  LENGTH_DEFAULT,
} from './newsroom-job.mjs';

const validJob = () => ({
  title: 'OpenAI 新模型對台灣開發者的實際影響',
  signal: 'GSC「ai 模型」曝光高、排名 12',
  angle: '從台灣中小團隊導入成本切入',
  conclusion: '值得導入，但要先算 API 成本',
  category: 'tech',
  subcategory: 'ai',
  viewpoint: '我自己帶團隊接過幾個案子，成本通常卡在 context window',
});

describe('validateJob — 鐵律 gate', () => {
  it('合法的科技類工單通過', () => {
    expect(validateJob(validJob())).toEqual([]);
  });

  it('鐵律1：非 tech 類被擋', () => {
    const errs = validateJob({ ...validJob(), category: 'health' });
    expect(errs.some((e) => e.includes('category'))).toBe(true);
  });

  it('鐵律1：缺 category 被擋', () => {
    const errs = validateJob({ ...validJob(), category: undefined });
    expect(errs.some((e) => e.includes('category'))).toBe(true);
  });

  it('鐵律2：缺 viewpoint 被擋（禁杜撰防線）', () => {
    const { viewpoint, ...rest } = validJob();
    expect(validateJob(rest).some((e) => e.includes('viewpoint'))).toBe(true);
  });

  it('鐵律2：空白 viewpoint 被擋', () => {
    const errs = validateJob({ ...validJob(), viewpoint: '   ' });
    expect(errs.some((e) => e.includes('viewpoint'))).toBe(true);
  });

  it('缺 title / conclusion 被擋', () => {
    expect(validateJob({ ...validJob(), title: '' }).some((e) => e.includes('title'))).toBe(true);
    expect(
      validateJob({ ...validJob(), conclusion: '' }).some((e) => e.includes('conclusion')),
    ).toBe(true);
  });

  it('tech 以外的 subcategory 被擋', () => {
    const errs = validateJob({ ...validJob(), subcategory: 'medical' });
    expect(errs.some((e) => e.includes('subcategory'))).toBe(true);
  });

  it('非法 length 被擋', () => {
    const errs = validateJob({ ...validJob(), length: 'epic' });
    expect(errs.some((e) => e.includes('length'))).toBe(true);
  });

  it('非物件輸入不爆炸', () => {
    expect(validateJob(null).length).toBeGreaterThan(0);
    expect(validateJob('x').length).toBeGreaterThan(0);
  });
});

describe('normalizeJob — 預設值與淨化', () => {
  it('未給 length 套預設短稿', () => {
    const n = normalizeJob(validJob());
    expect(n.length).toBe(LENGTH_DEFAULT);
  });

  it('category 一律正規成 tech、trim 文字、mustCite 預設空陣列', () => {
    const n = normalizeJob({ ...validJob(), title: '  有空白  ' });
    expect(n.category).toBe(TECH_CATEGORY);
    expect(n.title).toBe('有空白');
    expect(n.mustCite).toEqual([]);
  });

  it('不改動入參', () => {
    const job = validJob();
    const snapshot = JSON.stringify(job);
    normalizeJob(job);
    expect(JSON.stringify(job)).toBe(snapshot);
  });
});
