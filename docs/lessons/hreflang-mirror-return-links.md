# hreflang 沒有回指就整組無效——鏡像站上線一週曝光近零的結構性原因之一

> 摘要：多語鏡像站單方面掛 hreflang 指回本站，本站不回指＝整組宣告被 Google 忽略；補回指的資料由鏡像產線自動同步，本站只負責渲染 ｜ 範圍：SEO ｜ 狀態：已解決 ｜ 日期：2026-08

## 問題（症狀）

jp／en／in.appi.news 三個多語鏡像站 2026-08-08 上線，各回填三百多頁。一週後 GSC
近 28 天數字：本站曝光 43,344，三站合計不到 1,000，排名全卡 55–100 名。
鏡像站的文章頁都有掛 `<link rel="alternate" hreflang="zh-Hant" href="https://appi.news/…">`，
但本站的文章頁什麼都沒掛。

## 原因（根因）

hreflang 是**成對宣告**：A 頁宣告 B 是它的某語版，B 頁必須回宣告 A，Google 才採信；
單向宣告整組視為無效（官方文件明載 return links 要求）。鏡像專案的第一鐵則是
「appi.news 零改動」，所以鏡像站上線時只做了單向那一半——本站的權重完全傳不過去，
鏡像站等於以全新網域裸上線。站長 2026-08-15 裁示補上回指；「零改動」指的是鏡像產線
不可寫它的唯讀來源 clone，本站功能經本站自己的 repo 上線，兩者不衝突。

第二個坑：本站**沒有任何資料**能判斷「某篇文章在哪些語版存在」——鏡像站只搬了
約四分之一的文章（規則表逐篇裁決），瞎掛不存在的語版網址同樣讓整組宣告失效。

## 解法（怎麼修 + 現在怎麼維持）

- 對照表 `src/data/mirror-alternates.json`（`{ [slug]: [{hreflang, href}…] }`）由
  **appi.news-mirror 產線在部署後自動同步**（該 repo 的
  `scripts/sync-hreflang-to-publisher.mjs`：掃鏡像內容 frontmatter → 有差異才
  commit＋push 到本 repo）。本站的排程部署（每 15 分鐘查變動）自動撿起。**不要手改
  這個檔**，下一輪同步會蓋掉；表的口徑問題去鏡像 repo 修。
- `SEOHead.astro` 渲染：文章頁查得到鏡像版才輸出，並依 Google 要求補
  `hreflang="zh-Hant"` 的自我參照；noindex 頁不輸出。
- kid.appi.news **刻意不在表裡**：它與本站同為 zh-Hant，hreflang 沒有「閱讀難度」
  這個維度，硬掛是錯誤訊號（鏡像 repo 的 PLAN.md 決策表已定案）。

## 怎麼避免重犯 / 相關

- 跨站 SEO 訊號（hreflang、canonical、sitemap 互列）都是成對協定，**只做得了自己
  這一半的功能等於沒做**——規劃時就要把「對方那一半怎麼上線」當成同一件事的範圍。
- 對照資料的所有權歸產生內容的那一端（鏡像 repo 知道自己搬了哪些），消費端只讀。
- 鏡像站那邊的機制與三條 hreflang 規則：`appi.news-mirror/src/utils/hreflang.ts` 檔頭。
