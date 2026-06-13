# APPI News — 專案規則（給 Claude / 維護者）

> 本檔為 **APPI News 專案專屬規則**，疊加在全域 `~/.claude/CLAUDE.md` 之上。
> 衝突時以本檔為準。

## 技術速覽

- Astro 5（`output: 'static'`）+ pnpm；部署 GitHub Actions → GitHub Pages（`https://yao-care.github.io/appi.news/`）。
- 套件管理一律用 **pnpm**（有 `pnpm-lock.yaml`；用 npm 會炸 `Cannot read properties of null`）。
- 內容為 Astro Content Collections（`src/content/`）；搜尋用 Pagefind。

## 效能鐵則（最重要，違反會崩盤）

**動到字型、CSS、首頁圖片、全站樣式或 build 流程前，必須先讀 [`PERFORMANCE.md`](./PERFORMANCE.md)。**

不可重犯的關鍵錯誤與規則（完整說明見 `PERFORMANCE.md`）：

1. **字型只能用繁中子集進入點**：`@fontsource/noto-*-tc/chinese-traditional-<weight>.css`、`@fontsource/inter/latin-<weight>.css`。
   **禁止** import 全腳本進入點（`@fontsource/noto-sans-tc/400.css` 等）——當初就是這樣造成 545 個 `@font-face`、662 KB render-blocking CSS，拖垮效能。
2. **不要拿掉 / 改順序** `package.json` `postbuild` 的三支腳本：`subset-fonts.mjs` → `optimize-home-images.mjs` → `inline-home-css.mjs`。它們是首頁拿 100 分的關鍵。
3. **效能驗收用第三方 PSI（Google 機房），不要用本機 Lighthouse**（本機會抖、分數不準）。PSI key 在 `.env`（已 gitignore）。量測對象是部署後的線上站。
4. 基準不可退回：**desktop 100、mobile 90+，TBT 0、CLS 0**。改完務必複測。

## 驗收與部署

- 驗收以**部署後的 GitHub Pages 線上站為準**，不是本機 `pnpm preview`。改完直接 commit 並 `git push origin HEAD:main` 觸發部署（部署只在 push 到 `main` 觸發）。
- 上線前自檢：`pnpm build && pnpm check:links`（壞連結是硬性 gate，會擋部署）。
- commit / push 前不需反覆要授權；但破壞性、對外的動作仍需先確認。

## 內容與結構

- 新增文章/作者/專欄/分類的方式見 [`README.md`](./README.md)。
- 換網域只改 `astro.config.mjs` 的 `SITE`/`BASE`，連結透過 `src/utils/url.ts` 自動跟著變，勿逐檔硬寫網址。
