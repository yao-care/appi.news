# 「有 GSC key 就能催收錄」是誤解：Indexing API 對新聞站非官方

> 摘要：GSC 服務帳號金鑰是唯讀數據身分，沒有「要求建立索引」能力；Indexing API 雖能程式送出，但官方僅支援職缺/活動頁，對新聞文章回 200 也不保證收錄。｜ 範圍：SEO/收錄 ｜ 狀態：已釐清 + 已上自動化（盡力而為）｜ 日期：2026-06-24

對應 SOP：[`docs/SERVER_HANDOFF.md`](../SERVER_HANDOFF.md) §cron 總表（`indexing-submit` 自動送）。

## 問題（症狀）

新文章在 GSC 顯示「**已找到 — 目前尚未建立索引**」「從未檢索」，收錄很慢。直覺以為「我們有 GSC 的服務帳號金鑰，應該能用程式叫 Google 來收錄」。

## 原因（根因）

要分清楚**兩個不同的 API**：

1. **Search Console API**（金鑰設定的 `webmasters.readonly`）：**純讀**——網址檢查、Search Analytics、sitemap。**沒有「要求建立索引」這個方法**；GSC 網頁上那顆按鈕 Google **沒有開放任何 API**，全世界都只能手點。
2. **Indexing API**（`indexing.googleapis.com`，獨立 API）：能程式送 `URL_UPDATED`，但**官方只支援 `JobPosting`／`BroadcastEvent`**。新聞文章送出會回 **HTTP 200（被接受），但 `getMetadata` 查無紀錄（404）** → Google 不見得真的爬/收。且需把服務帳號設為 GSC **擁有者（Owner）**，否則 403「Failed to verify the URL ownership」。

也就是：**「有 key」≠「能催收錄」**；那把 key 是唯讀數據身分。

## 解法（怎麼修 + 現在怎麼維持）

- 釐清後仍接了一條**零人工的盡力管道**：服務帳號加為 GSC 擁有者 → cron 每天把線上 sitemap 的新文章送 Indexing API（`scripts/indexing-submit.mjs` + `scripts/cron/indexing-submit.sh`，帳本去重、配額保護）。
- **但明確定位為「有送有機會」，不是保證。** 真正讓收錄變快的主力是：**sitemap（已自動每天提交、0 錯誤）＋ 持續產內容 ＋ 時間累積網站權重**。沒有任何 API 能跳過新站的信任度養成。

## 怎麼避免重犯 / 相關

- 別再把「催收錄」當成可程式強制的事；報告收錄狀況用 GSC 網址檢查 API（唯讀）實查，不要憑感覺。
- 最重要的少數文章，人工在 GSC 點一次正規「要求建立索引」即可，CP 值高於大批送 Indexing API。
- Claude 本地記憶 `google-indexing-automation` 為此篇的指標摘要。
