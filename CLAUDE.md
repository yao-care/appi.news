# APPI News 專案規則（給 Claude / 開發者）

> 本檔是 **APPI News 專案專屬規則**，疊加在全域 `~/.claude/CLAUDE.md` 之上。衝突時以本檔為準。
> 給「怎麼動這個專案」的人看（AI 代理與開發者）。「怎麼維護、怎麼新增內容」的完整說明在 [`README.md`](./README.md)。

## 這份檔案的定位與寫作規矩

- **三層分工**：本檔／`README.md`＝**導航＋規則**；說明文件（`PERFORMANCE.md`、`docs/SERVER_HANDOFF.md`、`docs/automation-invariants.md`）＝**怎麼做**；[`docs/lessons/`](./docs/lessons/)＝**為什麼**（踩過的坑與重大決策）。
- `README.md`（給人）與本檔（給 AI／開發者）是**兩個對等入口、內容互相對齊**。入口只負責導航與規則，**操作細節在各 SOT，不在入口重複**。
- 🔴 **本檔（與所有 SOT 文件）禁止寫死「會變的東西」**：篇數、題數、看板數、站台數、property／頻道 ID、當前分數、存量統計、「目前是 X」。這類一律改成**「跑這條指令去查」**。
  規則、門檻、契約（例如「mobile 不得低於 90」「配圖 gate 不可繞過」）是**規範不是現況**，要寫死。
  判準：**這個值會因為別人正常工作而改變嗎？** 會 → 寫指令；不會 → 寫死。
  （反例：本檔曾寫死「設計規範凍結清單有幾個檔」，後來清掉大半，文件卻沒人跟著改，照著讀就會判斷錯。）
- **歷史數字留在 `docs/lessons/`**：那裡記的是「當時發生什麼」，是證據，不是現況，不適用上面這條。

### 新增一條歷史經驗（lesson）的流程

**觸發**：每當你**診斷並修掉一個非顯而易見的坑**，或做了一個**會影響後人**的重大取捨，就補一篇 lesson。判準＝「下一個人不知道會再踩」。

1. **寫正本**：在 `docs/lessons/` 新增 `<kebab-slug>.md`，照 [`docs/lessons/README.md`](./docs/lessons/README.md) 的骨架（摘要列＋**問題 → 原因 → 解法 → 怎麼避免重犯**）。相近主題優先**併進現有篇**的新小節，別碎檔。
2. **登錄索引**：在 `docs/lessons/README.md` 的「現有篇目」表加一列。
3. **SOP 指路**：在對應說明文件把「為什麼／歷史」改成一句話連到正本，**不在 SOP 重述**。
4. **記憶指回**：若有對應 Claude 記憶，記憶改成一句話指回 in-repo 正本（記憶不進 repo，只留操作摘要）。

**不該寫成 lesson 的**（留在記憶／設定即可）：使用者偏好、操作性 config（頻道 ID、property、流量基準）、進行中計畫與 todo。

## 維護情境路由（先決定你在哪一格，再讀對應事實來源）

| 你要做的事 | 情境 | 依序讀（事實來源） |
|---|---|---|
| 優化／更新專案本體：效能、版面、schema、build、部署 | 🛠 開發 | 本檔 §動手前驗證＋§效能鐵則 → [`PERFORMANCE.md`](./PERFORMANCE.md)（動字型／CSS／圖／build 前必讀）→ [`README.md`](./README.md) §開發 |
| 手動新增內容：文章、作者、專欄、分類 | ✍ 內容 | [`README.md`](./README.md) §新增內容 → `src/content.config.ts`、`src/config/categories.ts`、`src/config/tags.ts` |
| 自動發文：選題雷達 → Slack → 自動產文 → 排程上線 | 🤖 自動化 | 本檔 §自動發文 pipeline → [`docs/automation-invariants.md`](./docs/automation-invariants.md) → [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) |
| 了解網路曝光量：流量、搜尋曝光、AI 轉介、週報 | 📊 數據 | 本檔 §數據與網路曝光量 → `.claude/skills/weekly-report/SKILL.md` → [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) |

## 查現況：一律跑指令，不要相信任何文件裡的數字

**報告現況前先跑 CLI 取得最新結果，不要憑記憶；CLI 輸出直接貼，不要重排成表格。**

| 你想知道 | 跑這個 |
|---|---|
| 站上有幾篇文章 | `ls src/content/articles/*.md \| wc -l` |
| 有哪些分類／子分類 slug | `node -e 'import("./scripts/lib/verticals.mjs").then(m=>{for(const[k,v]of Object.entries(m.ALL_CATEGORIES))console.log(k.padEnd(14),v.name,"|",v.subcategories.join(" "))})'`（SOT 仍是 `src/config/categories.ts`，此為其鏡像） |
| 受控標籤有幾個／有哪些 | `grep -c "^  { name: '" src/config/tags.ts`／`grep -oE "name: '[^']+'" src/config/tags.ts` |
| 設計規範的凍結豁免還剩哪幾檔 | `sed -n '/LEGACY_COLOR_FILES = new Set(\[/,/^\]);/p' scripts/check-design.mjs` |
| 健康紀念日年曆有幾筆 | `node -e 'import("./scripts/lib/health-days.mjs").then(m=>console.log(m.HEALTH_DAYS.length))'` |
| 急性症狀衛教有幾題／哪些待寫 | `node -e 'import("./scripts/lib/acute-care.mjs").then(m=>console.log(m.TOPICS.length))'` |
| 論壇雷達掃哪些看板、涵蓋哪些分類 | `node -e 'import("./scripts/lib/forum-signals.mjs").then(m=>console.table(m.BOARDS))'` |
| 論壇雷達此刻撈到什麼（純資料、不喚 LLM） | `node scripts/forum-radar.mjs`（dry-run） |
| GA4 property／GSC 站台／Slack 頻道 ID | `grep -nE "GA4_PROPERTY_ID\|GSC_SITE\|CHANNEL" scripts/lib/report-config.mjs` |
| 站上埋的 GA4 評估 ID | `grep -n gaId src/config/site.ts` |
| 有哪些 appi cron、排在幾點 | `crontab -l \| grep "appi.news-publisher/scripts/cron"` |
| 流量／搜尋曝光現況 | `node scripts/weekly-data.mjs`（**禁杜撰數據**，一律以實跑輸出為準） |
| 線上效能／無障礙現況 | 依 [`PERFORMANCE.md`](./PERFORMANCE.md) §3 跑 PSI 對線上站 |

## 技術速覽

- **Astro 5**（`output: 'static'`）+ **pnpm**，部署 GitHub Actions → GitHub Pages，正式網域 **`https://appi.news/`**（自訂網域；`yao-care.github.io/appi.news/` 為退回選項，做法見 `README.md`）。
- **套件管理一律 pnpm**（有 `pnpm-lock.yaml`；用 npm 會炸 `Cannot read properties of null`）。
- 內容是 **Astro Content Collections**（`src/content/`：`articles` / `authors` / `columns` / `topics`），搜尋用 **Pagefind**。

## 動手前驗證（禁止猜測）

- 改 schema／文章欄位前，先看 `src/content.config.ts`（四個 collection 的 zod schema、enum 與預設值的唯一事實來源）。
- 改分類／子分類前，先看 `src/config/categories.ts`（`CATEGORY_SLUGS` 是 `category` 的型別約束源；新增 slug 後文章才能用）。
- **標籤是受控詞彙表，不是自由關鍵詞欄位**：`src/config/tags.ts` 的 `TAG_VOCABULARY` 是 `tags` 的 `z.enum` 約束源，表外標籤會讓 build 直接失敗。要掛標籤先讀它、只能從裡面挑，挑不到就少掛，**不要發明近義詞**；真要新增看該檔檔頭流程。為什麼＝[`docs/lessons/tag-taxonomy.md`](./docs/lessons/tag-taxonomy.md)。
- 連結一律走 `src/utils/url.ts` 的 `url()` / `absoluteUrl()` / `asset()`，**不要逐檔硬寫網址**（換網域才不會散落）。

## 效能鐵則

**動到字型、CSS、首頁圖片、全站樣式或 build 流程前，必須先讀 [`PERFORMANCE.md`](./PERFORMANCE.md)。**

1. **字型只能用繁中子集進入點**：`@fontsource/noto-*-tc/chinese-traditional-<weight>.css`、`@fontsource/inter/latin-<weight>.css`。**禁止**全腳本進入點（`@fontsource/noto-sans-tc/400.css` 等）。為什麼＝[`docs/lessons/font-render-blocking.md`](./docs/lessons/font-render-blocking.md)。
2. **不要拿掉或改順序** `package.json` `postbuild` 的串接：`subset-fonts.mjs` → `optimize-home-images.mjs` → `optimize-article-images.mjs` → `inline-css.mjs` → `pagefind`。這幾支是首頁與內頁效能達標的關鍵。
3. **效能驗收用第三方 PSI（Google 機房）對線上站**，不要用本機或 CI 的 Lighthouse（會抖、不準）。**操作方式、金鑰、量測陷阱、判讀準則、基準門檻全部在 [`PERFORMANCE.md`](./PERFORMANCE.md) §3–§4，本檔不重複。**
4. 內頁已套用 critical CSS 內聯（`inline-css.mjs`）＋封面縮 webp（`optimize-article-images.mjs`），與首頁同手法。動內頁效能前一樣先讀 `PERFORMANCE.md`。

## 設計規範（CI 硬性守門）

`scripts/check-design.mjs` 接在 `pnpm build` 最前面（`pnpm check:design` 可單獨跑），掃 `src/` 下所有 `.css`/`.astro`/`.svelte`，違規即 build fail、擋部署，CI `notify-failure` job 發 Slack 告警：

1. **font-size 禁 px**：一律 `var(--text-*)` 字級階梯（正文 ≥18px）。
2. **顏色只准寫在 `src/styles/variables.css`**（design token 單一來源，oklch＋hex fallback）；其他檔一律引用 `var(--*)`。
3. **禁 `!important`**。
4. **禁外部 CDN**（fonts.googleapis / cdnjs / unpkg / jsdelivr）；字型自託管 @fontsource（仍須遵守效能鐵則的繁中子集進入點）。
5. **css 檔白名單**：`src/` 的 `.css` 只准 `src/styles/{variables,global}.css`，新增 css 檔即 fail；元件樣式寫 scoped `<style>` 或進 `global.css`。

**遷移期凍結（禁再擴充）**：少數既有檔僅豁免「顏色」規則。**清單以 `scripts/check-design.mjs` 的 `LEGACY_COLOR_FILES` 為準**（查法見 §查現況），**新檔案一律不得加入，清一檔移一檔**。

⚠️ **`check-design.mjs` 不驗色彩對比**。它只管「顏色有沒有寫在 token 裡」，不管那個顏色好不好讀。對比要靠 PSI 的 accessibility 項，而那是軟性指標、不擋 build，**要主動去看**。為什麼＝[`docs/lessons/accent-color-contrast.md`](./docs/lessons/accent-color-contrast.md)。

## 部署機制

- 部署設定在 `.github/workflows/deploy.yml`。🔴 **push 不會觸發部署**（2026-08-06 起）——只有**每 15 分鐘的排程**與**手動 `workflow_dispatch`**會。
  - 為什麼拿掉 push 觸發：各產線「一篇一 commit 一 push」加上人工推送，一天疊到 200 次部署，之後連續六次卡在 `deployment_queued` 逾時（站台僅佔 1 GB 上限的三分之一，不是體積問題），研判被節流。收斂成 4 次/小時，替 `workflow_dispatch` 留餘裕。
  - **排程跑起來會先判斷「有沒有變動」**（`check` job → `scripts/deploy-needed.mjs`），沒變動就幾秒結束、不 build 不上傳。判斷兩條件任一成立即部署：①上次成功部署後有新 commit ②有排程稿的 `publishDate` 落在（上次部署時間, 現在]。**第二條不可省**——排程稿是靠 build 當下時間轉正的，沒有新 commit 也需要重建。抓不到上次部署資訊一律 fail-open 照部署。
  - **急著上線就手動戳**：`gh workflow run deploy.yml`（手動觸發跳過上面的檢查，直接部署）。GitHub 排程常誤點，等排程實際可能 20–30 分鐘。為什麼這樣改＝[`docs/lessons/deploy-cadence.md`](./docs/lessons/deploy-cadence.md)。
- `status: scheduled` 且 `publishDate` 在未來的文章**不進列表／sitemap／RSS／llms**（由 `getPublishedArticles()` 過濾），到時間後由每 15 分鐘的排程重建自動上線（該排程會偵測到有排程稿到期而觸發 build）。
  - 但會在 `/articles/<slug>/` 產出一個 **noindex、不被任何站內連結指到**的「排程草稿預覽頁」（`getScheduledPreviewArticles()` + `[slug].astro` getStaticPaths），供作者**站內預覽＋編輯**（登入 `/admin` 後右下角「編輯」鈕）。sitemap 由 `astro.config.mjs` 的 `previewPaths` 排除；tag 在預覽頁渲染為純文字（避免連到未產出的 tag 頁擋 `check:links`）。到 `publishDate` 後同一 URL 自動轉正。
  - **排程稿不會自己在非整點上線**：`isPublic()` 比對的是 build 當下時間，15 分鐘排程對不準任意時刻。要準點上線必須另排一支 cron 戳 `workflow_dispatch`。
- **待審草稿**（`kind: factual`）＝ `status: scheduled` + 遠未來日，只建 noindex 預覽頁，人工核可才轉正（`scripts/newsroom-publish.mjs`）。

## 上線流程與紅線

- 上線前自檢：`pnpm build && pnpm check:links`（**站內壞連結是硬性 gate，會擋部署**；Lighthouse 是軟性、僅參考）。
- 驗收以**部署後的線上站**為準，不是本機 `pnpm preview`；上線後用 PSI 檢查（見 `PERFORMANCE.md` §3）。
- **改動的終點是「已發佈上線」，不是「分支就緒」**：一律走完整條——開分支 → `pnpm build && pnpm check:links` 綠 → merge 進 `main` → `git push origin main` → **`gh workflow run deploy.yml`（push 不會自己觸發）** → 等發佈完 → 驗線上站 → **才回報**。**不要停下來問「要不要 push／開 PR」**（把自家網站內容 push＋發佈＝早已授權的既定流程）。
- **只有這幾類才先問一句**（其餘一律直接做到發佈）：
  1. 不可逆的資料／內容刪除或覆寫（刪非自建產物、drop DB）
  2. 向真實外部第三方主動送出（寄信給客戶、公開社群發文）
  3. DNS／基礎設施／金鑰變更
  4. `force-push`／改寫歷史／刪遠端分支
  5. 全新且沒討論過的產品方向
- **在 `main`（預設分支）上要 commit，先開分支**（但別停在分支——照上面走到發佈）。
- `~/.claude/settings.json` 有 deny 規則擋 `git branch -D`、`git push --force`；刪已合併分支改用「先刪遠端 → `git fetch --prune` → 小寫 `git branch -d`」。

## 內容規範（寫作時遵守）

- **全文繁體中文 + 台灣用語**（軟體／程式／網路／演算法／人工智慧…），禁中國用語（軟件／程序／網絡／算法／人工智能…）。標題、正文、frontmatter 皆適用。
- **去 AI 腔**：禁破折號（`—`／`--`）、禁 AI 套語（「不僅…更…」「值得注意的是」「總而言之」自問自答等）、禁空泛升華與翻譯腔。完整守則見 `.claude/skills/newsroom/SKILL.md` 與 `persona.md`。
- **所有資料附 inline 來源超連結**，且**全文每條超連結逐條查證可連線**，不留死連結。
- 新文必填 `tags`（餵 keywords／RSS／llms 索引）；文章規格與欄位以 `src/content.config.ts` 為唯一準據。
- 日更走 `/newsroom` skill；作者人格與跨文記憶在 `.claude/skills/newsroom/persona.md`、`author-memory.json`。

## 內容 gate（工程面，與上一節分開看）

上一節是「寫作時要遵守什麼」，這一節是「機器怎麼擋」。四道 gate 都接在 `pnpm build`，也被各條產線在產文後 `spawnSync` 自檢：

| gate | 腳本 | 擋什麼 |
|---|---|---|
| 設計規範 | `scripts/check-design.mjs` | 見上方 §設計規範 |
| 去 AI 腔／內容 | `scripts/check-content.mjs`（`pnpm check:content`，`:all` 盤點存量） | 見下 |
| 標籤 | `scripts/check-tags.mjs` | 表外標籤 |
| 站內連結 | `scripts/check-links.mjs` | 壞連結 |

`check-content.mjs` 是**跨站統一引擎**：核心規則在 `.claude/skills/new-astro-site/templates/check-content.mjs`，appi 特化規則在本 repo 該檔檔頭的 `SITE_ERROR_TELLS`／`SITE_WARN_LAYERS`。

- **兩級判定**：ERROR（單一命中即 exit 1 擋 build）；WARN（軟訊號分詞彙／句式／結構／語氣四層，**單檔跨 ≥3 層才升 ERROR**）。
- **grandfather**：預設只掃「相對 `origin/main` 的變動檔」中的 `src/**/*.md(x)`，存量不受硬 gate 約束；抓不到 git base（CI 淺 checkout）→ 掃 0 檔 exit 0，永不誤擋。
- **維護分工**：跨站規則改核心模板（一處全站生效，改完同步各站）；appi 專屬只改本 repo 檔頭 SITE 區塊，**別動核心**。新增硬 tell 只加零誤判的，語氣類留 WARN。
- **核心比舊 appi gate 嚴，對 cron 新產文有過嚴風險**：若某幾條開始頻繁擋掉合理新聞稿，處置順序＝①先在 newsroom persona／SKILL 教模型避開（首選）②SITE 擴充點只能「加嚴」或用 `ALLOW` 整行白名單，**無法**把核心 ERROR 降級為 WARN；真要放寬得改核心模板（影響全站）。命中統計與脈絡＝[`docs/lessons/ai-tone-gate.md`](./docs/lessons/ai-tone-gate.md)。

## 帳號與模型政策（自動化必讀）

**單一帳號：`claude-appi`（`CLAUDE_CONFIG_DIR=~/.claude-appi`）。** 互動開發、commit、改 crontab、cron／自動產文全走同一個帳號。兩個推論：

- **用量池共用**：互動開發花掉的額度會直接吃到自動產線配額。撞週限時 cron 會整批空跑（且 exit 0 靜默），所以大批量互動作業前先想一下當日還有沒有產線要跑。
- **憑證是單點**：`~/.claude-appi/.credentials.json` 失效＝互動與自動化一起啞掉。無備份，只能 `CLAUDE_CONFIG_DIR=/root/.claude-appi claude` → `/login` 重新登入。

**模型**：所有 `claude-appi` 呼叫**一律明確帶 `--model`**——產文／選題／週報用 `claude-sonnet-5`、查核類 gate 用 `haiku`。全域預設是 Opus，**不帶 `--model` 就會默默吃 Opus 燒爆週額度**（出過事＝[`docs/lessons/automation-model-and-account-split.md`](./docs/lessons/automation-model-and-account-split.md)）。

**判斷自動化成功不能只看 exit code**：`claude-appi` 撞用量上限／拒答會 **exit 0** 只印 stdout；`.sh` 要用失敗 regex（含 `weekly limit`）、`.mjs` 要掃 stdout。

**額度視窗**：`claude-appi` 的 session 額度是**每 5 小時一個共用視窗**，日更線刻意攤開排程。**新增會喚 Claude 的高頻 cron 前，先想「這一輪一定要喚模型嗎」**——能用純資料判斷的先做完（見論壇雷達與颱風線的前置 gate 作法）。排程現況查法見 §查現況。

> 完整不可違反規則見 [`docs/automation-invariants.md`](./docs/automation-invariants.md)；排程／模型總表見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) §cron 總表。

## 自動發文 pipeline

各產線**各有各的萃取邏輯與來源**（GSC 訊號、GDELT、政府開放資料、各地警局、YouTube RSS、年曆表、PTT…），**不是同一套雷達**。本段只給元件對照，排程與 Slack 行為見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md)。

最早也最典型的一條（人挑題）長這樣：

```
選題雷達（cron）→ 發候選題到 Slack（帶「我要寫這題」按鈕）
  → 作者點按鈕 → slack-actions-server 收事件 → 觸發 newsroom-write.mjs
  → 起草＋逐段配圖＋連結逐條查證 →（配圖硬性 gate）→ commit → 排程／上線
```

### 選題來源

| 元件 | 路徑 | 角色 |
|---|---|---|
| 科技選題雷達 | `.claude/skills/tech-radar/`、`scripts/cron/tech-radar.sh` | 只產 tech 候選，主訊號是 GSC 站內搜尋需求；以「可贏性」而非熱度選題 |
| 論壇選題雷達 | `scripts/lib/forum-signals.mjs`（純資料）＋`scripts/forum-radar.mjs`＋`scripts/cron/forum-radar.sh` | 掃 PTT 白名單看板 → 選題 → **自動撰寫並上架**（站長裁示，同國際／警消／便民，不設每日上限）→ 回報各分類台。**抓取／政治過濾／去重全是純 node，沒有新熱題就 exit 0、完全不喚 Claude**。改看板或門檻＝改 `BOARDS`。**政治排除三層**（看板白名單／標題關鍵字／LLM 判斷），第三層不可省。**配圖禁 OpenAI 生圖**（`NO_AI_IMAGE=1`，`.sh` 與 `writeAndPublish` 雙重保險）。為什麼＝[`docs/lessons/forum-signals-radar.md`](./docs/lessons/forum-signals-radar.md) |
| 去重帳本 | `scripts/topic-ledger.mjs` | 雷達與週報共用，避免撞題 |
| 國際寫作前閘門 | `scripts/lib/international-gate.mjs` | 同批同事件去重 → 跨日 seen 帳本 → 一次 Haiku 批次篩選，砍掉注定被判 SKIP 的題才動用寫作。**壞掉一律 fail-open**。為什麼＝[`docs/lessons/auto-publish-pipeline-traps.md`](./docs/lessons/auto-publish-pipeline-traps.md) §G |

### 產文引擎

| 元件 | 路徑 | 角色 |
|---|---|---|
| 起草引擎 | `.claude/skills/newsroom/` | 文風、人格、跨文記憶；`/newsroom` 互動寫作也走它 |
| 自動產文 | `scripts/newsroom-write.mjs` | headless 起草＋逐篇 gate，完成寫 `result.json`。`--go` 發佈／`--stage` 只 commit／`--write-only` 只寫檔（給平行批次用，build 交外層做一次） |
| Slack server | `scripts/slack-actions-server.mjs`、pm2 `appinews-slack-actions` | 收按鈕事件觸發產文；也收 GitHub webhook。**事實稿候選（含 health／finance）也掛按鈕**：kind=factual 時 modal 看法改選填、`validateJob` 與 `newsroom-write` 皆帶 `--allow-any-category`，產**待審草稿**而非直接上線（放寬的是「誰能開單」不是「誰能上線」） |
| /admin 寫作任務消費端 | `scripts/article-write.mjs`＋`scripts/lib/article-issue.mjs` | `/admin` 開的 `article-draft` issue → 走 newsroom 正規產線寫成待審草稿 → 開 PR。為什麼＝[`docs/lessons/article-draft-consumer.md`](./docs/lessons/article-draft-consumer.md) |
| 發佈隔離 checkout | `/root/appi.news-publisher`（`PUBLISH_ISOLATED=1`） | 自動產文在此跑，每篇 reset 到 `origin/main`；dev 目錄未提交改動不受影響 |

### 各分類自動線

| 線 | 路徑 | 驅動方式 |
|---|---|---|
| 科技台 | `scripts/tech-desk.mjs`＋`scripts/lib/tech-desk.mjs` | GSC 訊號選題。兩條 track：`editorial`（編輯部事實型概念解釋）／`lightman`（AI 醫療現場觀點）；cron **每天只跑一條、日期奇偶輪替**（避免單日雙倍吃額度）。為什麼＝[`docs/lessons/query-targeting-event-vs-concept.md`](./docs/lessons/query-targeting-event-vs-concept.md) |
| 健康紀念日 | `scripts/lib/health-days.mjs`＋`scripts/health-days.mjs`＋`scripts/cron/health-days{,-publish}.sh` | **日期驅動**（年曆表）。T-2 寫成排程稿，當天由**另一支純 shell cron** 戳 `workflow_dispatch` 才真正上線；**兩支 cron 不可合併**。配圖依站長指定一律 OpenAI 生圖。為什麼＝[`docs/lessons/annual-observance-scheduling.md`](./docs/lessons/annual-observance-scheduling.md) |
| 急性症狀衛教 | `scripts/lib/acute-care.mjs`＋`scripts/acute-care.mjs`＋`scripts/acute-care-batch.sh`＋`scripts/acute-care-audit.mjs` | **清單驅動、非 cron**。要開題就往 `TOPICS` 加再跑 batch。醫療界線寫在 `BOUNDARY` 常數、原文進 prompt，要收緊改一處。合規用 `acute-care-audit.mjs` 機械驗，不靠人抽驗。為什麼＝[`docs/lessons/acute-care-line-traps.md`](./docs/lessons/acute-care-line-traps.md) |
| 國際／生活各線 | `scripts/international-*.mjs`、`scripts/lifestyle-*.mjs`、`.claude/skills/lifestyle-*/` | 各自綁定資料源（GDELT、政府 RSS、警局、YouTube RSS、人事行政總處、假日曆）。逐線說明見 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) |

### 鐵則（完整 checklist 見 [`docs/automation-invariants.md`](./docs/automation-invariants.md)）

- **配圖 gate 不可繞過**：缺 `coverImage`／封面檔不存在／內文 0 圖／封面與內文圖重複 → 中止不發，改動留工作區待補。
- **禁用 AI 生圖時用 `NO_AI_IMAGE=1`**（機械保證，prompt 講不算數）。禁生圖後封面與內文容易撞成同一張圖庫照，取圖 query 必須錯開。為什麼＝[`docs/lessons/no-ai-image-batch.md`](./docs/lessons/no-ai-image-batch.md)。
- **改發佈端程式或 cron `.sh`**：push → `/root/appi.news-publisher` `git pull` → `pm2 restart appinews-slack-actions`；**只 push 不 pull／只 restart 都會跑到舊碼**。
- **故障 ≠ 編輯判斷**：模型漏印結果行是 infra 故障，不可記進去重帳本、不可當終止條件。
- 其餘（UTC 換算、各自 worktree 並行不用 flock、成功≠exit code、publishDate 用系統時間蓋…）見正本 checklist。

## 數據與網路曝光量

**讀數據前先看這裡；操作（怎麼跑、金鑰怎麼擺）在 [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) 與 weekly-report skill。實際數值一律跑指令查（見 §查現況），不寫在文件裡。**

| 元件 | 路徑 | 說明 |
|---|---|---|
| 站上埋點 | `src/components/seo/Analytics.astro`、`SITE.gaId`（`src/config/site.ts`） | GA4 gtag，`requestIdleCallback` 延遲載入以保 TBT=0 |
| 數據抓取 | `scripts/weekly-data.mjs`、`scripts/lib/google-data.mjs` | 自簽 JWT 讀 GA4＋GSC，輸出四區塊 JSON |
| 週報技能 | `.claude/skills/weekly-report/SKILL.md`、`scripts/cron/weekly-report.sh` | 數據 → 熱題雷達 → 建議方向 → 發 Slack |
| 設定常數 | `scripts/lib/report-config.mjs` | GA4 property、GSC 站台、Slack 一分類一頻道（`CATEGORY_CHANNELS`）、預設頻道、dev 頻道 |
| 機密金鑰 | `~/.config/appi-news/` | **永不進 repo**；server 端設定見 `docs/SERVER_HANDOFF.md` |

**注意**：

- **GA4 與 GSC 是兩把不同的服務帳號金鑰**（GSC 用 appi 專屬專案那把，GA4 用共用那把）。細節見 `scripts/lib/report-config.mjs` 檔頭。
- 週報「AI 轉介點擊」＝真人從 AI 答案點連結進站，**不等於**被 AI 爬蟲抓取／引用（GA 是 client-side JS，爬蟲不跑 JS）。真 AEO 量測需另案。
- **禁杜撰數據**：報告曝光／流量一律以 `weekly-data.mjs` 實跑輸出為準，不可憑記憶或估算。

## 真實來源指標（要改什麼，先看哪裡）

| 要動的東西 | 唯一事實來源 |
|---|---|
| 文章／作者／專欄／專題 schema、enum | `src/content.config.ts` |
| 分類／子分類 | `src/config/categories.ts` |
| 標籤（受控詞彙表） | `src/config/tags.ts`（gate＝`scripts/check-tags.mjs`） |
| 專業審閱者（分類 → 誰審） | `src/config/reviewers.ts`（文章 frontmatter 優先、沒填退回本表，所以**新增分類要同步補一列**）。為什麼＝[`docs/lessons/provenance-disclosure.md`](./docs/lessons/provenance-disclosure.md) |
| 站名／品牌／OG 預設／GA4 評估 ID | `src/config/site.ts` |
| 網址／base／換網域 | `src/utils/url.ts` + `astro.config.mjs` |
| 設計 token（顏色、字級） | `src/styles/variables.css` |
| 效能規則與基準 | `PERFORMANCE.md` |
| 新增內容步驟、架構說明 | `README.md` |
| WordPress 遷移 | `MIGRATION_NOTES.md` |
| 為什麼這樣做（踩過的坑、重大決策） | [`docs/lessons/`](./docs/lessons/) |
| 日更流程與作者人格 | `.claude/skills/newsroom/` |
| 自動化鐵則（帳號／模型／cron／發佈端） | [`docs/automation-invariants.md`](./docs/automation-invariants.md) |
| 排程總表、各線來源與 Slack 行為 | [`docs/SERVER_HANDOFF.md`](./docs/SERVER_HANDOFF.md) |
| 數據／網路曝光量 | `scripts/weekly-data.mjs`＋`.claude/skills/weekly-report/`＋`scripts/lib/report-config.mjs` |
| 機密金鑰位置 | `.env`（PSI）、`~/.config/appi-news/`（GA4／GSC／Slack）— 永不進 repo |
