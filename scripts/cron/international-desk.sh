#!/usr/bin/env bash
# 每日 cron：國際編譯台（GDELT→事實編譯→自動上架）。台北 10:30 = UTC 02:30。
TASK="國際編譯台"
source "$(dirname "$0")/_runner.sh"
cron_worktree "intl" "--category international" || exit 0
cron_env

cron_run "--category international" --tail 500 -- node scripts/international-write.mjs --go

# PUBLISHED 行格式：PUBLISHED=<url> ｜ <title>。取整行內容，組成「• 標題 + 連結」。
pub=$(cron_published)
if [ -n "$pub" ]; then
  n=$(grep -c . <<<"$pub")
  for u in $(awk -F' ｜ ' '{print $1}' <<<"$pub"); do cron_wait_200 "$u" || true; done
  list=$(awk -F' ｜ ' '{printf "• %s\n  %s\n", $2, $1}' <<<"$pub")
  cron_report "--category international" "$(printf '🌍 國際編譯自動上架 %s 篇（%s）：\n%s' "$n" "$ts" "$list")"
else
  # 0 篇不再全靜默：2026-07-27 整晚 0 篇沒有任何告警，隔天才由站長人工發現（lesson §G）。
  # 內容頻道仍不吵（沒東西可看），但維運訊號要進 dev 台，附閘門與逐則結論供判讀。
  echo "（本次無產出，發 dev 台）"
  cron_report "--dev" "$(printf '🌍 國際編譯 %s：0 篇上架\n```\n%s\n```' "$ts" "$(grep -E '^(→ 寫作前閘門|  ⇒ 通過閘門|→ \[|  (NEW|UPDATE|SKIP|⚠️|⛔)|✓ 閘門後無題可寫|✓ 本批無有效產出)' <<<"$CRON_OUT" | tail -30)")"
fi
exit 0
