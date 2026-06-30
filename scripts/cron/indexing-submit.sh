#!/usr/bin/env bash
# 每日 cron：把線上 sitemap 新文章送 Google Indexing API（URL_UPDATED）。
# 純資料腳本：只讀線上 sitemap + 帳本 + 呼叫 API，不碰 git 工作區、不需 worktree/claude，
# 故「不」走 _worktree.sh，也不需 flock（沒有 git reset，與其他 publisher cron 無洗檔競態）。
TASK="索引提交"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN（回報用）
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 600 node scripts/indexing-submit.mjs 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 600s 被中止"
printf '%s\n' "$out"

# 失敗：rc 非 0 或輸出含 FAIL 標記
if [ "$rc" -ne 0 ] || grep -q 'INDEXING_RESULT=FAIL' <<<"$out"; then
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 400 <<<"$out")")" || true
  exit "${rc:-1}"
fi

# 有送出才回報（NONE = 無新文章，安靜不擾）
if line="$(grep -oE 'INDEXING_RESULT=SENT n=[0-9]+ remain=[0-9]+' <<<"$out")"; then
  n="$(grep -oE 'n=[0-9]+' <<<"$line" | head -1 | cut -d= -f2)"
  remain="$(grep -oE 'remain=[0-9]+' <<<"$line" | cut -d= -f2)"
  node scripts/cron-report.mjs --dev --text "🔎 $TASK：已送 ${n} 篇新文章給 Google（剩 ${remain}，$ts）" || true
else
  echo "（無新文章，安靜不報）"
fi
exit 0
