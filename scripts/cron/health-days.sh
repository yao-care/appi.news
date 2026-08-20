#!/usr/bin/env bash
# 每日 cron：健康紀念日 T-2 寫稿（抓當年度最新素材 → 排 當天台北 06:17 上線）。台北 11:00 = UTC 03:00。
#
# 前置 gate 是純資料判斷（node 讀年曆，不動用 Claude）：未來兩天內沒紀念日就安靜 exit 0。
# 掃「區間」而非剛好第 2 天：某天寫失敗時，隔天該篇仍在區間內 → 配合帳本天然重試一次。
# 一年約 51 天真的會寫，其餘日子這支只花不到一秒。
#
# 上線由另一支 scripts/cron/health-days-publish.sh（UTC 22:17 = 台北 06:17）觸發 deploy 轉正。
TASK="健康紀念日"
source "$(dirname "$0")/_runner.sh"

# ── 純資料前置 gate：不建 worktree、不叫 Claude，先確認兩天後真的有紀念日 ──────────
if ! node -e '
  import("./scripts/lib/health-days.mjs").then(({ healthDaysWithin }) => {
    const taipeiToday = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
    const lead = Number(process.env.HEALTH_DAYS_LEAD || 2);
    const hits = healthDaysWithin(taipeiToday, lead);
    if (!hits.length) process.exit(9);
    console.error(`T+1..T+${lead} 內：${hits.map((h) => h.date + " " + h.entry.name).join("、")}`);
  }).catch((e) => { console.error(e); process.exit(1); });
'; then
  rc=$?
  [ "$rc" -eq 9 ] && exit 0   # 沒紀念日＝正常，安靜結束
  node scripts/cron-report.mjs --dev --text "⚠️ $TASK：年曆前置檢查失敗（exit $rc）" 2>/dev/null || true
  exit 0
fi

cron_worktree "healthdays" "--category health" || exit 0
cron_env

cron_run "--category health" --tail 500 -- node scripts/health-days.mjs --go

# SCHEDULED 行格式：SCHEDULED=<url> ｜ <title> ｜ <date> 06:17
sched=$(grep '^SCHEDULED=' <<<"$CRON_OUT" | sed 's/^SCHEDULED=//')
if [ -n "$sched" ]; then
  n=$(grep -c . <<<"$sched")
  # 排程稿尚未上線（status: scheduled），線上只有 noindex 預覽頁，故不做 200 等待——
  # 直接報「已排程」，附預覽連結供站長先看先改。真正上線由 health-days-publish.sh 負責。
  list=$(awk -F' ｜ ' '{printf "• %s\n  排 %s 上線｜預覽 %s%s\n", $2, $3, $1, ($4 != "" ? "\n  " $4 : "")}' <<<"$sched")
  cron_report "--category health" "$(printf '📅 %s 已排程 %s 篇（%s）：\n%s\n（尚未公開，到時間才上線；預覽頁可從 /admin 編輯）' "$TASK" "$n" "$ts" "$list")"
else
  echo "（本次無產出，安靜不報）"
fi
exit 0
