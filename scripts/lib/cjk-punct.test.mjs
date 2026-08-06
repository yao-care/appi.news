// 2026-08-06：從 node:test 改寫成 vitest。原本用 node:test 的 describe/it 加 node:assert，
// 在 `pnpm vitest run` 下會直接報「No test suite found」——等於這支測試一直沒被跑到
// （整個測試套件唯一的失敗檔，其餘 72 檔都是 vitest）。斷言語意逐條對照搬過來，未改測試內容。
import { describe, it, expect } from 'vitest';
import { normalizeCjkPunct, normalizeCjkPunctAll } from './cjk-punct.mjs';

// 這條規則的兩個方向都會改壞資料：轉太少＝中文句留半形標點，轉太多＝把千分位/時間改爛。
// 第一版只在「前後都是中文字」時才轉，漏了 65 處（全形引號、拉丁字、數字在旁邊的情形）。
describe('normalizeCjkPunct', () => {
  it('任一側是中文就轉全形', () => {
    const cases = [
      ['「健康結果」,問診流程', '「健康結果」，問診流程'], // 前面是全形引號
      ['漏收關鍵試驗或文獻,Go/Proceed', '漏收關鍵試驗或文獻，Go/Proceed'], // 後面是拉丁字
      ['分開看,2026到2030', '分開看，2026到2030'], // 後面是數字
      ['130/80,不是國際常見', '130/80，不是國際常見'], // 前面是數字
      ['(135/85),用錯基準', '(135/85)，用錯基準'], // 前面是半形括號
      ['這才是重點:能不能把', '這才是重點：能不能把'],
      ['他問,你確定嗎?他說', '他問，你確定嗎？他說'],
    ];
    for (const [input, want] of cases) expect(normalizeCjkPunct(input)).toBe(want);
  });

  it('數字夾數字不動（千分位／時間／比值）', () => {
    for (const s of [
      '蓋全部 10,080 筆結果',
      'WHO 的 3,700 萬人',
      '自費疫苗1,200至1,500元',
      '會議 14:30 開始',
    ]) {
      expect(normalizeCjkPunct(s)).toBe(s);
    }
  });

  it('純拉丁語境不動', () => {
    for (const s of ['模型有 Sonnet 5, Haiku 4.5', 'key: value; other']) {
      expect(normalizeCjkPunct(s)).toBe(s);
    }
  });

  it('非字串原樣回傳，陣列版逐項處理', () => {
    expect(normalizeCjkPunct(null)).toBe(null);
    expect(normalizeCjkPunct(42)).toBe(42);
    expect(normalizeCjkPunctAll(["甲,乙", "10,080 筆"])).toEqual(["甲，乙", "10,080 筆"]);
    expect(normalizeCjkPunctAll("x")).toEqual("x");
  });
});
