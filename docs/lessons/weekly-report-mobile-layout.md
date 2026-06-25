# 週報 Slack 訊息在手機上排版崩掉、無法閱讀

> 摘要：週報以前由模型每週手刻 Block Kit，把「query｜曝光｜排名｜CTR」四欄塞進一行，手機換行後對不齊、讀不了 ｜ 範圍：自動化/數據呈現 ｜ 狀態：已解決 ｜ 日期：2026-06-25

## 問題（症狀）

作者群每週收到的數據週報，在手機 Slack 上整段擠成一團：搜尋機會、第 2 頁衝刺、改標題候選都是 `標的 | 數字 | 數字 | 0%` 的四欄式單行，手機寬度放不下就硬換行，數字跟標的錯位、欄與欄之間看不出對應關係。站長回報「這樣的排版無法閱讀」。

## 原因（根因）

版面是**模型每週在 SKILL 步驟 4 自由手刻 blocks**——SKILL 只給了一段 ASCII 版面示意，模型每次自行決定怎麼把多欄數據塞進 mrkdwn。結果：

1. 桌機寬螢幕看起來像對齊的表格，到手機窄欄就崩——`|` 分隔的單行天生不適合窄螢幕（Slack mrkdwn 沒有真表格，靠空白/管線假裝對齊一定會在換行時垮掉）。
2. 版面交給模型 = 每週不一致、不可測、無法一次修到位。

## 解法（怎麼修 + 現在怎麼維持）

把**版面從模型手上收回，改成決定論渲染器**：

- 新增 `scripts/lib/weekly-blocks.mjs`（`weeklyReportBlocks(report)`）：吃 weekly-data/seo-opportunities 的原始結構化 JSON，吐手機可讀 blocks。排版鐵則：
  1. **多欄數據一律兩行制**：第一行粗體標的，第二行全形空格縮排後接「曝光 X・排名 Y・CTR Z%」，**永遠不在同一行塞 4 欄**。
  2. **標籤永遠跟著數字**（曝光/排名/CTR/瀏覽），換行也讀得懂。
  3. 路徑用 `code` 包並縮短過長段（保頭尾、中段 …），避免一條 URL 占滿整段。
  - 數字格式（千分位、CTR 分數→百分比、排名四捨五入、中文標籤、WoW 正負號、`null→—`）全在渲染器，模型不碰。
- 新增 `scripts/weekly-report-post.mjs`：讀結構化 payload → 渲染 → 接 `suggestionBlocks` → **固定發作者群**（不走分類路由，免得被第一則 suggestion 的 category 帶走）。
- SKILL 步驟 4 改成：模型只填 `report`（原始數據，欄位名沿用各 script 輸出、不預先格式化）+ 質性一句話 `notes`，**禁止手刻 blocks**，最後跑 `weekly-report-post.mjs`。
- 測試 `scripts/lib/weekly-blocks.test.mjs` 鎖住兩行制、CTR 轉換、中文標籤、3000 字上限等不變式。

## 附帶踩到的坑：Slack 粗體 `*…*（` 會原樣外露

改成緊湊版時，標題寫 `*②b 🎯 第 2 頁衝刺*（補內鏈/補深度可進第一頁）`，發到 Slack 後 `*` 直接以文字出現、沒變粗體。原因：**Slack mrkdwn 只在 closing `*` 後面是「字界」（ASCII 空白、換行、部分半形標點）時才收斂粗體**，緊接全形 `（`／`〔`／全形空格 `　` 都不算字界 → 整段 `*` 當普通字元印出來。

避免：closing `*` 後面**只接 ASCII 空白或換行**，要全形括號就先空一格或改放下一行/notes。渲染器已把區塊標題的冗長括號說明拔掉（順便緊湊），質性說明一律走 context 小灰字。回歸測試 `weekly-blocks.test.mjs` 用 regex `/\*[^*\n]+\*[（）〔〕「」　·]/` 掃所有區塊文字，命中即 fail。

> 自己在本機 `console.log` 把 blocks 文字串接起來看**驗不出這個坑**（沒過 Slack 解析器）；要嘛實發到 dev 頻道，要嘛靠上面那條 regex 測試。

## 怎麼避免重犯 / 相關

- **呈現給人看的多欄數據，版面要走決定論渲染器，不要讓模型每次手刻**——手刻=不一致+手機崩。要改版面改 `weekly-blocks.mjs` 並補測試，不要在 SKILL 塞 ASCII 範本期待模型照做。
- 新增數據區塊：在 `report` 加原始欄位 + 在渲染器加一段 section（沿用兩行制 helper），不要回頭在 SKILL 教模型排版。
- 現行 SOP 在 `.claude/skills/weekly-report/SKILL.md` 步驟 4；頻道路由鐵則見根 `CLAUDE.md` §數據與網路曝光量與記憶 `weekly-report-channel-authors`。
