#!/usr/bin/env bash
# 每週 cron：民俗節慶佈局雷達（年曆→窗內節點→自動撰寫上架→回報生活台）。
# UTC 週四 01:40 = 台北週四 09:40（白天空窗；寫作走 codex 池，無 claude 5h 視窗顧慮）。
# 無窗內節點時純資料判斷、安靜結束、不喚模型（帳本防重複佈局）。
TASK="節慶佈局"
source "$(dirname "$0")/_runner.sh"
cron_worktree "festival" "--category lifestyle" || exit 0
cron_env

cron_run "--category lifestyle" --tail 400 --fail-re "$CRON_LIMIT_RE" \
  -- node scripts/festival-radar.mjs --go

if grep -q "佈局完成" <<<"$CRON_OUT"; then
  echo "（已由 festival-radar 內建 postToSlack 回報生活台）"
else
  echo "（本輪無節點或未完成，靜默）"
fi
exit 0
