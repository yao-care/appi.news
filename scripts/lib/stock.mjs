// 圖庫搜尋（Unsplash + Pexels）。讀 ~/.config/appi-news/ai-worker.secrets 的金鑰。
// 回傳候選：{source,id,description,photographer,pageUrl,downloadUrl,credit}
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export function stockKeys() {
  const p = join(homedir(), '.config/appi-news/ai-worker.secrets');
  const t = readFileSync(p, 'utf8');
  const get = (k) =>
    (t.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1] || '')
      .trim()
      .replace(/^["']|["']$/g, '');
  return { unsplash: get('UNSPLASH_ACCESS_KEY'), pexels: get('PEXELS_API_KEY') };
}

export async function searchUnsplash(query, key, perPage = 10) {
  if (!key) return [];
  const url = `https://api.unsplash.com/search/photos?per_page=${perPage}&orientation=landscape&content_filter=high&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
  });
  if (!res.ok) return [];
  const d = await res.json();
  return (d.results || []).map((p) => ({
    source: 'unsplash',
    id: p.id,
    description: p.description || p.alt_description || '',
    photographer: p.user?.name || '',
    pageUrl: p.links?.html || '',
    downloadUrl: p.urls?.regular || p.urls?.full || '',
    credit: `Photo by ${p.user?.name || 'Unknown'} on Unsplash`,
  }));
}

export async function searchPexels(query, key, perPage = 10) {
  if (!key) return [];
  const url = `https://api.pexels.com/v1/search?per_page=${perPage}&orientation=landscape&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) return [];
  const d = await res.json();
  return (d.photos || []).map((p) => ({
    source: 'pexels',
    id: String(p.id),
    description: p.alt || '',
    photographer: p.photographer || '',
    pageUrl: p.url || '',
    downloadUrl: p.src?.large2x || p.src?.large || '',
    credit: `Photo by ${p.photographer || 'Unknown'} on Pexels`,
  }));
}

/** 同時搜兩家，回 {unsplash:[],pexels:[]} */
export async function searchStock(query, perPage = 8) {
  const { unsplash, pexels } = stockKeys();
  const [u, p] = await Promise.all([
    searchUnsplash(query, unsplash, perPage),
    searchPexels(query, pexels, perPage),
  ]);
  return { unsplash: u, pexels: p };
}
