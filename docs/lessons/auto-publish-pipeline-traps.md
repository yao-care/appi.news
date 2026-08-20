# 自動發佈管線的正確性陷阱（build、日期、並發、持續事件）

> 摘要：worktree 沒殘留 dist 會讓 check:links 整批失敗；模型填的 publishDate 會排到未來被濾掉；多工線不可加 flock，要用自癒重試；持續事件（颱風）每變更產新文章會洗出多篇重複，要改滾動更新同一篇；**撰寫型 cron 的外層 `timeout 1200` 是舊 flock 模型的殘留，全 worktree 化後只會砍掉快完成的 build、白燒 token，已移除（§E）**；**一篇缺封面 webp 的文章會讓 check:links 擋掉「整條」共用部署佇列、害別線排程文也上不了線，要在進 main 前就攔（§F）**；**移除限制時要回頭清掉為它而生的補丁——為已移除 timeout 而設的時間預算變成減產器，加上「故障被當成模型判斷」與「去重擺在最貴的那一端」，讓國際線 2026-07-27 整晚 0 篇（§G）**；**「Claude 成功了嗎」的判定 regex 與 gate 序列在各產線各抄一份、漂移成多種語意，收斂為 claude-cli 三態／publish-pipeline 單一正本（§H）**。｜ 範圍：自動化/發佈 ｜ 狀態：已解決 ｜ 日期：2026-06-25（§E 補於 2026-07-09、§F 補於 2026-07-13、§G 補於 2026-07-28、§H 補於 2026-08-20）

對應 SOP：[`docs/SERVER_HANDOFF.md`](../SERVER_HANDOFF.md) §子專案 3（cron 總表）。

## A. worktree 上架前必 `pnpm build`（否則 check:links 讀不到 dist）

- **問題**：cron 自動上架在 `check:links` 卡住、**0 篇上線**，錯誤 `ENOENT scandir .../dist`。
- **原因**：PR #54 把 cron 改成「每次全新 worktree」（off origin/main），**worktree 沒有殘留 `dist/`**，而 `scripts/check-links.mjs` 直接讀 `dist/`。科技 newsroom 跑在 publisher 主目錄、有殘留 dist 才沒炸，但那反而是驗**過期 dist**、放行了新文章的壞連結 → push 後 deploy 才炸、壞 commit 卡 main。
- **解法**：**所有自動發佈線在 `check:links` 前一律先 `pnpm build`**（要含 pagefind，否則 `/search/` 少 `/pagefind/*` 連結會誤報；只跑 `astro build` 不夠）。已修：國際/警消 PR #59、科技 PR #67。
- **注意**：build 已隨站台長大變重（`subset-fonts` 要掃全站 HTML、2026-07 已達 2300+ 頁），整條「寫作 + build + check + push」常超過 20 分鐘。**外層 timeout 已移除（見 §E），別再假設 build ~126s / 全程 < 1200s**。

## B. publishDate 用系統時間蓋寫，別讓模型填

- **問題**：國際/警消「即時發」的文章被排到未來（13:00/18:30），被 `getPublishedArticles()` 當未來文濾掉 → 只剩 noindex 排程預覽頁、不進列表、冷邊緣還 404。
- **原因**：prompt 叫模型「`publishDate: 現在`」，但**模型沒有可靠時鐘**，會把「現在」掰成未來整點。科技從沒中，是因為它日期由程式 `computeSchedule()` 算好、明確塞進 prompt。
- **解法**：任何**自動即時發**的管線，`publishDate` 一律由腳本在模型寫完後用 `new Date().toISOString()` **蓋寫**（intl=PR #60 `stampDateAndTitle()`、police=PR #61）；要排程就學科技用 `publish-slot.mjs` 由程式算。**只有科技是刻意排程的**，其餘自動線即時發。

## C. 多工線不序列化：用自癒重試，別加 flock

- **問題**：兩條自動線偶爾同時跑，某條 build 撈到另一條剛推、本 worktree 未同步完整的內容 → check:links 假失敗。直覺想加 flock 序列化。
- **原因**：各線各自跑在獨立 worktree（PR #54）就是要**並行、互不等待**；加全域 flock 會讓線互相卡住，違反設計（站長 2026-06-23 明確要求「本來就可多工、不要卡住」）。
- **解法**：build+check 一律走 `scripts/lib/build-check.mjs` 的 **`buildCheckWithResync()`**：check 失敗 → `git fetch + merge origin/main` 補齊另一條已完成內容 → 再 build+check 一次（真壞才放棄）。**自癒、不序列化、不卡住。** 新增自動線一律用它，別自己寫裸 build/check。

> **與 flock 的分界（已全面收斂，2026-07-09 更新）**：早期部分 cron 跑在 **publisher 主 checkout**（`git reset --hard origin/main` + `flock /tmp/appi-publisher-cron.lock` 序列化）。**現況：全部 cron（含 tech-radar／weekly-report／lifestyle-deals）都已改用 `_worktree.sh` 的獨立 detached worktree**，`grep -l cron_enter_worktree scripts/cron/*.sh` 可證；**已無任何主 checkout flock 型 cron**。因此「寫稿期間握著共用鎖」的情境**已不存在**——各線只在 `_worktree.sh` 內 `flock -w 120` 鎖住「fetch + 建 worktree」的 ~1 秒，寫稿/build/push 全程不持鎖。相關：[automation-runtime-staleness.md](./automation-runtime-staleness.md)。

## D. 持續演進的事件要「滾動更新同一篇」，不是每變更產一篇

- **問題**：颱風停班課守望（`lifestyle-typhoon`）高頻跑，停班課情形一天內一變再變（先個別鄉鎮 → 全縣 → 再加別縣市）。原本每次「有變更」就讓起草引擎**自選 slug 產一篇新文章**，結果 2026-06-25 一場颱風同一天洗出**三篇**重複的「停班停課一覽」（士文村版、高屏版、再加嘉義版），讀者與 sitemap 都是噪音。
- **原因**：變更偵測（`typhoon-state.mjs` 的 signature）只防「同一組情形重複產出」，但沒有「事件同一性」概念——它不知道這次的變更和上一篇是**同一場颱風**，於是把每次變更都當成獨立新題。`newsroom-write.mjs` 的事實稿 prompt 又寫死「slug 你自訂」，每篇必然落到不同檔。
- **解法**：引入「同一事件＝同一篇、滾動更新」。
  - `typhoon-state.mjs` 除了 signature 再記**當前事件的文章 slug**（`record --slug` 存、`check` 印 `EPISODE_SLUG`、`slug` 子指令讀、空清單＝事件結束就清空）。
  - `newsroom-write.mjs` 工單可帶固定 `slug`：該檔已存在＝**滾動更新**，改寫既有檔、**沿用原 `status`／`publishDate`／封面，只更新 `updatedDate` 與內文**。關鍵防呆：不可用 `computeSchedule()` 的新排程蓋寫——否則會把**已上線**的文章打回未來日草稿（下架）。`pendingApproval` 改依「原檔現值」判定。
  - SKILL 步驟：`EPISODE_SLUG` 非空 → 帶 slug 滾動更新；空 → 新建；`record` 一律帶 `--slug`；`NO_CLOSURES` 且事件存在 → 清空狀態，下一場才另起新篇。
- **怎麼避免重犯**：任何「同一主題會持續更新」的自動線（颱風、選舉開票、災情即時、賽事比分…），**先想清楚事件同一性**：用穩定 slug ＋就地改寫，不要把「更新」做成「新增」。判準＝「同一件事的後續，讀者只想看到最新的一篇」。對應實作見 `.claude/skills/lifestyle-typhoon/SKILL.md` §步驟 2「同一颱風事件＝同一篇」與 `scripts/newsroom-write.mjs` 的 `isUpdate` 分支（PR #95）。

## E. 撰寫型 cron 不要設 `timeout`（舊 flock 時代的殘留，只會砍掉快完成的 build）

- **問題**：`國際編譯台`（`international-desk`）2026-07-08 15:00 UTC 那次 exit 124——log 顯示文章已起草、`subset-fonts` 掃完 2348 頁、首頁圖已最佳化，卡在 `pnpm build` 尾段被外層 `timeout 1200` 砍掉（`ELIFECYCLE Command failed` 是 build 被 SIGTERM 中斷的假象）。**整趟寫作 token 全部白燒、文章沒上線**。站長明確要求：撰寫別設時間上限。
- **原因**：`timeout 1200` 連同註解「避免卡死共用鎖」是**舊架構（publisher 主 checkout ＋ 全域 flock 序列化）的殘留**——那時一支卡死會一直握著共用鎖擋住別線，才需要上限砍掉它。**PR #54 後全部 cron 改用獨立 worktree、寫稿全程不持鎖（見 §C）**，這個上限就失去意義，只剩「站台長大 build 變重（掃全站 2300+ 頁）＋每條連結都要逐一查證，整趟常 > 20 分鐘」時**把快完成的工作砍掉**的害處。
- **解法**：**撰寫/發佈型 cron 一律不包 `timeout`**：`international-desk`、`lifestyle-police`、`focus-esg`、`lifestyle-deals`、`lifestyle-typhoon` 的 `out="$(... 2>&1)"` 已移除 `timeout 1200` 前綴與 `rc==124` 補註（2026-07-09）。重複寫的防護不靠時間上限，而是**獨立 worktree ＋ `pushToMain` 的 fetch+rebase 重試**（同一題就算兩趟並跑，也是 rebase 收斂、颱風更走滾動更新同一 slug）。
- **保留 timeout 的例外**：**非撰寫、可重跑、無 build 的**報告/探針/資料型仍保留合理上限——`weekly-report`／`tech-radar`（報告/清單）、`aeo-radar`（探針 1800）、`heartbeat`（data 120/dashboard 180/brain 360）、`indexing-submit`（API 600）。砍掉它們不會丟棄快完成的文章，且能防罕見卡死堆積。
- **怎麼避免重犯**：判準＝「這支 cron 會不會**產出一篇要 build＋發佈的文章**？」會 → 不設 timeout（砍掉＝白燒＋沒上線）；只是報告/抓資料/送 API → 可留 timeout。**不要因為『看到別支有 timeout 就照抄』**——先分辨它是不是撰寫型。改這幾支 `.sh` 後記得 push → `/root/appi.news-publisher` `git pull` 才生效。

## F. 一篇缺封面 webp 會讓 check:links 擋掉「整條」共用部署佇列（不只那篇）

- **問題**：2026-07-13 自動日更推的「關於黑胡椒」（`appi-news-184`，status: published）frontmatter 寫 `coverImage: covers/appi-news-184.webp`，但那張封面 webp **沒被 commit**（只有內文圖 `images/appi-news-184/1.jpg`、`2.png`、`3.svg`）。這張缺圖被相關文章當縮圖引用 33 處，`check:links` 硬 gate 判「內部壞連結」→ **從 03:42 UTC 起每一次部署都失敗（含 06:00 那班 cron）**。真正的痛點不是這篇上不了，而是**整條共用部署佇列被卡住**——當晚 20:00 該轉正的排程文（口腔系列「牙周病」）也因此上不了線，且線上站停在舊版本。
- **原因**：兩層破口疊加。①**批次封面步驟漏一篇且無聲**：`cover: appi-news-N` 這個 commit 對 182/183/376/377 都有、對 184 就是沒有（cover 步驟對該篇 skip 或 fail 卻沒中止、沒告警），frontmatter 仍指向不存在的檔。②**唯一的硬擋在部署端**：`scripts/validate-content.mjs` 其實有檢查封面存在（`publicExists`，M. coverImage 段），但**只 `warn` 不 `error`**（`prebuild` 因此放行、`pnpm build` 成功）；真正會擋的只剩部署時的 `check:links`，而它擋的是**整條共用佇列**，不是單篇。於是「一篇壞文章 = 全站發佈停擺、還連累別線」。
- **解法（救回）**：用生圖 worker（`scripts/lib/ai-image.mjs` 的 `gpt-image-2`，本機只需有 repo push 權限的 GitHub token）補生那張封面、commit、push → check:links 過關、佇列解鎖。因當下已過該日排程時間（20:00＝12:00 UTC），這一 push 觸發的 build 也**順帶把排程文一起轉正**。
- **怎麼避免重犯**：核心原則＝**壞連結要在「進 main 前」擋、而且擋單篇；別靠部署端 `check:links` 擋、那會擋全站又連累別線**。
  1. **把 `validate-content.mjs` 的「coverImage 檔案不存在」由 `warn` 升為 `error`**（先略過 `http(s)://` 開頭的外部網址封面以免誤殺，站上確有數篇用 Unsplash URL 當封面），並在**內容產生端的 checkout**（`newsroom-write.mjs`／`article-write.mjs`／`appi-news-*` 批次封面線）push 前跑 `pnpm validate:content` 當 pre-push gate——壞文章當場失敗、不進 main、不害別線。
  2. **任何會寫文章的路徑**（含繞過 newsroom 配圖 gate 的 `appi-news-*` 批次、`apply-stock-covers.mjs`）都要在 commit 前確認 `coverImage` 指向的檔案真的存在；批次封面步驟對單篇 skip/fail 要**中止該篇或至少報錯**，不要無聲跳過。
  判準＝「這個壞連結會不會在部署時擋住『別人』？會 → 一定要在進 main 前攔下來、指名單篇，而不是留給 `check:links` 在部署端擋掉整條佇列。」對應 SOP：[`docs/automation-invariants.md`](../automation-invariants.md) 的配圖 gate 一節。

## G. 過期的護欄會變減產器；把去重放在最貴的那一端＝整晚燒在 SKIP 上

- **問題**：國際編譯台 2026-07-27 那班**產出 0 篇**（前一篇停在 7/26 23:14），Slack 靜默無告警。log 全長只有 8 行：24 則候選、處理 1 則、`SKIP｜無法解析 INTL_RESULT`、`時間預算（540s）用盡`、收工。
- **原因**：三層疊加。
  1. **過期護欄**：`INTL_TIME_BUDGET_MS`（540s）是 2026-06-23（`fa9d4f1`）為了閃避 cron 外層 `timeout 1200` 才加的——被砍在迴圈中途會整批 0 上架。那個外層 timeout 已於 2026-07-09（`1e2a901`，見 §E）移除，**護欄的對象消失、護欄卻留著**，變成純粹的減產器：每則寫作要 6~9 分鐘，540s 等於每晚只跑得動 1~2 則。
  2. **故障與判斷不分**：`parseIntlResult` 對「模型沒吐出可解析的 `INTL_RESULT`」有標 `infra: true`，但**全 repo 沒有任何地方消費這個旗標**（死程式碼）。於是基礎設施級故障被當成「編輯判斷跳過」，照樣吃掉時間預算；且模型當下可能**已經把稿寫好在工作區**，卻因為 `wrote` 是從解析結果推出來的（不是看 `git status`），隨 worktree 的 `trap` 一起被刪掉。**單則失手＝整天 0 篇，而且已燒掉的 WebFetch/查證 token 全部丟棄。**
  3. **去重擺在最貴的那一端**：`international-select.mjs` **完全無狀態**（無帳本、無比對），只依 GDELT 熱度每區挑 3 則；唯一的去重與品質判斷寫在 prompt 步驟 2~4，也就是要先花 6~9 分鐘 WebFetch 讀原文、交叉查證，才可能換到一行 `SKIP｜已寫過且無新進展`。2026-07-28 實跑當天 24 則候選：**4 組同一事件被不同轉載媒體重複送進來**（日本地震、Polanski、西雅圖槍擊、澳洲獻金案），另有 7~8 則根本不是國際新聞（澳洲烤肉技巧、訃聞、鹽沼海平面研究、農業 AI 特寫），且 GDELT 標地大量錯誤（西雅圖槍擊標成 `Mexico`、澳洲政治標成 `Lebanon`）。**約三分之二的寫作呼叫注定產出 SKIP。** 國際線也是唯一沒有 seen 帳本的產線（`civic-seen.json`／`video-seen.json`／`typhoon-gate-sig.txt` 都有）。
- **解法**（2026-07-28，站長裁示）：
  1. **拿掉時間預算**（`INTL_TIME_BUDGET_MS` 預設 0＝不限，只留當緊急手煞車），選到的題跑完。
  2. **infra 失敗與編輯判斷分開**：解析失敗不計入預算、續跑下一則（`MAX_INFRA_FAILS=3` 防整體故障空燒）；同時比對 `git status` 把模型已寫好的稿**撿回來**走既有的缺圖／去 AI 腔／`check:links` 各關，不再默默丟掉。
  3. **三層便宜閘門前置**（`scripts/lib/international-gate.mjs`）：① curl 抓 `<title>` 後同批同事件去重（Jaccard）；② `international-seen.json` 跨日帳本；③ 一次 Haiku 批次篩選標題，砍掉非國際新聞與已寫過的事件。**任何一層自己壞掉一律 fail-open 全部放行**——閘門絕不能變成新的「整晚 0 篇」來源。
- **怎麼避免重犯**：
  - **移除一個限制時，回頭檢查為它而生的補丁**。§E 拿掉 `timeout` 是對的，但沒同時清掉當初為了閃避它而加的時間預算，於是護欄失去對象、只剩副作用。判準＝「這個數字當初是為了怕什麼？那件事還在嗎？」
  - **昂貴的判斷之前要有便宜的判斷**。凡是「每則要呼叫一次模型」的產線，先問：這則值不值得呼叫？能用腳本（帳本／字串比對／標題）判掉的，不要花 6~9 分鐘讓模型判。
  - **故障不等於結論**：解析失敗、API error 這類基礎設施故障，不可以當成「模型判定跳過」記進帳本或吃掉預算，否則故障會被當成正常結果永久固化。
  - **同一個模式抄過去的地方都要一起查**（2026-07-28 同日追查）：`infra` 旗標其實**五條撰寫產線的 parser 都有設**，而**五支協調器都沒有任何一處讀它**。逐條確認後果各不相同，一併修掉——
    - `focus-esg`：同款過期預算（`FOCUS_TIME_BUDGET_MS` 540s，註解也寫「故預設 540s」，同樣是為已移除的 timeout 而設）＋ 解析失敗會 `break` 整輪，等於「一次漏印就收工」。
    - `lifestyle-civic`：**後果最持久**——解析失敗照樣 `recordSeen(fresh)`，註解寫「Claude 判定無合適便民措施」，但故障也會走到那裡，於是**一次故障把當天整批候選永久記成「已判過、不再重覆提供」**，那些題再也不會被提起，且不會自己復原。
    - `lifestyle-video`：兩處 `recordSeen(fresh)` 都記整批，含因故障沒拿到判斷的候選 → 改成只記真的拿到判斷的（`fresh.filter(c => !failed.has(c))`）。
    - `lifestyle-police`：單則、無帳本，主要損失是已寫好的稿被丟掉 → 補撿回。
    - 共用救援抽成 `scripts/lib/changed-articles.mjs`（`salvageArticle`），五線同一套。判準＝**「這個 break／return／記帳本的分支，故障和判斷會不會走到同一條路？」**
  - **靜默的 0 產出要能被看見**：這班的「無產出安靜不報」讓整天掛零沒有任何告警，是隔天才由站長人工發現的。

## H. 同一條知識抄 N 份必漂移：判定與 gate 收斂為單一正本

- **問題**（2026-08-20 架構體檢實測）：「claude-appi 成功了嗎」的判定 regex 在 `.mjs`＋`.sh` 共 17 處各抄一份，且已漂移成 4 種語意——撞限額時有的線 `die` 整支、有的 `continue` 逐則狂打（帳號層級的限額會把整批 20+ 則打成空跑，燒共用額度）、有的 `break`、有的只丟單篇；唯一正確的兩段式判斷（限額→中止整批；單則 API error→跳過續跑）只寫在國際線的註解裡，其他線的作者看不到。同病的還有：哨兵行解析 7 份逐字複本＋1 份漂移（`health-days` 版不回 `infra` 旗標、也沒接 `salvageArticle`，模型漏印結果行時已寫好的稿隨 worktree 被刪）；四道內容 gate 的 spawn 序列 8 份，跑出 4 種順序、2 種失敗語意（civic/police 一篇違規會把整批陪葬）；國際線的標籤 gate 剔除時漏了把該篇移出 `wrote`，會對已刪的稿印 `PUBLISHED=`。近兩個月「加一道 gate／補一條規則」的 commit 每次都要同時改 3~8 條產線，漏一條就是隱性分裂。
- **原因**：知識的載體是**註解**而不是 **interface**。每份複本誕生時都正確，之後各自演化；沒有任何機制讓「改了正本」自動傳到複本，也沒有測試把複本釘在一起。
- **解法**（同日）：三個單一正本，各產線一律 import、不再自抄——
  1. `scripts/lib/claude-cli.mjs`：`runClaudeArticle()`→`classifyClaudeRun()` 三態（`quota` 中止整批／`fail` 跳過該則／`ok`）＋`parseSentinelResult()`（哨兵解析，`infra` 旗標一律有）。
  2. `scripts/lib/publish-pipeline.mjs`：`runArticleGates()`＝gate 集合、順序與 report-only 與否的唯一定義點；失敗語意統一「回報不決定」，呼叫端剔除該篇、永不整批陪葬。
  3. `scripts/lib/article-index.mjs`：`articleTitle`／`recentTitles` 等文章索引小工具。
- **怎麼避免重犯**：
  - **同一段 regex／spawn 序列第二次出現，就是抽正本的時機**——第三次出現後每一份都會開始各自演化，屆時要靠 grep 考古才能判斷哪份是對的。
  - **新增產線接線清單**：喚模型走 `runClaudeArticle`、gate 走 `runArticleGates`、索引走 `article-index`——發現任何新產線自己 spawn `claude-appi` 或自排 gate 序列，視同踩本節的坑，當場改。
  - **正確語意寫進回傳值，不要寫進註解**：「限額要中止整批」這件事現在由 `kind: 'quota'` 這個型別承載，呼叫端想錯也寫不出「對 quota continue」的自然寫法。
