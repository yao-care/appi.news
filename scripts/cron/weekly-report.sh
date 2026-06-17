#!/usr/bin/env bash
# 每週 cron 進入點：載入金鑰 → 跑 /weekly-report 技能。
# crontab 範例（每週一 09:00）：0 9 * * 1 /path/to/appi.news/scripts/cron/weekly-report.sh >> /tmp/weekly-report.log 2>&1
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

# 隔離模式（跑在專屬 publisher checkout）：開跑前拉回 origin/main 乾淨最新狀態，
# 不受開發目錄影響。只在 PUBLISH_ISOLATED=1（由 crontab 指定）時啟用。
# 不帶 -x，保留 node_modules/dist/.env。
if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then
  git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || {
    echo "⚠️ 隔離同步失敗，仍以現有 checkout 續跑"
  }
fi

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"   # SLACK_BOT_TOKEN
set +a
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
exec claude -p "/weekly-report"
