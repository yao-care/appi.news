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
#    由 radar-shared 的 writeAndPublish 在 spawn 時強制帶 NO_AI_IMAGE=1，不靠這裡設。
#
# 🔴 **本線會寫 repo**（產文＋配圖），所以**必須走 worktree**，不在「純資料腳本」例外之列。
#    2026-08-06 只產候選時曾是純讀，改成自動產文後一併改掉，別再退回去。
TASK="論壇選題雷達"
source "$(dirname "$0")/_runner.sh"
cron_worktree "forum-radar" "--dev" || exit 0
cron_env

# tail 上限 800 而非 500：全板失敗的訊息含全部板名（約 470 bytes），500 只剩 30 bytes 餘裕，
# 加一個看板就會從開頭切掉「掃 N 板」與連續輪數那幾行——那正是收到告警時最需要看的資訊。
cron_run "--dev" --timeout 3600 --tail 800 --fail-re "$CRON_LIMIT_RE|FORUM_RESULT=FAIL" \
  -- node scripts/forum-radar.mjs --go

# 成功一律不發 Slack：
#   - 有上架 → **內容已經由 forum-radar.mjs 一篇一行帶連結報到各分類台**，dev 再收一份
#     跨分類總表是同一批東西講兩次（2026-08-08 拿掉；分類台放產出、dev 只放失敗與維運）。
#   - 沒有新熱題 → 每小時跑一次，一天大部分時段都是這個狀態，發了會洗爆頻道。
# 上架清單仍完整留在 /var/log/appi-news/forum-radar.log（PUBLISHED= 行），事後要查有紀錄。
exit 0
