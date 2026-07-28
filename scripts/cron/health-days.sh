#!/usr/bin/env bash
# 每日 cron：健康紀念日 T-2 寫稿（抓當年度最新素材 → 排 當天台北 06:17 上線）。台北 11:00 = UTC 03:00。
#
# 前置 gate 是純資料判斷（node 讀年曆，不動用 Claude）：兩天後沒紀念日就安靜 exit 0。
# 一年 51 天真的會寫，其餘 300 多天這支只花不到一秒。
#
# 上線由另一支 scripts/cron/health-days-publish.sh（UTC 22:17 = 台北 06:17）觸發 deploy 轉正。
TASK="健康紀念日"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

# ── 純資料前置 gate：不建 worktree、不叫 Claude，先確認兩天後真的有紀念日 ──────────
if ! node -e '
  import("./scripts/lib/health-days.mjs").then(({ healthDaysAhead }) => {
    const taipeiToday = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
    const lead = Number(process.env.HEALTH_DAYS_LEAD || 2);
    const hits = healthDaysAhead(taipeiToday, lead);
    if (!hits.length) process.exit(9);
    console.error(`T+${lead}（${hits[0].date}）：${hits.map((h) => h.entry.name).join("、")}`);
  }).catch((e) => { console.error(e); process.exit(1); });
'; then
  rc=$?
  [ "$rc" -eq 9 ] && exit 0   # 沒紀念日＝正常，安靜結束
  node scripts/cron-report.mjs --dev --text "⚠️ $TASK：年曆前置檢查失敗（exit $rc）" 2>/dev/null || true
  exit 0
fi

# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "healthdays" || { node "$PUBLISHER/scripts/cron-report.mjs" --category health --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(node scripts/health-days.mjs --go 2>&1)"; rc=$?
printf '%s\n' "$out"

if [ "$rc" -eq 0 ]; then
  # SCHEDULED 行格式：SCHEDULED=<url> ｜ <title> ｜ <date> 06:17
  sched=$(grep '^SCHEDULED=' <<<"$out" | sed 's/^SCHEDULED=//')
  if [ -n "$sched" ]; then
    n=$(grep -c . <<<"$sched")
    # 排程稿尚未上線（status: scheduled），線上只有 noindex 預覽頁，故不做 200 等待——
    # 直接報「已排程」，附預覽連結供站長先看先改。真正上線由 health-days-publish.sh 負責。
    list=$(awk -F' ｜ ' '{printf "• %s\n  排 %s 上線｜預覽 %s%s\n", $2, $3, $1, ($4 != "" ? "\n  " $4 : "")}' <<<"$sched")
    node scripts/cron-report.mjs --category health --text "$(printf '📅 %s 已排程 %s 篇（%s）：\n%s\n（尚未公開，到時間才上線；預覽頁可從 /admin 編輯）' "$TASK" "$n" "$ts" "$list")" || true
  else
    echo "（本次無產出，安靜不報）"
  fi
  exit 0
fi

node scripts/cron-report.mjs --category health --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
