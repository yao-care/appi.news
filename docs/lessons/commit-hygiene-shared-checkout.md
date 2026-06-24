# 共用 checkout 的 commit 衛生：別把別人的 WIP 掃進你的 commit

> 摘要：dev checkout 常有他人未提交 WIP、自動產文 job 也在背景動工作區；`git add -A` / 不帶 pathspec 的 commit 會把無關改動一起帶走。｜ 範圍：git/自動化 ｜ 狀態：已解決 ｜ 日期：2026-06

對應 SOP：根 `CLAUDE.md` §部署與驗收（在 main 上先開分支）。

## A. 自動產文 job 只 stage 文章產物，不用 `git add -A`

- **問題**：背景自動產文 job（`scripts/newsroom-write.mjs --go`，每篇約 10–15 分鐘，結尾 commit→push）把 job 起跑後出現的**無關未提交改動**一起 commit 並推上 main。（2026-06-16 把 `topic-ledger.mjs`/.test.mjs 掃進「AI 基本法」commit 4b52fbf。）
- **原因**：結尾用 `git add -A`，會掃進工作區任何變動；起點的乾淨檢查（newsroom-write.mjs:131）只擋一次，擋不了中途新增。
- **解法**：已改成只 stage 文章產物路徑（2026-06-17 commit 3aea525）：`src/content/articles`、`public/covers`、`public/images`、`.claude/skills/newsroom/author-memory.json`。
- **殘留風險**：若 job 跑的當下你剛好改到上述被 stage 路徑底下的檔，仍可能被掃進去；邊開發邊跑時先 `ps -ef | grep newsroom-write` 確認沒 job 較保險。

## B. 手動 commit 用 pathspec（dev checkout 有他人 WIP）

- **問題**：在 `/root/appi.news`（dev checkout）`git add <我的檔>` 後跑 `git commit`，把 **index 裡別人已暫存的刪除/變更一起帶走**。（2026-06-22 把 dev-bridge 4 個檔的刪除誤併進週報修正 commit 推上 main，事後 revert `2b98db3` 修回。）
- **原因**：`git commit` 提交的是**整個 index**，不是只有你剛 `add` 的那幾個；而這個 dev checkout 常同時有他人/平行 session 的未提交 WIP。
- **解法**：commit 前先 `git status` 看 index 有沒有非你的暫存；提交一律用 **pathspec 形式** `git commit -m "msg" -- <我的檔...>`（`-m` 在前、`--` 在後，順序反了 `-m` 會被當 pathspec）只提交指定檔。

> 對照：**發佈隔離 checkout** `/root/appi.news-publisher` 每篇 job 會 reset 到 origin/main，與這個常有 WIP 的 dev checkout 不同。相關：[automation-runtime-staleness.md](./automation-runtime-staleness.md)。
