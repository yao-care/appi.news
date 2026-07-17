#!/usr/bin/env bash
# 每 15 分鐘 cron（颱風季 5-11 月）：颱風停班課守望（→待審草稿→人工核可）。
TASK="颱風停班課"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

# ── 前置 gate（純資料，全程不動用 Claude/worktree）：颱風季每 15 分鐘跑，用官方頁面內容決定要不要叫 sonnet ──
# 權威頁＝人事行政總處 nds.html。抓一次、下面兩關重複用同一份（避免二次抓取與競態）。
NDS_URL="https://www.dgpa.gov.tw/typh/daily/nds.html"
SIG_FILE="/root/.local/state/appi-news/typhoon-gate-sig.txt"
NDS_HTML="$(curl -s -4 --max-time 30 --fail "$NDS_URL" 2>/dev/null)"; curl_rc=$?

# (1) 明確「無停班停課訊息」＝確定無颱風停課 → 安靜結束。
if [ "$curl_rc" -eq 0 ] && grep -q "無停班停課訊息" <<<"$NDS_HTML"; then
  echo "前置 gate：官方頁顯示「無停班停課訊息」，安靜結束（未動用 Claude）。"
  exit 0
fi

# (2) 內容簽章：只取各縣市停班課公告區塊＋公告日期，排除每次都變的「更新時間」時鐘（否則簽章每次都不同、等於沒做）。
#     與上次「已成功處理」的簽章相同 → 內容沒變 → 安靜結束、不叫 sonnet。這是額度被「每 15 分鐘叫起完整 session 只為判斷沒變」空轉燒穿的主修。
#     抓取失敗／非 200／算不出簽章 → CUR_SIG 空 → 不比對，照 fail-open 走完整流程（絕不因省額度漏報）。
CUR_SIG=""
if [ "$curl_rc" -eq 0 ] && [ -n "$NDS_HTML" ]; then
  sig_rows="$(grep -a 'StopWorkSchool_Info' <<<"$NDS_HTML" | sed -e 's/<[^>]*>//g' -e 's/&nbsp;/ /g' | tr -s '[:space:]' ' ' | sed 's/^ *//;s/ *$//')"
  sig_date="$(sed 's/<[^>]*>//g' <<<"$NDS_HTML" | tr -s '[:space:]' ' ' | grep -oE '[0-9]{2,3}年 ?[0-9]{1,2}月 ?[0-9]{1,2}日 天然災害停止上班及上課情形' | head -1)"
  [ -n "$sig_rows" ] && CUR_SIG="$(printf '%s|%s' "$sig_date" "$sig_rows" | sha256sum | cut -d' ' -f1)"
fi
if [ -n "$CUR_SIG" ] && [ -f "$SIG_FILE" ] && [ "$CUR_SIG" = "$(cat "$SIG_FILE" 2>/dev/null)" ]; then
  echo "前置 gate：各縣市停班課公告與上次已處理者相同（簽章 ${CUR_SIG:0:12}…），安靜結束（未動用 Claude）。"
  exit 0
fi
echo "前置 gate：偵測到可能停班課或抓取不確定 → 進入完整流程（fail-open）。"

# 多工：在自己的臨時 worktree 裡跑（off origin/main），與其他 publisher cron 並行、互不洗檔。
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "typhoon" || { echo "無法建 worktree，略過本次（颱風安靜模式：不報）"; exit 0; }
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(claude-appi --model claude-sonnet-5 -p "/lifestyle-typhoon" 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  # 安靜模式：只在「有停課」才報；無停課的時段不發，避免每小時洗頻。
  if grep -q 'sent ts=' <<<"$out"; then
    # 標題要分辨兩種情況，否則會把「就地更新已上線文章」誤報成待審草稿（滾動更新時 result.updated=true、pendingApproval=false）。
    if [ -f /tmp/result.json ] && node -e 'const r=JSON.parse(require("fs").readFileSync("/tmp/result.json","utf8"));process.exit(r.updated&&!r.pendingApproval?0:1)' 2>/dev/null; then
      headline="🌀 $TASK：同一事件停班課情形有變，已就地更新原文並上線（非新草稿、無發佈鈕）（$ts）"
    else
      headline="🌀 $TASK：偵測到停班課，已產待審草稿（發佈鈕在生活台）（$ts）"
    fi
    node scripts/cron-report.mjs --category lifestyle --text "$headline" || true
  fi
  # 本次內容已成功處理完（含「確認 SAME、安靜結束」也算成功）→ 記錄簽章；之後內容不變的輪次即在前置 gate 跳過、不再叫 sonnet。
  # 失敗／撞用量上限不會走到這裡 → 簽章不更新 → 下一輪仍會重試，額度重置後自然補上，不會漏報。
  if [ -n "${CUR_SIG:-}" ]; then mkdir -p "$(dirname "$SIG_FILE")"; printf '%s\n' "$CUR_SIG" > "$SIG_FILE"; fi
  exit 0
fi
# 用量上限（claude-appi 撞週/日額度）是暫時性、會自癒——額度重置後下一輪就恢復。颱風每 15 分鐘跑，
# 停班課持續期間若照報，會每 15 分鐘洗一則 ❌（實測一天洗了 266 則）。故這類失敗只留 log、不發 Slack。
if grep -qiE 'hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  echo "失敗＝claude-appi 用量上限（暫時性，額度重置後自癒）→ 靜默不報 Slack，僅留 log。"
  exit "$rc"
fi
# 其餘真實錯誤（抓取失敗/資料錯/程式錯）只發 dev 頻道（站長指示：抓不到資料/出錯不要洗作者群與生活台）。
node scripts/cron-report.mjs --dev --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
