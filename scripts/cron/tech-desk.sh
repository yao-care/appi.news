#!/usr/bin/env bash
# 每日 cron：科技台（GSC 訊號→選題判準→自動上架）。UTC 16:45 = 台北 00:45。
#
# 排在 16:45 是因為 15:00（國際編譯台）→18:30（影片線）是現行表上最大的空窗，前後各 1h45。
# 仍不到 SERVER_HANDOFF §排程 要求的 ≥5h，因為日更線已把 24 小時排滿；這是現況下最好的位置。
#
# **每天兩條 track 都跑**（站長 2026-08-22 裁示解除奇偶輪替）：當初輪替是因為寫作吃
# claude-appi 的 5 小時共用視窗（2026-07-03 擠爆過）；2026-08-22 寫作全面改 codex 後
# 該限制消失，恢復雙 track＝選題命中率加倍。若未來寫作引擎再回 claude 池，先恢復輪替。
# 已上架報「科技台」（帶標題、等部署可讀才發）；無產出/失敗走 dev 頻道。兩條 track：APPI 編輯部（概念解釋）＋張饒輝《AI 醫療現場》。
TASK="科技台"
source "$(dirname "$0")/_runner.sh"
cron_worktree "techdesk" "--category tech" || exit 0
cron_env

# 不帶 --track＝editorial 與 lightman 兩條各寫一篇（tech-desk.mjs 的既有行為）
echo "本日 track：editorial + lightman（雙軌，2026-08-22 起）"

cron_run "--category tech" --tail 500 -- node scripts/tech-desk.mjs --go

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
