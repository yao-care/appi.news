import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  aHashFromGray, hamming, isDuplicateHash, aHashFile, coverDuplicatesInline, DUP_THRESHOLD,
} from './image-dedupe.mjs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('aHashFromGray / hamming', () => {
  it('全暗與全亮的 aHash 漢明距離為 0（皆等於平均值 → 全 1）', () => {
    const dark = new Uint8Array(64).fill(0);
    const bright = new Uint8Array(64).fill(255);
    // 全部像素都 >= mean（mean=該值本身）→ 兩者都是全 1，距離 0
    expect(hamming(aHashFromGray(dark), aHashFromGray(bright))).toBe(0);
  });
  it('左右半分的圖 vs 上下半分的圖，aHash 明顯不同', () => {
    const leftDark = new Uint8Array(64);
    const topDark = new Uint8Array(64);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        leftDark[y * 8 + x] = x < 4 ? 0 : 255;
        topDark[y * 8 + x] = y < 4 ? 0 : 255;
      }
    }
    expect(hamming(aHashFromGray(leftDark), aHashFromGray(topDark))).toBeGreaterThan(DUP_THRESHOLD);
  });
  it('像素不足丟錯', () => {
    expect(() => aHashFromGray(new Uint8Array(10))).toThrow();
  });
  it('isDuplicateHash 用門檻判定', () => {
    expect(isDuplicateHash(0b1111n, 0b1111n)).toBe(true);
    expect(isDuplicateHash(0n, (1n << 40n) - 1n)).toBe(false); // 40 bit 差 > 門檻
  });
});

describe('aHashFile / coverDuplicatesInline（真檔）', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dedupe-'));
  // 同源不同編碼：同一張漸層，一存 webp、一存 jpg → 應判為重複
  async function gradient(path, fmt) {
    const w = 64, h = 64;
    const raw = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3; const v = (x / w) * 255;
      raw[i] = v; raw[i + 1] = v; raw[i + 2] = v;
    }
    let s = sharp(raw, { raw: { width: w, height: h, channels: 3 } });
    s = fmt === 'webp' ? s.webp() : s.jpeg();
    await s.toFile(path);
  }

  it('同源不同編碼（webp vs jpg）判為重複', async () => {
    const a = join(dir, 'cover.webp'); const b = join(dir, 'inline.jpg');
    await gradient(a, 'webp'); await gradient(b, 'jpg');
    const r = await coverDuplicatesInline(a, [b]);
    expect(r.duplicate).toBe(true);
    expect(r.match).toBe(b);
  });

  it('不同圖不判重複', async () => {
    const cover = join(dir, 'c2.webp');
    const other = join(dir, 'o2.webp');
    await gradient(cover, 'webp');
    // 直向漸層（與橫向明顯不同）
    const w = 64, h = 64; const raw = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3; const v = (y / h) * 255; raw[i] = v; raw[i + 1] = v; raw[i + 2] = v;
    }
    await sharp(raw, { raw: { width: w, height: h, channels: 3 } }).webp().toFile(other);
    const r = await coverDuplicatesInline(cover, [other]);
    expect(r.duplicate).toBe(false);
  });

  it('讀不到的內文路徑略過、不誤報', async () => {
    const cover = join(dir, 'c3.webp'); await gradient(cover, 'webp');
    const r = await coverDuplicatesInline(cover, [join(dir, 'nope-does-not-exist.jpg')]);
    expect(r.duplicate).toBe(false);
  });

  it('aHashFile 讀不到檔回 null', async () => {
    expect(await aHashFile(join(dir, 'ghost.png'))).toBeNull();
  });
});
