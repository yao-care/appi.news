# APPI News 147 篇選題與產文設計（統一規格）

- 日期：2026-06-14
- 目標：為 7 個分類各準備 21 篇文章，共 147 篇，每篇結構、深度、文風一致。
- 核心原則：先訂死一套「統一文章規格」當單一事實來源，所有文章照同一套骨架產出，避免每篇長相不一。

## 1. 範圍與分配

7 個分類，每類 21 篇。每類的時間分配（指「事件本身的新鮮度」，非發佈日期）：

- 近 3 個月：8 篇
- 近半年：7 篇
- 近一年：6 篇

合計每類 21 篇、全站 147 篇。**147 題不得重複**（同一事件不可跨類或同類重複出現）。

### 1.1 分類映射

使用者口語分類對應到站上 `src/config/categories.ts` 的 category slug：

| 使用者分類 | category slug | 預設 subcategory 取向 |
|---|---|---|
| 焦點 | `focus` | `trends` / `analysis`（ESG、環保、能源轉型、供應鏈韌性、韌性台灣） |
| 國際 | `society` | `international`（去政治：國際科技 / 氣候 / 商業 / 科學 / 運動 / 文化） |
| 健康 | `health` | `medical` / `preventive` / `nutrition` / `medtech` / `tcm` / `health-policy` |
| 科技 | `tech` | `ai` / `security` / `startup` / `software` / `industry-tech` / `digital-tools` |
| 財經 | `finance` | `industry` / `investing` / `fintech` / `market` / `business-model` / `management` |
| 運動 | `sports` | `events` / `sports-science` / `sports-industry` / `training` / `sports-health` |
| 生活 | `lifestyle` | `education` / `workplace` / `consumer` / `family` / `culture` / `life-tech` |

「國際」這桶一律 `category: society` + `subcategory: international`。

### 1.2 時間桶定義（今天 2026-06-14，三段相接不重疊）

- 近 3 個月｜8 篇：事件日期落在 **2026-03-15 ～ 2026-06-14**
- 近半年｜7 篇：事件日期落在 **2025-12-15 ～ 2026-03-14**
- 近一年｜6 篇：事件日期落在 **2025-06-15 ～ 2025-12-14**

判定依據是「事件實際發生（或主要熱度）的日期」，由 tavily 查證得到的來源日期決定。落不進對應桶的題目換掉。

## 2. 選題篩選鐵則

1. **真實查證**：每題對應 1 個真實、有明確日期的事件，附權威來源 URL。禁止憑記憶杜撰（撰寫者知識截止 2026-01，近期題目必須上網查）。
2. **完全避開政治**：不碰選舉、政黨、地緣政治、戰爭、政治人物口水。國際與焦點改走 ESG／環保／能源／供應鏈韌性／韌性台灣／科技／科學／運動／文化。
3. **台灣為主、亞太視角**：以台灣讀者關心的事件為核心，輔以亞太區域觀點。
4. **全域去重**：147 題以事件為單位去重；近義題目合併。

## 3. 統一文章規格 v1（每篇都套用）

### 3.1 固定骨架

1. **標題**：陳述句、含具體主體與重點，22–34 中文字。不用問句、不用破折號。
2. **導言**：2–3 句，點出事件＋why-now，必含 1 個具體數字或日期。
3. **highlights**：固定 **4 條**，每條一句可獨立理解（AEO 友善），存入 frontmatter `highlights`。
4. **主體：固定 3 個 H2 小節**，每節一個小標 + 2–3 段，每段 3–5 句：
   - 小節①「發生什麼」：事件 / 數據，body 內含權威來源超連結。
   - 小節②「為什麼重要」：台灣或亞太脈絡。
   - 小節③「影響與接下來看什麼」：有立場的觀點。
5. **結尾**：1 段收束，給讀者一個帶得走的判斷。不喊口號、不硬拔高。
6. **字數**：1200–1600 中文字（不含 frontmatter）。

### 3.2 來源與查證（每篇相同門檻）

- 每篇 **至少 3 個權威外連**（政府 / 學術 / 一手新聞 / 官方），以 tavily 驗證可達且內容與敘述相符。
- 外連同時：① 在 body 內以超連結出現（至少 2 處）② 完整登記到 frontmatter `references`（`title` / `url` / `publisher`）。
- 來源日期需支持該題的時間桶歸屬。

### 3.3 文風（去 AI 腔，硬規則，逐篇複查）

- 禁：破折號（`—` `--` `──`）、AI 套語（「不僅…更…」「不只是…而是…」「值得注意的是」「事實上」「總而言之」「那麼…呢？」）、buzzword（賦能、解鎖、釋放潛力、顆粒度、閉環）、過度正向無立場、空泛升華、翻譯腔。
- 要：有立場、具體數字與例子、句長有變化、台灣口語語感。
- 依據 [[writing-style-no-ai-tells]] 記憶與 newsroom persona。

### 3.4 配圖（每篇相同）

- 1 張 AI 封面：套台灣人鐵律、`no text`、≤1280 寬 WebP，存 `public/covers/<slug>.webp`。
- `coverImage` / `coverAlt` 必填；**不做逐段配圖**（控制量產時間與生圖成本，日後可挑重點補）。

### 3.5 frontmatter（固定欄位與固定值）

| 欄位 | 值 |
|---|---|
| `title` | 見 3.1 |
| `slug` | `post-NNN`（接續現有最大編號遞增，避免中文 slug 截斷） |
| `description` / `excerpt` | 同字串，60–90 中文字摘要 |
| `publishDate` | 即時（產出當下時間，台北時區） |
| `category` / `subcategory` | 依 1.1 映射 |
| `tags` | 4–6 個繁中標籤 |
| `highlights` | 固定 4 條 |
| `references` | ≥3 筆（title/url/publisher） |
| `author` | `appi-editorial` |
| `status` | `published` |
| `sourceType` | `editorial`（現行 schema 已移除 `ai-assisted`，見 commit b7ba8dc「去除 AI 主定位」；APPI 編輯部署名一律 editorial） |
| `disclaimerType` | `general`；健康醫療題用 `medical`，財經投資題用 `financial` |
| `coverImage` / `coverAlt` | 必填 |

健康類醫療題另填 `risksAndLimits`（風險與限制條列）。

### 3.6 一致性機制（防止「一下這樣一下那樣」）

每篇產出後逐項勾核同一份**規格檢查表**，全過才算完成；任一項不符退回重寫：

- [ ] 標題 22–34 字、陳述句、無破折號
- [ ] 導言含數字或日期、點出 why-now
- [ ] highlights 恰 4 條，可獨立理解
- [ ] 主體恰 3 個 H2 小節，順序①②③
- [ ] body 內 ≥2 處權威超連結；`references` ≥3 筆且 tavily 可達
- [ ] 字數 1200–1600
- [ ] 文風複查通過（去 AI 腔關鍵詞掃描）
- [ ] 事件日期落在指定時間桶
- [ ] 無政治內容
- [ ] frontmatter 欄位齊全且值正確（category/subcategory/author/status/sourceType/disclaimerType）
- [ ] 封面已生成、coverImage/coverAlt 正確
- [ ] 健康醫療題已掛 medical disclaimer + risksAndLimits

## 4. 流程與檢查點

1. **選題（Phase A）**：tavily 查證，產出 147 題 worklist（每題：分類｜時間桶｜暫定標題｜切入角度｜why-now｜來源 URL｜subcategory），全域去重，交使用者過目。
2. **放行／微調**：使用者確認題目與分配。
3. **逐類產文（Phase B）**：一個分類 21 篇一批，每篇照規格 v1 並過 3.6 檢查表。**第一類寫完先請使用者驗品質**，OK 再續其餘六類。
4. **每批驗收**：`pnpm build && pnpm check:links` 必過（壞連結是硬性 gate）。
5. **發佈**：即時 publishDate，push 觸發部署，於線上站確認。

## 5. 不做的事（YAGNI）

- 不做逐段配圖。
- 不為這批改動字型 / 首頁 CSS / build 流程（遵守 PERFORMANCE.md）。
- 不掛真實具名作者（統一 `appi-editorial`）。
- 不做排程往後鋪（即時發佈）。

## 6. 風險與備註

- **量大**：147 篇是多批次、跨多個工作階段的工程；以分類為批次、設檢查點，避免一次崩盤。
- **生圖成本**：147 張封面用 OpenAI gpt-image-2，分批產，沿用 `scripts/gen-image.mjs` / `scripts/lib/ai-image.mjs`。
- **效能**：新增文章不應動到首頁效能基準（desktop 100 / mobile 90+）；只新增內容檔與封面，不碰全站樣式。
- 相關：[[appi-news-project]]、[[newsroom-daily-engine]]、[[writing-style-no-ai-tells]]、AEO spec `docs/superpowers/specs/2026-06-14-appi-aeo-design.md`。
