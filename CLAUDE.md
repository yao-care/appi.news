# APPI News 專案規則（給 Claude / 開發者）

> 本檔是 **APPI News 專案專屬規則**，疊加在全域 `~/.claude/CLAUDE.md` 之上。衝突時以本檔為準。
> 給「怎麼動這個專案」的人看（AI 代理與開發者）。「怎麼維護、怎麼新增內容」的完整說明在 [`README.md`](./README.md)。

## 維護情境路由（先決定你在哪一格，再讀對應事實來源）

> `README.md`（給人）與本檔（給 AI/開發者）是**兩個對等入口、內容互相對齊**；不論你讀哪一份，下表都帶你到正確的事實來源（SOT）。入口只負責導航與鐵則，**操作細節在各 SOT，不在入口重複**。
>
> **三層分工**：本檔/README＝導航＋鐵則；說明文件（`PERFORMANCE.md`、`docs/SERVER_HANDOFF.md`…）＝**怎麼做**；[`docs/lessons/`](./docs/lessons/)＝**為什麼**（踩過的坑與重大決策，問題→原因→解法）。SOT 遇到「為什麼這樣做」一律連到 lessons，不在原地重述歷史。

### 新增一條歷史經驗（lesson）的流程

**觸發**：每當你**診斷並修掉一個非顯而易見的坑**，或做了一個**會影響後人**的重大取捨，就補一篇 lesson。判準＝「下一個人不知道會再踩」。

1. **寫正本**：在 `docs/lessons/` 新增 `<kebab-slug>.md`，照 [`docs/lessons/README.md`](./docs/lessons/README.md) 的骨架（摘要列＋**問題 → 原因 → 解法 → 怎麼避免重犯**）。相近主題優先**併進現有篇**的新小節，別碎檔。
2. **登錄索引**：在 `docs/lessons/README.md` 的「現有篇目」表加一列。
3. **SOP 指路**：在對應說明文件把「為什麼/歷史」改成一句話連到正本，**不在 SOP 重述**。
4. **記憶指回**：若有對應 Claude 記憶，記憶改成一句話指回 in-repo 正本（記憶不進 repo，只留操作摘要）。

**不該寫成 lesson 的**（留在記憶/設定即可）：使用者偏好、操作性 config（頻道 ID、property、流量基準）、進行中計畫與 todo——這些不是可重用的工程教訓。

| 你要做的事 | 情境 | 依序讀（事實來源） |
|---|---|---|
| 優化/更新專案本體：效能、版面、schema、build、部署 | 🛠 開發 | 本檔 §動手前驗證＋§效能鐵則 → [`PERFORMANCE.md`](./PERFORMANCE.md)（動字型/CSS/圖/build 前必讀）→ [`README.md`](./README.md) §開發 |
| 手動新增內容：文章、作者、專欄、分類 | ✍ 內容 | [`README.md`](./README.md) §新增內容 → `src/content.config.ts`、`src/config/categories.ts`（schema/分類唯一準據） |
| 自動發文：選題雷達 → Slack → 自動產文 → 排程上線 | 🤖 自動化 | 本檔 §自動發文 pipeline → `.claude/skills/tech-radar/`＋`.claude/skills/newsroom/` |
| 了解網路曝光量：流量、搜尋曝光、AI 轉介、週報 | 📊 數據 | 本檔 §數據與網路曝光量 → `.claude/skills/weekly-report/SKILL.md` → [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) |

## 技術速覽

- **Astro 5**（`output: 'static'`）+ **pnpm**，部署 GitHub Actions → GitHub Pages，正式網域 **`https://appi.news/`**（自訂網域；`yao-care.github.io/appi.news/` 為退回選項，做法見 `README.md`「目前正式網域設定」）。
- **套件管理一律 pnpm**（有 `pnpm-lock.yaml`；用 npm 會炸 `Cannot read properties of null`）。
- 內容是 **Astro Content Collections**（`src/content/`：`articles` / `authors` / `columns` / `topics`），搜尋用 **Pagefind**。
- 科技類日更靠 `/newsroom` skill（`.claude/skills/newsroom/`）。

## 動手前驗證（禁止猜測）

- 改 schema / 文章欄位前，先看 `src/content.config.ts`（四個 collection 的 zod schema、enum 與預設值的唯一事實來源）。
- 改分類 / 子分類前，先看 `src/config/categories.ts`（`CATEGORY_SLUGS` 是 `category` 的型別約束源；新增 slug 後文章才能用）。
- 連結一律走 `src/utils/url.ts` 的 `url()` / `absoluteUrl()` / `asset()`，**不要逐檔硬寫網址**（換網域才不會散落）。
- 報告現況前先跑 CLI 取得最新結果，不要憑記憶；CLI 輸出直接貼，不要重排成表格。

## 效能鐵則（最重要，違反會崩盤）

**動到字型、CSS、首頁圖片、全站樣式或 build 流程前，必須先讀 [`PERFORMANCE.md`](./PERFORMANCE.md)。**

1. **字型只能用繁中子集進入點**：`@fontsource/noto-*-tc/chinese-traditional-<weight>.css`、`@fontsource/inter/latin-<weight>.css`。**禁止**全腳本進入點（`@fontsource/noto-sans-tc/400.css` 等）。（為什麼：當初全腳本造成 545 個 `@font-face`、662 KB render-blocking → [`docs/lessons/font-render-blocking.md`](./docs/lessons/font-render-blocking.md)。）
2. **不要拿掉或改順序** `package.json` `postbuild` 的串接：`subset-fonts.mjs` → `optimize-home-images.mjs` → `optimize-article-images.mjs` → `inline-css.mjs` → `pagefind`。四支腳本是首頁與內頁效能達標的關鍵。
3. **效能驗收用第三方 PSI（Google 機房）對線上站**，不要用本機或 CI 的 Lighthouse（會抖、不準）。PSI key 在 `.env`（已 gitignore）。
4. **基準不可退回**：desktop 100、mobile 90+、TBT 0、CLS 0。改完務必複測。
5. 內頁（文章頁）現已套用 critical CSS 內聯（`inline-css.mjs`）＋封面縮 webp（`optimize-article-images.mjs`），同首頁手法已延伸到內頁。要動內頁效能前一樣先讀 `PERFORMANCE.md`。

## 設計規範（v2，2026-07-20 全站統一，CI 硬性守門）

`scripts/check-design.mjs` 接在 `pnpm build` 最前面（`pnpm check:design` 可單獨跑），掃 `src/` 下所有 `.css`/`.astro`/`.svelte`，違規即 build fail、擋部署，CI `notify-failure` job 發 Slack 告警：

1. **font-size 禁 px**：一律 `var(--text-*)` 字級階梯（正文 ≥18px）。
2. **顏色只准寫在 `src/styles/variables.css`**（design token 單一來源，oklch＋hex fallback）；其他檔一律引用 `var(--*)`。
3. **禁 `!important`**。
4. **禁外部 CDN**（fonts.googleapis / cdnjs / unpkg / jsdelivr）；字型自託管 @fontsource（仍須遵守上方效能鐵則的繁中子集進入點）。
5. **css 檔白名單**：`src/` 的 `.css` 只准 `src/styles/{variables,global}.css`，新增 css 檔即 fail；元件樣式寫 scoped `<style>` 或進 `global.css`。

**遷移期凍結（禁再擴充）**：17 個既有檔僅豁免「顏色」規則（存量 `var(--x, #hex)` fallback、rgba 疊層、canvas JS 色字串）。凍結清單與 TODO 見 `scripts/check-design.mjs` 檔頭——**新檔案一律不得加入凍結清單，清一檔移一檔**。（/choice 實驗室與其整檔豁免已於 2026-07-20 刪除。）

## 部署與驗收

- 部署設定在 `.github/workflows/deploy.yml`，觸發條件有三：**push 到 `main`**、**每 6 小時 cron**、**手動 `workflow_dispatch`**。
- `status: scheduled` 且 `publishDate` 在未來的文章**不進列表/sitemap/RSS/llms**（由 `getPublishedArticles()` 過濾），到時間後由 6 小時 cron 重建自動上線。
  - 但會在 `/articles/<slug>/` 產出一個 **noindex、不被任何站內連結指到**的「排程草稿預覽頁」（`getScheduledPreviewArticles()` + `[slug].astro` getStaticPaths），供作者**站內預覽＋編輯**（登入 `/admin` 後右下角「編輯」鈕）。sitemap 由 `astro.config.mjs` 的 `previewPaths` 排除；tag 在預覽頁渲染為純文字（避免連到未產出的 tag 頁擋 `check:links`）。到 `publishDate` 後同一 URL 自動轉正（拿掉 noindex、進列表）。
- 自動產文（`scripts/newsroom-write.mjs`）有**配圖硬性 gate**：缺 `coverImage` / 封面檔不存在 / 內文 0 張圖 → 中止不發佈（改動留工作區待補）。完成後寫 `result.json`，由 `slack-actions-server.mjs` 回報 Slack 帶**內文摘要＋重點＋預覽/編輯連結**。
- 上線前自檢：`pnpm build && pnpm check:links`（**站內壞連結是硬性 gate，會擋部署**；Lighthouse 是軟性、僅參考）。
- 驗收以**部署後的線上站**為準，不是本機 `pnpm preview`。
- **上線後必用 PSI（PageSpeed Insights，Google 機房）檢查線上站**，涵蓋 performance / accessibility / best-practices / seo。本機與 CI 的 Lighthouse 會抖、不可當準（細節見 `PERFORMANCE.md` §3）。
  - **金鑰**：`PSI_API_KEY` 存在 `/root/appi.news/.env`（已 gitignore，**勿寫進任何 commit 檔案**）。取得方式：Google Cloud Console 啟用 PageSpeed Insights API → 建 API 金鑰。
  - **用法**：`set -a; source .env; set +a` 後
    ```bash
    curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<URL>&strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices&key=$PSI_API_KEY"
    ```
    取 `lighthouseResult.categories.<cat>.score`。`strategy` 可換 `desktop`。
  - **量測陷阱（會誤判退步，務必依 `PERFORMANCE.md` §3 處理）**：①剛部署 CDN 冷邊緣 → FCP/LCP 暴增到 10s+，等暖（下次 6h cron 或自然流量）才是真值；②PSI 對固定 URL **釘住舊冷跑** → 網址加 `?cb=<timestamp>` 強制重跑。**判讀重點：TBT / CLS / render-blocking / 各請求耗時** 若都正常，低分多半是冷邊緣假象，不要對假問題改程式。
  - **基準（不可退回，見 `PERFORMANCE.md` §4）**：desktop 100、mobile 90–100、TBT 0、CLS 0；無障礙 ≥0.95（目前線上 100）。
- **改動的終點是「已發佈上線」，不是「分支就緒」**：日常內容／功能／版面／技術／SEO 改動一律走完整條——開分支 → `pnpm build && pnpm check:links` 綠 → merge 進 `main` → `git push origin main`（觸發 deploy.yml）→ 等發佈完 → 驗線上站 → **才回報**。**不要停下來問「要不要 push／開 PR」**（站長已反覆強調；把自家網站內容 push＋發佈＝早已授權的既定流程，**不算**下一條的「對外先確認」）。
- **只有這幾類才先問一句**（其餘一律直接做到發佈）：①不可逆的資料／內容刪除或覆寫（刪非自建產物、drop DB）；②向真實外部第三方主動送出（寄信給 BBC／客戶、公開社群發文）；③DNS／基礎設施／金鑰變更；④`force-push`／改寫歷史／刪遠端分支；⑤**全新且沒討論過的產品方向**（例：英文投稿包裝——先確認方向再動手，別自行開工）。
- **在 `main`（預設分支）上要 commit，先開分支**（但別停在分支——照上面走到發佈）。
- 注意 `~/.claude/settings.json` 有 deny 規則擋 `git branch -D`、`git push --force` 等；刪已合併分支改用「先刪遠端 → `git fetch --prune` → 小寫 `git branch -d`」。

## 內容紀律（文章產出）

- **全文繁體中文 + 台灣用語**（軟體 / 程式 / 網路 / 演算法 / 人工智慧…），禁中國用語（軟件 / 程序 / 網絡 / 算法 / 人工智能…）。標題、正文、frontmatter 皆適用。
- **去 AI 腔（機械守門＝統一引擎）**：禁破折號（`—`/`--`）、禁 AI 套語（「不僅…更…」「值得注意的是」「總而言之」自問自答等）、禁空泛升華與翻譯腔。完整守則見 `.claude/skills/newsroom/SKILL.md` 與 persona。
  - **內容守門 gate＝`scripts/check-content.mjs`**（2026-07-21 起，取代已移除的 `check-ai-tone.mjs`；接在 `pnpm build` 的 `check-design` 之後，`pnpm check:content` 可單獨跑、`pnpm check:content:all` 盤點存量、五條產線 `spawnSync` 產文後自檢）。它是**跨站統一引擎**：核心規則在 `.claude/skills/new-astro-site/templates/check-content.mjs`（跨站共識：不僅…更／值得注意的是／換句話說／模糊引用／模板化開頭…），appi 特化規則在本 repo 檔頭 `SITE_ERROR_TELLS`／`SITE_WARN_LAYERS`（破折號升 ERROR、自我辯白 meta 旁白家族）。
  - **兩級判定**：ERROR（單一命中即 exit 1 擋 build）；WARN（軟訊號分詞彙/句式/結構/語氣四層，**單檔跨 ≥3 層才升 ERROR**，否則只印）。
  - **grandfather**：預設只掃「相對 `origin/main` 的變動檔」中的 `src/**/*.md(x)`，存量 465 篇不受硬 gate 約束；抓不到 git base（CI 淺 checkout）→ 掃 0 檔 exit 0，永不誤擋。
  - **維護分工**：跨站規則改核心模板（一處全站生效，改完同步各站）；appi 專屬只改 `scripts/check-content.mjs` 檔頭 SITE 區塊，**別動核心**。新增硬 tell 只加零誤判的，語氣類留 WARN。
  - **⚠️ 統一核心比舊 appi gate 嚴，對 cron 新產文有過嚴風險（待觀察）**：核心把多條 appi 舊版沒有／只列 WARN 的句型升為 **ERROR**，實測存量命中量大＝appi 新聞體常態用語：`不是X而是Y`（673 行）、`模糊引用`（研究顯示/專家認為，144）、`不只是…更是/而是`（68）、`換句話說`（64）、`並非…而是`（29）。**存量靠 grandfather 不受影響，但每日 cron 產的新文會走這關**——若這幾條（尤以 `不是X而是Y`、`研究顯示`）開始頻繁擋掉合理新聞稿，處置順序：①先在 newsroom persona/SKILL 步驟三.7 教模型避開（首選，正本清源）；②SITE 擴充點只能「加嚴」或用 `ALLOW` 整行白名單，**無法**把核心 ERROR 降級為 WARN——真要放寬得改核心模板（影響全站，需跨站權衡）。目前**預設不動核心**，先觀察 cron 命中情形再議（脈絡見 `docs/lessons/ai-tone-gate.md` 2026-07-21 追記）。
- **所有資料附 inline 來源超連結**，且**全文每條超連結逐條查證可連線**，不留死連結。
- 日更走 `/newsroom` skill；作者人格與跨文記憶在 `.claude/skills/newsroom/persona.md`、`author-memory.json`。
- 新文必填 `tags`（餵 keywords / RSS / llms 索引）；文章規格與欄位以 `src/content.config.ts` 為唯一準據。

## 帳號與模型政策（自動化必讀）

**單一帳號：`claude-appi`（`CLAUDE_CONFIG_DIR=~/.claude-appi`）。**（2026-07-28 起）互動開發、commit、改 crontab、cron／自動產文，全部走同一個帳號；原本的「dev 用 `claude`／營運用 `claude-appi`」雙帳號分工**已取消**。

因此有兩個推論要記著：

- **用量池共用**：互動開發花掉的額度會直接吃到自動產線的配額。撞週限時 cron 會整批空跑（且 exit 0 靜默，見下），所以大批量互動作業前先想一下當日還有沒有產線要跑。
- **憑證是單點**：`~/.claude-appi/.credentials.json` 失效＝互動與自動化一起啞掉（2026-07-26 出過事，四站同時掛）。無備份，只能 `CLAUDE_CONFIG_DIR=/root/.claude-appi claude` → `/login` 重新登入。

**模型**：Opus 已退場。所有 `claude-appi` 呼叫**一律明確帶 `--model`**——產文／選題／週報用 **Sonnet 5（`claude-sonnet-5`）**、newsroom 觀點查核 gate 用 **Haiku**。全域預設仍是 Opus，**不帶 `--model` 就會默默吃 Opus 燒爆週額度**（出過事，見 [`docs/lessons/automation-model-and-account-split.md`](./docs/lessons/automation-model-and-account-split.md)）。

**判斷自動化成功不能只看 exit code**：`claude-appi` 撞用量上限／拒答會 **exit 0** 只印 stdout；`.sh` 要用失敗 regex（含 `weekly limit`）、`.mjs` 要掃 stdout。

> 完整不可違反規則見 [`docs/automation-invariants.md`](./docs/automation-invariants.md)；排程／模型總表見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表。

## 自動發文 pipeline（全貌）

整條鏈每天自動跑，是「內容情境」的主力產線；操作細節在各 skill，本段只給全貌與鐵則。

> **健康紀念日（每年 51 天，2026-07-28 新增）**：與所有其他產線不同，這條是**日期驅動**而非題材驅動——年曆表（`scripts/lib/health-days.mjs`，51 筆逐條查證過）決定哪天要寫什麼，T-2 天抓當年度素材寫成**排程稿**（`status: scheduled` + `publishDate <當日>T06:17+08:00`），當天台北 06:17 由**另一支純 shell cron** 戳 `workflow_dispatch` 觸發 deploy 才真正上線。**兩支 cron 不可合併**，也不要以為排程稿會自己上線——`isPublic()` 比對的是 build 當下時間，`deploy.yml` 的 6 小時 cron 對不上 06:17。配圖依站長指定**一律 OpenAI 生圖**（`get-image.mjs --generate`，其餘四線維持圖庫優先）。為什麼＝[`docs/lessons/annual-observance-scheduling.md`](./docs/lessons/annual-observance-scheduling.md)。
>
> **多分類自動內容（國際/生活/運動）**：科技以外的頻道**各有各的萃取邏輯與來源**（GDELT、政府開放資料、各地警局、學生賽事投稿…），**不是同一套雷達**。完整 cron 總表、各頻道來源/上線方式/Slack 行為、並發保護，見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §子專案 3；設計脈絡見記憶 `new-verticals-automation-plan` / `international-desk-gdelt` / `slack-appi-news-workspace`。下面這條是科技日更（最早的那條）。

```
tech-radar（cron 每日 UTC 21:20＝台北 05:20；2026-07-07 曾停用、2026-07-20 重新啟用；亦可由週報按鈕/`/newsroom`/`/admin` 觸發）→ 發候選題到 Slack（帶「我要寫這題」按鈕）
  → 作者點按鈕 → slack-actions-server 收事件 → 觸發 newsroom-write.mjs
  → 起草＋逐段配圖＋連結逐條查證 →（配圖硬性 gate）→ commit → 排程/上線
週末另跑 weekly-report，把曝光數據回饋成下一輪選題（見 §數據與網路曝光量）
```

| 元件 | 路徑 / 識別 | 角色 |
|---|---|---|
| 選題雷達 | `.claude/skills/tech-radar/`、`scripts/cron/tech-radar.sh` | 只產 tech 候選；排程／模型見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表 |
| 起草引擎 | `.claude/skills/newsroom/`（`SKILL.md` / `persona.md` / `author-memory.json`） | 文風、人格、跨文記憶；`/newsroom` 互動寫作也走它 |
| 自動產文 | `scripts/newsroom-write.mjs` | headless 起草＋**配圖硬性 gate**（缺 coverImage／封面檔不存在／內文 0 圖 → 中止不發），完成寫 `result.json` |
| Slack server | `scripts/slack-actions-server.mjs`、pm2 `appinews-slack-actions` | 收按鈕事件觸發產文，回報摘要/重點/預覽連結；也收 GitHub webhook（dev-bot 開發、`article-draft` 寫作） |
| /admin 寫作任務消費端 | `scripts/article-write.mjs`＋`scripts/lib/article-issue.mjs`（webhook `article-draft` → newsroom `--stage` → PR） | /admin 開的 `article-draft` issue → 走 newsroom 正規產線（配圖 gate 保留）寫成 **kind=factual 待審草稿** → 開 PR；merge 後仍待審，用編輯器／發佈鈕轉正。為什麼＝[`docs/lessons/article-draft-consumer.md`](./docs/lessons/article-draft-consumer.md) |
| 健康紀念日 | `scripts/lib/health-days.mjs`（年曆表＋解析器）＋`scripts/health-days.mjs`＋`scripts/cron/health-days{,-publish}.sh` | 日期驅動、每年 51 篇；排程稿＋準點觸發 deploy 兩段式，見上方說明 |
| 去重帳本 | `scripts/topic-ledger.mjs`、`/root/.local/state/appi-news/suggested-topics.json` | 雷達與週報共用，避免撞題 |
| 發佈隔離 checkout | `/root/appi.news-publisher`（`PUBLISH_ISOLATED=1`） | 自動產文在此跑，每篇 reset 到 `origin/main`；dev 目錄未提交改動不受影響 |

**鐵則（完整 checklist 見 [`docs/automation-invariants.md`](./docs/automation-invariants.md)）**：

- **配圖 gate 不可繞過**：缺圖一律中止、留工作區待補。
- **改發佈端程式或 cron `.sh`**：push → `/root/appi.news-publisher` `git pull` → `pm2 restart appinews-slack-actions`；**只 push 不 pull／只 restart 都會跑到舊碼**。
- 其餘（帳號／模型、UTC 換算、各自 worktree 並行不用 flock、成功≠exit code、publishDate 用系統時間蓋…）見上方正本 checklist。

## 數據與網路曝光量

了解站台曝光/流量的基礎設施。**讀數據前先看這裡，操作（怎麼跑、金鑰怎麼擺）在 `docs/SERVER_HANDOFF.md` 與 weekly-report skill。**

| 元件 | 路徑 / 識別 | 說明 |
|---|---|---|
| 站上埋點 | `src/components/seo/Analytics.astro`、`SITE.gaId`（`src/config/site.ts`，現為 `G-38R2SZ5FTQ`） | GA4 gtag，`requestIdleCallback` 延遲載入以保 TBT=0 |
| 數據抓取 | `scripts/weekly-data.mjs`、`scripts/lib/google-data.mjs` | 自簽 JWT 讀 GA4＋GSC，輸出四區塊 JSON |
| 週報技能 | `.claude/skills/weekly-report/SKILL.md`、`scripts/cron/weekly-report.sh` | 數據 → 熱題雷達 → 建議方向 → 發 Slack；排程見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表 |
| 設定常數 | `scripts/lib/report-config.mjs` | GA4 property `541946427`、GSC `sc-domain:appi.news`、Slack 一分類一頻道（`CATEGORY_CHANNELS`）、預設＝作者群 `C0BC4JRQJF6`、dev 頻道 `DEV_CHANNEL` |
| 機密金鑰 | `~/.config/appi-news/ga4-sa.json`、`~/.config/appi-news/report.env` | **永不進 repo**；server 端設定見 `docs/SERVER_HANDOFF.md` |

**注意**：

- 週報「AI 轉介點擊」= 真人從 AI 答案點連結進站，**不等於**被 AI 爬蟲抓取/引用（GA 是 client-side JS，爬蟲不跑 JS）。真 AEO 量測需另案（見 `PERFORMANCE.md` §6、`docs/SERVER_HANDOFF.md`）。
- **禁杜撰數據**：報告曝光/流量一律以 `weekly-data.mjs` 實跑輸出為準，不可憑記憶或估算（呼應 §動手前驗證）。

## 真實來源指標（要改什麼，先看哪裡）

| 要動的東西 | 唯一事實來源 |
|---|---|
| 文章/作者/專欄/專題 schema、enum | `src/content.config.ts` |
| 分類 / 子分類 | `src/config/categories.ts` |
| 站名 / 品牌 / OG 預設 | `src/config/site.ts` |
| 網址 / base / 換網域 | `src/utils/url.ts` + `astro.config.mjs`（`SITE` / `BASE`） |
| 效能規則 | `PERFORMANCE.md` |
| 新增內容步驟、架構說明 | `README.md` |
| WordPress 遷移 | `MIGRATION_NOTES.md` |
| 為什麼這樣做（踩過的坑、重大決策） | [`docs/lessons/`](./docs/lessons/)（問題→原因→解法） |
| 日更流程與作者人格 | `.claude/skills/newsroom/` |
| 自動發文 pipeline | `.claude/skills/tech-radar/`＋`scripts/newsroom-write.mjs`＋`scripts/slack-actions-server.mjs` |
| 數據 / 網路曝光量 | `scripts/weekly-data.mjs`＋`.claude/skills/weekly-report/`＋`scripts/lib/report-config.mjs` |
| 機密金鑰位置 | `.env`（PSI）、`~/.config/appi-news/`（GA4/GSC/Slack）— 永不進 repo |
| server 端自動化交接 | `docs/SERVER_HANDOFF.md` |
| 自動化鐵則（帳號／模型／cron／發佈端） | [`docs/automation-invariants.md`](./docs/automation-invariants.md) |
