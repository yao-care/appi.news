// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import yaml from 'js-yaml';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import { rehypeFigcaption } from './src/utils/rehype-figcaption.mjs';

/**
 * 舊 post-NNN 文章網址 → 語意化 slug 的轉址表（由 src/redirects.json 維護）。
 * GitHub Pages 為純靜態、無法回真 301，Astro 於 build 時為每個來源網址產生
 * 一頁 meta-refresh + rel=canonical 的轉址頁，爬蟲與 LLM 皆會跟隨、權重幾乎全傳遞。
 */
const articleRedirects = JSON.parse(
  readFileSync(new URL('./src/redirects.json', import.meta.url), 'utf-8'),
);

/**
 * 排程草稿（status 非 draft/archived、但 publishDate 仍在未來）的網址路徑集合。
 * 這些會由 [slug].astro 產出 noindex 預覽頁供站內預覽＋編輯，但**不可進 sitemap**
 * （否則搜尋引擎會提前發現未公開草稿，破壞「排程＝隱藏」）。與 src/utils/content.ts
 * 的 getScheduledPreviewArticles 同邏輯，這裡於 build 期以純 fs 計算給 sitemap filter 用。
 */
function scheduledPreviewPaths() {
  const dir = new URL('./src/content/articles/', import.meta.url);
  const now = Date.now();
  const paths = new Set();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
    const raw = readFileSync(new URL(f, dir), 'utf-8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    let parsed;
    try {
      parsed = yaml.load(m[1]);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== 'object') continue;
    const d = /** @type {Record<string, any>} */ (parsed);
    if (d.draft || d.status === 'draft' || d.status === 'archived') continue;
    if (!d.publishDate || new Date(d.publishDate).getTime() <= now) continue;
    const slug = d.slug || f.replace(/\.mdx?$/, '');
    paths.add(`/articles/${slug}/`);
  }
  return paths;
}
const previewPaths = scheduledPreviewPaths();

/**
 * 收集每篇已發佈文章的 lastmod（updatedDate ?? publishDate），供 sitemap serialize 用。
 * key 為文章 slug，serialize 時由 URL 的 /articles/<slug>/ 取回對應日期。
 * 排程草稿（publishDate 在未來）不納入（它們本來就被 filter 排除在 sitemap 外）。
 */
function articleLastmods() {
  const dir = new URL('./src/content/articles/', import.meta.url);
  const now = Date.now();
  const map = new Map();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
    const raw = readFileSync(new URL(f, dir), 'utf-8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    let parsed;
    try {
      parsed = yaml.load(m[1]);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== 'object') continue;
    const d = /** @type {Record<string, any>} */ (parsed);
    if (d.draft || d.status === 'draft' || d.status === 'archived') continue;
    if (!d.publishDate) continue;
    const pub = new Date(d.publishDate).getTime();
    if (pub > now) continue; // 排程草稿不進 sitemap
    const slug = d.slug || f.replace(/\.mdx?$/, '');
    const last = d.updatedDate && new Date(d.updatedDate).getTime() > pub ? d.updatedDate : d.publishDate;
    const iso = new Date(last).toISOString();
    map.set(slug, iso);
  }
  return map;
}
const lastmods = articleLastmods();

/**
 * 未達可索引門檻（被少於 TAG_INDEX_MIN 篇文章使用）的標籤頁路徑集合。
 * 這些薄標籤頁在 tags/[slug].astro 仍會產出（掛 noindex，避免文章 TagList 連結 404），
 * 但**不可進 sitemap**（否則等於鼓勵爬蟲抓一堆近乎重複的單篇薄頁、稀釋爬取預算）。
 * 與 src/utils/content.ts 的 TAG_INDEX_MIN / isIndexableTag 同一門檻與 slugify 規則，
 * 這裡於 build 期以純 fs 計算給 sitemap filter 用；改門檻兩邊要同步。
 */
const TAG_INDEX_MIN = 2; // 對齊 src/utils/content.ts 的 TAG_INDEX_MIN
function tagSlugify(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>#%|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
function thinTagPaths() {
  const dir = new URL('./src/content/articles/', import.meta.url);
  const now = Date.now();
  const counts = new Map();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
    const raw = readFileSync(new URL(f, dir), 'utf-8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    let parsed;
    try {
      parsed = yaml.load(m[1]);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== 'object') continue;
    const d = /** @type {Record<string, any>} */ (parsed);
    // 與 getPublishedArticles 同樣的公開判斷：draft/archived 或未到 publishDate 者不計入
    if (d.draft || d.status === 'draft' || d.status === 'archived') continue;
    if (!d.publishDate || new Date(d.publishDate).getTime() > now) continue;
    const tags = Array.isArray(d.tags) ? d.tags : [];
    for (const t of tags) {
      if (typeof t !== 'string') continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  const paths = new Set();
  for (const [tag, count] of counts) {
    if (count < TAG_INDEX_MIN) paths.add(`/tags/${tagSlugify(tag)}/`);
  }
  return paths;
}
const thinTags = thinTagPaths();

/**
 * ── 換網域只需改這裡 ──────────────────────────────────────────────
 * 目前：自訂網域 → https://appi.news/（DNS 已切到 GitHub Pages、public/CNAME 已就位）
 * 若要退回 GitHub 專案頁 https://yao-care.github.io/appi.news/：
 *   1. SITE = 'https://yao-care.github.io'
 *   2. BASE = '/appi.news'
 *   3. 刪除 public/CNAME（並到 repo Pages 設定移除自訂網域）
 * 其餘程式碼皆透過 import.meta.env.BASE_URL / Astro.site 自動跟著變，
 * 不需要逐檔修改。
 * ─────────────────────────────────────────────────────────────────
 */
const SITE = 'https://appi.news';
const BASE = '/';

/**
 * 內文 <img src="/images/…"> 自動補上 base（與 src/utils/url.ts 的 asset() 同邏輯）。
 * 文章 body 透過 <Content/> 以原始 HTML 渲染，不會經過 asset()，故在建置期由此
 * rehype plugin 統一補 base；絕對 URL（http(s)://、//、data:）與已含 base 者一律跳過。
 * 換網域時只改上面的 BASE，body 圖片自動跟著變，無需逐檔修改。
 */
function rehypeBaseImages() {
  const prefix = BASE.replace(/\/+$/, ''); // '/appi.news'（自訂網域時為 ''）
  // 只對 root-relative（/ 開頭、非 //）且尚未含 base 的路徑補 base；絕對 URL 一律不動。
  const fixSrc = (src) =>
    typeof src === 'string' &&
    src.startsWith('/') &&
    !src.startsWith('//') &&
    (!prefix || !src.startsWith(prefix + '/'))
      ? (prefix + src).replace(/\/{2,}/g, '/')
      : src;
  // 為內文 <img> 補上 loading="lazy" / decoding="async"（已存在則不覆寫），降低首屏負擔。
  const addLazyAttrs = (imgTag) => {
    let out = imgTag;
    if (!/\bloading=/.test(out)) out = out.replace(/<img\b/i, '<img loading="lazy"');
    if (!/\bdecoding=/.test(out)) out = out.replace(/<img\b/i, '<img decoding="async"');
    return out;
  };
  const walk = (node) => {
    // 文章 body 多為原始 HTML，在 hast 中是 raw 節點（非 element），需用 regex 處理
    if (node.type === 'raw' && typeof node.value === 'string' && node.value.includes('<img')) {
      node.value = node.value.replace(/<img\b[^>]*>/gi, (tag) =>
        addLazyAttrs(tag.replace(/(\bsrc=")([^"]+)(")/i, (_m, a, src, c) => a + fixSrc(src) + c)),
      );
    }
    // 經 rehype-raw 解析過的 img 走這條（保險）
    if (node.type === 'element' && node.tagName === 'img' && node.properties) {
      node.properties.src = fixSrc(node.properties.src);
      if (node.properties.loading == null) node.properties.loading = 'lazy';
      if (node.properties.decoding == null) node.properties.decoding = 'async';
    }
    if (node.children) node.children.forEach(walk);
  };
  return (tree) => {
    walk(tree);
    return tree;
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  redirects: articleRedirects,
  markdown: {
    // rehypeBaseImages 先補 base/lazy，rehypeFigcaption 再把帶 title 的單圖段落轉成可見圖說。
    rehypePlugins: [rehypeBaseImages, rehypeFigcaption],
  },
  integrations: [
    svelte(),
    sitemap({
      // 排除 admin、排程草稿預覽頁（noindex），以及未達門檻的薄標籤頁（noindex）。
      filter: (page) => {
        if (page.includes('/admin')) return false;
        if ([...previewPaths].some((p) => page.endsWith(p))) return false;
        // 標籤 slug 含 CJK，sitemap 給的 URL 可能是 percent-encoded，解碼後才對得上 thinTags。
        let pathname;
        try {
          pathname = decodeURIComponent(new URL(page).pathname);
        } catch {
          pathname = page;
        }
        if (thinTags.has(pathname)) return false;
        return true;
      },
      // 為文章頁補 lastmod（updatedDate ?? publishDate），幫爬蟲分配抓取預算。
      // 不設 priority/changefreq —— Google 已明說忽略，加了只是雜訊。
      serialize(item) {
        // pathname 對非 ASCII（中文）slug 會是 percent-encoded，需解碼才對得上 map key。
        const m = new URL(item.url).pathname.match(/\/articles\/([^/]+)\/$/);
        const slug = m ? decodeURIComponent(m[1]) : undefined;
        const iso = slug && lastmods.get(slug);
        if (iso) item.lastmod = iso;
        return item;
      },
    }),
    mdx(),
  ],
  output: 'static',
  // 關閉資產 base64 內聯，避免字型被內聯回 render-blocking CSS（原本 107KB 內聯字型），
  // 並確保所有 woff2 為獨立檔案，供 scripts/subset-fonts.mjs 於 postbuild 子集化。
  vite: { build: { assetsInlineLimit: 0 } },
});
