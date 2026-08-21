// postbuild：文章內文中段插入「繼續閱讀」小卡（B4 版位實驗，站長 2026-08-22 裁示啟用）。
//
// 為什麼做在 postbuild 而不是模板/rehype：
//   - 延伸閱讀清單是頁面層算的（relatedArticles()），markdown 編譯期拿不到；
//     在這裡直接抽「同一頁文末延伸閱讀區塊」的前 2 條連結，零邏輯重複、永不漂移。
//   - 純靜態 HTML 改寫＝零 client JS、零 CLS（與 inline-css.mjs 同模式）。
//   - 排在 pagefind 之後跑 → 注入的連結不會汙染站內搜尋索引。
//
// 規則：
//   - 只處理 dist/articles/*/index.html；已含 data-midread 者跳過（冪等）。
//   - 只在「article-body 內的 h2 ≥3」時插在第 3 個 h2 之前（短文不插，避免干擾）。
//   - h2 計數範圍＝article-body 起點 到 第一個文後區塊（expert-note/risks/related）之前，
//     避免把「本文重點」（body 前）與文後 aside 的 h2 算進來。
//   - 樣式在 src/styles/global.css 的 .midread（全 token，遵守設計規範）。
// 驗收：上線後對照 PV/session（pnpm growth:audit），基準與決策條件見 docs/growth-playbook.md §B4。
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/articles';

/** 從整頁 HTML 抽文末延伸閱讀的前 N 條 (href, title)。純函式，供測試。 */
export function extractRelatedLinks(html, n = 2) {
  const sec = html.match(/<section class="related section"[^>]*>[\s\S]*?<h2[^>]*>延伸閱讀<\/h2>[\s\S]*$/);
  const scope = sec ? sec[0] : '';
  const out = [];
  const seen = new Set();
  for (const m of scope.matchAll(/<h3 class="acard-title"[^>]*>\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = m[1];
    const title = m[2].replace(/<[^>]*>/g, '').trim();
    if (!href || seen.has(href) || !title) continue;
    seen.add(href);
    out.push({ href, title });
    if (out.length >= n) break;
  }
  return out;
}

/** 在 article-body 的第 3 個 h2 前插入 aside。插不了回原 html。純函式，供測試。 */
export function injectMidread(html, links) {
  if (!links.length || html.includes('data-midread')) return html;
  const bodyStart = html.search(/<div class="article-body"[^>]*>/);
  if (bodyStart < 0) return html;
  const boundCandidates = ['<aside class="expert-note"', '<aside class="risks"', '<section class="related section"']
    .map((s) => html.indexOf(s, bodyStart)).filter((i) => i > 0);
  const bound = boundCandidates.length ? Math.min(...boundCandidates) : html.length;
  const h2s = [];
  const re = /<h2[\s>]/g;
  re.lastIndex = bodyStart;
  let m;
  while ((m = re.exec(html)) && m.index < bound) h2s.push(m.index);
  if (h2s.length < 3) return html;
  const aside = `<aside class="midread" data-midread><span class="midread-label">繼續閱讀</span><ul>${links
    .map((l) => `<li><a href="${l.href}">${l.title}</a></li>`) .join('')}</ul></aside>`;
  const at = h2s[2];
  return html.slice(0, at) + aside + html.slice(at);
}

function main() {
  if (!existsSync(DIST)) { console.log('insert-midread：無 dist/articles，跳過'); return; }
  let injected = 0, skippedShort = 0, skippedNoRel = 0;
  for (const dir of readdirSync(DIST)) {
    const file = join(DIST, dir, 'index.html');
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    if (html.includes('data-midread')) continue;
    const links = extractRelatedLinks(html);
    if (!links.length) { skippedNoRel++; continue; }
    const next = injectMidread(html, links);
    if (next === html) { skippedShort++; continue; }
    writeFileSync(file, next);
    injected++;
  }
  console.log(`insert-midread：插入 ${injected} 頁；跳過（<3 個 h2）${skippedShort}、（無延伸閱讀）${skippedNoRel}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
