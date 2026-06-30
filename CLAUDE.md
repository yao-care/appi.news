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
- commit / push 前不需反覆要授權；但**破壞性、對外的動作仍須先確認**。
- **在 `main`（預設分支）上要 commit，先開分支**。
- 注意 `~/.claude/settings.json` 有 deny 規則擋 `git branch -D`、`git push --force` 等；刪已合併分支改用「先刪遠端 → `git fetch --prune` → 小寫 `git branch -d`」。

## 內容紀律（文章產出）

- **全文繁體中文 + 台灣用語**（軟體 / 程式 / 網路 / 演算法 / 人工智慧…），禁中國用語（軟件 / 程序 / 網絡 / 算法 / 人工智能…）。標題、正文、frontmatter 皆適用。
- **去 AI 腔**：禁破折號（`—`/`--`）、禁 AI 套語（「不僅…更…」「值得注意的是」「總而言之」自問自答等）、禁空泛升華與翻譯腔。完整守則見 `.claude/skills/newsroom/SKILL.md` 與 persona。
- **所有資料附 inline 來源超連結**，且**全文每條超連結逐條查證可連線**，不留死連結。
- 日更走 `/newsroom` skill；作者人格與跨文記憶在 `.claude/skills/newsroom/persona.md`、`author-memory.json`。
- 新文必填 `tags`（餵 keywords / RSS / llms 索引）；文章規格與欄位以 `src/content.config.ts` 為唯一準據。

## 雙帳號與模型政策（自動化必讀）

兩個 CLI 帳號分工，**別混用**：

- **`claude`（開發）**：人在 dev 目錄 `/root/appi.news` 互動開發、commit、改 crontab。
- **`claude-appi`（營運，`CLAUDE_CONFIG_DIR=~/.claude-appi`）**：所有 cron／自動產文走它（在 publisher checkout 跑）。

**模型**：Opus 已退場。所有 `claude-appi` 呼叫**一律明確帶 `--model`**——產文／選題／週報用 **Sonnet 5（`claude-sonnet-5`）**、newsroom 觀點查核 gate 用 **Haiku**。全域預設仍是 Opus，**不帶 `--model` 就會默默吃 Opus 燒爆週額度**（出過事，見 [`docs/lessons/automation-model-and-account-split.md`](./docs/lessons/automation-model-and-account-split.md)）。

**判斷自動化成功不能只看 exit code**：`claude-appi` 撞用量上限／拒答會 **exit 0** 只印 stdout；`.sh` 要用失敗 regex（含 `weekly limit`）、`.mjs` 要掃 stdout。

> 完整不可違反規則見 [`docs/automation-invariants.md`](./docs/automation-invariants.md)；排程／模型總表見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表。

## 自動發文 pipeline（全貌）

整條鏈每天自動跑，是「內容情境」的主力產線；操作細節在各 skill，本段只給全貌與鐵則。

> **多分類自動內容（國際/生活/運動）**：科技以外的頻道**各有各的萃取邏輯與來源**（GDELT、政府開放資料、各地警局、學生賽事投稿…），**不是同一套雷達**。完整 cron 總表、各頻道來源/上線方式/Slack 行為、並發保護，見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §子專案 3；設計脈絡見記憶 `new-verticals-automation-plan` / `international-desk-gdelt` / `slack-appi-news-workspace`。下面這條是科技日更（最早的那條）。

```
tech-radar（cron 每日一次）→ 發候選題到 Slack（帶「我要寫這題」按鈕）
  → 作者點按鈕 → slack-actions-server 收事件 → 觸發 newsroom-write.mjs
  → 起草＋逐段配圖＋連結逐條查證 →（配圖硬性 gate）→ commit → 排程/上線
週末另跑 weekly-report，把曝光數據回饋成下一輪選題（見 §數據與網路曝光量）
```

| 元件 | 路徑 / 識別 | 角色 |
|---|---|---|
| 選題雷達 | `.claude/skills/tech-radar/`、`scripts/cron/tech-radar.sh` | 只產 tech 候選；排程／模型見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表 |
| 起草引擎 | `.claude/skills/newsroom/`（`SKILL.md` / `persona.md` / `author-memory.json`） | 文風、人格、跨文記憶；`/newsroom` 互動寫作也走它 |
| 自動產文 | `scripts/newsroom-write.mjs` | headless 起草＋**配圖硬性 gate**（缺 coverImage／封面檔不存在／內文 0 圖 → 中止不發），完成寫 `result.json` |
| Slack server | `scripts/slack-actions-server.mjs`、pm2 `appinews-slack-actions` | 收按鈕事件觸發產文，回報摘要/重點/預覽連結 |
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
