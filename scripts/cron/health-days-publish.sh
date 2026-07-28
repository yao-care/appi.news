#!/usr/bin/env bash
# 每日 cron：健康紀念日「準點上線」。UTC 22:17 = 台北 06:17（隔天）。
#
# 為什麼需要這支：文章能不能公開，取決於「build 當下的時間」有沒有超過 publishDate
# （src/utils/content.ts 的 isPublic）。deploy.yml 只在 push／每 6 小時 cron（台北 02、08、14、20）
# ／手動觸發時 build，六小時 cron 對不上 06:17，所以由這支在 06:17 準點戳一次 workflow_dispatch。
#
# 純 shell、不動用 Claude：先確認今天真的有排程稿要轉正，沒有就安靜結束。
# 從觸發到線上可讀約 3-5 分鐘，故文章時間戳是 06:17、實際可見約 06:21（站長 2026-07-28 拍板的取捨）。
TASK="健康紀念日上線"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
PUBLISHER="${PUBLISHER:-/root/appi.news-publisher}"
GH_REPO="yao-care/appi.news"

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"
set +a

# 台北的「今天」（此刻是 UTC 22:17，+8h 落在隔天 06:17）。
D="$(date -u -d '+8 hours' '+%F')"
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

# 有沒有排在今天 06:17 的稿？直接查 origin/main，不依賴本地 checkout 新舊。
git -C "$PUBLISHER" fetch -q origin --prune 2>/dev/null || true
files=$(git -C "$PUBLISHER" grep -l "publishDate: \"${D}T06:17" origin/main -- src/content/articles 2>/dev/null | sed 's|^origin/main:||')
[ -z "$files" ] && exit 0   # 今天沒有紀念日稿，安靜結束

n=$(grep -c . <<<"$files")
echo "→ $D 有 $n 篇排程稿要轉正："
printf '%s\n' "$files"

# 戳一次部署。文章 publishDate 已到 → 這次 build 就會把它從排程預覽頁轉成正式文章。
if ! gh workflow run deploy.yml --repo "$GH_REPO" --ref main 2>&1; then
  node scripts/cron-report.mjs --category health --text "$(printf '❌ %s：觸發 deploy 失敗（%s），%s 篇排程稿沒能準時上線，請手動跑 deploy workflow' "$TASK" "$ts" "$n")" || true
  exit 1
fi
echo "✓ 已觸發 deploy，等文章線上可讀…"

# 逐篇等線上 200（每篇最多 10 分鐘，逾時仍照常回報）。
lines=""
for f in $files; do
  slug=$(basename "$f" .md)
  url="https://appi.news/articles/${slug}/"
  title=$(git -C "$PUBLISHER" show "origin/main:$f" 2>/dev/null | sed -n 's/^title:[[:space:]]*"\?\([^"]*\)"\?[[:space:]]*$/\1/p' | head -1)
  deadline=$(( $(date +%s) + 600 ))
  until [ "$(curl -s -4 -o /dev/null -w '%{http_code}' "$url")" = "200" ]; do
    [ "$(date +%s)" -ge "$deadline" ] && { echo "⚠️ 等逾時，$url 仍非 200，仍照常回報"; break; }
    sleep 20
  done
  lines+="• ${title:-$slug}"$'\n'"  $url"$'\n'
done

node scripts/cron-report.mjs --category health --text "$(printf '🗓 %s 的健康紀念日文章已上線（%s 篇）：\n%s' "$D" "$n" "$lines")" || true
exit 0
