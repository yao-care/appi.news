# 對外服務契約：build 產物與 inline script 成了別人的 API

> 摘要：appinews-reader（LINE 官方帳號）靠本站 build 期產出的 `reader-index.json` 取內容、靠文章頁的 beacon 取「真讀」訊號；這兩樣不再只是自家檔案，改欄位會讓對面靜默降級而不是報錯 ｜ 範圍：自動化 / 效能 / 跨服務 ｜ 狀態：已解決 ｜ 日期：2026-08-08

## 問題（症狀）

`/root/my-line-bot-customer` 的 LINE 官方帳號要「一次推一則新聞」，需要本站提供兩樣東西：候選池索引與閱讀量測。兩者都長得像「順手加一支腳本」的小事，但實際上有三個地方會讓人做錯而且**當下看不出來**：

1. 索引若用「全站最新 N 篇」取樣，冷門分類會整個消失（實測 RSS 前 30 篇裡 `focus` 掛零，而 `focus` 正是對面首則版位要用的）。輸出檔看起來完全正常，只是永遠推不到那個分類。
2. 捲動深度若照直覺「在 rAF 裡連續取樣、取最大值」，會被延後載入的圖片騙：早期取樣時 `scrollHeight` 還沒長到最終高度，比例算出來偏高，而「取最大值」讓那個偏高值永久留下。對面拿到的「真讀率」會系統性灌水。
3. 停留計時用 `if (since)` 判斷「計時器在不在跑」。`performance.now()` 在導覽起點附近可以是 0，0 是 falsy → 整段停留被當成沒在計時而漏算。真瀏覽器多半 > 0，所以**手測不會發現**，是寫模擬器跑才炸出來的。

## 原因（根因）

共同根因是「**輸出正確 ≠ 契約正確**」。這兩支的消費者在另一個 repo、另一個服務：

- 索引缺欄位時 reader 的設計是**降級**（缺 `cover_image` 出純文字卡、缺 `reading_time` 該打分項回 null 並重分配權重），不是丟錯。所以這邊改壞了，那邊只會安靜地變笨。
- beacon 送不出去時，對面看到的是「有 serve 事件、沒有 beacon」＝判成秒退。所以量測壞掉會被誤讀成「這篇沒人看」，而不是「量測掛了」。

第 2、3 點則是「效能直覺」與「正確性」打架：rAF 節流是捲動監聽的標準答案，但它預設被量的東西是穩定的；本站文章頁的圖是延後載入的，前提不成立。

## 解法（怎麼修 + 現在怎麼維持）

**契約正本在 `/root/appinews-reader/contracts/`**（`reader-index.schema.json`、`beacon.schema.json`），不是在本 repo。兩支檔頭都指過去了，改欄位要先改那份 schema。

- `src/pages/reader-index.json.ts`：走 Astro endpoint 而非 postbuild 腳本，因為 postbuild 拿不到 content collections，得自己重解 frontmatter 並重寫一份 `isPublic()`——`astro.config.mjs` 已經為了 sitemap filter 維護第二份同邏輯判斷了，不開第三份。候選池＝**各分類最新 40 篇的聯集**，另外機械保證涵蓋每個 featured slug。「當日精選」用 `Intl.DateTimeFormat` 以 `Asia/Taipei` 判日：build 跑在 UTC，用 `getDate()` 會讓台北傍晚發佈的精選整批漏掉。
- `src/components/seo/ReadingBeacon.astro`：捲動全程只記原始 `maxY`（O(1)、不讀 layout、不碰 DOM），**送出當下才用最終文件高度換算一次比例**。這樣既避開上面第 2 點，也讓 rAF 節流變成多餘的。停留計時改用獨立 `running` 旗標，不用時間戳的真值。
- 送出掛 `visibilitychange`(hidden) 與 `pagehide`，**不掛 `beforeunload`**（行動裝置常不觸發）；payload 用 `Blob` + `text/plain` 送 `sendBeacon`——`application/json` 會觸發 CORS preflight，而 preflight 在 pagehide 階段常來不及送出。
- hostname 守門照抄 `Analytics.astro`：`deploy.yml` 會把 dist 複製給 Lighthouse 在 localhost 跑，沒守門的話 CI 與本機 preview 都會往對面端點灌假資料。

**驗證方式**：契約合規用腳本逐條硬驗建置產物（型別、`additionalProperties`、`pattern`、排序、featured 涵蓋），不靠肉眼看 JSON；beacon 行為把**建置後**的 inline script 抽出來丟進 `node:vm` 配假 DOM 跑四個情境（正式網域帶 `#r=`、localhost、無 `#r=`、畸形 short_id）。第 3 點那個 bug 就是這個模擬器抓到的。

## 怎麼避免重犯 / 相關

- **改這兩支任何欄位前先讀契約正本**；本 repo 這兩檔的檔頭都寫了路徑。單方面改＝對面靜默降級。
- **inline script 一律用 `<script is:inline set:html={snippet} />`**，不要用 `define:vars` 包樣板字串（會被當成被丟棄的字串、IIFE 不執行）——`Analytics.astro` 已記過這個坑。
- **`check-design.mjs` 是逐行掃 `src/`、不分 CSS 還是 JS**：snippet 裡出現 `#` 開頭的十六進位色碼或 `rgba(` 就會被判成硬編顏色而 build fail，且豁免清單只准變短。解析 fragment 時先 `location.hash.replace(/^#/, '')` 再比對，別把 `#` 寫進字元類別。
- **文章頁不在 `lighthouserc.json` 的稽核清單裡**（只有 `/`、`/health/`、`/about/`），斷言又全是 warn + `continue-on-error`，所以這類改動的效能回歸 **CI 抓不到**，上線後要照 [`PERFORMANCE.md`](../../PERFORMANCE.md) §3 的 PSI cachebust 手法對文章頁複測 TBT/CLS。
- 相關：[`no-ai-image-batch.md`](./no-ai-image-batch.md)（prompt 講不算數、要機械開關）、[`commit-hygiene-shared-checkout.md`](./commit-hygiene-shared-checkout.md)（共用 checkout 用 pathspec commit）。
