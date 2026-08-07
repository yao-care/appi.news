# 過了「Google 願意給流量」之後卡在哪：三關體檢與站內導流的空洞

> 摘要：站台自然搜尋起飛後，實測發現 722 篇裡 624 篇零站內連結、631 篇 topics/column 全空，PV/session 只有 1.22；同期 715 頁有曝光但其中 551 頁 0 點擊，回訪佔比反而從 8% 掉到 6%。成長的三個瓶頸全部發生在「寫作當下沒做、事後補很貴」的地方，所以把規則注入所有產線的起草 prompt。 ｜ 範圍：SEO / 成長 / 自動化 ｜ 狀態：已解決（規則已上線，存量補寫進行中） ｜ 日期：2026-08-07

## 問題（症狀）

2026-08-07 站長提出一個判斷：站台已經通過「Google 願意收錄並給自然搜尋流量」這一關，接下來還要過三關——①流量是否由大量頁面共同帶動 ②使用者是否開始回訪與搜尋品牌 ③流量能否連續 3–6 個月維持成長。

拿 GA4＋GSC 實測（近 28 天 2026-07-10~08-06，對比前 28 天 2026-06-12~07-09）：

- **關卡 1 其實已經在過**：文章頁 PV 520 → 1454（+180%），同時集中度**下降**（top1 15%→5%、top20 45%→42%），腰部 ≥10PV 的頁數 5 → 26。量增而集中度降，是最健康的形狀。
- **但同一組數字露出真正的瓶頸**：GSC 有曝光頁 715、有點擊頁只有 164 → **551 頁天天掛在搜尋結果拿 0 點擊**。已經付出的收錄成本沒有回收。
- **關卡 2 最弱且在退**：回訪 users 43 → 80，但**佔比 8% → 6%**（新客灌進來的速度遠快於留下來的速度）。品牌搜尋實質為零：860 個 query 裡只有 2 個帶 appi、合計 3 次曝光。
- **關卡 3 資料不足**：只有 8 週，前 5 週在 220–420 PV 之間震盪，單調上升只有最近 3 週，而那 3 週剛好跟大量補文、圖片工程、indexing 提交同期。

站長認為「補站內導流」重要。查證後發現這件事比想像中更空：

- `PV/session 1.22`、`bounceRate 61.2%`、`avgSessionSec 113`——幾乎每個人看一頁就走。
- `RelatedArticles.astro` **早就存在**（文末 3 則），但 722 篇裡 **624 篇內文零站內連結**、**631 篇 `topics` 與 `column` 全空**、317 篇 title 長到會在搜尋結果被截斷、614 篇沒有常見問題區段。

## 原因（根因）

1. **相關文章的排序權重吃的是 `topics`／`column`，而產線從來沒被要求填**。`relatedArticles()` 的加權是同 topic 每個 ×3 ＞ 同 column +3 ＞ 同分類 +2。兩個欄位都空，推薦就退化成「同分類最新文」——對讀者是不相干的東西，等於自廢站內導流。
2. **文末版位救不到高跳出率的讀者**。61% 跳出、平均停留 113 秒的情況下，多數人根本沒滑到「延伸閱讀」。導流必須寫進**內文前段**，那是寫作當下的事，事後補要逐篇重讀。
3. **每條產線的 prompt 各寫各的**。當時有 9 個獨立的起草 prompt 建構點（newsroom-write 一個、各分類線各一個），任何寫作規範只加在其中一處就等於漏掉其他八條。
4. **「有曝光 0 點擊」不是排名問題而是標題問題**，但沒有任何一條產線在下標時看過該頁真實的搜尋詞。

## 解法（怎麼修 + 現在怎麼維持）

**把規則做成單一正本，注入所有產線**：

- `scripts/lib/growth-prompt.mjs` 的 `GROWTH_PROMPT`＝唯一正本（G1 內鏈 ≥2 條且至少 1 條在前三分之一、G2 判斷 topics/column、G3 title 30 全形字內＋description 60–160、G4 開頭直接回答、G5 能問答就補常見問題區段）。與 `RISKS_PROMPT`／`EXPERT_NOTE_PROMPT` 同一個模式。
- 已接的 9 個起草點：`newsroom-write.mjs`（Slack 按鈕／論壇雷達／`/admin` 寫作任務／連假優惠／颱風線全部繼承）＋ focus-esg／international-write／health-days／lifestyle-video／lifestyle-police／lifestyle-civic／tech-desk／acute-care。查法：`grep -rn "GROWTH_PROMPT" scripts/ --include=*.mjs`。
- **內鏈規則寫得比其他規則囉嗦是刻意的**：模型憑印象拼 slug 會連到不存在的頁，`check:links` 會擋掉整條線的發佈。所以 prompt 明確要求「先 `ls`／`grep` 查出真實 slug 再連，查不到就不連」。

**把「有沒有做到」變成可以量的東西**：

- `scripts/growth-lint.mjs`：逐篇檢查 G1–G5。**預設 report-only、永遠 exit 0**——內鏈是品質不是正確性，不該在半夜擋掉自動產線。各線寫完會跑一次把結果印進 cron log。只有人工帶 `--strict` 時硬錯誤才 exit 1。
- `scripts/growth-audit.mjs`：三關體檢＋世代分析，取代每次手刻 GA4／GSC 查詢。窗尾固定取到昨天（GA4 當日未定案、GSC 延遲 2–3 天），未滿 7 天的週會標記。
- 工作項目與 SOP＝[`docs/growth-playbook.md`](../growth-playbook.md)，進度不寫在文件裡，一律用上面兩支指令重算。

**世代分析為什麼一定要有**：關卡 3 問的是「連續成長」，但總量成長可能全靠一直發新文撐。首次實測（2026-08-07）舊文 PV 69 → 144（+109%）、新文 420 → 1276（+204%）——舊文確實自己在長，但只佔總量約一成，所以現在還不能說關卡 3 過了。

## 怎麼避免重犯 / 相關

- **新增產線 = 一定要接 `GROWTH_PROMPT`**，接線點清單見 `docs/growth-playbook.md` §產線接線點。只加在自己那條線的 prompt 裡而不用共用正本，就是下一次規則漂移的起點。
- **報成長現況一律跑 `pnpm growth:audit`**，不要憑記憶、也不要相信任何文件裡的數字（本篇的數字是 2026-08-07 的歷史證據，不是現況）。
- **回訪看比例、品牌看絕對量**：新客暴增時回訪人數會漲但佔比會掉，只看人數會誤判成「回訪在改善」。
- **升級存量頁後不要隔天驗收**：排名與 CTR 反應要 2–4 週。
- 相關：[`topical-authority-concentration.md`](./topical-authority-concentration.md)（多產不等於權威）、[`query-targeting-event-vs-concept.md`](./query-targeting-event-vs-concept.md)（下標瞄準事件字 vs 概念字）、[`high-impression-zero-click-bot-queries.md`](./high-impression-zero-click-bot-queries.md)（高曝光零點擊也可能是機器查詢，改標題無效，要先分辨）、[`faq-schema-markdown.md`](./faq-schema-markdown.md)（常見問題區段要能被抽成 FAQPage）。
