# Server 交接 — 給在伺服器上運作的 Claude

> 你被部署到伺服器上跑 APPI News 自動化。**先讀 repo 根的 `CLAUDE.md`（專案鐵則），再讀本檔。**
> 本機開發機的 `~/.claude` memory 不會跟著 git 走，所以這份文件把你需要的操作重點都帶上了。

## 你的工作

- **子專案 1**：每週「數據週報 → Slack」，技能 `/weekly-report`，由 cron 觸發。
- **子專案 2（已上線）**：半自動產文。`daily-tech-radar`（cron 一天三次）發候選題到 Slack → 作者點「我要寫這題」→ `slack-actions-server`（pm2 `appinews-slack-actions`）觸發 `scripts/newsroom-write.mjs` 起草＋配圖 gate＋查證 → 排程上線。詳見最後一節與 repo 根 `CLAUDE.md` §自動發文 pipeline。

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
| 選題雷達 | `.claude/skills/daily-tech-radar/`、`scripts/cron/daily-tech-radar.sh` | 只產 tech 候選；cron UTC 21:20 / 03:11 / 10:18 |
| 自動產文 | `scripts/newsroom-write.mjs`（沿用 newsroom skill 的文風/查證） | headless 起草＋配圖 gate，寫 `result.json` |
| Slack server | `scripts/slack-actions-server.mjs`、pm2 `appinews-slack-actions` | 收按鈕事件觸發產文並回報 |
| 去重帳本 | `scripts/topic-ledger.mjs`、`/root/.local/state/appi-news/suggested-topics.json` | 與週報共用，避免撞題 |
| 發佈隔離 checkout | `/root/appi.news-publisher`（`PUBLISH_ISOLATED=1`） | 產文在此跑，每篇 reset 到 `origin/main` |

> **改發佈端程式要連動**：push → 在 `/root/appi.news-publisher` `git pull` → `pm2 restart appinews-slack-actions`（**只 restart 會載到舊碼**）。資料層仍沿用 `scripts/lib/google-data.mjs`。

## 子專案 3：多分類自動內容（國際／生活／運動）

六大構想分頻道做，**各頻道有各自的萃取邏輯與來源**（不是同一套雷達）。Slack 已搬到專屬 appi.news workspace、一分類一頻道（`scripts/lib/report-config.mjs` 的 `CATEGORY_CHANNELS`、bot `appi_claude`）。

### cron 總表（全部跑在 publisher checkout、UTC 計時）

| 任務 | cron 腳本 | UTC | 台北 | 來源 | 上線方式 | 發 Slack？ |
|---|---|---|---|---|---|---|
| 科技選題雷達 | daily-tech-radar.sh | 21:20 / 03:11 / 10:18 | 05:20/11:11/18:18 | WebSearch | 候選→人點按鈕→寫→自動上線 | ✅候選到**科技**台 |
| 國際編譯台 | intl-desk.sh | 02:30 | 10:30 | **GDELT Events 原始檔**（intl-select/intl-write）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 連假優惠 | lifestyle-deals-roundup.sh | 02:00 | 10:00 | data.gov.tw #14718 假日曆（tw-holidays.mjs）+ 雙鐵 | 事實稿→**待審草稿+發佈鈕** | ✅有連假時發**生活**台/失敗哨兵 |
| 颱風停班課 | typhoon-closure-watch.sh | 每小時（5–11 月） | 每小時 | 人事行政總處 nds.html + NCDR CAP feed | 事實稿→**待審草稿+發佈鈕** | ✅有停課時發**生活**台/失敗哨兵 |
| 警消好人好事 | police-good-deeds.sh | 週三 06:30 | 週三 14:30 | 各地警局新聞稿（police-good-deeds.mjs；來源清單 `docs/police-good-deeds-sources.md`）| **全自動上架** | ⚠️**僅失敗哨兵**（成功不發）|
| 每週數據週報 | weekly-report.sh | 週日 22:17 | 週一 06:17 | GA4+GSC | n/a（數據）| ✅週報到**作者群** |

- **並發保護（重要）**：所有 publisher-checkout cron 開頭都用 `flock -w 1800 /tmp/appi-publisher-cron.lock` 序列化——因為每支都 `git reset --hard origin/main`，若兩支同時跑會互洗未提交工作。同時只放一支，取鎖逾時就略過本次。**新增 cron 務必沿用此 flock 樣板。**
- **國際是長跑**（最多 8 區×3 篇、逐篇 Claude 撰寫，單次可能數小時）；其他 cron 在此期間取不到鎖會略過重試，故國際排最前（02:30）、警消刻意排到 06:30 避開。要降國際耗時就調 `intl-write.mjs` 的 `--max`。
- **成功不發 Slack 的兩條**（國際、警消）為全自動上架，目前只在失敗時發哨兵。若要「上架後也通知」，需在 cron 成功分支加 slack-post（尚未做）。

### 各頻道維護重點
- **國際**：來源是 GDELT **原始檔**（搜尋 API 會被擋）；選題用「來源家數」相對統計挑每區突出題；撰寫嚴格基於事實、附原文連結、圖片可授權否則跳過（不用 AI 圖）、同事件有進展則更新原文（故事線、30 天窗）。詳見記憶 `intl-desk-gdelt`。
- **生活·颱風／優惠**：事實稿，`kind: factual` → 產「待審草稿」（status:scheduled+遠未來日）+ Slack 發佈鈕，**人工核可才上線**（`newsroom-publish.mjs` 轉正）。
- **生活·警消**：跟官方原稿具名、不轉載版權照、附原文連結驗活、圖庫示意圖、全自動上架。境外 IP 約 13–14 家警局可抓、8 家被地理/WAF 擋（當次略過）。
- **運動**：**純拉式**（學生賽事），無 cron、無自動產文。投稿＝`workers/sports-submission`（**待部署**：建 Slack webhook→`wrangler deploy`→填 `submit.astro` 的 WORKER_URL）+ `/sports/submit/`（運動分類頁有入口）。邀請＝`docs/sports-student-invite-windows.md`（7 官方機構窗口）+ `sports-invite-draft`（只起草、人工送）。
- **樂齡/長照**：暫不做（無可靠結構化資料源）。
