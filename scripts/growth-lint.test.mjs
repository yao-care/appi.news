import { describe, it, expect } from 'vitest';
import { auditArticle } from './growth-lint.mjs';

/** 組一篇最小可測文章：frontmatter + 一段有站內連結的正文。 */
const article = (fm, body = '正文開頭[看這篇有內容的錨文字](/articles/a/)，中段補充，後段再連[另一篇](/articles/b/)。') =>
  `---\n${fm}\n---\n${body}`;

const codes = (raw) => auditArticle(raw, new Set(['a', 'b'])).issues.map((i) => i.code);

describe('G2 主題叢集：topics / column 兩種 YAML 寫法都要認得', () => {
  it('行內陣列 topics: ["x"] 算有填', () => {
    expect(codes(article('title: "測"\ntopics: ["oral-care"]'))).not.toContain('G2-cluster');
  });

  it('多行清單 topics:\\n  - x 算有填', () => {
    expect(codes(article('title: "測"\ntopics:\n  - "oral-care"'))).not.toContain('G2-cluster');
  });

  it('column 有填也算', () => {
    expect(codes(article('title: "測"\ncolumn: "evidence-based-health"'))).not.toContain('G2-cluster');
  });

  it('空陣列不算有填', () => {
    expect(codes(article('title: "測"\ntopics: []'))).toContain('G2-cluster');
  });

  it('兩者皆無才報 G2-cluster', () => {
    expect(codes(article('title: "測"'))).toContain('G2-cluster');
  });
});

describe('G1 站內連結', () => {
  it('零內鏈報 G1-none', () => {
    expect(codes(article('title: "測"\ntopics: ["x"]', '完全沒有站內連結的正文。'))).toContain('G1-none');
  });

  it('HTML 體例的 <a href> 也算站內連結（整段是 <p> 的文章只能這樣寫）', () => {
    const body = '<p>前段說明，見<a href="/articles/a/">這篇有內容的錨</a>。</p>\n<p>後段再連<a href="/articles/b/">另一篇</a>。</p>';
    expect(codes(article('title: "測"\ntopics: ["x"]', body))).not.toContain('G1-none');
  });

  it('HTML 連結一樣會驗 slug 存不存在', () => {
    const body = '<p>正文<a href="/articles/nope/">壞連結</a>。</p>';
    expect(codes(article('title: "測"', body))).toContain('G1-404');
  });

  it('編碼過的中文 slug 要能還原比對', () => {
    const zh = encodeURIComponent('中文標題');
    const codesWith = auditArticle(article('title: "測"', `正文[錨](/articles/${zh}/)與[另一條](/articles/a/)。`), new Set(['中文標題', 'a']))
      .issues.map((i) => i.code);
    expect(codesWith).not.toContain('G1-404');
  });

  it('連到不存在的 slug 報 G1-404', () => {
    expect(codes(article('title: "測"', '正文[錨](/articles/a/)與[壞連結](/articles/nope/)。'))).toContain('G1-404');
  });
});
