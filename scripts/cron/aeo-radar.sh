#!/usr/bin/env bash
# cron：AEO/GEO 能見度探針 → geo-citation 帳本 + dev 台摘要（供每日大腦層讀）。
# 只寫帳本（~/.local/state，git 外）與發 Slack，不碰 git 工作區 → 不需 worktree/flock（比照 heartbeat.sh）。
# 模型鐵則：明確 --model claude-sonnet-5（不帶會吃 Opus 燒週額度）。
# 成功判定不能只看 exit code：claude-appi 撞週限會 exit 0 只印限額訊息 → 用 regex 偵測。
TASK="AEO 能見度探針"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"            # SLACK_BOT_TOKEN
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

out="$(timeout 1800 claude-appi --model claude-sonnet-5 -p "/aeo-radar" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1800s 被中止"
printf '%s\n' "$out"

# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（含 Claude weekly limit）。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # skill 自己會發 dev 台摘要，wrapper 不重複報成功，安靜結束。
  exit 0
fi
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 400 <<<"$out")")" || true
exit "$rc"
