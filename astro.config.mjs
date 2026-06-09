// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
    mdx(),
  ],
  output: 'static',
});
