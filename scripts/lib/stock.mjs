// 圖庫搜尋（Unsplash + Pexels），改走 ai-suggest worker /stock-search。
// worker 持有 UNSPLASH_ACCESS_KEY / PEXELS_API_KEY，本機不再需要 ~/.config/appi-news/ai-worker.secrets。
// 授權同生圖：GitHub repo push 權限（githubToken）。
// 回傳候選：{source,id,description,photographer,pageUrl,downloadUrl,credit}（結構與舊版相容，下游不需改）。
import { AI_WORKER, githubToken } from './ai-image.mjs';

const PROVIDER_LABEL = { unsplash: 'Unsplash', pexels: 'Pexels' };

/** worker StockPhoto {id,provider,thumb,full,credit,creditUrl} → 既有候選結構。 */
function toCandidate(p) {
  const label = PROVIDER_LABEL[p.provider] || p.provider;
  return {
    source: p.provider,
    id: p.id,
    description: '',
    photographer: p.credit || '',
    pageUrl: p.creditUrl || '',
    downloadUrl: p.full || '',
    credit: `Photo by ${p.credit || 'Unknown'} on ${label}`,
  };
}

/** 同時搜兩家（經 worker），回 {unsplash:[],pexels:[]}。失敗則 throw（呼叫端負責退回 AI 生成）。 */
export async function searchStock(query, perPage = 8) {
  const token = githubToken();
  if (!token) throw new Error('無 GitHub token（worker 圖庫搜尋需 repo push 權限）');
  const res = await fetch(`${AI_WORKER}/stock-search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, perPage }),
  });
  if (!res.ok) throw new Error(`worker /stock-search ${res.status}`);
  const data = await res.json();
  const map = (arr) => (Array.isArray(arr) ? arr.map(toCandidate) : []);
  return { unsplash: map(data.unsplash), pexels: map(data.pexels) };
}
