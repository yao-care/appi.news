#!/usr/bin/env bash
# 每週 cron：警消好人好事整理（掃各地警局新聞稿 → 暖聞 roundup → 自動上架）。
# 台北週三 11:00 = UTC 03:00。各家抓不到當次略過（可接受）。
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then
  git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || echo "⚠️ 隔離同步失敗，續跑"
fi
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
out="$(node scripts/police-good-deeds.mjs --go 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then exit 0; fi
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
printf '{"text":"⚠️ 警消好人好事整理失敗（exit %s，%s）。看 /tmp/police-good-deeds.log。","category":"lifestyle"}' "$rc" "$ts" > /tmp/police-fail.json
node scripts/slack-post.mjs /tmp/police-fail.json || true
exit "$rc"
