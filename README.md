# APPI News｜亞太專業觀點

> Asia-Pacific Press & Insight — 聚集各領域專業作者的觀點媒體，透過新聞、評論、專欄、專題、專訪與深度分析，協助讀者理解重要議題。

以 [Astro](https://astro.build) 建置的靜態專業媒體網站，內容涵蓋焦點、國際、健康（APPI Health）、科技、財經、運動、生活與專欄。

線上：<https://appi.news/>

本檔給**維護者**看（怎麼開發、怎麼新增內容、怎麼上線）。給 AI 代理與開發者的紀律規則在 [`CLAUDE.md`](./CLAUDE.md)。

---

## 維護情境路由（先決定你在哪一格）

> 本檔（給人）與 [`CLAUDE.md`](./CLAUDE.md)（給 AI/開發者）是**兩個對等入口、內容互相對齊**；不論你讀哪一份，下表都帶你到正確的事實來源（SOT）。入口只負責導航，**操作細節在各 SOT，不在入口重複**。
>
> 🔴 **本檔與所有 SOT 文件都禁止寫死「會變的東西」**（篇數、題數、ID、排程時間、當前分數、存量統計）——一律改成「跑這條指令去查」。規則與門檻（規範）才寫死，歷史數字留在 [`docs/lessons/`](./docs/lessons/)。
> **要查任何現況，直接看 [`CLAUDE.md`](./CLAUDE.md) §查現況 的指令一覽表**（該表是正本，本檔不重複）。

| 你要做的事 | 情境 | 依序讀（事實來源） |
|---|---|---|
| 優化/更新專案本體：效能、版面、schema、build、部署 | 🛠 開發 | [`PERFORMANCE.md`](./PERFORMANCE.md)（動字型/CSS/圖/build 前必讀）→ [`CLAUDE.md`](./CLAUDE.md)（開發紀律）→ 本檔 §開發、§效能驗收、§目錄結構 |
| 手動新增內容：文章、作者、專欄、分類 | ✍ 內容 | 本檔 §新增內容 → `src/content.config.ts`、`src/config/categories.ts`（schema/分類唯一準據） |
| 自動發文：選題雷達 → Slack → 自動產文 → 排程上線 | 🤖 自動化 | 本檔 §自動發文流程（全貌）→ `.claude/skills/tech-radar/`＋`.claude/skills/newsroom/` |
| 了解網路曝光量：流量、搜尋曝光、AI 轉介、週報 | 📊 數據 | 本檔 §了解網路曝光量 → `.claude/skills/weekly-report/SKILL.md` → [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) |
| 讓流量長大：站內導流、存量頁升級、回訪與品牌 | 📈 成長 | [`docs/growth-playbook.md`](./docs/growth-playbook.md)（工作項目＋SOP，先跑 `pnpm growth:audit`）→ 為什麼＝[`docs/lessons/growth-three-gates.md`](./docs/lessons/growth-three-gates.md) |

---

## 維護者必讀

- **效能：[`PERFORMANCE.md`](./PERFORMANCE.md)** — 動字型、CSS、首頁圖片、全站樣式或 build 流程前**務必先讀**：現行做法與不可退回的底線。
- **開發紀律：[`CLAUDE.md`](./CLAUDE.md)** — pnpm、動手前驗證、部署、效能底線、內容紀律。
- **歷史經驗：[`docs/lessons/`](./docs/lessons/)** — 踩過的坑與重大決策（問題→原因→解法）。說明文件遇到「為什麼這樣做」一律連到這裡。
- **內容遷移：[`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md)** — 舊 WordPress 內容遷移工具與對照（2026-06-09 歷史快照）。

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
| 部署 | GitHub Actions → GitHub Pages（**每 15 分鐘排程**／手動 `workflow_dispatch`；**push 不觸發**，見 §上線準則） |

站名、品牌、OG 預設圖在 `src/config/site.ts`。

---

## 開發

```bash
pnpm install
pnpm dev          # 本地開發 http://localhost:4321/
pnpm build        # 產生 dist/（含字型/圖片/CSS 最佳化與 Pagefind 索引）
pnpm preview      # 預覽 build 結果
pnpm test         # 單元測試（vitest）
pnpm check:links  # 站內壞連結檢查（上線硬 gate）
pnpm generate:og  # 重新產生分類 OG fallback 圖（需要時才跑，產物已 commit）
```

### Build 流程（改動前先理解）

`pnpm build` 串起三個階段：

```
prebuild   →  scripts/used-images.mjs              掃文章抽「已用圖庫圖」，供編輯器去重
build      →  astro build                          產生 dist/
postbuild  →  scripts/subset-fonts.mjs             ① 字型子集化 + 首頁迷你字型 + font-display:optional
              scripts/optimize-home-images.mjs     ② 首頁 cover 圖縮成顯示尺寸 webp
              scripts/optimize-article-images.mjs  ③ 內頁文章封面縮成 900px webp
              scripts/inline-css.mjs               ④ 全站 critical CSS 內聯、移除 render-blocking link（排除 choice/admin）
              pagefind --site dist                 產生全文搜尋索引
```

> **postbuild 四支腳本是首頁與內頁效能達標的關鍵，順序不可換、不可拿掉。** 它們冪等、掃 `dist` 後處理，新文章的字形/圖片每次 build 自動納入。細節與「不可重犯的坑」見 [`PERFORMANCE.md`](./PERFORMANCE.md)。

---

## 效能驗收

- 用**第三方 PageSpeed Insights（Google 機房）對部署後線上站**量測，**不要**用本機或 CI 的 Lighthouse（會抖、不準）。
- PSI API key 放 `.env`（已 gitignore）：

  ```bash
  source .env
  U="https%3A%2F%2Fappi.news%2F"
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$U&strategy=mobile&category=performance&key=$PSI_API_KEY"
  ```

- 基準（不可退回）：**desktop 100、mobile 90–100、TBT 0、CLS 0**。
- 內頁（文章頁）現已套用 critical CSS 內聯（`inline-css.mjs`）＋封面縮 webp（`optimize-article-images.mjs`），同 §2 手法已延伸到內頁（見 PERFORMANCE.md §5）。

## 上線準則（CI gate）

> 🔴 **push 不會觸發部署**（2026-08-06 起）。只有**每 15 分鐘的排程**與**手動 `gh workflow run deploy.yml`** 會。
> 排程跑起來會先判斷有沒有變動（`scripts/deploy-needed.mjs`）：上次成功部署後有新 commit、
> 或有排程稿的 `publishDate` 到期，才真的 build；否則幾秒結束、不重傳 artifact。
> **push 完不等於上線**——等排程（實際可能 20–30 分鐘，GitHub 排程常誤點）或自己戳。
> 為什麼這樣改＝[`docs/lessons/deploy-cadence.md`](./docs/lessons/deploy-cadence.md)。

部署 workflow（`.github/workflows/deploy.yml`）build 後設 gate：

- **設計規範 v2（硬性，會擋部署）**：`pnpm build` 先跑 `scripts/check-design.mjs`（`pnpm check:design` 可單獨跑），五條規則見下方「設計規範（v2）」；違規即 build fail，CI 的 `notify-failure` job 會發 Slack 告警要求修正重審。
- **站內壞連結（硬性，會擋部署）**：`pnpm check:links` 掃 `dist/` 全站連結，有壞連結即失敗、退回、不上線；base-path 感知（正式網域 base 為 `/`）。
- **Lighthouse（軟性，不擋部署）**：跑在 CI runner localhost、結果 noisy，僅參考；以線上 PSI 為準。

本地上線前自檢：`pnpm build && pnpm check:links`。

## 設計規範（CI 硬性守門）

`scripts/check-design.mjs` 於 build 前掃 `src/` 下所有 `.css`/`.astro`/`.svelte`，違規即擋：

1. **font-size 禁 px** — 一律用 `var(--text-*)` 字級階梯（正文 ≥18px）。
2. **顏色只准寫在 `src/styles/variables.css`**（oklch 主要＋hex fallback）；其他檔一律 `var(--*)`。
3. **禁 `!important`**。
4. **禁外部 CDN**（fonts.googleapis / cdnjs / unpkg / jsdelivr）；字型自託管（@fontsource）。
5. **css 檔白名單** — `src/` 的 `.css` 只准 `src/styles/` 底下白名單那幾個；元件樣式寫 scoped `<style>` 或進 global.css。（白名單以 `scripts/check-design.mjs` 的 `STYLE_WHITELIST` 為準）

> 遷移期凍結（禁再擴充）：少數既有檔僅豁免「顏色」一條。**清單以 `scripts/check-design.mjs` 的 `LEGACY_COLOR_FILES` 為準**（`sed -n '/LEGACY_COLOR_FILES = new Set(\[/,/^\]);/p' scripts/check-design.mjs`），理由見該檔檔頭。**不要把數量寫進文件**，清一檔就少一個。

## 目前正式網域設定

正式網域為 `https://appi.news/`。對應設定：

- `astro.config.mjs`：`SITE = 'https://appi.news'`、`BASE = '/'`。
- `public/CNAME`：內容為 `appi.news`。
- DNS 已將 `appi.news` 指向 GitHub Pages，並在 repo 設定自訂網域。

> **若要退回 GitHub 專案頁** `https://yao-care.github.io/appi.news/`：
> 1. `astro.config.mjs` 改 `SITE = 'https://yao-care.github.io'`、`BASE = '/appi.news'`。
> 2. 刪除 `public/CNAME`，並到 repo Pages 設定移除自訂網域。

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

> **排程發佈**：`publishDate` 設未來時間 + `status: scheduled`，文章會在該時間**之後的下一次 build** 才上線。注意上線時機取決於 build，不是時鐘——`isPublic()` 比對的是 build 當下的時間，靜態站沒有 runtime 會在 `publishDate` 那一刻自己翻牌。**GitHub Actions 排程每 15 分鐘檢查一次**（`.github/workflows/deploy.yml` 的 `schedule`，實際間隔以該檔為準；push 不會觸發部署），排程會偵測到有排程稿到期而重建，所以上線時間最多落後十幾分鐘，但 GitHub 排程常誤點，實際可能 20–30 分鐘。要**準點**上線就得另外在那一刻觸發一次部署（健康紀念日線就是這樣做的，見下方 §自動發文流程）。細節與取捨見 [`docs/lessons/annual-observance-scheduling.md`](./docs/lessons/annual-observance-scheduling.md)。
> **內文圖**：直接寫 `<img src="/images/檔名.webp">`，build 時 `rehypeBaseImages` 自動補 base 與 `loading="lazy"`。封面放 `public/covers/`、內文圖放 `public/images/`。

### 用 `/newsroom` 日更（科技類）

`.claude/skills/newsroom/` 是一條 Claude Code skill，引導從選題到上線：議題雷達 → 逐題問答 → 起草（每段配圖、所有資料附 inline 來源並逐條查證可連線、繁中台灣用語、去 AI 腔）→ 本地預覽 → 批次排程。作者人格在 `persona.md`、跨文記憶在 `author-memory.json`。詳見 `.claude/skills/newsroom/SKILL.md`。

### 自動發文流程（全貌）

多條產線由 server cron 驅動，**各有各的來源與判準**（完整清單見 [`CLAUDE.md`](./CLAUDE.md) §自動發文 pipeline 與 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md)）。人挑題的那條長這樣：

```
選題雷達（cron）→ 發候選題到 Slack（帶「我要寫這題」按鈕）
  → 作者點按鈕 → slack-actions-server 收事件 → 觸發 scripts/newsroom-write.mjs
  → 起草＋逐段配圖＋連結逐條查證 →（配圖硬性 gate）→ commit → 排程/上線
週末另跑 weekly-report，把曝光數據回饋成下一輪選題（見「了解網路曝光量」）
```

| 元件 | 路徑 / 識別 | 角色 |
|---|---|---|
| 論壇選題雷達 | `scripts/lib/forum-signals.mjs`（純資料）＋`scripts/forum-radar.mjs`＋`scripts/cron/forum-radar.sh` | 掃 PTT 白名單看板 → 跨分類候選 → Slack 各分類台。抓取／政治過濾／去重全是純 node，沒有新熱題就 exit 0、不喚 Claude。看板清單＝`BOARDS`。為什麼＝[`docs/lessons/forum-signals-radar.md`](./docs/lessons/forum-signals-radar.md) |
| 科技選題雷達 | `.claude/skills/tech-radar/`、`scripts/cron/tech-radar.sh` | 只產 tech 候選；排程／模型見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表 |
| 自動產文 | `scripts/newsroom-write.mjs` | headless 起草＋**配圖硬性 gate**（缺封面/內文 0 圖即中止不發），完成寫 `result.json` |
| Slack server | `scripts/slack-actions-server.mjs`、pm2 `appinews-slack-actions` | 收按鈕事件觸發產文，回報摘要/重點/預覽連結 |
| 健康紀念日 | `scripts/lib/health-days.mjs`（年曆表）＋`scripts/health-days.mjs`＋`scripts/cron/health-days{,-publish}.sh` | **日期驅動**（不是題材驅動）：年曆表決定哪天寫什麼，T-2 天抓當年度素材寫成排程稿，當天台北 06:17 由另一支純 shell cron 觸發部署才上線。配圖一律 OpenAI 生圖 |
| 國際寫作前閘門 | `scripts/lib/international-gate.mjs`＋`~/.local/state/appi-news/international-seen.json` | 動用寫作前先便宜地篩掉注定白寫的題：同批同事件去重 → 跨日 seen 帳本 → 一次 Haiku 批次篩選（實測 24→10）。**任何一層壞掉一律 fail-open 全部放行** |
| 發佈隔離 checkout | `/root/appi.news-publisher`（`PUBLISH_ISOLATED=1`） | 自動產文在此跑，每篇 reset 到 `origin/main`，不動開發目錄未提交改動 |

> **改發佈端程式**（`slack-actions-server.mjs` 等）：push → 在 `/root/appi.news-publisher` `git pull` → `pm2 restart appinews-slack-actions`；只 restart 會載到舊碼。
> server 端開機前置（金鑰、cron、claude CLI 登入）見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md)。

### 新增作者

在 `src/content/authors/` 建立 `<slug>.md`，body 為作者介紹。重要欄位：`authorLevel`（contributor / verified / columnist / featured / brand）、`showAuthorPage`（是否產生作者頁）、`showColumnPage`、`socialLinks`、`website`、`emailPublic`、`joinedDate`。

> 單篇體驗作者不應開 `showAuthorPage`；未開時文章署名顯示為純文字、不連結。

### 新增專欄 / 專題

分別在 `src/content/columns/` 與 `src/content/topics/` 建立 `.md`。專欄以 `ownerAuthor` 指定主要作者、`status: active/inactive`、`type: personal/brand/editorial/sponsored`。專題可用 `articles` 手動指定核心文章，或由文章的 `topics` 欄位反向關聯。

### 新增分類 / 子分類

編輯 `src/config/categories.ts`。`CATEGORY_SLUGS` 是 `category` 的型別約束來源，新增 slug 後文章才能使用。

---

## 分類體系

主分類與子分類定義在 `src/config/categories.ts`（唯一事實來源）。**不要把清單抄進文件**——
新增分類時文件一定忘了改。要看目前有哪些，跑：

```bash
node -e 'import("./scripts/lib/verticals.mjs").then(m=>{for(const[k,v]of Object.entries(m.ALL_CATEGORIES))console.log(k.padEnd(14),v.name,"|",v.subcategories.join(" "))})'
```

（`scripts/lib/verticals.mjs` 是 `categories.ts` 的 .mjs 鏡像，供腳本使用；改分類要兩邊同步。）

**哪些分類開放機器自動選題**：`verticals.mjs` 的 `VERTICALS`（是 `ALL_CATEGORIES` 的子集）。
`health` / `finance` / `focus` / `columns` 刻意不在其中——機器不自選這些題；但**事實稿**
（`kind: factual`）可經 Slack 按鈕由真人開單，產待審草稿、人工核可才上線。

---|---|---|
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

## 了解網路曝光量

要看「站台被看見多少」（流量、搜尋曝光、AI 轉介、各分類動能），基礎設施如下。**操作（怎麼跑、金鑰怎麼擺）以 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) 與 `.claude/skills/weekly-report/SKILL.md` 為準，本段只給地圖。**

| 元件 | 路徑 / 識別 | 說明 |
|---|---|---|
| 站上埋點 | `src/components/seo/Analytics.astro`、`SITE.gaId`（`src/config/site.ts`，實際 ID 跑 `grep -n gaId src/config/site.ts` 查） | GA4 gtag，`requestIdleCallback` 延遲載入以保 TBT=0 |
| 數據抓取 | `scripts/weekly-data.mjs`、`scripts/lib/google-data.mjs` | 自簽 JWT 讀 GA4＋GSC，輸出四區塊 JSON（period / articlePerf / searchOpportunities / trafficHealth） |
| 每週數據週報 | `.claude/skills/weekly-report/SKILL.md`、`scripts/cron/weekly-report.sh` | 數據 → 外部熱題雷達 → 建議寫作方向 → 發 Slack；排程見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表 |
| 設定常數 | `scripts/lib/report-config.mjs` | GA4 property、GSC 站台、Slack 一分類一頻道（`CATEGORY_CHANNELS`）、預設頻道、dev 頻道。**實際 ID 一律讀該檔，不抄進文件** |
| 機密金鑰 | `~/.config/appi-news/ga4-sa.json`（GA4/GSC 私鑰）、`~/.config/appi-news/report.env`（Slack token） | **永不進 repo**；從原開發機 `scp` 過來、`chmod 600` |

快速查數據（確認 GA/GSC 讀得到）：

```bash
GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json node scripts/weekly-data.mjs
```

看「流量長不長得起來」（頁面分散度、回訪與品牌搜尋、週線與世代分析）另有一組指令與工作簿：

```bash
pnpm growth:audit        # 三關體檢（GA4＋GSC 實跑）
pnpm growth:lint:all     # 站上文章對成長規則的覆蓋率
```

工作項目與 SOP 見 [`docs/growth-playbook.md`](./docs/growth-playbook.md)，為什麼分這三關見 [`docs/lessons/growth-three-gates.md`](./docs/lessons/growth-three-gates.md)。

> **重要分辨**：週報「AI 轉介點擊」= 真人從 AI 答案點連結進站，**不等於**被 AI 爬蟲抓取/引用（GA 是 client-side JS，AI 爬蟲不跑 JS）。真正的 AEO 被引用量測需另案（自有 CDN 代理，見 [`PERFORMANCE.md`](./PERFORMANCE.md) §6）。報告曝光/流量一律以 `weekly-data.mjs` 實跑輸出為準，**不可憑記憶或估算**。

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
  styles/      variables.css（design token，唯一可寫死顏色）/ global.css（基礎樣式＋字型 import，僅繁中子集進入點）
  utils/       content / url / date / jsonld / faq / llms / editor / hero-network
scripts/
  used-images.mjs          prebuild：抽已用圖庫圖
  subset-fonts.mjs              postbuild ①：字型子集化 + 首頁迷你字型
  optimize-home-images.mjs      postbuild ②：首頁圖片縮 webp
  optimize-article-images.mjs   postbuild ③：內頁封面縮 webp
  inline-css.mjs                postbuild ④：全站 critical CSS 內聯
  generate-og.mjs               分類 OG fallback 圖
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
docs/          lessons/（歷史經驗正本）、SERVER_HANDOFF、內容規劃與待補清單
PERFORMANCE.md   ★ 效能維護鐵則（必讀）
CLAUDE.md        AI / 開發者紀律規則
MIGRATION_NOTES.md  WordPress 遷移工具與對照
```

---

## 文件索引

| 文件 | 對象 | 內容 |
|---|---|---|
| [`README.md`](./README.md) | 維護者（人）｜**對等入口** | 本檔：開發、新增內容、自動發文、曝光量、上線 |
| [`CLAUDE.md`](./CLAUDE.md) | AI / 開發者｜**對等入口** | 維護情境路由、動手前驗證、效能底線、部署、內容紀律 |
| [`PERFORMANCE.md`](./PERFORMANCE.md) | 全員（改 build/字型/CSS/圖片前必讀） | 效能現行做法與不可退回的底線（歷史根因連到 `docs/lessons/`） |
| [`docs/lessons/`](./docs/lessons/) | 全員 | **歷史經驗正本**：踩過的坑與重大決策（問題→原因→解法）；說明文件的「為什麼」都連這裡 |
| [`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md) | 維護者 | WordPress 遷移工具、欄位/分類對照、遷移統計（2026-06-09 歷史紀錄） |
| [`docs/automation-invariants.md`](./docs/automation-invariants.md) | 全員（動任何 cron／自動產文前） | 自動化不可違反規則的單一正本 |
| [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) | server 端 AI/維運 | 自動化在 server 上的開機前置、金鑰擺放、cron、週報＋自動產文操作 |
| [`docs/content-todo.md`](./docs/content-todo.md) | 編輯團隊 | 內容待補清單（缺 references / highlights / 圖等） |
| [`docs/content-plan/`](./docs/content-plan/) | 編輯團隊 | 內容遷移與選題 worklist |
| [`.claude/skills/newsroom/SKILL.md`](./.claude/skills/newsroom/SKILL.md) | AI / 作者 | 日更起草流程、文風與引用查證規則 |
| [`.claude/skills/tech-radar/SKILL.md`](./.claude/skills/tech-radar/SKILL.md) | AI（cron） | 每日科技選題雷達 → Slack 候選清單 |
| [`.claude/skills/weekly-report/SKILL.md`](./.claude/skills/weekly-report/SKILL.md) | AI（cron） | 每週 GA4＋GSC 數據週報 → Slack |
```
