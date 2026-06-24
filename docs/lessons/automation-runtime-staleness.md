# 自動化「改了卻沒生效」：程式到底從哪一份 checkout 跑

> 摘要：cron 與 Slack server 跑在發佈隔離 checkout `/root/appi.news-publisher`，不是 dev 目錄；改了不同類型的檔，生效條件不同。還有 cron 一律以 UTC 跑。｜ 範圍：自動化/部署 ｜ 狀態：已知 ｜ 日期：2026-06

對應 SOP：[`docs/SERVER_HANDOFF.md`](../SERVER_HANDOFF.md)（子專案 2/3、cron 總表）、根 `CLAUDE.md` §自動發文 pipeline。

## A. cron 一律 UTC（`CRON_TZ` 被忽略）

- **問題**：crontab 裡寫 `CRON_TZ=Asia/Taipei` + 註解台北時間，實際卻在 UTC 觸發，差 8 小時。
- **原因**：本機 cron 是 Vixie `cron 3.0pl1`，**不支援 `CRON_TZ`**；系統時區 `Etc/UTC`。（2026-06-16 用 sidekiq log 的 START 時間驗證：落在 UTC 整點，證明指令被忽略。）
- **解法**：寫 cron 一律**手動換算成 UTC 寫死**，別靠 `CRON_TZ`。例：台北週一 06:17 → UTC 週日 22:17 → `17 22 * * 0`。

## B. 改 cron 的 `.sh` 包裝 → 要 pull publisher 才生效

- **問題**：改了 `scripts/cron/*.sh`（如 international-desk.sh / tech-radar.sh）已 merge，排程卻仍跑舊版。
- **原因**：cron 執行的是 `/root/appi.news-publisher/scripts/cron/<task>.sh`。腳本裡 `cron_enter_worktree` 只把**工作目錄** cd 進臨時 worktree（off origin/main），但**正在執行的 `.sh` 檔本身是 publisher 主 checkout 那一份**，而 publisher 主 checkout 不會被 worktree 機制自動更新（`_worktree.sh` 只 `git fetch`、不 reset 主樹）。所以改 `.mjs`/SKILL（cd 進 worktree 後才 `node` 跑）會生效，改 `.sh` 不會。
- **解法**：改任何 `.sh` 包裝後，push 完要 `cd /root/appi.news-publisher && git fetch origin && git pull --ff-only origin main`。驗證：`git -C /root/appi.news-publisher rev-parse --short HEAD` 應＝`origin/main`。

## C. 改 Slack server 程式 → pull publisher + restart（只 restart 載舊碼）

- **問題**：改了 `scripts/slack-actions-server.mjs`，`pm2 restart` 後跑的還是舊碼。
- **原因**：pm2 服務 `appinews-slack-actions` 跑在 publisher checkout，是長駐進程，啟動時載入 publisher 當下的程式；publisher 只在每篇產文 job 起跑時才 reset，server 進程本身不會自己更新。
- **解法**：三步缺一不可——① push 到 `origin/main`；② `cd /root/appi.news-publisher && git pull --ff-only origin main`；③ `pm2 restart appinews-slack-actions`。

> 共同心法：**自動化的程式從 publisher checkout 跑，不是你正在編輯的 dev 目錄。** 改完先想「這份檔在執行當下會從哪裡被載入」。相關：[auto-publish-pipeline-traps.md](./auto-publish-pipeline-traps.md)、[commit-hygiene-shared-checkout.md](./commit-hygiene-shared-checkout.md)。
