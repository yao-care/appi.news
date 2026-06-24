# 自動發佈管線的三個正確性陷阱（build、日期、並發）

> 摘要：worktree 沒殘留 dist 會讓 check:links 整批失敗；模型填的 publishDate 會排到未來被濾掉；多工線不可加 flock，要用自癒重試。｜ 範圍：自動化/發佈 ｜ 狀態：已解決 ｜ 日期：2026-06-23

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
