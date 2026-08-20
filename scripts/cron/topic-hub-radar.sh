#!/usr/bin/env bash
# 每週 cron：主題中樞雷達。偵測「已經夠厚卻還沒有中樞」的文章群，自動開一個並上線。
#
# 站長 2026-08-07 裁示：全自動建立並上線、門檻抓嚴（≥15 篇）。把關做在機器這端——
# 每次最多開 1 個、標題描述過驗證才寫、build 與 check:links 綠了才推、每次都發 Slack。
# 判準與門檻見 scripts/topic-hub-radar.mjs 檔頭；帳本在 ~/.config/appi-news/topic-hub-ledger.json。
#
# 停用開關：設 HUB_RADAR_OFF=1（放 ~/.config/appi-news/report.env 即可全域關掉）。
TASK="主題中樞雷達"
source "$(dirname "$0")/_runner.sh"
cron_env
[ "${HUB_RADAR_OFF:-0}" = "1" ] && exit 0

cron_worktree "topichub" "--dev" || exit 0

cron_run "--dev" --tail 500 -- node scripts/topic-hub-radar.mjs --write

id=$(grep '^HUB_ID=' <<<"$CRON_OUT" | sed 's/^HUB_ID=//')
[ -z "$id" ] && exit 0   # 沒有群過門檻＝正常，安靜結束
title=$(grep '^HUB_TITLE=' <<<"$CRON_OUT" | sed 's/^HUB_TITLE=//')
count=$(grep '^HUB_COUNT=' <<<"$CRON_OUT" | sed 's/^HUB_COUNT=//')

# 硬 gate：沒綠就不推，改動留在 worktree 讓人查。
if ! pnpm build >/tmp/hub-build.log 2>&1 || ! pnpm check:links >>/tmp/hub-build.log 2>&1; then
  cron_report "--dev" "$(printf '❌ %s：主題「%s」建好但 build/check:links 沒過，未推送（%s）\n%s' "$TASK" "$title" "$ts" "$(tail -c 400 /tmp/hub-build.log)")"
  exit 1
fi

git add -A
git commit -q -m "$(printf 'feat(topics): 新增主題中樞「%s」，收錄 %s 篇\n\n由 scripts/cron/topic-hub-radar.sh 自動偵測並建立（門檻 ≥15 篇、內聚 ≥0.045、\n近 90 天有新文、GSC 有曝光）。判準見 scripts/topic-hub-radar.mjs 檔頭。' "$title" "$count")" || exit 0
git push -q origin HEAD:main || {
  cron_report "--dev" "❌ $TASK：push 失敗（$ts）"
  exit 1
}
gh workflow run deploy.yml --repo yao-care/appi.news --ref main >/dev/null 2>&1 || true

# 新主題成立當下就在主題追蹤頻道開一條 thread（之後每週的成員異動都回在這串）。
# 失敗不影響本線：下次 topic-tracker.sh 週跑時會自動補建。
node scripts/topic-tracker.mjs --topic "$id" || true

cron_report "--topics" "$(printf '🗂 %s：新增主題中樞「%s」，收錄 %s 篇（%s）\nhttps://appi.news/topics/%s/\n（自動上線，要撤掉就把 src/content/topics/%s.md 的 status 改成 inactive）' "$TASK" "$title" "$count" "$ts" "$id" "$id")"
exit 0
