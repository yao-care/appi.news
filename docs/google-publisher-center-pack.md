# Google Publisher Center 登記資料包（APPI News）

> 目的：到 https://publishercenter.google.com 建立刊物時照此貼。**非收錄前提**（Google News 現為自動收錄），這步是管理門面（品牌名、logo、分區）的加分項。
> 所有欄位取自 `src/config/site.ts`、`src/config/categories.ts` 與線上站實測，非憑記憶。

## 0. 前置：你本人要做的事

1. 用**要當作刊物擁有者的 Google 帳號**登入 Publisher Center。建議用 `evidencetodaynewsdesk@gmail.com`（與站上聯絡信箱一致）或公司主帳號。
2. 網域所有權驗證：Publisher Center 會要你用 **Search Console 已驗證的同一帳號**。本站 GSC 是 `sc-domain:appi.news`（網域層級已驗證）。**用同一個 Google 帳號登入 Publisher Center，所有權會自動沿用，免再驗一次。** 若帳號不同，需先把該帳號加入 GSC 為擁有者。

---

## 1. 刊物基本資料（Publication details）

| 欄位 | 填入值 |
|---|---|
| Publication name（刊物名稱） | `APPI News` |
| Display language（語言） | 中文（繁體）／`zh-Hant`（地區 Taiwan） |
| Country/region（主要地區） | Taiwan（台灣） |
| Website URL（網站網址） | `https://appi.news/` |
| Publication description（簡介） | APPI News｜亞太專業觀點，聚集各領域專業作者的觀點媒體，透過新聞、評論、專欄、專題、專訪與深度分析，協助讀者理解健康、科技、財經、國際、運動、生活等重要議題。 |
| Contact email（聯絡信箱） | `evidencetodaynewsdesk@gmail.com` |
| Category / 性質 | General news（綜合新聞） |

英文輔助字樣（若要填英文名）：`Asia-Pacific Press & Insight`

---

## 2. Logo / 圖像資產

Publisher Center 通常要兩種 logo，規格如下對照現有檔案：

| 用途 | 規格要求 | 現有檔案 | 狀態 |
|---|---|---|---|
| **方形 logo**（Square） | 1:1，建議 ≥512px | `https://appi.news/icon-512.png`（512×512） | ✅ 可直接用 |
| **長方形 logo**（Rectangular／wordmark，多數版位主用） | 寬高比約 10:3，透明背景、深色字，寬 200–1000px | `https://appi.news/logo-horizontal.png`（1000×300，透明底）／向量原檔 `logo-horizontal.svg` | ✅ 已產 |
| Favicon | — | `https://appi.news/favicon.ico` / `favicon.svg` | ✅ |
| 預設社群圖（備用視覺） | 1200×630 | `https://appi.news/og/default.png` | ✅ |

> 長方形含字 logo（橫式 APPI News 標誌，透明底）已產出：線上 `https://appi.news/logo-horizontal.png`、向量原檔 `https://appi.news/logo-horizontal.svg`。沿用品牌色（深藍 #1f3a5f／#2d5286、金 #a87515）與 favicon 標記。

---

## 3. 內容來源設定（Content / Feeds）

Publisher Center 可用網站爬取或 feed。本站兩者都備好：

| 項目 | 網址 | 狀態 |
|---|---|---|
| 網站首頁（供爬取） | `https://appi.news/` | ✅ |
| RSS feed | `https://appi.news/rss.xml` | ✅ HTTP 200，含全文 `content:encoded` |
| Google News sitemap | `https://appi.news/news-sitemap.xml` | ✅ GSC 已認列 `type:news`、0 error |
| 一般 sitemap | `https://appi.news/sitemap-index.xml` | ✅ 已提交 GSC |
| robots.txt | `https://appi.news/robots.txt` | ✅ 兩個 sitemap 都已掛 |

---

## 4. 分區建議（Sections，對應站上分類）

若要在 Publisher Center 建分區，對應站上 8 大分類與其 URL：

| 分區名 | URL |
|---|---|
| 焦點 | `https://appi.news/focus/` |
| 國際 | `https://appi.news/international/` |
| 健康 | `https://appi.news/health/` |
| 科技 | `https://appi.news/tech/` |
| 財經 | `https://appi.news/finance/` |
| 運動 | `https://appi.news/sports/` |
| 生活 | `https://appi.news/lifestyle/` |
| 專欄 | `https://appi.news/columns/` |

---

## 5. 信任／政策頁（Publisher Center 可能要求的 About/政策連結）

站上現有，可直接貼：

| 用途 | URL |
|---|---|
| 關於我們／擁有權資訊 | `https://appi.news/about/` |
| 編輯與倫理政策 | `https://appi.news/editorial-policy/` |
| 隱私權政策 | `https://appi.news/privacy/` |
| 服務條款 | `https://appi.news/terms/` |
| 聯絡我們 | `https://appi.news/contact/` |

---

## 6. 一個尚未填的可加分項（與本資料包相關）

`src/config/site.ts` 的 `org.sameAs` 目前是**空陣列** —— 站上沒有對外掛任何官方社群／權威連結（FB / LinkedIn / X / Threads / 維基）。這會讓 Google 與 AI 較難交叉核對「APPI News 是真實媒體實體」，間接影響 Google News 對刊物的信任。

建立 Publisher Center 帳號後，建議回填這些官方帳號網址到 `org.sameAs`（會自動進 Organization structured data）。等你有了社群帳號，我可以幫你補進去。

---

## 摘要：你需要決定的三件事

1. 用哪個 Google 帳號當刊物擁有者（建議與 GSC 同帳號，免重驗）。
2. 要不要我先產一個**長方形含字 logo**（目前唯一缺口）。
3. 要不要開官方社群帳號以回填 `org.sameAs`（信任訊號）。
