import { describe, it, expect } from 'vitest';
import { pageUsedText, fontStackSwap, miniStyleTag } from './mini-fonts.mjs';

describe('pageUsedText', () => {
  it('聯集 baseline 與 HTML 用字、去重', () => {
    const out = pageUsedText('<p>科技</p>', 'AB');
    expect(out).toContain('科'); expect(out).toContain('技');
    expect(out).toContain('A'); expect(out).toContain('B');
    expect([...out].length).toBe(new Set([...out]).size);
  });
});

describe('fontStackSwap', () => {
  it('棧含站台字型 → 直接替換成迷你 family', () => {
    expect(fontStackSwap('"Noto Sans TC", system-ui', 'Noto Sans TC', 'NS-Pg'))
      .toBe('"NS-Pg", system-ui');
  });
  it('棧無站台字型但有 Inter → 插在 Inter 後', () => {
    expect(fontStackSwap('"Inter", system-ui', 'Noto Sans TC', 'NS-Pg'))
      .toBe('"Inter", "NS-Pg", system-ui');
  });
  it('兩者皆無 → 前置迷你 family', () => {
    expect(fontStackSwap('system-ui', 'Noto Sans TC', 'NS-Pg'))
      .toBe('"NS-Pg", system-ui');
  });
});

describe('miniStyleTag', () => {
  it('組出 style（@font-face + :root override，多條以分號連接）', () => {
    const t = miniStyleTag(['@font-face{a}'], ['--font-sans:"NS-Pg"', '--font-serif:"NF-Pg"']);
    expect(t).toBe('<style>@font-face{a}:root{--font-sans:"NS-Pg";--font-serif:"NF-Pg"}</style>');
  });
  it('無 faces 或無 override → 空字串', () => {
    expect(miniStyleTag([], ['x'])).toBe('');
    expect(miniStyleTag(['x'], [])).toBe('');
  });
});
