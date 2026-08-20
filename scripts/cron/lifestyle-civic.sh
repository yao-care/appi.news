#!/usr/bin/env bash
# 每日 cron：便民市政（掃各縣市政府 RSS→跨縣市便民措施統整→自動上架）。台北 18:00 = UTC 10:00。
# 有新資料才寫（civic-ledger 去重）；無則靜默。
TASK="便民市政"
source "$(dirname "$0")/_runner.sh"
cron_worktree "civic" "--category lifestyle" || exit 0
cron_env

cron_capture -- node scripts/lifestyle-civic.mjs --go
if cron_failed; then
  # 失敗回報：先帶「收到哪幾則候選」，再附最後 300 bytes 的真正錯誤（session/weekly limit、逾時…）。
  cand=$(grep '^CANDIDATE=' <<<"$CRON_OUT" | sed 's/^CANDIDATE=/• /' | head -20)
  total=$(grep -oE '新候選 [0-9]+ 則' <<<"$CRON_OUT" | tail -1)
  cron_fail_report "--category lifestyle" --tail 300 --prefix "$(printf '%s\n%s' "${total:-候選數未知}" "${cand:-（本次未收到候選）}")"
  exit "$CRON_RC"
fi

# PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>
pub=$(cron_published | head -1)
if [ -n "$pub" ]; then
  u=$(awk -F' ｜ ' '{print $1}' <<<"$pub")
  cron_wait_200 "$u" || true
  list=$(awk -F' ｜ ' '{printf "• %s\n  %s", $2, $1}' <<<"$pub")
  cron_report "--category lifestyle" "$(printf '🏛 便民市政整理已上架（%s）：\n%s' "$ts" "$list")"
else
  echo "（本次無新便民資料，安靜不報）"
fi
exit 0
