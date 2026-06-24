import { statSync } from 'node:fs';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE } from '@/config/site';
import { articleSlug } from '@/utils/content';
import { url, absoluteUrl } from '@/utils/url';
import type { Article, Author } from '@/utils/content';

const parser = new MarkdownIt({ html: true });

/** 把內文 root-relative 的 /images、/covers 等資產改成絕對網址（feed reader 需要） */
function absolutizeAssets(html: string, site: URL | string | undefined): string {
  if (!site) return html;
  return html.replace(/(src|href)="(\/[^"]*)"/g, (_m, attr, path) => {
    if (path.startsWith('//')) return `${attr}="${path}"`;
    return `${attr}="${absoluteUrl(path, site)}"`;
  });
}

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

/**
 * 封面圖 enclosure（RSS <enclosure>）：給 Google News / 聚合器抓封面用。
 * 只在文章有本地 coverImage 檔時輸出；外部圖床或缺檔一律略過（length 須為實際位元組數）。
 */
function coverEnclosure(a: Article, site: URL | string | undefined) {
  const ci = a.data.coverImage;
  if (!ci) return undefined;
  const rel = ci.replace(/^\/+/, ''); // 'covers/foo.webp'
  const ext = rel.slice(rel.lastIndexOf('.')).toLowerCase();
  const type = MIME[ext];
  if (!type) return undefined;
  try {
    const { size } = statSync(join('public', rel));
    return { url: absoluteUrl(ci, site), length: size, type };
  } catch {
    return undefined; // 外部圖床（http(s)）或檔案不存在 → 不掛 enclosure
  }
}

/** 文章 → RSS item（全文內容＋封面 enclosure）。主 feed 與各分類 feed 共用。 */
export function toRssItems(
  articles: Article[],
  authorMap: Map<string, Author>,
  site: URL | string | undefined,
) {
  return articles.map((a) => {
    const author = authorMap.get(a.data.author);
    const html = sanitizeHtml(parser.render(a.body ?? ''), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      },
    });
    const enclosure = coverEnclosure(a, site);
    return {
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.publishDate,
      link: url(`/articles/${articleSlug(a)}/`),
      categories: a.data.tags,
      author: author?.data.name ?? `${SITE.name} 編輯部`,
      content: absolutizeAssets(html, site),
      ...(enclosure ? { enclosure } : {}),
    };
  });
}
