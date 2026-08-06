import { describe, it, expect } from 'vitest';
import { addedLines } from './check-content.mjs';

// 2026-08-06：範圍粒度從「整檔」改成「新增的內容」。
// 病灶：正文只要差一個字元就整篇送檢，於是「刪掉一行重複的圖片標記」這種一個字都沒新增的
// 維護性改動，也會把該檔存量散文全部拖進硬 gate（修 60 篇重複配圖時 47 篇因此擋住 build）。
describe('addedLines：只認「原本不存在的字」', () => {
  it('純刪除 → 沒有新增行（維護性改動不進 gate，這是本次修正的重點）', () => {
    const before = '第一段\n<img src="/covers/x.webp">\n第二段';
    const after = '第一段\n第二段';
    expect(addedLines(before, after)).toEqual([]);
  });

  it('新增一句 → 只回那一句，不回整篇', () => {
    const before = '舊句子一\n舊句子二';
    const after = '舊句子一\n這是新寫的句子\n舊句子二';
    expect(addedLines(before, after)).toEqual(['這是新寫的句子']);
  });

  it('改寫既有句 → 改後那句算新增（要受現行規則約束）', () => {
    expect(addedLines('原本這樣寫', '改成這樣寫')).toEqual(['改成這樣寫']);
  });

  it('整段搬位置不算新增（文字本來就在站上，屬存量）', () => {
    const before = 'A段\nB段\nC段';
    const after = 'C段\nA段\nB段';
    expect(addedLines(before, after)).toEqual([]);
  });

  it('複製一行（同內容出現兩次）第二次算新增，逐次消耗不會漏判', () => {
    expect(addedLines('重複句', '重複句\n重複句')).toEqual(['重複句']);
  });

  it('忽略前後空白差異與空行', () => {
    expect(addedLines('  同一句  ', '同一句')).toEqual([]);
    expect(addedLines('句子', '句子\n\n\n')).toEqual([]);
  });

  it('空輸入不炸', () => {
    expect(addedLines('', '')).toEqual([]);
    expect(addedLines(null, undefined)).toEqual([]);
    expect(addedLines('', '全新內容')).toEqual(['全新內容']);
  });
});
