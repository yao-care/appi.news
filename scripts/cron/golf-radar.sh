#!/usr/bin/env bash
# 每日 cron：高爾夫選手動態雷達（YouTube／新聞 RSS → 台灣選手命中標記 → 選題 → **自動撰寫並上架** → 回報運動台）。
#
# 建議排程行（本檔不動 crontab，由主對話安裝；先 `crontab -l` 確認時段沒被別的任務佔用再裝）：
#   0 6 * * *      PUBLISH_ISOLATED=1 /root/appi.news-publisher/scripts/cron/golf-radar.sh >> /var/log/appi-news/golf-radar.log 2>&1
# 即 UTC 06:00 ＝台北 14:00。選這個時段的理由：
#   - 這是全天唯一沒有其他 appi.news LLM cron 任務的整點空檔——04:45（警消）與 07:30（收錄送件／
#     連假優惠）之間有 2h45 空窗，06:00 離兩邊各約 1h+，不會擠進同一個 5 小時額度視窗的尖峰。
#   - 台北 14:00 這個時間點，美國 PGA/LPGA 賽事（多在美東週末白天進行）的週末戰報、
#     以及台灣選手前一晚（美東時間）的表現，通常已經反映在 YouTube／新聞 RSS 上。
#   - 高爾夫不像 PTT 熱議需要每小時追時效（賽事以週為單位），日更一次即可，
#     不需要比照論壇雷達的每小時頻率。
#
# 為什麼每天跑不會燒爆額度：協調器第一階段是**純 node**（抓 RSS／台灣選手命中比對／跨次去重帳本），
# 沒有新資料就 exit 0、完全不動用 Claude（同 lifestyle-typhoon.sh／forum-radar.sh 的前置 gate 思路）。
# 只有真的撈到新資料才往下喚 Sonnet 選題 + 逐篇 newsroom-write。
#
# 🔴 **配圖一律禁 OpenAI 生圖**（真實選手與賽事不可 AI 生圖，站長明確要求）：
#    由 golf-radar.mjs 的 writeAndPublish 在 spawn 時強制帶 NO_AI_IMAGE=1，不靠這裡設；
#    這裡仍手動帶一次是雙重保險（同論壇雷達的作法，任一邊被改掉都還有另一邊擋著）。
#
# 🔴 **本線會寫 repo**（產文＋配圖），所以走 worktree（同論壇雷達／影片線），不是純資料腳本例外。
TASK="高爾夫選手動態雷達"
set -uo pipefail
# 本檔在 scripts/cron/ 底下，往上兩層才是 repo 根（少一層會 MODULE_NOT_FOUND）。
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "golf-radar" || { node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(NO_AI_IMAGE=1 timeout 3600 node scripts/golf-radar.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 3600s 被中止"
printf '%s\n' "$out"

# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（claude-appi 撞上限會 exit 0 只印訊息）。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|GOLF_RESULT=FAIL|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # 成功一律不發額外訊息：
  #   - 有上架 → **內容已經由 golf-radar.mjs 一篇一行帶連結報到運動台**，重複再發一份到 dev 是講兩次。
  #   - 沒有新資料 → 多數時段是這個狀態（尤其台灣選手非賽季週），發了會洗頻。
  # 上架清單仍完整留在 /var/log/appi-news/golf-radar.log（PUBLISHED= 行），事後要查有紀錄。
  exit 0
fi
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 800 <<<"$out")")" || true
exit "$rc"
