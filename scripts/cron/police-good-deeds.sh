#!/usr/bin/env bash
# 每週 cron：警消好人好事整理（掃各地警局新聞稿 → 暖聞 roundup → 自動上架）。
# 台北週三 14:30 = UTC 06:30（避開國際編譯 02:30 長跑窗）。各家抓不到當次略過（可接受）。
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

# 並發保護：多個 publisher cron 同時 reset/寫同一 checkout 會互洗未提交工作；同時只放一個。
exec 9>/tmp/appi-publisher-cron.lock
flock -w 1800 9 || { echo "$(date -u +%FT%TZ) 取鎖逾時、另一 publisher cron 仍在跑，略過本次"; exit 0; }
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
