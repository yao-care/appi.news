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

  it('合法的其他 vertical（international / sports / lifestyle）通過', () => {
    expect(validateJob({ ...validJob(), category: 'international', subcategory: 'asia' })).toEqual([]);
    expect(validateJob({ ...validJob(), category: 'sports', subcategory: 'baseball' })).toEqual([]);
    expect(validateJob({ ...validJob(), category: 'lifestyle', subcategory: 'aging-life' })).toEqual([]);
  });

  it('鐵律1：未開放自動產文的分類（health）被擋', () => {
    const errs = validateJob({ ...validJob(), category: 'health' });
    expect(errs.some((e) => e.includes('category'))).toBe(true);
  });

  it('鐵律1：缺 category 被擋', () => {
    const errs = validateJob({ ...validJob(), category: undefined });
    expect(errs.some((e) => e.includes('category'))).toBe(true);
  });

  it('鐵律2：觀點稿缺 viewpoint 被擋（禁杜撰防線）', () => {
    const { viewpoint, ...rest } = validJob();
    expect(validateJob(rest).some((e) => e.includes('viewpoint'))).toBe(true);
  });

  it('鐵律2：觀點稿空白 viewpoint 被擋', () => {
    const errs = validateJob({ ...validJob(), viewpoint: '   ' });
    expect(errs.some((e) => e.includes('viewpoint'))).toBe(true);
  });

  it('事實稿（kind: factual）不要求 viewpoint', () => {
    const { viewpoint, ...rest } = validJob();
    expect(validateJob({ ...rest, kind: 'factual', category: 'lifestyle', subcategory: 'aging-life' })).toEqual([]);
  });

  it('非法 kind 被擋', () => {
    expect(validateJob({ ...validJob(), kind: 'rant' }).some((e) => e.includes('kind'))).toBe(true);
  });

  it('非法 contentType 被擋、合法通過', () => {
    expect(validateJob({ ...validJob(), contentType: 'meme' }).some((e) => e.includes('contentType'))).toBe(true);
    expect(validateJob({ ...validJob(), contentType: 'guide' })).toEqual([]);
  });

  it('缺 title / conclusion 被擋', () => {
    expect(validateJob({ ...validJob(), title: '' }).some((e) => e.includes('title'))).toBe(true);
    expect(
      validateJob({ ...validJob(), conclusion: '' }).some((e) => e.includes('conclusion')),
    ).toBe(true);
  });

  it('subcategory 不屬於該分類被擋', () => {
    expect(validateJob({ ...validJob(), subcategory: 'medical' }).some((e) => e.includes('subcategory'))).toBe(true);
    // 對的子分類放錯分類也被擋（baseball 是 sports 的）
    expect(validateJob({ ...validJob(), subcategory: 'baseball' }).some((e) => e.includes('subcategory'))).toBe(true);
  });

  it('非法 length 被擋', () => {
    const errs = validateJob({ ...validJob(), length: 'epic' });
    expect(errs.some((e) => e.includes('length'))).toBe(true);
  });

  it('合法 publishDate 通過、非法格式被擋', () => {
    expect(validateJob({ ...validJob(), publishDate: '2026-06-20' })).toEqual([]);
    expect(validateJob({ ...validJob(), publishDate: '06/20' }).some((e) => e.includes('publishDate'))).toBe(true);
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

  it('category 原樣帶過（不再寫死 tech）、trim 文字、mustCite 預設空陣列', () => {
    const n = normalizeJob({ ...validJob(), title: '  有空白  ' });
    expect(n.category).toBe(TECH_CATEGORY);
    expect(n.title).toBe('有空白');
    expect(n.mustCite).toEqual([]);
    const intl = normalizeJob({ ...validJob(), category: 'international', subcategory: 'asia' });
    expect(intl.category).toBe('international');
    expect(intl.categoryName).toBe('國際');
  });

  it('未給 kind → column（觀點稿）：作者 lightman、觀點 gate 開、contentType news', () => {
    const n = normalizeJob(validJob());
    expect(n.kind).toBe('column');
    expect(n.author).toBe('lightman');
    expect(n.viewpointRequired).toBe(true);
    expect(n.viewpointGate).toBe(true);
    expect(n.contentType).toBe('news');
  });

  it('kind: factual（事實稿）：編輯部署名、觀點 gate 關、contentType guide、viewpoint 可空', () => {
    const { viewpoint, ...rest } = validJob();
    const n = normalizeJob({ ...rest, kind: 'factual', category: 'lifestyle', subcategory: 'aging-life' });
    expect(n.kind).toBe('factual');
    expect(n.author).toBe('appi-editorial');
    expect(n.viewpointGate).toBe(false);
    expect(n.contentType).toBe('guide');
    expect(n.viewpoint).toBe('');
  });

  it('明確指定 author / contentType 時不被預設覆蓋', () => {
    const n = normalizeJob({ ...validJob(), author: 'guest-x', contentType: 'analysis' });
    expect(n.author).toBe('guest-x');
    expect(n.contentType).toBe('analysis');
  });

  it('publishDate 截到 YYYY-MM-DD；沒給 → null', () => {
    expect(normalizeJob({ ...validJob(), publishDate: '2026-06-20T08:00:00+08:00' }).publishDate).toBe('2026-06-20');
    expect(normalizeJob(validJob()).publishDate).toBeNull();
  });

  it('不改動入參', () => {
    const job = validJob();
    const snapshot = JSON.stringify(job);
    normalizeJob(job);
    expect(JSON.stringify(job)).toBe(snapshot);
  });
});
