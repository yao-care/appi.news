#!/usr/bin/env bash
# 每日 cron：焦點/ESG 雷達（ESG/環境/能源/永續 → 事實型待審草稿 → 人工核可）。台北 09:30 = UTC 01:30。
# 草稿本身由 skill 經 notify-pending-draft 發到「焦點台」（附發佈鈕）；本包裝的值勤狀態/失敗一律發 dev 頻道，不洗焦點台與作者群。
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
out="$(timeout 1200 claude -p "/focus-esg-radar" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（含 Claude weekly limit）。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  if grep -q 'sent ts=' <<<"$out"; then msg="✅ $TASK：有題，已產待審草稿（發佈鈕在焦點台）"; else msg="✅ $TASK：本次無夠新夠強的題（未產出）"; fi
  node scripts/cron-report.mjs --dev --text "$msg（$ts）" || true; exit 0
fi
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
