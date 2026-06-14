# 效能維護鐵則（必讀，勿再犯）

> 這份文件記錄首頁效能從 **mobile ~57 / desktop ~71** 救到 **mobile 90–100 / desktop 100**（PSI 第三方量測）的根因與規則。
> **動到字型、CSS、首頁圖片、全站樣式或 build 流程前，先讀完本檔。** 違反以下鐵則會讓效能分數崩盤。

---

## 0. 一句話結論

這個站是**繁體中文媒體站**，最大的效能風險永遠是 **CJK 字型很大** 與 **render-blocking 資源**。
所有優化都圍繞這兩件事；別把它們加回首屏關鍵路徑。

---

## 1. 字型 import 鐵則（這是當初闖禍的根因）

**❌ 絕對禁止** 在 `src/styles/global.css` import Fontsource 的「全腳本」進入點：

```css
/* 禁止！這會帶入日/韓/西里爾/希臘/越南…全部子集 */
@import '@fontsource/noto-sans-tc/400.css';   /* 105 個 @font-face */
@import '@fontsource/noto-serif-tc/700.css';  /* 108 個 @font-face */
```

當初就是這樣寫，導致 **545 個 `@font-face`、662 KB 的 render-blocking CSS**（首頁 `about.*.css`），
直接拖垮 FCP/LCP。

**✅ 只能用「繁中子集」進入點**（每權重只 1 個 `@font-face`）：

```css
@import '@fontsource/noto-sans-tc/chinese-traditional-400.css';
@import '@fontsource/noto-sans-tc/chinese-traditional-500.css';
@import '@fontsource/noto-sans-tc/chinese-traditional-700.css';
@import '@fontsource/noto-serif-tc/chinese-traditional-600.css';
@import '@fontsource/noto-serif-tc/chinese-traditional-700.css';
@import '@fontsource/inter/latin-400.css';   /* Inter 只要 latin */
@import '@fontsource/inter/latin-600.css';
```

- 字型棧（`--font-sans` / `--font-serif`）以 `Inter` 處理 Latin、Noto 處理中文，**不要動順序**。
- 新增字重時，**務必**用 `chinese-traditional-<weight>.css`，不要圖方便用全腳本進入點。

---

## 2. 不要破壞 postbuild 三腳本（首頁拿 100 分的關鍵）

`package.json` 的 `postbuild` 依序跑這三支，**順序不可換、不可拿掉**：

```
node scripts/subset-fonts.mjs        # ① 字型子集化 + 首頁迷你字型 + font-display:optional
node scripts/optimize-home-images.mjs # ② 首頁 cover 圖縮成顯示尺寸 webp
node scripts/inline-home-css.mjs      # ③ 首頁 critical CSS 內聯、移除 render-blocking link
```

| 腳本 | 做什麼 | 為何不能拿掉 |
|---|---|---|
| `subset-fonts.mjs` | 掃 `dist` 全站實際用字 → 把繁中 woff2 子集化（每權重 ~330KB→~70KB）並重新雜湊檔名；再為**首頁**單獨產「只含首頁用字」的迷你字型（獨立 family `NotoSansTC-Home`/`NotoSerifTC-Home`，只在 `index.html` 以 inline `<style>` 把 `--font-sans/serif` 的站台 web font **換成** Home family）；並把繁中 `@font-face` 改 `font-display:optional` | 首頁 CJK 字型 **1,596KB→430KB**、LCP 9.3s→3.0s |
| `optimize-home-images.mjs` | 用 sharp 把首頁 cover 圖縮成顯示尺寸 webp（feature 900px、卡片 600px），改寫 `index.html` 的 `<img src>` | 省 ~1.36MB |
| `inline-home-css.mjs` | 把首頁 3 個外部 CSS（已被 ① 處理過）內聯進 `<head>`、移除外部 `<link>` | **FCP 2.9s→0.8s**，最後一哩 |

**改 build 流程、字型、圖片、CSS 前，先確認不會破壞這三步的假設。**（例如：若把 CSS 改成 Astro 自動全內聯，① 對 `.css` 的改寫就會落空——細節見各腳本註解。）

### 兩個踩過的坑（別重犯）
1. **同名 `@font-face` + `unicode-range` 覆蓋無效**：Chrome 會把站台版與迷你版**兩份都下載**。
   → 解法是給迷你字型**獨立 family 名**（見上）。
2. **`font-display:optional` 的後備會抓下一個 web font**：若首頁字型棧裡站台 web font 還留在 Home family 後面，
   Chrome 會在 optional 區間去抓它當後備，全站大字型仍被下載。
   → 解法是把站台 web font 從首頁棧中**替換掉**（後面只接系統字型）。缺字（搜尋結果）落回系統 CJK 字、不 tofu。

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
- 內頁（文章頁）目前沿用全站共用字型與原圖以利跨頁快取；若要把內頁也推到滿分，可比照 §2 把同手法延伸到內頁。

---

## 6. 已知限制（PSI 會建議、但目前無法在 GitHub Pages 解的）

- **「使用有效的快取生命週期」**：GitHub Pages 對所有資產固定回 `Cache-Control: max-age=600`（10 分鐘），**我們無法改**（非靜態檔案可控，是 GitHub 伺服器設定）。
  - 只影響**回訪**（首訪不受影響），且為 PSI 未計分項，不影響分數。
  - 真正要解，得**換自訂網域 + 自有 CDN**（如 Cloudflare），才能對 `_astro/*`（檔名含 hash、可長快取）設 `max-age=31536000, immutable`。換網域時一併處理。
- **mobile 90↔100 浮動**：GH Pages CDN 冷/熱邊緣，非程式問題（見 §3）。
