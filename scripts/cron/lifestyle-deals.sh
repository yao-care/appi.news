#!/usr/bin/env bash
# 每日 cron：連假優惠（假日曆觸發→待審草稿→人工核可）。台北 10:00 = UTC 02:00。
TASK="連假優惠"
source "$(dirname "$0")/_runner.sh"
cron_worktree "lifestyle" "--category lifestyle" || exit 0
cron_env

# 寫作＝codex（站長 2026-08-22 裁示）：codex 不吃 /skill 斜線指令，改成指示它讀 SKILL.md 照做。
# -m 一律明確帶（同 claude 線「不帶 --model 默默吃預設」的教訓）；額度樣態由 CRON_LIMIT_RE 第二道網掃。
cron_run "--category lifestyle" --tail 500 --fail-re "$CRON_LIMIT_RE" \
  -- codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -m gpt-5.6-luna -c 'model_reasoning_effort="high"' \
     "打開 .claude/skills/lifestyle-deals/SKILL.md，完整遵照其中規則執行本輪任務。執行結束時，把過程中的關鍵輸出行（例如 sent ts=...）原樣印在你的最終回覆裡。"

if grep -q 'sent ts=' <<<"$CRON_OUT"; then
  cron_report "--category lifestyle" "✅ $TASK：有連假，已產待審草稿（發佈鈕在生活台）（$ts）"
else
  echo "（本次無連假，安靜不報）"
fi
exit 0
