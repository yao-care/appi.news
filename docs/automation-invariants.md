# 自動化鐵則 checklist（單一正本）

> 所有 appi.news 自動化（cron／自動產文／發佈端）共用、**不可違反**的規則。新增或修改任何自動化前先過一遍這份。
> - **為什麼這樣做** → [`docs/lessons/`](./lessons/)（問題→原因→解法）。
> - **排程／模型總表** → [`docs/SERVER_HANDOFF.md`](./SERVER_HANDOFF.md) §cron 總表（時間與模型的唯一正本）。

## 帳號與模型
- **全站單一帳號 `claude-appi`**（`CLAUDE_CONFIG_DIR=~/.claude-appi`）：cron／自動產文與人的互動開發都走它（2026-07-28 起取消雙帳號分工）。用量池與憑證因此共用——互動作業會吃到產線配額，憑證失效則兩邊一起啞。
- 每個 `claude-appi -p` 呼叫**必帶 `--model`**：產文／選題／週報 → `claude-sonnet-5`、newsroom viewpoint 查核 gate → `haiku`。**不帶就會吃全域預設 Opus、燒爆週用量上限**（出過事 → [`automation-model-and-account-split.md`](./lessons/automation-model-and-account-split.md)）。
- **判斷成功不能只看 exit code**：`claude-appi` 撞用量上限／拒答會 **exit 0** 且只印 stdout。`.sh` 用失敗 regex（含 `weekly limit|usage limit`）、`.mjs` 掃 `stdout` 限額字樣，才算失敗。

## 排程與時區
- server cron 一律以 **UTC** 計（這台 Vixie cron 忽略 `CRON_TZ`），寫排程手動換算台北（UTC+8）。
- appi.news 所有 cron 收在 crontab 末段「**APPI NEWS**」單一區塊，勿再散落到其他專案之間。
- 改 crontab 後做**集合稽核**：非-appi 排程行 old vs new 應完全一致；每支 `scripts/cron/*.sh` 都要有對應排程行（別只留孤兒註解）。改前先備份（`crontab -l > 備份`）。

## 並發與發佈端
- 會動 git 工作區的 cron 各自開臨時 worktree（`scripts/cron/_worktree.sh` 的 `cron_enter_worktree`，off `origin/main`）→ 並行、互不洗檔，**不用 flock**。純資料腳本（`indexing-submit.sh`）不走 worktree。
- 改 `.sh` 包裝或發佈端程式（`slack-actions-server.mjs` 等）：**push → `/root/appi.news-publisher` `git pull` →（server 端）`pm2 restart appinews-slack-actions`**。只 push 不 pull，cron 跑的還是舊 `.sh`；只 restart 不 pull，server 載到舊碼。
- **配圖硬性 gate 不可繞過**：缺 `coverImage`／封面檔不存在／內文 0 圖 → 中止不發、留工作區待補。
- 自動線 `publishDate` **用系統時間蓋**，別讓模型填（模型無可靠時鐘，會排到未來變排程稿）。
  - **唯一例外＝健康紀念日線**：它是刻意排程的，`publishDate` 用**年曆表算出的目標日 06:17** 蓋掉模型寫的（同樣不信任模型，只是蓋成排程時間而非現在）。
- **排程稿不會自己上線**：`isPublic()` 比對 **build 當下時間**，靜態站沒有 runtime。要在非整點時刻上線，必須另排一支 cron 在那一刻 `gh workflow run deploy.yml`（`deploy.yml` 的 6 小時 cron 只落台北 02/08/14/20）。從觸發到線上可讀約 3-5 分鐘，「時間戳準」與「可見時刻準」二選一。為什麼＝[`lessons/annual-observance-scheduling.md`](./lessons/annual-observance-scheduling.md)。

## 故障不等於模型的判斷
- 每條撰寫產線都靠「模型最後印一行 `XXX_RESULT=…`」回報結果，parser 解析不出來時會標 `infra: true`。**那是故障，不是編輯判斷**，兩者絕不可走同一條路。逐項檢查你的分支：
  - **不可記進去重帳本**：記了等於把故障固化成「已判過、不再重覆提供」，那些題再也不會被提，而且不會自己復原（`lifestyle-civic` 出過，見 [§G](./lessons/auto-publish-pipeline-traps.md)）。帳本只記**真的拿到判斷**的候選。
  - **不可當終止條件**：解析失敗 `break` 整輪＝「一次漏印就收工」（`focus-esg` 出過）。應續跑下一則，另設**次數上限**防整體故障空燒。
  - **不可吃掉時間預算／額度**：故障耗掉的時間不是產出，不計入預算。
  - **已寫好的稿要撿回來**：模型可能漏印結果行但稿已寫好（讀原文／交叉查證的 token 早燒完），照舊碼會隨 cron worktree 的 `trap` 一起刪掉。用 `scripts/lib/changed-articles.mjs` 的 `salvageArticle()` 撿回，再走該線既有的缺圖／去 AI 腔／`check:links` 各關。
- 判準＝**「這個 break／return／記帳本的分支，故障和判斷會不會走到同一條路？」** 會 → 拆開。

## 對外抓取的省用量前置 gate
- 像颱風線那種「先便宜判斷再決定要不要動用 Claude」的 gate（`lifestyle-typhoon.sh` 抓 `nds.html`）一律 **fail-open**：抓不到／非 200／格式不符就**照走完整流程**，絕不因抓取失敗而漏報。
- **選題前置閘門同一條規則**（國際線 `scripts/lib/international-gate.mjs`：同批同事件去重 → 跨日 seen 帳本 → 一次 Haiku 批次篩選）：任何一層自己壞掉（抓不到標題、篩選輸出無法解析、模型呼叫失敗）一律**全部放行**。閘門是用來省錢的，**絕不可變成新的「整晚 0 篇」來源**。代價要講清楚：fail-open 時會回到「候選全跑」（國際約 24 則、~3 小時），這是刻意選的——寧可多花額度，不要漏發。

## 日誌
- 集中 `/var/log/appi-news/<job>.log`（**不放 `/tmp`**），已設 `/etc/logrotate.d/appi-news`（每週切、留 4 份）。
