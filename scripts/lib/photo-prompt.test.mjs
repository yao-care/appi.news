import { describe, it, expect } from 'vitest';
import {
  PHOTO_TECH_SPEC, PHOTO_HARD_CLAUSES, PHOTO_AVOID, PHOTO_ANTI_TEMPLATE,
  sanitizeDetail, detailOk, composePhotoPrompt, buildWriterPrompt,
  seedHash, varietyHints, VARIETY_POOLS,
} from './photo-prompt.mjs';

describe('composePhotoPrompt', () => {
  it('組裝＝技術規格 + detail + 硬性條款 + 反套版 + Avoid', () => {
    const p = composePhotoPrompt('a woman reading in a bright Taipei clinic');
    expect(p).toContain(PHOTO_TECH_SPEC);
    expect(p).toContain('a woman reading in a bright Taipei clinic');
    expect(p).toContain(PHOTO_HARD_CLAUSES);
    expect(p).toContain(PHOTO_ANTI_TEMPLATE);
    expect(p).toContain(PHOTO_AVOID);
    // 硬性條款一定含台灣人與零文字（不信任展開結果）
    expect(p).toContain('East Asian (Taiwanese)');
    expect(p).toContain('NO text');
    // 反套版：單一場景、禁拼貼/色塊分割/飄浮元素
    expect(p).toContain('NO collage');
    expect(p).toContain('single camera frame');
  });
});

describe('varietyHints（多樣性輪轉）', () => {
  it('同 seed 恆同組合（可重現）', () => {
    expect(varietyHints('covers/foo.webp')).toEqual(varietyHints('covers/foo.webp'));
    expect(seedHash('abc')).toBe(seedHash('abc'));
  });
  it('不同 seed 會輪出不同組合（抽樣多個 seed 至少兩種 shot/person）', () => {
    const seeds = ['a.webp', 'b.webp', 'c.webp', 'd.webp', 'e.webp', 'f.webp', 'g.webp', 'h.webp'];
    const shots = new Set(seeds.map((s) => varietyHints(s).shot));
    const persons = new Set(seeds.map((s) => varietyHints(s).person));
    expect(shots.size).toBeGreaterThan(1);
    expect(persons.size).toBeGreaterThan(1);
  });
  it('組合值一定來自對應池', () => {
    const v = varietyHints('x');
    expect(VARIETY_POOLS.shot).toContain(v.shot);
    expect(VARIETY_POOLS.light).toContain(v.light);
    expect(VARIETY_POOLS.person).toContain(v.person);
    expect(VARIETY_POOLS.palette).toContain(v.palette);
  });
});

describe('sanitizeDetail', () => {
  it('剝除 markdown code fence', () => {
    expect(sanitizeDetail('```\nhello world\n```')).toBe('hello world');
    expect(sanitizeDetail('```text\nhello\n```')).toBe('hello');
  });
  it('無 fence 時只 trim', () => {
    expect(sanitizeDetail('  hi  ')).toBe('hi');
  });
});

describe('detailOk', () => {
  it('達 100 英文詞才合格', () => {
    expect(detailOk('word '.repeat(100))).toBe(true);
    expect(detailOk('word '.repeat(99))).toBe(false);
    expect(detailOk('')).toBe(false);
    expect(detailOk(null)).toBe(false);
  });
});

describe('buildWriterPrompt', () => {
  it('caption 為傳達訊息、articleContext 為主題，皆帶入', () => {
    const p = buildWriterPrompt({
      brief: '受訪者端詳篩檢報告',
      alt: '一位中年女性看著手中的檢查單',
      caption: '篩檢結果容易被誤判，需要冷靜判讀',
      articleContext: 'AI 輔助乳癌篩檢的準確度',
    });
    expect(p).toContain('篩檢結果容易被誤判，需要冷靜判讀'); // caption=要傳達的訊息
    expect(p).toContain('AI 輔助乳癌篩檢的準確度'); // articleContext=主題
    expect(p).toContain('East Asian (Taiwanese)');
    expect(p).toContain('英文'); // 要求輸出英文 prompt
  });
  it('缺 caption 時退回 brief 當訊息', () => {
    const p = buildWriterPrompt({ brief: '一位工程師在資料中心巡檢' });
    expect(p).toContain('一位工程師在資料中心巡檢');
  });
  it('retryHint 會加「太短」提示', () => {
    expect(buildWriterPrompt({ brief: 'x' }, true)).toContain('上次輸出太短');
    expect(buildWriterPrompt({ brief: 'x' }, false)).not.toContain('上次輸出太短');
  });
  it('新聞攝影定調＋反拼貼寫進指令', () => {
    const p = buildWriterPrompt({ brief: 'x' });
    expect(p).toContain('新聞攝影');
    expect(p).toContain('拼貼');
  });
  it('帶 variety 時多樣性組合寫進指令；不帶則無該段', () => {
    const v = varietyHints('covers/demo.webp');
    const p = buildWriterPrompt({ brief: 'x', variety: v });
    expect(p).toContain('多樣性輪轉');
    expect(p).toContain(v.shot);
    expect(p).toContain(v.person);
    expect(buildWriterPrompt({ brief: 'x' })).not.toContain('多樣性輪轉');
  });
});
