#!/usr/bin/env bash
# 每日 cron：焦點/ESG（掃 6 議題群權威來源→事實型焦點稿→自動上架）。台北 09:30 = UTC 01:30。
# 比照國際/警消：自動發佈上線。已上架報「焦點台」（帶標題、等部署可讀才發）；無產出/失敗走 dev 頻道。
TASK="焦點/ESG"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "focus" || { node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 node scripts/focus-esg.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
if [ "$rc" -eq 0 ]; then
  # PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>
  pub=$(grep '^PUBLISHED=' <<<"$out" | sed 's/^PUBLISHED=//' | head -1)
  if [ -n "$pub" ]; then
    u=$(awk -F' ｜ ' '{print $1}' <<<"$pub")
    # 送 Slack 前先等部署完成、文章線上讀得到（HTTP 200）再發，避免點連結 404。最多等 10 分鐘，逾時仍發。
    deadline=$(( $(date +%s) + 600 ))
    until [ "$(curl -s -4 -o /dev/null -w '%{http_code}' "$u")" = "200" ]; do
      [ "$(date +%s)" -ge "$deadline" ] && { echo "⚠️ 等逾時，$u 仍非 200，仍照常發 Slack"; break; }
      sleep 20
    done
    list=$(awk -F' ｜ ' '{printf "• %s\n  %s", $2, $1}' <<<"$pub")
    node scripts/cron-report.mjs --category focus --text "$(printf '🌏 焦點/ESG 自動上架（%s）：\n%s' "$ts" "$list")" || true
  else
    node scripts/cron-report.mjs --dev --text "✅ $TASK：本次無夠新夠強的題（未產出）（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
