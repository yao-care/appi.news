// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

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
  markdown: {
    rehypePlugins: [rehypeBaseImages],
  },
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/choice'),
    }),
    mdx(),
  ],
  output: 'static',
  // 關閉資產 base64 內聯，避免字型被內聯回 render-blocking CSS（原本 107KB 內聯字型），
  // 並確保所有 woff2 為獨立檔案，供 scripts/subset-fonts.mjs 於 postbuild 子集化。
  vite: { build: { assetsInlineLimit: 0 } },
});
