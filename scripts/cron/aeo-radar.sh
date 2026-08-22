#!/usr/bin/env bash
# cron：AEO/GEO 能見度探針 → geo-citation 帳本 + dev 台摘要（供每日大腦層讀）。
# 只寫帳本（~/.local/state，git 外）與發 Slack，不碰 git 工作區 → 不需 worktree/flock（比照 heartbeat.sh）。
# 模型鐵則：明確 --model claude-sonnet-5（不帶會吃 Opus 燒週額度）。
TASK="AEO 能見度探針"
source "$(dirname "$0")/_runner.sh"
cron_env --google

cron_run "--dev" --timeout 1800 --tail 400 --fail-re "$CRON_LIMIT_RE" \
  -- claude-appi --model claude-sonnet-5 -p "/aeo-radar"

# skill 自己會發 dev 台摘要，wrapper 不重複報成功，安靜結束。
exit 0
