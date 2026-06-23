#!/usr/bin/env bash
# 每日 cron：科技選題雷達（台北 05:20/11:11/18:18 = UTC 21:20/03:11/10:18）。
TASK="科技選題雷達"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "radar" || { node "$PUBLISHER/scripts/cron-report.mjs" --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 claude -p "/tech-radar" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（含 Claude「weekly limit」用量上限）。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|RADAR_RESULT=FAIL|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # 狀態以 SKILL 收尾機器標記 RADAR_RESULT=SENT/NONE 為準（舊措辭 sent ts= 留作 fallback，避免漏判）。
  if grep -qiE 'RADAR_RESULT=SENT|sent ts=' <<<"$out"; then
    node scripts/cron-report.mjs --category tech --text "✅ $TASK：已發候選到科技台（$ts）" || true
  else
    echo "（本次無產出，安靜不報）"
  fi
  exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
