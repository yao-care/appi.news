---
name: weekly-report
description: APPI News 每週數據週報。讀 GA4+GSC 四區塊數據、跑外部熱題雷達、融合產出動態 2-6 個建議寫作方向，組成 Block Kit 訊息發到 Slack。供伺服器 cron headless 呼叫。
---

# Weekly Report

你是 APPI News 的每週數據編輯。全程繁體中文 + 台灣用語、去 AI 腔。被呼叫時跑完下列步驟，最後發一則 Slack 週報。

## 步驟 1：抓數據
跑 `node scripts/weekly-data.mjs`，取得 JSON（period / articlePerf / seoHealth / searchOpportunities / trafficHealth）。
- `articlePerf.topArticles`：Top 頁面（含作者頁/首頁/admin 等，不只文章）。
- `articlePerf.byPageType`：各**頁面類型**瀏覽（`home` 首頁 / `article` 文章內文 / `author` 作者頁 / `category` 分類索引 / `column` 專欄 / `topic` 專題 / `tag` 標籤 / `page` 其他靜態頁）。這份才看得出「流量是讀者在看文章，還是團隊在看作者頁/後台」。
- `articlePerf.byArticleCategory`：**只算文章內文**（/articles/<slug>/）依文章真實分類彙整；`uncategorized`＝slug 對不到分類。這份才是真的「各分類文章動能」（舊版把文章全丟進 other，已修）。
- `seoHealth`：GSC 啟動指標 — `pagesInSearch`（本週曾出現在搜尋的頁數）/ `totalImpressions` / `totalClicks` / `avgPosition`（曝光加權平均排名）。判讀：曝光在累積但 `avgPosition` 偏後（>10＝第 2 頁以後）或 CTR（totalClicks/totalImpressions）偏低，代表「有被索引但排名/點閱待優化」，不是「沒被索引」。
- 失敗判定：若指令**非零離開**或 stdout **不是合法 JSON**，視為失敗，直接跳到「失敗處理」（不要把空/部分輸出當成功）。

## 步驟 1b：SEO 機會（GSC 驅動，第 2 頁衝刺 + 改標題）
跑 `export GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json && node scripts/seo-opportunities.mjs`，取三區塊：
- `pageOpportunities`（**第 2 頁衝刺**）：position 10.5~20.5、有曝光的頁面 — 補內鏈/補深度就能推進第一頁。取 Top 3~5，附 page / category / impressions / position / ctr。
- `titleCtrCandidates`（**改標題搶點擊**）：高曝光但 CTR 偏低的 query→page 配對 — 排名還行、標題沒吸引點擊。取 Top 3~5，附 query / page / category / impressions / position / ctr。
- `searchDemandTopics`：高曝光、本站還沒吃到點擊的需求題，併入步驟 3 的「站內需求」訊號做選題。
- 失敗（缺金鑰/非 JSON）→ 此段降級略過，不擋週報主流程。

## 步驟 1c：AI 引用量測（GEO/AEO 真量測，與 GA 的「AI 轉介點擊」不同）
這段量的是「本站內容被 AI 引擎引用」，**與步驟 4 ④ 的『AI 轉介點擊』（真人從 AI 答案點連結進站）是兩回事**，務必分清楚。
1. 跑 `export GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json && node scripts/geo-citation-audit.mjs questions 6`，取本週要問 AI 的問題清單。
2. **用 WebSearch / WebFetch 實際到 Perplexity / Gemini / Google AI 概覽等查這些問題**，逐題觀察答案是否引用 `appi.news`（被引用就記 `cited: true`，附引擎、引用排序 `rank`、連結 `url`）。
3. 把結果組成 `/tmp/geo-round.json`：
   ```jsonc
   {
     "date": "<YYYY-MM-DD>",
     "items": [
       { "question": "...", "engine": "perplexity", "cited": true, "rank": 2, "url": "https://appi.news/articles/..." },
       { "question": "...", "engine": "gemini", "cited": false }
     ]
   }
   ```
   跑 `node scripts/geo-citation-audit.mjs record /tmp/geo-round.json` 寫進帳本，再跑 `node scripts/geo-citation-audit.mjs recent 30` 取趨勢摘要供 blocks 引用。
- 無法實查（工具受限）→ 此段降級略過，不擋週報主流程。

## 步驟 2：外部熱題雷達
用 WebSearch / WebFetch 掃 Anthropic / OpenAI / Google 官方 blog、arXiv cs.AI、Hacker News 高分科技題，列出近一週熱題。
**套專案內容鐵律**：避開政治（政黨/政治人物/選舉/人事）、台灣視角、tech/APPI 相關，比照 147 內容庫定調。雷達失敗 → 降級成「只有數據、無建議」，繼續。

## 步驟 3：合成動態 2-6 個建議方向
融合「站內需求」（GSC searchOpportunities 高曝光低點擊 + 步驟 1b 的 `searchDemandTopics` + articlePerf 分類動能）與「外部熱題」。
- 每個候選用 `站內需求強度 × 外部熱度 × APPI相關` 質性評估，**過門檻才收**；強訊號多就到 6，弱週就少，**沒強訊號就明說「本週無強建議」**。
- 去重（兩份都比對，語意比對非只比字面，重複就排除）：①`.claude/skills/newsroom/author-memory.json`（已寫過的文章）；②跑 `node scripts/topic-ledger.mjs recent`（近期已推薦過的候選題，與每日雷達共用同一帳本，避免兩邊撞題）。
- 每個建議欄位（對齊 newsroom 雷達格式）：標題 / 訊號依據 / 建議切角 / 候選結論 / 建議分類，編號。

## 步驟 4：組訊息並發送

> **版面已收歸決定論渲染器，不要自己手刻 blocks。** 以前手刻常把「query｜曝光｜排名｜CTR」四欄塞一行，手機換行後對不齊、無法閱讀（站長 2026-06 回報）。現在你只填**結構化數據 + 質性一句話 `notes`**，版面交給 `scripts/lib/weekly-blocks.mjs`（兩行制、標籤跟著數字、手機可讀）。為什麼這樣設計見 [`docs/lessons/weekly-report-mobile-layout.md`](../../../docs/lessons/weekly-report-mobile-layout.md)。

把步驟 1～1c 的數據**原封不動**放進 `report`（欄位名沿用各 script 輸出，不要改名、不要預先格式化數字/百分比，渲染器會處理千分位、CTR 分數轉百分比、排名四捨五入、中文標籤、WoW 正負號與 `null→—`）。你只另外寫 `notes` 的幾句質性判讀。

寫 `/tmp/weekly-report-payload.json`：
```jsonc
{
  "text": "<純文字摘要（含建議標題，給通知預覽用）>",
  "report": {
    "period": { "start": "...", "end": "..." },                 // 來自 weekly-data
    "articlePerf": { "topArticles": [...], "byPageType": [...], "byArticleCategory": [...] },
    "seoHealth": { "pagesInSearch": 0, "totalImpressions": 0, "totalClicks": 0, "avgPosition": 0 },
    "searchOpportunities": [ /* {query,impressions,clicks,ctr,position} */ ],
    "seoOpportunities": {                                        // 來自步驟 1b（可缺，缺則略過該區）
      "pageOpportunities": [ /* {page,category,impressions,position,ctr} */ ],
      "titleCtrCandidates": [ /* {query,page,category,impressions,position,ctr} */ ]
    },
    "trafficHealth": { "users": 0, "usersWoWPct": null, "sources": [...], "aiReferrals": [...] },
    "geoText": "<步驟 1c：被引用題數/總題數 + 被引用率 + 一個範例；無法實查則省略此欄>",
    "generatedAt": "<產生時間，如 2026-06-25 06:17>",
    "notes": {                                                   // 質性一句話，皆可選；以斜體接在對應區塊後
      "pageType": "一句點出流量是讀者讀文章還是團隊看作者頁/後台",
      "seoHealth": "一句判讀：索引在累積但排名/CTR 待優化 vs 尚未被索引",
      "page2": "一句：補內鏈/補深度可進第一頁",
      "titleCtr": "一句：排名還行但標題沒吸引點擊",
      "traffic": "一句：使用者升降的原因"
    }
  },
  "suggestions": [
    { "title": "...", "conclusion": "...", "angle": "...", "signal": "...",
      "category": "tech", "subcategory": "ai" }   // 欄位對齊 newsroom 工單；category 必填
  ]
}
```
- **不要在 `report` 裡放預先排版好的文字或 blocks**；只放原始數據 + `notes`。渲染器負責中文標籤（home→首頁、article→文章內文…uncategorized→未分類）、千分位、CTR 分數→百分比、`wowPct: null → —`。
- `suggestions` 每項欄位＝newsroom 工單欄位（`title/conclusion/angle/signal/category/subcategory`）。**`category` 用 `src/config/categories.ts` 的合法 slug**；只有可自動產文的 vertical（tech…）會掛「我要寫這題」按鈕，非 tech 只顯示文字。
- 沒強建議時 `suggestions` 給 `[]`，並在 `notes` 或 `text` 寫明「本週無強建議」。

跑 `node scripts/weekly-report-post.mjs /tmp/weekly-report-payload.json` 發送（**固定發作者群**；此 script 不走分類路由，不會被 suggestion 的 category 帶走）。回報 `sent ts=` 即成功。
- suggestion 的「我要寫這題」按鈕 value 自帶 category，發在作者群也照樣能觸發該分類的自動產文，不受頻道影響。
**發送成功後**（若有 `suggestions`），跑 `node scripts/topic-ledger.mjs append /tmp/weekly-report-payload.json` 把建議記進帳本，每日雷達才不會重複推同題。

## 失敗處理
任一步驟致命失敗（資料抓不到、token 失效）：把
`{ "text": "⚠️ APPI News 週報失敗：<原因一句>" }` 寫到 `/tmp/weekly-report-payload.json`（**不帶 `report`**，weekly-report-post 會只發純文字），
跑 `node scripts/weekly-report-post.mjs /tmp/weekly-report-payload.json`，讓失敗在作者群出聲，不要靜默。
