#!/usr/bin/env bash
# 每夜 cron：Discover 封面存量批次修復（每晚 20 頁，GSC 曝光高者優先；站長 2026-08-22 裁示第 4 槓桿）。
# UTC 20:10 = 台北 04:10（影片線 02:30 與高爾夫 05:20 之間的空窗；生圖走 codex 池）。
# 存量清完（不合格 0 頁）會自動把本行從 crontab 移除，屬「有終點」的批次，不是常設線。
TASK="封面規格批次"
source "$(dirname "$0")/_runner.sh"
cron_worktree "fixcovers" "--silent" || exit 0
cron_env

cron_capture -- node scripts/fix-cover-batch.mjs --limit 20 --go
echo "$CRON_OUT" | tail -5

if grep -qE "共 0 頁" <<<"$CRON_OUT"; then
  echo "存量已清完，自移除 crontab 行。"
  crontab -l | grep -v 'fix-covers.sh' | crontab -
  cron_report "--dev" "🖼 封面 Discover 規格存量已全部清完，夜間批次自動下線。"
  exit 0
fi

done_n=$(grep -oE "完成 [0-9]+/" <<<"$CRON_OUT" | grep -oE "[0-9]+" | head -1)
if [ -n "${done_n:-}" ] && [ "$done_n" -gt 0 ]; then
  git add src/content/articles public/covers
  git commit -q -m "chore(covers): Discover 封面批次修復 ${done_n} 頁（夜間批次）" || true
  git pull --rebase -q origin main && git push -q origin main
  remain=$(grep -oE "剩餘 [0-9]+ 頁" <<<"$CRON_OUT" | head -1)
  cron_report "--dev" "🖼 封面批次：本夜修復 ${done_n} 頁（${remain:-}）"
else
  cron_report "--dev" "❌ 封面批次：本夜 0 頁成功，請看 /var/log/appi-news/fix-covers.log"
fi
exit 0
