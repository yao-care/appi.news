#!/usr/bin/env bash
# 每日 cron：影片線索整理（掃訂閱 YouTube 頻道 RSS→挑一支→公開來源交叉查證→自動上架）。
# 台北 02:30 = UTC 18:30（挑 15:00 國際與 21:20 雷達之間最大的空窗，避開 claude-appi 尖峰）。
# 有新片且通得過查證 gate 才寫；無則靜默。
TASK="影片線索整理"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "video" || { node "$PUBLISHER/scripts/cron-report.mjs" --category lifestyle --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(node scripts/lifestyle-video.mjs --go 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then
  # PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>。
  # ⚠️ 篇數無上限後**一輪可能多篇**，這裡不可以 head -1（會只回報第一篇、其餘悄悄消失）。
  pub=$(grep '^PUBLISHED=' <<<"$out" | sed 's/^PUBLISHED=//')
  if [ -n "$pub" ]; then
    n=$(wc -l <<<"$pub")
    # 送 Slack 前，先等部署完成、文章線上讀得到（HTTP 200）再發，避免點連結還是 404。
    # 同一批是同一次部署，等最後一篇 200 即代表整批都上線了。最多等 10 分鐘，逾時仍發。
    u=$(tail -1 <<<"$pub" | awk -F' ｜ ' '{print $1}')
    deadline=$(( $(date +%s) + 600 ))
    until [ "$(curl -s -4 -o /dev/null -w '%{http_code}' "$u")" = "200" ]; do
      [ "$(date +%s)" -ge "$deadline" ] && { echo "⚠️ 等逾時，$u 仍非 200，仍照常發 Slack"; break; }
      sleep 20
    done
    list=$(awk -F' ｜ ' '{printf "• %s\n  %s\n", $2, $1}' <<<"$pub")
    node scripts/cron-report.mjs --category lifestyle --text "$(printf '🎬 影片線索整理已上架 %s 篇（%s）：\n%s' "$n" "$ts" "$list")" || true
  else
    echo "（本次無新片或無通過查證的題，安靜不報）"
  fi
  exit 0
fi
# 失敗回報：先帶「收到哪幾支候選」，再附最後 300 bytes 的真正錯誤（session/weekly limit、逾時…）。
cand=$(grep '^CANDIDATE=' <<<"$out" | sed 's/^CANDIDATE=/• /' | head -20)
total=$(grep -oE '新候選 [0-9]+ 支' <<<"$out" | tail -1)
node scripts/cron-report.mjs --category lifestyle --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s\n%s\n%s' "$TASK" "$rc" "$ts" "${total:-候選數未知}" "${cand:-（本次未收到候選）}" "$(tail -c 300 <<<"$out")")" || true
exit "$rc"
