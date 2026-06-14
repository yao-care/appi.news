import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { buildImagePrompt, toWebp, imgTag, PEOPLE_DIRECTIVE } from './ai-image.mjs';

describe('buildImagePrompt', () => {
  it('永遠附加台灣人物鐵律與無文字風格', () => {
    const p = buildImagePrompt({ topic: 'AI 在醫院的應用' });
    expect(p).toContain(PEOPLE_DIRECTIVE);
    expect(p).toContain('AI 在醫院的應用');
    expect(p.toLowerCase()).toContain('no text');
  });
  it('缺 topic 時丟錯', () => {
    expect(() => buildImagePrompt({ topic: '' })).toThrow();
    expect(() => buildImagePrompt({})).toThrow();
    expect(() => buildImagePrompt({ topic: null })).toThrow();
  });
  it('有 context 時帶入', () => {
    const p = buildImagePrompt({ topic: 'X', context: '醫師信任議題' });
    expect(p).toContain('醫師信任議題');
  });
});

describe('toWebp', () => {
  it('縮到目標寬度並輸出 webp，回傳尺寸', async () => {
    const png = await sharp({
      create: { width: 1536, height: 1024, channels: 3, background: '#888888' },
    }).png().toBuffer();
    const { buffer, width, height } = await toWebp(png, 960);
    expect(width).toBe(960);
    expect(height).toBe(640); // 1536x1024 為 3:2，縮到寬 960 → 高 640
    expect(buffer.slice(8, 12).toString('ascii')).toBe('WEBP'); // webp magic
  });
  it('原圖較小時不放大', async () => {
    const png = await sharp({
      create: { width: 400, height: 300, channels: 3, background: '#123456' },
    }).png().toBuffer();
    const { width } = await toWebp(png, 960);
    expect(width).toBe(400);
  });
});

describe('imgTag', () => {
  it('含 width/height/lazy/decoding（CLS 安全）', () => {
    const t = imgTag({ src: '/images/x.webp', width: 960, height: 640, alt: '帶"引號"的描述' });
    expect(t).toContain('src="/images/x.webp"');
    expect(t).toContain('width="960"');
    expect(t).toContain('height="640"');
    expect(t).toContain('loading="lazy"');
    expect(t).toContain('decoding="async"');
    expect(t).toContain('&quot;'); // alt 內引號需逸出
  });
  it('缺 src 丟錯', () => {
    expect(() => imgTag({ width: 1, height: 1, alt: '' })).toThrow();
  });
  it('缺或非數字的 width/height 時丟錯', () => {
    expect(() => imgTag({ src: '/x.webp', alt: '' })).toThrow();
  });
  it('& 被逸出', () => {
    const t = imgTag({ src: '/x.webp', width: 1, height: 1, alt: 'a & b' });
    expect(t).toContain('a &amp; b');
  });
  it('null alt 變空字串', () => {
    const t2 = imgTag({ src: '/x.webp', width: 1, height: 1, alt: null });
    expect(t2).toContain('alt=""');
  });
});
