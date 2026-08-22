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
  # cron worktree 是 detached HEAD：必須 push HEAD:main（push origin main 推的是落後的
  # 本地 main ref，必被拒；2026-08-22 首夜實踩：push 失敗＋worktree 用完即刪＝整夜白做）。
  pushed=0
  for _ in 1 2 3; do
    git fetch -q origin || true
    git rebase -q origin/main 2>/dev/null || git rebase --abort 2>/dev/null || true
    if git push -q origin HEAD:main; then pushed=1; break; fi
    sleep 5
  done
  remain=$(grep -oE "剩餘 [0-9]+ 頁" <<<"$CRON_OUT" | head -1)
  if [ "$pushed" = 1 ]; then
    cron_report "--dev" "🖼 封面批次：本夜修復 ${done_n} 頁已上線（${remain:-}）"
  else
    cron_report "--dev" "❌ 封面批次：修復 ${done_n} 頁但 push 失敗（本夜成果丟失、明晚冪等重做），請看 /var/log/appi-news/fix-covers.log"
  fi
else
  cron_report "--dev" "❌ 封面批次：本夜 0 頁成功，請看 /var/log/appi-news/fix-covers.log"
fi
exit 0
