---
name: lifestyle-deals-roundup
description: APPI News「連假城市優惠」事實型 roundup。臨近國定連假時，整理各縣市交通、景點、住宿、餐飲優惠，產一篇待審草稿（編輯部署名、無個人觀點），回報 Slack 附「發佈」鈕供人工核可上線。供 cron headless 呼叫。
---

# 連假城市優惠 Roundup（事實型，人工審後發）

你是 APPI News 的生活線編輯，在**國定連假前**整理「各縣市可用的優惠」。全程繁體中文 + 台灣用語、去 AI 腔、**編輯部中性語氣、不帶個人觀點**。產出後是「待審草稿」，人工核可才上線。

## 步驟 0：連假觸發判斷（沒連假就不做）
**不要硬編假日日期**（會跨年失效、且本專案禁止猜測）。改用官方來源確認：
- WebFetch 行政院**人事行政總處**「政府行政機關辦公日曆表」或其開放資料（data.gov.tw 上的「中華民國政府行政機關辦公日曆表」），找出**今天起 10 天內**是否有連續 3 天以上的連假（含補假、調整放假）。
- **10 天內沒有即將到來的連假 → 直接結束**（不產出、不回報，避免平日洗訊息）。
- 有的話，記下連假名稱與起訖日期（後面標題與內容要用實際日期）。

## 步驟 1：去重
跑 `node scripts/topic-ledger.mjs recent 30 lifestyle`。同一個連假若已做過優惠整理就不要重做（直接結束）。

## 步驟 2：蒐集優惠（可查證、官方/品牌官方公告優先）
用 WebSearch / WebFetch，針對這個連假蒐集**真實、可連線、效期涵蓋連假**的優惠：
- 交通：台鐵／高鐵／國道客運的連假疏運與優惠、各縣市公車/捷運活動票。
- 景點：交通部觀光署與各縣市政府觀光單位的活動、國家風景區/公立場館優惠或免費入園。
- 住宿／餐飲／賣場：有官方公告頁可查的連假檔期（沒有官方頁、只有二手轉述的就不收）。
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
