# 配圖真實化系統：拼貼概念圖退場、圖庫審查、圖表規格化

> 摘要：健康類 AI 概念封面「同一女生＋飄浮元素＋色塊拼貼」套版感太重被站長點名，整套配圖邏輯改為「可授權真實照 → 圖庫（過審查）→ 超寫實新聞攝影生成（多樣性輪轉）」；圖表統一 chart-spec 原生 SVG、禁生圖模型 ｜ 範圍：配圖 / 自動化 / 設計 ｜ 狀態：已上線 ｜ 日期：2026-07-22

## 問題（症狀）

1. **封面套版**：健康類概念封面清一色「深藍色塊＋米色圓＋東亞短髮女生＋主題元素飄浮拼貼」（NMN、膠原蛋白等篇幾乎同構圖），一眼 AI 感，不像專業新聞網站。
2. **圖庫張冠李戴風險**：圖庫命中「真實但不相關」或「外國人臉孔」的照片會被直接採用。
3. **圖表醜且不一致**：writer 線 21 張 SVG 資訊圖是置中大標＋框箱＋全紅字的舊模版，甚至殘留外站浮水印（`dreamer868.com`）。

## 原因（根因）

- 生成 prompt 的 `STYLE` 常數寫死「minimalist editorial illustration＋navy palette」＋「把主題元素全列進 prompt」→ 模型必然吐拼貼；無多樣性機制 → 每篇同臉同構圖。
- 圖庫路徑只驗「下載成功、檔案大小」，沒驗內容相關度與臉孔。
- 圖表沒有設計規格，各憑模版生成。

## 解法（怎麼修 + 現在怎麼維持）

**站長裁示的完整優先鏈（封面與內文圖同邏輯）**：
①可授權真實照片（embed 白名單，fail-closed；新增 `*.gov.tw` 政府開放宣告）
→ ②圖庫真實照（**每張候選過 Haiku 審查**：主題相關度＋**外國臉孔一律淘汰**＋歐美場景＋浮水印，`stockPhotoCheck`；fail-open 不阻斷）
→ ③超寫實生成（`generatePhotoRealImage`：新聞攝影記者取景定調＋`PHOTO_ANTI_TEMPLATE` 反拼貼硬條款＋`varietyHints(seed)` 依輸出路徑輪轉構圖/光線/人選/色調）
→ ④全失敗走既有配圖硬性 gate 擋發佈。

**配套紀律**：
- 圖庫照與生成照圖說尾註「（示意圖）」（rehype-figcaption 顯示於圖下）；embed 真實照必署名。
- 生成照**只做通用情境**，嚴禁冒充特定真實事件現場（寫進 writer prompt 嚴禁清單）。
- 圖表一律 [`docs/design/chart-spec.md`](../design/chart-spec.md) 原生 SVG（**禁生圖模型畫圖表**——繁中字與數字必爆）；舊 21 張＋1 張 PNG 已依規格重繪。

## 怎麼避免重犯 / 相關

- 多樣性輪轉是**確定性**的（seed=輸出檔路徑）：同圖重跑可重現、不同篇自然輪開。改池子（`VARIETY_POOLS`）就是調風格的地方，別刪輪轉機制。
- `PHOTO_ANTI_TEMPLATE` 與「禁冒充現場」是機械附加硬條款，別退回「靠模型自覺」。
- 審查全部 fail-open（claude-appi 不可用時放行），維持「只加分、不新增故障點」原則；別改成硬 gate。
- 前一階段脈絡見 [`newsroom-photoreal-people-image-port.md`](./newsroom-photoreal-people-image-port.md)；白名單擴充原則見 `scripts/lib/image-sources.mjs` 檔頭（人工＋法務審核才擴充）。
