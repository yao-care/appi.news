# Server 交接 — 給在伺服器上運作的 Claude

> 你被部署到伺服器上跑 APPI News 自動化。**先讀 repo 根的 `CLAUDE.md`（專案鐵則），再讀本檔。**
> 本機開發機的 `~/.claude` memory 不會跟著 git 走，所以這份文件把你需要的操作重點都帶上了。

## 你的工作

- **子專案 1**：每週「數據週報 → Slack」，技能 `/weekly-report`，由 cron 觸發。
- **子專案 2（已上線）**：半自動產文。`tech-radar`（cron 每日一次，時間查 crontab）發候選題到 Slack（**2026-07-07 曾停用，2026-07-20 站長要求重新啟用**）→ 作者點「我要寫這題」→ `slack-actions-server`（pm2 `appinews-slack-actions`）觸發 `scripts/newsroom-write.mjs` 起草＋配圖 gate＋查證 → 排程上線。寫作也可由週報（weekly-report，每 3 天）的「一鍵開寫」按鈕、`/newsroom` 互動寫作、或 `/admin` 下單觸發。詳見最後一節與 repo 根 `CLAUDE.md` §自動發文 pipeline。

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

# 3) 交給 cron（排程正本是 crontab，見下方 §cron 總表的查法）
#    crontab -e：
0 9 * * 1 /絕對路徑/appi.news/scripts/cron/weekly-report.sh >> /tmp/weekly-report.log 2>&1

# 4) 單元測試（全綠才算過；數量會長，不寫死）
pnpm test

# 5) 成長三關體檢（頁面分散度／回訪與品牌／週線與世代）。工作項目與 SOP＝docs/growth-playbook.md
pnpm growth:audit
```

各條自動產線在寫完文章後會跑一次 report-only 的 `growth-lint`，結果印在該線的 `/var/log/appi-news/<job>.log` 裡（`G1-none` ＝那篇沒有站內連結）。**它不會擋發佈**，是給事後回收用的訊號。

## 系統地圖

| 元件 | 路徑 | 說明 |
|---|---|---|
| 技能 | `.claude/skills/weekly-report/SKILL.md` | 讀數據 → 雷達 → 建議 → 發 Slack |
| 資料層 | `scripts/lib/google-data.mjs` | JWT 自簽 → `ga4RunReport` / `gscQuery`（子專案 2 也用） |
| 純轉換 | `scripts/lib/weekly-metrics.mjs` | GA4/GSC 原始回應 → 四區塊 |
| 設定 | `scripts/lib/report-config.mjs` | GA4 property、GSC 站台、Slack 一分類一頻道（`CATEGORY_CHANNELS`）、預設/週報頻道。**實際 ID 一律讀該檔**：`grep -nE "GA4_PROPERTY_ID\|GSC_SITE\|CHANNEL" scripts/lib/report-config.mjs` |
| 投遞 | `scripts/slack-post.mjs` + `scripts/lib/slack.mjs` | bot `appi_claude` @ **appi.news** workspace（T0BCV23MAJU）；依 category 路由 |
| cron 進入點 | `scripts/cron/weekly-report.sh` | `source` 金鑰 → `claude -p "/weekly-report"` |
| 設計文件 | `docs/superpowers/specs/2026-06-16-weekly-report-slack-design.md`、`docs/superpowers/plans/2026-06-16-weekly-report-slack.md` | spec / 實作計畫 |

## Slack 發訊地圖（要改「發給誰」或「發什麼」先讀這段）

上一節只講週報那條線；**全站所有 Slack 訊息**（cron 值勤回報、分類台上架通知、dev 台維運訊號、按鈕與 modal、投稿轉信、CI 告警）的分層長這樣。**改哪一層決定影響範圍**：

| 層 | 檔案 | 改這裡等於改什麼 |
|---|---|---|
| ① 投遞 | `scripts/lib/slack.mjs` 的 `postMessage()` | 所有 node 路徑的**唯一出口**（下面每一支 CLI 與互動 server 都走它） |
| ② 收件對象 | `scripts/lib/report-config.mjs`：`SLACK_CHANNEL`（預設作者群）／`CATEGORY_CHANNELS`（一分類一台）／`DEV_CHANNEL`／`TOPIC_CHANNEL`（主題追蹤）／`channelForCategory()`／`NEWSROOM_AUTHORIZED_SLACK_USERS`（誰按得動按鈕） | 頻道對照與授權名單的 SOT。**頻道 ID 只改這裡，永遠不要抄進任何文件** |
| ③ 發送入口 | `scripts/slack-post.mjs`、`scripts/cron-report.mjs`、`scripts/notify-pending-draft.mjs`、`scripts/weekly-report-post.mjs` | 每則訊息「落到哪一台」的判斷邏輯（四支規則不同，見下） |
| ④ 內容組裝 | `scripts/lib/suggestion-blocks.mjs`（建議方向＋「我要寫這題」鈕）、`scripts/lib/weekly-blocks.mjs`（週報版面）、`scripts/lib/slack-interaction.mjs`（看法 modal、發佈鈕）、`scripts/lib/devbot.mjs`（需求單鈕）、`scripts/slack-actions-server.mjs` 的 `buildDoneMessage()` 與內嵌通知字串 | 文案、版面、按鈕 |

**🔴 全站最高優先的一條規則（2026-08-08 站長裁示，無例外）**：**訊息開頭是 `❌` 或 `⚠️`＝失敗／略過，一律強制發 dev 台**，無視 `--category`、`payload.category`、甚至明確傳進來的 channel。判準只有一處＝`report-config.mjs` 的 `isAlert()`／`routeChannel()`，四支入口與互動 server 都接同一個函式。**所以新產線不必再自己記得帶 `--dev`——把開頭 emoji 寫對就好**；`.sh` 裡既有的 `--category X` 對告警訊息已無作用（留著無害）。分類台自此只留「有產出、人要看的東西」。

**③ 四支入口的路由優先序（這是契約，改了要一併檢查所有呼叫端）**：

- `slack-post.mjs`：**`isAlert` → dev** ＞ 明確 channelId 參數 ＞ `authors`/`default`（強制作者群）＞ `payload.category` ＞ **第一則 suggestion 的 category** ＞ 預設作者群。
- `cron-report.mjs`：**`isAlert` → dev** ＞ `--dev`（維運／系統訊號）＞ `--category`（分類台）＞ 預設作者群（值勤回報）。
- `notify-pending-draft.mjs`：`routeChannel({ text, category: result.category })`；待審草稿附「✅ 發佈這篇」鈕。
- `weekly-report-post.mjs`：**`isAlert` → dev**，其餘**寫死作者群**、不走分類路由（否則會被第一則 suggestion 的 category 帶走）。
- `slack-actions-server.mjs`：`notify()`／`notifyBlocks()` 內建同一條 `isAlert` 覆寫（產文失敗、核可上線失敗、未開始、互動錯誤、開 modal 失敗都因此進 dev）。

**主題中樞雷達的三個設定 2026-08-08 複核後維持不變**（別再重新討論）：門檻 **≥15 篇**不降（薄中樞頁對 SEO 反效果）、**每次最多開 1 個**不放寬（自動上線寧可慢）、**不改成按鈕核可**（把關已全在機器端：四道門檻＋文案逐條驗證＋build/check:links）。要撤掉某個主題就把 `src/content/topics/<id>.md` 的 `status` 改 `inactive`。成立訊息發**主題追蹤頻道**（dev 只留失敗），並在該頻道開一條 thread。判準正本＝`scripts/topic-hub-radar.mjs` 檔頭（內聚門檻實際預設 0.045，可用 `HUB_MIN_COHESION` 覆寫）。

**主題追蹤頻道（`TOPIC_CHANNEL`）的形狀是刻意的**（站長 2026-08-08 拍板）：每週**一則主題總表在主層**（唯一放成效的地方，數字＝各主題收錄文章的加總，不是主題頁自己），**每個主題一條 thread 只記收錄文章增減**，沒有增減就完全不回。刻意不做「一主題一頻道」——側欄會被幾十個低流量頻道塞爆。版面用 Slack 原生 `table` block（限 100 列／20 欄／全表 10,000 字元），工作區不支援時自動退回兩行制 mrkdwn；**不要退回用 `|` 排的假表格**（手機會崩，見 [`lessons/weekly-report-mobile-layout.md`](./lessons/weekly-report-mobile-layout.md)）。實作＝`scripts/topic-tracker.mjs`＋`scripts/lib/topic-tracker.mjs`（純轉換層，呈現規格寫在檔頭），thread_ts 與上次成員快照存在 `~/.config/appi-news/topic-threads.json`（git 外）。

**主題層每週派工會寫進 seo-ops 的 playbook**：同一支 cron 在發完總表後，用純規則（不喚 LLM）挑**最多 3 個**主題標的，發一則「🛠 本週主題派工」到同一頻道，並覆寫 `/root/seo-ops/playbooks/appi.news.md` 的 `playbook:topics` 區塊——反思層與大腦層每天把**整份 playbook** 塞進 prompt，寫在那裡它們才看得到、才會真的去改內容。三件事別踩：①**只覆寫 `playbook:topics` 區塊**，人工共筆的 `playbook:strategy` 區塊不碰；②派工的「動作」必須落在 playbook 的 `reflect:scope`／`brain:scope` 白名單內，否則 `reflect-guard` 會擋（主題頁文案正本 `src/content/topics/**` 已於 2026-08-08 加進反思白名單）；③🔴 停滯主題**不派給大腦**——那是選題問題，大腦層無權新增內容。上週派工的成效回顧也寫在同一區塊。

**上架回報一律帶連結**：任何「自動上架 N 篇」訊息都必須列出每篇的標題＋網址（各線的 `PUBLISHED=<url> ｜ <title>` 行 → `.sh` 組成 `• 標題\n  <url>`），**不可只報篇數**。已上架的文章不要用 `suggestionBlocks` 渲染——那是給「還沒寫的候選」用的，沒有連結而且會掛上「我要寫這題」鈕。

**🔴 三個逃出 `report-config.mjs` 的孤島**——只改頻道對照表不會動到它們：

1. `workers/sports-submission/src/index.ts`：Cloudflare Worker 自己 fetch `chat.postMessage`，token 是 wrangler secret、頻道是 `wrangler.toml` 的 `SLACK_CHANNEL` var。
2. `.github/workflows/deploy.yml` 的 `notify-failure` job：curl 直打，頻道來自 repo secret `SLACK_CHANNEL_ID`（secrets 未設就靜默跳過）。
3. `scripts/slack-actions-server.mjs` 的 `slackApi()`：`views.open`／`auth.test`／`conversations.replies` 自己 fetch，不經 `slack.mjs`。

**互動端（pm2 `appinews-slack-actions`）三種對象混在同一支**：`notify()`／`notifyBlocks()` 預設作者群、多數呼叫傳 `taskChannel()`／`channelForCategory()` 覆寫成分類台；`devReply()` 固定發 `DEV_CHANNEL` 且帶 `thread_ts`（在討論串內回）。文案逐條內嵌在該檔。

**改動前一律先跑盤點，別照抄任何列舉**（清單會長）：

```bash
# 真正打 Slack API 的地方（含 worker 與 CI）
grep -rn "lib/slack.mjs\|slack.com/api" --include=*.mjs --include=*.ts --include=*.yml . | grep -v node_modules
# 誰在叫四支發送入口（cron .sh / skills / 其他 node）
grep -rln "cron-report.mjs\|slack-post.mjs\|notify-pending-draft.mjs\|weekly-report-post.mjs" scripts .claude .github
# 互動 server 的逐條發訊點
grep -n "notify(\|notifyBlocks(\|devReply(" scripts/slack-actions-server.mjs
```

呼叫端的分佈：**cron `.sh`** 在「完成／無產出／失敗」三態都回報（內容線→分類台、維運線→dev 台、週報→作者群，例外見下方 §cron 總表後的說明）；**skills** 自己寫 payload 再叫 CLI（tech-radar→`slack-post`、weekly-report→`weekly-report-post`、lifestyle-typhoon／deals→`notify-pending-draft`、aeo-radar／cited-teardown→`cron-report --dev --stdin`）；另有少數 node 腳本在程式內 spawn CLI（`forum-radar.mjs`、`growth-backlog.mjs`）、或只印文字到 stdout 由 `.sh` pipe 給 `cron-report --stdin`（`data-heartbeat.mjs`、`dashboard-post.mjs`）。

**🔴 第四個發訊來源在本 repo 外**：`/root/seo-ops`（collect／reflect／brain／weekly，`--site appi.news`）用**自己的** `lib/slack.mjs` 與 `sites/appi.news.json` 的 `slack.channel` 發訊，目前與本站 dev 台同一個頻道。所以「dev 台為什麼這麼吵」不能只查本 repo，查法：`grep -n appi.news /etc/cron.d/seo-ops`、頻道 `grep -A3 '"slack"' /root/seo-ops/sites/appi.news.json`。要改它的收件對象是改那份 json，不是 `report-config.mjs`。

**改完必做**：

- `pnpm test`——行為被單元測試釘住（`scripts/lib/slack*.test.mjs`、`report-config.test.mjs`、`suggestion-blocks.test.mjs`、`weekly-blocks.test.mjs`、`devbot.test.mjs`、`slack-actions-server.test.mjs`、`workers/sports-submission/src/index.test.ts`）。
- 動到 `slack-actions-server.mjs` 或任何 `scripts/cron/*.sh`：push → `/root/appi.news-publisher` `git pull` → `pm2 restart appinews-slack-actions`。**只 push 不 pull、或只 restart 不 pull，都會跑到舊碼。**

## 規則（務必遵守，違反會出事）

- 🔴 **push 不會觸發部署（2026-08-06 起）**：只有**每 15 分鐘排程**與 `gh workflow run deploy.yml`。排程會先過 `check` job（`scripts/deploy-needed.mjs`）判斷有無變動——①上次成功部署後有新 commit ②有排程稿 `publishDate` 到期——都沒有就幾秒結束、不 build 不重傳 artifact。**產線 push 完不等於上線**，要驗線上就自己戳一次再等（實際可能 20–30 分鐘，GitHub 排程常誤點）。為什麼這樣改＝[`lessons/deploy-cadence.md`](./lessons/deploy-cadence.md)。
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
| 選題雷達 | `.claude/skills/tech-radar/`、`scripts/cron/tech-radar.sh` | 只產 tech 候選；**cron 2026-07-07 停用、2026-07-20 重新啟用**（排程查 crontab）|
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

> ⚠️ **排程時間不寫在這裡**（會被改、文件必然過期）。**正本是 crontab**：
> `crontab -l | grep "appi.news-publisher/scripts/cron"`（cron 一律 UTC 計時，看台北時間自己 +8）。
> 本表只記**設計意圖**：每條線的來源、上線方式、Slack 行為——這些不會因為調時間而變。

| 任務 | cron 腳本 | 來源 | 上線方式 | 發 Slack？ |
|---|---|---|---|---|
| 科技選題雷達 | tech-radar.sh | WebSearch | 候選→人點按鈕→寫→自動上線 | ✅（2026-07-07 停用、2026-07-20 重新啟用）|
| **論壇選題雷達** | forum-radar.sh | **PTT 白名單看板**（清單＝forum-signals.mjs 的 `BOARDS`，數量與分類查該檔）| **全自動上架**（站長 2026-08-06 裁示，不設每日上限）| ✅有上架才回報：內容發對應分類台、篇數摘要發 dev 台；**無新題完全靜默** |
| 焦點/ESG | focus-esg.sh | 6 議題群權威來源（focus-esg.mjs）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 連假優惠 | lifestyle-deals.sh | data.gov.tw #14718 假日曆（tw-holidays.mjs）+ 雙鐵 | 事實稿→**待審草稿+發佈鈕** | ✅有連假時發**生活**台/失敗哨兵（2026-07-20 站長指定調整過時段，見下方排程攤開註）|
| 國際編譯台 | international-desk.sh | **GDELT Events 原始檔**（international-select/international-write）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 警消好人好事 | lifestyle-police.sh | 各地警局新聞稿（lifestyle-police.mjs；來源清單 `docs/police-good-deeds-sources.md`）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 便民市政 | lifestyle-civic.sh | 各縣市政府 RSS（清單＝civic-feeds.mjs；本機境外 IP 只抓得到一部分，餘待台灣 proxy）+ civic-ledger 去重 | **全自動上架**（跨縣市統整一篇、有新資料才寫）| ✅有新資料發**生活**台/失敗哨兵 |
| 影片線索整理 | lifestyle-video.sh | 訂閱 YouTube 頻道 RSS（video-feeds.mjs `VIDEO_FEEDS`）+ video-ledger 依 videoId 去重；**抓不到逐字稿**，影片只當線索、事實靠 LLM 上網交叉查證 | **全自動上架**（一片一篇、無篇數上限、≥2 個獨立來源才寫，否則 SKIP）| ✅有上架發**生活**台（列出每一篇，等線上 200 才發）/失敗哨兵；**無產出＝完全靜默**（站長 2026-07-27 明確裁示：只要有文章發就好，**不要**加靜默日心跳，別再提議）|
| 颱風停班課 | lifestyle-typhoon.sh | 人事行政總處 nds.html + NCDR CAP feed | 事實稿→**待審草稿+發佈鈕** | ✅有停課時發**生活**台/失敗哨兵 |
| 高爾夫選手動態雷達 | golf-radar.sh | TPGA/PGA TOUR/LPGA 官方 YouTube RSS＋ESPN／Golf.com 新聞 RSS（清單＝golf-signals.mjs 的 `SOURCES`）+ golf-seen 去重；台灣選手命中＝`TAIWAN_PLAYERS` 名冊 | **全自動上架**（台灣選手動態必報導、其他高爾夫題視情況選題判斷是否夠重大） | ✅有上架發**運動**台（一篇一行帶連結）/失敗哨兵；**無新資料完全靜默** |
| 新文章送 Indexing API | indexing-submit.sh | 線上 sitemap | n/a（送 Google 收錄）| 有送才報 **dev 台** |
| 數據報告 | weekly-report.sh | GA4+GSC | n/a（數據）| ✅報告到**作者群** |
| 維運心跳 | heartbeat.sh | 本地內容存量 + GA（8 區塊儀表板）| n/a（維運）| ✅📊數據心跳＋📊數據總覽兩則到 **dev 台**（皆無 LLM。2026-07-23 移除原步驟③🤖大腦優化，改由 seo-ops 大腦層 UTC 22:20 取代升級）|
| 主題中樞雷達（每週三） | topic-hub-radar.sh | 本地標籤分群 + 內文內聚度 + GSC 曝光 | **全自動建立並上線**（站長 2026-08-07 裁示）：每次最多開 1 個，build/check:links 沒過就不推 | ✅一則到 **dev 台**，附中樞網址與撤除方法（把該 topic 檔 status 改 inactive）。停用開關 `HUB_RADAR_OFF=1` |
| 成長待辦提醒（每週一） | growth-backlog.sh | 本地存量（growth-lint 判準）+ GSC 零點擊名單 | n/a（唯讀，不產文、不 commit、**不做 git reset**——同一個 checkout 是 seo-ops 大腦的工作區）| ✅一則到**作者群**：各項還剩幾篇、與上週的增減、下一批建議做哪 10 篇（無 LLM。站長 2026-08-07 指示要定期提醒）|
| AEO 能見度探針 | aeo-radar.sh | claude-appi 自身 web search 問 AI 引擎 | n/a（寫 geo-citation 帳本，git 外）| ✅🛰摘要到 **dev 台**（純讀不碰 git。2026-07-23 站長指示啟用排程，原只手動）|
| 學被引用內容 | cited-teardown.sh | 競品被引用頁（WebFetch）| 寫 `geo-insights/<beat>.md`→push（newsroom 起草前讀）| ✅🔧摘要到 **dev 台**（按星期輪 7 beat；**會寫 repo**→走 worktree。2026-07-23 站長指示啟用）|
| 健康紀念日·寫作 | health-days.sh | 年曆表 `scripts/lib/health-days.mjs`（筆數查該檔）+ WebSearch 抓當年度官方主題/最新統計 | **排程**：寫 `status: scheduled` + `publishDate <當日>T06:17+08:00` 推 main，當天才轉正 | ✅有排程發**健康**台（附預覽連結）/失敗哨兵；**無紀念日＝完全靜默**（純資料 gate，不叫 Claude）|
| 健康紀念日·準點上線 | health-days-publish.sh | 查 origin/main 有無排今天 06:17 的稿 | `gh workflow run deploy.yml` 觸發部署使排程稿轉正 | ✅有上線發**健康**台（等線上 200 才發）/觸發失敗哨兵；無稿＝靜默 |

- **內容線排程刻意攤開，別再併回早上（2026-07-03；2026-07-20 更新；2026-07-26 加影片線）**：**實際時間一律查 crontab，本檔不列**（列了必然過期）。原則如下。科技台那條的由來＝科技原本只有選題雷達（產候選→Slack→人挑），沒有自動產文線；它排在當時剩下的最大空窗，間距已不到 ≥5h——**因為 24 小時已排滿**。該線**每天只跑一條 track（日期奇偶輪替：偶數日 APPI 編輯部概念解釋／奇數日張饒輝 AI 醫療現場）**，刻意不讓它兩條同跑，否則單日雙倍吃額度。各喚 claude-appi Sonnet；claude-appi 的 session 額度是**每 5 小時一個共用視窗**，曾經全擠在同一個視窗搶額度，排最後的那條每天餓死（先撞 weekly limit、再 session limit）。原則：任兩條相隔 ≥5h 或跨 04:30 reset 邊界，一個視窗最多落一條。**⚠️已知例外（站長 2026-07-20 指定）**：連假優惠與警消落在同一個視窗——但連假優惠**只有臨近國定連假才實發**（平日靜默），撞期風險僅限連假前數日，故接受。要再調時間，日更線（焦點/警消/國際/雷達/便民）務必維持 ≥5h 間隔，別看「都在白天比較整齊」就併回去。（另一個常態吸額度點是 agent.writer 每小時 :40 的 cron-write，跨專案，未動。）
- **論壇選題雷達（每小時、全自動上架）**：**會寫 repo（產文＋配圖）→ 走 worktree**，不在上面的純資料例外之列（2026-08-06 從「只產候選」改成「自動撰寫並上架」時一併改掉）。**配圖一律禁 OpenAI 生圖**（站長要求）：`.sh` 設 `NO_AI_IMAGE=1`，`forum-radar.mjs` 的 `writeAndPublish` 再強制帶一次，任一邊被改掉都還有另一邊擋著。**為什麼每小時跑不違反上面那條 ≥5h 原則**：因為它**大部分時候不喚 Claude**。`scripts/forum-radar.mjs` 的第一階段是純 node——抓 PTT 白名單看板、政治關鍵字過濾、跨次去重帳本（`~/.local/state/appi-news/forum-seen.json`，10 天比對窗）——**沒有新熱題就 `exit 0`，完全不動用 Claude**（同 `lifestyle-typhoon.sh` 的前置 gate 思路）。只有真的撈到新題才往下喚 Haiku（地方板逐則政治判斷）＋ Sonnet（選題）。排 :05 是避開既有各線的分鐘位（:00/:17/:20/:30/:40/:45）。**要改抓取範圍或門檻＝改 `scripts/lib/forum-signals.mjs` 的 `BOARDS`**，別去動 `.sh`。
  - **政治排除三層，第三層不可省**：①看板白名單（Gossiping／HatePolitics／Military／PublicServan 不在名單）②標題關鍵字（擋政黨與政治人物，**刻意不擋**金管會／衛福部這類行政機關的監理與便民題）③LLM 判斷（地方板逐則＋選題 prompt 的全域 backstop）。第三層必要的原因：**PTT 索引標題會被截斷**，實測「伊朗開出這驚人條件 川」的「川普」被切掉、關鍵字擋不到。純 script 不可能做到 100%。
  - **地方板（Tainan／Kaohsiung／TaichungBun）一定要走 LLM 逐則判斷**：實測台南板前 12 篇有 6 篇是南市府 vs 高市府的攻防，而它們字面上沒有政黨也沒有人物名。判斷輸出解析失敗時**保守全部排除**（地方板是加值，寧可少推也不要漏政治）。
  - **抓取併發壓在 3 並帶一次重試**：4 併發實測會被 PTT 零星拒連（一次跑 4 板失敗、單獨重抓全 200）。單板失敗＝該分類整輪沒候選，不能放著。
- **並發保護（重要）**：已從「全域 flock + 共用工作目錄」改為**每支 cron 各開自己的臨時 detached worktree**（`scripts/cron/_worktree.sh` 的 `cron_enter_worktree`，off `origin/main`）→ 互不洗檔、可**真正並行**；寫稿端最後用 `pushToMain`（push `HEAD:main`，撞拒就 fetch+rebase 重試）安全上線。新增這類 cron 一律 `source _worktree.sh` 並 `cron_enter_worktree "<slug>"`。背景見 [`docs/lessons/`](./lessons/)（自動線多工不序列化）。
  - **⚠️ `indexing-submit.sh` 的時間不能隨便動（2026-07-31 排錯）**：Indexing API 配額是 **200/天、per Google Cloud 專案**，且在**太平洋午夜重置**（夏令 07:00 UTC／冬令 08:00 UTC）。原本排 06:00 UTC＝重置前一小時，是一天中配額最枯竭的時刻；加上同一把服務帳號（`ga4-insights@yaocare`，專案 `yaocare`）**被 folk.tw（`index-ping.mjs`）、sutta.io、twdro.net 共用**，appi 每天搶不到額度，log 連日出現「⚠ 配額用盡，本次停在 0 篇」，待送持續累積（實際數字見該 lesson）。改排 **07:30 UTC（重置後）** 後，單次即送出 84 篇、0 失敗、待送歸零。要再調時間務必排在太平洋午夜之後。**根治已完成（2026-07-31）**：appi.news 有自己的 Google Cloud 專案 `appi-news-504107`，服務帳號 `appi-indexing@appi-news-504107.iam.gserviceaccount.com`，金鑰放 `~/.config/appi-news/indexing-sa.json`（權限 600、在 repo 外）。`indexing-submit.mjs` 會優先讀它、缺檔自動退回共用金鑰，並在 log 印出實際使用的帳號（這次故障就是「以為在運作、其實每天送 0 篇」，所以刻意讓它每次都講清楚用的是哪把）。配額從此不與 folk.tw／sutta.io／twdro.net 相爭。
  - **例外**：`indexing-submit.sh`、`heartbeat.sh`、`aeo-radar.sh` 是**純資料/唯讀腳本**（不碰 git 工作區、不喚 Claude 或只喚一次且只寫 git 外帳本），故**不走 worktree**，與其他 cron 無洗檔競態。背景見 [`docs/lessons/google-indexing-api-gray-area.md`](./lessons/google-indexing-api-gray-area.md)。
  - **`cited-teardown.sh` 會寫 repo**（`geo-insights/<beat>.md`）→ 照內容線走 `_worktree.sh` 隔離 + `push HEAD:main` rebase 重試。
  - **`health-days-publish.sh` 是純 shell**（不喚 Claude、不碰工作區，只 `git grep origin/main` + `gh workflow run`）→ **不走 worktree**。同線的 `health-days.sh` 會寫 repo，照內容線走 worktree + `pushToMain`。
- **健康紀念日為什麼要兩支 cron（2026-07-28 新增，別合併成一支）**：文章能否公開取決於 **build 當下的時間**有沒有超過 `publishDate`（`src/utils/content.ts` 的 `isPublic`）。`deploy.yml` **不在 push 時 build**（2026-08-06 起拿掉 push 觸發），只有**每 15 分鐘的排程**與**手動 `workflow_dispatch`**會，**排程對不準 06:17**，所以非得在 06:17 準點戳一次 `workflow_dispatch` 不可。寫作與上線刻意分離還有兩個好處：T-2 寫失敗隔天還能重試；排程稿只產 noindex 預覽頁，站長有兩天可從 `/admin` 預覽修改。從觸發到線上可讀約 3-5 分鐘，故**文章時間戳是 06:17、實際可見約 06:21**（站長 2026-07-28 在「時間戳準」與「可見準」之間選了前者）。
- **健康紀念日的用量幾乎為零**：`health-days.sh` 在建 worktree／喚 Claude **之前**先用 node 讀年曆表判斷「兩天後有沒有紀念日」，沒有就 `exit 0`。一年 365 天裡只有 51 天真的會叫 Claude（同 `lifestyle-typhoon.sh` 的前置 gate 思路）。要改提前天數用環境變數 `HEALTH_DAYS_LEAD`（預設 2）。**gate 掃的是 T+1…T+LEAD 的區間、不是剛好第 LEAD 天**——某天寫失敗時該篇隔天仍在區間內，配合「該年度已寫過就跳過」的帳本天然重試一次。
- **AEO 學習環也吃 claude-appi 額度（2026-07-23 啟用排程）**：`aeo-radar.sh` 與 `cited-teardown.sh` 皆喚 claude-appi Sonnet，刻意排在午後空窗——避開清晨的選題雷達與 seo-ops 反思/大腦、傍晚的國際線尖峰。撞週限額 regex 偵測、當日 no-op、可回滾（同其他 claude-appi cron）。
- **維運/系統訊號改發 dev 台（2026-06-30）**：原本「cron 一律不發 dev、dev 只給 @bot」的政策放寬——**非內容的維運訊號**（`heartbeat.sh` 的 📊 數據心跳＋🤖 大腦優化、`indexing-submit.sh` 的索引提交回報）改走 **dev 台**（`cron-report.mjs --dev` → `DEV_CHANNEL`），與內容/值勤回報（作者群、分類台）分流，維運訊號不再吵作者群。內容類 cron 仍照舊發作者群/分類台。🤖 大腦優化是**報告型**（claude-appi Sonnet 判讀 SEO/內容機會，撞週限會退化成只報確定性事實、不沉默），不自動改碼。
- **國際是長跑**（最多 8 區×3 篇、逐篇 Claude 撰寫，每則 6~9 分鐘）；各 cron 各自 worktree 並行，不再彼此卡鎖。**沒有時間上限**——`INTL_TIME_BUDGET_MS` 預設 0（不限），只留當緊急手煞車（設 >0 才生效）。要降耗時優先調 `--max`。
- **國際的寫作前三層閘門（2026-07-28 新增，`scripts/lib/international-gate.mjs`）**：GDELT 選題完全無狀態、且標地大量錯誤，實測一晚 24 則候選約三分之二注定被寫作端判 SKIP（同事件轉載重複、非國際新聞）。故在動用寫作前先跑：① curl 抓 `<title>` 後**同批同事件去重**（Jaccard ≥0.5）；② **跨日 seen 帳本** `~/.local/state/appi-news/international-seen.json`（14 天窗、45 天保留，`INTL_SEEN_PATH` 可覆寫；只記「拿到明確結論」的題，infra 失敗不記才會重試）；③ **一次 Haiku 批次篩選**標題。2026-07-28 首跑 24→10。**任何一層自己壞掉一律 fail-open 全部放行**，閘門絕不能變成新的「整晚 0 篇」來源。為什麼＝[`docs/lessons/auto-publish-pipeline-traps.md`](./lessons/auto-publish-pipeline-traps.md) §G。
- **國際 0 篇不再靜默（2026-07-28）**：`international-desk.sh` 原本無 `PUBLISHED` 就完全不發 Slack，導致 7/27 整晚 0 篇沒有任何告警。現改為**內容頻道仍不吵、但發一則到 dev 台**，帶閘門統計與逐則結論（`→ [區] 家數`／`NEW`／`UPDATE`／`SKIP`／`⚠️`／`⛔`）供判讀是「今天真的沒題」還是「產線壞了」。
- **論壇雷達的資料來源是 pttweb.cc，不是 ptt.cc（2026-08-08 起）**：ptt.cc 對本機 IP 直接 TCP 逾時（DNS 正常、80/443 都不通，同機連其他站正常＝對方擋出口 IP），30 板全軍覆沒、每小時空跑了兩天沒人發現，因為「沒有新熱題」是常態、設計成安靜結束。現在主來源改抓 `https://www.pttweb.cc/bbs/<板>/hot/24h`（自帶推文數與含 `[標籤]` 的完整標題），ptt.cc 留在 `SOURCES` 最後當退路，哪天解封會自動用回原生來源。**換來源要成對改 `url + parse + looksValid` 並補固定 HTML 測試**（`scripts/lib/forum-signals.mjs`）。成功一律不發 Slack（**上架內容由 `forum-radar.mjs` 直接報到各分類台**，dev 不再收跨分類總表——同一批東西講兩次；沒有新熱題更是常態，每小時發會洗頻）。同時補了守門：候選 0 且**所有板都失敗**時印 `FORUM_RESULT=FAIL` → ❌ 進 dev 台。節流規則是**一波故障的第 1 輪一定報、之後同一波每 6 小時再報一次**（狀態在 git 外帳本 `$XDG_STATE_HOME/appi-news/forum-fetch-alert.json`），訊息固定帶「連續第 N 輪、約 X 小時、起於某時」——只看「距上次報過多久」會讓「剛壞掉」跟「壞了一整夜」長得一模一樣（2026-08-08 踩過）。抓得到候選就清帳本結束該波；**dry-run 只算不寫**，免得手動跑剛好撞上故障時吃掉下一輪 cron 的告警。冷門板 24 小時內真的沒熱門文是正常的，靠 `looksValid` 認版面區分「今天沒題」與「來源壞了」。
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
