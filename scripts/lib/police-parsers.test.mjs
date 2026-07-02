import { describe, it, expect } from 'vitest';
import * as P from './police-parsers.mjs';

const SITES = ['NewsAspx', 'Tainan', 'Nantou', 'Changhua', 'Matsu', 'NewTaipei', 'HsinchuCity', 'Taitung', 'HsinchuCounty'];

describe('police-parsers barrel', () => {
  it('匯出 9 站的 parseList*/parseDetail* 純函式', () => {
    for (const n of SITES) {
      expect(typeof P[`parseList${n}`], `parseList${n}`).toBe('function');
      expect(typeof P[`parseDetail${n}`], `parseDetail${n}`).toBe('function');
    }
  });

  it('list parser 對空/無關 HTML 回陣列、不丟錯', () => {
    for (const n of SITES) {
      const r = P[`parseList${n}`]('', 'https://x.gov.tw/');
      expect(Array.isArray(r), `parseList${n}('')`).toBe(true);
      const r2 = P[`parseList${n}`]('<html><body>no news here</body></html>', 'https://x.gov.tw/');
      expect(Array.isArray(r2)).toBe(true);
    }
  });

  it('detail parser 對空 HTML 回 {summary} 字串、不丟錯', () => {
    for (const n of SITES) {
      const r = P[`parseDetail${n}`]('');
      expect(typeof r.summary, `parseDetail${n}('')`).toBe('string');
    }
  });

  it('parseListNewsAspx 能從最小 News.aspx 樣本抽出標題/絕對連結/民國年日期', () => {
    const html = `<table><tr>
      <td><a href="News_Content.aspx?n=A&s=ITEM1" title="拾獲皮包警協助尋回失主">拾獲皮包警協助尋回失主</a></td>
      <td>115-07-01</td></tr></table>`;
    const rows = P.parseListNewsAspx(html, 'https://kcpd.kcg.gov.tw/News.aspx?n=A');
    expect(rows.length).toBe(1);
    expect(rows[0].title).toContain('拾獲皮包');
    expect(rows[0].url).toMatch(/^https:\/\/kcpd\.kcg\.gov\.tw\/News_Content\.aspx\?n=A&s=ITEM1$/);
    expect(rows[0].date).toBe('2026-07-01');
  });
});
