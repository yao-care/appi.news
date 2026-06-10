# APPI News｜亞太專業觀點

> Asia-Pacific Press & Insight — 結合 AI 輔助寫作、專家審稿與媒體刊登的專業觀點平台。

以 [Astro](https://astro.build) 建置的靜態專業媒體網站，內容涵蓋焦點、健康（APPI Health｜亞太醫頭條）、科技、財經、時事、運動、生活與專欄。

## 技術架構

- **框架**：Astro 5（static output）
- **內容**：Astro Content Collections（`articles` / `authors` / `columns` / `topics`）
- **搜尋**：Pagefind（build 後產生靜態索引）
- **SEO**：每頁 canonical / OG / Twitter card / JSON-LD（Article、Person、Organization、BreadcrumbList、WebSite）
- **OG 圖**：文章有封面用封面，否則用分類 fallback（`public/og/<category>.png`）
- **部署**：GitHub Actions → GitHub Pages

## 開發

```bash
pnpm install
pnpm dev          # 本地開發 http://localhost:4321/appi.news/
pnpm build        # 產生 dist/（含 Pagefind 索引）
pnpm preview      # 預覽 build 結果
pnpm generate:og  # 重新產生 OG fallback 圖（需要時才跑，產物已 commit）
```

## 上線準則（CI gate）

部署 workflow（`.github/workflows/deploy.yml`）在 build 後設有 gate：

- **內部壞連結（硬性，會擋部署）**：`pnpm check:links` 掃描 `dist/` 所有站內連結，
  有任何壞連結即 build 失敗、部署退回、不上線。此檢查為 base-path（`/appi.news`）感知。
- **Lighthouse（軟性，不擋部署）**：效能 / SEO / 無障礙 / 最佳實務分數，未達門檻僅警告。

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

所有站內連結都透過 `src/utils/url.ts` 的 `url()` / `asset()` 使用 `import.meta.env.BASE_URL`，
絕對網址透過 `Astro.site`，因此換網域**不需要逐檔修改**。

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
category: "tech"                            # focus/health/tech/finance/society/sports/lifestyle/columns
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
sourceType: "editorial"                     # editorial/contributor/sponsored/press-release/ai-assisted
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

> **排程發佈**：`publishDate` 設為未來時間 + `status: scheduled`，文章會在該時間之後
> 由每 6 小時的 GitHub Actions 重建自動上線。

### 新增作者

在 `src/content/authors/` 建立 `<slug>.md`，body 為作者完整介紹。重要欄位：
`authorLevel`（contributor/verified/columnist/featured/brand）、
`showAuthorPage`（是否產生作者頁）、`showColumnPage`（是否可有專欄頁）。

> 單篇體驗作者不應開啟 `showAuthorPage`；作者頁僅在 `showAuthorPage: true` 時產生，
> 未開啟時文章署名顯示為純文字、不連結。

### 新增專欄 / 專題

分別在 `src/content/columns/` 與 `src/content/topics/` 建立 `.md`。
專欄以 `ownerAuthor` 指定主要作者；專題可用 `articles` 手動指定核心文章，
或由文章的 `topics` 欄位反向關聯。

### 新增分類 / 子分類

編輯 `src/config/categories.ts`。`category` 為型別約束來源，新增後文章才能使用該 slug。

## 內容遷移

舊 WordPress 內容遷移方式見 [`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md)。

## 目錄結構

```
src/
  config/      site / categories / nav / disclaimers 設定
  content/     articles / authors / columns / topics（內容）
  components/  blocks（區塊元件）/ ui（基礎元件）/ seo
  layouts/     BaseLayout / PolicyLayout
  pages/       路由
  utils/       content / url / date / jsonld
public/og/     OG fallback 圖
scripts/       migrate_wp.py / generate-og.mjs
```
