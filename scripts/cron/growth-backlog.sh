#!/usr/bin/env bash
# 每週 cron：成長工作待辦盤點 → 發 Slack 提醒（作者群）。
#
# 為什麼要有這支：補內鏈／FAQ／主題、升級零點擊頁這批工作短期不做也不會壞，
# 全靠人記一定會無限延後；進度又刻意不寫進文件（會過期）。這支每週現算一次、
# 和上週快照相減，直接講「做掉幾篇、還剩幾篇、下一批做誰」。站長 2026-08-07 指示。
#
# 純資料：只讀本地檔案 + GA4/GSC，**不喚 Claude**，不吃 claude-appi 額度。
# 快照存 ~/.config/appi-news/growth-backlog.json（不在 repo，發佈端 reset 洗不掉）。
#
# 🔴 這支只讀不寫，**刻意不走 worktree、不做 git reset/pull**：publisher 主 checkout 同時是
# seo-ops 大腦層（每日 UTC 22:20）實際改文章的工作區，硬 reset 會洗掉它未提交的修改。
# 存量數字落後幾個 commit 對「還剩幾百篇」這種量級毫無影響，不值得冒那個險。
TASK="成長待辦盤點"
source "$(dirname "$0")/_runner.sh"
cron_env

cron_run "--dev" --tail 500 -- node scripts/growth-backlog.mjs --save --slack
exit 0
