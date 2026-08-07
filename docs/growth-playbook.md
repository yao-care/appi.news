# 成長工作簿：三關體檢與 B／A／C 三條路線

> **這份檔案的定位**：站台已經通過「Google 願意收錄並給自然搜尋流量」那一關，接下來要過三關。
> 本檔是**工作項目清單＋每項的 SOP**，寫給接手的人與 AI 代理照著做。
> 為什麼要分這三關、當初的數據長什麼樣＝[`docs/lessons/growth-three-gates.md`](./lessons/growth-three-gates.md)。
>
> 🔴 **本檔不寫任何會變的數字**（覆蓋率、篇數、分數、流量）。所有現況一律跑指令查，指令就寫在下面。
> 規則與門檻（例如「內鏈至少 2 條」）是規範不是現況，才寫死。

## 目標（站長 2026-08-07 裁示）

**月 2 萬瀏覽（pageviews／月）。** 換算成可以每天對照的門檻：

- 日均 **≈ 660 PV**，週 **≈ 4,600 PV**。
- 拆成兩個乘數：**sessions × PV/session**。B 路線推的是後者（站內導流），A 路線推的是前者（搜尋點擊）。
  只推其中一個要吃下的倍數會很難看，兩個一起推才划算。

現況與距離目標多遠，一律跑 `pnpm growth:audit`／`node scripts/weekly-data.mjs` 現算，**本檔不寫當前數字**。

## 0. 一分鐘上手（session 被 clear 之後從這裡開始）

```bash
cd /root/appi.news
pnpm growth:backlog          # 還剩多少沒做 + 下一批該做哪 10 篇（先跑這個就夠）
pnpm growth:audit            # 三關現況＋世代分析（GA4＋GSC 實跑，禁憑記憶）
pnpm growth:lint:all         # 存量覆蓋率盤點（零內鏈幾篇、topics 空幾篇…）
```

看完上面的輸出，再回來讀 §2 決定這一輪要推哪一條路線。**不要憑記憶報數字。**

### 進度追蹤與提醒（站長 2026-08-07 裁示：分批做，沒做完要定期提醒）

存量工作短期不做不會壞，全靠人記必定無限延後，所以做成機制：

- **每週一台北 09:00**，`scripts/cron/growth-backlog.sh` 自動跑 `growth-backlog.mjs` 發一則到 Slack 作者群，內容＝各項還剩幾篇、**和上週相比做掉幾篇**、下一批建議做哪 10 篇。純資料不喚 Claude，不吃額度。
- **下一批怎麼挑**：拿 GSC「有曝光但 0 點擊」名單 ∩「零內鏈」，依曝光量由高到低——同時吃到 B2 與 A1 兩份效益。取不到 GSC 就退回純 lint 排序。
- **快照存 `~/.config/appi-news/growth-backlog.json`**，不進 repo（發佈端每次產文會 reset 到 origin/main，放 repo 會被洗掉）。
- 進度數字一律現算，**不寫進本檔**。

## 1. 三關的定義與判準

| 關卡 | 問題 | 過關判準（跑 `pnpm growth:audit` 對照） |
|---|---|---|
| 第一關（已過） | Google 願不願意收錄並給自然搜尋流量 | GSC 有曝光頁數與點擊持續存在 |
| **關卡 1** | 流量是否由**大量頁面共同帶動** | 文章頁 PV 成長的同時，top1／top10／top20 集中度**下降**，且「≥10PV 的腰部頁數」增加。集中度升高＝單篇爆紅撐盤，不算過。 |
| **關卡 2** | 使用者是否開始**回訪與搜尋品牌** | 回訪 users **佔比**上升（不是人數上升——新客灌進來時人數會跟著漲但佔比會掉），且 GSC 品牌 query 的曝光／點擊有可辨識的量。 |
| **關卡 3** | 流量能否**連續 3–6 個月維持成長** | 週線連續上升，且**世代分析裡「舊文 PV」自己在長**。只有新文在長＝成長靠一直發新文撐，一停產就塌。 |

判讀陷阱（每次看數據都會踩）：

- **窗尾一律取到昨天**。GA4 當日資料未定案、GSC 延遲 2–3 天，把今天算進去會看起來像雪崩。`growth-audit` 已經處理。
- **未滿七天的那一週不能拿來比**。`growth-audit` 會在該列標 `(N天)`。
- **回訪看比例、品牌看絕對量**。這兩個指標的判準方向相反，不要混著看。

## 2. 三條路線：B → A → C

三條路線解的是不同關卡，**不是照順序做完才做下一個**——B 最便宜先啟動，A 是主戰場，C 最慢所以要最早開始鋪。

| 路線 | 解哪一關 | 一句話 |
|---|---|---|
| **B. 站內導流** | 關卡 1 的 PV 深度 | 把「一次只看一頁就走」變成「一次看兩三頁」，零新內容成本 |
| **A. 存量頁升級** | 關卡 1 的廣度＋總流量 | 有曝光但 0 點擊的那批頁，改標題／description／開頭把點擊吃回來 |
| **C. 回訪資產** | 關卡 2（唯一解） | 給讀者「下次還會回來」的理由與管道；B 和 A 都救不到這一關 |

---

## 路線 B：站內導流

**現況怎麼查**：`pnpm growth:lint:all`（零內鏈幾篇、內鏈全在後段幾篇、topics/column 皆空幾篇）。

### B1. 新文一律內建內鏈（✅ 已完成，維持即可）

所有產線的起草 prompt 都已注入 `GROWTH_PROMPT`（正本＝`scripts/lib/growth-prompt.mjs`），寫作當下就要求：內鏈 ≥2 條、至少 1 條在前三分之一、只能連查證存在的 slug、判斷 `topics`／`column`。
產線寫完會自動跑一次 report-only 的 `growth-lint`，結果印在 cron log。

- 看規則內容：`node -e 'import("./scripts/lib/growth-prompt.mjs").then(m=>console.log(m.GROWTH_PROMPT))'`
- 看哪些線接上了：見本檔 §產線接線點
- **完成判準**：新產出的文章跑 `node scripts/growth-lint.mjs <file>` 不出現 `G1-none`。

### B2. 存量補內鏈（機械回填已跑過一輪，殘餘靠新文章補厚）

**先跑工具，別從手工開始**：`node scripts/growth-backfill-links.mjs`（dry-run）→ `--write`。
相關度用 TF-IDF 餘弦，找不到夠相關的就留白不硬連；判準與踩過的坑見
[`lessons/mechanical-backfill-traps.md`](./lessons/mechanical-backfill-traps.md)。
工具跑完仍是零內鏈的，代表站上沒有同題文章，**只能靠新文章把叢集補厚**，不要手動硬連。

**逐篇手改的 SOP**（工具挑不到、但你判斷該連時）：

1. `node scripts/growth-lint.mjs --all --worst 30` 取出待補清單。
2. 逐篇處理：先 `grep -rl "<該篇主題關鍵詞>" src/content/articles/ | head` 找出可連的姊妹文，`head -8` 確認題目扣得上。
3. 在**前三分之一**插入至少 1 條、全篇至少 2 條 `[有資訊量的錨文字](/articles/<slug>/)`。
4. `node scripts/growth-lint.mjs <改過的檔案>` 確認 `G1-*` 清掉。
5. 一批做完跑 `pnpm build && pnpm check:links`（**連到不存在的 slug 會擋部署**），綠了才 commit。

**節奏建議**：一次 20–30 篇為一批，優先處理 `growth-audit` 關卡 1 那份「有曝光但 0 點擊」名單裡也出現的文章（同時吃到 A 的效益）。

### B3. 補 `topics` / `column`（已自動化，每週三跑）

`scripts/topic-hub-radar.mjs` ＋ `scripts/cron/topic-hub-radar.sh`：每週三台北 09:00 偵測
「夠厚卻還沒有中樞」的群，自動開一個中樞並回填成員文章。門檻、面向標籤排除、
id 對照表（`scripts/lib/topic-hub-ids.json`，**id 進網址、上線後不能改**）見該檔檔頭。
手動補單篇時照下面的 SOP。

#### 手動補的 SOP

`relatedArticles()`（`src/utils/content.ts`）的權重是：同 topic 每個 **×3** ＞ 同 column **+3** ＞ 同分類 **+2** ＞ 同子分類 **+1** ＞ 每個共同 tag **+1**。
兩個欄位都空的文章，「延伸閱讀」只能退回「同分類最新文」，等於推薦不相干的東西。

**SOP**：`ls src/content/topics/` 看現有叢集 → 對 `growth-lint` 標 `G2-cluster` 的文章逐篇判斷能不能歸入 → 能就補 frontmatter，不能就留空。**不要自創不存在的 topic id**（會產生壞連結）。
某個主題叢集夠厚但沒有對應 topic 檔時，才在 `src/content/topics/` 新增（schema 見 `src/content.config.ts`）。

### B4. 延伸閱讀的版位（站長 2026-08-07 裁示：先不動，兩週後看數字再決定）

目前「延伸閱讀」只出現在文末（`src/pages/articles/[slug].astro`），跳出率高的讀者根本滑不到。可選作法：文中插入（讀到一半的段落間）、桌機側欄常駐、讀完浮出推薦條——**每一種都會動到版面與效能，動手前必須先讀 [`PERFORMANCE.md`](../PERFORMANCE.md)，且屬於「要先問站長」的改動。**

**現行決策**：先不動版位，改用零風險的 B1（新文內建內鏈，已上線）＋B2／B3（存量補內鏈與 topics）推同一個指標，**2026-08-21 之後**跑 `pnpm growth:audit` 對照 PV/session：

- 有往上動 → 版位不必改，繼續做 B2／B3。
- 沒動 → 代表內文內鏈救不到，再回來評估文中插入版位（那時才需要站長二次裁示）。

基準值＝2026-08-07 當時的量測，記在 [`lessons/growth-three-gates.md`](./lessons/growth-three-gates.md)（歷史證據，不是現況）。

---

## 路線 A：存量頁升級（有曝光但 0 點擊）

**現況怎麼查**：`node scripts/growth-audit.mjs --gate1`，看「有曝光但 0 點擊」的頁數與前 10 名。

那批頁的意義：Google 已經願意把它排進結果頁（曝光），但讀者看到標題不想點。這是**已經付出的成本沒有回收**，比寫新文章便宜得多。

### A1. 每輪挑 10 篇升級（可重複執行的主迴圈）

**SOP**：

1. `node scripts/growth-audit.mjs --gate1` 取「曝光最多卻 0 點擊」名單。
2. 對每一篇，先查它實際靠什麼字被搜到：
   ```bash
   node -e 'import("./scripts/lib/google-data.mjs").then(async m=>{
     const {GSC_SCOPE,GSC_SA_KEY_PATH}=await import("./scripts/lib/report-config.mjs");
     const sa=m.loadServiceAccount(GSC_SA_KEY_PATH);
     const t=await m.getAccessToken({clientEmail:sa.clientEmail,privateKey:sa.privateKey,scopes:[GSC_SCOPE]});
     const r=await m.gscQuery({token:t,body:{startDate:"2026-01-01",endDate:"2030-01-01",dimensions:["query"],rowLimit:25,
       dimensionFilterGroups:[{filters:[{dimension:"page",operator:"equals",expression:"https://appi.news/articles/<slug>/"}]}]}});
     (r.rows||[]).forEach(x=>console.log(x.impressions,x.clicks,x.position.toFixed(1),x.keys[0]));})'
   ```
   （日期範圍自己改成最近 3 個月；這段沒有包成指令是因為每次要看的頁不同。）
3. 依查到的真實搜尋詞改 **title**（把那個詞放前段、全形 30 字內）與 **description**（60–160 字、講讀完能拿到什麼）。
4. 開頭前兩句改成直接回答那個搜尋意圖，不要鋪陳。
5. 順手補 B2 的內鏈與 B3 的 topics。
6. `node scripts/growth-lint.mjs <檔案>` → `pnpm build && pnpm check:links` → commit。
7. **改完記日期**：升級屬於「改既有檔」，`updatedDate` 要設成當天，Google 才看得出這頁更新過。

**驗收**：升級後等 2–4 週，重跑 `node scripts/growth-audit.mjs --gate1`，看那幾頁有沒有從「0 點擊」名單消失。**不要改完隔天就看**，排名反應要時間。

### A2. 標題長度的存量清理

`pnpm growth:lint:all` 會報 title 過長的篇數。這批不必全改，**只改「有曝光」的那些**（沒曝光的頁改標題不會有效果，白工）。兩份名單交集才是工作清單。

---

### B5. 常見問題（✅ 已完成，維持即可）

`scripts/backfill-faq.mjs` 已把存量補到 0 篇缺漏。新文章由產線 prompt 負責；
若日後又出現缺漏，直接重跑（冪等）。**生成內容會撞內容 gate 的兩種撞法**
（禁連結 → 模糊引用；拔高措辭）見
[`lessons/mechanical-backfill-traps.md`](./lessons/mechanical-backfill-traps.md) §四。

---

## 路線 C：回訪資產（關卡 2 的唯一解）

**現況怎麼查**：`node scripts/growth-audit.mjs --gate2`。

B 和 A 都只影響「這一次來的人多看幾頁」，**不會讓人回來**。這條線要處理的是「為什麼要再來」與「怎麼回得來」，而且見效最慢，所以要最早開始鋪。

### C1. 系列化：把單篇變成「還有下一集」

把重複性的產線內容明確歸進 `column`／`topics`，並在文末寫出下一集的預告或系列入口。已有系列可查：`ls src/content/columns/`、`ls src/content/topics/`。
這一項與 B3 共用同一批工作，做 B3 時順手完成。

### C2. 訂閱管道（需要站長裁示）

目前站上有 RSS。要不要做電子報／LINE／Threads 定期推送，屬於**新產品方向**，依專案規則要先問站長再動手。
可查的既有非搜尋入口：`node scripts/growth-audit.mjs --gate2` 之外，用 `node scripts/weekly-data.mjs` 看 `trafficHealth.sources` 有哪些社群來源已經在帶人。

### C3. 品牌記憶點

品牌搜尋是滯後指標，靠的是「讀者記得是誰寫的」。可做的事：作者頁與專欄頁的完整度、文章署名與專業審閱者揭露（`src/config/reviewers.ts`）。
**這一項沒有機械判準，不要為了衝指標亂做。** 每季用 `--gate2` 回頭看品牌 query 有沒有從零變成有。

---

## 產線接線點（新增產線時務必一併接上）

`GROWTH_PROMPT` 已注入下列起草 prompt 建構點；接線方式＝在 prompt 陣列裡放 `GROWTH_PROMPT`（與 `RISKS_PROMPT` 同層）：

```bash
grep -rn "GROWTH_PROMPT" scripts/ --include=*.mjs | grep -v "growth-prompt.mjs"
```

report-only 的產線自檢（寫完印 `growth-lint` 結果到 cron log）接在各線 `check-tags` 旁：

```bash
grep -rn "growth-lint.mjs" scripts/ --include=*.mjs
```

走 `newsroom-write.mjs` 的線（Slack 按鈕、論壇雷達、`/admin` 寫作任務、連假優惠、颱風線…）**自動繼承**，不必另外接。

## 這份工作簿怎麼跨 session 使用

工作進度**不記在文件裡**（會過期），而是隨時可從指令重算：

- 「B 做到哪了」→ `pnpm growth:lint:all` 的零內鏈／topics 空白篇數在降就是有進展。
- 「A 做到哪了」→ `node scripts/growth-audit.mjs --gate1` 的「有曝光但 0 點擊」頁數在降。
- 「C 有沒有動靜」→ `node scripts/growth-audit.mjs --gate2` 的回訪佔比與品牌 query。
- 「整體有沒有真的在長」→ `node scripts/growth-audit.mjs --gate3 --cohort`，重點看**舊文 PV** 那一列。
