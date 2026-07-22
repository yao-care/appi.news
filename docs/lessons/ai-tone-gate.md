# 去 AI 腔沒有真正的守門，只是寫作 prompt 裡的自檢指示

> 摘要：健康資料三部曲開頭「先揭露，免得你覺得我在夾帶」等自我辯白 meta 旁白上了線；查下去發現全站三道硬 gate 沒一道讀正文，去 AI 腔一直只是 prompt 指示 ｜ 範圍：內容/文風/自動化 ｜ 狀態：已解決（緩解） ｜ 日期：2026-07-20

## 問題（症狀）

站長讀到 `medical-ai-compliance-lessons` 開頭這段，直覺「這根本不像人寫的」：

> ## 先講清楚：我為什麼有資格談這些坑
> 先揭露，免得你覺得我在夾帶。本文拿來當範例的 goalkeeper…

同一天上線、互相連結的三篇（`taiwan-health-data-platform-join`、`taiwan-health-data-why-now`）共享同一種 AI 腔：自我辯白 meta 旁白（「這不是我危言聳聽」「說實話」「老實承認」）、自問自答暖場、「每節結尾都放大到國家級平台」的模板感、兩篇收在同一句金句「判斷權在你，不在平台的新聞稿」。站長的原話是：「我的整個網站都有這個機制，為什麼會沒有攔截到？」

## 原因（根因）

**站上根本沒有「掃正文文風」的機制。** 全站三道硬 gate 沒有一道讀正文一個字：

- `validate-content.mjs`（prebuild）→ frontmatter / slug / 分類 / disclaimer / 封面，**metadata only**。
- `check-design.mjs`（build）→ CSS / 顏色 / 字級 token。
- `check-links.mjs` → 站內連結。

去 AI 腔一直只活在**寫作 prompt 的自檢指示**裡（`.claude/skills/newsroom/SKILL.md` 步驟三.7「產檔前必過」）。模型少做，下游沒有任何東西回頭再查。「整個網站都有這個機制」對 design/links/metadata 為真，對**正文文風從來沒有機制，只有一句提醒**。

而且**這次漏掉的 pattern 連那句提醒都沒列**：清單當時只寫破折號／不僅…更／值得注意的是／自問自答，**沒有**「自我辯白 meta 旁白」這一家族。所以就算模型認真自檢，也不會把「免得你覺得我在夾帶」判成違規——規則沒點過它的名。

**為什麼不能直接加一堆 regex 硬掃全站**（走過的彎路，別再走）：正文文風 regex 誤判極高，實測全站 440 篇——

- 破折號 `—`：**123 篇**存量命中（多為 wp-* 遷移舊文）。全站硬 fail＝一次擋掉 123 篇的部署。
- 「危言聳聽」：`這不是危言聳聽，是疾管署年年提醒的` 是**正當人話**；`不僅…更`（53 篇）、自問自答（`那高風險義務呢？` 是真 H2 標題）全是誤判大戶。

結論：正文文風**無法**用 regex 全自動判對，硬掃全站只會二選一——不是誤擋就是擋死存量。

## 解法（怎麼修 + 現在怎麼維持）

分三層，刻意不做「全站硬掃」：

1. **補齊自檢清單**（`SKILL.md` 步驟三.7）：新增「自我辯白 meta 旁白」「模板感結構」兩條，明列這次的簽名句與「跨篇重複金句」。這是**寫作端**，讓模型一開始就別寫出來。

2. **掃正文的機械 gate**（2026-07-21 起＝統一引擎 `scripts/check-content.mjs`，見文末追記；原 `check-ai-tone.mjs` 已移除），設計取捨（別改壞）：
   - **只掃改動的文章**（預設相對 `origin/main`），把 440 篇存量 grandfather 掉——只有新寫/改寫的文章受硬 gate 約束（同 `check-design` 當初凍結存量的邏輯）。
   - **ERROR（exit 1，擋 build）只擋機械可判、近乎零誤判的簽名句**：破折號、`免得你…`、`我在夾帶`、`不怕你笑`、`先講清楚我為什麼有資格…`。
   - **WARN（exit 0，只印）**：語氣類高誤判 tell（值得注意的是／不僅…更／危言聳聽…），給人/agent 覆查，不擋。
   - 掃描前剝掉 frontmatter / 程式碼 / HTML 註解 / inline code / 連結與圖片的 URL，避免 `---` 分隔線、URL 裡的 `--` 之類假陽性。
   - **抓不到 git base（CI 淺 checkout、無 origin/main）→ 掃 0 檔、exit 0**，永不誤擋部署。

3. **兩個執行點**（因為作者稿與自動稿的發佈路徑不同）：
   - `pnpm build` 串了 `check:content`（`check-design` 之後；`check:tone` 保留為 alias）：擋**分支/dev 稿**——這次三篇正是 `sourceType: author`、走分支合併，這關會在合併前 exit 1 擋下。
   - `newsroom-write.mjs` 在配圖 gate 之後跑 `check-content <檔>`：擋**自動稿**（cron 直推 main，build gate 的 diff 對 main 為空、抓不到）。

## 怎麼避免重犯 / 相關

- **新增去 AI 腔規則時，兩邊都要動**：`SKILL.md` 步驟三.7（自檢，涵蓋語氣類）＋ `check-content.mjs`。**跨站共用規則改核心** `.claude/skills/new-astro-site/templates/check-content.mjs`（改一處全站生效，改完要同步各站）；**appi 自己的特化規則只改 `check-content.mjs` 檔頭的 `SITE_ERROR_TELLS`／`SITE_WARN_LAYERS`**（別動核心，保單一引擎）。硬 tell 只加**零誤判**的；語氣類永遠留 WARN，別升 ERROR。
- **盤點存量**：`pnpm check:content:all`（＝`node scripts/check-content.mjs --all`，report-only，永不擋）。想清破折號存量就照這份逐篇清、清一篇少一篇。
- **其他自動線已接**（2026-07-21）：`international-write` / `lifestyle-civic` / `lifestyle-police` / `focus-esg` / `newsroom-write` 都在各自 commit 前跑 `spawnSync('node',['scripts/check-content.mjs', 檔])`、非 0 就 die/剔除。
- 相關：`content-refs-and-local-build-parity.md`（本機只跑 `astro build` 會跳過 prebuild 硬 gate）、`link-and-content-validation.md`（另一類內容假陽性）。

## 追記（2026-07-21）：frontmatter 的 title／description 才是最大盲點

同一批三部曲，站長最後爆的點不是內文，是**標題**：「健康資料平台的信任，是一行行做出來的：…」這種文青副標，是自動產線生的、掛在最顯眼的位置，卻**連跑三輪去 AI 腔都沒被看到**。原因跟本文主旨同源、但更尖：

- **`title`／`description`／`highlights`／`coverAlt` 全是 AI 生成的散文，卻沒有任何東西掃它們。** 機械 gate 明文**剝掉 frontmatter**（避免 `---`、URL 假陽性），人工去 AI 腔又只盯內文。結果整頁最多人先看到的字（標題）反而是唯一沒查的。
- **教訓一**：去 AI 腔複查（SKILL 步驟三.7）與任何人工 review，**第一個看 title，不是內文**。標題的 AI 味＝冒號文青副標（「X，是……的：正題」）、「從 A 看 B」、évocative 排比。
- **教訓二**：標題／description 沒法用機械 gate 硬擋（冒號副標在正當標題也常見，誤判高），只能靠 prompt 自檢＋人眼。所以自動產線的 title 品質，是目前**沒有安全網**的一段，要當它天生不可信、逐篇人工看過再上。
- **教訓三（立場不只是文風）**：站長真正要的不是「把破折號拿掉」，是**立場**——分享幫忙而非評論打壓、邀請參與而非旁觀「該不該」、樂觀看待台灣進步。去 AI 腔到位、立場錯了照樣被打回。標題定調要先問「這篇是站在什麼位置對誰說話」，再遣詞。

## 追記（2026-07-21）：內容 gate 統一成 new-astro-site skill 的引擎

原本各站各寫一份去 AI 腔 gate（appi `check-ai-tone.mjs`、evidence `audit-ai-tone`、folk…），規則各自演化、跨站共識散落。改為**單一引擎**：`.claude/skills/new-astro-site/templates/check-content.mjs` 內含跨站共識核心（不僅…更／值得注意的是／換句話說／模糊引用／模板化開頭…）＋兩級判定（ERROR 硬擋、WARN 軟訊號**跨 ≥3 層才升 ERROR**）＋grandfather（只掃相對 `origin/main` 變動檔）＋SITE 擴充點。appi 安裝為 `scripts/check-content.mjs`，把原 `check-ai-tone.mjs` 的特化規則 port 進檔頭 SITE 擴充點後移除舊檔：

- `SITE_ERROR_TELLS`（appi 比核心嚴）：**破折號**（核心列 WARN 句式，appi 全站硬禁 → 升 ERROR）、`免得你(覺得|以為|認為|想)`、`我在夾帶`、`不怕你笑`、`先講清楚…我為什麼(有資格|夠格)`。
- `SITE_WARN_LAYERS.語氣`：`其實是同一(件事|回事)…(不同切面|的不同面向)`。
- 核心已含的（不僅…更、值得注意的是、綜上所述、這是一個X也是一個Y、危言聳聽·坦白說）**沒有重複加**。

**維護分工（重要）**：跨站規則改核心模板（一處全站生效）；appi 專屬規則只改 `scripts/check-content.mjs` 檔頭 SITE 區塊，**不動核心**。呼叫契約不變（explicit-file 命中 ERROR → exit 1；`--all` 恆 exit 0），所以五條產線 `spawnSync` 只換腳本名即可。

**過嚴風險評估**：核心把「值得注意的是／不僅…更／綜上所述」從 appi 舊版的 **WARN** 提升為 **ERROR**（單一命中即擋）。對存量無影響（grandfather 只擋變動檔），但**每日 cron 新產文會走這關**——若新聞體常態出現這些詞會誤擋。實測既有存量命中數見下；若 cron 開始頻繁被這幾條擋，屬合理新聞語境者記錄於此再議，預設不放寬核心。
