# 自動化鐵則 checklist（單一正本）

> 所有 appi.news 自動化（cron／自動產文／發佈端）共用、**不可違反**的規則。新增或修改任何自動化前先過一遍這份。
> - **為什麼這樣做** → [`docs/lessons/`](./lessons/)（問題→原因→解法）。
> - **排程／模型總表** → [`docs/SERVER_HANDOFF.md`](./SERVER_HANDOFF.md) §cron 總表（時間與模型的唯一正本）。

## 帳號與模型
- **全站單一帳號 `claude-appi`**（`CLAUDE_CONFIG_DIR=~/.claude-appi`）：cron／自動產文與人的互動開發都走它（2026-07-28 起取消雙帳號分工）。用量池與憑證因此共用——互動作業會吃到產線配額，憑證失效則兩邊一起啞。
- 每個 `claude-appi -p` 呼叫**必帶 `--model`**：產文／選題／週報 → `claude-sonnet-5`、newsroom viewpoint 查核 gate → `haiku`。**不帶就會吃全域預設 Opus、燒爆週用量上限**（出過事 → [`automation-model-and-account-split.md`](./lessons/automation-model-and-account-split.md)）。
- **判斷成功不能只看 exit code**：`claude-appi` 撞用量上限／拒答會 **exit 0** 且只印 stdout。`.mjs` 一律走 `scripts/lib/claude-cli.mjs` 的 `runClaudeArticle` 三態（**quota＝帳號層級，中止整批**；fail＝單則失敗，跳過該則；ok），不自抄 regex——曾漂移成 4 種語意，7 條線撞限額後照樣逐則狂打空跑（[§H](./lessons/auto-publish-pipeline-traps.md)）。`.sh` 的第二道網＝`scripts/cron/_runner.sh` 的 `CRON_LIMIT_RE`（經 `cron_run`／`cron_failed`），別在各 `.sh` 重抄 regex。

## 排程與時區
- server cron 一律以 **UTC** 計（這台 Vixie cron 忽略 `CRON_TZ`），寫排程手動換算台北（UTC+8）。
- appi.news 所有 cron 收在 crontab 末段「**APPI NEWS**」單一區塊，勿再散落到其他專案之間。
- 改 crontab 後做**集合稽核**：非-appi 排程行 old vs new 應完全一致；每支 `scripts/cron/*.sh` 都要有對應排程行（別只留孤兒註解）。改前先備份（`crontab -l > 備份`）。

## 並發與發佈端
- 🔴 **新增 `scripts/cron/*.sh` 一定要用 `REPO="$(cd "$(dirname "$0")/../.." && pwd)"`**（本檔在 `scripts/cron/` 底下，往上**兩層**才是 repo 根）。少一層會變成 `scripts/scripts/…` MODULE_NOT_FOUND，**而且連 `cron-report.mjs` 都找不到 → 失敗告警一起啞掉，變成完全靜默的空跑**（2026-08-06 forum-radar 踩過，連空跑兩輪才被發現）。**新排程上線後，第一次觸發時間過了就去看 `/var/log/appi-news/<job>.log`**，不要等它自己回報。
- 會動 git 工作區的 cron 各自開臨時 worktree（`scripts/cron/_worktree.sh` 的 `cron_enter_worktree`，off `origin/main`）→ 並行、互不洗檔，**不用 flock**。純資料腳本（`indexing-submit.sh`）不走 worktree。
- 改 `.sh` 包裝或發佈端程式（`slack-actions-server.mjs` 等）：**push → `/root/appi.news-publisher` `git pull` →（server 端）`pm2 restart appinews-slack-actions`**。只 push 不 pull，cron 跑的還是舊 `.sh`；只 restart 不 pull，server 載到舊碼。
- 🔴 **失敗／略過的訊息一律進 dev 台**（2026-08-08 站長裁示，無例外）：**訊息開頭寫 `❌`（失敗）或 `⚠️`（略過／未開始）**，`report-config.mjs` 的 `isAlert()` 會強制路由到 `DEV_CHANNEL`，不必也不要帶 `--category`。分類台與作者群只留「有產出、人要看的東西」。**新產線只要把開頭 emoji 寫對就自動符合**；反過來說，**成功訊息不可用 ❌/⚠️ 開頭**，否則會被判成告警送錯台。
- 🔴 **「自動上架 N 篇」一律帶連結**：每篇都要列標題＋網址（協調器印 `PUBLISHED=<url> ｜ <title>`，`.sh` 組 `• 標題\n  <url>`），只報篇數不算數。已上架的文章不要走 `suggestionBlocks`（那是未寫候選用的，沒連結又會掛「我要寫這題」鈕）。
- 🔴 **要發 Slack 一律走既有的四支入口**（`cron-report.mjs`／`slack-post.mjs`／`notify-pending-draft.mjs`／`weekly-report-post.mjs`），**不可在 `.sh`、skill 或新腳本裡自己 curl `chat.postMessage`、也不可寫死頻道 ID**——頻道與授權名單的 SOT 是 `scripts/lib/report-config.mjs`，繞過它的訊息在改頻道時必然被漏掉。改發訊對象或文案前先讀 [`SERVER_HANDOFF.md`](./SERVER_HANDOFF.md) §Slack 發訊地圖（四層分工、各入口路由優先序、盤點指令、三個已知逃出頻道表的孤島）。
- **配圖硬性 gate 不可繞過**：缺 `coverImage`／封面檔不存在／封面外連熱連結／**封面不符 Discover 規格（非橫式或寬 <1200，SOT＝`scripts/lib/cover-spec.mjs`）**／內文 0 圖／**封面與內文圖重複** → 中止不發、留工作區待補。封面規格是**雙層機械保證**：取圖端 `get-image.mjs`（stock 候選淘汰、embed 拒收、生成驗收）＋出口端 `check-cover-spec.mjs`（各產線寫檔後自檢）。為什麼＝[`lessons/discover-image-and-meta-signals.md`](./lessons/discover-image-and-meta-signals.md)（2026-08-11 追記）。
- **產線層級要禁 AI 生圖，就在該線的 `.sh` 與協調器**兩處**都設 `NO_AI_IMAGE=1`**（論壇雷達的作法）：只設一處，另一處被改掉就破功，而事後從檔案驗不出來。
- **要禁 AI 生圖就設 `NO_AI_IMAGE=1`**（`get-image.mjs` 的兩個生圖進入點會直接 throw，含 `--generate`）。**只在 prompt 寫「不要生圖」不算數**，模型會忽略；而且 sharp 會剝掉圖片 metadata，事後**無法**驗證哪張是生成的，只能整批重跑。禁生圖後封面與內文容易撞成同一張圖庫照（同 query 回同一張），取圖的 `--query` 必須錯開。為什麼＝[`lessons/no-ai-image-batch.md`](./lessons/no-ai-image-batch.md)。
- 🔴 **新增產線一定要接 `GROWTH_PROMPT`**（`scripts/lib/growth-prompt.mjs`，與 `RISKS_PROMPT` 同層放進起草 prompt 陣列）：內鏈／`topics`／標題長度／開頭直答這些事只能在寫作當下做，事後補要逐篇重讀。只把規則寫進自己那條線的 prompt＝下一次規則漂移的起點。已接清單查法與 SOP＝[`growth-playbook.md`](./growth-playbook.md) §產線接線點，為什麼＝[`lessons/growth-three-gates.md`](./lessons/growth-three-gates.md)。
- **成長規則自檢是 report-only、不可升成硬 gate**：各線在 `check-tags` 旁跑 `growth-lint.mjs` 只把結果印進 cron log。內鏈是品質不是正確性，拿它擋半夜的自動產線＝製造無人處理的停產。要嚴格檢查是人工帶 `--strict` 的事。
- **平行批次要禁止模型自己跑 `pnpm build` / `check:links`**：多個進程搶同一個 `dist/` 會產生 ENOENT 競態、白白耗時。build 由外層批次驅動做一次。
- 自動線 `publishDate` **用系統時間蓋**，別讓模型填（模型無可靠時鐘，會排到未來變排程稿）。
  - **全自動上架的線要明確給「今天」**：不給的話 `newsroom-write` 會退回「下一個沒有文章的日子」，而日更早把未來一週佔滿，結果排到八天後（2026-08-06 論壇雷達改自動上架時實測）。
  - **事實稿要自動上線得在工單帶 `autoPublish: true`**（覆寫 `kind: factual` 的「人工審後發」）。這是**產線層級的明示豁免**，不要改 `KINDS`——那會讓全站事實稿都變自動上線。
  - **唯一例外＝健康紀念日線**：它是刻意排程的，`publishDate` 用**年曆表算出的目標日 06:17** 蓋掉模型寫的（同樣不信任模型，只是蓋成排程時間而非現在）。
- 🔴 **push 不會觸發部署**（2026-08-06 起）：只有每 15 分鐘的排程與 `gh workflow run deploy.yml` 會。**產線 push 完不等於上線**，回報措辭別寫成「已上線」（要驗線上就自己戳一次再等）。
  - 排程會先過 `check` job（`scripts/deploy-needed.mjs`）判斷有無變動：①上次成功部署後有新 commit ②有排程稿 `publishDate` 到期。**第二條不可省**——排程稿靠 build 當下時間轉正，只看 commit 會讓它們永遠上不了線。抓不到上次部署資訊一律 fail-open 照部署。為什麼這樣改＝[`lessons/deploy-cadence.md`](./lessons/deploy-cadence.md)。
- **排程稿不會自己上線**：`isPublic()` 比對 **build 當下時間**，靜態站沒有 runtime。要在非整點時刻上線，必須另排一支 cron 在那一刻 `gh workflow run deploy.yml`（`deploy.yml` 的 6 小時 cron 只落台北 02/08/14/20）。從觸發到線上可讀約 3-5 分鐘，「時間戳準」與「可見時刻準」二選一。為什麼＝[`lessons/annual-observance-scheduling.md`](./lessons/annual-observance-scheduling.md)。

## 故障不等於模型的判斷
- 每條撰寫產線都靠「模型最後印一行 `XXX_RESULT=…`」回報結果，parser 解析不出來時會標 `infra: true`。**那是故障，不是編輯判斷**，兩者絕不可走同一條路。逐項檢查你的分支：
  - **不可記進去重帳本**：記了等於把故障固化成「已判過、不再重覆提供」，那些題再也不會被提，而且不會自己復原（`lifestyle-civic` 出過，見 [§G](./lessons/auto-publish-pipeline-traps.md)）。帳本只記**真的拿到判斷**的候選。
  - **不可當終止條件**：解析失敗 `break` 整輪＝「一次漏印就收工」（`focus-esg` 出過）。應續跑下一則，另設**次數上限**防整體故障空燒。
  - **不可吃掉時間預算／額度**：故障耗掉的時間不是產出，不計入預算。
  - **已寫好的稿要撿回來**：模型可能漏印結果行但稿已寫好（讀原文／交叉查證的 token 早燒完），照舊碼會隨 cron worktree 的 `trap` 一起刪掉。用 `scripts/lib/changed-articles.mjs` 的 `salvageArticle()` 撿回，再走該線既有的缺圖／去 AI 腔／`check:links` 各關。
- 判準＝**「這個 break／return／記帳本的分支，故障和判斷會不會走到同一條路？」** 會 → 拆開。

## 高頻 cron 的前置 gate（額度保護）

- **想加「高頻」（每小時或更密）的 cron，先問「這一輪一定要喚模型嗎」**。`claude-appi` 的額度是每 5 小時一個共用視窗、24 小時排程已排滿，每輪都喚模型會餓死既有內容線。
- 正確作法＝**純資料層先行**：抓取、過濾、去重全用 node 做完，**沒有新東西就 `exit 0`、完全不動用 Claude**（`lifestyle-typhoon.sh` 的停班課 gate、`forum-radar.mjs` 的 PTT 去重帳本都是這個形狀）。判準：**跑一百次裡有幾次會真的需要模型？**
- **高頻線無產出時必須完全靜默**（不發 Slack），否則會把頻道洗爆。

## 對外抓取的省用量前置 gate
- 像颱風線那種「先便宜判斷再決定要不要動用 Claude」的 gate（`lifestyle-typhoon.sh` 抓 `nds.html`）一律 **fail-open**：抓不到／非 200／格式不符就**照走完整流程**，絕不因抓取失敗而漏報。
- **選題前置閘門同一條規則**（國際線 `scripts/lib/international-gate.mjs`：同批同事件去重 → 跨日 seen 帳本 → 一次 Haiku 批次篩選）：任何一層自己壞掉（抓不到標題、篩選輸出無法解析、模型呼叫失敗）一律**全部放行**。閘門是用來省錢的，**絕不可變成新的「整晚 0 篇」來源**。代價要講清楚：fail-open 時會回到「候選全跑」（國際約 24 則、~3 小時），這是刻意選的——寧可多花額度，不要漏發。

## 日誌
- 集中 `/var/log/appi-news/<job>.log`（**不放 `/tmp`**），已設 `/etc/logrotate.d/appi-news`（每週切、留 4 份）。
