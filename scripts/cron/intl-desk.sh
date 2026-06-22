#!/usr/bin/env bash
# 每日 cron：國際編譯台（GDELT→事實編譯→自動上架）。台北 10:30 = UTC 02:30。
TASK="國際編譯台"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "intl" || { node "$PUBLISHER/scripts/cron-report.mjs" --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 node scripts/intl-write.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
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
