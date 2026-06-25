# 自動發佈管線的正確性陷阱（build、日期、並發、持續事件）

> 摘要：worktree 沒殘留 dist 會讓 check:links 整批失敗；模型填的 publishDate 會排到未來被濾掉；多工線不可加 flock，要用自癒重試；持續事件（颱風）每變更產新文章會洗出多篇重複，要改滾動更新同一篇。｜ 範圍：自動化/發佈 ｜ 狀態：已解決 ｜ 日期：2026-06-25

對應 SOP：[`docs/SERVER_HANDOFF.md`](../SERVER_HANDOFF.md) §子專案 3（cron 總表）。

## A. worktree 上架前必 `pnpm build`（否則 check:links 讀不到 dist）

- **問題**：cron 自動上架在 `check:links` 卡住、**0 篇上線**，錯誤 `ENOENT scandir .../dist`。
- **原因**：PR #54 把 cron 改成「每次全新 worktree」（off origin/main），**worktree 沒有殘留 `dist/`**，而 `scripts/check-links.mjs` 直接讀 `dist/`。科技 newsroom 跑在 publisher 主目錄、有殘留 dist 才沒炸，但那反而是驗**過期 dist**、放行了新文章的壞連結 → push 後 deploy 才炸、壞 commit 卡 main。
- **解法**：**所有自動發佈線在 `check:links` 前一律先 `pnpm build`**（要含 pagefind，否則 `/search/` 少 `/pagefind/*` 連結會誤報；只跑 `astro build` 不夠）。已修：國際/警消 PR #59、科技 PR #67。
- **注意**：build 約 126s，要算進外層 `timeout 1200` 的尾段；寫作時間預算留「最久一則 + build + check + push」< 1200s。

## B. publishDate 用系統時間蓋寫，別讓模型填

- **問題**：國際/警消「即時發」的文章被排到未來（13:00/18:30），被 `getPublishedArticles()` 當未來文濾掉 → 只剩 noindex 排程預覽頁、不進列表、冷邊緣還 404。
- **原因**：prompt 叫模型「`publishDate: 現在`」，但**模型沒有可靠時鐘**，會把「現在」掰成未來整點。科技從沒中，是因為它日期由程式 `computeSchedule()` 算好、明確塞進 prompt。
- **解法**：任何**自動即時發**的管線，`publishDate` 一律由腳本在模型寫完後用 `new Date().toISOString()` **蓋寫**（intl=PR #60 `stampDateAndTitle()`、police=PR #61）；要排程就學科技用 `publish-slot.mjs` 由程式算。**只有科技是刻意排程的**，其餘自動線即時發。

## C. 多工線不序列化：用自癒重試，別加 flock

- **問題**：兩條自動線偶爾同時跑，某條 build 撈到另一條剛推、本 worktree 未同步完整的內容 → check:links 假失敗。直覺想加 flock 序列化。
- **原因**：各線各自跑在獨立 worktree（PR #54）就是要**並行、互不等待**；加全域 flock 會讓線互相卡住，違反設計（站長 2026-06-23 明確要求「本來就可多工、不要卡住」）。
- **解法**：build+check 一律走 `scripts/lib/build-check.mjs` 的 **`buildCheckWithResync()`**：check 失敗 → `git fetch + merge origin/main` 補齊另一條已完成內容 → 再 build+check 一次（真壞才放棄）。**自癒、不序列化、不卡住。** 新增自動線一律用它，別自己寫裸 build/check。

> **與 flock 的分界（別混淆）**：會 `git reset --hard origin/main` 的 **publisher 主 checkout cron**（tech-radar、weekly-report、lifestyle-deals…）仍用 `flock /tmp/appi-publisher-cron.lock` 序列化，因為它們共用同一個工作樹、並發會互洗。**獨立 worktree 的多工線**才是不序列化、走 resync。兩種機制並存，看「有沒有共用同一個工作樹」。相關：[automation-runtime-staleness.md](./automation-runtime-staleness.md)。

## D. 持續演進的事件要「滾動更新同一篇」，不是每變更產一篇

- **問題**：颱風停班課守望（`lifestyle-typhoon`）高頻跑，停班課情形一天內一變再變（先個別鄉鎮 → 全縣 → 再加別縣市）。原本每次「有變更」就讓起草引擎**自選 slug 產一篇新文章**，結果 2026-06-25 一場颱風同一天洗出**三篇**重複的「停班停課一覽」（士文村版、高屏版、再加嘉義版），讀者與 sitemap 都是噪音。
- **原因**：變更偵測（`typhoon-state.mjs` 的 signature）只防「同一組情形重複產出」，但沒有「事件同一性」概念——它不知道這次的變更和上一篇是**同一場颱風**，於是把每次變更都當成獨立新題。`newsroom-write.mjs` 的事實稿 prompt 又寫死「slug 你自訂」，每篇必然落到不同檔。
- **解法**：引入「同一事件＝同一篇、滾動更新」。
  - `typhoon-state.mjs` 除了 signature 再記**當前事件的文章 slug**（`record --slug` 存、`check` 印 `EPISODE_SLUG`、`slug` 子指令讀、空清單＝事件結束就清空）。
  - `newsroom-write.mjs` 工單可帶固定 `slug`：該檔已存在＝**滾動更新**，改寫既有檔、**沿用原 `status`／`publishDate`／封面，只更新 `updatedDate` 與內文**。關鍵防呆：不可用 `computeSchedule()` 的新排程蓋寫——否則會把**已上線**的文章打回未來日草稿（下架）。`pendingApproval` 改依「原檔現值」判定。
  - SKILL 步驟：`EPISODE_SLUG` 非空 → 帶 slug 滾動更新；空 → 新建；`record` 一律帶 `--slug`；`NO_CLOSURES` 且事件存在 → 清空狀態，下一場才另起新篇。
- **怎麼避免重犯**：任何「同一主題會持續更新」的自動線（颱風、選舉開票、災情即時、賽事比分…），**先想清楚事件同一性**：用穩定 slug ＋就地改寫，不要把「更新」做成「新增」。判準＝「同一件事的後續，讀者只想看到最新的一篇」。對應實作見 `.claude/skills/lifestyle-typhoon/SKILL.md` §步驟 2「同一颱風事件＝同一篇」與 `scripts/newsroom-write.mjs` 的 `isUpdate` 分支（PR #95）。
