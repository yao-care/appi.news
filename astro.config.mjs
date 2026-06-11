// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

/**
 * ── 換網域只需改這裡 ──────────────────────────────────────────────
 * 目前：GitHub 專案頁  → https://yao-care.github.io/appi.news/
 * 未來自訂網域 appi.news：
 *   1. SITE = 'https://appi.news'
 *   2. BASE = '/'
 *   3. 在 public/ 放一個 CNAME 檔，內容為 appi.news（已備好 public/CNAME，
 *      預設被 .gitignore 之外保留；自訂網域時取消註解 astro.config 即可）
 * 其餘程式碼皆透過 import.meta.env.BASE_URL / Astro.site 自動跟著變，
 * 不需要逐檔修改。
 * ─────────────────────────────────────────────────────────────────
 */
const SITE = 'https://yao-care.github.io';
const BASE = '/appi.news';

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
  const walk = (node) => {
    // 文章 body 多為原始 HTML，在 hast 中是 raw 節點（非 element），需用 regex 處理
    if (node.type === 'raw' && typeof node.value === 'string' && node.value.includes('<img')) {
      node.value = node.value.replace(
        /(<img\b[^>]*?\bsrc=")([^"]+)(")/gi,
        (_m, a, src, c) => a + fixSrc(src) + c,
      );
    }
    // 經 rehype-raw 解析過的 img 走這條（保險）
    if (node.type === 'element' && node.tagName === 'img' && node.properties) {
      node.properties.src = fixSrc(node.properties.src);
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
});
