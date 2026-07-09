# 高曝光零點擊不一定是 SEO 問題——可能是 App／通知的結構化查詢（非人類）

> 摘要：某些 query 高曝光、好排名、卻永遠 0 點擊，是氣象 App／OS 通知的模板化查詢，不是真人；改 title/description/schema 拿不到點擊，該做的是「滅燈」不是優化。｜ 範圍：SEO / 數據判讀 / 自動化訊號 ｜ 狀態：已解決（加 mute 機制）｜ 日期：2026-07-09

## 問題（症狀）

`extreme-heat-warning-guide` 這類文章的「高溫警報」查詢群組，每天都被 SEO 機會工具當成「高曝光低 CTR、該改標題搶點擊」的可行動訊號端出來，反思層／大腦層天天重複判讀同一組訊號：

- `橘色警報 - 高溫`：28 天 142 曝光、pos 7.8、**0 點擊**
- `嚴重高溫警告`：137 曝光、pos **4.3**、0 點擊
- 整組（14 條 query）合計 **432 曝光 / 0 點擊 / CTR 0.00%**

每天的 `-actions.md` 反覆寫「改過 description、等資料窗口、不重複加碼」，等於把編輯／判讀資源綁在一個永遠不會有回報的訊號上。

## 原因（根因）

這組查詢**不是真人搜尋**，是氣象 App／OS 天氣通知在背景跑的**結構化查詢**。四個鐵證（2026-07-09 用即時 GSC 查詢驗證，非延遲的週窗）：

1. **字串完美模板化**：全是「{顏色}警報 - {溫度形容詞}」「{嚴重程度}高溫警告」固定格式，中間帶「` - `」（空格-破折號-空格）這種 UI label 分隔符。真人不會這樣打字。
2. **混進簡體**：`橙色警报 - 高温`（警报/高温）。台灣受眾站冒出簡體模板查詢＝自動化來源。
3. **好排名 + 零點擊**：`嚴重高溫警告` 排第 4.3 名、137 曝光、0 點擊。真人在第 4 名應有 7~10% CTR，整組 432 曝光 0 點擊不符人類行為。
4. **裝置別壓倒性行動端**：代表題「橘色警報 - 高溫」135/142 曝光全在 MOBILE（整站平均是桌機 6479 vs 行動 2082），吻合手機氣象 App／通知 widget。

結論：這是**結構性天花板**，CTR 由流量來源本質決定，改 title / description / schema **永遠**拿不到點擊。

## 解法（怎麼修 + 現在怎麼維持）

**加「滅燈」機制**——查證為結構性非人類流量的 query，從 SEO 機會清單剔除，兩個消費端都做：

1. **appi.news repo（活著的每日 channel）**：`scripts/lib/muted-queries.mjs` 存 denylist（regex + 理由 + 查證日期 + 證據），`scripts/seo-opportunities.mjs` 的 `titleCtrCandidates` 與 `searchDemandTopics` 過濾掉命中的 query。→ 餵 `brain-checkup.mjs` 每日大腦優化。
2. **seo-ops repo（暫停中、日後再開的 🧭 反思 channel）**：`sites/appi.news.json` 的 `mutedQueryPatterns`（regex 字串陣列，站別設定、其他 8 站不受影響），`bin/seo-collect.mjs` 在寫 `strikingDistance` / `highImpZeroClick` 前剔除。→ 反思層／大腦層看不到，不再重判。

**regex 要窄**：只殺模板形（顏色+警報、嚴重程度+高溫+警報/提醒），刻意**不殺**真人地理題如「英國高溫警報」。新增結案項時同步兩處（regex 一致），並附查證證據。

## 怎麼避免重犯 / 相關

- **判斷一個高曝光零點擊訊號前，先問「搜尋者是不是人」**：字串是否模板化、是否混簡體、好排名卻零點擊、裝置別是否異常單一。像人的才值得優化，像機器的直接 mute。查裝置別：GSC `searchAnalytics` dimensions `['query','device']`（工具在 `scripts/lib/google-data.mjs`）。
- **同場結案的兩個判讀（同屬「該不該繼續投入觀察」而非可靠技術問題）**：
  - **GA4「AI Assistant」頻道流量翻倍（3→6）**：n=3→6 是統計雜訊，且 GA 是 client-side JS、拆不到頁面/query。真 AEO 引用量測看 `aeo-radar` skill + `geo-citation` 帳本，不是 GA 頻道。**勿當可行動訊號**。
  - **Heho 膝/髖 listicle**：已由 2026-07-09 cited-teardown（§骨關節）結案——贏家是臨床權威非媒體 listicle，我方旗艦已達標，槓桿在 E-E-A-T / 內鏈**非重寫**（見 `.claude/skills/newsroom/geo-insights/health.md`）。反思層受站規鐵則 2 限制不能改內容，**勿再建議改寫／新內容**。
- 相關：`scripts/seo-opportunities.mjs`、`scripts/brain-checkup.mjs`、seo-ops `bin/seo-collect.mjs`、[psi-cold-edge.md](./psi-cold-edge.md)（同屬「別對假問題改東西」）。
