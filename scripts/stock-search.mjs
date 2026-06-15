// 用法: node scripts/stock-search.mjs "query" [perPage]
// 印出 JSON 候選（Unsplash + Pexels），供挑選封面用。
import { searchStock } from './lib/stock.mjs';

const query = process.argv[2];
const perPage = Number(process.argv[3] || '6');
if (!query) {
  console.error('need a query');
  process.exit(1);
}
const r = await searchStock(query, perPage);
console.log(JSON.stringify(r, null, 2));
