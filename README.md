# APPI News｜亞太專業觀點

> Asia-Pacific Press & Insight — 聚集各領域專業作者的觀點媒體，透過新聞、評論、專欄、專題、專訪與深度分析，協助讀者理解重要議題。

以 [Astro](https://astro.build) 建置的靜態專業媒體網站，內容涵蓋焦點、國際、健康（APPI Health）、科技、財經、運動、生活與專欄。

線上：<https://yao-care.github.io/appi.news/>

---

## 維護者必讀

- **效能：[`PERFORMANCE.md`](./PERFORMANCE.md)** — 動到字型、CSS、首頁圖片、全站樣式或 build 流程前**務必先讀**。裡面有當初把效能拖垮的根因與不可重犯的鐵則。
- **規則：[`CLAUDE.md`](./CLAUDE.md)** — 專案開發紀律（pnpm、部署、效能底線）。
- **內容遷移：[`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md)** — 舊 WordPress 內容遷移方式。

---

## 技術架構

- **框架**：Astro 5（`output: 'static'`）
- **套件管理**：**pnpm**（務必；專案有 `pnpm-lock.yaml`，用 npm 會出 `Cannot read properties of null` 錯）
- **內容**：Astro Content Collections（`articles` / `authors` / `columns` / `topics`）
- **字型**：`@fontsource` Noto Sans/Serif TC + Inter，**只用繁中子集進入點**（見 PERFORMANCE.md §1），build 時再子集化
- **搜尋**：Pagefind（build 後產生靜態索引）
- **SEO**：每頁 canonical / OG / Twitter card / JSON-LD（Article、Person、Organization、BreadcrumbList、WebSite）
- **OG 圖**：文章有封面用封面，否則用分類 fallback（`public/og/<category>.png`）
- **部署**：GitHub Actions → GitHub Pages（push 到 `main` 觸發）

---

## 開發

```bash
pnpm install
pnpm dev          # 本地開發 http://localhost:4321/appi.news/
pnpm build        # 產生 dist/（含字型/圖片/CSS 最佳化與 Pagefind 索引）
pnpm preview      # 預覽 build 結果
pnpm test         # 單元測試（vitest）
pnpm generate:og  # 重新產生 OG fallback 圖（需要時才跑，產物已 commit）
```

## Build 流程（重要）

`pnpm build` 實際串起三個階段，**改動前請理解每一步**：

```
prebuild   →  scripts/used-images.mjs            掃文章抽「已用圖庫圖」，供編輯器去重
build      →  astro build                        產生 dist/
postbuild  →  scripts/subset-fonts.mjs           ① 字型子集化 + 首頁迷你字型 + font-display:optional
              scripts/optimize-home-images.mjs   ② 首頁 cover 圖縮為顯示尺寸 webp
              scripts/inline-home-css.mjs        ③ 首頁 critical CSS 內聯、移除 render-blocking link
              pagefind --site dist               產生全文搜尋索引
```

> **這三支 postbuild 腳本是首頁效能達標的關鍵，順序不可換、不可拿掉。** 細節與「不可重犯的坑」見 [`PERFORMANCE.md`](./PERFORMANCE.md)。
> 它們都是冪等的、掃 `dist` 後處理；新文章的字形/圖片每次 build 自動納入。

## 效能驗收

- 用**第三方 PageSpeed Insights（Google 機房）**對**部署後的線上站**量測，**不要**用本機 Lighthouse（會抖、不準）。
- PSI API key 放在 `.env`（已 gitignore）：

  ```bash
  source .env
  U="https%3A%2F%2Fyao-care.github.io%2Fappi.news%2F"
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$U&strategy=mobile&category=performance&key=$PSI_API_KEY"
  ```

- 基準（不可退回）：**desktop 100、mobile 90–100、TBT 0、CLS 0**。

## 上線準則（CI gate）

部署 workflow（`.github/workflows/deploy.yml`）在 build 後設有 gate：

- **內部壞連結（硬性，會擋部署）**：`pnpm check:links` 掃描 `dist/` 所有站內連結，有任何壞連結即 build 失敗、部署退回、不上線。此檢查為 base-path（`/appi.news`）感知。
- **Lighthouse（軟性，不擋部署）**：跑在 CI runner localhost、結果 noisy，僅供參考；**以線上 PSI 為準**。

本地上線前自檢：

```bash
pnpm build && pnpm check:links
```

## 換網域（GitHub 專案頁 → 自訂網域）

目前部署在 `https://yao-care.github.io/appi.news/`。要換成自訂網域 `appi.news`：

1. 編輯 `astro.config.mjs`：
   ```js
   const SITE = 'https://appi.news';
   const BASE = '/';
   ```
2. 在 `public/` 新增 `CNAME` 檔，內容為 `appi.news`
3. 於 DNS 將 `appi.news` 指向 GitHub Pages，並在 repo 設定自訂網域

所有站內連結都透過 `src/utils/url.ts` 的 `url()` / `asset()` 使用 `import.meta.env.BASE_URL`，絕對網址透過 `Astro.site`，因此換網域**不需要逐檔修改**。build 腳本（字型/圖片/CSS）也都是讀 build 後的實際路徑，會自動跟著。

---

## 新增內容

### 新增文章

在 `src/content/articles/` 建立 `.md`（或 `.mdx`）檔，frontmatter 範例：

```yaml
---
title: "文章標題"
slug: "url-slug"
description: "SEO 描述與摘要"
publishDate: "2026-06-09T09:00:00+08:00"
updatedDate: "2026-06-09T09:00:00+08:00"   # 可選
category: "tech"                            # focus/international/health/tech/finance/sports/lifestyle/columns
subcategory: "ai"                           # 可選，須屬於該分類
tags: ["AI", "資料治理"]
author: "appi-editorial"                    # 對應 src/content/authors/ 的檔名
column: "ai-ground-truth"                   # 可選，對應 src/content/columns/
topics: ["drug-repurposing"]                # 可選，對應 src/content/topics/
coverImage: "/images/articles/xxx.jpg"      # 可選，省略則用分類 fallback
coverAlt: "封面替代文字"
status: "published"                         # draft / published / scheduled / archived
featured: true                              # 是否編輯精選
hero: false                                 # 是否首頁主打
sourceType: "editorial"                     # 內容來源：editorial/author/contributor/expert/press-release/sponsored/partner/wire
contentType: "news"                         # 內容型態：news/feature/analysis/column/opinion/interview/research-brief/guide/press-release/sponsored/video/photo-story
disclaimerType: "general"                   # general/medical/financial/legal/sponsored
highlights: ["重點一", "重點二"]            # 可選，顯示為「本文重點」
risksAndLimits: ["風險一"]                  # 可選，醫療/財經建議填寫
references:
  - title: "參考來源標題"
    url: "https://..."
    publisher: "來源單位"
---

正文（Markdown）…
```

> **排程發佈**：`publishDate` 設為未來時間 + `status: scheduled`，文章會在該時間之後由每 6 小時的 GitHub Actions 重建自動上線。

### 新增作者

在 `src/content/authors/` 建立 `<slug>.md`，body 為作者完整介紹。重要欄位：`authorLevel`（contributor/verified/columnist/featured/brand）、`showAuthorPage`（是否產生作者頁）、`showColumnPage`（是否可有專欄頁）。

> 單篇體驗作者不應開啟 `showAuthorPage`；作者頁僅在 `showAuthorPage: true` 時產生，未開啟時文章署名顯示為純文字、不連結。

### 新增專欄 / 專題

分別在 `src/content/columns/` 與 `src/content/topics/` 建立 `.md`。專欄以 `ownerAuthor` 指定主要作者；專題可用 `articles` 手動指定核心文章，或由文章的 `topics` 欄位反向關聯。

### 新增分類 / 子分類

編輯 `src/config/categories.ts`。`category` 為型別約束來源，新增後文章才能使用該 slug。

---

## 目錄結構

```
src/
  config/      site / categories / nav / disclaimers 設定
  content/     articles / authors / columns / topics（內容）
  components/  blocks（區塊元件，含 HeroNetwork）/ ui（基礎元件）/ seo / editor
  layouts/     BaseLayout / PolicyLayout …
  pages/       路由
  styles/      global.css（設計 token + 字型 import）
  utils/       content / url / date / jsonld / hero-network
scripts/
  used-images.mjs          prebuild：抽已用圖庫圖
  subset-fonts.mjs         postbuild ①：字型子集化 + 首頁迷你字型
  optimize-home-images.mjs postbuild ②：首頁圖片縮 webp
  inline-home-css.mjs      postbuild ③：首頁 critical CSS 內聯
  generate-og.mjs          OG fallback 圖
  check-links.mjs          站內壞連結檢查（CI gate）
  migrate_wp.py …          WordPress 內容遷移工具
public/
  og/          OG fallback 圖
  images/      文章圖
  covers/      封面（build 時會另產縮圖 webp）
PERFORMANCE.md   ★ 效能維護鐵則（必讀）
CLAUDE.md        專案開發規則
MIGRATION_NOTES.md  內容遷移
```
