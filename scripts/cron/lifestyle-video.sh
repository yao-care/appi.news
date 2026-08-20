#!/usr/bin/env bash
# 每日 cron：影片線索整理（掃訂閱 YouTube 頻道 RSS→挑一支→公開來源交叉查證→自動上架）。
# 台北 02:30 = UTC 18:30（挑 15:00 國際與 21:20 雷達之間最大的空窗，避開 claude-appi 尖峰）。
# 有新片且通得過查證 gate 才寫；無則靜默。
TASK="影片線索整理"
source "$(dirname "$0")/_runner.sh"
cron_worktree "video" "--category lifestyle" || exit 0
cron_env

cron_capture -- node scripts/lifestyle-video.mjs --go
if cron_failed; then
  # 失敗回報：先帶「收到哪幾支候選」，再附最後 300 bytes 的真正錯誤（session/weekly limit、逾時…）。
  cand=$(grep '^CANDIDATE=' <<<"$CRON_OUT" | sed 's/^CANDIDATE=/• /' | head -20)
  total=$(grep -oE '新候選 [0-9]+ 支' <<<"$CRON_OUT" | tail -1)
  cron_fail_report "--category lifestyle" --tail 300 --prefix "$(printf '%s\n%s' "${total:-候選數未知}" "${cand:-（本次未收到候選）}")"
  exit "$CRON_RC"
fi

# PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>。
# ⚠️ 篇數無上限後**一輪可能多篇**，這裡不可以 head -1（會只回報第一篇、其餘悄悄消失）。
pub=$(cron_published)
if [ -n "$pub" ]; then
  n=$(wc -l <<<"$pub")
  # 同一批是同一次部署，等最後一篇 200 即代表整批都上線了。
  u=$(tail -1 <<<"$pub" | awk -F' ｜ ' '{print $1}')
  cron_wait_200 "$u" || true
  list=$(awk -F' ｜ ' '{printf "• %s\n  %s\n", $2, $1}' <<<"$pub")
  cron_report "--category lifestyle" "$(printf '🎬 影片線索整理已上架 %s 篇（%s）：\n%s' "$n" "$ts" "$list")"
else
  echo "（本次無新片或無通過查證的題，安靜不報）"
fi
exit 0
