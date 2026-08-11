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

**2026-07-31 後續**：已為 appi.news 開專屬 Google Cloud 專案 `appi-news-504107`，服務帳號
`appi-indexing@appi-news-504107.iam.gserviceaccount.com`，金鑰 `~/.config/appi-news/indexing-sa.json`。
設定過程踩到一個順序問題值得記：**建好專案、建好服務帳號、GSC 也加成擁有者之後，若沒有在 Console
「啟用 Indexing API」，publish 會回 403 且訊息是「has not been used in project ... or it is disabled」**，
容易被誤讀成權限問題。判別方式：能取得 access token 就代表金鑰與服務帳號沒問題；403 訊息若提到
`has not been used in project` 是 API 未啟用，若提到 `Failed to verify the URL ownership` 才是 GSC 權限。
Console 裡它的顯示名稱是 **Web Search Indexing API**，搜尋「Indexing API」不一定找得到。

另外 `getMetadata` 對新聞文章回 **404 屬正常**（本篇上半已述：官方只支援 JobPosting/BroadcastEvent），
publish 回 200 就是這條管道能做到的全部，不要拿 404 當設定失敗的證據。

## 2026-08-02 追記：換金鑰只換了一半 —— GSC 靜默斷線兩天

**問題**：`data/seo-daily/2026-08-01.json` 起，`gsc` 區塊只寫得出
`{"error": "User does not have sufficient permission for site 'sc-domain:appi.news'"}`，
連兩天沒有搜尋數據。腳本一樣 exit 0，沒有任何告警（`section()` 設計成單段失敗只記 error、不中斷）。

**原因是兩件事疊在一起：**

1. **舊的共用金鑰 `ga4-insights@yaocare` 對 appi.news 的 GSC 權限沒了。** 實測該帳號的
   `webmasters/v3/sites` 回傳 10 個站（folk.tw、sutta.io、twdro.net、yao.care、arthurs.tw…），
   **就是沒有 appi.news**。GA4 完全不受影響——因為 GA4 的權限是另一套後台給的。
2. **上一則追記建的新金鑰只接了 Indexing API，沒接 GSC**，而且新專案 `appi-news-504107`
   當時只啟用了 `indexing.googleapis.com`，**沒有啟用 `searchconsole.googleapis.com`**。
   所以拿新金鑰去查 GSC 一樣 403，訊息是 `has not been used in project 127174618880`。

**判別 403 的三種面孔**（延續上一則的判別法，這次又多一種）：

| 403 訊息關鍵字 | 真正的問題 | 怎麼修 |
|---|---|---|
| `has not been used in project ... or it is disabled` | 該 GCP 專案沒啟用這個 API | `gcloud services enable <api> --project=<專案>` |
| `Failed to verify the URL ownership` | 服務帳號不是 GSC 擁有者 | GSC 後台加使用者 |
| `User does not have sufficient permission for site` | 服務帳號在該網站**完全沒有身分** | GSC 後台加使用者 |

**處置**：
- 啟用 `searchconsole.googleapis.com`（專案 `appi-news-504107`）。
- GSC／URL 檢查／sitemap／Indexing 全部改走 `~/.config/appi-news/indexing-sa.json`
  （該金鑰在 `sc-domain:appi.news` 是 siteOwner，且只看得到這一站）；
  **GA4 維持 `ga4-sa.json`**——新金鑰在 GA4 沒有任何身分，整包換過去 GA4 會立刻掛掉。
- 程式端：本 repo `scripts/lib/report-config.mjs` 新增 `GSC_SA_KEY_PATH`，
  `weekly-data.mjs`／`gsc-audit.mjs`／`seo-opportunities.mjs` 三支 GSC 消費端改用它；
  seo-ops 側新增選填欄位 `google.gscSaKeyFile`／`google.indexingSaKeyFile`（不填＝沿用 `saKeyFile`）。

**教訓：**

- **服務帳號的授權是「按 Google 產品」給的，不是一包。** 同一把金鑰可以在 GSC 是擁有者、
  在 GA4 什麼都不是、在某個 API 因專案沒啟用而完全不能用。因此「幫某站換一把新金鑰」
  幾乎不會是一次到位的動作——**要逐個 API 驗過**，不能換完就當作好了。
- **驗收要打 API，不要看設定檔。** 金鑰檔存在、路徑正確、程式讀得到，跟「這把金鑰在這個
  API 有權限」是三件不同的事。最短的驗證是 `webmasters/v3/sites` 列出它看得到什麼。
- **站台身分不要寫進共用碼。** seo-ops 是 11 站共用的引擎，金鑰路徑一律留在
  `sites/<站>.json`，共用碼只做「沒設就沿用上一層」的解析，且註解不點名任何站台或 GCP 專案。
- 又一次印證「成功不等於 exit code」：`{"error": ...}` 被安靜寫進資料檔兩天，
  是因為每日收集刻意設計成「單段失敗不影響其他段」。**這個容錯設計是對的，但它需要一個
  對應的告警**——目前沒有，只能靠人讀檔發現（待補）。

## 2026-08-11 追記：檔頭註解承諾了程式沒寫的 fallback

**問題**：在非伺服器環境（Claude Code web session）想確認 GA/GSC 現況，照 `CLAUDE.md`
§查現況 跑 `node scripts/weekly-data.mjs`，直接 `ENOENT: no such file or directory, open
'/root/.config/appi-news/indexing-sa.json'` 中止——**不是 403，是連檔案都沒有就炸了**。

但 `scripts/lib/report-config.mjs` 檔頭在 `INDEXING_SA_KEY_PATH` 與 `GSC_SA_KEY_PATH`
兩處都白紙黑字寫著會 fallback 回 `SA_KEY_PATH`，其中一句還特別保證「**不會因缺檔而整條掛掉**」。

**原因**：那兩個常數只是**字串路徑**的組裝（`process.env.X || 預設路徑`），而真正開檔的
`loadServiceAccount()` 是直球 `readFileSync`。整個 repo 沒有任何 `existsSync` 判斷——
`grep -n existsSync scripts/lib/report-config.mjs scripts/lib/google-data.mjs` 回傳空。
所謂 fallback 從來只存在於註解裡。在伺服器上金鑰都在，這個謊言不會咬人，所以躺了 9 天沒人發現。

**解法**：**改註解、不補 fallback**。因為上一則追記已經確認共用金鑰 `ga4-insights@yaocare`
對 appi.news 的 GSC 完全沒有身分，真的退回去只會把「缺檔」換成更難查的 403——
`ENOENT` 講的是實話而且指名了缺哪一個檔，是比較好的失敗。兩處註解已改為明確寫「沒有 fallback」。

**順帶確立**：離開那台伺服器就讀不到 GA4／GSC（實測拿手邊唯一的
`etn-insights@evidencetoday` 金鑰去打，GA4 property 回 `PERMISSION_DENIED`、
GSC 回 `User does not have sufficient permission for site`——那是別站的金鑰，本來就不該通）。
**此時唯一合法的數據來源是 repo 內的 `data/seo-daily/*.json`**，那是 seo-ops 每日實抓後
commit 進來的，不需金鑰。已寫進 `CLAUDE.md` §查現況與 §數據與網路曝光量、`README.md`
§了解網路曝光量。

**教訓：**

- **註解裡的「不會掛掉」要當作待驗證的宣稱，不是事實。** 容錯行為特別容易被寫進註解卻沒實作，
  因為在健康環境下兩者表現一模一樣，只有在故障當下才會發現差別——而那正是你最不想被騙的時候。
  判準：**宣稱容錯的註解，旁邊要看得到那個 `if`**；看不到就是沒有。
- **「金鑰不在」與「金鑰沒權限」是不同故障，不要用 fallback 把前者變成後者。** 缺檔的錯誤
  訊息會指名檔案路徑，是排錯成本最低的一種失敗；退回一把注定 403 的金鑰只是把它弄糊。
- 又一次同樣的形狀：**這個 repo 的文件裡「會變的東西」不可信，但「不會變的規則」也可能寫錯**。
  `CLAUDE.md` 的鐵則是「數字去跑指令查」，本則補上另一半——**行為描述要去讀那段程式**。
