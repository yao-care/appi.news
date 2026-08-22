#!/usr/bin/env bash
# 每日 cron：焦點/ESG（掃 6 議題群權威來源→事實型焦點稿→自動上架）。台北 09:30 = UTC 01:30。
# 比照國際/警消：自動發佈上線。已上架報「焦點台」（帶標題、等部署可讀才發）；無產出/失敗走 dev 頻道。
TASK="焦點/ESG"
source "$(dirname "$0")/_runner.sh"
cron_worktree "focus" "--category focus" || exit 0
cron_env

cron_run "--category focus" --tail 500 -- node scripts/focus-esg.mjs --go

# 一輪多篇：可能有多行 PUBLISHED=<url> ｜ <title>
pub=$(cron_published)
if [ -n "$pub" ]; then
  n=$(grep -c . <<<"$pub")
  for u in $(awk -F' ｜ ' '{print $1}' <<<"$pub"); do cron_wait_200 "$u" || true; done
  list=$(awk -F' ｜ ' '{printf "• %s\n  %s\n", $2, $1}' <<<"$pub")
  cron_report "--category focus" "$(printf '🌏 焦點/ESG 自動上架 %s 篇（%s）：\n%s' "$n" "$ts" "$list")"
else
  echo "（本次無產出，安靜不報）"
fi
exit 0
