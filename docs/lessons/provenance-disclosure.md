# 做了審閱卻沒人看得見：570/574 篇的產製資訊在前台是隱形的

> 摘要：`reviewedBy` / `factCheckedBy` / `editor` 三個欄位存在 schema 兩年、使用數 0，而 `DISCLOSURES` 把 editorial/author 的揭露設成 `null`，等於七成文章頁面上查不到任何產製或審閱資訊 ｜ 範圍：內容信任 / E-E-A-T / 揭露 ｜ 狀態：已解決 ｜ 日期：2026-08-01

## 問題（症狀）

盤點 574 篇文章時查到三組數字：

- `expertNote` 0 篇、`reviewedBy` 0 篇、`factCheckedBy` 0 篇、`editor` 0 篇。schema 有欄位，內容全空。
- `sourceType` 為 `editorial` 或 `author` 的有 570 篇。這兩種在 `src/config/disclaimers.ts` 的 `DISCLOSURES` 預設值是 `null`，**前台不顯示任何揭露框**。
- 有自訂 `disclosure` 的 226 篇，其中 124 篇提到 AI。也就是全站只有 22% 的文章在頁面上交代了產製方式。

同時，站上高風險分類**實際上是有具名專業人員把關的**（健康類由中國醫藥大學中醫學系與醫學系雙主修的黃子彥、財經由 IARFC 認證財務規劃師吳芳圳等）。這道工序做了、付了成本，但讀者在頁面上看不到。

`AuthorBioBox` 看似補上了這塊，實際只覆蓋 32%：574 篇裡 392 篇（68%）的 `author` 是 `appi-editorial`，那個框只顯示「APPI 編輯部」這個組織名，沒有具名個人與資歷。而且缺口正好落在自動產線那幾類（international 75/75、lifestyle 84/85、focus 55/58 全是編輯部署名）。

## 原因（根因）

不是漏掉，是一個當時合理、後來過期的**設計決定**，寫在 `DisclosureBox.astro` 的註解裡：

```
// AI 為內部工具，不在前台揭露。
```

搭配 `DISCLOSURES` 裡的註解「一般編輯部與作者內容前台不另外顯示揭露框，避免干擾閱讀」。當時的分界線是：**只有「這篇不是我們自己產的」才需要警示讀者**（新聞稿、贊助、通訊社），自產內容靠署名承擔即可。AI 被歸類成跟拼字檢查、CMS 同一層的工具，而沒有人會揭露「本文使用 Word 撰寫」。

這條線在 2026 已經站不住：**拼字檢查不生產主張，LLM 生產主張**。而 `reviewedBy` 之所以 0 篇，是因為它從來沒有前台出口——沒有任何元件讀它，填了也看不到，於是七條產線沒有一條會寫。**沒有出口的欄位不會有人填**，這是比「忘記填」更根本的原因。

## 解法（怎麼修 + 現在怎麼維持）

1. **`src/config/reviewers.ts`＝分類 → 專業審閱者的單一事實來源**。`reviewedBy`（專業判斷：說法對不對）與 `factCheckedBy`（事實查核：數字、引述、連結對不對，一律歸編輯部）語意分開，不是同一件事的兩個欄位。
2. **回填 574 篇**（`scripts/backfill-reviewers.mjs`，一次性）。
3. **渲染時 frontmatter 優先、沒填就退回分類對照表**。這是關鍵：自動產線新產出的文章不必逐支腳本改就會帶到審閱者，避免七條產線各自漏填重演同樣的坑。
4. **`DISCLOSURES` 的 editorial / author / contributor / expert 由 `null` 改為有值**，句型用 `{REVIEW}` 佔位符讓 `DisclosureBox` 插入「，經○○○專業審閱」並連到作者頁。審閱者就是署名作者本人時不重複顯示（資歷已由 `AuthorBioBox` 呈現）。
5. **JSON-LD 補 `reviewedBy`**（Person，帶 jobTitle 與作者頁 `@id`）與 `contributor`（查核方）。schema.org 沒有專屬的 factCheckedBy 欄位，用 `contributor` 表達，與 `reviewedBy` 分開。

揭露句的重點刻意放在**產製流程與具名審閱者**，不是「用了 AI」。單講 AI 在 2026 是負面訊號；「AI 起草＋具名專業人員審閱」才是站上真正有、而同類自動內容站拿不出來的東西。

## 怎麼避免重犯 / 相關

- **schema 加欄位時，同一回合就要有前台或機器可讀的出口**，否則那個欄位注定是 0。`expertNote`（0 篇）、`risksAndLimits`（7 篇）目前仍是這個狀態，是下一批要處理的。
- **新增分類時務必同步補 `CATEGORY_REVIEWER` 一列**，否則該分類文章不會顯示審閱者，而且不會有任何錯誤提醒。
- 判斷「某道工序有沒有做」不能只看流程有沒有跑，要看**讀者或機器能不能查證**。這次的病灶就是工序做了但無跡可循。
