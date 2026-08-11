# 數據觀測與 AEO 學習環（維護交接）

> 給後續維護者。**主要內容每天由 heartbeat cron 發到 Slack dev 頻道講清楚**;本檔只講「怎麼維護、東西在哪、鐵則」。
> 脈絡(為什麼這樣做)見對話與 `docs/lessons/`;操作總表見 `docs/SERVER_HANDOFF.md`。

## 全貌:兩層目標

- **第一層 觀測**:在 GA 看各區塊人流(焦點/國際/健康/科技/財經/運動/生活/專欄/作者群)、SEO/AEO/GEO 來源、受眾、服務漏斗。
- **第二層 用數據去贏**:學習「已被 AI 引用的贏家內容」→ 轉成寫作鐵則餵 `newsroom`,讓內容被引用。

## 每天自動發到 Slack dev 頻道（一個地方看完）

**維運心跳** `scripts/cron/heartbeat.sh`（crontab `40 21 * * *`＝台北 05:40），發**兩則確定性數據**（皆無 LLM、純讀、必發）:

1. **📊 數據心跳** `data-heartbeat.mjs` — 純讀本地內容存量(文章數/排程/作者)。
2. **📊 數據總覽** `dashboard-post.mjs` — GA 統整:8 區塊中文人流 + 受眾 + 漏斗 + AEO + 連結。**建議在 Slack 釘選這則。**

> **2026-07-23 變更**:原步驟③🤖大腦優化(`brain-checkup.mjs`,報告型 LLM 判讀)已從 heartbeat 移除——由 **seo-ops 大腦層**(`/root/seo-ops/bin/seo-brain.sh --site appi.news`,crontab 在 `/etc/cron.d/seo-ops`,UTC 22:20)取代且升級:不只出建議,會**實際改單篇內容、跑 gate、commit、push 上線**。兩者同 dev 頻道並存會重複甚至矛盾,故 heartbeat 只留①②純數據。`brain-checkup.mjs` 腳本本身保留(seo-ops 大腦仍會間接參考其邏輯/可手動跑),只是不再由 cron 自動發。

**AEO 學習環**（2026-07-23 站長指示啟用排程,原本只手動跑）:

- **🛰 AEO 能見度探針** `scripts/cron/aeo-radar.sh`(crontab `0 12 * * *`＝台北 20:00)— claude-appi Sonnet 用自身 web search 逐題問 AI 引擎,量 appi 被引用/輸給誰 → 寫 `geo-citation-ledger`(git 外)+ 發 dev 摘要。純讀不碰 git。
- **🔧 學被引用內容** `scripts/cron/cited-teardown.sh`(crontab `30 13 * * *`＝台北 21:30)— 按星期輪 7 beat 各週一次,拆競品被引用頁 → 寫 `.claude/skills/newsroom/geo-insights/<beat>.md`(newsroom 起草前讀)+ 發 dev 摘要。**會寫 repo** → 走 `_worktree.sh` 隔離 + push origin/main。
- 兩者刻意排在 claude-appi 午後空窗(避清晨 tech-radar/seo-ops reflect·brain 與傍晚 international·arthurs 尖峰);撞週限額 regex 偵測、當日 no-op、可回滾。

## 腳本清單（職責）

| 檔案 | 做什麼 |
|---|---|
| `scripts/lib/google-data.mjs` | GA4/GSC 唯讀 API 封裝(服務帳號自簽 JWT) |
| `scripts/lib/report-config.mjs` | GA4 property `541946427`、GSC、Slack 頻道、scope(**唯讀** `analytics.readonly`) |
| `scripts/lib/section-metrics.mjs` | pagePath→8 區塊歸戶(slug 映射)+ 中文標籤;離線 views+停留、content_group 準確人數 |
| `scripts/section-report.mjs` | 分區塊人流(離線 / `--source contentgroup`) |
| `scripts/lib/audience-metrics.mjs` + `scripts/audience-report.mjs` | 受眾:裝置/台灣縣市/回訪/總量(`--format md` 出媒體包) |
| `scripts/lib/funnel-metrics.mjs` + `scripts/funnel-report.mjs` | 服務漏斗:方案/服務頁→/submit→`generate_lead` |
| `scripts/lib/ai-signals.mjs` + `scripts/ai-signals-report.mjs` | SEO/AI 轉介/其他 三桶(人數+停留) |
| `scripts/dashboard-post.mjs` | 把上面統整成**一則 Slack** |
| **AEO 學習環** | `aeo-radar`(skill)→ `geo-citation-audit.mjs`(帳本)→ `cited-teardown`(skill)→ `geo-question-set.mjs`/`citeability.mjs`(lib)→ `geo-insights/<beat>.md` → `newsroom` 讀 |

## 埋點（讓分區塊/漏斗在 GA 可觀測）

- `src/components/seo/Analytics.astro` + `src/layouts/BaseLayout.astro`:**不載入 gtag.js**,inline 自送 GA4 `/g/collect` beacon(page_view/user_engagement/自訂事件),帶 **`content_group`=中文分類名**(封包欄位是 `ep.content_group`;BaseLayout 由 category slug 走 `getCategoryName`,其餘 path 推導;新分類自動涵蓋)。值**消毒**只移除會破壞 inline script 的字元(引號/反斜線/角括號/換行),允許中文。為什麼＝[`lessons/ga4-beacon-instead-of-gtag.md`](./lessons/ga4-beacon-instead-of-gtag.md)。
- `src/pages/submit.astro`:AJAX 送出成功發 `gtag('event','generate_lead')`(非同步、不帶 PII)。`window.gtag` 由 `Analytics.astro` 提供同介面墊片,呼叫端不必知道底下換了實作。
- `src/pages/index.astro`:首頁季節專題入口點擊發 `seasonal_topic_click`,帶 `topic_id`、`slot=primary|companion`、`link_url`,並把 `content_group` 編為 `首頁季節入口｜slot｜topicId`;`weekly-data.mjs` 可在不新增 GA4 自訂維度下輸出 `sprint.seasonalTopicClicks`。不攔截導頁,由既有 `sendBeacon` 墊片送出。
- **沒有 GA4 自動增強型評估**(scroll/outbound click/file_download/影片):拆掉 gtag.js 就沒有了,目前無報表消費。要哪一個就在該互動點自己呼叫 `gtag('event', ...)` 墊片,不要把整包 gtag.js 請回來。
- **資料不回溯**:埋點只從部署後累積。

## 維護鐵則（踩雷點）

1. **改 cron `*.sh` 或報表 `*.mjs` 後**:push → **`cd /root/appi.news-publisher && git reset --hard origin/main`**。cron 從 publisher checkout 跑,不 pull 會跑到舊版(見記憶 `cron-wrapper-runs-from-stale-publisher`)。
2. **GA 是唯讀**:服務帳號 scope `analytics.readonly`,**不能**改 GA 後台/建維度/建自訂頻道群組。那些是 console 手動操作(GA 新版「AI Assistants」頻道已內建)。
3. **動 `Analytics.astro`/`BaseLayout` 前先讀 `PERFORMANCE.md`**:埋點須維持「零第三方 JS、TBT=0」,**不可為了省事把 gtag.js 請回來**(它就是文章頁 TBT 的來源)。要改送出欄位前,先照 lesson 的方法用 headless Chrome 攔一次真 gtag 封包比對,不要憑記憶加參數;攔截時務必 abort/respond,否則本機測試會把假資料灌進正式 GA4 資源。部署後 PSI 複驗(低流量站 LCP 冷邊緣假象別追,看 TBT/CLS)。
4. **判斷 cron 成功不能只看 exit code**:claude-appi 撞週限會 exit 0 只印限額訊息(brain-checkup 已用 regex 偵測退化)。

## 怎麼看（給營運者）

- **Slack dev 頻道**:釘「📊 數據總覽」,每天最新一則、附連結。
- **GA 探索**:建一張「內容群組」維度 + 活躍使用者/工作階段/平均參與時間 的表 → 看各區塊中文人流(埋點後資料)。
- **GEO 寫作洞察**:`.claude/skills/newsroom/geo-insights/<beat>.md`。
