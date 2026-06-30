# 舊 WordPress 日期網址漏接轉址變 404，仍在流失 Google 曝光

> 摘要：舊 `/YYYY/MM/<標題>/` 永久連結回 404 仍在拿 Google 曝光；逐條補 `redirects.json` 是快照式、本質補不齊（見 §追記 2026-06-30），最終加 404 頁 client-side 兜底涵蓋長尾。｜ 範圍：SEO/轉址 ｜ 狀態：已解決（兩層轉址）｜ 日期：2026-06-24、2026-06-30

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

## 追記 2026-06-30：為什麼補了還是漏 — 快照式 exact redirect 本質補不齊，加 404 兜底

**症狀**：上面那兩批（PR #76／#83）補完後，GA 仍持續記到舊 `/YYYY/MM/<slug>/` 的 404（`macbook-neo`、`高齡照護…位置在哪`、`當老藥新用走進-ehr…` 等），站長質疑「不是補過了嗎」。

**根因（比漏列更深一層）**：

- `redirects.json` 是**逐條列舉**的 exact-match 轉址表，每次都是照「**當下 GA/GSC 快照**」補。但 Google 會**持續**爬到更多舊網址、外站/NotebookLM 舊連結也會**陸續**帶人打到不同舊 URL — 快照當天沒出現的，永遠不在表裡 → 隔幾天又冒新 404。**用這個方法補幾次都會留尾巴，本質不可能「徹底」。**
- 一個**假象陷阱**：診斷時會以為「GA 把長中文網址截斷了」，因為 redirects.json 的 key 結尾都半截（如「護肝與改/」）。實際**不是 GA 截斷** — 解碼 GSC 的完整 URL，結尾就是「護肝與改/」，是 **WordPress 當初生成中文 slug 時就切短**的。所以 GA/GSC 給的字串就是真 URL，可直接當 redirect key（別被「半截」誤導去亂猜完整網址）。
- 另一個時間窗陷阱：剛補的網址（如 `油甘果…`）在「過去 7 天」仍出現 404，是因為轉址那天還在窗內、含補之前的舊紀錄；**改看「過去 3 天」才是補後真值**。

**解法（兩層，正在用）**：

1. **高價值已知舊網址 → `redirects.json`**（產 meta-refresh + canonical 轉址頁，SEO 正權重靠這層）。
2. **長尾／未列舉／未來才被爬到的 → 404 頁 client-side 兜底**（[`src/pages/404.astro`](../../src/pages/404.astro)）：build 時內嵌全文章 `slug+標題` 索引，落到任何舊型路徑（`/YYYY/MM/<slug>/`、`/appi.news/*` 雙前綴、`/author|category|tag/*`、月份彙整、`page/N`）時，正規化後比對（slug 完全相符 → slug 前綴 → 標題共同前綴≥8 字，僅限明確舊型路徑才做標題模糊比對）自動轉向正確文章；**未知路徑不誤導、照樣顯示 404**。這層一次涵蓋整個長尾，不必再追著 GA 補。

**怎麼驗**：`pnpm build` 後確認 ① 新增的舊網址在 `dist/<old>/index.html` 有 `http-equiv="refresh"` 指向正確 `/articles/`；② `dist/404.html` 內嵌 ARTS 索引；③ 用 node 載入 dist 的 ARTS 跑比對模擬，含「不存在路徑應顯示 404 不轉」的反例。SEO 上兜底是 client-side 軟轉址（權重弱於 redirects.json 的 canonical），所以兩層併用：能列舉的走第 1 層、列不完的靠第 2 層。
