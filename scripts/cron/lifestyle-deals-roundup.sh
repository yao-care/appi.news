#!/usr/bin/env bash
# 每日/每月 cron 進入點：載入金鑰 → 跑 /lifestyle-deals-roundup 技能（連假優惠 roundup（每日自我判斷連假，沒連假不產出））。
# 事實稿走「人工審後發」：技能會產待審草稿並回報 Slack 附「發佈」鈕，不自動上線。
# 本機 cron(Vixie)忽略 CRON_TZ、一律 UTC；以下為 UTC（台北 -8）。
# crontab 範例（台北每日 10:00 = UTC 02:00）：
#   0 2 * * * PUBLISH_ISOLATED=1 /root/appi.news-publisher/scripts/cron/lifestyle-deals-roundup.sh >> /tmp/lifestyle-deals-roundup.log 2>&1
# 不用 -e：claude -p 失敗時要走失敗哨兵，不能讓 shell 直接死掉。
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

# 隔離模式（專屬 publisher checkout）：開跑前拉回 origin/main 乾淨最新狀態。
if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then
  git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || {
    echo "⚠️ 隔離同步失敗，仍以現有 checkout 續跑"
  }
fi

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a

out="$(claude -p "/lifestyle-deals-roundup" 2>&1)"; rc=$?
printf '%s\n' "$out"

if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  exit 0
fi

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
reason="exit=$rc"
if grep -qiE 'Usage Policy|unable to respond' <<<"$out"; then reason="$reason・疑似內容政策封鎖"; fi
printf '{"text":"⚠️ 連假優惠 roundup（每日自我判斷連假，沒連假不產出） cron 進入點失敗（%s，%s）。請看 /tmp/lifestyle-deals-roundup.log。"}' "$reason" "$ts"   > "/tmp/lifestyle-deals-roundup-fail.json"
node scripts/slack-post.mjs "/tmp/lifestyle-deals-roundup-fail.json" || true
exit "$rc"
