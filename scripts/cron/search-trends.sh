#!/usr/bin/env bash
# 外部搜尋趨勢雷達：Google Trends 台灣 RSS → 純資料候選清單。
#
# 只寫 git 外的 state 快照，不碰工作區、不喚 Claude、不直接產文；因此不走 worktree。
# 有候選才通知作者群，抓取失敗才通知 dev，沒有候選保持安靜。
TASK="外部搜尋趨勢雷達"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 180 node scripts/search-trends.mjs --save --limit 10 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 180s 被中止"
printf '%s\n' "$out"

if [ "$rc" -ne 0 ] || grep -q 'TRENDS_RESULT=FAIL' <<<"$out"; then
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 800 <<<"$out")")" || true
  exit "${rc:-1}"
fi

if grep -q 'TRENDS_RESULT=PARTIAL' <<<"$out"; then
  node scripts/cron-report.mjs --dev --text "$(printf '⚠️ %s 部分來源失敗（%s）\n%s' "$TASK" "$ts" "$(tail -c 1200 <<<"$out")")" || true
  exit 0
fi

if grep -q 'TRENDS_RESULT=CANDIDATES' <<<"$out"; then
  node scripts/cron-report.mjs --text "$(printf '✅ %s（%s）\n%s' "$TASK" "$ts" "$(tail -c 1400 <<<"$out")")" || true
fi
exit 0
