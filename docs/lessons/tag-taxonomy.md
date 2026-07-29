# tags 沒有受控詞彙表：481 篇長出 1,883 個標籤，85.9% 只出現一次

> 摘要：`tags` 是全站唯一沒做 enum 約束的分類欄位，五條產線各自即興發明，標籤頁全面碎片化失去 hub 功能 ｜ 範圍：SEO / 內容 schema / 自動化 ｜ 狀態：已解決 ｜ 日期：2026-07-28

## 問題（症狀）

站台定位是「亞太專業觀點」，但 GSC 近 90 天（2026-04-28～07-27）查不到任何一次亞太相關曝光：

```
全站 14,717 曝光 / 293 點擊 / 平均排名 15.7
query contains 亞太 / asia / apac / 東南亞 / 日本 / 韓國 → 全部 0 rows, 0 曝光
```

追查標籤體系時發現更根本的問題。481 篇文章的盤點：

```
tag 出現總次數 2,537     unique tag 1,883     每篇平均 5.27
只出現 1 次的 tag：1,618 / 1,883 = 85.9%
出現 ≥2 次（達 TAG_INDEX_MIN 可索引門檻）：265 個
```

後果是 1,883 個標籤頁被 build 出來，其中 1,618 個因為只有一篇文章而 noindex，等於死頁；而每篇文章底部的 `TagList` 都在往這些死頁送內鏈。標籤本來要扮演主題 hub，實際上完全沒發揮作用。同一個實體散成一堆變體：

```
臺北市(16) ⇄ 台北市(3)
醫療 AI(3) ⇄ 醫療AI(3) ⇄ AI醫療(5) ⇄ AI 醫療(1)
保健食品(7) ← 保健食品聰明選(6)      健檢報告(6) ← 看懂健檢報告(5)
「AI」底下 150+ 個變體、「醫療」48 個、「台灣」50 個
```

## 原因（根因）

三層都沒守，缺任何一層都不會爛到這個程度。

**第一層：schema 對 `tags` 完全沒約束，而同一個檔案對 `category` 有。**

`src/content.config.ts` 裡這兩行只差一個 enum：

```ts
category: z.enum(CATEGORY_SLUGS),        // 受控詞彙表，違反即 build fail
tags: z.array(z.string()).default([]),   // 任何字串都合法
```

`src/config/categories.ts` 檔頭本來就寫著「文章 frontmatter 的 category 必須是這裡的 slug 之一；content.config.ts 會用 CATEGORY_SLUGS 做型別約束」。分類做對了，標籤沒做。所以分類三年來穩定是那 7 個，標籤長到 1,883 個。

**第二層：產線指令只說「要填」，沒說「填什麼」。**

這裡有一組很乾淨的對照。三條產線對 tags 的原始指示：

| 產線 | 原始指示 | 結果 |
|---|---|---|
| `newsroom/SKILL.md` | 「每篇務必填 `tags`（餵 keywords 與 RSS／llms 索引）」 | 只要求存在 → 碎片化 |
| `lifestyle-video/SKILL.md` | 「tags 帶主題詞」 | 完全開放 → 碎片化 |
| `lifestyle-civic/SKILL.md` | 「tags 帶『便民措施』『市政服務』與涵蓋縣市」 | **有指定固定詞 → 零碎片** |

唯一被指定詞彙的產線，就是唯一沒爛的產線（「便民措施」7 次、「市政服務」7 次、縣市名穩定重複）。這不是巧合，是機制。

**第三層：模型每次都是獨立 session，看不到前 480 篇用過什麼。**

它只能就本篇內容生成「看起來合理的關鍵詞」。單看每一篇，「膽固醇」「泌尿科」「AI 問診風險」都是好標籤，沒有任何一次判斷是錯的。錯的是沒有機制告訴它「站上已經有『醫療AI』這個 hub，掛上去就好」。每次局部最佳，累積成全域災難。

**放大器：一個欄位同時服務四個需求相反的消費端。**

`tags` 同時餵標籤頁、`keywords` meta、RSS `categories`、llms 索引。「SEO 關鍵詞」要具體，「分類 hub」要收斂，兩者方向相反。沒人區分，模型自然往關鍵詞那邊倒。這也是為什麼 1,883 個標籤裡絕大多數單看都不算亂寫。

## 解法（怎麼修 + 現在怎麼維持）

照 `category` 的模式，把標籤做成受控詞彙表，四層：

| 層 | 做法 | 保證強度 |
|---|---|---|
| **L1 schema enum** | `src/config/tags.ts` 是正本；`content.config.ts` 用 `z.array(z.enum(TAG_VOCABULARY)).max(MAX_TAGS_PER_ARTICLE)` | **100%**：表外標籤直接 content collection 驗證失敗，`pnpm build` fail、CI 擋部署 |
| **L2 產線自檢** | `scripts/check-tags.mjs`，七條產線寫檔後 `spawnSync` 呼叫（比照既有 `check-content.mjs`） | 讓產線當場發現並就地修正／丟棄該篇，不拖到 CI 才炸 |
| **L3 詞彙表餵給模型** | 各 SKILL.md 與產線 prompt 改成「先讀 `src/config/tags.ts`，只能從裡面挑，挑不到就少掛」 | 不保證，但把撞牆機率壓低 |
| **L4 擴充管道** | `tags.ts` 檔頭寫明新增流程（要能預期累積 3 篇以上才值得開） | 讓詞彙表能演進，不變成枷鎖 |

L1 是那個 100%，它之所以是 100%，正因為不依賴任何人記得任何事。L2/L3/L4 不是裝飾，是讓 L1 能用而不會半夜擋死產線的必要配套。

**存量遷移**：`scripts/migrate-tags.mjs`（保留在 repo 供追溯與日後再次盤整）。以「受控標籤 → 命中片語」規則把 2,537 個標籤實例映射進詞彙表，7 篇只掛泛稱標籤的舊 WordPress 文用逐檔 `OVERRIDES` 指定。結果：

```
unique tag  1,883 → 179     每篇平均 5.27 → 3.37
只有 1 篇的死頁 1,618 → 13（且都是會長大的 hub，已由 isIndexableTag 自動 noindex）
標籤中位數篇數 1 → 7
```

`/tags` 索引頁改為依 `TAG_GROUPS` 分八區呈現（健康與醫療／科技與 AI／永續與能源／財經與產業／生活與社會／縣市／國際／運動）。

## 怎麼避免重犯 / 相關

- **新增分類性欄位時，先問「這個欄位有沒有 enum 約束」**。`category` 有、`tags` 沒有，差別只是當初少寫一行，代價是三年的碎片化。任何「模型會填的分類欄位」都該有受控詞彙表。
- **不要靠 SKILL.md 的叮嚀當 gate**。本 repo 的既有共識就是機械守門（`check-design.mjs`、`check-content.mjs`），標籤是唯一漏掉這層的欄位。指令層只能降低機率，給不了 100%。
- **fail-open 與 fail-closed 的分界**：`docs/automation-invariants.md` 的「閘門 fail-open」講的是**閘門自己故障**要放行（故障不等於模型的判斷）。標籤不合法是**模型的判斷錯誤**，該 fail-closed 硬擋。`check-tags.mjs` 兩者都實作了——解析不到 `tags.ts` 就 exit 0 放行，標籤不在表內就 exit 1 擋下。
- **加標籤前先問會不會累積到 3 篇**。詞彙表的價值在收斂，每多開一個近義詞就少一個 hub。流程見 `src/config/tags.ts` 檔頭。
- 相關：[topical-authority-concentration.md](./topical-authority-concentration.md)（主題權威靠收斂賺不是多產堆，同一個病理的另一面）、[duplicate-topic-gate.md](./duplicate-topic-gate.md)（去重該下在寫入端不是選題端，同樣是「gate 位置決定有沒有效」）。

## 2026-07-29 追記：L1 擋得住，但擋的位置是「全站部署」——跨 repo 的寫入端漏了

上面那張四層表有個沒寫明的前提：**L2 產線自檢覆蓋所有寫入端**。實際上不是。

2026-07-28（`appi-news-450` 熊本強震）與 07-29（`appi-news-461` 桌球世團賽，帶了
`世團賽／台灣桌球隊／銅牌／林昀儒／世界桌球團體錦標賽` 五個表外值）兩度讓 `main` 無法建置，
連續兩次 deploy failure，期間**全站無法發佈**，都要人工改標籤才解除。

**原因**：這兩篇不是本 repo 任何一條 `.mjs` 產線寫的，而是同機的另一個專案
`/root/agent.writer`（pm2 `agent-writer`）直推進來的——它已累計 231 個 commit
（commit body 帶 `from agent.writer`）。它的 `server/lib/astro-publish.ts` 在
`buildAppiMdx()` 裡把 Writer 自由產生的 SEO `keywords` **原樣併進** appi.news 的 `tags`：

```ts
const tagsCombined = Array.from(new Set([...(astro.tags ?? []), ...parsed.frontmatter.keywords]));
```

`keywords`（自由關鍵詞）與 `tags`（受控主題 hub）是性質完全不同的兩個欄位，直接對接必然出事。
L2 的七條產線自檢一條都碰不到它。

**這裡的 L1 不是「擋住壞資料」，是「擋住整個網站」。** `z.enum` 在 content collection 驗證期失敗，
炸掉的是 `pnpm build` 本身，不是單篇。fail-closed 的代價落在全站可用性上——這是設計時沒算到的。

**處置（在 agent.writer 端，2026-07-29）**：

1. **發佈端硬過濾**（`server/lib/appi-tags.ts`）：`filterAppiTags()` 把候選過成表內合法值＋套 8 個上限。
   詞彙表**執行期讀本 repo 的 `src/config/tags.ts`**，不在對面複製一份——對照組是同目錄的
   `appi-categories.ts`，那份是複製的、靠檔頭「⚠️ 兩邊都要改」的人工紀律維持；標籤有 179 個且增修頻繁，
   複製必然漂移。路徑可用 `APPI_REPO` 覆寫。
   **讀不到詞彙表時回傳空陣列，不是原樣放行**——`tags` 預設就是 `[]`，空的頂多少一組主題連結（事後可補），
   放行未驗證的值則會再次打爆整站部署。這一格刻意 fail-closed，與上面那條 fail-open 分界並不矛盾：
   分界看的是「代價落在誰身上」，這裡的代價是全站。
2. **寫作端指引**（`renderTagGuidance()`）：只過濾會把訊號整批丟掉（461 七個值只剩兩個）。
   把詞彙表注入「文章需求」文件，Writer 才挑得到對的標籤，並明寫「挑不到就少掛、不要填人名／賽事名／獎牌名／型號」。

**教訓**：**受控欄位的 gate 要下在「所有寫入端」，而盤點寫入端不能只看自己 repo。**
本 repo 的七條產線是完整的，但寫進 `src/content/articles/` 的來源有八個——第八個在另一個 repo、
另一個 pm2 process、另一套 schema 對接邏輯。`docs/lessons/article-draft-consumer.md` 當時記的
「agent.writer 跟 appi.news 無關」在它自己的脈絡（誰撿 `article-draft`）成立，但被後人讀成
「不必納入盤點」，剛好蓋住了這個破口。
