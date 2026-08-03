# 批次產線的三個坑：draft 不產頁、slug 被 markdown 污染、孤兒稿繞過 gate

> 摘要：一次跑 27 篇的批次線接連踩三個坑，共同點都是「失敗訊號長得像成功」——draft 文章沒有頁面卻以為有、解析失敗被當成沒產出、檔案存在被當成過了關卡。｜ 範圍：自動產線 / 批次 / 內容 gate ｜ 狀態：已解決 ｜ 日期：2026-08-03

## 背景

GSC 跨窗常青訊號顯示本站最大的未吃需求在健康類，但既有產線沒有一條負責健康常青題（tech-desk 會正確跳過、health-days 是日期驅動）。新增急性症狀居家處置線補這個缺口，題目表 27 題，一次批次跑完。過程接連踩到三個坑，都值得記。

## 坑一：`status: draft` 不會產出任何頁面

**問題**：內容涉及居家醫療處置，原本設計成 `status: draft` 讓醫師先審再上線，並打算把預覽連結給醫師看。

**原因**：`[slug].astro` 的 `getStaticPaths` 只涵蓋兩種文章：

```js
const published = await getPublishedArticles();       // isPublic() 排除 draft
const previews  = await getScheduledPreviewArticles(); // 明確排除 draft
```

draft 兩邊都不在，**整篇不會被建出來**，只有 repo 裡的 markdown 檔。要給人審閱的連結會是 404。

**解法**：要「產得出頁面但不公開」，用 `status: "scheduled"` ＋ 未來的 `publishDate`，那會產出 noindex、不進 sitemap（`astro.config.mjs` 的 `previewPaths` 排除）、站內無連結指到的預覽頁。**但 publishDate 要設得夠遠**（例如 2099），否則到期後 `deploy.yml` 的 6 小時 cron 會把它轉正。

**怎麼避免重犯**：`draft` 的語意是「不存在」不是「不公開」。挑狀態前先問「這個狀態產不產得出頁面」，不要從名字推論。

## 坑二：模型把 slug 包在 markdown 裝飾裡，解析器照單全收

**問題**：批次首 11 題有 4 題報失敗，查 log 才發現稿子其實都寫好了。

**原因**：模型輸出的結果行長這樣：

```
ACUTE_RESULT=NEW｜`acute-low-back-48h`      ← 反引號
ACUTE_RESULT=NEW｜**doms-after-exercise**   ← 粗體星號
```

解析器直接取分隔符後的字串，於是 slug 變成 `` `acute-low-back-48h` ``，拿去組路徑找不到檔案 → 判定「缺圖檔」剔除。**剔除時的 `rmSync` 也指向那個錯路徑，稿子才僥倖沒被刪掉**——這是運氣，不是設計。

**解法**兩層：

1. `cleanSlug()` 洗掉前後的反引號、星號、引號、括號。
2. 更根本的保底：這條線是「指定題目」呼叫的，**slug 必然等於 `topic.key`，不必信模型那行字**。解析失敗或 slug 對不到檔案時，直接檢查 `src/content/articles/<topic.key>.md` 在不在，在就撿回。

第 2 點才是關鍵——實戰中 `choking-heimlich` 重跑時同樣沒吐出 `ACUTE_RESULT`，就是靠這道網接住的。

**怎麼避免重犯**：**解析失敗 ≠ 沒產出**。凡是「模型自己回報結果」的地方，都要有一條不依賴那個回報的事實查核路徑。

## 坑三：孤兒稿繞過逐篇 gate，一路混到 build 才炸

**問題**：批次跑到最後的整批 build，`check:links` 報 `heat-illness-cooling` 引用 5 張不存在的圖，**26 篇一起卡住不能發**。

**原因**：兩件事疊加。

1. 那個 worker 的模型沒吐出 `ACUTE_RESULT`（坑二修復前），runner 舊邏輯 `return null` 直接結束，於是**該篇的逐篇 gate 從未執行**，一份沒有配圖的 `.md` 留在磁碟上。
2. 批次腳本階段一的成功標記只是 `[ -f 檔案 ]`——**檔案存在不代表過了關卡**，所以它還報成功。

**解法**：批次腳本補「階段一.五：孤兒稿檢查」，在進 build 之前**獨立**掃過每一篇新稿的配圖是否齊全，缺圖就地移除並留在待寫佇列。這道網不依賴階段一的回報，不管未來是什麼原因造成孤兒稿都會被攔下。

**怎麼避免重犯**：批次的整批 build 是全有全無，**一顆老鼠屎會擋住整批**。階段之間要有獨立的守門，不要讓上一階段的自我回報決定下一階段吃到什麼。

## 附帶：合規要機械檢查，不要人工抽驗

這條線的內容涉及醫療處置，「build 過了」只代表格式沒錯，不代表寫作界線（`BOUNDARY`）有守住。`scripts/acute-care-audit.mjs` 對每篇驗七項：就醫警訊存在且在前三分之一、無藥物劑量、無個別診斷、未暗示可取代就醫、有提及特殊族群、外部來源 ≥2 條、有醫療免責語。

規則要避開誤判：劑量檢查刻意排除 `mg/dL` 等**濃度**單位——低血糖那篇寫「血糖低於 70 mg/dl」是判斷閾值不是用藥指示，首跑就是被這個誤判成唯一一筆不合規。處置時間（10 到 15 分鐘）與溶液濃度（0.9% 生理食鹽水）同樣不攔。

## 相關

- `scripts/lib/acute-care.mjs`（`BOUNDARY` 寫作界線是這條線的安全核心）
- [auto-publish-pipeline-traps.md](./auto-publish-pipeline-traps.md)（同屬自動產線的失敗模式）
- [`docs/automation-invariants.md`](../automation-invariants.md)「成功不等於 exit code」——本篇三個坑都是它的變形
