#!/usr/bin/env bash
# 定期 cron：數據報告（GA4+GSC→Slack），每 3 天一次（站長定）。台北 08:17 = UTC 00:17。
# 用 00:17 UTC（非 22:17）是為了讓 */3 的日期落在同一個「台北日」（22:17 UTC 會跨到台北隔天，日期會差一天）。
# 報告內部用滾動 7 天視窗＋週對比，每 3 天跑＝重疊滾動報告，讓 SEO 機會／AI 引用等慢訊號更跟得上。
TASK="數據報告"
source "$(dirname "$0")/_runner.sh"
cron_worktree "weekly" "" || exit 0
cron_env

cron_run "" --timeout 1200 --tail 500 --fail-re "$CRON_LIMIT_RE" \
  -- claude-appi --model claude-sonnet-5 -p "/weekly-report"

cron_report "" "✅ $TASK：完成（$ts）"
exit 0
