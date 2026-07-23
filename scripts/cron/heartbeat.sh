#!/usr/bin/env bash
# 每日 cron：appi.news 維運心跳 → dev 頻道。兩則確定性數據訊息（皆無 LLM、必發）：
#   1. 📊 數據心跳（data-heartbeat.mjs，純讀本地內容存量）
#   2. 📊 數據總覽（dashboard-post.mjs，GA 統整:8 區塊中文人流+受眾+漏斗+AEO+連結，純讀 GA）
# 2026-07-23：原步驟③🤖大腦優化（brain-checkup.mjs，報告型 LLM 判讀）已移除——由 seo-ops 大腦層
#   （bin/seo-brain.sh，UTC 22:20）取代且升級（不只出建議、會實際改碼上線），兩者同頻道會重複甚至矛盾。
#   playbook appi.news.md 第9行早已建議「pipeline 穩定後移除步驟③」，本次落實；①②純數據與大腦層無資料重疊，續發。
# 參考 dreamer868 pipeline/slack/heartbeat-{data,brain}.sh。純讀取：不碰 git 工作區、不需 worktree、不需 flock。
TASK="維運心跳"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"            # SLACK_BOT_TOKEN
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

# 1) 📊 數據心跳（確定性，必發）
data="$(timeout 120 node scripts/data-heartbeat.mjs 2>&1)"; drc=$?
if [ "$drc" -eq 0 ] && [ -n "$data" ]; then
  printf '%s' "$data" | node scripts/cron-report.mjs --dev --stdin || true
else
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s：數據心跳失敗（exit %s，%s）\n%s' "$TASK" "$drc" "$ts" "$(tail -c 300 <<<"$data")")" || true
fi

# 2) 📊 數據總覽（GA 統整；純讀 GA、無 LLM、必發。與 §1 同為確定性數據，緊接其後）
dash="$(timeout 180 node scripts/dashboard-post.mjs 2>&1)"; hrc=$?
if [ "$hrc" -eq 0 ] && [ -n "$dash" ]; then
  printf '%s' "$dash" | node scripts/cron-report.mjs --dev --stdin || true
else
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s：數據總覽失敗（exit %s，%s）\n%s' "$TASK" "$hrc" "$ts" "$(tail -c 300 <<<"$dash")")" || true
fi

# （步驟③🤖大腦優化已於 2026-07-23 移除，改由 seo-ops 大腦層 bin/seo-brain.sh 取代；見檔頭）
exit 0
