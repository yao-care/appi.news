# APPI News 專案規則（給 Claude / 開發者）

> 本檔是 **APPI News 專案專屬規則**，疊加在全域 `~/.claude/CLAUDE.md` 之上。衝突時以本檔為準。
> 給「怎麼動這個專案」的人看（AI 代理與開發者）。「怎麼維護、怎麼新增內容」的完整說明在 [`README.md`](./README.md)。

## 技術速覽

- **Astro 5**（`output: 'static'`）+ **pnpm**，部署 GitHub Actions → GitHub Pages：`https://yao-care.github.io/appi.news/`。
- **套件管理一律 pnpm**（有 `pnpm-lock.yaml`；用 npm 會炸 `Cannot read properties of null`）。
- 內容是 **Astro Content Collections**（`src/content/`：`articles` / `authors` / `columns` / `topics`），搜尋用 **Pagefind**。
- 科技類日更靠 `/newsroom` skill（`.claude/skills/newsroom/`）。

## 動手前驗證（禁止猜測）

- 改 schema / 文章欄位前，先看 `src/content.config.ts`（四個 collection 的 zod schema、enum 與預設值的唯一事實來源）。
- 改分類 / 子分類前，先看 `src/config/categories.ts`（`CATEGORY_SLUGS` 是 `category` 的型別約束源；新增 slug 後文章才能用）。
- 連結一律走 `src/utils/url.ts` 的 `url()` / `absoluteUrl()` / `asset()`，**不要逐檔硬寫網址**（換網域才不會散落）。
- 報告現況前先跑 CLI 取得最新結果，不要憑記憶；CLI 輸出直接貼，不要重排成表格。

## 效能鐵則（最重要，違反會崩盤）

**動到字型、CSS、首頁圖片、全站樣式或 build 流程前，必須先讀 [`PERFORMANCE.md`](./PERFORMANCE.md)。**

1. **字型只能用繁中子集進入點**：`@fontsource/noto-*-tc/chinese-traditional-<weight>.css`、`@fontsource/inter/latin-<weight>.css`。**禁止**全腳本進入點（`@fontsource/noto-sans-tc/400.css` 等）；當初就是這樣造成 545 個 `@font-face`、662 KB render-blocking CSS。
2. **不要拿掉或改順序** `package.json` `postbuild` 的串接：`subset-fonts.mjs` → `optimize-home-images.mjs` → `inline-home-css.mjs` → `pagefind`。前三支是首頁拿 100 分的關鍵。
3. **效能驗收用第三方 PSI（Google 機房）對線上站**，不要用本機或 CI 的 Lighthouse（會抖、不準）。PSI key 在 `.env`（已 gitignore）。
4. **基準不可退回**：desktop 100、mobile 90+、TBT 0、CLS 0。改完務必複測。
5. 內頁（文章頁）目前未套首頁那套去 render-blocking 處理，mobile 分數偏低是已知結構性現象，非你的改動造成。要動內頁效能前一樣先讀 `PERFORMANCE.md`。

## 部署與驗收

- 部署設定在 `.github/workflows/deploy.yml`，觸發條件有三：**push 到 `main`**、**每 6 小時 cron**、**手動 `workflow_dispatch`**。
- `status: scheduled` 且 `publishDate` 在未來的文章會被隱藏，到時間後由 6 小時 cron 重建自動上線。
- 上線前自檢：`pnpm build && pnpm check:links`（**站內壞連結是硬性 gate，會擋部署**；Lighthouse 是軟性、僅參考）。
- 驗收以**部署後的線上站**為準，不是本機 `pnpm preview`。
- commit / push 前不需反覆要授權；但**破壞性、對外的動作仍須先確認**。
- **在 `main`（預設分支）上要 commit，先開分支**。
- 注意 `~/.claude/settings.json` 有 deny 規則擋 `git branch -D`、`git push --force` 等；刪已合併分支改用「先刪遠端 → `git fetch --prune` → 小寫 `git branch -d`」。

## 內容紀律（文章產出）

- **全文繁體中文 + 台灣用語**（軟體 / 程式 / 網路 / 演算法 / 人工智慧…），禁中國用語（軟件 / 程序 / 網絡 / 算法 / 人工智能…）。標題、正文、frontmatter 皆適用。
- **去 AI 腔**：禁破折號（`—`/`--`）、禁 AI 套語（「不僅…更…」「值得注意的是」「總而言之」自問自答等）、禁空泛升華與翻譯腔。完整守則見 `.claude/skills/newsroom/SKILL.md` 與 persona。
- **所有資料附 inline 來源超連結**，且**全文每條超連結逐條查證可連線**，不留死連結。
- 日更走 `/newsroom` skill；作者人格與跨文記憶在 `.claude/skills/newsroom/persona.md`、`author-memory.json`。
- 新文必填 `tags`（餵 keywords / RSS / llms 索引）；文章規格與欄位以 `src/content.config.ts` 為唯一準據。

## 真實來源指標（要改什麼，先看哪裡）

| 要動的東西 | 唯一事實來源 |
|---|---|
| 文章/作者/專欄/專題 schema、enum | `src/content.config.ts` |
| 分類 / 子分類 | `src/config/categories.ts` |
| 站名 / 品牌 / OG 預設 | `src/config/site.ts` |
| 網址 / base / 換網域 | `src/utils/url.ts` + `astro.config.mjs`（`SITE` / `BASE`） |
| 效能規則 | `PERFORMANCE.md` |
| 新增內容步驟、架構說明 | `README.md` |
| WordPress 遷移 | `MIGRATION_NOTES.md` |
| 日更流程與作者人格 | `.claude/skills/newsroom/` |
