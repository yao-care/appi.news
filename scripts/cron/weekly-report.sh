#!/usr/bin/env bash
# 每週 cron：數據週報（GA4+GSC→Slack）。台北週一 06:17 = UTC 週日 22:17。
TASK="每週數據週報"
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
out="$(timeout 1200 claude -p "/weekly-report" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  node scripts/cron-report.mjs --text "✅ $TASK：完成（$ts）" || true; exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
