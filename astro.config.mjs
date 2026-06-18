// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import yaml from 'js-yaml';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

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
    rehypePlugins: [rehypeBaseImages],
  },
  integrations: [
    svelte(),
    sitemap({
      // 排除 admin / choice，以及排程草稿預覽頁（noindex，不可進 sitemap）。
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/choice') &&
        ![...previewPaths].some((p) => page.endsWith(p)),
    }),
    mdx(),
  ],
  output: 'static',
  // 關閉資產 base64 內聯，避免字型被內聯回 render-blocking CSS（原本 107KB 內聯字型），
  // 並確保所有 woff2 為獨立檔案，供 scripts/subset-fonts.mjs 於 postbuild 子集化。
  vite: { build: { assetsInlineLimit: 0 } },
});
