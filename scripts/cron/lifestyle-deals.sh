#!/usr/bin/env bash
# 每日 cron：連假優惠（假日曆觸發→待審草稿→人工核可）。台北 10:00 = UTC 02:00。
TASK="連假優惠"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "lifestyle" || { node "$PUBLISHER/scripts/cron-report.mjs" --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 claude -p "/lifestyle-deals" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  if grep -q 'sent ts=' <<<"$out"; then msg="✅ $TASK：有連假，已產待審草稿（發佈鈕在生活台）"; else msg="✅ $TASK：本次無即將到來的連假（未產出）"; fi
  node scripts/cron-report.mjs --text "$msg（$ts）" || true; exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
