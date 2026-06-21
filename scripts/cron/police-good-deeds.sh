#!/usr/bin/env bash
# 每週 cron：警消好人好事（掃各地警局新聞稿→暖聞→自動上架）。台北週三 14:30 = UTC 06:30。
TASK="警消好人好事"
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
out="$(node scripts/police-good-deeds.mjs --go 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then
  url=$(grep -oE 'PUBLISHED=\S+' <<<"$out" | sed 's/PUBLISHED=//' | head -1)
  if [ -n "$url" ]; then
    node scripts/cron-report.mjs --category lifestyle --text "$(printf '🚓 警消好人好事已上架（%s）：\n%s' "$ts" "$url")" || true
    node scripts/cron-report.mjs --text "✅ $TASK：已上架（$ts）" || true
  else
    node scripts/cron-report.mjs --text "✅ $TASK：本次無新好人好事（未上架）（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
