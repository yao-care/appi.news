# Discover 拿不到大圖版位：封面比例、尺寸宣告與熱連結三個看不見的坑

> 摘要：Discover 0 曝光，技術前置條件（news-sitemap、max-image-preview:large、NewsArticle JSON-LD）全都齊了，真正的破口在三個沒人檢查的地方——20 篇直式封面、og:image 尺寸寫死 1200×630 與實際不符、4 篇封面是外連熱連結且 3 篇低於 1200px ｜ 範圍：SEO / Discover / 配圖 ｜ 狀態：三項皆已修，源頭已堵 ｜ 日期：2026-07-31

對應 SOT：`src/components/seo/SEOHead.astro`＋`src/utils/og-image-size.ts`（og 尺寸）；`workers/ai-suggest/src/index.ts`（圖庫搜圖方向）；`scripts/get-image.mjs`（封面寬度）。

## 問題（症狀）

GSC 顯示 Discover **0 曝光**、Google News 僅 4 曝光。直覺會往「技術沒做好」找，但逐項查完發現前置條件其實都齊：news-sitemap 正確只放近 3 天、`max-image-preview:large` 有掛、schema 依 contentType 正確分派 `NewsArticle`／`AnalysisNewsArticle`／`OpinionNewsArticle`、近 7 天有 84 篇可進 Google News。**供給與規格都不是問題。**

破口在三個沒有任何 gate 在看的地方。

## 原因（根因）

**坑一：直式封面拿不到大卡片版位。** Discover 與 Top Stories 的大圖版位是**橫式**，直式封面會被裁切或降級成小圖。盤點 7 月 181 篇，**20 篇是直式**（集中在 civic／police 兩條線）。根因在 `workers/ai-suggest`：Unsplash 與 Pexels 的搜圖查詢**都沒帶 `orientation`**，圖庫回什麼比例就用什麼。兩個 API 其實都支援 `orientation=landscape`。

**坑二：`og:image:width/height` 寫死。** `SEOHead.astro` 固定輸出 `1200×630`（社群卡片的經典預設值），但站上封面實際比例不一（1200×800、1600×1067、直式 1200×1680）。宣告值與檔案不符時，爬蟲會依錯誤尺寸預留版位，可能裁錯圖或乾脆忽略這組提示。**這個坑特別隱形，因為它「有輸出」，看起來就像做對了。**

**坑三：熱連結封面繞過所有尺寸保證。** 4 篇 `coverImage` 直接指向 `images.unsplash.com`，其中 **3 篇原圖只有 1080px 寬**，低於 Discover 大圖的 1200 門檻。這類封面同時繞過 postbuild 的縮圖鏈（處理不到外部網址），而且對方一改版或撤圖就破圖。既有的「封面 ≥1200」規則只管到 `get-image.mjs` 產的圖，管不到人工塞進來的外部網址。

## 解法（怎麼修 + 現在怎麼維持）

- **坑一**：worker 的兩個圖庫查詢都加 `orientation=landscape`，`wrangler deploy`（Version `d599d645`）。只影響未來新文，存量 20 篇不回溯（多為時效性內容，回溯成本高、價值低）。
- **坑二**：新增 `src/utils/og-image-size.ts`，build 期用 sharp 讀本機檔案真實尺寸；**讀不到就整組不輸出**（外部網址、檔案不存在）。宣告錯的比不宣告更糟——缺這兩個 tag 不影響收錄，爬蟲會自己抓圖判斷。全站 1,100+ 頁共用少數封面，以模組層 Map 快取，同一張圖單次 build 只讀一次，build 時間維持同量級。
- **坑三**：3 篇以 Unsplash 的 `w=` 參數重抓 1600px、轉 webp 自我托管、更新 frontmatter，`coverImageCredit` 原樣保留。第 4 篇（`appi-news-43`）尺寸達標但**無 credit 且查不到攝影師**，未處理——自行補署名等於捏造，留人工確認。

## 怎麼避免重犯 / 相關

- **「有輸出」不等於「輸出對的」。** og 尺寸寫死是典型：它一直在輸出、從來沒報錯，所以沒人懷疑。凡是「宣告資料屬性」的 meta（尺寸、時間、語系），都要跟真實來源核對過一次。
- **規格保證要涵蓋所有寫入路徑。** 「封面 ≥1200」只寫在 `get-image.mjs` 裡，人工塞外部網址就整個繞過。這與受控標籤那次（gate 只覆蓋 7 條產線、漏掉 agent.writer）是同一種病：**盤點寫入端，不要只看主要那條**。
- **查 Discover 不要從「內容不夠好」開始猜。** 先把可量測的技術面逐項驗完（比例、尺寸、宣告值、熱連結、noindex 洩漏、robots），這些都有明確對錯；剩下的才是 Google 的判斷。本次三個坑全部是可量測項。
- **標題不用為 Discover 另訂規則**（實測結論）：361 篇樣本中誇大詞僅 1%、主標長度中位數 14 字、僅 14% 超過 24 字，鉤子本來就前置。既有的 SEO 標題規則（主標含 targetQuery 核心詞）產出的形狀與 Discover 需要的一致，兩者不衝突，**不要為了 Discover 去改剛裝好的選題規則**。
- 相關：[`google-news-surfaces-and-cover-image.md`](./google-news-surfaces-and-cover-image.md)（封面原圖 vs 顯示圖的分野、Google News 已改自動抓取）、[`google-indexing-api-gray-area.md`](./google-indexing-api-gray-area.md)（收錄那一側）。

## 2026-08-11 追記：只修來源端不守出口，六週後又流血 94 篇

7/31 修完三個坑，8/11 盤點卻發現 **6/15 起新產文有 94 篇封面不合格**，最近一篇就是盤點當天。三個來源端補丁全都被別的路徑繞過：

- **embed 路徑完全沒管比例**：7/31 的 `orientation=landscape` 只加在 worker 的圖庫搜尋，`get-image.mjs --embed-url`（國際線嵌 Wikimedia／政府公眾領域圖）拿到直式原圖照收，8 月的直式封面幾乎全是它。
- **舊碼還在跑**：repo 裡 worker 已改 Pexels `large2x`（1880px），但 8 月仍持續出現 940×627（正是 Pexels `large` 的尺寸）——線上 worker 沒有跟上 repo（`wrangler deploy` 沒跑或跑在舊 commit）。**repo 是對的不代表線上是對的。**
- **`toWebp` 的 `withoutEnlargement` 靜默收下小圖**：`--width 1200` 是上限不是下限，來源 940 就輸出 940，全程無警告。另有一篇封面是 733×96 的橫幅碎圖，一樣一路綠燈上線。

**根因是結構性的：所有補丁都在「來源端」，出口沒有任何驗收。** 來源端修得再好，只要有一條新路徑（embed）、一個沒部署的環節（worker）、一個靜默降級（withoutEnlargement），壞封面就直達線上。

**解法（2026-08-11）**：規格集中到 `scripts/lib/cover-spec.mjs`（橫式比例 1.3–2.5、寬 ≥1200），改成**雙層機械保證**：

1. **取圖端** `get-image.mjs`：stock 候選不符自動淘汰換下一張（封面多試 8 張）；embed 不符 fail-closed 退非零讓起草端換圖；生成不符直接炸（worker 契約異常要看得見）；封面帶 `--width <1200` 提前報錯。
2. **出口端** `check-cover-spec.mjs`：newsroom-write 配圖 gate＋八條產線（international／civic／police／acute-care／tech-desk／video／health-days／focus-esg）寫檔後 spawnSync 自檢，不符不發。熱連結封面一併擋（繞過所有尺寸保證）。
3. 存量盤點：`node scripts/check-cover-spec.mjs --all`（report-only；當日 173 篇待回填，含 3 篇熱連結）。

### 怎麼避免重犯（追記）

- **來源端修補一律要配出口驗收**，否則等於沒修——與「規格保證要涵蓋所有寫入路徑」同病，但更進一步：寫入路徑會**繼續新增**（這次是 embed），只有出口 gate 擋得住未來的路徑。
- **改了 worker 要驗線上行為，不是驗 repo**：抓一張實際產出的圖量尺寸，比讀程式碼可靠。
- **`withoutEnlargement` 這類「安全降級」是靜默失敗的溫床**：降級可以，但要在消費端驗收成品，不能讓降級結果直接過關。
