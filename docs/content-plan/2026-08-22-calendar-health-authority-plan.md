# 工作計劃書：年曆佈滿 × 台灣生活年曆權威 × AI×醫療健康權威（2026-08-22）

> **本檔性質**：時點型工作計劃（非 SOT），內含 2026-08-22 的快照數字，僅供對照當時起點，**現況一律跑本檔各節的驗收指令**。
> **執行者**：交給 codex（或任何 agent）逐工作包執行。動手前必讀本檔 §0 紅線。
> **戰略脈絡**：站方向定調為「資產化路線」：時效線照跑當獲客入口，每一波流量沉澱進常青存量；在「台灣生活年曆」與「AI×醫療健康」兩條車道建立可指名的權威。收入（聯盟、廣告、業配）是後續疊加，不在本計劃範圍。

---

## §0 執行紅線（每個工作包都適用，違反即停）

1. **先讀 repo 規則**：`/root/appi.news/CLAUDE.md` 全文，特別是「動手前驗證」「效能鐵則」「內容規範」「上線流程與紅線」。本檔不重複，衝突時以 CLAUDE.md 為準。
2. **產文一律走既有產線**，不得手寫文章繞過 gate：
   - 節慶成員文：走 `scripts/festival-radar.mjs`（吃 `scripts/lib/festival-days.mjs` 的 ideas）。
   - 健康紀念日文：走 `scripts/health-days.mjs` 既有排程，不必另外動。
   - 急性症狀衛教：往 `scripts/lib/acute-care.mjs` 的 `TOPICS` 加題後跑 `scripts/acute-care-batch.sh`。
   - 例外：topic hub（`src/content/topics/*.md`）是站內導覽頁，依既有 hub 檔案格式手寫可以，但要過 `pnpm build && pnpm check:links`。
3. **農曆與節氣日期禁止自行換算**，逐筆查證、來源寫進該筆的行內註解（`festival-days.mjs` 檔頭規矩）。查證用兩個以上獨立來源交叉。
4. **topic hub 的 id 進網址、上線後不可改**；新 hub 的 id 對照表在 `scripts/lib/topic-hub-ids.json`。
5. **標籤只能從 `src/config/tags.ts` 受控詞彙表挑**，挑不到就少掛，不發明近義詞。
6. commit 流程：在 `main` 上要改東西先開分支 → `pnpm build && pnpm check:links` 綠 → merge main → push → `gh workflow run deploy.yml` → 驗線上站。不停下來問「要不要 push」。
7. 本計劃**不改** cron、不改帳號模型設定、不動 seo-ops。發現需要動這些，停下來回報。

---

## §1 快照（2026-08-22 起點，僅供對照）

- 週流量：PV 6,426（8/15–8/21）、月 run rate 約 27.5k PV、PV/session 1.11（目標 1.35）。
- 已驗證套路：七夕 hub（5 篇成員文，週點擊 208、排名 6.7）、開學 hub（8 篇，點擊 100）、中元 hub（4 篇）。提前約 3 週佈局、當週收割，三度驗證有效。
- `FESTIVAL_DAYS` 僅 2 節點：重陽（2026-10-18）、冬至（2026-12-22）。**這就是最大缺口。**
- 中秋＋教師節已有 hub：`src/content/topics/mid-autumn-teachers-day-2026.md`。
- 健康紀念日年曆 51 筆（`scripts/lib/health-days.mjs`，自動產線已在跑）。
- 急性症狀衛教 27 題（`scripts/lib/acute-care.mjs`）。
- topic hub 共 38 個，其中健康類已有十餘個（cancer-screening、kidney-health、healthy-aging、digital-health-elderly-care、medical-ai-frontline、ai-medical-regulation…）。

---

## §2 工作包 A：把節慶年曆佈滿（資料層，優先度最高）

**目標**：`FESTIVAL_DAYS` 覆蓋未來 12 個月所有「台灣有真實搜尋需求」的民俗與生活節點，讓 festival-radar 的 21 天窗自動接手成員文佈局。

### A1. 節點缺口清單（逐節點新增進 `scripts/lib/festival-days.mjs`）

下表為候選節點。**「日期」欄除標明「固定國曆」者外一律待查證**，執行時逐筆查、來源寫進註解。優先序：P1 先做（未來 4 個月內、搜尋量大），P2 次之。

| 優先 | 節點 | 日期規則 | 備註 |
|---|---|---|---|
| P1 | 中秋節 2026 | 農曆八月十五，待查證 | hub 已存在（mid-autumn-teachers-day-2026），只補 `FESTIVAL_DAYS` 節點與缺的成員題（烤肉、柚子、月餅熱量、禁忌） |
| P1 | 雙十國慶＋連假 2026 | 固定國曆 10-10，連假天數待查人事行政總處 | 連假出遊、國慶活動/煙火在哪、補班補假 |
| P1 | 萬聖節 2026 | 固定國曆 10-31 | 親子裝扮、由來、台灣活動 |
| P1 | 立冬 2026 | 節氣，待查證 | 進補題與冬至互鏈，搜尋量大 |
| P1 | 聖誕節 2026 | 固定國曆 12-25 | 交換禮物、耶誕城/活動、聖誕大餐 |
| P1 | 跨年＋元旦 2027 | 固定國曆 12-31/01-01，連假規則待查 | 跨年晚會各縣市、日出景點、新年新制上路（新制題是常青金礦） |
| P1 | 尾牙季 2027 | 農曆十二月十六（頭牙對應日期一併查） | 尾牙拜拜、公司尾牙、刮刮樂 |
| P1 | 農曆春節 2027 | 除夕～初五逐日，待查證；連假天數待查人事行政總處 | 年度最大節點，成員題至少 5：紅包行情、拜拜流程、禁忌、連假行事曆、走春 |
| P1 | 元宵節 2027 | 農曆正月十五，待查證 | 燈會（台灣燈會主辦縣市要查）、湯圓元宵之別 |
| P2 | 西洋情人節 2027 | 固定國曆 02-14 | 餐廳、禮物、由來 |
| P2 | 二二八連假 2027 | 固定國曆，連假規則待查 | 連假出遊題 |
| P2 | 清明節 2027 | 國曆 04-04 或 04-05，待查證 | 掃墓流程、禁忌、連假 |
| P2 | 母親節 2027 | 五月第二個週日，換算後仍要查證 | 餐廳訂位、禮物 |
| P2 | 端午節 2027 | 農曆五月初五，待查證 | 粽子熱量、立蛋、連假 |
| P2 | 父親節 2027 | 固定國曆 08-08 | 台灣特有八八節 |
| P2 | 七夕 2027、中元 2027 | 農曆，待查證 | 複製 2026 已驗證套路，成員題可沿用角度換年份 |

**每個節點的 entry 格式**照現有兩筆（重陽、冬至）的骨架：`id`（`<slug>-<year>`）、`name`、`date`（含查證來源註解）、`hubTitle`、`ideas`（2–5 題，含 `title`/`angle`/`conclusion`；conclusion 不可含未查證數字）。

**選題角度的通用配方**（已驗證）：①「2026/2027 XX 是哪一天？由來、習俗與禁忌」（日期答案題，吃最大量）②拜拜/流程/供品題 ③食物熱量與健康題（可內鏈健康車道）④連假/活動/優惠題。每節點從配方挑，不硬湊。

### A2. hub 建立節奏

- 節點進窗、festival-radar 產出成員文 ≥3 篇後，建立該節點 hub（`src/content/topics/<id>.md`，格式照 `qixi-2026.md`），並依 `scripts/lib/topic-hub-ids.json` 規矩登記 id。
- hub 上線後跑一次 `node scripts/growth-lint.mjs --all`，確認成員文與 hub 互鏈無孤兒。

### A3. 驗收

```bash
# 節點數與覆蓋（執行完 P1 應涵蓋未來 4 個月每個大節點）
node -e 'import("./scripts/lib/festival-days.mjs").then(m=>m.FESTIVAL_DAYS.forEach(f=>console.log(f.date,f.name,f.ideas.length+"題")))'
# 窗口機制健康：今天起 21 天內有哪些節點會被 radar 撿到
node -e 'import("./scripts/lib/festival-days.mjs").then(m=>console.log(m.upcomingFestivals(new Date().toISOString().slice(0,10))))'
pnpm build && pnpm check:links
```

- ✅ 標準：P1 節點全數入表、日期逐筆有查證註解、build 綠。
- 每節點事後成效由既有 `scripts/topic-tracker.mjs` 週報自動追，不必另建報表。

---

## §3 工作包 B：台灣生活年曆權威（收割與沉澱層）

**目標**：讓年曆流量不是「來一次就走」，把 PV/session 從 1.11 推向 1.35 gate，並鋪 Discover 第二通道。

### B1. 存量內鏈回填（最直接拉 PV/session 的一批工作）

```bash
pnpm growth:backlog                 # 看剩多少、下一批
node scripts/growth-lint.mjs --all --worst 30   # 排工作清單
```

- 依 `docs/growth-playbook.md` 的 SOP 做（先跑 `pnpm growth:audit` 看三關現況）。
- 注意記憶檔教訓：growth-audit 的 URL 是 slug 不是檔名，先建 slug→檔案對照，過濾轉址舊 slug 與 en/jp 鏡像頁。
- 機械回填的坑先讀 `docs/lessons/mechanical-backfill-traps.md`。

### B2. 年曆互鏈網

- 節慶 hub 之間按時間軸互鏈（中秋 hub 文末指向雙十連假 hub、雙十指向萬聖…），形成「讀者跟著日曆走」的鏈。
- 食物健康題（月餅、湯圓、粽子熱量）一律內鏈到健康車道對應 hub（metabolic-health 等），這是兩條車道的交會點。

### B3. Discover 封面規格補齊

```bash
node scripts/check-cover-spec.mjs --all   # 盤點不符 Discover 規格（橫式 ≥1200）的存量
```

- 逐批補到規格（規格 SOT＝`scripts/lib/cover-spec.mjs`）。年曆題型（節慶、清單、指南）正是 Discover 偏好的型態，封面合格是入場券。

### B4. 驗收

- `pnpm growth:audit`：第一關分散度、pvPerSession 趨勢逐週看（目標 1.35）。
- `node scripts/check-cover-spec.mjs --all` 不合格數逐批下降至 0。
- 週一 cron 的 growth backlog Slack 快照增減為證據，不另做報表。

---

## §4 工作包 C：AI×醫療健康權威車道

**目標**：讓 appi.news 在「AI×醫療、高齡健康、就醫決策」題型上成為 AI 引擎會引用、讀者會回訪的來源。這條車道拚的是權威密度，不是篇數。

### C1. 急性症狀衛教擴題（清單驅動）

```bash
node -e 'import("./scripts/lib/acute-care.mjs").then(m=>{const g={};m.TOPICS.forEach(t=>g[t.group]=(g[t.group]||0)+1);console.log(g)})'   # 看各 group 覆蓋
```

- 先讀 `docs/lessons/acute-care-line-traps.md` 與 `acute-care.mjs` 檔頭的 `BOUNDARY`（醫療界線一字不動）。
- 補缺口 group 的常見急性題（目標：每 group 至少涵蓋台灣人最常搜的前幾題；用 `pnpm search:trends` 與 GSC query 佐證選題，不憑感覺）。
- 每批跑 `scripts/acute-care-batch.sh`，完成後跑 `scripts/acute-care-audit.mjs` 機械驗合規。

### C2. 健康 hub 深化

- 既有健康類 hub（cancer-screening、kidney-health、healthy-aging、digital-health-elderly-care、medical-ai-frontline、ai-medical-regulation…）逐個跑 `node scripts/growth-lint.mjs`，找出成員文少、零內鏈、無 FAQ 的 hub，排進 B1 同一批回填。
- 缺主題的方向優先補「決策型」內容（要不要做這個檢查、掛哪科、健保給付嗎），這是 AI 引擎最常被問、也最需要可靠來源的題型。

### C3. 被引用工程（GEO/AEO）

- 每週對 health beat 跑一次 `cited-teardown` skill（拆解「被 AI 引用、我方沒有」的競品頁，產出落地到 newsroom 的檢查表）。
- 用 `aeo-radar` 的 geo-citation 帳本當這條車道的北極星指標：追「appi.news 被引用題數」的週趨勢，而不是只看 GA。

### C4. 審閱者覆蓋

- 檢查 `src/config/reviewers.ts`：health 各 subcategory 都有對應審閱者；缺列補列（規矩見 `docs/lessons/provenance-disclosure.md`）。E-E-A-T 的署名與審閱鏈是這條車道的信任底盤。

### C5. 驗收

- 急性衛教：`TOPICS` 各 group 無空白、audit 全過。
- hub：health 類 hub 的 growth-lint 缺項清零。
- 引用：aeo-radar 帳本被引用數週趨勢向上（絕對數用帳本輸出為準，不設寫死目標）。

---

## §4.5 工作包 D：深耕前置佈局（站長 2026-08-22 定調走「深耕」路線後新增）

**目標**：深耕＝真人專家、原創資產、可信品牌。這三樣的前置時間最長（專家關係以月計），必須在流量爬坡期就開工，不能等流量到位。**本工作包有一半只有站長本人能做**，codex 的任務是把「準備件」做到站長只剩「出面」這一步。

### D1. E-E-A-T 基礎建設（codex 可全做）

- 盤點站上「信任頁」現況：編輯政策／審閱流程說明／更正政策／關於我們，缺的補、有的檢查是否與 `src/config/reviewers.ts` 的語意（reviewedBy＝專業審閱、factCheckedBy＝編輯部查核）一致並互鏈。
- 作者頁強化：比照 `src/content/authors/wu-fang-jun.md` 的規格（credentials、specialties、外部 sameAs 連結、免責聲明），把健康車道審閱者的頁面補到同等完整度。
- 每篇健康文的審閱者署名鏈在頁面上可見、可點回作者頁（現有機制查 `src/config/reviewers.ts` 檔頭，壞了才修，沒壞不動）。

### D2. 真人專家網絡（站長主導；codex 只做準備件，**禁止代寄任何邀請**）

- **模板已驗證**：吳芳圳（財經專欄，authorLevel: columnist）就是成功案例——真人、具名頭銜、免責聲明、外部官網互鏈。健康車道照抄這個 onboarding 形態。
- codex 產出「邀請包」：目標名單骨架（從 yao.care 生態系可觸及的醫療專業者類型出發：醫師、藥師、物理治療師、營養師，每類列出適合的專欄主題與現有存量文可掛審閱的清單）＋邀請信草稿（照 `sports-invite-draft` skill 的規矩：只起草、發到 Slack 供站長人工檢視後自行寄送，不自動寄信、不蒐集個資）。
- 合作形態從輕到重：具名審閱（最輕，先求有）→ 掛名專欄（columns collection 現成）→ 訪談成文。先鋪最輕的一層。

### D3. 原創資料資產（codex 可做大部分）

- **年曆本身就是資產**：工作包 A 逐筆查證過的節日/節氣/連假日期＋來源，整理成一頁「台灣生活年曆總覽」常青頁（含結構化資料），成為別人與 AI 引擎引用的一手來源，而不只是散在各 hub。
- 健康車道找 1–2 個「台灣獨有、官方開放資料可加工」的資料集做成常青工具頁（候選方向：全台 ICOPE 服務據點、成人健檢/癌症篩檢資格與據點查詢整理；以政府開放資料為源、附更新日期與來源）。原創資料頁是 GEO 被引用率最高的內容型態。
- 紅線：資料頁必須標注資料時點與官方來源連結，過期風險高的欄位寧可連去官方查詢頁也不落死數字。

### D4. 品牌與回訪（量測先行，機制待站長裁示）

- codex 先做量測：GSC 品牌詞（appi、appi news 等）曝光/點擊週趨勢納入觀察清單；GA4 回訪率基線記下來。
- 電子報/LINE 等回訪機制**屬站長決策項**，本計劃不執行；等 D1–D3 有進展後由站長裁示是否開案。

### D5. 驗收

- D1：信任頁齊備且互鏈、健康審閱者作者頁達 wu-fang-jun 規格；`pnpm build && pnpm check:links` 綠。
- D2：邀請包（名單骨架＋草稿）交付 Slack，⛔ 之後的寄送與洽談是站長的事，codex 不追。
- D3：年曆總覽頁與至少一個健康資料工具頁上線、來源與時點標注齊全。
- D4：品牌詞與回訪基線數字產出（跑指令為準，不寫死在文件）。

## §5 執行順序與節奏

1. **第一週**：A1 的 P1 節點入表（中秋、雙十最急，窗口最近）＋ C4 審閱者補列（半天工）＋ **D2 邀請包**（專家關係前置時間最長，第一週就交付給站長）。
2. **第二週起**：B1 內鏈回填與 C2 hub 深化合併成一條每週固定批次（依 growth:backlog 排序）；B3 封面補齊與 D1 信任頁平行跑。
3. **第三週起**：D3 年曆總覽頁（等 A1 查證資料到位後做，直接複用查證成果）；健康資料工具頁選定一個開工。
4. **持續**：A2 hub 隨節點進窗建立；C1 每次一批（約 5–10 題）；C3 每週一輪；D4 基線每週記。
5. **每週檢查點**：週一 growth:backlog Slack 快照＋topic-tracker 週報，就是進度報表，不另造。

## §6 回報格式（給執行 agent）

每完成一個工作包批次，回報三態對帳：✅ 已完成（附驗收指令輸出）／⛔ 被外部擋住（附卡點）／🅤 站長明示同意不做。「我判斷不必要」是提案不是結案，動手砍範圍前先問。
