#!/usr/bin/env bash
# publisher cron 多工核心：在「自己的臨時 detached worktree」裡跑，取代舊的
# 「全域 flock + reset --hard 共用工作目錄」。每支 cron 各一個 worktree → 互不洗檔 → 並行；
# 寫稿的 writer 最後用 pushToMain（push origin HEAD:main，撞拒就 fetch+rebase 重試）安全上線。
#
# 用法（在 cron 腳本裡）：
#   source "$(dirname "$0")/_worktree.sh"
#   cron_enter_worktree "slug" || { 回報略過; exit 0; }
# 之後 cwd 已在 worktree；EXIT 時自動移除 worktree。

PUBLISHER="${PUBLISHER:-/root/appi.news-publisher}"
WT_ROOT="${CRON_WT_ROOT:-/root/appi.news-cron-wt}"
SETUP_LOCK="${CRON_SETUP_LOCK:-/tmp/appi-cron-worktree-setup.lock}"

cron_enter_worktree() {
  local slug="${1:-job}" wt
  mkdir -p "$WT_ROOT"
  wt="$(mktemp -u "$WT_ROOT/${slug}-XXXXXX")"
  # 只序列化「fetch + 建 worktree」這一小段（~1 秒），避免 git 內部 ref 鎖競爭；
  # 真正耗時的寫稿/推送全程並行（不在這把鎖內）。
  if ! {
        flock -w 120 8 &&
        git -C "$PUBLISHER" fetch -q origin --prune &&
        { git -C "$PUBLISHER" worktree prune -q 2>/dev/null; true; } &&
        git -C "$PUBLISHER" worktree add -q --detach "$wt" origin/main
      } 8>"$SETUP_LOCK"; then
    echo "cron_enter_worktree: 建 worktree 失敗（slug=$slug）" >&2
    return 1
  fi
  # worktree 沒有 node_modules（gitignore）；symlink 共用 publisher 的（pnpm 連到全域 store）。
  [ -e "$PUBLISHER/node_modules" ] && ln -sfn "$PUBLISHER/node_modules" "$wt/node_modules"
  # 防呆：舊 .gitignore 用 node_modules/（只比對目錄），symlink 會被當未追蹤而讓 writer 的
  # 「工作區乾淨」檢查失敗 → 在排除清單補上 node_modules（idempotent，即時生效不靠部署）。
  local exf; exf="$(git -C "$wt" rev-parse --git-path info/exclude 2>/dev/null)"
  [ -n "$exf" ] && ! grep -qxF node_modules "$exf" 2>/dev/null && echo node_modules >> "$exf"
  CRON_WT="$wt"
  trap 'git -C "$PUBLISHER" worktree remove --force "$CRON_WT" 2>/dev/null; rm -rf "$CRON_WT" 2>/dev/null' EXIT
  cd "$wt"
}
