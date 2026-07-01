---
name: cited-teardown
description: APPI News 的「學習被引用內容」引擎。給一個 beat(預設 health),把「被 AI 引用、我方沒有」的競品頁抓下來拆解,聚合出 GEO 寫作檢查表與逐題升級清單,落地到 newsroom(寫作前必讀)+ 發 Slack dev。目的:讓內容照著會被引用的方式寫/升級。供互動或 cron headless 呼叫(零 key,用跑它的 Claude 自身 WebSearch/WebFetch)。
---

# 學習被引用內容(cited-teardown)

你是 APPI News 的「被引用內容拆解」引擎。目標**不是量測,是把「已經被 AI 引用的贏家頁」拆開,變成我方可照做的寫作鐵則與升級待辦**——讓內容真的爬進 AI 答案。全程繁體中文 + 台灣用語。

**輸入**:目標 beat(7 分類之一,預設 `health`;由呼叫參數或訊息帶入)。
**引擎邊界**:同 aeo-radar——引擎=跑本 skill 的 Claude web search(headless 走 claude-appi),WebSearch 偏美國區可能低估台灣站;判讀時記得。

## 步驟 1:鎖定「輸掉」的題與競品頁

1. 取該 beat 的固定題(reuse):`node -e "import('./scripts/lib/geo-question-set.mjs').then(m=>console.log(JSON.stringify(m.QUESTION_SET.find(c=>c.category===process.argv[1])?.questions||[])))" <beat>`,或直接讀 `scripts/lib/geo-question-set.mjs` 的該分類題。
2. 每題用 **WebSearch**(台灣語境)查 → 收依顯著度排序的來源 URL。
3. 用 `classifyCitedUrls(urls, '<beat>')`(`scripts/lib/geo-question-set.mjs`)判:appi.news 有沒有被引用、命中哪些**競品 domain**。**只處理「我方未被引用、但有競品被引用」的題**(那才是要學的缺口)。

## 步驟 2:拆解競品被引用頁(WebFetch)

對步驟 1 每個**競品被引用 URL**,用 **WebFetch** 側寫成 citeability profile(照 `scripts/lib/citeability.mjs` 欄位):
- `answerUpfront`(開頭一兩段就直接給結論/答案)
- `headingStructure`(有 H2/H3 分層)
- `primarySourceCount`(內文連到**一手來源**的數量;gov/edu/期刊,判定可參考 `isPrimarySourceHost`)
- `hasData`(有數據/表格/數字佐證)
- `authorByline`(有作者或專家掛名)
- `dateVisible`(有發布/更新日期)
- `wordCount`(概估字數)

同時**找我方最接近的既有文**:讀 `src/content/articles/`(比對 beat 分類 + 標題/主題),若有,讀該檔一併側寫成我方 profile;若無,記為「我方無此文」。

## 步驟 3:聚合成檢查表 + 逐題升級清單

用 `scripts/lib/citeability.mjs`:
- `checklist(競品profiles)` → **GEO 寫作檢查表**:被引用頁「一致具備」的訊號(這就是我們每篇都該做到的)。
- 每題 `gapVsOurs(該題競品profiles, 我方profile)` → **逐題升級清單**:被引用頁一致有、我方缺的訊號 → 轉成**具體動作**(例:「補 2 條 gov/期刊一手來源」「把結論搬到開頭」「加一張數據表」「補作者掛名」)。
- 每題附:競品被引用頁 URL(標竿)、我方最接近文(檔名或「無」)。

## 步驟 4:落地(讓規則生效)

1. 寫 `.claude/skills/newsroom/geo-insights/<beat>.md`(**newsroom 起草前會讀**),含:
   - 「GEO 寫作檢查表(<beat>)」清單(來自 checklist)。
   - 「逐題升級/選題建議」:每題一段——標竿 URL、我方現況、**具體補強動作**。
   - 一句誠實邊界(引擎=Claude web search、US 區偏差、n 小)。
2. 發 Slack dev 摘要:`printf '%s' "$SUMMARY" | node scripts/cron-report.mjs --dev --stdin`,標題 `🔧 被引用拆解 <beat> <日期>`,帶 checklist 重點 + 前 2-3 條最高槓桿的升級動作。

## 收尾:這份洞察要驅動什麼

- **寫法**:newsroom 之後每篇該 beat 的稿,起草前讀本檔的檢查表,套結構(結論前置、一手來源、數據表…)。
- **選題/升級**:逐題升級清單裡「我方無此文」= 新選題候選;「我方有但缺訊號」= 既有文升級任務,走現有 Slack/選題管道。

失敗(工具受限/該 beat 全無競品被引用)→ 誠實回報、不硬產空泛建議。
