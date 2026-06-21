#!/usr/bin/env bash
# 每日 cron：國際編譯台（GDELT 選題 → 事實編譯 → 自動上架）。台北 10:30 = UTC 02:30。
# 跑 24h 全批、每區最多 3；多數區會因「無突出熱題/品質關/無可授權圖」而跳過。
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
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN（失敗哨兵用）
set +a
out="$(node scripts/intl-write.mjs --go 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then exit 0; fi
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
printf '{"text":"⚠️ 國際編譯台失敗（exit %s，%s）。看 /tmp/intl-desk.log。","category":"international"}' "$rc" "$ts" > /tmp/intl-desk-fail.json
node scripts/slack-post.mjs /tmp/intl-desk-fail.json || true
exit "$rc"
