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

## 步驟 2：外部熱題雷達
用 WebSearch / WebFetch 掃 Anthropic / OpenAI / Google 官方 blog、arXiv cs.AI、Hacker News 高分科技題，列出近一週熱題。
**套專案內容鐵律**：避開政治（政黨/政治人物/選舉/人事）、台灣視角、tech/APPI 相關，比照 147 內容庫定調。雷達失敗 → 降級成「只有數據、無建議」，繼續。

## 步驟 3：合成動態 2-6 個建議方向
融合「站內需求」（GSC searchOpportunities 高曝光低點擊 + articlePerf 分類動能）與「外部熱題」。
- 每個候選用 `站內需求強度 × 外部熱度 × APPI相關` 質性評估，**過門檻才收**；強訊號多就到 6，弱週就少，**沒強訊號就明說「本週無強建議」**。
- 去重（兩份都比對，語意比對非只比字面，重複就排除）：①`.claude/skills/newsroom/author-memory.json`（已寫過的文章）；②跑 `node scripts/topic-ledger.mjs recent`（近期已推薦過的候選題，與每日雷達共用同一帳本，避免兩邊撞題）。
- 每個建議欄位（對齊 newsroom 雷達格式）：標題 / 訊號依據 / 建議切角 / 候選結論 / 建議分類，編號。

## 步驟 4：組訊息並發送
把數據組成 Block Kit `blocks`（數字深入處附 GA/GSC 連結）：
```
📊 APPI News 週報  <period.start>–<period.end>
① 文章/分類表現：
   • Top3 頁面(路徑/瀏覽/停留秒)
   • 各頁面類型(byPageType：首頁/文章內文/作者頁/分類索引… 瀏覽 + wowPct)，並一句點出流量是讀者讀文章還是團隊看作者頁/後台
   • 文章分類動能(byArticleCategory：依文章真實分類 瀏覽 + wowPct)
② 🔍 搜尋與 SEO 啟動：
   • seoHealth：出現於搜尋頁數 / 總曝光 / 總點擊 / 平均排名，並一句判讀（索引在累積但排名/CTR 待優化 vs 尚未被索引）
   • Top searchOpportunities(query/曝光/排名/CTR)
③ 📈 流量健康度：users + usersWoWPct + 主要 sources
④ 🤖 AI 轉介點擊（非被引用）：trafficHealth.aiReferrals
（頁尾：資料區間、來源 GA4+GSC、產生時間）
```
- `byPageType` / `byArticleCategory` 的 key 轉成中文標籤再呈現（home→首頁、article→文章內文、author→作者頁、category→分類索引、column→專欄、topic→專題、tag→標籤、page→其他頁；uncategorized→未分類）。
- 早期週次 `wowPct` 多為 `null`（無前期基準），顯示「—」即可，不要硬掰百分比。
**建議方向不要自己寫進 blocks**；改成在 payload 放一個結構化 `suggestions` 陣列，slack-post 會自動展開成文字 + 按鈕（**tech 類掛「我要寫這題」按鈕**，點了就能在 Slack 觸發自動產文；非 tech 只顯示文字）。

寫 `/tmp/weekly-report-payload.json`：
```jsonc
{
  "text": "<純文字摘要（含建議標題，給通知預覽用）>",
  "blocks": [ /* 只放四區塊數據 + 頁尾 */ ],
  "suggestions": [
    { "title": "...", "conclusion": "...", "angle": "...", "signal": "...",
      "category": "tech", "subcategory": "ai" }   // 欄位對齊 newsroom 工單；category 必填
  ]
}
```
- `suggestions` 每項欄位＝newsroom 工單欄位（`title/conclusion/angle/signal/category/subcategory`）。**`category` 用 `src/config/categories.ts` 的合法 slug**；只有 `tech` 會掛按鈕。
- 沒強建議時 `suggestions` 給 `[]`，並在 blocks 寫明「本週無強建議」。
跑 `node scripts/slack-post.mjs /tmp/weekly-report-payload.json` 發送。回報 `sent ts=` 即成功。
**發送成功後**（若有 `suggestions`），跑 `node scripts/topic-ledger.mjs append /tmp/weekly-report-payload.json` 把建議記進帳本，每日雷達才不會重複推同題。

## 失敗處理
任一步驟致命失敗（資料抓不到、token 失效）：把
`{ "text": "⚠️ APPI News 週報失敗：<原因一句>" }` 寫到 `/tmp/weekly-report-payload.json`，
跑 `node scripts/slack-post.mjs /tmp/weekly-report-payload.json`，讓失敗在 Slack 出聲，不要靜默。
