// 讀 src/content/articles 的 frontmatter，建 { slug: category } 映射，供週報把 /articles/<slug>/
// 瀏覽歸回真實分類。URL slug = frontmatter slug ?? 檔名（對齊 src/utils/content.ts articleSlug）。
// frontmatter 引號不一致（有的 "x" 有的 x），這裡 quote-agnostic 解析。
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ARTICLES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'content', 'articles');

/** 從 frontmatter 文字取單一純量欄位（quote-agnostic），無則回 null。 */
function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:[ \\t]*(.+?)[ \\t]*$`, 'm'));
  if (!m) return null;
  return m[1].replace(/^["']|["']$/g, '').trim() || null;
}

/** 回 { slug: category }；讀不到目錄時回空物件（週報降級成 uncategorized，不致命）。 */
export function loadArticleCategoryMap(dir = ARTICLES_DIR) {
  const map = {};
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return map;
  }
  for (const file of files) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = readFileSync(join(dir, file), 'utf8');
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;
    const category = field(fmMatch[1], 'category');
    if (!category) continue;
    const slug = field(fmMatch[1], 'slug') || file.replace(/\.mdx?$/, '');
    map[slug] = category;
  }
  return map;
}
