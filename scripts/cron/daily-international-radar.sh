#!/usr/bin/env bash
# 每日 cron 進入點：載入金鑰 → 跑 /daily-international-radar 技能（發每日國際選題清單到 Slack）。
# 一天跑一到兩次，靠 topic-ledger（依 international 分類過濾）跨次去重；去重後沒夠新的題就不發。
# 本機 cron(Vixie)忽略 CRON_TZ、一律 UTC；以下時間為 UTC（台北 -8）。
# crontab 範例（台北 07:30 / 17:30 = UTC 23:30 / 09:30）：
#   30 23 * * * PUBLISH_ISOLATED=1 /root/appi.news-publisher/scripts/cron/daily-international-radar.sh >> /tmp/daily-international-radar.log 2>&1
#   30  9 * * * PUBLISH_ISOLATED=1 /root/appi.news-publisher/scripts/cron/daily-international-radar.sh >> /tmp/daily-international-radar.log 2>&1
# 不用 -e：claude -p 失敗時要走失敗哨兵，不能讓 shell 直接死掉。
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

# 隔離模式（跑在專屬 publisher checkout）：開跑前拉回 origin/main 乾淨最新狀態。
# 只在 PUBLISH_ISOLATED=1（由 crontab 指定）時啟用——避免誤在開發目錄 reset --hard。
if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then
  git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || {
    echo "⚠️ 隔離同步失敗，仍以現有 checkout 續跑"
  }
fi

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a

# 跑技能；同時印到 stdout（給 cron log）並留一份判斷成敗。
out="$(claude -p "/daily-international-radar" 2>&1)"; rc=$?
printf '%s\n' "$out"

# 成功條件：exit 0 且輸出沒有 API/政策封鎖的痕跡。否則發 Slack 失敗哨兵，避免靜默。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  exit 0
fi

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
reason="exit=$rc"
if grep -qiE 'Usage Policy|unable to respond' <<<"$out"; then reason="$reason・疑似內容政策封鎖"; fi
printf '{"text":"⚠️ 每日國際選題未送出（cron 進入點失敗，%s，%s）。請看 /tmp/daily-international-radar.log。"}' "$reason" "$ts" \
  > /tmp/international-topics-fail.json
node scripts/slack-post.mjs /tmp/international-topics-fail.json || true
exit "$rc"
