#!/usr/bin/env bash
# pm2 進入點：source 機密（SLACK_SIGNING_SECRET / SLACK_BOT_TOKEN）→ 起 Slack 互動端點。
# 與 scripts/cron/weekly-report.sh 同套機密來源。
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source "$HOME/.config/appi-news/report.env"
set +a
exec node scripts/slack-actions-server.mjs
