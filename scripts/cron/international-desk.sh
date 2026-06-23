#!/usr/bin/env bash
# 每日 cron：國際編譯台（GDELT→事實編譯→自動上架）。台北 10:30 = UTC 02:30。
TASK="國際編譯台"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "intl" || { node "$PUBLISHER/scripts/cron-report.mjs" --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 node scripts/international-write.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then
  # PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>。取整行內容，組成「• 標題 + 連結」。
  pub=$(grep '^PUBLISHED=' <<<"$out" | sed 's/^PUBLISHED=//')
  if [ -n "$pub" ]; then
    n=$(grep -c . <<<"$pub")
    # 送 Slack 前，先等 GitHub Pages 部署完成、文章線上真的讀得到（HTTP 200）再發，
    # 避免作者一點連結還是 404（push 後到部署上線約 3-5 分鐘）。最多等 10 分鐘，逾時仍發。
    deadline=$(( $(date +%s) + 600 ))
    for u in $(awk -F' ｜ ' '{print $1}' <<<"$pub"); do
      until [ "$(curl -s -4 -o /dev/null -w '%{http_code}' "$u")" = "200" ]; do
        [ "$(date +%s)" -ge "$deadline" ] && { echo "⚠️ 等逾時，$u 仍非 200，仍照常發 Slack"; break; }
        sleep 20
      done
    done
    list=$(awk -F' ｜ ' '{printf "• %s\n  %s\n", $2, $1}' <<<"$pub")
    node scripts/cron-report.mjs --category international --text "$(printf '🌍 國際編譯自動上架 %s 篇（%s）：\n%s' "$n" "$ts" "$list")" || true
  else
    node scripts/cron-report.mjs --text "✅ $TASK：本次無上架（無突出熱題/已寫過/無可授權圖）（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
