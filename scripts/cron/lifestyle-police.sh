#!/usr/bin/env bash
# 每日 cron：警消好人好事（掃各地警局新聞稿→暖聞→自動上架）。台北 11:50 = UTC 03:50。
TASK="警消好人好事"
source "$(dirname "$0")/_runner.sh"
cron_worktree "police" "--category lifestyle" || exit 0
cron_env

cron_capture -- node scripts/lifestyle-police.mjs --go
if cron_failed; then
  # 失敗回報：先帶「收到哪幾則候選」（否則盲切末 500 bytes 只會留到末尾那些收 0 的縣市，
  # 看起來全 0 卻說有 N 則、自相矛盾），再附最後 300 bytes 的真正錯誤（session/weekly limit、逾時…）。
  cand=$(grep '^CANDIDATE=' <<<"$CRON_OUT" | sed 's/^CANDIDATE=/• /')
  total=$(grep -oE '共 [0-9]+ 則候選' <<<"$CRON_OUT" | tail -1)
  cron_fail_report "--category lifestyle" --tail 300 --prefix "$(printf '%s\n%s' "${total:-候選數未知}" "${cand:-（本次未收到候選）}")"
  exit "$CRON_RC"
fi

# PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>
pub=$(cron_published | head -1)
if [ -n "$pub" ]; then
  u=$(awk -F' ｜ ' '{print $1}' <<<"$pub")
  cron_wait_200 "$u" || true
  list=$(awk -F' ｜ ' '{printf "• %s\n  %s", $2, $1}' <<<"$pub")
  cron_report "--category lifestyle" "$(printf '🚓 警消好人好事已上架（%s）：\n%s' "$ts" "$list")"
else
  echo "（本次無產出，安靜不報）"
fi
exit 0
