import { describe, it, expect } from 'vitest';
import { extractFaq } from './faq';

describe('extractFaq', () => {
  it('extracts Q&A from an explicit 常見問題 section', () => {
    const body = `
<h2>內文</h2>
<p>正文段落。</p>
<h2>常見問題（FAQ）</h2>
<h3>Q1｜這安全嗎？</h3>
<p>多數情況下是安全的，但仍應諮詢專業人員。</p>
<h3>Q2｜需要多久？</h3>
<p>通常需要數週時間才會見效。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[0].question).toBe('這安全嗎？');
    expect(faq[0].answer).toContain('安全');
  });

  it('detects Q-prefixed headings without an explicit FAQ section', () => {
    const body = `
<h3>Q1：這是什麼？</h3>
<p>這是一個說明段落，內容足夠長。</p>
<h3>Q2：怎麼用？</h3>
<p>依照步驟操作即可完成設定。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[1].question).toBe('怎麼用？');
  });

  it('excludes 參考文獻 / 免責 headings and dedupes', () => {
    const body = `
<h2>常見問題</h2>
<h3>真的有效嗎？</h3>
<p>研究顯示有一定效果。</p>
<h2>參考文獻</h2>
<h3>來源清單</h3>
<p>不應被當成問題。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(1);
    expect(faq[0].question).toBe('真的有效嗎？');
  });

  it('returns empty when there is no FAQ', () => {
    expect(extractFaq('<h2>前言</h2><p>沒有問答。</p>')).toEqual([]);
  });

  // 以下三種是新寫文章的 markdown 形態；2026-08-04 之前一律抽不到（全站 92 篇無 FAQPage）。
  it('extracts markdown ### Q1 headings under a markdown 常見問題 section', () => {
    const body = `## 四、什麼情況要看醫師

正文段落。

### 常見問題

### Q1: 吃地奧司明，痔瘡就會慢慢不見嗎？
藥物能緩解急性期的出血與腫脹，但不會讓已經形成的痔瘡組織消失。

### Q2: 痔瘡出血，是不是都要照大腸鏡才安心？
要看年齡與危險因子，並非每個人都需要。

## 參考資料

- 某篇文獻`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[0].question).toBe('吃地奧司明，痔瘡就會慢慢不見嗎？');
    expect(faq[0].answer).toContain('不會讓已經形成的痔瘡組織消失');
    expect(faq.some((f) => f.question.includes('參考'))).toBe(false);
  });

  it('extracts markdown **question** paragraphs under a markdown FAQ section', () => {
    const body = `## 常見問題

**Anthropic 估值超車 OpenAI，代表 Claude 比較強嗎？**

不能這樣讀。估值是資本市場對成長速度的定價，不是模型能力排行榜。

**那估值完全沒有參考價值？**

有，但它反映的是資金流向，要比能力得看實測表現。

## 結語

收尾段落不該被當成問題。`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[0].question).toBe('Anthropic 估值超車 OpenAI，代表 Claude 比較強嗎？');
    expect(faq[0].answer).toContain('不是模型能力排行榜');
    expect(faq.some((f) => f.question === '結語')).toBe(false);
  });

  it('extracts HTML <p><strong> Q&A under a markdown heading (mixed form)', () => {
    const body = `## 常見問題

<p><strong>ASIC 跟 GPU 最根本的差異是什麼？</strong><br>ASIC 是為單一任務把電路刻死的客製晶片，GPU 則是通用可程式化的平行運算器。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(1);
    expect(faq[0].question).toBe('ASIC 跟 GPU 最根本的差異是什麼？');
  });

  it('strips markdown links and emphasis from answers', () => {
    const body = `### 常見問題

### Q1: 這個數字可信嗎？
根據 [疾管署公告](https://www.cdc.gov.tw/x)，單週門診就診數 **破萬**，屬於明顯回升。`;
    const faq = extractFaq(body);
    expect(faq[0].answer).toBe(
      '根據 疾管署公告，單週門診就診數 破萬，屬於明顯回升。',
    );
  });

  it('extracts <p><strong>Q</strong><br>A</p> Q&A and excludes a trailing 結語', () => {
    const body = `
<h2>常見問題</h2>
<p><strong>MCP 變成標準了，是不是接了就安全？</strong><br>不是。標準解決的是怎麼接，不解決權限誰管。</p>
<p><strong>沒用 MCP 是不是就不用管？</strong><br>不見得，只要有 agent 連內部系統，治理問題一樣存在。</p>
<h2>結語</h2>
<p>標準幫你把門做成同一種規格，沒幫你決定誰拿鑰匙。</p>`;
    const faq = extractFaq(body);
    expect(faq).toHaveLength(2);
    expect(faq[0].question).toBe('MCP 變成標準了，是不是接了就安全？');
    expect(faq[0].answer).toContain('標準解決的是怎麼接');
    expect(faq.some((f) => f.question === '結語')).toBe(false);
  });
});
