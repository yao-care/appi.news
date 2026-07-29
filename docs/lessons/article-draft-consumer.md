# /admin「寫作任務」有生產端、沒消費端——label 契約對不上就靜默孤兒化

> 摘要：/admin 建的 `article-draft` issue 沒有任何自動化會撿，issue 開了就永遠躺著；補上消費端時用 newsroom `--stage` 走正規產線開 PR、放寬分類白名單給真人下單 ｜ 範圍：自動化/發佈 ｜ 狀態：已解決 ｜ 日期：2026-07-03

## 問題（症狀）

站長用 https://appi.news/admin/ 建「AI 寫作任務」，Issue 有成功建立（例：#110），但**過再久都沒有文章產出、也沒有任何錯誤**。看起來像「寫作失敗」，其實是**根本沒有任何程式去接手寫**。

## 原因（根因）

**生產端和消費端的 label 契約對不上，而且消費端從未被實作。**

- 生產端：`src/utils/editor/issue.ts` 的 `createArticleIssue()` 在 `yao-care/appi.news` 開 issue，label 寫死 `article-draft`，body 寫「給寫作者（Claude Code）以 PR 回傳」。
- 但全站沒有任何東西撿 `article-draft`：
  - `.github/workflows/` 只有 `deploy.yml`，沒有 `on: issues`。
  - 唯一的「issue → 自動處理」管線是 dev 協作 webhook（`slack-actions-server` + `github-webhook.mjs`），但它只認 **`dev-bot`** label（`SPEC_LABEL`），收到 `article-draft` 直接 `ignore` 丟掉；而且它是**寫程式**不是寫文章。
  - 另一條會自動寫文章的 `agent.writer`（pm2 `agent-writer`）盯的是**完全不同的 repo**（`weiqi-kids/agent.writer`）+ label `status:pending`，當時判定「跟 appi.news 無關」。
    > ⚠️ **2026-07-29 更正**：這句在當時的脈絡（誰撿 `article-draft`）成立，但別誤讀成「agent.writer 不寫 appi.news」——它其實會，而且已累計 231 個 commit 直推本 repo（commit body 帶 `from agent.writer`）。它走的是自己的 issue 佇列與 `server/lib/astro-publish.ts` 的 `schema: 'appi'` 發佈路徑，**不經過本 repo 任何一條 `.mjs` 產線的 gate**。這個落差讓自由標籤兩度打爆本站建置，處置見 [`tag-taxonomy.md`](./tag-taxonomy.md) §2026-07-29。

教訓：**一個「建立了東西」的功能，若沒人消費，會靜默孤兒化**——沒有 exit code、沒有 log、沒有 Slack 警示，最難查。任何「產生待辦（issue/檔案/佇列訊息）」的生產端，都要能指出**具體的消費端 + 兩端共用的 label/路徑契約**，否則就是半成品。

## 解法（怎麼修 + 現在怎麼維持）

補上消費端，**復用既有 GitHub webhook**（不新增 GitHub Action——本專案自動化跑在 server 的 `claude-appi` 帳號 + 專屬 clone，不在 CI）：

1. `github-webhook.mjs`：`issues opened` 且帶 `article-draft`（`ARTICLE_LABEL`）→ 新 kind `writeArticle`（分支 `article/issue-N`，與 dev 的 `dev/issue-N` 區隔）。這類事件其實**早就送達** `/github`，先前只是被 `ignore`。
2. `scripts/article-write.mjs`（新協調器，藍本＝`devbot-develop.mjs`）：`gh issue view` → `parseArticleIssueBody`（`scripts/lib/article-issue.mjs`）組 job → 在 devbridge clone 開 issue 專屬 worktree → 跑 `newsroom-write.mjs --stage --allow-any-category` → push 分支 → `gh pr create Closes #N`。
3. `slack-actions-server.mjs`：`handleGithubReq` 把 `writeArticle` 轉 `devJob`，devbot 序列車道分派到 `runWriteArticle`，完成回報 dev 頻道帶 PR 連結。

兩個關鍵設計決策：

- **用 `newsroom-write --stage` 當「寫作步驟」，不改 newsroom-write 內部。** `--stage` 與 `--go` 共用完整前置（起草＋**配圖硬性 gate**＋連結查證＋`pnpm build`＋`check:links`＋`git commit`），差別只在**不 push**——正好是「在分支上寫好、交給外層開 PR」需要的槓桿。切勿另寫一條「純起草不過 gate」的捷徑繞過配圖 gate。
- **kind 一律 `factual`**：/admin 下單無個人觀點、編輯部署名，且 factual 的 `requireApproval` 會產 **noindex 待審草稿**（排遠未來）。於是 PR 是程式審查閘、待審狀態是上線閘（雙閘），跟站上既有 factual 流程一致——merge 後用編輯器／Slack 發佈鈕把日期改今天才上線。

分類白名單放寬（`validateJob(job, { allowAnyCategory })`）：newsroom 的 vertical 白名單（tech/international/sports/lifestyle）原意是擋「**機器自選題**」碰 health/focus/finance/columns；但 **/admin 是真人主動下單**，語意不同，故只在這條路徑放寬成「全部合法分類」（對齊 `src/config/categories.ts`）。自動選題產線不帶 `--allow-any-category`，行為完全不變。

## 怎麼避免重犯 / 相關

- 新增任何「產生待辦」的生產端，必須同時交付消費端，並在 PR 說清楚**兩端共用的 label/路徑契約**。改 label 名稱時，生產端與消費端要一起改。
- 消費端用 server webhook 而非 GitHub Action，因自動化靠 `claude-appi` + 專屬 clone，見 [`automation-model-and-account-split.md`](./automation-model-and-account-split.md)、[`automation-runtime-staleness.md`](./automation-runtime-staleness.md)（改 server/`.mjs` 要 push→publisher/devbridge pull→`pm2 restart`）。
- 配圖 gate 與 worktree 先 build 的鐵則見 [`auto-publish-pipeline-traps.md`](./auto-publish-pipeline-traps.md)。
