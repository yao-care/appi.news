#!/usr/bin/env bash
# 每小時 cron（颱風季 5-11 月）：颱風停班課守望（→待審草稿→人工核可）。
TASK="颱風停班課"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
exec 9>/tmp/appi-publisher-cron.lock
flock -w 1800 9 || { echo "取鎖逾時，略過本次（颱風安靜模式：不報）"; exit 0; }
if [ "${PUBLISH_ISOLATED:-}" = "1" ]; then git fetch -q origin --prune && git checkout -q main && git reset -q --hard origin/main && git clean -qfd || echo "⚠️ 隔離同步失敗，續跑"; fi
set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"
out="$(claude -p "/typhoon-closure-watch" 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "$rc" -eq 0 ] && ! grep -qiE 'API Error|Usage Policy|unable to respond' <<<"$out"; then
  # 安靜模式：只在「有停課」才報（已產待審草稿）；無停課的時段不發，避免每小時洗頻。
  if grep -q 'sent ts=' <<<"$out"; then
    node scripts/cron-report.mjs --text "🌀 $TASK：偵測到停班課，已產待審草稿（發佈鈕在生活台）（$ts）" || true
  fi
  exit 0
fi
node scripts/cron-report.mjs --text "$(printf '❌ %s 失敗（exit %s，%s）\n%s' "$TASK" "$rc" "$ts" "$(tail -c 500 <<<"$out")")" || true
exit "$rc"
