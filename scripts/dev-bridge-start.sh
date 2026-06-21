#!/usr/bin/env bash
# pm2 進入點：source 機密（SLACK_BOT_TOKEN）→ 起 dev 頻道對話橋接。
# 與 slack-actions-start.sh 同套機密來源。claude CLI 須已登入（Agent SDK 沿用其認證）。
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source "$HOME/.config/appi-news/report.env"
set +a
exec node scripts/dev-bridge-server.mjs
