#!/usr/bin/env bash
# 颱風停班課守望 cron 進入點：載入金鑰 → 跑 /typhoon-closure-watch 技能。
# 設計成可「高頻」跑（建議颱風季每小時，甚至每 30 分），技能內建變更偵測：
#   沒颱風 / 停班課情形沒變 → 安靜結束（不洗訊息）；有新變化才產待審草稿並回報 Slack。
# 事實稿走「人工審後發」，不自動上線。
# 本機 cron(Vixie)忽略 CRON_TZ、一律 UTC。
# crontab 範例（每小時整點；颱風季可改 */30）：
#   0 * * * * PUBLISH_ISOLATED=1 /root/appi.news-publisher/scripts/cron/typhoon-closure-watch.sh >> /tmp/typhoon-closure-watch.log 2>&1
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

# 並發保護：多個 publisher cron 同時 reset/寫同一 checkout 會互洗未提交工作；同時只放一個。
exec 9>/tmp/appi-publisher-cron.lock
flock -w 1800 9 || { echo "$(date -u +%FT%TZ) 取鎖逾時、另一 publisher cron 仍在跑，略過本次"; exit 0; }

if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then
  git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || {
    echo "⚠️ 隔離同步失敗，仍以現有 checkout 續跑"
  }
fi

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a

out="$(claude -p "/typhoon-closure-watch" 2>&1)"; rc=$?
printf '%s\n' "$out"

# 安靜結束（沒颱風/沒變化）也是 exit 0；只在真正失敗時發哨兵。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  exit 0
fi

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
reason="exit=$rc"
if grep -qiE 'Usage Policy|unable to respond' <<<"$out"; then reason="$reason・疑似內容政策封鎖"; fi
printf '{"text":"⚠️ 颱風停班課守望 cron 進入點失敗（%s，%s）。颱風天請盡快檢查 /tmp/typhoon-closure-watch.log。"}' "$reason" "$ts" \
  > /tmp/typhoon-watch-fail.json
node scripts/slack-post.mjs /tmp/typhoon-watch-fail.json || true
exit "$rc"
