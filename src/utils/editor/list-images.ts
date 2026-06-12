// 列出 repo 既有圖片（public/images、public/covers），給編輯器「圖庫」分頁手動瀏覽用。
// 走 GitHub Contents API（每目錄最多 1000 筆，足夠）。
const OWNER = 'yao-care';
const REPO = 'appi.news';
const IMG_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

export interface RepoImage {
  name: string;
  dir: 'images' | 'covers';
  path: string; // 站內路徑（無 BASE），如 /images/foo.jpg
}

async function listDir(dir: 'images' | 'covers', token: string): Promise<RepoImage[]> {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/public/${dir}?per_page=1000`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) return [];
  const items = (await res.json()) as { name: string; type: string }[];
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i.type === 'file' && IMG_EXT.test(i.name))
    .map((i) => ({ name: i.name, dir, path: `/${dir}/${i.name}` }));
}

/** 列出 covers + images 既有圖；新到舊大致由檔名排序（含時間戳的在後）。 */
export async function listRepoImages(token: string): Promise<RepoImage[]> {
  const [covers, images] = await Promise.all([listDir('covers', token), listDir('images', token)]);
  return [...covers, ...images];
}
