# 舊 WordPress 日期網址漏接轉址變 404，仍在流失 Google 曝光

> 摘要：11 個舊 `/YYYY/MM/<標題>/` 永久連結回 404，卻仍在拿 Google 曝光（合計約 40，其中一篇排名 6.3）；轉址表只涵蓋一部分日期型網址。｜ 範圍：SEO/轉址 ｜ 狀態：已解決 ｜ 日期：2026-06-24

對應 SOP：轉址表維護於 [`src/redirects.json`](../../src/redirects.json)（`astro.config.mjs` 的 `redirects` 讀它）。

## 問題（症狀）

用 GSC 比對全部 281 個有曝光的頁面 vs 實際 HTTP 狀態，發現 **11 個舊 WordPress 日期型永久連結回 404，卻仍在被 Google 給曝光**（合計約 40 曝光，「保健食品廣告合規」一篇已排到第一頁、排名 6.3）。404 會讓這些既有曝光與排名白白流失。

## 原因（根因）

- WordPress 舊永久連結是 `/YYYY/MM/<中文標題>/` 形式。`src/redirects.json` 原本只涵蓋 **20 筆**日期型網址，其餘**漏接** → 直接 404。
- 其中 4 篇文章後來**改成語意化英文 slug**（如 `functional-food-ad-compliance-ai`），舊中文網址自然對不上。
- **GitHub Pages 是純靜態，無法對任意路徑做伺服器級 301**；Astro 的靜態 `redirects` 只能產 meta-refresh 軟轉址頁。

## 解法（怎麼修 + 現在怎麼維持）

- 逐一查證每個 404 對應的現役文章（6 筆同名中文、4 筆已改英文 slug 比對標題確認、1 筆舊月份分頁導 `/articles/`），補進 `redirects.json`，**目標全部 HEAD 驗證 200**。
- 機制沿用既有 **meta-refresh + `canonical` + `noindex`** 軟轉址——這是 GitHub Pages 靜態站的正解，Google 會當等同永久轉址處理，**不需改架構**。

## 怎麼避免重犯 / 相關

1. **改文章 slug（尤其中文改英文）時，把舊網址加進 `redirects.json`**，否則舊連結與既有曝光會變 404。
2. **定期交叉檢查**：GSC「有曝光的頁面」對一遍 HTTP 狀態，揪出「有曝光卻非 200」的破口（一支腳本即可批量 HEAD 檢查）。
3. 別期待 GitHub Pages 上有真 301；meta-refresh 即時轉址（`content="0"`）+ canonical 是這環境的天花板，夠用。
