#!/usr/bin/env bash
# 每日 cron：國際編譯台（GDELT→事實編譯→自動上架）。台北 10:30 = UTC 02:30。
TASK="國際編譯台"
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
out="$(node scripts/intl-write.mjs --go 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then
  urls=$(grep -oE 'PUBLISHED=\S+' <<<"$out" | sed 's/PUBLISHED=//')
  if [ -n "$urls" ]; then
    n=$(grep -c . <<<"$urls")
    node scripts/cron-report.mjs --category international --text "$(printf '🌍 國際編譯自動上架 %s 篇（%s）：\n%s' "$n" "$ts" "$urls")" || true
    node scripts/cron-report.mjs --text "✅ $TASK：上架 $n 篇（$ts）" || true
  else
    node scripts/cron-report.mjs --text "✅ $TASK：本次無上架（無突出熱題/已寫過/無可授權圖）（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
