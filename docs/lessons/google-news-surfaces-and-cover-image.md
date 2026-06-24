# Google News 自動抓取（不再吃提交的 feed/section）＋ 封面圖給 Discover 的兩個坑

> 摘要：① Google News 2025-03 改自動抓取，Publisher Center 提交的 RSS feed / sections / 網址已不再使用——別再建議「把 section 指到分類 feed」；② Discover/Top Stories 的大圖取自 `NewsArticle` JSON-LD 與 `og:image`，那兩個欄位指的是**封面原圖**、不是 postbuild 縮的 900px 顯示圖——別為了「一致」把它改去指 900。｜ 範圍：SEO / Google News ｜ 狀態：已釐清 + 已調整（PR #88/#89）｜ 日期：2026-06-24

對應 SOT：站名/OG 預設 `src/config/site.ts`；結構化資料 `src/utils/jsonld.ts`（`articleLd`）；封面產線 `scripts/get-image.mjs`＋`scripts/lib/ai-image.mjs`＋`workers/ai-suggest/src/index.ts`；顯示用封面縮圖 `scripts/optimize-article-images.mjs`。

## 問題（症狀）

1. 站台通過 Google Publisher Center 後，想「配合經營」去後台設定**內容來源 feed / sections**，卻**找不到任何欄位**。直覺以為是自己沒找到、或設定藏在某處。
2. 想讓文章在 Google Discover / Top Stories 拿到大圖版位，盤點時一度判斷「JSON-LD 的 `image` 只給 900px」，差點寫腳本去「補一張 1200 變體給 JSON-LD」。

## 原因（根因）

**坑 ①：Google News 已不吃提交的 feed/section。** Google News 在 **2025-03** 完成「自動產生出版品頁面」改版：不再使用 Publisher Center 裡提交的 RSS feed、web locations、手動 sections；手動建立的出版品頁也不再對讀者顯示，後台連「Google News」磚都移除了。所以**找不到設定是正常的**——內容改成全自動從網站抓取。能影響收錄的槓桿全在站上（news-sitemap、`NewsArticle` JSON-LD、E-E-A-T、內容品質與時效），曝光監控改看 **Search Console**（非 Publisher Center）。

**坑 ②：JSON-LD/og 的 `image` 指的是原圖，不是顯示圖。** 容易誤以為「頁面封面是 900px，所以 Google 看到的也是 900px」。實際資料流：
- `articles/[slug].astro` 在 Astro build 期算 `image: new URL(coverImageFor(article), Astro.site)` → 指向**原圖**（`/covers/<file>`）。
- postbuild 的 `optimize-article-images.mjs` 只把**可見 `<img class="article-cover">`** 的 `src` 換成 900px webp（`WIDTH = 900`，為了 LCP），**不動 JSON-LD `<script>` 也不動 og/twitter meta**。
- 所以 Google 拿到的是**原圖**。問題不在 JSON-LD，而在**部分原圖來源太小**（當時全站約 32%、134 張封面 <1200px，圖庫來源 Pexels `large` 940 / Unsplash `regular` 1080 本就 <1200）。對 <1200 的原圖「產 1200 變體」是無中生有（`withoutEnlargement`），對已 ≥1200 的反而會把它 downscale——是**對假問題改程式**（呼應 [`psi-cold-edge.md`](./psi-cold-edge.md) 的判讀紀律）。

## 解法（怎麼修 + 現在怎麼維持）

- **坑 ①**：不再做「feed→section」這類舊模式操作。配合經營＝顧好站上既有基建（已齊）＋在 Search Console 看曝光。分類 feed（`/<category>/rss.xml`）與 RSS `<enclosure>` 仍保留（PR #88），但定位為**給一般 RSS 訂閱者/聚合器**，**不是 Google News 管線**。
- **坑 ②**：真正的槓桿是**配圖來源端最小寬度**（PR #89）：
  - worker 圖庫改取大尺寸（Unsplash `urls.raw&w=1600`、Pexels `src.large2x` 1880），需 `wrangler deploy`。
  - `get-image.mjs` 依 `--out` 路徑分流：`covers/` → 1200、內文 `images/` → 維持 960（內文單篇多圖、無 postbuild 縮圖，拉大會傷文章頁）。
  - **`optimize-article-images.mjs` 的 `WIDTH = 900` 不動**：顯示用封面維持 900 保 LCP；JSON-LD/og 指原圖→自動拿到 ≥1200。
  - 只影響**未來新文**，舊封面不回溯。

## 怎麼避免重犯 / 相關

- **別再建議把 Publisher Center 的 section 指到 feed**——該功能已廢。Google News 配合經營＝站上 SEO 基建 + Search Console，不是後台填 feed。
- **改圖片效能前先分清兩種圖**：①顯示用封面（要小、保 LCP，由 `optimize-article-images.mjs` 縮 900）；②結構化資料/社群圖（給 Discover/Top Stories/分享，要 ≥1200，來自原圖）。**別把 JSON-LD/og 改去指 900 顯示圖**，會砸掉 Discover 大圖版位。動圖片產線前一律先讀 [`PERFORMANCE.md`](../../PERFORMANCE.md)。
- 封面尺寸不足是**來源**問題，從配圖端（worker 圖庫 URL / `get-image.mjs`）解，不要在 JSON-LD 端「變體」硬補。
- 相關：收錄誤解見 [`google-indexing-api-gray-area.md`](./google-indexing-api-gray-area.md)；Claude 本地記憶 `google-publisher-center-feeds` 為本篇指標摘要。
