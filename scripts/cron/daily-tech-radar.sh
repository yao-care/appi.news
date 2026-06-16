#!/usr/bin/env bash
# 每日 cron 進入點：載入金鑰 → 跑 /daily-tech-radar 技能（發每日科技選題清單到 Slack）。
# 一天跑三次，靠 topic-ledger 跨次去重；去重後沒夠新的題就不發（不保證每次都有題目）。
# 本機 cron(Vixie)忽略 CRON_TZ、一律 UTC；以下時間為 UTC（台北 -8）。
# crontab 範例（台北 05:20 / 11:11 / 18:18 = UTC 21:20 / 03:11 / 10:18）：
#   20 21 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
#   11  3 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
#   18 10 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a
exec claude -p "/daily-tech-radar"
