#!/usr/bin/env bash
# 每日 cron 進入點：載入金鑰 → 跑 /daily-tech-radar 技能（發每日科技選題清單到 Slack）。
# 一天跑三次，靠 topic-ledger 跨次去重；去重後沒夠新的題就不發（不保證每次都有題目）。
# 本機 cron(Vixie)忽略 CRON_TZ、一律 UTC；以下時間為 UTC（台北 -8）。
# crontab 範例（台北 05:20 / 11:11 / 18:18 = UTC 21:20 / 03:11 / 10:18）：
#   20 21 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
#   11  3 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
#   18 10 * * * /path/to/appi.news/scripts/cron/daily-tech-radar.sh >> /tmp/daily-tech-radar.log 2>&1
# 不用 -e：claude -p 失敗時要走失敗哨兵，不能讓 shell 直接死掉。
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

# 隔離模式（跑在專屬 publisher checkout）：開跑前拉回 origin/main 乾淨最新狀態，
# 讓選題去重讀到的 author-memory 與最新發佈一致，且不受開發目錄影響。
# 只在 PUBLISH_ISOLATED=1（由 crontab 指定）時啟用——避免誤在開發目錄 reset --hard。
# 不帶 -x，保留 node_modules/dist/.env；帳本在 $HOME 全域，不受影響。
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
# 政策封鎖時整個請求被 API 層砍掉，技能內的失敗處理來不及跑，故在此補一層哨兵。
out="$(claude -p "/daily-tech-radar" 2>&1)"; rc=$?
printf '%s\n' "$out"

# 成功條件：exit 0 且輸出沒有 API/政策封鎖的痕跡。否則發 Slack 失敗哨兵，避免靜默。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  exit 0
fi

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
reason="exit=$rc"
if grep -qiE 'Usage Policy|unable to respond' <<<"$out"; then reason="$reason・疑似內容政策封鎖"; fi
printf '{"text":"⚠️ 每日科技選題未送出（cron 進入點失敗，%s，%s）。請看 /tmp/daily-tech-radar.log。"}' "$reason" "$ts" \
  > /tmp/daily-topics-fail.json
node scripts/slack-post.mjs /tmp/daily-topics-fail.json || true
exit "$rc"
