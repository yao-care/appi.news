# Server 交接 — 給在伺服器上運作的 Claude

> 你被部署到伺服器上跑 APPI News 自動化。**先讀 repo 根的 `CLAUDE.md`（專案鐵則），再讀本檔。**
> 本機開發機的 `~/.claude` memory 不會跟著 git 走，所以這份文件把你需要的操作重點都帶上了。

## 你的工作

- **子專案 1**：每週「數據週報 → Slack」，技能 `/weekly-report`，由 cron 觸發。
- **子專案 2（已上線）**：半自動產文。`tech-radar`（cron 每日一次，UTC 21:20 = 台北 05:20）發候選題到 Slack（**2026-07-07 曾停用，2026-07-20 站長要求重新啟用**）→ 作者點「我要寫這題」→ `slack-actions-server`（pm2 `appinews-slack-actions`）觸發 `scripts/newsroom-write.mjs` 起草＋配圖 gate＋查證 → 排程上線。寫作也可由週報（weekly-report，每 3 天）的「一鍵開寫」按鈕、`/newsroom` 互動寫作、或 `/admin` 下單觸發。詳見最後一節與 repo 根 `CLAUDE.md` §自動發文 pipeline。

## 開機前置（git clone 之後一定要做 —— 這些東西「不在」repo，是故意的）

1. **機密檔**（從原開發機 `scp` 過來，放同路徑、`chmod 600`，**永不進 repo**）：
   - `~/.config/appi-news/ga4-sa.json` — GA4/GSC service account 私鑰
   - `~/.config/appi-news/report.env` — 內含 `SLACK_BOT_TOKEN=xoxb-...`
2. `pnpm install`（伺服器要先有 pnpm；用 npm 會炸）。
3. `claude` CLI 已安裝且**已登入**（cron 跑 `claude -p "/weekly-report"` 靠它）。
4. git remote 用 **HTTPS**（此專案環境 SSH/22 會被導到 sinkhole timeout）。

## 怎麼跑週報

```bash
# 1) 只看數據（確認 GA/GSC 讀得到，印四區塊 JSON）
GOOGLE_APPLICATION_CREDENTIALS=~/.config/appi-news/ga4-sa.json node scripts/weekly-data.mjs

# 2) 端到端（成功 = Slack「agent回報」頻道收到週報、exit 0）
./scripts/cron/weekly-report.sh

# 3) 交給 cron（預設每週一 09:00；時間以伺服器時區為準，必要時調整）
#    crontab -e：
0 9 * * 1 /絕對路徑/appi.news/scripts/cron/weekly-report.sh >> /tmp/weekly-report.log 2>&1

# 4) 單元測試（應 166 綠）
pnpm test
```

## 系統地圖

| 元件 | 路徑 | 說明 |
|---|---|---|
| 技能 | `.claude/skills/weekly-report/SKILL.md` | 讀數據 → 雷達 → 建議 → 發 Slack |
| 資料層 | `scripts/lib/google-data.mjs` | JWT 自簽 → `ga4RunReport` / `gscQuery`（子專案 2 也用） |
| 純轉換 | `scripts/lib/weekly-metrics.mjs` | GA4/GSC 原始回應 → 四區塊 |
| 設定 | `scripts/lib/report-config.mjs` | GA4 property `541946427`、GSC `sc-domain:appi.news`、Slack 一分類一頻道（`CATEGORY_CHANNELS`）、預設/週報頻道＝作者群 `C0BC4JRQJF6` |
| 投遞 | `scripts/slack-post.mjs` + `scripts/lib/slack.mjs` | bot `appi_claude` @ **appi.news** workspace（T0BCV23MAJU）；依 category 路由 |
| cron 進入點 | `scripts/cron/weekly-report.sh` | `source` 金鑰 → `claude -p "/weekly-report"` |
| 設計文件 | `docs/superpowers/specs/2026-06-16-weekly-report-slack-design.md`、`docs/superpowers/plans/2026-06-16-weekly-report-slack.md` | spec / 實作計畫 |

## 規則（務必遵守，違反會出事）

- **自動化鐵則總表**（帳號／模型／cron／並發／發佈端／日誌）見 [`docs/automation-invariants.md`](./automation-invariants.md)——動任何 cron／自動產文前先過一遍。
- **機密永不進 repo**。別把 token/key 寫進任何被追蹤的檔案、別 commit `~/.config/appi-news/*`、別在 commit message 貼出來。
- **內容鐵則**（見 `CLAUDE.md`）：全文繁體中文 + 台灣用語、去 AI 腔（禁破折號/AI 套語）、**禁政治**、**禁杜撰**（不可捏造作者、數據、來源）、所有資料附「可連線」的來源超連結。
- **在 `main` 上要 commit 先開分支**；push 後務必 `git status` 確認非 ahead（失敗訊息尾「and the repository exists.」是錯誤、不是成功）。
- 動字型 / CSS / 首頁圖 / build 流程前先讀 `PERFORMANCE.md`（週報不碰這些；但你若也改網站就適用）。
- 上線 gate：`pnpm build && pnpm check:links`（站內壞連結會擋部署）。

## 已知限制 / 別誤判

- **週報「AI 轉介點擊」≠「被 AI 引用 / 爬蟲抓取」**。GA 是 client-side JS，AI 爬蟲不跑 JS 故量不到爬蟲/被引用；只能量「真人從 AI 答案點連結進站」。真 AEO 需 Cloudflare 代理（另案，見 `PERFORMANCE.md` §6）。
- **剛上線時 users 可能為 0**：gtag 2026-06-16 才上站，早於此的週報區間本就沒有 GA 追蹤資料，不是 bug。GSC 因獨立索引可能已有少量資料。
- **週報失敗會主動發一則「⚠️ 週報失敗」到 Slack**（不靜默）。收到就先查 `node scripts/weekly-data.mjs` 能不能讀到（token 失效 / property 設定 / 網路）。

## 子專案 2：半自動產文（已上線）

把選題建議接成 Slack 按鈕確認 → 觸發產文。**對外發佈、碰禁杜撰鐵律，屬高風險**，故保留人工關卡：候選題要作者在 Slack 主動點「我要寫這題」才會寫；產文有**配圖硬性 gate**（缺封面/內文 0 圖即中止不發），完成後回報摘要/重點/預覽連結待人複核，文章預設**排程**而非立即上線。

| 元件 | 路徑 / 識別 | 說明 |
|---|---|---|
| 選題雷達 | `.claude/skills/tech-radar/`、`scripts/cron/tech-radar.sh` | 只產 tech 候選；**cron 2026-07-07 停用、2026-07-20 重新啟用**（UTC 21:20 = 台北 05:20）|
| 自動產文 | `scripts/newsroom-write.mjs`（沿用 newsroom skill 的文風/查證） | headless 起草＋配圖 gate，寫 `result.json` |
| Slack server | `scripts/slack-actions-server.mjs`、pm2 `appinews-slack-actions` | 收按鈕事件觸發產文並回報 |
| 去重帳本 | `scripts/topic-ledger.mjs`、`/root/.local/state/appi-news/suggested-topics.json` | 與週報共用，避免撞題 |
| 發佈隔離 checkout | `/root/appi.news-publisher`（`PUBLISH_ISOLATED=1`） | 產文在此跑，每篇 reset 到 `origin/main` |

> **改發佈端程式要連動**：push → 在 `/root/appi.news-publisher` `git pull` → `pm2 restart appinews-slack-actions`（**只 restart 會載到舊碼**）。資料層仍沿用 `scripts/lib/google-data.mjs`。

## 子專案 3：多分類自動內容（國際／生活／運動）

六大構想分頻道做，**各頻道有各自的萃取邏輯與來源**（不是同一套雷達）。Slack 已搬到專屬 appi.news workspace、一分類一頻道（`scripts/lib/report-config.mjs` 的 `CATEGORY_CHANNELS`、bot `appi_claude`）。

### cron 總表（全部跑在 publisher checkout、UTC 計時）

> **模型**：所有 cron 一律用 **Sonnet 5（`claude-sonnet-5`）**（newsroom 主稿 Sonnet、viewpoint gate Haiku），**不再用 Opus**——全 Opus 曾把 claude-appi 週用量額度燒爆、自動化全失敗，背景見 [`docs/lessons/automation-model-and-account-split.md`](./lessons/automation-model-and-account-split.md)。新增任何 `claude-appi -p` 呼叫**務必帶 `--model`**，別吃全域預設。
> **日誌**：集中在 `/var/log/appi-news/<job>.log`（不放 `/tmp`，方便稽核）。
> **crontab 排版**：所有 appi.news 行收在 crontab 末段同一個「APPI NEWS」區塊，勿再散落到其他專案之間。

| 任務 | cron 腳本 | UTC | 台北 | 來源 | 上線方式 | 發 Slack？ |
|---|---|---|---|---|---|---|
| 科技選題雷達 | tech-radar.sh | 21:20 | 05:20 | WebSearch | 候選→人點按鈕→寫→自動上線 | ✅（2026-07-07 停用、2026-07-20 重新啟用）|
| 焦點/ESG | focus-esg.sh | 01:30 | 09:30 | 6 議題群權威來源（focus-esg.mjs）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 連假優惠 | lifestyle-deals.sh | 07:30 | 15:30 | data.gov.tw #14718 假日曆（tw-holidays.mjs）+ 雙鐵 | 事實稿→**待審草稿+發佈鈕** | ✅有連假時發**生活**台/失敗哨兵（2026-07-20 從 10:00 移到 07:30，見下方 §時區列的攤開註）|
| 國際編譯台 | international-desk.sh | 15:00 | 23:00 | **GDELT Events 原始檔**（international-select/international-write）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 警消好人好事 | lifestyle-police.sh | 04:45（每日） | 12:45 | 各地警局新聞稿（lifestyle-police.mjs；來源清單 `docs/police-good-deeds-sources.md`）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 便民市政 | lifestyle-civic.sh | 10:00（每日） | 18:00 | 各縣市政府 RSS（civic-feeds.mjs；本機日本 IP 可抓 ~10 站，餘待台灣 proxy）+ civic-ledger 去重 | **全自動上架**（跨縣市統整一篇、有新資料才寫）| ✅有新資料發**生活**台/失敗哨兵 |
| 影片線索整理 | lifestyle-video.sh | 18:30（每日） | 02:30 | 訂閱 YouTube 頻道 RSS（video-feeds.mjs `VIDEO_FEEDS`）+ video-ledger 依 videoId 去重；**抓不到逐字稿**，影片只當線索、事實靠 LLM 上網交叉查證 | **全自動上架**（一片一篇、≥2 個獨立來源才寫，否則 SKIP）| ✅有上架發**生活**台/失敗哨兵 |
| 颱風停班課 | lifestyle-typhoon.sh | 每 15 分鐘（5–11 月） | */15 * * 5-11 * | 人事行政總處 nds.html + NCDR CAP feed | 事實稿→**待審草稿+發佈鈕** | ✅有停課時發**生活**台/失敗哨兵 |
| 新文章送 Indexing API | indexing-submit.sh | 06:00 | 14:00 | 線上 sitemap | n/a（送 Google 收錄）| 有送才報 **dev 台** |
| 數據報告 | weekly-report.sh | 00:17（每 3 天） | 08:17 | GA4+GSC | n/a（數據）| ✅報告到**作者群** |
| 維運心跳 | heartbeat.sh | 21:40 | 05:40 | 本地內容存量 + GA（8 區塊儀表板）| n/a（維運）| ✅📊數據心跳＋📊數據總覽兩則到 **dev 台**（皆無 LLM。2026-07-23 移除原步驟③🤖大腦優化，改由 seo-ops 大腦層 UTC 22:20 取代升級）|
| AEO 能見度探針 | aeo-radar.sh | 12:00 | 20:00 | claude-appi 自身 web search 問 AI 引擎 | n/a（寫 geo-citation 帳本，git 外）| ✅🛰摘要到 **dev 台**（純讀不碰 git。2026-07-23 站長指示啟用排程，原只手動）|
| 學被引用內容 | cited-teardown.sh | 13:30 | 21:30 | 競品被引用頁（WebFetch）| 寫 `geo-insights/<beat>.md`→push（newsroom 起草前讀）| ✅🔧摘要到 **dev 台**（按星期輪 7 beat；**會寫 repo**→走 worktree。2026-07-23 站長指示啟用）|

- **內容線排程刻意攤開，別再併回早上（2026-07-03；2026-07-20 更新；2026-07-26 加影片線）**：焦點/ESG 01:30、警消好人好事 04:45、連假優惠 **07:30**、便民市政 10:00、國際編譯台 15:00、影片線索整理 **18:30**、科技選題雷達 21:20（UTC）。影片線挑 18:30 是因為 15:00→21:20 是當時最大的空窗（前後各隔 3.5h／2.8h）。各喚 claude-appi Sonnet；claude-appi 的 session 額度是**每 5 小時一個共用視窗**，原本全擠在 01:30–03:50 → 同一視窗搶額度，排最後的警消每天餓死（先撞 weekly limit、再 session limit）。原則：任兩條相隔 ≥5h 或跨 04:30 reset 邊界，一個視窗最多落一條。**⚠️例外（站長 2026-07-20 指定）**：連假優惠從 10:00 移到 **07:30**，與警消 04:45 僅差 2h45、落同一視窗——但連假優惠**只有臨近國定連假才實發**（平日靜默），撞期風險僅限連假前數日，故接受此例外。**代價**＝國際編譯台仍在台北深夜；連假優惠改台北午後。要再調時間，日更線（焦點/警消/國際/雷達/便民）務必維持 ≥5h 間隔，別看「都在白天比較整齊」就併回去。（另一個常態吸額度點是 agent.writer 每小時 :40 的 cron-write，跨專案，未動。）
- **並發保護（重要）**：已從「全域 flock + 共用工作目錄」改為**每支 cron 各開自己的臨時 detached worktree**（`scripts/cron/_worktree.sh` 的 `cron_enter_worktree`，off `origin/main`）→ 互不洗檔、可**真正並行**；寫稿端最後用 `pushToMain`（push `HEAD:main`，撞拒就 fetch+rebase 重試）安全上線。新增這類 cron 一律 `source _worktree.sh` 並 `cron_enter_worktree "<slug>"`。背景見 [`docs/lessons/`](./lessons/)（自動線多工不序列化）。
  - **例外**：`indexing-submit.sh`、`heartbeat.sh`、`aeo-radar.sh` 是**純資料/唯讀腳本**（不碰 git 工作區、不喚 Claude 或只喚一次且只寫 git 外帳本），故**不走 worktree**，與其他 cron 無洗檔競態。背景見 [`docs/lessons/google-indexing-api-gray-area.md`](./lessons/google-indexing-api-gray-area.md)。
  - **`cited-teardown.sh` 會寫 repo**（`geo-insights/<beat>.md`）→ 照內容線走 `_worktree.sh` 隔離 + `push HEAD:main` rebase 重試。
- **AEO 學習環也吃 claude-appi 額度（2026-07-23 啟用排程）**：`aeo-radar.sh`（UTC 12:00）與 `cited-teardown.sh`（UTC 13:30）皆喚 claude-appi Sonnet，刻意排在 claude-appi 午後空窗——避開清晨 tech-radar(21:20 前一日)/seo-ops appi reflect·brain(21:45·22:20) 與傍晚 international(15:00)/arthurs 尖峰；兩者間隔 1.5h。撞週限額 regex 偵測、當日 no-op、可回滾（同其他 claude-appi cron）。
- **維運/系統訊號改發 dev 台（2026-06-30）**：原本「cron 一律不發 dev、dev 只給 @bot」的政策放寬——**非內容的維運訊號**（`heartbeat.sh` 的 📊 數據心跳＋🤖 大腦優化、`indexing-submit.sh` 的索引提交回報）改走 **dev 台**（`cron-report.mjs --dev` → `DEV_CHANNEL`），與內容/值勤回報（作者群、分類台）分流，維運訊號不再吵作者群。內容類 cron 仍照舊發作者群/分類台。🤖 大腦優化是**報告型**（claude-appi Sonnet 判讀 SEO/內容機會，撞週限會退化成只報確定性事實、不沉默），不自動改碼。
- **國際是長跑**（最多 8 區×3 篇、逐篇 Claude 撰寫）；各 cron 各自 worktree 並行，不再彼此卡鎖。要降國際耗時就調 `international-write.mjs` 的 `--max` 或 `INTL_TIME_BUDGET_MS`。
- **颱風前置 gate（省用量）**：`lifestyle-typhoon.sh` 在建 worktree／喚 Claude **之前**，先用 `curl -4` 抓人事行政總處 `nds.html`，含「無停班停課訊息」就**安靜結束、完全不動用 Claude／worktree**（颱風季沒颱風的時段每 15 分鐘跑一次、用量＝0）。抓取失敗／非 200／找不到該字串一律 **fail-open** 照走完整流程，絕不漏報。要改 gate 字串或來源就動這支 `.sh` 開頭（改後記得 publisher pull）。
- **每次執行都回報 Slack（`scripts/cron-report.mjs`）**：不論完成/無產出/失敗/略過(取鎖逾時)，都發一則「值勤回報」到**作者群**頻道（`channelForCategory(undefined)`=預設台）。**內容本身**另發對應分類頻道：國際/警消上架→該分類頻道帶連結（Slack 自動 unfurl 出標題）；科技候選→科技台；優惠/颱風待審草稿→生活台（發佈鈕）。
  - **颱風每 15 分鐘（安靜模式，例外）**：沒颱風時前置 gate 靜默 exit、**不發任何 Slack**（所以 15 分鐘一次也不會洗作者群）；只有真偵測到停課才發生活台待審草稿（發佈鈕），失敗只發 dev 台。
- 上表「發 Slack？」欄已過時——改以本段為準：**全部 cron 每次都回報作者群**。

### 各頻道維護重點
- **國際**：來源是 GDELT **原始檔**（搜尋 API 會被擋）；選題用「來源家數」相對統計挑每區突出題；撰寫嚴格基於事實、附原文連結、圖片可授權否則跳過（不用 AI 圖）、同事件有進展則更新原文（故事線、30 天窗）。詳見記憶 `international-desk-gdelt`。
- **生活·颱風／優惠**：事實稿，`kind: factual` → 產「待審草稿」（status:scheduled+遠未來日）+ Slack 發佈鈕，**人工核可才上線**（`newsroom-publish.mjs` 轉正）。
- **生活·警消**：跟官方原稿具名、不轉載版權照、附原文連結驗活、圖庫示意圖、全自動上架。境外 IP 約 13–14 家警局可抓、8 家被地理/WAF 擋（當次略過）。
- **生活·影片線索**：訂閱頻道 RSS 是**唯一沒被擋的入口**——本機 IP 被 YouTube 標記，yt-dlp 五種 player_client 全數 `Sign in to confirm you're not a bot`，台灣媒體站（如 ftvnews）對境外 IP 連首頁都 403/404。所以**拿不到逐字稿**，設計前提就是「看不到影片」：影片當線索，事實一律靠 LLM 用 WebSearch/WebFetch 找 **≥2 個獨立於該頻道的來源**交叉查證，查不到就 SKIP（防洗稿）。影片以「本地縮圖 + 連出去」的 facade 呈現（`save-video-thumb.mjs`），**不嵌 iframe**（保 TBT 0/CLS 0）；縮圖**不可當封面**（版權）。**訂閱台（2026-07-27 站長拍板「多加頻道」路線）**：民視、華視、TVBS、公視、三立、東森、台視、中天**八台**，實測每日約 5–8 支候選（鏡新聞官網沒放 YouTube 連結、handle 也猜不到，待補）。**篇數無上限**（站長同日指示）：協調器**逐支候選各喚一次 Claude**，過 gate 的都寫，撞用量上限即 break 中止整批、候選留到下輪重試；逐篇各自過缺圖與去 AI 腔 gate，不合格的**只丟那一篇**（`dropArticle` 只刪 git 未追蹤檔，絕不誤刪既有內容），不連累同批。**刻意只訂綜合新聞台、不訂生活類 YouTuber**——本線硬 gate 是「≥2 個獨立來源」，YouTuber 去吃一家店不會有第二家報導＝天天 SKIP。新增訂閱頻道＝在 `scripts/lib/video-feeds.mjs` 的 `VIDEO_FEEDS` 加一列 `channelId`，取法**必須**用 `"externalId"`（抓 `"channelId"` 會撈到推薦頻道；handle 打錯 YouTube 照樣回 200 一個別人的頻道），加完**先驗 RSS `<title>` 是不是那台**、再跑一次 dry-run 看漏網（每加一台都要重看 `LIFESTYLE_HINTS`/`OFF_BEAT`，別搶到 civic／police／typhoon 的題）。背景見 [`docs/lessons/youtube-video-digest.md`](./lessons/youtube-video-digest.md)。
- **運動**：**純拉式**（學生賽事），無 cron、無自動產文。投稿＝`workers/sports-submission`（**待部署**：建 Slack webhook→`wrangler deploy`→填 `submit.astro` 的 WORKER_URL）+ `/sports/submit/`（運動分類頁有入口）。邀請＝`docs/sports-student-invite-windows.md`（7 官方機構窗口）+ `sports-invite-draft`（只起草、人工送）。
- **樂齡/長照**：暫不做（無可靠結構化資料源）。
