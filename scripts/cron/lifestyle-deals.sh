#!/usr/bin/env bash
# 每日 cron：連假優惠（假日曆觸發→待審草稿→人工核可）。台北 10:00 = UTC 02:00。
TASK="連假優惠"
source "$(dirname "$0")/_runner.sh"
cron_worktree "lifestyle" "--category lifestyle" || exit 0
cron_env

cron_run "--category lifestyle" --tail 500 --fail-re "$CRON_LIMIT_RE" \
  -- claude-appi --model claude-sonnet-5 -p "/lifestyle-deals"

if grep -q 'sent ts=' <<<"$CRON_OUT"; then
  cron_report "--category lifestyle" "✅ $TASK：有連假，已產待審草稿（發佈鈕在生活台）（$ts）"
else
  echo "（本次無連假，安靜不報）"
fi
exit 0
