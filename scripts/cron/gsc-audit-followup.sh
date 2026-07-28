#!/usr/bin/env bash
# 一次性 cron：2026-07-28 轉址修正的 7 天後驗收 → dev 頻道。
#
# 背景：2026-07-28 把 251 個 meta-refresh 轉址空殼的 noindex 拿掉（原本 noindex 與 canonical
# 訊號互相矛盾，導致殘骸吃掉全站 15-17% 曝光、還排在正本前面），並整併 3 組實證競食的重複頁。
# 效果要 Google 重新抓取才顯現，站長要求 7 天後回報一次。脈絡：docs/lessons/duplicate-topic-gate.md
#
# 純讀取（只打 GSC API + 發 Slack），不碰 git 工作區、不需 worktree、不需 flock。
# 跑完會**自我移除** /etc/cron.d/appi-gsc-audit-followup，避免留下每年重跑的殭屍排程。
TASK="轉址修正 7 天驗收"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"            # SLACK_BOT_TOKEN
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 180 node scripts/gsc-audit.mjs --verify 2>&1)"; rc=$?

if [ "$rc" -eq 0 ] && [ -n "$out" ]; then
  printf '%s' "$(printf '🔍 *%s*（%s）\n\n%s' "$TASK" "$ts" "$out")" \
    | node scripts/cron-report.mjs --dev --stdin || true
else
  node scripts/cron-report.mjs --dev --text \
    "$(printf '❌ %s：驗收腳本失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 400 <<<"$out")")" || true
fi

# 自我移除排程（一次性任務，跑完就該消失）
rm -f /etc/cron.d/appi-gsc-audit-followup
exit 0
