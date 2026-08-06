#!/usr/bin/env bash
# 每小時 cron：論壇選題雷達（PTT 熱議 → 候選題 → Slack 各分類台，帶「我要寫這題」按鈕）。
#
# 為什麼可以每小時跑而不燒額度：協調器的第一階段是**純 node**（抓取／政治過濾／跨次去重帳本），
# 沒有新熱題就 exit 0、完全不動用 Claude。只有真的撈到新題才往下喚 Haiku（地方板判斷）＋ Sonnet（選題）。
# 同 lifestyle-typhoon.sh 的前置 gate 思路。改抓取範圍／門檻＝改 scripts/lib/forum-signals.mjs 的 BOARDS。
#
# 純讀 + 只寫 git 外帳本（~/.local/state/appi-news/forum-seen.json），**不碰 git 工作區 → 不走 worktree**
# （同 indexing-submit.sh / aeo-radar.sh 的例外條款，見 docs/SERVER_HANDOFF.md §並發保護）。
TASK="論壇選題雷達"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1500 node scripts/forum-radar.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1500s 被中止"
printf '%s\n' "$out"

# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（claude-appi 撞上限會 exit 0 只印訊息）。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|FORUM_RESULT=FAIL|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # 每小時跑一次，**無新題是常態（一天大部分時段都是）→ 完全靜默**，否則會把 Slack 洗爆。
  if grep -q 'FORUM_RESULT=SENT' <<<"$out"; then
    n="$(grep -o 'FORUM_RESULT=SENT [0-9]*' <<<"$out" | awk '{print $2}')"
    node scripts/cron-report.mjs --dev --text "🧭 $TASK：發出 ${n} 則候選（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
