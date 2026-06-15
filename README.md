# APPI News｜亞太專業觀點

> Asia-Pacific Press & Insight — 聚集各領域專業作者的觀點媒體，透過新聞、評論、專欄、專題、專訪與深度分析，協助讀者理解重要議題。

以 [Astro](https://astro.build) 建置的靜態專業媒體網站，內容涵蓋焦點、國際、健康（APPI Health）、科技、財經、運動、生活與專欄。

線上：<https://yao-care.github.io/appi.news/>

本檔給**維護者**看（怎麼開發、怎麼新增內容、怎麼上線）。給 AI 代理與開發者的紀律規則在 [`CLAUDE.md`](./CLAUDE.md)。

---

## 維護者必讀

- **效能：[`PERFORMANCE.md`](./PERFORMANCE.md)** — 動字型、CSS、首頁圖片、全站樣式或 build 流程前**務必先讀**。記錄當初把效能拖垮的根因與不可重犯的鐵則。
- **開發紀律：[`CLAUDE.md`](./CLAUDE.md)** — pnpm、動手前驗證、部署、效能底線、內容紀律。
- **內容遷移：[`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md)** — 舊 WordPress 內容遷移工具與對照。

完整文件索引見文末「[文件索引](#文件索引)」。

---

## 技術架構

| 項目 | 內容 |
|---|---|
| 框架 | Astro 5（`output: 'static'`，`trailingSlash: 'always'`） |
| 套件管理 | **pnpm**（必須；有 `pnpm-lock.yaml`，用 npm 會出 `Cannot read properties of null`） |
| 內容 | Astro Content Collections：`articles` / `authors` / `columns` / `topics`（`src/content/`） |
| 整合 | `@astrojs/sitemap`（排除 `/admin`、`/choice`）、`@astrojs/mdx`、`@astrojs/svelte` |
| 字型 | `@fontsource` Noto Sans/Serif TC + Inter，**只用繁中子集進入點**（見 PERFORMANCE.md §1），build 時再子集化 |
| 搜尋 | Pagefind（build 後產生靜態索引） |
| SEO / AEO | 每頁 canonical / OpenGraph / Twitter card / JSON-LD；另出 `llms.txt`、`llms-full.txt`、`robots.txt`、`rss.xml`（全文）。詳見 [AEO / SEO](#aeo--seo) |
| 部署 | GitHub Actions → GitHub Pages（push `main` / 每 6 小時 cron / 手動觸發） |

站名、品牌、OG 預設圖在 `src/config/site.ts`。

---

## 開發

```bash
pnpm install
pnpm dev          # 本地開發 http://localhost:4321/appi.news/
pnpm build        # 產生 dist/（含字型/圖片/CSS 最佳化與 Pagefind 索引）
pnpm preview      # 預覽 build 結果
pnpm test         # 單元測試（vitest）
pnpm check:links  # 站內壞連結檢查（上線硬 gate）
pnpm generate:og  # 重新產生分類 OG fallback 圖（需要時才跑，產物已 commit）
```

### Build 流程（改動前先理解）

`pnpm build` 串起三個階段：

```
prebuild   →  scripts/used-images.mjs            掃文章抽「已用圖庫圖」，供編輯器去重
build      →  astro build                        產生 dist/
postbuild  →  scripts/subset-fonts.mjs           ① 字型子集化 + 首頁迷你字型 + font-display:optional
              scripts/optimize-home-images.mjs   ② 首頁 cover 圖縮成顯示尺寸 webp
              scripts/inline-home-css.mjs        ③ 首頁 critical CSS 內聯、移除 render-blocking link
              pagefind --site dist               產生全文搜尋索引
```

> **postbuild 前三支腳本是首頁效能達標的關鍵，順序不可換、不可拿掉。** 它們冪等、掃 `dist` 後處理，新文章的字形/圖片每次 build 自動納入。細節與「不可重犯的坑」見 [`PERFORMANCE.md`](./PERFORMANCE.md)。

---

## 效能驗收

- 用**第三方 PageSpeed Insights（Google 機房）對部署後線上站**量測，**不要**用本機或 CI 的 Lighthouse（會抖、不準）。
- PSI API key 放 `.env`（已 gitignore）：

  ```bash
  source .env
  U="https%3A%2F%2Fyao-care.github.io%2Fappi.news%2F"
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$U&strategy=mobile&category=performance&key=$PSI_API_KEY"
  ```

- 基準（不可退回）：**desktop 100、mobile 90–100、TBT 0、CLS 0**。
- 內頁（文章頁）目前未套首頁那套去 render-blocking 與圖片縮圖處理，mobile 分數偏低屬已知結構性現象（見 PERFORMANCE.md §5）。

## 上線準則（CI gate）

部署 workflow（`.github/workflows/deploy.yml`）build 後設 gate：

- **站內壞連結（硬性，會擋部署）**：`pnpm check:links` 掃 `dist/` 全站連結，有壞連結即失敗、退回、不上線；base-path（`/appi.news`）感知。
- **Lighthouse（軟性，不擋部署）**：跑在 CI runner localhost、結果 noisy，僅參考；以線上 PSI 為準。

本地上線前自檢：`pnpm build && pnpm check:links`。

## 換網域（GitHub 專案頁 → 自訂網域）

目前部署在 `https://yao-care.github.io/appi.news/`。要換成自訂網域 `appi.news`：

1. 編輯 `astro.config.mjs`：
   ```js
   const SITE = 'https://appi.news';
   const BASE = '/';
   ```
2. 在 `public/` 新增 `CNAME` 檔，內容為 `appi.news`。
3. DNS 將 `appi.news` 指向 GitHub Pages，並在 repo 設定自訂網域。

站內連結都透過 `src/utils/url.ts` 的 `url()` / `asset()` 使用 `import.meta.env.BASE_URL`，絕對網址透過 `Astro.site`，因此換網域**不需逐檔修改**；build 腳本讀 build 後實際路徑，也會自動跟著。

---

## 新增內容

### 新增文章

在 `src/content/articles/` 建立 `.md`（或 `.mdx`）。schema 的唯一準據是 `src/content.config.ts`；以下為現行欄位（**必填**：`title`、`description`、`publishDate`、`category`）：

```yaml
---
title: "文章標題"
slug: "url-slug"                 # 可選；省略則用檔名
description: "SEO 描述與摘要"
publishDate: "2026-06-15T09:00:00+08:00"
updatedDate: "2026-06-15T09:00:00+08:00"   # 可選
category: "tech"                 # focus / international / health / tech / finance / sports / lifestyle / columns
subcategory: "ai"                # 可選，須屬於該分類（見下方分類體系）
tags: ["AI", "資料治理"]          # 建議必填（餵 keywords / RSS / llms 索引）
author: "appi-editorial"         # 對應 src/content/authors/ 檔名；預設 appi-editorial
coAuthors: []                    # 可選
status: "published"              # draft / published / scheduled / archived（預設 published）
sourceType: "editorial"          # editorial / author / contributor / expert / press-release / sponsored / partner / wire
contentType: "news"              # news / feature / analysis / column / opinion / interview / research-brief / guide / press-release / sponsored / video / photo-story
disclaimerType: "general"        # general / medical / financial / legal / sponsored
coverImage: "covers/post-123.webp"   # 可選，相對 public/；省略則用分類 fallback（og/<category>.png）
coverAlt: "封面替代文字"
featured: false                  # 是否編輯精選
hero: false                      # 是否首頁主打
highlights: ["重點一", "重點二"]   # 可選，顯示為「本文重點」
risksAndLimits: ["風險一"]        # 可選，醫療/財經建議填
references:                       # 建議填；每條 url 須真實可連線
  - title: "參考來源標題"
    url: "https://..."
    publisher: "來源單位"
column: "ai-ground-truth"        # 可選，對應 src/content/columns/
topics: ["drug-repurposing"]     # 可選，對應 src/content/topics/
# 審稿/查核（可選）：editor、reviewedBy: []、factCheckedBy: []
---

正文（Markdown）…
```

> **排程發佈**：`publishDate` 設未來時間 + `status: scheduled`，文章會在該時間後由每 6 小時的 GitHub Actions 重建自動上線。
> **內文圖**：直接寫 `<img src="/images/檔名.webp">`，build 時 `rehypeBaseImages` 自動補 base 與 `loading="lazy"`。封面放 `public/covers/`、內文圖放 `public/images/`。

### 用 `/newsroom` 日更（科技類）

`.claude/skills/newsroom/` 是一條 Claude Code skill，引導從選題到上線：議題雷達 → 逐題問答 → 起草（每段配圖、所有資料附 inline 來源並逐條查證可連線、繁中台灣用語、去 AI 腔）→ 本地預覽 → 批次排程。作者人格在 `persona.md`、跨文記憶在 `author-memory.json`。詳見 `.claude/skills/newsroom/SKILL.md`。

### 新增作者

在 `src/content/authors/` 建立 `<slug>.md`，body 為作者介紹。重要欄位：`authorLevel`（contributor / verified / columnist / featured / brand）、`showAuthorPage`（是否產生作者頁）、`showColumnPage`、`socialLinks`、`website`、`emailPublic`、`joinedDate`。

> 單篇體驗作者不應開 `showAuthorPage`；未開時文章署名顯示為純文字、不連結。

### 新增專欄 / 專題

分別在 `src/content/columns/` 與 `src/content/topics/` 建立 `.md`。專欄以 `ownerAuthor` 指定主要作者、`status: active/inactive`、`type: personal/brand/editorial/sponsored`。專題可用 `articles` 手動指定核心文章，或由文章的 `topics` 欄位反向關聯。

### 新增分類 / 子分類

編輯 `src/config/categories.ts`。`CATEGORY_SLUGS` 是 `category` 的型別約束來源，新增 slug 後文章才能使用。

---

## 分類體系

目前 8 個主分類（定義在 `src/config/categories.ts`，唯一事實來源）：

| slug | 中文 | 備註 |
|---|---|---|
| `focus` | 焦點 | |
| `international` | 國際 | |
| `health` | 健康 | 英文名 APPI Health |
| `tech` | 科技 | |
| `finance` | 財經 | |
| `sports` | 運動 | |
| `lifestyle` | 生活 | |
| `columns` | 專欄 | |

每個主分類各有子分類（如 tech 的 `ai` / `security` / `software-products`…）。確切子分類清單以 `categories.ts` 為準。

---

## AEO / SEO

讓 LLM 搜尋（ChatGPT 搜尋、Perplexity、Google AI Overviews 等）更容易正確理解並引用本站：

- **結構化資料**（`src/utils/jsonld.ts`）：`Organization`、`WebSite`、`Article`/`NewsArticle`（完整 Person 作者 + keywords + about）、`BreadcrumbList`、`Person`、文章含「常見問題」H2 時自動產 `FAQPage`。
- **`<head>` meta**（`src/components/seo/SEOHead.astro`）：title、description、author、keywords、canonical（絕對網址）、OpenGraph、Twitter card、`article:published_time`/`modified_time`/`author`。
- **`/llms.txt`、`/llms-full.txt`**（`src/pages/llms*.txt.ts`）：給 AI 的站台導覽與完整文章索引，build 時依現有內容自動產生。
- **`/robots.txt`**（`src/pages/robots.txt.ts`）：明確放行主流 AI 爬蟲（GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等），列 Sitemap。
- **`/rss.xml`**（`src/pages/rss.xml.ts`）：含作者與全文 `content:encoded`（內文資產轉絕對網址）。
- **Sitemap**：`@astrojs/sitemap` 自動產 `/sitemap-index.xml`。

---

## 目錄結構

```
src/
  config/      site / categories / nav / disclaimers 設定（常數）
  content/     articles / authors / columns / topics（內容）
  content.config.ts  ★ 四個 collection 的 zod schema（欄位/enum 唯一事實來源）
  components/  blocks（含 HeroNetwork）/ ui / seo（SEOHead）/ editor
  layouts/     BaseLayout / ChoiceLayout / PolicyLayout
  pages/       路由（index / [category] / articles/[slug] / authors / columns / topics /
               search / rss.xml.ts / robots.txt.ts / llms.txt.ts / llms-full.txt.ts）
  styles/      global.css（design token + 字型 import，僅繁中子集進入點）
  utils/       content / url / date / jsonld / faq / llms / editor / hero-network
scripts/
  used-images.mjs          prebuild：抽已用圖庫圖
  subset-fonts.mjs         postbuild ①：字型子集化 + 首頁迷你字型
  optimize-home-images.mjs postbuild ②：首頁圖片縮 webp
  inline-home-css.mjs      postbuild ③：首頁 critical CSS 內聯
  generate-og.mjs          分類 OG fallback 圖
  check-links.mjs          站內壞連結檢查（CI gate）
  gen-image.mjs            AI 段落/封面生圖（newsroom）→ public/images、public/covers
  regen-covers.mjs         批量重生封面 webp
  lib/ai-image.mjs         生圖共用模組（prompt / webp / img tag）
  *.py                     WordPress 遷移工具（migrate_wp / clean-bodies / recategorize …）
public/
  og/          分類 OG fallback 圖
  images/      內文圖
  covers/      封面（build 時另產縮圖 webp）
.claude/skills/newsroom/   日更引擎 skill（SKILL.md / persona.md / author-memory.json）
docs/          內容規劃與待補清單（見下）
PERFORMANCE.md   ★ 效能維護鐵則（必讀）
CLAUDE.md        AI / 開發者紀律規則
MIGRATION_NOTES.md  WordPress 遷移工具與對照
```

---

## 文件索引

| 文件 | 對象 | 內容 |
|---|---|---|
| [`README.md`](./README.md) | 維護者 | 本檔：開發、新增內容、上線 |
| [`CLAUDE.md`](./CLAUDE.md) | AI / 開發者 | 動手前驗證、效能底線、部署、內容紀律 |
| [`PERFORMANCE.md`](./PERFORMANCE.md) | 全員（改 build/字型/CSS/圖片前必讀） | 效能根因與不可重犯的鐵則 |
| [`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md) | 維護者 | WordPress 遷移工具、欄位/分類對照、遷移統計 |
| [`docs/content-todo.md`](./docs/content-todo.md) | 編輯團隊 | 內容待補清單（缺 references / highlights / 圖等） |
| [`docs/content-plan/`](./docs/content-plan/) | 編輯團隊 | 內容遷移與選題 worklist |
| [`.claude/skills/newsroom/SKILL.md`](./.claude/skills/newsroom/SKILL.md) | AI / 作者 | 日更流程、文風與引用查證規則 |
```
