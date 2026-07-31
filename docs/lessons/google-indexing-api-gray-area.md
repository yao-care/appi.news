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

## 2026-07-31 追記：配額是 per-專案且在太平洋午夜重置，排錯時間等於每天送 0 篇

自動化上線後一年，log 連日出現「⚠ 配額用盡，本次停在 0 篇」，待送從 20 累積到 84，等於這條管道**實質停擺**而沒有人發現（它「成功」執行、exit 0，只是送出 0 篇）。

**兩個原因疊在一起：**

1. **配額在太平洋午夜重置**（夏令 07:00 UTC／冬令 08:00 UTC），而 cron 排在 **06:00 UTC**，也就是重置前一小時，一天中配額最枯竭的時刻。
2. **配額是 200/天、per Google Cloud 專案，不是 per 網站**。同一把服務帳號 `ga4-insights@yaocare`（專案 `yaocare`）被 **folk.tw**（`scripts/index-ping.mjs`，由 `seo-collect-cron.sh` 呼叫）、**sutta.io**、**twdro.net** 共用，它們在太平洋日間先把額度用掉，appi 排在最後就搶不到。

**處置**：cron 從 06:00 改 **07:30 UTC**（重置後），單次即送出積壓的 84 篇、0 失敗、待送歸零。

**教訓**：
- **「配額用盡」不一定是量太大，可能是時間排錯或跟別人共用。** 查之前先確認配額的重置時區與計費邊界（per-專案 vs per-金鑰 vs per-網站）。
- **同一把服務帳號跨站共用，等於把彼此的配額綁在一起。** 這裡是 5 個站共用一個 200/天。要根治得給每站自己的 Google Cloud 專案——**同專案再開一把新金鑰沒有用**，配額算在專案上。
- **這類「成功但沒做事」的故障最難發現**：腳本 exit 0、Slack 沒有告警（設計成「有送才報」），只有讀 log 才看得出來。呼應 `docs/automation-invariants.md`「成功不等於 exit code」。
