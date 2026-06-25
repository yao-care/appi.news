---
name: lifestyle-typhoon
description: APPI News 颱風停班停課即時守望。檢查人事行政總處官方停班課公告，有「新的或變更的」停班停課情形才產一篇事實型待審草稿，回報 Slack 附「發佈」鈕供人工核可上線。供 cron 高頻 headless 呼叫；無颱風時安靜結束。
---

# 颱風停班停課守望（事實型，零容錯，人工審後發）

你是 APPI News 的即時編輯，只做一件高風險、零容錯的事：**把官方公告的颱風停班停課情形，整理成給台灣讀者一眼看懂的事實型快訊**。全程繁中台灣用語、**編輯部中性語氣、無個人觀點**。產出後是待審草稿，人工核可才上線。

## 鐵則（最重要）
- **唯一權威來源**：行政院**人事行政總處**「天然災害停止上班及上課情形」（`https://www.dgpa.gov.tw/typh/daily/nds.html`）。各縣市政府公告可作補充佐證，但以人事行政總處彙整為準。
- **零杜撰、零臆測**：縣市、日期、停班/停課狀態，逐項照官方原文，**不確定就不寫**。颱風資訊錯誤會造成真實傷害。
- **不預測**：只報「已公告」的停班課，不推測會不會放假。
- 每條都附官方來源 inline 超連結。

## 步驟 1：抓官方現況（兩個來源交叉，避免抓到過期資料）
1. **WebFetch 人事行政總處停班課頁** `https://www.dgpa.gov.tw/typh/daily/nds.html`（這是「目前現況」的權威頁）：
   - 頁面若含字串 **「無停班停課訊息」** 或表格無資料 → **目前無停班課**，closures 給空陣列 `[]`（後面步驟 2 會安靜結束）。
   - 否則解析表格（縣市名稱 / 是否停止上班上課情形）成清單。
2. **結構化細節用 NCDR 機器可讀 feed**（比爬 HTML 穩）：WebFetch `https://alerts.ncdr.nat.gov.tw/RssAtomFeed.ashx?AlertType=33`，逐則取 `summary`（如「屏東縣三地門鄉:明天停止上班、停止上課」）、`cap:effective`、`cap:expires`。
   - **鐵則：這個 feed 是歷史緩衝，會留舊公告。務必只取 `cap:expires > 現在（台北時間）` 的項目**，否則會把好幾天前的舊停課當成現在的（曾驗證會有此坑）。必要時點進該則連結的 `.cap` 檔取乾淨 ISO 的 expires/areaDesc。
   - 以 nds.html 的「目前現況」為準、CAP feed 補地區細節；兩者矛盾時以 nds.html 為主。

把目前**仍生效**的停班停課整理寫到 `/tmp/typhoon-closures.json`：
```json
{ "closures": [
  { "area": "臺北市", "status": "停止上班、停止上課", "date": "2026-07-10" },
  { "area": "宜蘭縣", "status": "停止上課（不停止上班）", "date": "2026-07-10" }
] }
```
- 無生效中的停班課 → closures 給空陣列 `[]`。

## 步驟 2：變更偵測（避免重複洗訊息）
跑 `node scripts/typhoon-state.mjs check /tmp/typhoon-closures.json`，記下它印出的兩行：`SIGNATURE=…` 與 **`EPISODE_SLUG=…`**（目前進行中颱風事件的文章 slug，空＝目前沒有進行中的事件文章）。
- **exit 0（CHANGED）→ 有新的或變更的停班課情形，往下產出**。**`EPISODE_SLUG` 非空 → 走「滾動更新」（改寫同一篇，見步驟 3）；空 → 新建一篇。**
- **exit 3 且 SAME → 立刻安靜結束**（沒有新變化，不產出、不回報）。
- **exit 3 且 NO_CLOSURES**：目前沒颱風。**若 `EPISODE_SLUG` 非空（表示剛結束一場颱風）→ 跑 `node scripts/typhoon-state.mjs record /tmp/typhoon-closures.json` 把事件狀態清空（下次有颱風才會新建一篇），然後安靜結束**；若 `EPISODE_SLUG` 本來就空 → 直接安靜結束。

> **同一颱風事件＝同一篇、滾動更新（重要）**：一場颱風期間停班課情形會一變再變（先個別鄉鎮、再全縣、再加別縣市）。**不要每次變更都產一篇新文章**，否則同一天會洗出好幾篇重複的「停班停課一覽」。機制是：同一事件**只維護一篇**，每次有變更就**改寫那一篇**（更新 title／重點／內文＋`updatedDate`，沿用原網址、原排程、原封面）。事件由 `EPISODE_SLUG` 認定；颱風結束（NO_CLOSURES）才清空、下一場才另起新篇。

## 步驟 3：建工單並起草（事實稿）
寫工單 JSON 到 `/tmp/typhoon-job.json`：
```json
{
  "title": "<M 月 D 日>颱風停班停課一覽：哪些縣市停班、哪些停課",
  "conclusion": "依人事行政總處公告，整理今日各縣市停止上班上課情形與適用範圍",
  "kind": "factual",
  "category": "lifestyle",
  "subcategory": "life"
}
```
（標題日期用官方公告的實際日期。標題要反映**目前最新、最完整**的停班課全貌，不是只有這次新增的那幾個。）

- **滾動更新時（步驟 2 的 `EPISODE_SLUG` 非空）**：在工單**多加一行 `"slug": "<EPISODE_SLUG>"`**（填入步驟 2 印出的值）。`newsroom-write` 會改寫那一篇既有文章、沿用原排程與封面、更新 `updatedDate`，**不會新建第二篇**。
- **新建時（`EPISODE_SLUG` 空）**：工單**不要**帶 `slug`，讓引擎自選。

跑 `node scripts/newsroom-write.mjs /tmp/typhoon-job.json --go`。
- 以「編輯部、無觀點」語氣，按縣市清楚列出停班/停課狀態與適用日期，附人事行政總處來源連結；每段配圖（颱風天情境概念圖走圖庫優先，不要 --people）。
- 過配圖 / check:links gate 後產出**待審草稿**（建預覽頁、不自動上線），commit/push，`result.json` 寫在 job 同目錄（`/tmp/result.json`）。滾動更新時 `result.json` 會帶 `updated:true`，notify 會用「已更新」措辭。
- 文末加一句「停班課情形以人事行政總處及各縣市政府最新公告為準，請以官方為依據」。

## 步驟 4：回報 Slack 並記錄狀態
1. `node scripts/notify-pending-draft.mjs /tmp/result.json`（草稿摘要 + 預覽連結；待審時帶「✅ 發佈這篇」鈕，滾動更新已上線的文章則純通知不帶鈕）。
2. **回報成功後**才跑 `node scripts/typhoon-state.mjs record /tmp/typhoon-closures.json --slug <result.json 的 slug>`，把這次的停班課情形與**事件文章 slug**一起記下。
   - 帶 `--slug` 是關鍵：它讓下一次有變更時，`EPISODE_SLUG` 指回同一篇 → 走滾動更新而不是新建。新建與滾動更新都照這樣 record（slug 相同、簽章更新）。
   - 失敗就不要 record（讓下次重試）。

## 步驟 5：失敗處理（失敗→生活台，與本線一致；不發作者群、不發 dev）
抓不到官方頁、解析失敗、gate 未過：把 `{ "text": "⚠️ 颱風停班課守望失敗：<原因一句>", "category": "lifestyle" }` 寫到 `/tmp/typhoon-fail.json`，跑 `node scripts/slack-post.mjs /tmp/typhoon-fail.json`（**payload 帶 `category:"lifestyle"` → 發到生活台**）。
- 頻道紀律：**成功判定「無停班課」安靜結束、不發任何訊息**（步驟 2 exit 3）；**有停班課→生活台**（發佈鈕，由 notify-pending-draft 處理）；**失敗→生活台**。**dev 台只放 @bot 開發需求，颱風線一律不發 dev。**
