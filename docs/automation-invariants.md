# 自動化鐵則 checklist（單一正本）

> 所有 appi.news 自動化（cron／自動產文／發佈端）共用、**不可違反**的規則。新增或修改任何自動化前先過一遍這份。
> - **為什麼這樣做** → [`docs/lessons/`](./lessons/)（問題→原因→解法）。
> - **排程／模型總表** → [`docs/SERVER_HANDOFF.md`](./SERVER_HANDOFF.md) §cron 總表（時間與模型的唯一正本）。

## 帳號與模型
- 自動化一律用 **`claude-appi`**（營運帳號，`CLAUDE_CONFIG_DIR=~/.claude-appi`）；人在 dev 互動開發才用 `claude`。
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

## 對外抓取的省用量前置 gate
- 像颱風線那種「先便宜判斷再決定要不要動用 Claude」的 gate（`lifestyle-typhoon.sh` 抓 `nds.html`）一律 **fail-open**：抓不到／非 200／格式不符就**照走完整流程**，絕不因抓取失敗而漏報。

## 日誌
- 集中 `/var/log/appi-news/<job>.log`（**不放 `/tmp`**），已設 `/etc/logrotate.d/appi-news`（每週切、留 4 份）。
