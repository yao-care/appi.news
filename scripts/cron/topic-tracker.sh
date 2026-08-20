#!/usr/bin/env bash
# 每週一 cron：主題追蹤 → 主題追蹤頻道。
#   ① 主層一則「主題總表」（各主題收錄文章加總的曝光/點擊/排名，與前一週比）
#   ② 每個主題一條 thread：父訊息只發一次；之後只有收錄文章增減才回覆，沒有就安靜
# 純資料（GA4+GSC+本地 frontmatter），**不喚 Claude**，不吃 claude-appi 額度。
# 純讀取：不碰 git 工作區（帳本在 ~/.config/appi-news/topic-threads.json）→ 不需 worktree、不需 flock。
# 呈現規格與退路見 scripts/lib/topic-tracker.mjs 檔頭；失敗訊息以 ❌ 開頭 → 自動進 dev 台。
TASK="主題追蹤"
source "$(dirname "$0")/_runner.sh"
cron_env --google

cron_run "" --timeout 900 --tail 500 -- node scripts/topic-tracker.mjs
exit 0
