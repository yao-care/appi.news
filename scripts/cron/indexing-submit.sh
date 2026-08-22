#!/usr/bin/env bash
# 每日 cron：把線上 sitemap 新文章送 Google Indexing API（URL_UPDATED）。
# 純資料腳本：只讀線上 sitemap + 帳本 + 呼叫 API，不碰 git 工作區、不需 worktree/claude，
# 故「不」走 cron_worktree，也不需 flock（沒有 git reset，與其他 publisher cron 無洗檔競態）。
TASK="索引提交"
source "$(dirname "$0")/_runner.sh"
cron_env

cron_run "--dev" --timeout 600 --tail 400 --fail-re 'INDEXING_RESULT=FAIL' \
  -- node scripts/indexing-submit.mjs

# 有送出才回報（NONE = 無新文章，安靜不擾）
if line="$(grep -oE 'INDEXING_RESULT=SENT n=[0-9]+ remain=[0-9]+' <<<"$CRON_OUT")"; then
  n="$(grep -oE 'n=[0-9]+' <<<"$line" | head -1 | cut -d= -f2)"
  remain="$(grep -oE 'remain=[0-9]+' <<<"$line" | cut -d= -f2)"
  cron_report "--dev" "🔎 $TASK：已送 ${n} 篇新文章給 Google（剩 ${remain}，$ts）"
else
  echo "（無新文章，安靜不報）"
fi
exit 0
