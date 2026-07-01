# 數據觀測與 AEO 學習環（維護交接）

> 給後續維護者。**主要內容每天由 heartbeat cron 發到 Slack dev 頻道講清楚**;本檔只講「怎麼維護、東西在哪、鐵則」。
> 脈絡(為什麼這樣做)見對話與 `docs/lessons/`;操作總表見 `docs/SERVER_HANDOFF.md`。

## 全貌:兩層目標

- **第一層 觀測**:在 GA 看各區塊人流(焦點/國際/健康/科技/財經/運動/生活/專欄/作者群)、SEO/AEO/GEO 來源、受眾、服務漏斗。
- **第二層 用數據去贏**:學習「已被 AI 引用的贏家內容」→ 轉成寫作鐵則餵 `newsroom`,讓內容被引用。

## 每天自動發到 Slack dev 頻道（一個地方看完）

crontab 一條:`40 21 * * *`(台北 05:40)跑 `scripts/cron/heartbeat.sh`,依序發**三則**:

1. **📊 數據心跳** `data-heartbeat.mjs` — 純讀本地內容存量(文章數/排程/作者),無 LLM、必發。
2. **📊 數據總覽** `dashboard-post.mjs` — GA 統整:8 區塊中文人流 + 受眾 + 漏斗 + AEO + 連結,純讀 GA、無 LLM、必發。**建議在 Slack 釘選這則。**
3. **🤖 大腦優化** `brain-checkup.mjs` — claude-appi(Sonnet)判讀 SEO/內容機會,LLM 放最後(較慢/可能撞週限,撞限額退化成只報事實)。

> 前兩則是確定性數據(無 LLM),故相鄰;AI 分析放最後。

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

- `src/components/seo/Analytics.astro` + `src/layouts/BaseLayout.astro`:gtag config 帶 **`content_group`=中文分類名**(BaseLayout 由 category slug 走 `getCategoryName`,其餘 path 推導;新分類自動涵蓋)。值**消毒**只移除會破壞 inline script 的字元(引號/反斜線/角括號/換行),允許中文。
- `src/pages/submit.astro`:AJAX 送出成功發 `gtag('event','generate_lead')`(非同步、不帶 PII)。
- **資料不回溯**:埋點只從部署後累積。

## 維護鐵則（踩雷點）

1. **改 cron `*.sh` 或報表 `*.mjs` 後**:push → **`cd /root/appi.news-publisher && git reset --hard origin/main`**。cron 從 publisher checkout 跑,不 pull 會跑到舊版(見記憶 `cron-wrapper-runs-from-stale-publisher`)。
2. **GA 是唯讀**:服務帳號 scope `analytics.readonly`,**不能**改 GA 後台/建維度/建自訂頻道群組。那些是 console 手動操作(GA 新版「AI Assistants」頻道已內建)。
3. **動 `Analytics.astro`/`BaseLayout` 前先讀 `PERFORMANCE.md`**:gtag 須維持延後載入(load + requestIdleCallback)、TBT=0;部署後 PSI 複驗(低流量站 LCP 冷邊緣假象別追,看 TBT/CLS)。
4. **判斷 cron 成功不能只看 exit code**:claude-appi 撞週限會 exit 0 只印限額訊息(brain-checkup 已用 regex 偵測退化)。

## 怎麼看（給營運者）

- **Slack dev 頻道**:釘「📊 數據總覽」,每天最新一則、附連結。
- **GA 探索**:建一張「內容群組」維度 + 活躍使用者/工作階段/平均參與時間 的表 → 看各區塊中文人流(埋點後資料)。
- **GEO 寫作洞察**:`.claude/skills/newsroom/geo-insights/<beat>.md`。
