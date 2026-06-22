#!/usr/bin/env bash
# 每日 cron：警消好人好事（掃各地警局新聞稿→暖聞→自動上架）。台北 11:50 = UTC 03:50。
TASK="警消好人好事"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "police" || { node "$PUBLISHER/scripts/cron-report.mjs" --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 node scripts/police-good-deeds.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then
  url=$(grep -oE 'PUBLISHED=\S+' <<<"$out" | sed 's/PUBLISHED=//' | head -1)
  if [ -n "$url" ]; then
    node scripts/cron-report.mjs --category lifestyle --text "$(printf '🚓 警消好人好事已上架（%s）：\n%s' "$ts" "$url")" || true
  else
    node scripts/cron-report.mjs --text "✅ $TASK：本次無新好人好事（未上架）（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
