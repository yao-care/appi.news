# 字型把效能拖垮：全腳本進入點 → 545 個 @font-face

> 摘要：在 `global.css` import Fontsource「全腳本」進入點，帶進日/韓/西里爾…全部子集，造成 545 個 `@font-face`、662 KB render-blocking CSS。｜ 範圍：字型/效能 ｜ 狀態：已解決 ｜ 日期：2026-06（救回 mobile 90–100 / desktop 100）

對應 SOP：[`PERFORMANCE.md`](../../PERFORMANCE.md) §1（現行 unicode-range 切塊機制）、§2（postbuild 五腳本）。**本篇只講為什麼**，現行做法看 SOP。

## 問題（症狀）

- 首頁效能 **mobile ~57 / desktop ~71**（PSI 第三方量測），FCP/LCP 明顯被拖慢。
- 首頁 `about.*.css` 是 **662 KB 的 render-blocking CSS**，內含 **545 個 `@font-face`**。

## 原因（根因）

`src/styles/global.css` 直接 import 了 Fontsource 的**全腳本**進入點：

```css
@import '@fontsource/noto-sans-tc/400.css';   /* 105 個 @font-face */
@import '@fontsource/noto-serif-tc/700.css';  /* 108 個 @font-face */
```

這些進入點會把**日文、韓文、西里爾、希臘、越南…所有子集**的 `@font-face` 全帶進來。一個繁中媒體站根本用不到那些腳本，卻全部進了首屏關鍵路徑。

> 根本背景：這是**繁體中文媒體站**，最大的效能風險永遠是 **CJK 字型很大** 與 **render-blocking 資源**。

## 解法（怎麼修 + 現在怎麼維持）

最終解是 **unicode-range 切塊子集化**（`scripts/subset-fonts.mjs`，postbuild 全自動）：掃 `dist` 全站實際用字（約 3,483 字）→ 切 18 段 → 每（字重 × 段）子集成一個 woff2（共 90 切片、約 3.1 MB）→ 用帶 `unicode-range` 的 `@font-face`（真實 family 名、`font-display: optional`）取代單體繁中 @font-face。瀏覽器只下載命中切片、切片 URL 全站固定可跨頁快取、檔數不隨文章膨脹。**完整機制與設計決策見 `PERFORMANCE.md` §1-C/§1-D，不在此重述。**

### 中途走過、已廢棄的歧路（別再走）

「**逐頁迷你字型**」：每頁 build 一份只含該頁用字的 woff2。根本性缺陷：

- 檔數 = 頁數 × 字重，隨文章數無限膨脹（曾達 **182 MB+**）。
- 每頁 URL 不同，瀏覽器**無法跨頁快取**。
- build 成本高、難維護。

## 怎麼避免重犯 / 相關

1. **禁止全腳本進入點**：只能用繁中子集進入點（`@fontsource/noto-*-tc/chinese-traditional-<weight>.css`、`@fontsource/inter/latin-<weight>.css`）作為 build 佔位，由 postbuild 切塊。
2. **禁止逐頁迷你字型**：已證實會膨脹且不可跨頁快取。
3. **別留同名 `@font-face` 全量版**：若同一 family 同時存在「全量版」與「切片版」@font-face，Chrome 會**兩份都下載**。現行機制在 postbuild 直接整批替換、不留全量版；未來若手動加回全量 @font-face，務必先確認舊的已移除。
4. 動字型/CSS/build 前先讀 `PERFORMANCE.md`（這是鐵則）。
