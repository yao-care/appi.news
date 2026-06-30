#!/usr/bin/env bash
# 每日 cron：appi.news 維運心跳 → dev 頻道。兩則訊息：
#   📊 數據心跳（data-heartbeat.mjs，純讀本地、無 LLM、必發）
#   🤖 大腦優化（brain-checkup.mjs，claude-appi sonnet 判讀 SEO/內容機會；撞限額退化成只報事實）
# 參考 dreamer868 pipeline/slack/heartbeat-{data,brain}.sh。純讀取：不碰 git 工作區、不需 worktree、不需 flock。
# 模型鐵則：brain 已在 .mjs 內明確帶 --model sonnet（不帶會吃 Opus 燒週額度）。
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

# 2) 🤖 大腦優化（AI 判讀；.mjs 內已對撞限額/失敗退化成只報事實，故這裡只要原樣發出）
brain="$(timeout 360 node scripts/brain-checkup.mjs 2>&1)"; brc=$?
if [ "$brc" -eq 0 ] && [ -n "$brain" ]; then
  printf '%s' "$brain" | node scripts/cron-report.mjs --dev --stdin || true
else
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s：大腦優化失敗（exit %s，%s）\n%s' "$TASK" "$brc" "$ts" "$(tail -c 300 <<<"$brain")")" || true
fi

exit 0
