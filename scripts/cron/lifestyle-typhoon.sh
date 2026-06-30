#!/usr/bin/env bash
# 每小時 cron（颱風季 5-11 月）：颱風停班課守望（→待審草稿→人工核可）。
TASK="颱風停班課"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "typhoon" || { echo "無法建 worktree，略過本次（颱風安靜模式：不報）"; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 1200 claude-appi --model sonnet -p "/lifestyle-typhoon" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1200s 被中止（避免卡死共用鎖）"
printf '%s\n' "$out"
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # 安靜模式：只在「有停課」才報；無停課的時段不發，避免每小時洗頻。
  if grep -q 'sent ts=' <<<"$out"; then
    # 標題要分辨兩種情況，否則會把「就地更新已上線文章」誤報成待審草稿（滾動更新時 result.updated=true、pendingApproval=false）。
    if [ -f /tmp/result.json ] && node -e 'const r=JSON.parse(require("fs").readFileSync("/tmp/result.json","utf8"));process.exit(r.updated&&!r.pendingApproval?0:1)' 2>/dev/null; then
      headline="🌀 $TASK：同一事件停班課情形有變，已就地更新原文並上線（非新草稿、無發佈鈕）（$ts）"
    else
      headline="🌀 $TASK：偵測到停班課，已產待審草稿（發佈鈕在生活台）（$ts）"
    fi
    node scripts/cron-report.mjs --category lifestyle --text "$headline" || true
  fi
  exit 0
fi
# 失敗只發 dev 頻道（站長指示：抓不到資料/出錯不要洗作者群與生活台；每小時跑，沒颱風時尤其不該吵）。
node scripts/cron-report.mjs --category lifestyle --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
