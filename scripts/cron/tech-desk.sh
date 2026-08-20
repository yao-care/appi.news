#!/usr/bin/env bash
# 每日 cron：科技台（GSC 訊號→選題判準→自動上架）。UTC 16:45 = 台北 00:45。
#
# 排在 16:45 是因為 15:00（國際編譯台）→18:30（影片線）是現行表上最大的空窗，前後各 1h45。
# 仍不到 SERVER_HANDOFF §排程 要求的 ≥5h，因為日更線已把 24 小時排滿；這是現況下最好的位置。
#
# **每天只跑一條 track（依日期奇偶輪替）**，不是兩條都跑：tech-desk.mjs 不帶 --track 會兩條各寫
# 一篇＝雙倍吃 claude-appi 額度，而 claude-appi 的 session 額度是每 5 小時一個共用視窗，
# 2026-07-03 就發生過擠在同一視窗導致排最後的線每天餓死。輪替後每條 track 約每週 3~4 篇，
# 額度佔用與其他日更線一致。要改回兩條同跑，先確認當日額度餘裕。
# 已上架報「科技台」（帶標題、等部署可讀才發）；無產出/失敗走 dev 頻道。兩條 track：APPI 編輯部（概念解釋）＋張饒輝《AI 醫療現場》。
TASK="科技台"
source "$(dirname "$0")/_runner.sh"
cron_worktree "techdesk" "--category tech" || exit 0
cron_env

# 日期奇偶決定今天跑哪條 track（偶數日＝編輯部概念解釋，奇數日＝張饒輝 AI 醫療現場）
if [ $(( $(date -u +%j) % 2 )) -eq 0 ]; then TRACK=editorial; else TRACK=lightman; fi
echo "本日 track：$TRACK"

cron_run "--category tech" --tail 500 -- node scripts/tech-desk.mjs --track "$TRACK" --go

# 一輪多篇：可能有多行 PUBLISHED=<url> ｜ <title>
pub=$(cron_published)
if [ -n "$pub" ]; then
  n=$(grep -c . <<<"$pub")
  for u in $(awk -F' ｜ ' '{print $1}' <<<"$pub"); do cron_wait_200 "$u" || true; done
  list=$(awk -F' ｜ ' '{printf "• %s\n  %s\n", $2, $1}' <<<"$pub")
  cron_report "--category tech" "$(printf '💻 科技台自動上架 %s 篇（%s）：\n%s' "$n" "$ts" "$list")"
else
  echo "（本次無產出，安靜不報）"
fi
exit 0
