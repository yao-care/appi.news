#!/usr/bin/env bash
# 每日 cron：科技選題雷達（每日一次：台北 05:20 = UTC 21:20）。
TASK="科技選題雷達"
source "$(dirname "$0")/_runner.sh"
cron_worktree "radar" "--category tech" || exit 0
cron_env

cron_run "--category tech" --timeout 1200 --tail 500 --fail-re "$CRON_LIMIT_RE|RADAR_RESULT=FAIL" \
  -- claude-appi --model claude-sonnet-5 -p "/tech-radar"

# 狀態以 SKILL 收尾機器標記 RADAR_RESULT=SENT/NONE 為準（舊措辭 sent ts= 留作 fallback，避免漏判）。
if grep -qiE 'RADAR_RESULT=SENT|sent ts=' <<<"$CRON_OUT"; then
  cron_report "--category tech" "✅ $TASK：已發候選到科技台（$ts）"
else
  echo "（本次無產出，安靜不報）"
fi
exit 0
