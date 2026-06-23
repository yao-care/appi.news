#!/usr/bin/env bash
# 定期 cron：數據報告（GA4+GSC→Slack），每 3 天一次（站長定，UTC 22:17）。
# 報告內部用滾動 7 天視窗＋週對比，每 3 天跑＝重疊滾動報告，讓 SEO 機會／AI 引用等慢訊號更跟得上。
TASK="數據報告"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "weekly" || { node "$PUBLISHER/scripts/cron-report.mjs" --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
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
