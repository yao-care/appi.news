#!/usr/bin/env bash
# 每日 cron 進入點：載入金鑰 → 跑 /daily-sports-radar 技能（發每日運動選題清單到 Slack）。
# 靠 topic-ledger（依 sports 過濾）跨次去重；去重後沒夠新的題就不發。
# 本機 cron(Vixie)忽略 CRON_TZ、一律 UTC。
# crontab 範例（台北每日 08:30 = UTC 00:30）：
#   30 0 * * * PUBLISH_ISOLATED=1 /root/appi.news-publisher/scripts/cron/daily-sports-radar.sh >> /tmp/daily-sports-radar.log 2>&1
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then
  git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || {
    echo "⚠️ 隔離同步失敗，仍以現有 checkout 續跑"
  }
fi

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a

out="$(claude -p "/daily-sports-radar" 2>&1)"; rc=$?
printf '%s\n' "$out"

if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  exit 0
fi

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
reason="exit=$rc"
if grep -qiE 'Usage Policy|unable to respond' <<<"$out"; then reason="$reason・疑似內容政策封鎖"; fi
printf '{"text":"⚠️ 每日運動選題未送出（cron 進入點失敗，%s，%s）。請看 /tmp/daily-sports-radar.log。"}' "$reason" "$ts" \
  > /tmp/sports-topics-fail.json
node scripts/slack-post.mjs /tmp/sports-topics-fail.json || true
exit "$rc"
