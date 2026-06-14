# APPI News 147 篇選題與產文 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為 7 個分類各產出 21 篇（共 147 篇）結構、深度、文風一致的文章，每篇照統一規格 v1，真實查證、避政治、即時發佈。

**Architecture:** 兩階段。Phase A 用 tavily 查證產出 147 題 worklist（事件＋日期＋來源），交使用者過目。Phase B 以分類為批次（一類 21 篇），每篇照規格 v1 寫成 `src/content/articles/post-NNN.md`，過 §3.6 檢查表，批次用 `regen-covers.mjs` 生封面，`pnpm build && pnpm check:links` 必過後即時發佈。

**Tech Stack:** Astro 5 Content Collections、pnpm、tavily（查證）、`scripts/regen-covers.mjs`（OpenAI gpt-image-2 批次封面）、`scripts/check-links.mjs`。

**單一事實來源（規格）：** `docs/superpowers/specs/2026-06-14-appi-147-articles-design.md`。每篇文章都必須符合該 spec 的 §3 統一文章規格與 §3.6 檢查表。

---

## Shared Conventions（每個任務都必讀，此處為唯一定義）

### C1. Slug 配號

- 現有最大 slug = `post-616`。本批用 **`post-617` ～ `post-763`**（共 147）。
- 配號表（依分類固定區段，避免兩個批次撞號）：

| 分類 | category | slug 區段 |
|---|---|---|
| 焦點 | `focus` | post-617 ～ post-637 |
| 國際 | `society`(international) | post-638 ～ post-658 |
| 健康 | `health` | post-659 ～ post-679 |
| 科技 | `tech` | post-680 ～ post-700 |
| 財經 | `finance` | post-701 ～ post-721 |
| 運動 | `sports` | post-722 ～ post-742 |
| 生活 | `lifestyle` | post-743 ～ post-763 |

每段 21 個：前 8 個近 3 個月、中 7 個近半年、後 6 個近一年（與 worklist 排序對齊）。

### C2. 時間桶（事件日期，今天 2026-06-14）

- 近 3 個月｜8 篇：2026-03-15 ～ 2026-06-14
- 近半年｜7 篇：2025-12-15 ～ 2026-03-14
- 近一年｜6 篇：2025-06-15 ～ 2025-12-14

### C3. 文章檔模板（每篇都照這個骨架；`<>` 為待填）

```markdown
---
title: "<陳述句標題，22–34 中文字，無破折號>"
slug: "post-NNN"
description: "<60–90 字摘要>"
excerpt: "<與 description 同字串>"
publishDate: "<產出當下台北時間，如 2026-06-14T15:30:00+08:00>"
category: "<focus|society|health|tech|finance|sports|lifestyle>"
subcategory: "<依 spec §1.1 取向>"
tags: ["<標籤1>", "<標籤2>", "<標籤3>", "<標籤4>"]
highlights:
  - "<重點1，可獨立理解>"
  - "<重點2>"
  - "<重點3>"
  - "<重點4>"
references:
  - title: "<來源1標題>"
    url: "<已驗證可達的 URL>"
    publisher: "<出處機構>"
  - title: "<來源2標題>"
    url: "<URL>"
    publisher: "<出處>"
  - title: "<來源3標題>"
    url: "<URL>"
    publisher: "<出處>"
author: "appi-editorial"
status: "published"
sourceType: "ai-assisted"
disclaimerType: "general"
---

<導言：2–3 句，含 1 個具體數字或日期，點出 why-now。>

## <小標①：發生什麼>

<2–3 段，每段 3–5 句；body 內以 [錨文字](URL) 放入至少 1 處權威來源超連結。>

## <小標②：為什麼重要>

<2–3 段，台灣或亞太脈絡；至少 1 處超連結。>

## <小標③：影響與接下來看什麼>

<2–3 段，有立場的觀點。>

<結尾：1 段收束，給讀者帶得走的判斷，不喊口號。>
```

- 健康醫療題：`disclaimerType: "medical"`，並在 frontmatter 加 `risksAndLimits:`（條列風險與限制）。
- 財經投資題：`disclaimerType: "financial"`。
- 不放 `coverImage`/`coverAlt`（留給 C5 批次生封面寫入）。

### C4. §3.6 逐篇檢查表（每篇寫完即勾，全過才算完成）

- [ ] 標題 22–34 字、陳述句、無破折號
- [ ] 導言含數字或日期、點出 why-now
- [ ] highlights 恰 4 條，可獨立理解
- [ ] 主體恰 3 個 H2 小節，順序①②③
- [ ] body 內 ≥2 處權威超連結；`references` ≥3 筆
- [ ] 字數 1200–1600
- [ ] 文風複查通過（無破折號/AI 套語/buzzword，掃描指令見 C6）
- [ ] 事件日期落在指定時間桶
- [ ] 無政治內容
- [ ] frontmatter 欄位齊全且值正確
- [ ] 健康醫療題已掛 medical disclaimer + risksAndLimits

### C5. 批次生封面（一個分類寫完後跑一次）

```bash
node scripts/regen-covers.mjs
```

它會掃描 `src/content/articles/` 中所有沒有 `coverImage` 的 `.md`，用 gpt-image-2 生 1280 寬 WebP 存 `public/covers/<slug>.webp`，並寫回 `coverImage`/`coverAlt`。只會處理新寫、尚無封面的檔；可重跑。需要 `~/.config/appi-news/ai-worker.secrets` 內的 `OPENAI_API_KEY`。

### C6. 文風掃描指令（去 AI 腔）

```bash
# 對本批新檔掃描禁用符號與套語；有命中就人工修掉
grep -nE '—|──|--|不僅.*更|不只是.*而是|值得注意的是|事實上|總而言之|歸根結底|賦能|解鎖|釋放潛力|顆粒度|閉環' src/content/articles/post-{START}..{END}.md
```

### C7. 批次驗收 gate（每個分類批次最後都要過）

```bash
pnpm build && pnpm check:links
```

`check:links` 是硬性 gate，壞連結即失敗，必須修到綠。

---

## Phase A — 選題 worklist

### Task 1: 建 worklist 骨架檔

**Files:**
- Create: `docs/content-plan/2026-06-14-147-worklist.md`

- [ ] **Step 1: 建立 worklist 檔，含 7 個分類區塊與固定欄位表頭**

每個分類一張表，欄位固定為：`#｜slug｜時間桶｜暫定標題｜切入角度｜why-now｜來源URL｜subcategory`。每張表預留 21 列（8 近3月 / 7 近半年 / 6 近一年），slug 依 C1 配號區段預填。

```markdown
# APPI News 147 篇選題 worklist（2026-06-14）

> 規格：docs/superpowers/specs/2026-06-14-appi-147-articles-design.md
> 時間桶以事件日期判定（見 spec §1.2）。全 147 題以事件為單位去重。

## 焦點 focus（post-617～637）

| # | slug | 時間桶 | 暫定標題 | 切入角度 | why-now | 來源URL | subcategory |
|---|---|---|---|---|---|---|---|
| 1 | post-617 | 近3個月 |  |  |  |  |  |
| ... | ... | ... |  |  |  |  |  |
```

（其餘六個分類區塊同結構，slug 區段依 C1。）

- [ ] **Step 2: Commit**

```bash
git add docs/content-plan/2026-06-14-147-worklist.md
git commit -m "docs: 147 篇選題 worklist 骨架"
```

### Task 2: tavily 查證填滿「焦點」與「國際」兩類選題

**Files:**
- Modify: `docs/content-plan/2026-06-14-147-worklist.md`（焦點、國際兩區塊）

- [ ] **Step 1: 對每個時間桶跑 tavily 查真實事件**

焦點走 ESG／環保／能源轉型／供應鏈韌性／韌性台灣；國際走去政治的國際科技/氣候/商業/科學/運動/文化。對每桶用帶時間範圍的查詢，例：

```
tavily_search: "台灣 ESG 永續 2026" / "台灣 能源轉型 2026 Q2" / "台灣 缺水 防災 韌性 2026"
tavily_search: "international climate technology 2026" / "global science breakthrough 2025 H2"
```

每個命中事件記錄：標題、發生日期、來源 URL、出處機構。

- [ ] **Step 2: 驗證日期落桶並去重**

每題的事件日期必須落在該列的時間桶；不符就換題。跨 147 題以事件去重（此步只需保證與已填列不撞）。每類湊滿 8/7/6。

- [ ] **Step 3: 回填 worklist 兩區塊（每列補滿 6 個欄位）**

- [ ] **Step 4: Commit**

```bash
git add docs/content-plan/2026-06-14-147-worklist.md
git commit -m "docs(worklist): 焦點、國際選題（tavily 查證）"
```

### Task 3: tavily 查證填滿「健康」「科技」「財經」三類選題

**Files:**
- Modify: `docs/content-plan/2026-06-14-147-worklist.md`（健康、科技、財經三區塊）

- [ ] **Step 1: 對三類各時間桶跑 tavily**，記錄事件/日期/來源/出處（健康偏醫療、預防、營養、醫療科技、健康政策；科技偏 AI、資安、新創、軟體、產業應用；財經偏產業、投資觀念、fintech、市場、商業模式）。
- [ ] **Step 2: 驗證日期落桶、跨類去重**（不可與焦點/國際已填事件重複）。
- [ ] **Step 3: 回填三區塊。**
- [ ] **Step 4: Commit**

```bash
git add docs/content-plan/2026-06-14-147-worklist.md
git commit -m "docs(worklist): 健康、科技、財經選題（tavily 查證）"
```

### Task 4: tavily 查證填滿「運動」「生活」兩類選題

**Files:**
- Modify: `docs/content-plan/2026-06-14-147-worklist.md`（運動、生活兩區塊）

- [ ] **Step 1: 對兩類各時間桶跑 tavily**（運動偏賽事、運動科學、運動產業、訓練、運動健康，去政治；生活偏教育、職場、消費、家庭、文化、生活科技）。
- [ ] **Step 2: 驗證日期落桶、跨類去重。**
- [ ] **Step 3: 回填兩區塊；確認全 147 列皆已填、無重複事件、各類 8/7/6 數量正確。**
- [ ] **Step 4: Commit**

```bash
git add docs/content-plan/2026-06-14-147-worklist.md
git commit -m "docs(worklist): 運動、生活選題；147 題定稿"
```

### Task 5: 使用者過目 worklist（REVIEW GATE）

- [ ] **Step 1: 把 147 題清單交使用者過目，等待放行或微調。**
- [ ] **Step 2: 依回饋修正 worklist，重新 commit。**

**這是硬性檢查點：worklist 未經使用者放行，不得進入 Phase B。**

---

## Phase B — 逐類產文（一類一批；每篇照 C3 模板＋C4 檢查表）

> 每個分類任務的內部步驟相同：① 依 worklist 該類 21 題逐篇寫 `post-NNN.md`（照 C3）② 逐篇過 C4 檢查表 ③ C6 文風掃描修正 ④ C5 批次生封面 ⑤ C7 build+check:links ⑥ commit。
> **Task 6（焦點）寫完後設使用者驗收檢查點，確認品質再續其餘六類。**

### Task 6: 焦點 focus（post-617～637，21 篇）

**Files:**
- Create: `src/content/articles/post-617.md` … `src/content/articles/post-637.md`
- Modify: `public/covers/post-617.webp` … `post-637.webp`（由 C5 腳本產生）

- [ ] **Step 1: 依 worklist 焦點 21 題，逐篇用 C3 模板寫成 `post-617.md`～`post-637.md`。** category=`focus`，subcategory 依題取 `trends`/`analysis`，body 內放 worklist 來源為超連結並登記 `references`。
- [ ] **Step 2: 逐篇過 C4 檢查表**，不符退回重寫。
- [ ] **Step 3: C6 文風掃描並修正**

```bash
grep -nE '—|──|--|不僅.*更|不只是.*而是|值得注意的是|事實上|總而言之|歸根結底|賦能|解鎖|釋放潛力|顆粒度|閉環' src/content/articles/post-{617..637}.md
```

Expected: 無輸出（有命中就修掉）。

- [ ] **Step 4: 批次生封面**

```bash
node scripts/regen-covers.mjs
```

Expected: 顯示「完成 21 篇；失敗 0」，21 個 `public/covers/post-61x..63x.webp` 生成，各檔 frontmatter 已被寫入 `coverImage`/`coverAlt`。

- [ ] **Step 5: 驗收 gate**

```bash
pnpm build && pnpm check:links
```

Expected: build 成功、check:links 0 壞連結。

- [ ] **Step 6: Commit**

```bash
git add src/content/articles/post-6{1,2,3}*.md public/covers/post-6{1,2,3}*.webp
git commit -m "feat(content): 焦點 21 篇（ESG/環保/韌性台灣）"
```

- [ ] **Step 7: 使用者驗收檢查點（GATE）** — 請使用者抽看焦點數篇，確認結構/深度/文風/封面符合預期，OK 才續 Task 7–12。

### Task 7: 國際 society/international（post-638～658，21 篇）

**Files:**
- Create: `src/content/articles/post-638.md` … `post-658.md`
- Modify: `public/covers/post-638.webp` … `post-658.webp`

- [ ] **Step 1: 依 worklist 國際 21 題逐篇寫（C3）。** category=`society`、subcategory=`international`，去政治。
- [ ] **Step 2: 逐篇過 C4 檢查表。**
- [ ] **Step 3: C6 文風掃描修正**（`grep -nE '<C6 pattern>' src/content/articles/post-{638..658}.md`，命中即修）。
- [ ] **Step 4: `node scripts/regen-covers.mjs`**（生 21 封面，失敗 0）。
- [ ] **Step 5: `pnpm build && pnpm check:links`**（0 壞連結）。
- [ ] **Step 6: Commit** `git commit -m "feat(content): 國際 21 篇（去政治）"`

### Task 8: 健康 health（post-659～679，21 篇）

**Files:**
- Create: `src/content/articles/post-659.md` … `post-679.md`
- Modify: `public/covers/post-659.webp` … `post-679.webp`

- [ ] **Step 1: 依 worklist 健康 21 題逐篇寫（C3）。** category=`health`，subcategory 取 `medical`/`preventive`/`nutrition`/`medtech`/`tcm`/`health-policy`。**醫療題 `disclaimerType: "medical"` 並加 `risksAndLimits`。**
- [ ] **Step 2: 逐篇過 C4 檢查表（含 medical disclaimer 項）。**
- [ ] **Step 3: C6 文風掃描修正。**
- [ ] **Step 4: `node scripts/regen-covers.mjs`。**
- [ ] **Step 5: `pnpm build && pnpm check:links`。**
- [ ] **Step 6: Commit** `git commit -m "feat(content): 健康 21 篇"`

### Task 9: 科技 tech（post-680～700，21 篇）

**Files:**
- Create: `src/content/articles/post-680.md` … `post-700.md`
- Modify: `public/covers/post-680.webp` … `post-700.webp`

- [ ] **Step 1: 依 worklist 科技 21 題逐篇寫（C3）。** category=`tech`，subcategory 取 `ai`/`security`/`startup`/`software`/`industry-tech`/`digital-tools`。
- [ ] **Step 2: 逐篇過 C4 檢查表。**
- [ ] **Step 3: C6 文風掃描修正。**
- [ ] **Step 4: `node scripts/regen-covers.mjs`。**
- [ ] **Step 5: `pnpm build && pnpm check:links`。**
- [ ] **Step 6: Commit** `git commit -m "feat(content): 科技 21 篇"`

### Task 10: 財經 finance（post-701～721，21 篇）

**Files:**
- Create: `src/content/articles/post-701.md` … `post-721.md`
- Modify: `public/covers/post-701.webp` … `post-721.webp`

- [ ] **Step 1: 依 worklist 財經 21 題逐篇寫（C3）。** category=`finance`，subcategory 取 `industry`/`investing`/`fintech`/`market`/`business-model`/`management`。**投資題 `disclaimerType: "financial"`。**
- [ ] **Step 2: 逐篇過 C4 檢查表。**
- [ ] **Step 3: C6 文風掃描修正。**
- [ ] **Step 4: `node scripts/regen-covers.mjs`。**
- [ ] **Step 5: `pnpm build && pnpm check:links`。**
- [ ] **Step 6: Commit** `git commit -m "feat(content): 財經 21 篇"`

### Task 11: 運動 sports（post-722～742，21 篇）

**Files:**
- Create: `src/content/articles/post-722.md` … `post-742.md`
- Modify: `public/covers/post-722.webp` … `post-742.webp`

- [ ] **Step 1: 依 worklist 運動 21 題逐篇寫（C3）。** category=`sports`，subcategory 取 `events`/`sports-science`/`sports-industry`/`training`/`sports-health`，去政治。
- [ ] **Step 2: 逐篇過 C4 檢查表。**
- [ ] **Step 3: C6 文風掃描修正。**
- [ ] **Step 4: `node scripts/regen-covers.mjs`。**
- [ ] **Step 5: `pnpm build && pnpm check:links`。**
- [ ] **Step 6: Commit** `git commit -m "feat(content): 運動 21 篇"`

### Task 12: 生活 lifestyle（post-743～763，21 篇）

**Files:**
- Create: `src/content/articles/post-743.md` … `post-763.md`
- Modify: `public/covers/post-743.webp` … `post-763.webp`

- [ ] **Step 1: 依 worklist 生活 21 題逐篇寫（C3）。** category=`lifestyle`，subcategory 取 `education`/`workplace`/`consumer`/`family`/`culture`/`life-tech`。
- [ ] **Step 2: 逐篇過 C4 檢查表。**
- [ ] **Step 3: C6 文風掃描修正。**
- [ ] **Step 4: `node scripts/regen-covers.mjs`。**
- [ ] **Step 5: `pnpm build && pnpm check:links`。**
- [ ] **Step 6: Commit** `git commit -m "feat(content): 生活 21 篇"`

---

## Phase C — 全站驗收與發佈

### Task 13: 全站總驗收

**Files:**
- 無新增；驗證既有

- [ ] **Step 1: 確認檔數與分配**

```bash
# 應為 147 個新檔（post-617..763）
ls src/content/articles/post-{617..763}.md | wc -l
# 各分類數量檢查（每類應 21）
grep -rhoE '^category: "[a-z]+"' src/content/articles/post-{617..763}.md 2>/dev/null | sort | uniq -c
```

Expected: 147；focus/society/health/tech/finance/sports/lifestyle 各 21。

- [ ] **Step 2: 全站文風總掃描**

```bash
grep -rlnE '—|──|不僅.*更|不只是.*而是|值得注意的是|賦能|解鎖|閉環' src/content/articles/post-{617..763}.md
```

Expected: 無輸出。

- [ ] **Step 3: 最終 gate**

```bash
pnpm build && pnpm check:links
```

Expected: build 成功、0 壞連結。

### Task 14: 發佈（觸發部署）

- [ ] **Step 1: 合併／推送到 main 觸發部署**

依 [[appi-news-project]] 的 HTTPS remote 與 fast-forward 推法，把本批 push 到 `main`：

```bash
git push origin HEAD:main
git status   # 確認非 ahead；失敗訊息尾「and the repository exists.」是錯誤不是成功
```

- [ ] **Step 2: 追蹤部署並於線上站抽驗**

```bash
gh run watch
```

於 `https://yao-care.github.io/appi.news/` 抽看數篇分類頁與文章頁（封面、超連結、highlights 顯示正常）。

- [ ] **Step 3: 更新記憶** — 在 [[newsroom-daily-engine]] 或新記憶記錄「147 篇內容庫已上線、slug post-617..763、分配規則」。

---

## 備註

- **不動效能相關檔**：本批只新增 `src/content/articles/*.md` 與 `public/covers/*.webp`，不碰字型/首頁 CSS/build 流程（遵守 `PERFORMANCE.md` 與 spec §5）。
- **生圖成本**：147 張封面分 7 批產（每批 21、並發 3），用 gpt-image-2 medium。需 `~/.config/appi-news/ai-worker.secrets` 的 OPENAI key。
- **量大、跨工作階段**：以分類為批次、每批獨立 commit，可分多個 session 接續（接續前先讀 worklist 與 git log）。
