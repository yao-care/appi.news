#!/usr/bin/env bash
# 每日 cron：科技選題雷達（台北 05:20/11:11/18:18 = UTC 21:20/03:11/10:18）。
TASK="科技選題雷達"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
exec 9>/tmp/appi-publisher-cron.lock
flock -w 1800 9 || { echo "取鎖逾時"; node scripts/cron-report.mjs --text "⏳ $TASK 略過（另一 publisher cron 執行中）" 2>/dev/null || true; exit 0; }
if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || echo "⚠️ 隔離同步失敗，續跑"; fi
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(claude -p "/daily-tech-radar" 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  if grep -q 'sent ts=' <<<"$out"; then msg="✅ $TASK：已發候選到科技台"; else msg="✅ $TASK：本次無新題（未發）"; fi
  node scripts/cron-report.mjs --text "$msg（$ts）" || true; exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
