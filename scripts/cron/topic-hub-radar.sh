#!/usr/bin/env bash
# 每週 cron：主題中樞雷達。偵測「已經夠厚卻還沒有中樞」的文章群，自動開一個並上線。
#
# 站長 2026-08-07 裁示：全自動建立並上線、門檻抓嚴（≥15 篇）。把關做在機器這端——
# 每次最多開 1 個、標題描述過驗證才寫、build 與 check:links 綠了才推、每次都發 Slack。
# 判準與門檻見 scripts/topic-hub-radar.mjs 檔頭；帳本在 ~/.config/appi-news/topic-hub-ledger.json。
#
# 停用開關：設 HUB_RADAR_OFF=1（放 ~/.config/appi-news/report.env 即可全域關掉）。
TASK="主題中樞雷達"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
[ "${HUB_RADAR_OFF:-0}" = "1" ] && exit 0

ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

# 在自己的臨時 worktree 跑（off origin/main），與其他產線並行互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "topichub" || { node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }

out="$(node scripts/topic-hub-radar.mjs --write 2>&1)"; rc=$?
printf '%s\n' "$out"

if [ "$rc" -ne 0 ]; then
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
  exit "$rc"
fi

id=$(grep '^HUB_ID=' <<<"$out" | sed 's/^HUB_ID=//')
[ -z "$id" ] && exit 0   # 沒有群過門檻＝正常，安靜結束
title=$(grep '^HUB_TITLE=' <<<"$out" | sed 's/^HUB_TITLE=//')
count=$(grep '^HUB_COUNT=' <<<"$out" | sed 's/^HUB_COUNT=//')

# 硬 gate：沒綠就不推，改動留在 worktree 讓人查。
if ! pnpm build >/tmp/hub-build.log 2>&1 || ! pnpm check:links >>/tmp/hub-build.log 2>&1; then
  node scripts/cron-report.mjs --dev --text "$(printf '❌ %s：主題「%s」建好但 build/check:links 沒過，未推送（%s）\n%s' "$TASK" "$title" "$ts" "$(tail -c 400 /tmp/hub-build.log)")" || true
  exit 1
fi

git add -A
git commit -q -m "$(printf 'feat(topics): 新增主題中樞「%s」，收錄 %s 篇\n\n由 scripts/cron/topic-hub-radar.sh 自動偵測並建立（門檻 ≥15 篇、內聚 ≥0.045、\n近 90 天有新文、GSC 有曝光）。判準見 scripts/topic-hub-radar.mjs 檔頭。' "$title" "$count")" || exit 0
git push -q origin HEAD:main || {
  node scripts/cron-report.mjs --dev --text "❌ $TASK：push 失敗（$ts）" || true
  exit 1
}
gh workflow run deploy.yml --repo yao-care/appi.news --ref main >/dev/null 2>&1 || true

# 新主題成立當下就在主題追蹤頻道開一條 thread（之後每週的成員異動都回在這串）。
# 失敗不影響本線：下次 topic-tracker.sh 週跑時會自動補建。
node scripts/topic-tracker.mjs --topic "$id" || true

node scripts/cron-report.mjs --topics --text "$(printf '🗂 %s：新增主題中樞「%s」，收錄 %s 篇（%s）\nhttps://appi.news/topics/%s/\n（自動上線，要撤掉就把 src/content/topics/%s.md 的 status 改成 inactive）' "$TASK" "$title" "$count" "$ts" "$id" "$id")" || true
exit 0
