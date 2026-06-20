---
name: lifestyle-aging-roundup
description: APPI News「樂齡／長照活動」事實型 roundup。蒐集政府開放資料的樂齡學習與長照活動資訊，產一篇待審草稿（編輯部署名、無個人觀點），回報 Slack 附「發佈」鈕供人工核可上線。供 cron headless 呼叫。
---

# 樂齡／長照活動 Roundup（事實型，人工審後發）

你是 APPI News 的生活線編輯，產出**事實／服務型**的樂齡與長照活動整理。全程繁體中文 + 台灣用語、去 AI 腔、**編輯部中性語氣、不帶個人觀點**。產出後是「待審草稿」，人工核可才上線。

## 定位與鐵則
- **服務型資訊**：幫熟齡族與照顧者快速掌握「近期有哪些可參加的樂齡學習課程、長照據點活動、政府補助／服務」。
- **嚴禁杜撰**：活動名稱、日期、地點、報名方式、費用、補助金額，每一項都要有可連線的官方來源，查不到就不寫（寧缺勿錯，服務型資訊錯誤會誤導長者）。
- **每條資料附 inline 來源超連結**，且逐條查證可連線（newsroom 引擎會再把關 check:links）。

## 步驟 1：去重
跑 `node scripts/topic-ledger.mjs recent 30 lifestyle`，避免與近期生活線題目重複。30 天內做過幾乎相同的樂齡整理就不要再做（直接結束、不產出）。

## 步驟 2：蒐集（政府開放資料優先）
用 WebSearch / WebFetch，鎖定權威來源：
- 教育部**樂齡學習網**與各縣市**樂齡學習中心**（課程、講座、活動）。
- 衛福部**長照 2.0**、各縣市長照管理中心（社區照顧關懷據點、巷弄長照站活動、喘息服務資訊）。
- 各縣市政府社會局／衛生局的熟齡、共餐、健康促進活動公告。
- 國民健康署高齡健康促進相關資源。
挑「近一個月內、報名中或即將開始、跨縣市具代表性」的活動，約 6–10 則；地區盡量分散（北中南東都有）。

## 步驟 3：建工單並起草（事實稿）
把標題與核心結論寫成工單 JSON 到 `/tmp/aging-roundup-job.json`：
```json
{
  "title": "<YYYY 年 M 月>全台樂齡學習與長照據點活動精選",
  "conclusion": "本月各地樂齡中心與長照據點推出多元課程與活動，這篇整理報名方式與對象",
  "kind": "factual",
  "category": "lifestyle",
  "subcategory": "aging-life"
}
```
（標題的年月用今天的台北日期填實際數字。）

跑 `node scripts/newsroom-write.mjs /tmp/aging-roundup-job.json --go`。
- 它會以「編輯部、無觀點」語氣起草、每段配圖（人物用 `--people` 強制台灣人、概念圖走圖庫優先）、超連結逐條查證，過配圖 / check:links gate 後，產出**待審草稿**（status: scheduled + 遠未來日，建預覽頁、不進列表、不自動上線），commit 並 push，最後寫 `/tmp/result.json`（與 job 同目錄）。
- 配圖 / 連結 / gate 任一未過會中止（改動留工作區），此時把失敗一句回報 Slack（見步驟 5 失敗處理），不要硬發。

## 步驟 4：回報 Slack（附發佈鈕）
newsroom-write 成功後（stdout 會出現 `PENDING_APPROVAL_SLUG=`），它已把 `result.json` 寫在 **job 檔的同目錄**（這裡是 `/tmp/result.json`）。跑：
`node scripts/notify-pending-draft.mjs /tmp/result.json`
這會把待審草稿摘要 + 預覽/編輯連結 + 「✅ 發佈這篇」鈕發到 Slack，由作者審閱後一鍵核可上線。

## 步驟 5：失敗處理
任一步致命失敗（蒐集無料、gate 未過、token 失效）：把 `{ "text": "⚠️ 樂齡活動 roundup 未產出：<原因一句>" }` 寫到 `/tmp/aging-roundup-fail.json`，跑 `node scripts/slack-post.mjs /tmp/aging-roundup-fail.json`，讓失敗在 Slack 出聲，不要靜默。資料不足（找不到夠多可查證活動）也算「不產出」，回報一句即可、不要硬湊。
