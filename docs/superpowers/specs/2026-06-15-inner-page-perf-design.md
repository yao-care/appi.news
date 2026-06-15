# 內頁效能優化設計（全站 critical-CSS 內聯 + 內頁封面縮圖）

> 日期：2026-06-15
> 作者：Lightman（CΛ）
> 目標：把內頁（文章 / 分類 / 子分類 / 作者 / 專欄 / 專題）的 PSI mobile 推到 90+，且首頁基準（desktop 100、mobile 90+）不退。

## 1. 背景與診斷

PSI（線上、第三方）實測：
- 首頁：desktop 100、mobile 95（達標）。
- 文章內頁（如 `/articles/post-426/`）：desktop 98、**mobile 76**。

內頁 mobile 細項：**FCP 10.5s、LCP 11.9s**，但 **TBT 0、CLS 0**。瓶頸不是 JS、不是版位、也不是圖片 bytes（那些會壓 TBT/CLS 或出現在機會清單），而是 `PERFORMANCE.md` §0 點名的兩大風險之一：**render-blocking 資源**。

根因（已驗證）：
- 首頁 FCP 僅 0.8s，因為 postbuild 的 `inline-home-css.mjs` 把 critical CSS 內聯、移除 render-blocking `<link>`。**這套只跑 `dist/index.html`**。
- 內頁 `<head>` 仍有多個 render-blocking 外部 CSS（文章頁實測 5 個 `_astro/*.css`，約 30KB），冷 CDN 邊緣 + 多次往返 → FCP ~10s。
- 字型不是內頁瓶頸：`subset-fonts.mjs` 已全站子集化且 `font-display:optional`（非 render-blocking）。
- 文章封面 `<img class="article-cover" loading="eager">` 服務**原圖**（如 `covers/wp-426.jpg`，未縮、未轉 webp），是 LCP 元素；FCP 修好後 LCP 會由它決定。

`PERFORMANCE.md` §5 已預告此方向：「內頁⋯若要推到滿分，可比照 §2 把同手法延伸到內頁。」

## 2. 範圍

- **所有內頁類型**：文章、分類、子分類（`/[category]/[sub]`）、作者、專欄、專題等所有非首頁、非 `/admin`、非 `/choice` 的頁面。
- 不動首頁既有處理（僅確保通用化後首頁仍 100/90+）。
- newsroom 段落圖已是 lazy + 尺寸化 webp（不影響 FCP/LCP），不在此題。

## 3. 設計（方案 A：全站 CSS 內聯 + 內頁封面縮圖）

### 3.1 全站 critical-CSS 內聯
`inline-home-css.mjs` 的內聯邏輯本已通用（掃 `<link rel=stylesheet>` 指向 `_astro/*.css`、讀檔內聯為 `<style>`、移除 `<link>`），只是僅跑首頁。**通用化為 `scripts/inline-css.mjs`**：走遍所有 `dist/**/*.html`，對每頁套同一處理。
- **排除**：`dist/choice/**`（含一個 ~592KB 的 CSS，內聯會爆）、`dist/admin/**`（編輯器、非讀者頁）。
- 首頁也走同一支（與現況等效；驗收強制 PSI 複測首頁不退）。
- **效率**：以 Map 快取每個 `_astro/*.css` 的內容，跨頁重用，不逐頁重讀（現站約 1,400+ HTML）。
- 取捨：CSS 內聯進每頁、失去跨頁 CSS 快取。GH Pages 快取僅 10 分鐘、效益有限，換 FCP 值得（`PERFORMANCE.md` §5 已背書此取捨）。

### 3.2 內頁封面縮圖
新增 `scripts/optimize-article-images.mjs`：掃 `dist/articles/**/index.html` 的 `<img class="article-cover">`，用 sharp 把來源封面（jpg/png/webp 皆可，讀 `dist/covers/<file>`）縮成 **寬 900px、webp q72**（比照首頁 feature），輸出帶 hash 檔名、改寫該頁 `<img src>`。
- 封面是 eager LCP 元素，縮圖直接降低 LCP。
- 其餘內頁 eager 圖（作者頭像 96px、分類頁）很小，先不處理（YAGNI）。
- 冪等：以內容 hash 命名，原圖小於目標寬不放大、變更小才替換（比照 `optimize-home-images.mjs`）。

### 3.3 postbuild 順序
`package.json` 的 postbuild 調整為（內聯一定最後，吃到字型/圖片改寫後的 CSS/圖）：
```
subset-fonts.mjs            ① 不動
optimize-home-images.mjs    ② 不動（首頁封面）
optimize-article-images.mjs ③ 新增（內頁封面）
inline-css.mjs              ④ 由 inline-home-css.mjs 通用化（全站內聯，最後做）
pagefind --site dist        ⑤ 不動
```

### 3.4 文件同步（PERFORMANCE.md）
本案改變了「內頁未優化」這個事實，故**更新 `PERFORMANCE.md`**：
- §2 表格／§5 補記「內頁也已套 critical-CSS 內聯 + 封面縮圖」。
- 新增內頁基準（見 §5 驗收實測值），納入「不可退回」清單。
（這是把既有準確文件隨行為變更同步，非重寫。）

## 4. 驗收（第三方 PSI，依 PERFORMANCE.md）
- **首頁不可退**：desktop 100、mobile 90+。
- **內頁達標**：抽樣文章頁、分類頁、子分類頁、作者頁，mobile 90+、desktop 高分。
- `pnpm build && pnpm check:links` 全綠。
- build 後抽查 dist 內頁：`<head>` 無外部 render-blocking `_astro` CSS `<link>`（已內聯）；`.article-cover` 已是 webp 且尺寸縮過。
- 記錄內頁實測基準寫回 `PERFORMANCE.md`。

## 5. 風險
| 風險 | 緩解 |
|---|---|
| 通用化內聯弄壞首頁（迷你字型順序等） | 驗收強制 PSI 複測首頁 100/90+；首頁走同一支邏輯，行為等效 |
| dist 變大（CSS 複製進每頁） | 已知取捨，可接受；GH Pages 快取僅 10 分鐘 |
| build 變慢（1,400+ 頁內聯 + 數百封面 sharp） | CSS 內容 Map 快取、封面 hash 冪等只處理一次；監測 build 時間 |
| 與平行 session 的內容/站台變更衝突 | 本案只動 postbuild 腳本與 package.json，與內容檔案不重疊；合併前重測 |

## 6. 交付項
1. `scripts/inline-css.mjs`（由 `inline-home-css.mjs` 通用化；走全站、排除 choice/admin、CSS 內容快取）。
2. `scripts/optimize-article-images.mjs`（內頁封面縮 webp、改寫 src）。
3. `package.json` postbuild 串接更新（插入 ③、④ 改名）。
4. `PERFORMANCE.md` 同步內頁優化說明與新基準。
5. 驗收：build + check:links + 多頁型 PSI（首頁不退、內頁 90+）。
