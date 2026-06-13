# APPI News AEO / GEO 強化設計

> 日期：2026-06-14
> 作者：Lightman（CΛ）
> 目標：讓 LLM 搜尋（ChatGPT 搜尋、Perplexity、Google AI Overviews、Claude 等）更容易正確理解並**引用**本站，補齊既有 SEO/結構化資料的缺口。

## 1. 背景

現況盤點（已驗證）顯示本站 AEO 基礎已相當完整：
- `src/pages/robots.txt.ts`（動態 robots，`* Allow`、`Disallow: /admin/`、列 Sitemap）
- `@astrojs/sitemap`（`astro.config.mjs`，排除 /admin、/choice）
- `src/utils/jsonld.ts`：Organization、WebSite（含 SearchAction）、Article/NewsArticle、BreadcrumbList、作者 Person（含 sameAs）、FAQPage（文章含「常見問題」H2 時）
- `src/components/seo/SEOHead.astro`：title、description、canonical（絕對）、OpenGraph、Twitter card、article:published/modified_time、RSS link
- `src/pages/rss.xml.ts`（@astrojs/rss，最新 30 篇）
- 作者頁 `src/pages/authors/[slug].astro`（Person schema + sameAs）
- 絕對網址工具 `src/utils/url.ts`（`url()` / `absoluteUrl()` / `asset()`）

本案是**補缺口式的全面強化**，沿用既有檔案與模式，不重構。

**誠實前提**：被 LLM 引用最大的槓桿是內容權威性與站外被引用，這由 newsroom（真實引用、固定作者、日更、差異化）負責；本案的技術強化是「讓機器更容易正確理解與標註本站」，是加分項，非開關。`llms.txt` 尚非所有引擎採用，但成本低、方向正確。

## 2. 範圍

| 代號 | 項目 | 動到的檔案 |
|------|------|-----------|
| A | `llms.txt` 自動產生 | 新增 `src/pages/llms.txt.ts` |
| B | `llms-full.txt` 完整索引 | 新增 `src/pages/llms-full.txt.ts` |
| C | robots 明確放行 AI 爬蟲 | 改 `src/pages/robots.txt.ts` |
| D | 結構化資料強化 | 改 `src/utils/jsonld.ts`、`src/pages/articles/[slug].astro` |
| E | SEO meta 補強 | 改 `src/components/seo/SEOHead.astro`（必要時 `src/config`） |
| F | RSS 強化 | 改 `src/pages/rss.xml.ts` |
| G | 作者頁 UX | 改 `src/pages/authors/[slug].astro` |
| H | newsroom 連動 | 改 `.claude/skills/newsroom/SKILL.md` |

**排除**：不加 `articleBody` 全文進 JSON-LD（全文已在 HTML，重複且肥大）。不做站外 outreach（非程式範疇）。

## 3. 各元件設計

### A. `llms.txt`（`src/pages/llms.txt.ts`）

Astro endpoint，模式比照 `robots.txt.ts`（`export const GET`），build 時產出 `/llms.txt`。內容為 Markdown（llms.txt 慣例），用 `getPublishedArticles()` 取資料，隨日更自動更新。結構：

```
# APPI News｜亞太專業觀點

> 一句話定位（取 SITE.description）。

## 關於
站台簡介、語言（繁體中文）、作者群定位。

## 作者
CΛ / Lightman：displayTitle、credentials、專長、作者頁網址。
（列出 active 且 showAuthorPage 的作者）

## 主題
分類與專欄清單（名稱 + 網址）。

## 重點文章
近期 N 篇（預設 20）：標題 + 絕對網址 + 一句 description。

## 引用指引
歡迎引用並標注來源「APPI News」與作者名、連結原文。

## 索引
- 完整文章索引：/llms-full.txt
- Sitemap：/sitemap-index.xml
- RSS：/rss.xml
```

全部網址用 `absoluteUrl(...)`。

### B. `llms-full.txt`（`src/pages/llms-full.txt.ts`）

Astro endpoint，產出 `/llms-full.txt`。全部已發佈文章的 Markdown 索引，每篇一段：標題、絕對網址、`publishDate`、`category`、`description`、`highlights`（逐條）。供 LLM 一次取得全站結構與重點。依 `publishDate` 新到舊。

### C. robots 明確放行 AI 爬蟲（`src/pages/robots.txt.ts`）

保留現有 `User-agent: *` / `Allow: /` / `Disallow: /admin/` / `Sitemap:`。在前面**逐一明確列出**並全部放行（保留 `Disallow: /admin/`）：

```
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: CCBot
User-agent: Bytespider
User-agent: Amazonbot
Allow: /
Disallow: /admin/

User-agent: *
Allow: /
Disallow: /admin/

Sitemap: <絕對 sitemap-index.xml>
```

（每個 bot 各自一段 `User-agent:` + `Allow`/`Disallow`，或共用區塊，依 robots 語法正確輸出。）

### D. 結構化資料強化（`src/utils/jsonld.ts` + `articles/[slug].astro`）

`articleLd()` 調整：
- `author` 由 `{name, url}` 展開成**完整 Person**：`@type: Person`、name、url、image（作者 avatar 絕對網址）、jobTitle（displayTitle）、sameAs（socialLinks 的 url）。呼叫端 `articles/[slug].astro` 需把 author 物件（avatar/displayTitle/socialLinks）傳進來。
- 新增 `keywords`：取文章 `tags`（逗號字串或陣列，依 schema.org 慣例）。
- 新增 `about`：取文章 `topics`（對應 Topic 名稱）；無則省略。

維持既有 headline/description/image/datePublished/dateModified/publisher/inLanguage/articleSection/mainEntityOfPage 不變。

### E. SEO meta 補強（`src/components/seo/SEOHead.astro`）

在既有 meta 之外，文章頁補：
- `<meta name="author" content="{authorName}">`
- `<meta property="article:author" content="{作者頁絕對網址}">`（作者有頁時）
- `<meta name="keywords" content="{tags 逗號接}">`（有 tags 時）
- `<meta name="twitter:site">` / `<meta name="twitter:creator">`：若 `SITE` 設定有 Twitter/X 帳號則輸出，**沒有就略**（不硬寫空值）。

這些走 SEOHead 既有的 props 機制（由文章頁傳入 authorName / authorPath / tags）。

### F. RSS 強化（`src/pages/rss.xml.ts`）

每篇 item：
- 新增 `author`：作者顯示名（必要時 `emailPublic (name)` 格式，依 @astrojs/rss 支援）。
- 新增 `content`（@astrojs/rss 的 `content` 欄位 → `<content:encoded>`）：**預設輸出文章全文 HTML**（用既有 render 機制取得 body HTML）。僅當全文導致 build 失敗或時間不可接受時，才退為 description + highlights 摘要，並於實作報告中說明。

維持既有 title/description/pubDate/link/categories。

### G. 作者頁 UX（`src/pages/authors/[slug].astro`）

把 schema 已有、HTML 未呈現的欄位顯示出來，達到人機一致：
- `website`：可點外連（`rel="me"` 有助實體連結）。
- `emailPublic`：顯示為 mailto（作者有填才顯示）。
- `joinedDate`：顯示加入日期。

依既有頁面樣式呈現，不新增設計語言。

### H. newsroom 連動（`.claude/skills/newsroom/SKILL.md`）

於 frontmatter / 文風段補一條：新文章務必填 `tags`（餵 keywords 與 RSS categories）；題目適合時設「常見問題」H2（觸發既有 FAQPage schema）。

## 4. 驗收

- `pnpm build` 成功；`pnpm check:links` 全綠。
- build 後 `dist/llms.txt`、`dist/llms-full.txt` 存在且內容正確（含近期文章絕對網址）。
- `dist/robots.txt` 含各 AI bot 明確區塊與 Sitemap。
- 文章頁 JSON-LD 用 Schema validator / Google Rich Results Test 驗證 Article（含完整 Person author、keywords）無誤。
- RSS 含 author 與 content。
- 作者頁顯示 website/email/joinedDate。
- 效能不退（依 `PERFORMANCE.md`，本案幾乎不影響 render-blocking；llms/robots 為純文字端點）。

## 5. 風險

| 風險 | 緩解 |
|------|------|
| RSS 全文使 feed 過大 / build 變慢 | 以能穩定 build 為準；過大則退為摘要+highlights，或另設 `rss-full.xml`。 |
| llms.txt 未被部分引擎採用 | 成本低、方向正確；不影響既有 SEO，純加分。 |
| 結構化資料改壞既有 schema | 沿用 `jsonld.ts` 既有函式擴充，build 後用 validator 驗證再上。 |
| 作者頁顯示 email 被爬信箱 | 僅顯示 `emailPublic`（作者自願公開欄位）；不公開者不顯示。 |

## 6. 交付項

1. `src/pages/llms.txt.ts`、`src/pages/llms-full.txt.ts`（A、B）
2. `src/pages/robots.txt.ts` 擴充（C）
3. `src/utils/jsonld.ts` + `articles/[slug].astro`：完整 Person author、keywords、about（D）
4. `src/components/seo/SEOHead.astro`：author/article:author/keywords/twitter（E）
5. `src/pages/rss.xml.ts`：author + content（F）
6. `src/pages/authors/[slug].astro`：website/email/joinedDate 呈現（G）
7. `.claude/skills/newsroom/SKILL.md`：tags 與 FAQ 連動（H）
