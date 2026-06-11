# AI 圖片選擇器（ImagePicker）設計

日期：2026-06-11
狀態：已通過 brainstorming，待實作

## 問題

`/admin` 編輯器更換圖片不順暢，痛點：

1. **換封面圖**：`coverImage` 不在核心表單，要展開「進階欄位（YAML）」手打路徑，沒預覽、沒上傳、沒得從現有圖選。
2. **換內文圖**：要手動刪掉舊 markdown 再重插。
3. **找不到現有圖**：`public/covers`（101 張）、`public/images`（163 張）看不到有哪些可選。
4. **隱形痛點**：每上傳一張圖 = 一個 commit + 一次 build，改完要等部署才看得到。

使用者的圖片來源：上傳新圖、重用既有圖、**AI 生成/挑圖**（頭號需求）。

## 目標

把三種圖片來源（AI 生成、AI 找圖庫、上傳/既有）整合進一個共用的 `ImagePicker` 元件，封面與內文共用；其中 **AI 生圖為第一優先**。

## 架構限制（不可繞過）

- 靜態站 + 瀏覽器後台直接打 GitHub API commit，無一般後端（worker 只管 OAuth/AI）。
- 每次 commit = 一次 build → 線上更新本質上有數分鐘延遲。解法不是讓部署變快，而是**編輯器當場用記憶體裡的圖預覽**。
- 所有需要 API key 的動作（生圖、圖庫搜尋、Claude）都必須在 worker 端，key 不可進瀏覽器、不可進公開 repo。

## 組件

### 1. AI Worker（擴充 `workers/ai-suggest/`）

沿用既有 gating：驗證 Bearer GitHub token 對 repo 有 push 權（`workers/ai-suggest/src/index.ts:34-38`），非管理者一律拒絕。新增端點：

- `POST /ai/generate` — `{ prompt, model: 'openai'|'flux', size }` → 回傳 `{ b64 }`。worker 內以「模型轉接器」分派：
  - `openai`：`POST https://api.openai.com/v1/images/generations`，model `gpt-image-1`，回 b64_json。
  - `flux`：經 **fal**（同步）跑 Flux，輸出統一轉成 b64 回傳。
  - 可重複呼叫 = re-roll。
- `POST /ai/keywords` — Claude(Haiku) 讀標題+描述 → 回傳**英文**搜圖關鍵字（圖庫英文索引）。
- `POST /ai/stock` — `{ keywords, exclude: string[] }` → 搜 unsplash + pexels，**濾掉 exclude 清單裡已用過的 photo ID**，回傳候選（含攝影師署名）。
- `POST /ai/alt` — 依文章脈絡 + (prompt / 圖庫描述) 生一句**繁中 alt**。

Secrets（`wrangler secret put`，來源 `~/.config/appi-news/ai-worker.secrets`）：
`OPENAI_API_KEY`、`FAL_KEY`、`ANTHROPIC_API_KEY`、`UNSPLASH_ACCESS_KEY`、`PEXELS_API_KEY`。
缺 `FAL_KEY` 時 Flux 選項自動隱藏，不影響 OpenAI。

### 2. `ImagePicker` Svelte 元件

Modal，分頁：
- **AI 生成**（主角）：prompt 預填（呼叫 `/ai/keywords` 或專用 prompt 建議）+ 模型下拉（OpenAI / Flux）+ 尺寸（封面橫式預設）+「生成」/「再畫一張」。re-roll 候選**累加成一排縮圖**比較。生成的圖只在記憶體預覽，**不即時 commit**。
- **AI 找圖庫**：一鍵「依本文找圖」→ 顯示去重後候選 → 點選。關鍵字可改可重搜。
- **上傳**：拖放/選檔，當場 local 預覽。
- **圖庫**：手動瀏覽既有 repo 圖（Phase 3）。

統一出口回傳：`{ source: 'generated'|'stock'|'uploaded', pathOrUrl, credit?, alt? }`。

### 3. 已用圖 manifest（建置期）

新腳本 `scripts/used-images.mjs`：掃所有 `src/content/articles/*.md` 的 `coverImage` + 內文 `<img>`，抽出屬於 unsplash/pexels 的 **photo ID**，輸出 `public/admin/used-images.json`。每次 build 重算。編輯器載入後，搜圖時連同「本階段剛挑過、尚未部署」的 ID 一起當 `exclude` 丟給 worker。

photo ID 解析：
- unsplash：`https://images.unsplash.com/photo-<id>?...` → `photo-<id>`
- pexels：`https://images.pexels.com/photos/<id>/...` → `<id>`

### 4. 封面 widget + schema 改動

核心表單新增「封面圖」欄位：目前封面縮圖 + 「選擇封面」（開 ImagePicker）+ `coverAlt` + `coverImageCredit`（圖庫圖自動帶攝影師、可改）+「移除」。

schema 改動三處：`src/content.config.ts`（articles 加 `coverImageCredit`）、`src/utils/editor/article-schema.ts`（編輯器鏡像）、文章頁封面渲染（署名小字）。

### 5. 落地：來源 → 封面/內文

| 來源 | coverImage 存什麼 | commit 圖檔 |
|---|---|---|
| 上傳 / AI 生成 | `/covers/<檔名>` 或 `/images/<檔名>` | 要 |
| AI 圖庫 | unsplash/pexels **絕對 URL**（沿用既有政策，不下載） | 不用 |

圖庫圖在內文以 `<figure>` + `<figcaption>` 署名插入。

### 6. 單一 commit 存檔（Git Data API）

上傳/生成的圖不即時 PUT，先當「待提交 blob」掛記憶體。存文章時用 Git Data API（blob → tree → commit → update ref）把**圖檔 + frontmatter 一次 commit**。re-roll 丟掉的圖永不進 repo。內文圖比照（插入時先用暫存 blob URL 預覽，存檔時換正式路徑一起 commit）。

## 花費護欄

- 所有 AI 端點強制管理者登入（沿用 push 權驗證），外人不能消耗額度。
- 生圖分頁顯示「本次已生成 N 張」，單次工作階段超過 10 張跳確認。
- keywords/alt 用 Haiku（便宜）；圖庫搜尋免費；**只有生圖真花錢**。
- OPENAI/ANTHROPIC key 曾以明文貼於對話 → 上線後 rotate。

## 測試策略

- **單元（vitest）**：photo ID 解析、去重過濾、URL 辨識、Git Data API payload 組裝、各模型 adapter 請求組裝（mock fetch）。
- **Worker**：mock 供應商 fetch，驗證非管理者被擋、各 adapter 請求正確、錯誤處理。
- **元件**：分頁渲染、生成（mock）、re-roll 累加、選定回傳物件。
- **整合冒煙（playwright）**：/admin → EditButton → EditorPanel → ImagePicker，token gating。
- **人工驗收（需真 key + 登入）**：真生一張圖、設封面、存檔 → 單一 commit → 部署 → 線上看到。

## 分階段交付

- **Phase 1 — 地基 + AI 生成（OpenAI 優先，對應目標）**
  worker `/ai/generate`（OpenAI，Flux 同步加）+ gating；ImagePicker「AI 生成」分頁；封面 widget + `coverImageCredit`/`coverAlt` + schema；單一 commit 存檔；當場預覽。
  → 成果：能 AI 生封面、re-roll、選、單 commit 存檔、線上看到。

- **Phase 2 — AI 找圖庫 + 去重**
  `/ai/keywords` + `/ai/stock`；`used-images.mjs` + 去重；攝影師署名；AI 建議 alt；「AI 找圖庫」分頁。

- **Phase 3 — 內文圖 + 手動圖庫**
  內文編輯器改用 ImagePicker（插入 + 點了就替換）；「上傳」+ 手動「圖庫」分頁；內文圖併入單一 commit。

## 部署設定

- 重建 worker（例 `appi-news-ai.lightman-chang.workers.dev`），設 `ALLOWED_ORIGIN`（CORS）、`GITHUB_OWNER`/`GITHUB_REPO`。
- 編輯器填入 worker URL（取代現有 placeholder）。
- `scripts/used-images.mjs` 串進 `deploy.yml`（Phase 2）。
- 換網域時改 worker 的 `ALLOWED_ORIGIN`。
