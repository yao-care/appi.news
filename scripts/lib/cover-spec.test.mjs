import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  coverSpecProblem, checkCoverFile, COVER_MIN_WIDTH, COVER_MIN_RATIO, COVER_MAX_RATIO,
} from './cover-spec.mjs';

describe('coverSpecProblem（純函式門檻）', () => {
  it('標準橫式封面通過：1200×800、1600×900、1200×630（og 經典比例）', () => {
    expect(coverSpecProblem(1200, 800)).toBeNull();
    expect(coverSpecProblem(1600, 900)).toBeNull();
    expect(coverSpecProblem(1200, 630)).toBeNull();
  });
  it('4:3 恰好過下限（1.33 ≥ 1.3）', () => {
    expect(coverSpecProblem(1600, 1200)).toBeNull();
  });
  it('寬度不足擋下：940×627（Pexels large）、1080×720、1199×600', () => {
    expect(coverSpecProblem(940, 627)).toMatch(/寬度 940px 不足/);
    expect(coverSpecProblem(1080, 720)).toMatch(/寬度 1080px 不足/);
    expect(coverSpecProblem(1199, 600)).toMatch(/不足/);
  });
  it('直式擋下（實例：國際線 1200×1800）', () => {
    expect(coverSpecProblem(1200, 1800)).toMatch(/直式/);
  });
  it('方形與近方形擋下：1200×1200、1200×1014（比例 1.18）', () => {
    expect(coverSpecProblem(1200, 1200)).toMatch(/方形/);
    expect(coverSpecProblem(1200, 1014)).toMatch(/方形/);
  });
  it('過寬橫幅擋下（實例：733×96 的壞檔，若放大到 ≥1200 仍要擋）', () => {
    expect(coverSpecProblem(1200, 157)).toMatch(/過寬的橫幅/);
  });
  it('無效尺寸擋下（0、NaN、undefined）', () => {
    expect(coverSpecProblem(0, 800)).toMatch(/讀不到有效尺寸/);
    expect(coverSpecProblem(NaN, 800)).toMatch(/讀不到有效尺寸/);
    expect(coverSpecProblem(undefined, undefined)).toMatch(/讀不到有效尺寸/);
  });
  it('門檻常數與規格一致（防手滑改值）', () => {
    expect(COVER_MIN_WIDTH).toBe(1200);
    expect(COVER_MIN_RATIO).toBe(1.3);
    expect(COVER_MAX_RATIO).toBe(2.5);
  });
});

describe('checkCoverFile（真檔）', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cover-spec-'));

  it('合格橫式 webp → ok:true', async () => {
    const p = join(dir, 'good.webp');
    writeFileSync(p, await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#888' } }).webp().toBuffer());
    const r = await checkCoverFile(p);
    expect(r.ok).toBe(true);
    expect(r.width).toBe(1200);
    expect(r.height).toBe(800);
  });

  it('小圖 webp → ok:false 帶原因', async () => {
    const p = join(dir, 'small.webp');
    writeFileSync(p, await sharp({ create: { width: 960, height: 600, channels: 3, background: '#888' } }).webp().toBuffer());
    const r = await checkCoverFile(p);
    expect(r.ok).toBe(false);
    expect(r.problem).toMatch(/寬度 960px 不足/);
  });

  it('直式 webp → ok:false 帶原因', async () => {
    const p = join(dir, 'portrait.webp');
    writeFileSync(p, await sharp({ create: { width: 1200, height: 1800, channels: 3, background: '#888' } }).webp().toBuffer());
    const r = await checkCoverFile(p);
    expect(r.ok).toBe(false);
    expect(r.problem).toMatch(/直式/);
  });

  it('檔案不存在 → ok:false 不 throw', async () => {
    const r = await checkCoverFile(join(dir, 'nope.webp'));
    expect(r.ok).toBe(false);
    expect(r.problem).toMatch(/讀不到圖檔/);
  });

  it('非圖片檔 → ok:false 不 throw', async () => {
    const p = join(dir, 'text.webp');
    writeFileSync(p, 'not an image');
    const r = await checkCoverFile(p);
    expect(r.ok).toBe(false);
  });
});
