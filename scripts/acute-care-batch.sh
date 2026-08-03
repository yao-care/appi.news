#!/usr/bin/env bash
# 急性症狀衛教線的批次驅動：平行寫作 → 一次建置 → 一次發佈。
#
# 為什麼不用每篇各自 build/push（既有 cron 線的做法）：那個做法每篇要跑一次完整 Astro build
# （600+ 篇 ＋ pagefind），本機 4 核、可用記憶體約 2GB，27 篇連跑會 OOM。寫作階段幾乎都在等
# API、不吃 CPU/記憶體，適合平行；build 只需在整批寫完後做一次。
#
# 用法：
#   scripts/acute-care-batch.sh              # 寫完題目表所有未完成題，然後建置＋發佈
#   PARALLEL=2 scripts/acute-care-batch.sh   # 調整同時寫作數（預設 3）
#   DRY=1 scripts/acute-care-batch.sh        # 只列出會寫哪些題，不動手
#
# 失敗處理：單篇失敗（claude 撞額度／查不到來源／過不了關卡）只是那篇沒有產出，
# 不影響其他篇；最後的 build 若沒過，改動留在工作區，不會半套發佈。

set -uo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"; cd "$REPO"

PARALLEL="${PARALLEL:-3}"
LOGDIR="${LOGDIR:-/tmp/acute-care-batch}"
mkdir -p "$LOGDIR"

# 待寫題目（runner 的帳本＋檔案存在與否為準）
mapfile -t KEYS < <(node -e '
  import("./scripts/lib/acute-care.mjs").then(({ TOPICS, pendingTopics }) => {
    const fs = require("node:fs");
    let done = [];
    try { done = JSON.parse(fs.readFileSync(process.env.ACUTE_CARE_LEDGER_PATH || "/root/.local/state/appi-news/acute-care-done.json", "utf8")); } catch {}
    for (const t of pendingTopics(done)) {
      if (!fs.existsSync(`src/content/articles/${t.key}.md`)) console.log(t.key);
    }
  });
')

if [ "${#KEYS[@]}" -eq 0 ]; then
  echo "✓ 題目表已全部寫完，無待寫題。"; exit 0
fi

echo "待寫 ${#KEYS[@]} 題，同時寫作數 $PARALLEL"
printf '  · %s\n' "${KEYS[@]}"
[ -n "${DRY:-}" ] && exit 0

if [ -n "$(git status --porcelain)" ]; then
  echo "✖ 工作區不乾淨，請先清乾淨再跑"; exit 1
fi

# ── 階段一：平行寫作（每篇只寫檔＋過逐篇關卡，不 build、不碰 git）────────────────
printf '%s\n' "${KEYS[@]}" \
  | xargs -P "$PARALLEL" -I{} bash -c \
      'node scripts/acute-care.mjs --stage --write-only --topic "$1" > "'"$LOGDIR"'/$1.log" 2>&1; echo "  $( [ -f src/content/articles/$1.md ] && echo ✓ || echo ✗ ) $1"' _ {}

WROTE=$(ls -1 "$LOGDIR"/*.log 2>/dev/null | wc -l)
OK=$(git status --porcelain src/content/articles | grep -c '^??' || true)
echo ""
echo "階段一完成：嘗試 $WROTE 題，新增 $OK 篇文章檔"
if [ "$OK" -eq 0 ]; then
  echo "✖ 沒有任何產出，不進入建置。各題失敗原因見 $LOGDIR/*.log"; exit 1
fi

# ── 階段一.五：孤兒稿清理（不可省）──────────────────────────────────────────────
#
# 為什麼需要這一步：階段一的 ✓ 只是 `[ -f ...md ]`，**檔案存在不代表過了關卡**。
# 2026-08-03 實測踩到：某個 writer 的模型沒吐出 ACUTE_RESULT，runner 回 null 直接結束，
# 於是逐篇 gate 從未執行，一份沒有任何配圖的 .md 就這樣留在磁碟上，一路混到階段二才被
# check:links 擋下，害整批 26 篇一起卡住。孤兒稿要在進 build 前就掃掉。
echo ""
echo "→ 孤兒稿檢查（配圖齊全與否）"
ORPHAN=0
for f in $(git status --porcelain src/content/articles | grep '^??' | sed 's/^?? //'); do
  miss=""
  for i in $(grep -oE '(covers|images)/[A-Za-z0-9._-]+\.(webp|png|jpe?g|avif)' "$f" | sort -u); do
    [ -f "public/$i" ] || miss="$miss $i"
  done
  if [ -n "$miss" ]; then
    echo "  ✗ 移除 $(basename "$f" .md)：缺圖$miss"
    rm -f "$f"; ORPHAN=$((ORPHAN+1))
  fi
done
[ "$ORPHAN" -gt 0 ] && echo "  （移除 $ORPHAN 篇，這些題會留在待寫佇列，下次重跑）"
OK=$(git status --porcelain src/content/articles | grep -c '^??' || true)
if [ "$OK" -eq 0 ]; then echo "✖ 清理後無產出，不進入建置"; exit 1; fi
echo "  進入建置的文章：$OK 篇"

# ── 階段二：一次建置 ────────────────────────────────────────────────────────────
echo ""
echo "→ 建置＋連結檢查（整批一次）"
if ! pnpm build > "$LOGDIR/build.log" 2>&1; then
  echo "✖ build 未過，不發佈（改動留工作區）。尾段："; tail -25 "$LOGDIR/build.log"; exit 1
fi
if ! pnpm check:links > "$LOGDIR/links.log" 2>&1; then
  echo "✖ check:links 未過，不發佈（改動留工作區）。尾段："; tail -15 "$LOGDIR/links.log"; exit 1
fi
echo "  ✓ build 與 check:links 皆過"

# ── 階段三：一次發佈 ────────────────────────────────────────────────────────────
git add -- src/content/articles public/covers public/images
if [ -z "$(git diff --cached --name-only)" ]; then
  echo "✖ 無待 commit 變更"; exit 1
fi
git commit -q -m "feat(article): 急性症狀居家處置衛教（$OK 篇）

急性症狀居家處置線首批產出。每篇皆走 BOUNDARY 寫作界線：只寫公認居家
處置共識、不做個別診斷、不給劑量或指名藥品、就醫警訊獨立成節且置於前
三分之一、特殊族群差異單獨點出。來源限政府單位／專科醫學會／系統性回顧。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01R6J3rRMHCuaWR3J9a4vkxY"

node -e '
  import("./scripts/lib/git-publish.mjs").then(({ pushToMain }) => {
    const r = pushToMain({ cwd: process.cwd() });
    if (!r.ok) { console.error("✖ 推送失敗：" + r.err); process.exit(1); }
    console.log("✓ 已推送 main");
  });
' || exit 1

echo ""
echo "=== 本批上線清單 ==="
node -e '
  const fs=require("node:fs"), yaml=require("js-yaml");
  const keys=process.argv.slice(1);
  for (const k of keys) {
    const p=`src/content/articles/${k}.md`;
    if (!fs.existsSync(p)) continue;
    const m=fs.readFileSync(p,"utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const d=(m&&yaml.load(m[1]))||{};
    console.log(`${d.title||k}\thttps://appi.news/articles/${d.slug||k}/`);
  }
' "${KEYS[@]}"
