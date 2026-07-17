export interface LlmsAuthor {
  name: string;
  title?: string;
  url?: string;
  specialties: string[];
}
export interface LlmsCategory {
  name: string;
  description: string;
  url: string;
}
export interface LlmsArticle {
  title: string;
  url: string;
  description: string;
}

export function buildLlmsTxt(d: {
  name: string;
  tagline: string;
  description: string;
  homeUrl: string;
  fullTxtUrl: string;
  sitemapUrl: string;
  rssUrl: string;
  authors: LlmsAuthor[];
  categories: LlmsCategory[];
  articles: LlmsArticle[];
}): string {
  const lines: string[] = [];
  lines.push(`# ${d.name}｜${d.tagline}`, '');
  lines.push(`> ${d.description}`, '');
  lines.push('## 關於', '');
  lines.push(`${d.name} 是繁體中文的專業觀點平台，結合 AI 輔助寫作、專家審稿與媒體刊登。網站：${d.homeUrl}`, '');
  if (d.authors.length) {
    lines.push('## 作者', '');
    for (const a of d.authors) {
      const title = a.title ? `（${a.title}）` : '';
      const spec = a.specialties.length ? `專長：${a.specialties.join('、')}。` : '';
      const link = a.url ? ` ${a.url}` : '';
      lines.push(`- ${a.name}${title}：${spec}${link}`.trimEnd());
    }
    lines.push('');
  }
  if (d.categories.length) {
    lines.push('## 主題', '');
    for (const c of d.categories) {
      lines.push(`- [${c.name}](${c.url})：${c.description}`);
    }
    lines.push('');
  }
  if (d.articles.length) {
    lines.push('## 重點文章', '');
    for (const a of d.articles) {
      lines.push(`- [${a.title}](${a.url})：${a.description}`);
    }
    lines.push('');
  }
  lines.push('## 授權與引用', '');
  lines.push(
    `本站文字內容採 CC BY 4.0 授權（https://creativecommons.org/licenses/by/4.0/）：歡迎自由引用、轉載、改作與用於 AI 訓練，惟須標示作者、註明來源「${d.name}」並連回原文。圖片為第三方圖庫或 AI 生成，各有授權，不在此列。`,
    '',
  );
  lines.push('## 索引', '');
  lines.push(`- 完整文章索引：${d.fullTxtUrl}`);
  lines.push(`- Sitemap：${d.sitemapUrl}`);
  lines.push(`- RSS：${d.rssUrl}`);
  lines.push('');
  return lines.join('\n');
}

export function buildLlmsFullTxt(d: {
  name: string;
  homeUrl: string;
  articles: {
    title: string;
    url: string;
    date: string;
    category: string;
    description: string;
    highlights: string[];
  }[];
}): string {
  const lines: string[] = [];
  lines.push(`# ${d.name}｜完整文章索引`, '');
  lines.push(`網站：${d.homeUrl}`, '');
  for (const a of d.articles) {
    lines.push(`## ${a.title}`);
    lines.push(`- 網址：${a.url}`);
    lines.push(`- 日期：${a.date}`);
    lines.push(`- 分類：${a.category}`);
    lines.push(`- 描述：${a.description}`);
    if (a.highlights.length) {
      lines.push('- 重點：');
      for (const h of a.highlights) lines.push(`  - ${h}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
