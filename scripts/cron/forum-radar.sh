#!/usr/bin/env bash
# 每小時 cron：論壇選題雷達（PTT 熱議 → 選題 → **自動撰寫並上架** → 回報各分類台）。
#
# 上線方式＝**全自動上架**（站長 2026-08-06 裁示，同國際編譯台／警消／便民市政），
# 不設每日篇數上限。改變上線方式要同步改 scripts/forum-radar.mjs 的 writeAndPublish
# 與 docs/SERVER_HANDOFF.md 的 cron 總表。
#
# 為什麼每小時跑不會燒爆額度：協調器第一階段是**純 node**（抓取／政治過濾／跨次去重帳本），
# 沒有新熱題就 exit 0、完全不動用 Claude（同 lifestyle-typhoon.sh 的前置 gate 思路）。
# 只有真的撈到新題才往下喚 Haiku（地方板判斷）＋ Sonnet（選題）＋ 逐篇 newsroom-write。
#
# 🔴 **配圖一律禁 OpenAI 生圖**（站長明確要求）：只用站內既有圖或圖庫。
#    由 forum-radar.mjs 的 writeAndPublish 在 spawn 時強制帶 NO_AI_IMAGE=1，不靠這裡設。
#
# 🔴 **本線會寫 repo**（產文＋配圖），所以**必須走 worktree**，不在「純資料腳本」例外之列。
#    2026-08-06 只產候選時曾是純讀，改成自動產文後一併改掉，別再退回去。
TASK="論壇選題雷達"
set -uo pipefail
# 本檔在 scripts/cron/ 底下，往上兩層才是 repo 根（少一層會 MODULE_NOT_FOUND，
# 連 cron-report.mjs 都找不到 → 失敗告警一起啞掉，2026-08-06 踩過）。
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "forum-radar" || { node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(timeout 3600 node scripts/forum-radar.mjs --go 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 3600s 被中止"
printf '%s\n' "$out"

# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（claude-appi 撞上限會 exit 0 只印訊息）。
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|FORUM_RESULT=FAIL|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # 成功一律不發 Slack：
  #   - 有上架 → **內容已經由 forum-radar.mjs 一篇一行帶連結報到各分類台**，dev 再收一份
  #     跨分類總表是同一批東西講兩次（2026-08-08 拿掉；分類台放產出、dev 只放失敗與維運）。
  #   - 沒有新熱題 → 每小時跑一次，一天大部分時段都是這個狀態，發了會洗爆頻道。
  # 上架清單仍完整留在 /var/log/appi-news/forum-radar.log（PUBLISHED= 行），事後要查有紀錄。
  exit 0
fi
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
