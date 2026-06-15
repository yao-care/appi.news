# 效能維護鐵則（必讀，勿再犯）

> 這份文件記錄首頁效能從 **mobile ~57 / desktop ~71** 救到 **mobile 90–100 / desktop 100**（PSI 第三方量測）的根因與規則。
> **動到字型、CSS、首頁圖片、全站樣式或 build 流程前，先讀完本檔。** 違反以下鐵則會讓效能分數崩盤。

---

## 0. 一句話結論

這個站是**繁體中文媒體站**，最大的效能風險永遠是 **CJK 字型很大** 與 **render-blocking 資源**。
所有優化都圍繞這兩件事；別把它們加回首屏關鍵路徑。

---

## 1. 字型策略總覽（歷史根因 → 現況機制）

### 1-A. 當初闖禍的根因（禁止重蹈）

**❌ 絕對禁止** 在 `src/styles/global.css` import Fontsource 的「全腳本」進入點：

```css
/* 禁止！這會帶入日/韓/西里爾/希臘/越南…全部子集 */
@import '@fontsource/noto-sans-tc/400.css';   /* 105 個 @font-face */
@import '@fontsource/noto-serif-tc/700.css';  /* 108 個 @font-face */
```

當初就是這樣寫，導致 **545 個 `@font-face`、662 KB 的 render-blocking CSS**（首頁 `about.*.css`），直接拖垮 FCP/LCP。

### 1-B. 過渡期做法（已廢棄，勿再採用）

先前曾改用 Fontsource 的繁中子集進入點（`chinese-traditional-<weight>.css`），每權重只 1 個 `@font-face`，避免 render-blocking。之後又嘗試「逐頁迷你字型」（每頁 build 一份只含該頁用字的 woff2），但此做法有根本性缺陷：

- 字型檔數 = 頁數 × 字重，隨文章數無限膨脹（曾達 182 MB+）。
- 每頁 URL 不同，瀏覽器無法跨頁快取。
- Build 成本高，難以維護。

已全面廢棄。

### 1-C. 現行機制：unicode-range 切塊（postbuild 自動化）

**現況**由 `scripts/subset-fonts.mjs` 在 postbuild 階段全自動處理，`global.css` 改用 Fontsource 繁中子集進入點作為 build 時的佔位，woff2 與 `@font-face` 在 postbuild 被整批替換：

1. **掃描全站用字**：讀取 `dist/` 所有 HTML，收集實際出現的字元（去重）。全站唯一字 **3,483 個**。
2. **固定切段**：純函式庫 `scripts/lib/font-slicing.mjs` 依碼位連續性把這些字切成 **18 段**，各權重共用同一組邊界。
3. **子集化**：每個（字重 × 區段）用 `subset-font` 工具切出一個 woff2，檔名含內容 hash（`<base>.slice-<i>.<hash>.woff2`）。5 個字重 × 18 段 = **90 個切片檔**，繁中字型 dist 總量約 **3.1 MB**（舊逐頁版曾達 182 MB+）。
4. **注入 unicode-range**：用帶 `unicode-range` 描述符的 `@font-face`（family 名維持真實名稱 `Noto Sans TC` / `Noto Serif TC`、`font-display: optional`）取代 `_astro` CSS 內原本的單體繁中 `@font-face`；隨後 `inline-css.mjs` 照常將 CSS 內聯各頁。

**效益**：瀏覽器只下載當頁實際出現字元命中的少數切片；切片 URL 全站固定（hash 穩定）→ 跨頁可共用 HTTP 快取；字型檔數固定、不隨文章數膨脹；build 回到分鐘級（乾淨 build 約 **201 秒**，exit 0）。

### 1-D. 設計決策與已知坑（別重踩）

1. **family 用真實名稱，不用獨立別名**：字型棧（`--font-sans` / `--font-serif` CSS 變數）中每個位置只有一個 web font family，瀏覽器用 `unicode-range` 決定要不要下載某切片，無需逐頁改棧。
2. **`font-display: optional` 的行為**：首次造訪以系統 CJK 字定版（不等字型、不擋首屏）；品牌字型在後台下載完成後，下次快取訪問才完整顯示。TBT 保持 0。
3. **同名 `@font-face` 覆蓋無效**（舊逐頁版踩過）：若對同一 family 同時存在「全量版」與「切片版」@font-face，Chrome 會兩份都嘗試下載。現行機制直接替換，不留舊 @font-face，此問題不再出現。
4. **新增文章不需重新切段**：切段邊界只取決於全站用字集合，字集變動後下次 build 自動重算並更新 hash，CDN 會取新檔。

---

## 2. 不要破壞 postbuild 五腳本（首頁與內頁效能達標的關鍵）

`package.json` 的 `postbuild` 依序跑這五支，**順序不可換、不可拿掉**：

```
node scripts/subset-fonts.mjs            # ① unicode-range 切塊子集化 + font-display:optional
node scripts/optimize-home-images.mjs    # ② 首頁 cover 圖縮成顯示尺寸 webp
node scripts/optimize-article-images.mjs # ③ 內頁文章封面縮成 900px webp
node scripts/inline-css.mjs              # ④ 全站 critical CSS 內聯、移除 render-blocking link
npx pagefind ...                         # ⑤ 搜尋索引
```

| 腳本 | 做什麼 | 為何不能拿掉 |
|---|---|---|
| `subset-fonts.mjs` | 掃 `dist` 全站 HTML 收集實際用字（3,483 字）→ 用 `lib/font-slicing.mjs` 切成 18 段 → 每（字重 × 段）子集成一個 woff2（共 90 個切片，總量 ~3.1 MB）→ 用帶 `unicode-range` 的 `@font-face`（`font-display: optional`）取代 `_astro` CSS 內原本的單體繁中 @font-face | 瀏覽器只下載命中切片；切片 URL 全站固定→跨頁快取；檔數固定不隨文章膨脹 |
| `optimize-home-images.mjs` | 用 sharp 把首頁 cover 圖縮成顯示尺寸 webp（feature 900px、卡片 600px），改寫 `index.html` 的 `<img src>` | 省 ~1.36 MB |
| `optimize-article-images.mjs` | 用 sharp 把內頁文章封面縮成 900px webp，改寫各文章頁 `<img src>` | 減少內頁 LCP 圖片傳輸量 |
| `inline-css.mjs` | 把**全站**外部 CSS（已被 ① 處理過）內聯進各頁 `<head>`、移除外部 `<link>`；排除 `/choice` 與 `/admin` | **FCP 2.9s→0.8s**，最後一哩；現已延伸到內頁 |

**改 build 流程、字型、圖片、CSS 前，先確認不會破壞這五步的假設。**（例如：若把 CSS 改成 Astro 自動全內聯，① 對 `.css` 的改寫就會落空，細節見各腳本註解。）

### 一個踩過的坑（別重犯）
**同名 `@font-face` 同時存在全量版與切片版**：Chrome 會把兩份都嘗試下載。現行機制在 ① 直接把舊 @font-face 整批替換成切片版，dist 裡不留全量版，此問題不再出現。若未來手動加回全量 @font-face，請務必確認舊的已移除。

---

## 3. 效能驗收：用第三方（機房），不要用本機

- **本機 Lighthouse 會抖**（網路/CPU 變動，分數 ~60–96 亂跳），CI 的 Lighthouse 跑在 runner localhost 也 noisy，**都不可當準**。
- 用 **PageSpeed Insights（Google 機房）**。免金鑰的每日共用配額常用罄，故自備 key：

```bash
source .env   # PSI_API_KEY=...（已被 .gitignore 忽略）
U="https%3A%2F%2Fyao-care.github.io%2Fappi.news%2F"
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$U&strategy=mobile&category=performance&key=$PSI_API_KEY"
```

- 量測對象是**部署後的 GitHub Pages 線上站**，不是本機 `pnpm preview`。
- mobile 分數會在 **90↔100** 間浮動（GH Pages CDN 冷/熱邊緣餵給 Lighthouse 模型的差異），屬正常；**下限應 ≥90**。

---

## 4. 基準與不可退回的底線

| | Desktop | Mobile |
|---|---|---|
| Performance | **100** | **90–100** |
| LCP | ≤0.6s | ≤2.9s |
| TBT / CLS | 0 / 0 | 0 / 0 |

首頁總 payload ≈ **570 KB**（起點 2,562 KB）。**任何改動後請用 §3 複測，不可低於上表。**

---

## 5. 一般原則（任何頁面都適用）

- 首屏關鍵路徑只放**最小必要**資源：不要 preload 大字型（slow-4G 下會搶頻寬拖慢 FCP）、不要塞未壓縮大圖、不要新增 render-blocking 外部 CSS/JS。
- 純裝飾、會吃主執行緒的東西（如首頁 `HeroNetwork` d3 背景）**延後到 `requestIdleCallback`/load 後**啟動（已如此做，TBT=0）。
- 圖片一律 `loading="lazy"`（首屏主圖才 `eager`），並**依實際顯示尺寸**縮成 webp（×~2.5 涵蓋 retina）。`optimize-home-images.mjs` 已分檔：feature 主圖 900、側欄縮圖 `side-img`（`.side-thumb` 僅 88px）360、其餘卡片 600。**改版面或縮圖尺寸時，記得同步調整這些寬度**，否則會服務過大的圖（PSI「圖片傳送效能」會抓）。
- 內頁（文章頁）現已套用與首頁相同的手法：critical CSS 內聯（`inline-css.mjs`）＋封面縮 webp（`optimize-article-images.mjs`）。字型採全站統一的 unicode-range 切塊（§1-C），切片 URL 固定→跨頁快取，不需為內頁另做任何處理。內頁 PSI 分數待部署後量測回填（首頁基準：desktop 100 / mobile ≥90）。

---

## 6. 已知限制（PSI 會建議、但目前無法在 GitHub Pages 解的）

- **「使用有效的快取生命週期」**：GitHub Pages 對所有資產固定回 `Cache-Control: max-age=600`（10 分鐘），**我們無法改**（非靜態檔案可控，是 GitHub 伺服器設定）。
  - 只影響**回訪**（首訪不受影響），且為 PSI 未計分項，不影響分數。
  - 真正要解，得**換自訂網域 + 自有 CDN**（如 Cloudflare），才能對 `_astro/*`（檔名含 hash、可長快取）設 `max-age=31536000, immutable`。換網域時一併處理。
- **mobile 90↔100 浮動**：GH Pages CDN 冷/熱邊緣，非程式問題（見 §3）。
