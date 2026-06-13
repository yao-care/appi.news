# APPI Newsroom — 日更內容引擎設計

> 日期：2026-06-13
> 作者：Lightman（CΛ）
> 目標：以 Claude Code 為寫作引擎，穩定產出「科技」類高品質文章，達到日更，同時守住 APPI「可信內容資產」的定位。

## 1. 背景與目標

- APPI News 是「AI 輔助寫作 + 專家審稿 + 媒體刊登」的專業觀點平台。Lightman 負責 tech 類，目前累積 6 篇（4 篇 tech、2 篇 health），皆為深度長文。
- 目標：**至少每天一篇** tech 文章，且不稀釋可信度（不淪為 AI 內容農場）。
- 核心洞見：有了 AI 後，日更的瓶頸從「人的產能」變成「系統設計」。把「定稿」從文章末端搬到**開頭**——由人提供「想要的結論」，AI 負責擴寫與查證——每篇就天生是作者的真人判斷。

## 2. 關鍵決策（已與使用者逐項確認）

| # | 決策點 | 結論 |
|---|--------|------|
| 1 | 人的角色 | 人在「開頭」提供結論（觀點）；AI 負責擴寫、查證、配圖、產出。定稿前移。 |
| 2 | 新鮮度 | 雙引擎：熱點短稿（當天時效）＋ 週級深度稿。 |
| 3 | 議題雷達 | 候選議題直接附「寫作方向 + 候選結論」，人只需接受 / 改一句 / 否決。 |
| 4 | 起草輸入 | 人給「想要的結論（必填）+ 文章脈絡（可選）」，系統繞著結論寫全文。 |
| 5 | 可信度閘門 | **無人工閘門**：起草內建「references 驗證—重寫」迴路，捏造/失效的來源由 AI 找真實來源替換或改寫論點，迴圈到全綠才產出。 |
| 6 | 執行平台 | **純 Claude Code 互動**，不使用 GitHub Actions 跑 AI。寫作就在使用者現有的 Claude Code session 進行。 |
| 7 | 認證 / 計費 | 直接用使用者現有的 Claude 訂閱（即現在這個 CLI），不需 API key、不需 `claude setup-token`、不按 token 計費。 |
| 8 | 節奏 / 自主性 | 手動批次 + 排程：一次 session 批量寫多篇、設未來 `publishDate` + `status: scheduled`，靠既有部署 cron 自動上線。不做無人值守自動產稿。 |

### 為什麼放棄 GitHub Actions 方案（曾評估）

最初設計過「三個 GitHub Actions workflow（radar / draft / buffer）+ `claude-code-action`」的自主版本，後放棄，理由：

1. **多餘的中間層**：Claude Code 本身就能讀 repo、上網查證、寫檔、commit、push，無須把同一個 Claude 搬到 CI 重做。
2. **公開 repo 的隔離與資安成本**：`yao-care/appi.news` 是公開 repo。用 Issue 當輸入會污染公開 issue 區、洩漏開稿輸入、且任何人都能觸發，需層層 `if:`（標籤 + 作者）防護；把訂閱 OAuth token（等同整個 Claude 帳號的鑰匙）放公開 repo secrets 也擴大爆炸半徑。
3. **這些問題在純 Claude Code 流程下全部消失**：無 CI、無公開觸發面、無 token 落地、無計費。

## 3. 系統架構

整套系統 = **一個 Claude Code 自訂 skill**（暫名 `newsroom`）+ 既有 repo 內容結構 + 既有部署 cron。**沒有任何新的服務、資料庫、平台或 CI job。**

```
使用者（Claude Code session）
   │  /newsroom  ←─ 一個自訂 skill，封裝整條管線
   ▼
┌─────────────────────────────────────────────┐
│ 模式一：議題雷達                              │
│   掃來源 → 評分 → 列「候選題 + 候選結論」     │
│                         │                     │
│ 模式二：起草（可由雷達轉入，或直接給結論）   │
│   給結論(+脈絡) → 擴寫 → references 驗證重寫   │
│   迴路 → check:links → 封面圖 → 完整 frontmatter│
│   → 寫成 .md（status: scheduled, 未來日期）    │
└─────────────────────────────────────────────┘
   │  git commit && push（一次推一批）
   ▼
既有 deploy.yml（push / 每 6h cron / 手動）
   │  pnpm build → check:links 硬 gate → 部署
   ▼
GitHub Pages 上線（scheduled 文章到時間後由 6h cron 自動現身）
```

### 3.1 既有部署機制（已驗證，可直接複用）

`.github/workflows/deploy.yml` 觸發條件：

```yaml
on:
  push: { branches: [main] }
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'   # 每 6 小時重建，未來日期文章到時自動上線
```

- 靜態站需重 build 才會出現新文章；6 小時 cron 即為此而設。
- build 內含 `pnpm check:links` 硬 gate（壞站內連結擋部署）。
- **附帶修正**：`CLAUDE.md` 寫「部署只在 push 到 main 觸發」不完整，實際 push / schedule / workflow_dispatch 三者皆會觸發；本案會順手修正該句。

## 4. `newsroom` skill 設計

### 4.1 放置位置

專案級 skill：`/Users/lightman/yao.care/appi.news/.claude/skills/newsroom/`。
理由：此 skill 緊密依賴 appi.news 的 content schema、目錄結構、`check:links` 與封面圖流程，應隨 repo 版控、與內容結構同步演進（而非放個人全域 `~/.claude/skills/`）。

### 4.2 模式一：議題雷達

**用法**：`/newsroom radar`（或自然語言「今天有什麼好題」）

**來源**（預設，可在 skill 內調整）：
1. 主流模型發布：Anthropic / OpenAI / Google 官方 blog
2. arXiv `cs.AI` / `cs.CL` 近期熱門
3. Hacker News 高分科技話題
4. 本業交叉題：醫療 AI、健康法規、合規

**評分**：`熱度 × APPI/tech 相關度 × 你的差異化角度可得性`（三軸各 1–10，相乘排序）。

**輸出**：每個候選題附——
- 議題（發生什麼）
- 為何相關
- **建議寫作方向**（切角）
- **候選結論**（可直接採用或改一句）
- 分數

挑定一題後，候選結論即帶入模式二。

### 4.3 模式二：起草（核心）

**用法**：`/newsroom write 結論：「…」`（脈絡可選）

**管線步驟**：
1. **查料**：依結論用 WebSearch / WebFetch 蒐集支撐材料與真實來源。
2. **擴寫**：繞著結論建立論證結構、寫正文。分層：
   - 深度旗艦（你給較完整脈絡 + 結論）：3000+ 字。
   - 熱點 / 速讀短稿：800–1500 字。
3. **references 驗證—重寫迴路（可信度命脈）**：
   - 逐條 fetch 每個 reference：連結可達（HTTP 200）+ 內容確實支持文中該句。
   - 無效者 → 找真實存在、能佐證同一論點的來源替換；找不到佐證 → 改寫或移除該論點，**不硬掰**。
   - 重驗，迴圈到全部通過。
4. **站內連結**：跑 `pnpm check:links`。
5. **封面圖**：接 `feat/ai-image-generate` 分支的能力，產生封面並存至 `public/covers/`（沿用既有 `coverImage: "covers/<slug>.jpg"` 慣例）。
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
5. 既有 6h cron 重建，文章到時自動現身。

**臨時熱點**：當天開 session，`/newsroom write` 一篇短稿，設 `published` + 現在時間，push 即上。

## 6. 範圍界線（YAGNI）

**納入**：`newsroom` skill（雷達 + 起草 + 驗證迴路）、封面圖串接、批次排程運作說明、`CLAUDE.md` 部署說明修正。

**排除**（明確不做）：
- 任何新的 GitHub Actions workflow（radar/draft/buffer）。
- 任何 API key / `CLAUDE_CODE_OAUTH_TOKEN` / CI 認證設定。
- 私有後台 repo、跨 repo 推送 token。
- 無人值守自動產稿 / buffer-guard。
- 績效回饋迴路（未來可另案）。

## 7. 風險與緩解

| 風險 | 緩解 |
|------|------|
| AI 捏造 references | §4.3 驗證—重寫迴路，出檔前 fetch 查證並替換。 |
| 量產稀釋可信度 | 結論由人給 + differentiation 守則 + references 查證。 |
| 訂閱額度與互動寫程式共用 | 批次寫作集中時段進行；篇數實測抓手感。 |
| scheduled 文章未上線 | 已驗證 deploy.yml 有 6h cron；批次後確認 push 成功即可。 |
| 封面圖流程相依 | `feat/ai-image-generate` 需先併入；未就緒時 skill 可暫以既有 OG fallback 機制。 |

## 8. 待辦（交付項）

1. 撰寫 `.claude/skills/newsroom/SKILL.md`（雷達 + 起草 + 驗證迴路 + frontmatter 規則）。
2. 串接 `feat/ai-image-generate` 的封面圖產生步驟。
3. 修正 `CLAUDE.md` 的部署觸發說明。
4. 跑一次 end-to-end：雷達 → 寫一篇 → 驗證 → 排程 → push → 線上確認。
