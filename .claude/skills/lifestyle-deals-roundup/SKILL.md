---
name: lifestyle-deals-roundup
description: APPI News「連假城市優惠」事實型 roundup。臨近國定連假時，整理各縣市交通、景點、住宿、餐飲優惠，產一篇待審草稿（編輯部署名、無個人觀點），回報 Slack 附「發佈」鈕供人工核可上線。供 cron headless 呼叫。
---

# 連假城市優惠 Roundup（事實型，人工審後發）

你是 APPI News 的生活線編輯，在**國定連假前**整理「各縣市可用的優惠」。全程繁體中文 + 台灣用語、去 AI 腔、**編輯部中性語氣、不帶個人觀點**。產出後是「待審草稿」，人工核可才上線。

## 步驟 0：連假觸發判斷（沒連假就不做）
**不要硬編假日日期、也不要自己爬日曆頁**。跑現成 helper（已串行政院人事行政總處 data.gov.tw #14718 辦公日曆表，含補假）：
```
node scripts/tw-holidays.mjs upcoming 10
```
- 輸出 `NONE` → **直接結束**（10 天內無連假，不產出、不回報，避免平日洗訊息）。
- 輸出 JSON（如 `{"name":"中秋節","start":"2026-09-25","end":"2026-09-28","days":4}`）→ 用裡面的 name/start/end 當這篇的連假名稱與日期。

## 步驟 1：去重
跑 `node scripts/topic-ledger.mjs recent 30 lifestyle`。同一個連假若已做過優惠整理就不要重做（直接結束）。

## 步驟 2：蒐集優惠（可查證、官方公告優先）
用 WebSearch / WebFetch，針對這個連假蒐集**真實、可連線、效期涵蓋連假**的優惠，分兩級：
- **骨幹（高信度，務必先收）**：台灣高鐵「疏運公告」、台鐵「各假期開放訂票期程」官方頁——每連假都有單篇、班次/開賣日/效期白紙黑字，最可靠。
- **補充（每縣市現搜、查證後才收）**：交通部觀光署活動、各縣市政府觀光單位官方公告、國家風景區/公立場館優惠或免費入園。**只收有官方公告頁、效期明確的；查不到官方頁或只有二手轉述（部落格/媒體懶人包）就略過，不硬湊。**
依城市分區整理（北中南東），每區挑幾則代表性、效期明確的。

## 步驟 3：建工單並起草（事實稿）
寫工單 JSON 到 `/tmp/deals-roundup-job.json`：
```json
{
  "title": "<連假名稱與日期>各縣市優惠整理：交通、景點、住宿一次看",
  "conclusion": "這個連假全台各地推出交通與景點優惠，這篇按城市整理效期與使用方式",
  "kind": "factual",
  "category": "lifestyle",
  "subcategory": "consumer"
}
```
（標題用步驟 0 查到的實際連假名稱與日期。）

跑 `node scripts/newsroom-write.mjs /tmp/deals-roundup-job.json --go`。
- 它會以「編輯部、無觀點」語氣起草、每段配圖、超連結逐條查證，過 gate 後產出**待審草稿**（建預覽頁、不自動上線），commit/push，並把 `result.json` 寫在 job 同目錄（`/tmp/result.json`）。
- **效期提醒**：起草時務必在每則優惠標注效期，並在文末加一句「優惠內容與效期以各官方公告為準，出發前請再確認」。

## 步驟 4：回報 Slack（附發佈鈕）
newsroom-write 成功後（stdout 出現 `PENDING_APPROVAL_SLUG=`），跑：
`node scripts/notify-pending-draft.mjs /tmp/result.json`
把待審草稿摘要 + 預覽/編輯連結 + 「✅ 發佈這篇」鈕發到 Slack，作者審閱後一鍵核可上線。

## 步驟 5：失敗處理
任一步致命失敗（查不到官方日曆、找不到可查證優惠、gate 未過）：把 `{ "text": "⚠️ 連假優惠 roundup 未產出：<原因一句>" }` 寫到 `/tmp/deals-roundup-fail.json`，跑 `node scripts/slack-post.mjs /tmp/deals-roundup-fail.json`。資料不足就回報一句、不要硬湊優惠。
