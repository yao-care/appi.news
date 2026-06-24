# Google News 收錄資料包（APPI News）

> 所有欄位取自 `src/config/site.ts`、`src/config/categories.ts` 與線上站實測，非憑記憶。

## ⚠️ 現況更正（2025/03 Google 改版，必讀）

Google News 已於 **2025 年 3 月**全面改為**自動生成刊物頁**。官方明確表示：**Google News 不再使用 Publisher Center 裡提交的 RSS feed 或網站位置**，手動建立的刊物頁也不再對使用者顯示；標題、地區、版面等自訂功能多半移除。Publisher Center 現在主要剩 **Reader Revenue Manager（訂閱變現）** 與 **News Showcase** 兩用途。
（來源：https://support.google.com/news/publisher-center/answer/15898024）

**因此：**

- **沒有 XML / feed 要「貼進 Publisher Center」** —— 它已不吃。下方 §3「Content/feeds」段保留僅供歷史參考，現已失效。
- **Google News 收錄是自動的**，靠 Google 爬取你的網站 + **Search Console 的 news sitemap**（見 §3.1），不需在 Publisher Center 送審。
- Publisher Center 仍可上傳 **logo（Images 分頁）**，這是少數還保留的設定（見 §2）；要不要建刊物純看你是否需要 Reader Revenue Manager / News Showcase。

---

## 3.1 給 Google 的 XML / feed 一覽（真正有效的管道）

Google News／一般搜尋實際吃的是下面這些，管道是 **Google Search Console**（非 Publisher Center），且**均已提交、即時驗證健康**：

| XML / feed | 網址 | 狀態（線上＋GSC 實測） | 用途 |
|---|---|---|---|
| **News sitemap** | `https://appi.news/news-sitemap.xml` | HTTP 200；GSC 已提交、type=news、0 錯誤、每日自動抓取 | Google News 收錄主訊號 |
| 一般 sitemap（index） | `https://appi.news/sitemap-index.xml` | HTTP 200；GSC 已提交、0 錯誤 | 一般搜尋索引 |
| RSS feed | `https://appi.news/rss.xml` | HTTP 200、30 筆全文 | 讀者／聚合器（Google News 已不用，仍有效） |

- 三者皆已寫進 `https://appi.news/robots.txt`。
- news sitemap 規格／准入邏輯見 `src/pages/news-sitemap.xml.ts`（48h 窗、廣編/新聞稿/常青指南排除）。
- **要交給 Google 的「XML 資料」就是上面三個 URL，且已透過 Search Console 交付，無需再做。**

---

## 0. 前置：你本人要做的事

1. 用**要當作刊物擁有者的 Google 帳號**登入 Publisher Center。建議用 `evidencetodaynewsdesk@gmail.com`（與站上聯絡信箱一致）或公司主帳號。
2. 網域所有權驗證：Publisher Center 會要你用 **Search Console 已驗證的同一帳號**。本站 GSC 是 `sc-domain:appi.news`（網域層級已驗證）。**用同一個 Google 帳號登入 Publisher Center，所有權會自動沿用，免再驗一次。** 若帳號不同，需先把該帳號加入 GSC 為擁有者。

---

## 0.5 介面導覽（設定都在「刊物內頁」，不在首頁）

建立刊物後，狀態會是 **Draft（草稿）**。設定不在 Publisher Center 首頁，要**點進你建立的那個刊物**，內頁分頁如下：

| 分頁 | 填什麼 | 對應本檔 |
|---|---|---|
| General（一般） | 名稱、總部地點、聯絡方式、語言、發佈設定 | §1 |
| Content（內容） | 網站網址、RSS feed、分區（Sections） | §3、§4 |
| Images（圖片） | 方形＋淺色＋深色 logo | §2 |
| Review & publish（審核與發佈） | 檢查問題後送審 | — |

填完按送審 → 狀態變 **Under Review（審核中，幾天到一週）→ Online（上線）**。看到「審核中」是正常流程，不是出錯。

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

Publisher Center 的 **Images** 分頁要三種 logo（方形＋淺色模式＋深色模式），已全部備好：

| 用途（Publisher Center 欄位） | 規格要求 | 檔案 | 狀態 |
|---|---|---|---|
| **方形 logo**（Square） | PNG/JPG，1:1，≥512px（建議 1024） | `https://appi.news/icon-512.png`（512×512） | ✅ |
| **淺色模式 logo**（Light mode，給白底，深色字） | 長方形、透明底 | `https://appi.news/logo-horizontal.png`（1000×300）／向量 `logo-horizontal.svg` | ✅ |
| **深色模式 logo**（Dark mode，給深底，淺色字） | 長方形、透明底 | `https://appi.news/logo-horizontal-dark.png`（1000×300）／向量 `logo-horizontal-dark.svg` | ✅ |
| Favicon | — | `https://appi.news/favicon.ico` / `favicon.svg` | ✅ |
| 預設社群圖（備用視覺） | 1200×630 | `https://appi.news/og/default.png` | ✅ |

> 橫式 logo（淺色＋深色兩版）沿用品牌色（深藍 #1f3a5f／#2d5286、金 #a87515；深色版字標改白＋亮金 #e0aa4e）與 favicon 標記。方形 logo 直接用 `icon-512.png`。

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
