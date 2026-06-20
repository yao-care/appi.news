import { describe, it, expect } from 'vitest';
import { classifyImageSource, isAllowedImageSource, hostnameOf } from './image-sources.mjs';

describe('hostnameOf', () => {
  it('取小寫 hostname；壞 URL → null', () => {
    expect(hostnameOf('https://Upload.WikiMedia.org/x.jpg')).toBe('upload.wikimedia.org');
    expect(hostnameOf('not a url')).toBeNull();
  });
});

describe('classifyImageSource — 白名單把關', () => {
  it('Wikimedia Commons 命中（逐檔授權）', () => {
    const r = classifyImageSource('https://upload.wikimedia.org/wikipedia/commons/a/ab/x.jpg');
    expect(r.allowed).toBe(true);
    expect(r.source.perFile).toBe(true);
  });

  it('歐盟視聽、NASA、.mil 命中', () => {
    expect(isAllowedImageSource('https://audiovisual.ec.europa.eu/x.jpg')).toBe(true);
    expect(isAllowedImageSource('https://images.nasa.gov/x.jpg')).toBe(true);
    expect(isAllowedImageSource('https://media.defense.gov/x.jpg')).toBe(true);
  });

  it('外媒原圖一律擋（reuters / nytimes / 一般新聞站）', () => {
    expect(isAllowedImageSource('https://www.reuters.com/x.jpg')).toBe(false);
    expect(isAllowedImageSource('https://static01.nytimes.com/x.jpg')).toBe(false);
    expect(isAllowedImageSource('https://i.guim.co.uk/x.jpg')).toBe(false);
  });

  it('壞 URL → 不允許、帶 reason', () => {
    const r = classifyImageSource('garbage');
    expect(r.allowed).toBe(false);
    expect(r.reason).toBeTruthy();
  });
});
