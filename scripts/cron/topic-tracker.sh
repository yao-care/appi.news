#!/usr/bin/env bash
# 每週一 cron：主題追蹤 → 主題追蹤頻道。
#   ① 主層一則「主題總表」（各主題收錄文章加總的曝光/點擊/排名，與前一週比）
#   ② 每個主題一條 thread：父訊息只發一次；之後只有收錄文章增減才回覆，沒有就安靜
# 純資料（GA4+GSC+本地 frontmatter），**不喚 Claude**，不吃 claude-appi 額度。
# 純讀取：不碰 git 工作區（帳本在 ~/.config/appi-news/topic-threads.json）→ 不需 worktree、不需 flock。
# 呈現規格與退路見 scripts/lib/topic-tracker.mjs 檔頭；失敗訊息以 ❌ 開頭 → 自動進 dev 台。
TASK="主題追蹤"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"            # SLACK_BOT_TOKEN
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 900 node scripts/topic-tracker.mjs 2>&1)"; rc=$?
printf '%s\n' "$out"

if [ "$rc" -ne 0 ]; then
  node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
  exit "$rc"
fi
exit 0
