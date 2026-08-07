import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasFaqSection } from './faq-detect.mjs';
import { extractFaq } from '../../src/utils/faq.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARTICLES = path.join(ROOT, 'src/content/articles');

describe('hasFaqSection', () => {
  it('認得 markdown 標題（新寫文章的形態）', () => {
    expect(hasFaqSection('## 常見問題\n\n### 會痛嗎？\n\n通常不會，麻醉後幾乎無感。')).toBe(true);
  });

  it('認得 HTML 標題（WordPress 搬過來的舊文形態）', () => {
    expect(hasFaqSection('<h2>常見問題</h2>\n<h3>會痛嗎？</h3><p>通常不會。</p>')).toBe(true);
  });

  it('認得全文 Q1/Q2 式標題（沒有「常見問題」大標）', () => {
    expect(hasFaqSection('## Q1 這樣算數嗎？\n\n算，只要符合條件就成立。')).toBe(true);
  });

  it('沒有 FAQ 的文章回 false', () => {
    expect(hasFaqSection('## 背景\n\n這件事要從頭說起。\n\n## 結語\n\n就這樣。')).toBe(false);
  });

  it('不把圍欄程式碼裡的 # 註解當標題', () => {
    expect(hasFaqSection('```bash\n## 常見問題\n```\n\n正文。')).toBe(false);
  });
});

/**
 * 🔴 這條是本檔存在的理由：lint 的判準不可以比 faq.ts 嚴。
 * 只要某篇文章實際抽得出 FAQPage，lint 就不准說它「沒有常見問題區段」，
 * 否則工作清單會叫人去補早就做完的事（2026-08-07 曾誤報 152 篇）。
 */
describe('與 src/utils/faq.ts 的判準一致性（跑真實存量）', () => {
  it('凡是抽得出 FAQ 的文章，hasFaqSection 一律為 true', () => {
    const offenders = [];
    for (const f of readdirSync(ARTICLES).filter((x) => /\.mdx?$/.test(x))) {
      const raw = readFileSync(path.join(ARTICLES, f), 'utf8');
      const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
      if (extractFaq(body).length > 0 && !hasFaqSection(body)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
