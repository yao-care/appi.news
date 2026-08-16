# not_in_channel 不一定是沒被邀——先懷疑設定檔裡的頻道 ID 是錯的

**摘要**：高爾夫線首航對運動台回報炸出 `not_in_channel`，被誤診成「bot 沒被邀進頻道」，
還請站長去 `/invite`。實際上 bot 早在正確頻道裡講話，是 `report-config.mjs` 的
sports 頻道 ID 誤植，而且同一個錯 ID 還散落在測試斷言與 sports-submission worker 的
`wrangler.toml`——投稿收件一直發往一個錯的頻道。

日期：2026-08-17　相關：`scripts/lib/report-config.mjs`、`scripts/lib/report-config.test.mjs`、`workers/sports-submission/`

---

## 問題

高爾夫產線第一次對運動台發 Slack 回報，`chat.postMessage` 回 `not_in_channel`。
文章照常上架（Slack 失敗 fail-soft），只是通知沒送到。

## 原因

`not_in_channel` 的字面意思是「bot 不在**這個 ID 指到的**頻道」，不是「bot 不在
**你以為的那個**頻道」。`CATEGORY_CHANNELS.sports` 寫的 ID 與運動台實際識別碼不符
（來源不可考，研判是建檔時誤植或頻道曾重建），bot 一直在正確頻道裡，程式拿錯 ID 去敲門。

誤診的推理路徑：其他四個分類台都發成功、只有運動台失敗、log 又找不到運動台歷史成功
紀錄（每日輪替，看不到久遠的），三個線索拼成「這頻道從沒被用過、bot 沒被邀」的合理故事。
**漏掉的一步：從頭到尾沒有拿設定檔裡的 ID 跟頻道實際識別碼對過**。站長開頻道詳情一看
ID 就拆穿了。

修的時候又發現同一個錯 ID 共出現在 4 處：`report-config.mjs`（SOT）、
`report-config.test.mjs`（斷言寫死）、`workers/sports-submission/wrangler.toml`
（已部署的 worker 環境變數）、該 worker 的 README 與程式註解。只改 SOT 會讓測試立刻紅，
而 worker 那份要**重新 `wrangler deploy` 才生效**——repo 改了、線上 worker 仍拿舊值。

## 解法

1. 4 處一併改為正確 ID，`pnpm exec vitest run scripts/lib/report-config.test.mjs` 全綠。
2. 補發當日漏掉的回報（沿用產線同一 payload 走 `slack-post.mjs`）。
3. sports-submission worker 需另行重佈署才吃到新值（基礎設施操作，交站長裁示）。

## 怎麼避免重犯

- **`not_in_channel` 的第一步排查是「核對 ID」**：請站長開頻道詳情看識別碼（或用
  `conversations.info`），跟設定檔比對。這一步 30 秒，比「歷史 log 考古＋權限猜測」快得多。
- 頻道 ID 本就有「只改 `report-config.mjs`、不抄進文件」的規矩，但測試斷言與 worker 設定
  這兩處是機械上不得不重複的（測試要驗值、worker 是獨立部署單元）。**改 SOT 時 grep 全
  repo 找同一個 ID**，別只改一處：`grep -rn "<舊ID>" . --include="*.mjs" --include="*.ts" --include="*.toml" --include="*.md"`。
- 對「從沒發過訊的頻道」第一次接線時，別等產線首航才發現——先用 `slack-post.mjs` 丟一則
  測試訊息驗收頻道 ID。
