#!/usr/bin/env bash
# cron 腳本共用外殼：boot（set -uo、cd repo 根）、worktree 進場、env、執行捕捉（逾時註記）、
# 失敗偵測與 ❌ 回報、等部署 200。與 _worktree.sh 分工：那支只管 worktree 生命週期，這支管其餘樣板。
#
# 為什麼要有這支：同一個 8 行模板曾在每支 cron `.sh` 各抄一份，timeout／tail 這些參數
# 沒有名字，只能靠註解記住「為什麼這支是 800 不是 500」；「Claude 撞限額」的偵測 regex
# 也各抄一份（漂移史＝docs/lessons/auto-publish-pipeline-traps.md §H）。收攏後：
# regex 只在這裡一份（.mjs 端的三態判定正本＝scripts/lib/claude-cli.mjs，這裡是第二道網），
# 參數全部具名，各 `.sh` 只剩檔頭說明＋成功路徑。
#
# 典型用法（產線）：
#   TASK="…"
#   source "$(dirname "$0")/_runner.sh"            # 已 set -uo pipefail、cd repo 根、備好 $ts
#   cron_worktree "slug" "--category tech" || exit 0
#   cron_env                                        # 需要 GA 金鑰的加 --google
#   cron_run "--category tech" --timeout 1200 --tail 500 --fail-re "$CRON_LIMIT_RE" -- node scripts/x.mjs --go
#   ……成功路徑（讀 $CRON_OUT）……
#   exit 0
# 失敗流程要客製的（civic/police/video 的候選前綴、typhoon 的限額靜默），改用低階組件：
#   cron_capture -- …；cron_failed "RE" && { …自訂回報…; exit "$CRON_RC"; }

set -uo pipefail
# 本檔自己的絕對目錄（供 cron_worktree 找 _worktree.sh）——要在 cd 之前解析，
# 否則用相對路徑跑腳本時（./x.sh）cd 後就找不到了。
CRON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 呼叫端在 scripts/cron/ 底下，往上兩層才是 repo 根（少一層會 MODULE_NOT_FOUND，
# 連 cron-report.mjs 都找不到 → 失敗告警一起啞掉，2026-08-06 踩過）。
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

# 「Claude 撞限額／拒答」偵測（exit 0 也會發生，不能只看 rc）。第二道網；正本在 lib/claude-cli.mjs。
CRON_LIMIT_RE='API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit'
# 其中「用量上限」子集（暫時性、額度重置自癒）；typhoon 這類高頻線用它決定靜默。
CRON_QUOTA_RE='hit your .*limit|weekly limit|usage limit'

# cron_report <report-flags> <text>：發 Slack（cron-report.mjs），永不讓回報失敗弄死主流程。
# flags 傳一整個字串（如 "--category tech"、"--dev"、""＝預設頻道），這裡刻意 word-split。
cron_report() {
  local flags="$1" text="$2"
  # shellcheck disable=SC2086
  node scripts/cron-report.mjs $flags --text "$text" || true
}

# cron_worktree <slug> <report-flags|--silent>：進自己的臨時 worktree；失敗回報＋return 1
# （呼叫端接 `|| exit 0`：建不了 worktree＝略過本次，不算失敗）。--silent＝不發 Slack 只留 log。
cron_worktree() {
  local slug="$1" flags="${2:---dev}"
  # shellcheck disable=SC1091
  source "$CRON_DIR/_worktree.sh"
  if ! cron_enter_worktree "$slug"; then
    if [ "$flags" = "--silent" ]; then
      echo "無法建 worktree，略過本次"
    else
      # 用 $PUBLISHER 絕對路徑：進場失敗時不可依賴 cwd 狀態。
      # shellcheck disable=SC2086
      node "$PUBLISHER/scripts/cron-report.mjs" $flags --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true
    fi
    return 1
  fi
}

# cron_env [--google]：載入 report.env（SLACK_BOT_TOKEN 等）；--google 另備 GA 服務帳號金鑰。
cron_env() {
  set -a
  # shellcheck disable=SC1090
  source "$HOME/.config/appi-news/report.env"
  [ "${1:-}" = "--google" ] && export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
  set +a
}

# cron_capture [--timeout N] -- cmd…：跑指令、合併輸出進 $CRON_OUT／$CRON_RC，
# 逾時（rc=124）加註，並把輸出原樣印進 cron log。
cron_capture() {
  local t=0
  while [ $# -gt 0 ]; do case "$1" in
    --timeout) t="$2"; shift 2 ;;
    --) shift; break ;;
    *) echo "cron_capture: 未知參數 $1" >&2; return 2 ;;
  esac; done
  if [ "$t" -gt 0 ]; then
    CRON_OUT="$(timeout "$t" "$@" 2>&1)"; CRON_RC=$?
  else
    CRON_OUT="$("$@" 2>&1)"; CRON_RC=$?
  fi
  [ "$CRON_RC" = 124 ] && CRON_OUT="$CRON_OUT"$'\n'"⏱ 逾時 ${t}s 被中止"
  printf '%s\n' "$CRON_OUT"
  return 0
}

# cron_failed [extra-re]：這次算失敗嗎？rc 非 0，或輸出命中 extra-re（大小寫不拘）。
# 純 node 產線不帶 extra-re（限額語意已由 .mjs 端 runClaudeArticle 處理，rc 為準）；
# 直喚 claude-appi 的線帶 $CRON_LIMIT_RE（可再 | 上自己的 FAIL 哨兵）。
cron_failed() {
  [ "$CRON_RC" -ne 0 ] && return 0
  [ -n "${1:-}" ] && grep -qiE "$1" <<<"$CRON_OUT" && return 0
  return 1
}

# cron_fail_report <report-flags> [--tail N] [--prefix text]：標準 ❌ 訊息
# （❌ TASK 失敗（exit rc，ts）＋可選前綴＋輸出尾段）。tail 預設 500；要更大就說出理由。
cron_fail_report() {
  local flags="$1"; shift
  local tailn=500 prefix=""
  while [ $# -gt 0 ]; do case "$1" in
    --tail) tailn="$2"; shift 2 ;;
    --prefix) prefix="$2"; shift 2 ;;
    *) shift ;;
  esac; done
  local msg
  msg="$(printf '❌ %s 失敗（exit %s，%s）' "$TASK" "$CRON_RC" "$ts")"
  [ -n "$prefix" ] && msg="$msg"$'\n'"$prefix"
  msg="$msg"$'\n'"$(tail -c "$tailn" <<<"$CRON_OUT")"
  cron_report "$flags" "$msg"
}

# cron_run <report-flags> [--timeout N] [--tail N] [--fail-re RE] -- cmd…：
# 標準「跑＋失敗即回報並結束」。成功時 return 0，$CRON_OUT 留給成功路徑；
# 失敗時發 ❌ 後 exit $CRON_RC（沿用各線舊行為：限額命中但 rc=0 時 exit 0，cron 只看告警不看 rc）。
cron_run() {
  local flags="$1"; shift
  local t=0 tailn=500 failre=""
  while [ $# -gt 0 ]; do case "$1" in
    --timeout) t="$2"; shift 2 ;;
    --tail) tailn="$2"; shift 2 ;;
    --fail-re) failre="$2"; shift 2 ;;
    --) shift; break ;;
    *) echo "cron_run: 未知參數 $1" >&2; exit 2 ;;
  esac; done
  cron_capture --timeout "$t" -- "$@"
  if cron_failed "$failre"; then
    cron_fail_report "$flags" --tail "$tailn"
    exit "${CRON_RC:-1}"
  fi
}

# cron_wait_200 <url> [max-secs=600]：發 Slack 前等部署完成、線上真的讀得到（HTTP 200），
# 避免作者一點連結還是 404（push 後到部署上線約 3-5 分鐘）。逾時印警告、return 1，照常發。
cron_wait_200() {
  local u="$1" max="${2:-600}" deadline
  deadline=$(( $(date +%s) + max ))
  until [ "$(curl -s -4 -o /dev/null -w '%{http_code}' "$u")" = "200" ]; do
    [ "$(date +%s)" -ge "$deadline" ] && { echo "⚠️ 等逾時，$u 仍非 200，仍照常發 Slack"; return 1; }
    sleep 20
  done
}

# cron_published：從 $CRON_OUT 取出 PUBLISHED= 行（格式：<url> ｜ <title>…），一行一篇。
cron_published() {
  grep '^PUBLISHED=' <<<"$CRON_OUT" | sed 's/^PUBLISHED=//'
}
