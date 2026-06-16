#!/usr/bin/env bash
# 每日 cron 進入點：載入金鑰 → 跑 /daily-tech-radar 技能（發每日科技選題清單到 Slack）。
# crontab 範例（每天台北 06:17 = UTC 22:17）：
#   17 22 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a
exec claude -p "/daily-tech-radar"
