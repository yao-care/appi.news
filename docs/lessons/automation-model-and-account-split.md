# 帳號切換洗掉排程 ＋ 全 Opus 燒爆週額度 ＋ claude-appi 撞限額會 exit 0

> 摘要：把 cron 從 `claude` 切到營運帳號 `claude-appi` 那次，順手洗掉了兩條排程、又沒設模型→全跑 Opus 把週用量額度燒爆、自動化全失敗，且失敗訊息被吞看不出原因 ｜ 範圍：自動化 / 成本 / 觀測性 ｜ 狀態：已解決 ｜ 日期：2026-06-30

## 問題（症狀）

- `claude-appi` 帳號撞「**每週用量上限**」（log：`You've hit your weekly limit · resets ...`），國際/焦點等 cron 連日 0 產出。
- `international-desk.log` 每一則都印 `⚠️ claude 失敗：`（**stderr 空白**），完全查不出為什麼掛。
- crontab 裡 **tech-radar 與 typhoon 只剩孤兒註解、實際排程行不見了**：科技日更選題停擺、颱風季的颱風守望整段沒在跑（那段期間的颱風文其實是手動觸發補的）。
- crontab 凌亂：appi.news 6 行散落在 agent.writer / yao.care / dreamer868 / evidencetoday / sutta.io 之間，夾雜多個重複 `CRON_TZ=UTC` 與對不上排程的註解，難以稽核哪些是 appi.news、哪些沒在跑。

## 原因（根因）

1. **全域模型釘死 Opus**：`~/.claude-appi/.claude.json` 的 `"model": "claude-opus-4-7"`，而 4 支 cron `.sh`（`claude-appi -p`）+ 4 支 `.mjs`（`spawnSync('claude-appi', ['-p', …])`）**全沒帶 `--model`** → 連最瑣碎的選題、二元查核都吃 Opus → 週額度被燒爆。
2. **claude-appi 撞限額時 exit 0**：限額訊息只印到 **stdout**，且**回傳碼是 0**。於是：
   - `.sh`：`rc=0` 又沒把 `weekly limit` 放進失敗 regex → 被當成「無產出、安靜」。
   - `.mjs`：只檢查 `status !== 0`，限額訊息被丟給 parser → 解不出 action → 同樣「無產出、安靜」；而失敗分支只印 `r.stderr`（空），真正原因（在 stdout）被吞。
3. **手改 crontab 洗掉排程行**：帳號切換那次（commit `df66c59` / `4e49a30`）編輯 crontab 時，把 tech-radar 三行與 typhoon 一行刪掉只留註解；散落式排版讓這種遺漏很難一眼看出。

## 解法（怎麼修 + 現在怎麼維持）

- **模型分級**（全面 Sonnet，gate 用 Haiku，Opus 退場）：所有 `claude-appi` 呼叫一律帶 `--model`——cron/`.mjs` 產文與選題、週報 → `--model sonnet`；`newsroom-write.mjs` 的 viewpoint 二元查核 gate → `--model haiku`。
- **限額/錯誤要顯形**：
  - `.sh` 失敗 regex 統一含 `hit your .*limit|weekly limit|usage limit`（rc=0 但輸出命中 → 走失敗分支）。
  - `.mjs` spawn 後**同時掃 stdout** 的限額/錯誤字樣（`API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit`）才算成功；失敗訊息加印 `r.stdout`。
- **crontab 收歸單一區塊**：所有 appi.news 行集中到 crontab 末段「APPI NEWS」區塊，補回 tech-radar 與 typhoon（`0 * * 5-11 *`，颱風季每小時）排程行，日誌統一 `/var/log/appi-news/<job>.log`。（tech-radar 後依站長指示由一天三次改每日一次。）

## 怎麼避免重犯 / 相關

- **新增任何 `claude-appi -p` 自動化呼叫，務必明確帶 `--model`**，別吃全域預設（全域仍可能是 Opus）。
- **判斷自動化「成功」不能只看 exit code**：`claude -p` 撞限額/拒答會 exit 0；一定要掃輸出字樣。`.sh` 用 regex、`.mjs` 用 stdout 測試。
- **改 crontab 後做集合稽核**：比對「非-appi 排程行 old vs new 應完全一致」、確認 appi 每支腳本都有對應排程行（別只留註解）。
- 與「改了沒生效」併讀：程式從 publisher checkout 跑、`.sh`/server 改完要 `git -C /root/appi.news-publisher pull`，見 [automation-runtime-staleness.md](./automation-runtime-staleness.md)；多工 worktree 並行見 [auto-publish-pipeline-traps.md](./auto-publish-pipeline-traps.md)。SOP 對照 [`docs/SERVER_HANDOFF.md`](../SERVER_HANDOFF.md) §cron 總表。
