#!/usr/bin/env bash
# 每日 cron：學被引用內容（cited-teardown skill）。按星期輪 beat（7 分類各週一次），把「被 AI
#   引用、我方沒有」的競品頁拆成 GEO 寫作檢查表 → 落地 .claude/skills/newsroom/geo-insights/<beat>.md
#   （newsroom 起草前會讀）+ skill 自發 Slack dev 摘要。**會寫 repo** → 走 worktree 隔離 + commit/push
#   到 origin/main（比照內容產線 _worktree.sh），與其他 publisher cron 並行、互不洗檔。
# 模型鐵則：claude-appi 明確 --model claude-sonnet-5（不帶會吃 Opus 燒週額度）。
# 成功判定不能只看 exit code：claude-appi 撞週限會 exit 0 只印限額訊息 → 用 regex 偵測（見下）。
# 排程：UTC 13:30（台北 21:30），刻意落在 claude-appi 清晨/傍晚尖峰之外的空窗（見 crontab 註解）。
TASK="被引用拆解"
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"

# 按星期輪 beat（date +%w：0=日..6=六），7 分類各週一次，避免每天重跑同一 beat。可由 $1 覆寫。
BEATS=(health tech international finance sports lifestyle focus)
beat="${1:-${BEATS[$(date -u +%w)]}}"

# 寫 repo → 自己的臨時 detached worktree（off origin/main）
source "$(dirname "$0")/_worktree.sh"
cron_enter_worktree "cited-$beat" || { node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "⚠️ $TASK：無法建 worktree，略過本次" 2>/dev/null || true; exit 0; }

# 新 worktree 是新路徑 → 標記為 claude-appi 已信任，否則 headless claude 權限被降級（同 article-write.mjs ensureTrusted）。
CLAUDE_APPI_CONFIG="${CLAUDE_APPI_CONFIG:-/root/.claude-appi/.claude.json}" \
node -e '
  const fs=require("fs");
  const cfgPath=process.env.CLAUDE_APPI_CONFIG;
  let cfg; try{cfg=JSON.parse(fs.readFileSync(cfgPath,"utf8"));}catch{process.exit(0);}
  cfg.projects=cfg.projects||{};
  const p=process.argv[1], cur=cfg.projects[p]||{};
  if(!cur.hasTrustDialogAccepted){
    cfg.projects[p]={allowedTools:[],mcpContextUris:[],mcpServers:{},enabledMcpjsonServers:[],disabledMcpjsonServers:[],projectOnboardingSeenCount:0,hasClaudeMdExternalIncludesApproved:false,hasClaudeMdExternalIncludesWarningShown:false,...cur,hasTrustDialogAccepted:true};
    const tmp=cfgPath+".cited.tmp"; fs.writeFileSync(tmp,JSON.stringify(cfg,null,2)); fs.renameSync(tmp,cfgPath);
  }
' "$CRON_WT" || true

set -a
# shellcheck disable=SC1090
source "$HOME/.config/appi-news/report.env"            # SLACK_BOT_TOKEN
export GOOGLE_APPLICATION_CREDENTIALS="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/appi-news/ga4-sa.json}"
set +a
ts="$(date -u '+%Y-%m-%d %H:%M UTC')"

out="$(timeout 1800 claude-appi --model claude-sonnet-5 -p "/cited-teardown $beat" 2>&1)"; rc=$?
[ "$rc" = 124 ] && out="$out"$'\n'"⏱ 逾時 1800s 被中止"
printf '%s\n' "$out"

# 失敗偵測：rc 非 0，或輸出含 API/拒答/用量上限字樣（含 Claude weekly limit）。
if [ "$rc" -ne 0 ] || grep -qiE 'API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit' <<<"$out"; then
  node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "$(printf '❌ %s（beat=%s）失敗（exit %s，%s）\n%s' "$TASK" "$beat" "$rc" "$ts" "$(tail -c 400 <<<"$out")")" || true
  exit "$rc"
fi

# skill 已把 geo-insights/<beat>.md 寫進 worktree 且自發 🔧 dev 摘要；wrapper 只負責把該檔安全上線。
GI=".claude/skills/newsroom/geo-insights"
if ! git diff --quiet -- "$GI" 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard -- "$GI" 2>/dev/null)" ]; then
  git add "$GI"
  git -c user.name='Light' -c user.email='lightman.chang@gmail.com' \
    commit -q -m "chore(geo): cited-teardown ${beat} 檢查表更新（${ts}）"
  # push origin HEAD:main，撞拒就 fetch+rebase 重試（比照 lib/git-publish.mjs pushToMain 的 bash 版）
  pushed=0
  for i in 1 2 3 4 5 6; do
    if git push -q origin HEAD:main; then pushed=1; break; fi
    git fetch -q origin && git rebase -q origin/main || git rebase --abort 2>/dev/null || true
    sleep $((i * 3))
  done
  if [ "$pushed" -ne 1 ]; then
    node "$PUBLISHER/scripts/cron-report.mjs" --dev --text "$(printf '⚠️ %s（beat=%s）檢查表已生成但 push 失敗（%s）——下次會重跑' "$TASK" "$beat" "$ts")" || true
    exit 1
  fi
  echo "✓ geo-insights/${beat}.md 已上線"
else
  echo "（beat=${beat} 無競品缺口或未產出檢查表，未改檔）"
fi
exit 0
