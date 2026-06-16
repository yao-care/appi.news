#!/usr/bin/env bash
# 每週 cron 進入點：載入金鑰 → 跑 /weekly-report 技能。
# crontab 範例（每週一 09:00）：0 9 * * 1 /path/to/appi.news/scripts/cron/weekly-report.sh >> /tmp/weekly-report.log 2>&1
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
exec claude -p "/weekly-report"
