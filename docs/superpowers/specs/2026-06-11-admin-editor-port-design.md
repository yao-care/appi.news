# 設計文件：移植 `/admin` 編輯器到 appi.news

- 日期：2026-06-11
- 來源：`/Users/lightman/weiqi.kids/evidencetoday.news` 的 `/admin` 編輯器
- 目標：`/Users/lightman/yao.care/appi.news`
- 狀態：設計待核可（尚未動工）

---

## 1. 目標與範圍

把 evidencetoday.news 已上線、已驗證的 `/admin` 編輯器**完整體驗**搬到 appi.news：

- 登入後在文章頁右下角浮出「編輯」鈕 → 開啟 WYSIWYG 編輯器 → 改完直接 commit 回 GitHub → GitHub Actions 自動重建上線。
- 含：編輯既有文章、新增文章（含 AI 工單）、圖片上傳、選取文字的即時 AI 潤飾/摘要/改寫。
- **全欄位可編輯**（appi.news 文章 schema 的所有 frontmatter 欄位）。

### 不在範圍

- 不改 appi.news 既有前台版型、配色、內容。
- 不做帳號/quota/付款系統（第二階段，僅 schema 與 TODO）。
- AI「代寫整篇」**不自動化**：與 evidencetoday 一致，NewArticle 只建立 GitHub Issue 工單，實際寫作由人工開 Claude Code 對著工單完成。

---

## 2. 架構總覽

編輯器是**純前端 Svelte 元件 + GitHub Contents API 直接 commit + Cloudflare Worker 做 OAuth/AI**。無資料庫、無 SSR；Astro 維持 `output: 'static'`。

```
瀏覽器（Svelte islands：AdminLogin / EditButton / EditorPanel / BodyEditor / NewArticle / SeoFields）
   │
   ├─ 登入：→ Worker(github-oauth) ⇄ GitHub OAuth App → 拿 token 存 sessionStorage
   │
   ├─ 讀寫文章：→ GitHub Contents API（getFile / putFile）對 yao-care/appi.news
   │              路徑 src/content/articles/<slug>.md、圖片 public/images/<file>
   │
   ├─ 新增工單：→ GitHub Issues API（label: article-draft）
   │
   ├─ AI 潤飾：→ Worker(ai-suggest) ⇄ Anthropic API
   │
   └─ 存檔後輪詢：→ GitHub Actions API 追蹤部署狀態直到上線
```

---

## 3. 要移植的程式碼

### 3.1 Svelte 元件（`src/components/editor/`）

| 檔案 | 用途 | 掛載 |
|---|---|---|
| `AdminLogin.svelte` | GitHub OAuth 登入 UI；token 存 sessionStorage | `/admin` 頁 `client:only` |
| `EditButton.svelte` | 文章頁右下角浮動編輯鈕；有 token 才顯示；lazy-load EditorPanel | 文章頁 `client:idle` |
| `EditorPanel.svelte` | 主編輯面板：frontmatter 表單 + 內文 + 存檔 + 部署輪詢 | 由 EditButton 動態載入 |
| `NewArticle.svelte` | 新增文章表單 / 建立 AI 工單 | `/admin` 頁 `client:only` |
| `SeoFields.svelte` | 依 collection 的欄位描述渲染 frontmatter 欄位 | 內嵌於 EditorPanel |
| `BodyEditor.svelte` | TOAST UI WYSIWYG Markdown 編輯器 + 圖片上傳 hook | 內嵌於 EditorPanel |

### 3.2 工具函式（`src/utils/editor/`）

`github.ts`（Contents API）、`issue.ts`（Issues API）、`mdx-doc.ts`（js-yaml frontmatter parse/serialize，瀏覽器安全、通用、可直接重用）、`seo-schema.ts`（欄位描述）、`lint/`（編輯期檢查）、`image-upload.ts`、`token.ts`、`deploy-status.ts`、`save-machine.ts`、`slugify.ts`（pinyin-pro 中文轉 slug）。

### 3.3 頁面與掛載點

- 新增 `src/pages/admin.astro`（登入頁 + 文章快速連結 + NewArticle）。
- 文章頁掛 EditButton。evidencetoday 寫法：
  `<EditButton client:idle repoPath={`src/content/articles/${entry.id}`} collection="articles" slug={slug} />`
  appi.news 須確保 **repoPath 指向實際檔案 `src/content/articles/<slug>.md`**（注意副檔名，見 §4.3）。

### 3.4 Workers（`workers/`）

- `github-oauth/`：OAuth 中繼（`/auth`、`/callback`）。**必要**。
- `ai-suggest/`：選取文字 AI 潤飾/摘要/改寫（`/suggest`，呼叫 Anthropic）。

---

## 4. appi.news 特有的調整（移植的關鍵差異）

### 4.1 加入 Svelte 整合

appi.news 目前**沒有** Svelte。需：
- `pnpm add @astrojs/svelte svelte @toast-ui/editor js-yaml pinyin-pro`（pinyin-pro/toastui/js-yaml 為編輯器依賴）。
- `astro.config.mjs` 的 `integrations` 加 `svelte()`。
- sitemap filter 已排除 `/admin`（現況 `!page.includes('/admin')`），無需改。

### 4.2 換掉所有寫死的 evidencetoday 值

| 值 | evidencetoday | appi.news | 檔案 |
|---|---|---|---|
| OWNER | `weiqi-kids` | `yao-care` | `github.ts`、`issue.ts`、`image-upload.ts` |
| REPO | `evidencetoday.news` | `appi.news` | 同上 |
| OAuth worker URL | `evidencetoday-github-oauth.…workers.dev` | 新 worker URL | `AdminLogin.svelte` |
| AI worker URL | `evidencetoday-ai-suggest.…workers.dev` | 新 worker URL | `EditorPanel.svelte` |
| 站台 origin | `https://evidencetoday.news` | `https://yao-care.github.io`（見 §4.6） | worker `wrangler.toml` 的 `ALLOWED_ORIGIN` |
| sessionStorage key | `et_gh_token` / `et_oauth_state` | `appi_gh_token` / `appi_oauth_state`（改名避免與 evidencetoday 同機混淆） | `token.ts`、`AdminLogin.svelte` |

### 4.3 副檔名：`.md` 而非 `.mdx`

appi.news 文章全為 `.md`（132 篇）。github.ts 與 EditButton 的 repoPath 須產生 `.md` 路徑；新增文章預設也寫 `.md`。讀檔（getFile）以實際 repoPath 為準。

### 4.4 base path 感知

appi.news 掛在 GitHub 專案頁，`astro.config.mjs` 的 `BASE = '/appi.news'`、`trailingSlash: 'always'`。影響：

- `/admin` 實際路徑為 `/appi.news/admin/`。
- OAuth 成功後 worker 回跳的網址須是 `https://yao-care.github.io/appi.news/admin/#token=…&state=…`。
- 文章快速連結、EditButton 對應的前台網址都要帶 base（沿用 appi.news 既有 `asset()` / `BASE_URL` 慣例）。
- 編輯器送 GitHub API 的是 **repo 內檔案路徑**（不帶 base），與前台網址 base 無關，兩者勿混淆。

### 4.5 全欄位表單（混合式）

採**混合式**：常用欄位給 widget，長尾欄位用原始 YAML，存檔前一律以 Zod schema 驗證。

- **核心 widget 欄位**（擴充 `seo-schema.ts` 的描述）：`title`、`description`、`category`（enum 下拉，來源 `CATEGORY_SLUGS`）、`author`（下拉，來源 authors collection）、`tags`（chips）、`status`（enum 下拉）、`publishDate`、`featured` / `hero`（勾選）。
- **進階 YAML 區**：其餘 frontmatter 欄位（`references[]`、`highlights[]`、`risksAndLimits[]`、`coAuthors[]`、`topics[]`、`column`、`subcategory`、`coverImage`、`coverAlt`、`disclaimerType`、`sourceType`、`disclosure`、`expertNote`、`excerpt`、`updatedDate`、`legacyAuthor`、`legacyCategory`）以可折疊 YAML 文字區編輯。
- **存檔前驗證**：把「核心 widget 值 + 進階 YAML 解析結果」合併成完整 frontmatter 物件 → 用 `articles` 的 Zod schema（複用 `content.config.ts`）`safeParse` → 失敗則擋下存檔並標示錯誤欄位。`mdx-doc.serialize` 負責組回 `.md`。

### 4.6 網域時點

先**照現況** `https://yao-care.github.io/appi.news/` 設定（自訂網域 `appi.news` 仍卡在 DNS，屬 TODO）。換正式網域時只需改 3 處（會在交付時列成清單）：
1. worker `wrangler.toml` 的 `ALLOWED_ORIGIN`；
2. OAuth App 的 callback URL（若 worker 網域不變則不用）；
3. `AdminLogin.svelte` 回跳判斷的 origin（理想上讀 `import.meta.env.SITE`/`BASE_URL` 自動跟著變，實作時盡量做成自動）。

### 4.7 lint 規則對應

evidencetoday 的 lint 含站台特有規則（如 myths 的 references 數、phantom-image）。appi.news 移植時：
- 保留通用規則：`description-length`（對齊 appi.news description 慣例）、`phantom-image`（相對路徑圖片會讓 build 崩，appi.news 同樣適用）。
- 移除 evidencetoday 專屬規則（myths references 等 appi.news 無此 collection）。
- lint 為**非阻擋**提示（與來源一致），存檔的硬性 gate 是 §4.5 的 Zod 驗證。

---

## 5. 外部基礎設施（需使用者帳號，過程我帶著做）

| 項目 | 由誰 | 說明 |
|---|---|---|
| GitHub OAuth App（appi.news 專用） | 使用者點 GitHub 網頁 | callback URL 指向新 OAuth worker 的 `/callback`；scope `public_repo`；取得 Client ID 填入 wrangler.toml |
| Cloudflare Worker：github-oauth | 我寫程式，`npx wrangler deploy` | secret `GITHUB_CLIENT_SECRET` 由使用者 `wrangler secret put` 貼上 |
| Cloudflare Worker：ai-suggest | 我寫程式，`npx wrangler deploy` | secret `ANTHROPIC_API_KEY` 由使用者貼上；`ANTHROPIC_MODEL` 用現行 Claude 模型 |
| GitHub repo | 已存在 | `yao-care/appi.news`，分支 `main`，已有 `public/images/` |

`npx wrangler`（4.99.0）可用；wrangler 全域指令在沙箱 shell 不在 PATH，部署一律用 `npx wrangler`。OAuth App 註冊與 `wrangler login`／`secret put` 為帳號層級互動步驟，需使用者本人執行（用 `! npx wrangler …`）。

---

## 6. 安全性

- token 存 sessionStorage（關分頁即失效），只送往 GitHub API 與自家 worker。
- worker 以 `ALLOWED_ORIGIN` 做 CORS 限制；ai-suggest 先驗 GitHub token 對 repo 的 push 權限才回應。
- OAuth 用 `state` 防 CSRF；回跳後立即 `history.replaceState` 清掉 URL 上的 token。
- `/admin` 已排除於 sitemap，且 `noindex`。

---

## 7. 驗證計畫

沿用本次檢查 evidencetoday 的同套方法：

1. `pnpm build && pnpm check:links`：確認加 Svelte/編輯器後仍可靜態建置、無壞連結（appi.news 上線 gate）。
2. 既有測試移植：`src/utils/editor/*.test.ts`（github、mdx-doc roundtrip、slugify、lint…）以 vitest 跑綠（appi.news 目前無測試框架，需加 vitest）。
3. 本機 `pnpm preview` + playwright：
   - `/appi.news/admin/` 登入頁正常掛載、零 console 錯誤；
   - 注入測試 token → 文章頁右下角「編輯」鈕浮出 → 開 EditorPanel → TOAST UI 載入、核心欄位 widget 正確、進階 YAML 區可改；
   - 故意填壞 frontmatter → 存檔被 Zod 驗證擋下。
4. Worker 部署後做一次**真實** OAuth → 編輯一篇 → commit → 觀察 GitHub Actions 重建上線的端到端。

---

## 8. 風險與權衡

- **base path 易踩雷**：OAuth 回跳、前台連結都對 `/appi.news/` 敏感；以 `import.meta.env` 自動帶 base，避免寫死，換網域才不用逐檔改。
- **schema 耦合**：全欄位表單依賴 `content.config.ts` 的 articles schema；schema 改了表單要跟。混合式（核心 widget + 進階 YAML + Zod 驗證）把耦合面縮到最小。
- **Astro markdown 快取**：改 rehype/內容後驗證 dist 前須 `rm -rf .astro dist`（appi.news 既有教訓）。
- **大型 push**：圖片上傳走 GitHub API 單檔 commit，不涉本機大 push，無 evidencetoday 那種 `curl 55` 問題。
- **AI 代寫非自動**：工單建立後需人工 Claude Code 接手，需在 UI 文案講清楚以免誤期望。

---

## 9. 開發順序（後續 plan 會展開）

1. Svelte 整合 + 依賴 + vitest 骨架。
2. 移植 utils（github/mdx-doc/token/slugify/lint/seo-schema/deploy-status/save-machine/image-upload），改 OWNER/REPO/副檔名/key，測試跑綠。
3. 移植元件（AdminLogin/EditButton/EditorPanel/BodyEditor/SeoFields/NewArticle）+ admin.astro + 文章頁掛載，base 感知。
4. 全欄位混合表單 + Zod 存檔驗證。
5. Workers（github-oauth、ai-suggest）程式 + wrangler.toml。
6. 外部設施：OAuth App 註冊、worker 部署、secret 設定（帶使用者做）。
7. 端到端驗證 + 上線。
