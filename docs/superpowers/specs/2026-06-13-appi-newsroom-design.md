# APPI Newsroom — 日更內容引擎設計

> 日期：2026-06-13
> 作者：Lightman（CΛ）
> 目標：以 Claude Code 自訂 skill 為寫作引擎，穩定產出「科技」類高品質文章達到日更，同時守住 APPI「可信內容資產」的定位。

## 1. 背景與目標

- APPI News 是「AI 輔助寫作 + 專家審稿 + 媒體刊登」的專業觀點平台。Lightman 負責 tech 類，目前累積 6 篇（4 篇 tech、2 篇 health），皆為深度長文。
- 目標：**至少每天一篇** tech 文章，且不稀釋可信度（不淪為 AI 內容農場）。
- 核心洞見：日更的瓶頸不是「人的產能」，而是「系統設計」。把「定稿」從文章末端搬到**開頭**——由人提供「想要的結論」，AI 負責擴寫與查證——每篇就天生是作者的真人判斷，而非 AI 自說自話。

## 2. 關鍵決策

| # | 決策點 | 結論 |
|---|--------|------|
| 1 | 人的角色 | 人在開頭提供結論（觀點）；AI 負責擴寫、查證、配圖、產出。定稿前移。 |
| 2 | 新鮮度 | 雙引擎：熱點短稿（當天時效）＋ 週級深度稿。 |
| 3 | 議題雷達 | 候選議題直接附「寫作方向 + 候選結論」，人只需接受 / 改一句 / 否決。 |
| 4 | 起草輸入 | 人給「想要的結論（必填）+ 文章脈絡（可選）」，系統繞著結論寫全文。 |
| 5 | 可信度閘門 | 起草內建「references 驗證—重寫」迴路：失效/捏造的來源由 AI 找真實來源替換，或改寫論點，迴圈到全綠才產出。無額外人工審稿關卡。 |
| 6 | 實作形式 | 一個 Claude Code 專案級自訂 skill，於使用者現有的 Claude Code session 互動執行，吃現有 Claude 訂閱。 |
| 7 | 節奏 | 手動批次 + 排程：一次 session 批量寫多篇、設未來 `publishDate` + `status: scheduled`，由既有部署在時間到後自動上線。 |

## 3. 架構概觀

整套系統 = **一個 Claude Code skill（`newsroom`）** + 既有 repo 內容結構 + 既有部署流程。無新增服務、資料庫或設定。

```
使用者（Claude Code session）
   │  /newsroom
   ▼
┌─────────────────────────────────────────────┐
│ 模式一：議題雷達                              │
│   掃來源 → 評分 → 列「候選題 + 候選結論」     │
│                         │                     │
│ 模式二：起草（由雷達轉入，或直接給結論）     │
│   給結論(+脈絡) → 擴寫 → references 驗證重寫   │
│   迴路 → check:links → 封面圖 → 完整 frontmatter│
│   → 寫成 .md（status: scheduled, 未來日期）    │
└─────────────────────────────────────────────┘
   │  git commit && push（一次推一批）
   ▼
既有部署流程 → GitHub Pages
   （靜態站於排程時間後重建，scheduled 文章到時自動現身；既有機制，本案不改動）
```

## 4. `newsroom` skill 設計

### 4.1 放置位置

專案級 skill：`.claude/skills/newsroom/`。
理由：此 skill 緊密依賴 appi.news 的 content schema、目錄結構、`check:links` 與封面圖流程，應隨 repo 版控、與內容結構同步演進。

### 4.2 模式一：議題雷達

**用法**：`/newsroom radar`（或自然語言「今天有什麼好題」）

**來源**（預設，可於 skill 內調整）：
1. 主流模型發布：Anthropic / OpenAI / Google 官方 blog
2. arXiv `cs.AI` / `cs.CL` 近期熱門
3. Hacker News 高分科技話題
4. 本業交叉題：醫療 AI、健康法規、合規

**評分**：`熱度 × APPI/tech 相關度 × 差異化角度可得性`（三軸各 1–10，相乘排序）。

**輸出**：每個候選題附——
- 議題（發生什麼）
- 為何相關
- **建議寫作方向**（切角）
- **候選結論**（可直接採用或改一句）
- 分數

挑定一題後，候選結論帶入模式二。

### 4.3 模式二：起草（核心）

**用法**：`/newsroom write 結論：「…」`（脈絡可選）

**管線步驟**：
1. **查料**：依結論用 WebSearch / WebFetch 蒐集支撐材料與真實來源。
2. **擴寫**：繞著結論建立論證結構、寫正文。分層：
   - 深度旗艦（給較完整脈絡 + 結論）：3000+ 字。
   - 熱點 / 速讀短稿：800–1500 字。
3. **references 驗證—重寫迴路（可信度命脈）**：
   - 逐條 fetch 每個 reference：連結可達（HTTP 200）+ 內容確實支持文中該句。
   - 無效者 → 找真實存在、能佐證同一論點的來源替換；找不到佐證 → 改寫或移除該論點，**不硬掰**。
   - 重驗，迴圈到全部通過。
4. **站內連結**：跑 `pnpm check:links`。
5. **封面圖**：產生封面並存至 `public/covers/`（沿用既有 `coverImage: "covers/<slug>.jpg"` 慣例）。
6. **frontmatter**：補齊 `title / description / category / subcategory / tags / highlights / references / author: "lightman" / sourceType: "ai-assisted" / disclaimerType`。
7. **排程欄位**：`status: "scheduled"` + 未來 `publishDate`（批次時錯開日期，灑滿整週）。
8. **產檔**：寫入 `src/content/articles/<slug>.md`。

> 即時發佈情境：若想立刻上線，改 `status: "published"` + `publishDate` 設現在，push 後由部署流程處理。預設走 scheduled 以支援批次。

### 4.4 differentiation 守則（寫進 skill 的硬性要求）

- 每篇**必須**有作者真人觀點層（結論即為其種子）；AI 不得自行替換或稀釋使用者給的結論。
- `references` 必經 §4.3 step 3 驗證；無有效佐證的論點不得留下。
- 保留 `expertNote` / `risksAndLimits` 的填寫空間，維持與內容農場的分界。

## 5. 日常運作流程

**批次寫作 session（每週一次或每幾天一次）**：
1. `/newsroom radar` → 看候選題。
2. 對想寫的題逐一 `/newsroom write 結論：…`（接受或改寫候選結論）。
3. 一次寫 5–7 篇，各設未來 `publishDate` 錯開整週、`status: scheduled`。
4. 一次 `git commit && git push`。
5. 文章於各自排程時間自動現身。

**臨時熱點**：當天開 session，`/newsroom write` 一篇短稿，設 `published` + 現在時間，push 即上。

## 6. 範圍界線（YAGNI）

**納入**：`newsroom` skill（雷達 + 起草 + 驗證迴路）、封面圖串接、批次排程運作說明。

**排除**：無人值守自動產稿、績效回饋迴路（皆可未來另案）。

## 7. 風險與緩解

| 風險 | 緩解 |
|------|------|
| AI 捏造 references | §4.3 驗證—重寫迴路，出檔前 fetch 查證並替換。 |
| 量產稀釋可信度 | 結論由人給 + differentiation 守則 + references 查證。 |
| 訂閱額度與互動寫程式共用 | 批次寫作集中時段進行；篇數實測抓手感。 |
| 封面圖流程相依 | 沿用既有封面/OG 機制；新封面能力就緒前可先以 fallback 產出。 |

## 8. 交付項

1. 撰寫 `.claude/skills/newsroom/SKILL.md`（雷達 + 起草 + 驗證迴路 + frontmatter 規則）。
2. 串接封面圖產生步驟。
3. 跑一次 end-to-end：雷達 → 寫一篇 → 驗證 → 排程 → push → 線上確認。
