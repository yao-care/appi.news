#!/usr/bin/env bash
# cron（建議週一次）：受眾媒體包 → Slack dev 台。純讀 GA、不碰 git → 不需 worktree/flock（比照 heartbeat.sh）。
# 分區塊動能與服務漏斗已由每日 brain-checkup 帶進 dev,這支專發「對外媒體包」一頁式。
TASK="受眾媒體包"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"            # SLACK_BOT_TOKEN
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

md="$(timeout 120 node scripts/audience-report.mjs --days 28 --format md 2>&1)"; rc=$?
if [ "$rc" -eq 0 ] && [ -n "$md" ]; then
  printf '%s' "$md" | node scripts/cron-report.mjs --dev --stdin || true
else
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 300 <<<"$md")")" || true
fi
exit 0
