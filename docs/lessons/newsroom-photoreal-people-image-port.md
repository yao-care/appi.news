# newsroom 人物生圖：移植 agent.writer 的擬真攝影優化流程

> 摘要：newsroom 人物圖從「一句話 prompt 的插畫感」升級成「擬真攝影 + sonnet 展開 + haiku 視覺自檢 + 不合格重生」，移植自 `/root/agent.writer`；概念圖刻意維持插畫風 ｜ 範圍：自動化 / 配圖 ｜ 狀態：已上線（worker quality 待部署）｜ 日期：2026-07-20

## 問題（症狀）

appi 的人物生圖（`get-image.mjs --people`）原本很樸素：`ai-image.mjs` 的 `buildImagePrompt()` 只組「一句固定 STYLE（minimalist editorial **illustration**）+ Subject + 一句 must be Taiwanese」，單張、**無任何生成後驗證**。結果偏插畫、細節不足，且沒有任何機制擋掉多指/變形臉/圖內文字/非東亞面孔的壞圖——全靠運氣。

## 原因（根因）

品質差距不在 OpenAI 呼叫本身（appi 與 writer 都用 `gpt-image-2`），而在呼叫的**前後各少了一層 LLM**：

1. **生成前**：writer 用一次 sonnet 把「一句話 brief」展開成 150–300 字的完整攝影 prompt（膚質/髮型/服裝/道具/場景/鏡頭逐面向 + 反制「圖庫衛教照路人」的廉價選角），再機械套固定攝影技術規格串 + 硬性條款 + Avoid 清單（gpt-image 無獨立 negative 參數，避免事項寫進同段）。
2. **生成後**：writer 用一次 haiku（帶 Read/vision）讀圖驗破綻，不合格重生一次。

關鍵可行性：**appi 自動化本來就在用 `claude-appi` CLI**，這兩層額外 LLM 在 appi 是現成、零新金鑰的，模型也剛好符合政策（展開 Sonnet、驗圖 gate Haiku）。

## 解法（怎麼修 + 現在怎麼維持）

只移植「人物路徑（`--people`）」，概念圖不動。新增/改動：

- **`scripts/lib/claude-cli.mjs`**：spawn `claude-appi`（`runClaudeOnce` 純文字 / `runClaudeAgentText` 帶 Read）。4 次退避重試；撞用量上限（exit 0 只印限額訊息）視為暫時性失敗重試；`cleanEnv` 刪 `CLAUDECODE` 解**巢狀鎖**（get-image 常被外層 claude 會話以 Bash 叫起，內部再 spawn claude-appi ＝巢狀）。
- **`scripts/lib/photo-prompt.mjs`**：`PHOTO_TECH_SPEC`（ultra-realistic RAW photo…）/`PHOTO_HARD_CLAUSES`（一律機械附加台灣人+台灣場景+零文字，不信任展開結果）/`PHOTO_AVOID` 三常數 + `expandPhotoPrompt`（sonnet，兩次太短即退回）+ `composePhotoPrompt`。
- **`scripts/lib/visual-check.mjs`**：haiku 讀圖驗四維（手指/五官變形、圖內文字浮水印、AI 破綻、非東亞面孔）；CLI 錯誤回 `{ok:true}` 放行。
- **`ai-image.mjs` `generatePersonImage()`**：展開→組裝→生圖（quality `medium`）→暫存 jpg（Read 對 webp 支援不保證，須轉點陣）→驗圖→不合格用同 prompt 重生一次、第二張無條件採用。
- **worker `/generate` 加 per-request `quality`**：人物送 `medium`（low 會糊）、概念圖維持 `low`。
- `get-image.mjs --people` 新增 `--caption/--alt/--article-context` 讓展開扣題；SKILL.md / newsroom-write.mjs 指示帶入。

**幾個刻意的取捨（後人別誤改）**：
- ~~**人物 photoreal、概念圖插畫**是刻意混用~~ **（2026-07-22 已改）**：站長裁示概念圖插畫拼貼「套版感太重、不像專業新聞網站」，生成路徑全面改超寫實新聞攝影單一場景＋多樣性輪轉。見 [`image-realism-system.md`](./image-realism-system.md)。
- **全程 fail-open**：展開失敗退回短 detail（仍 photoreal）、驗圖失敗放行、只重生一次。這套是「只加分、不新增故障點」；別把驗圖改成硬 gate 擋出圖。
- **成本**：每張人物圖 = +1 sonnet（展開）+1 haiku（驗圖）+ 可能 1 次重生 + quality medium。走 claude-appi 共用 5h 額度視窗，注意與其他自動線的額度競用。

## 怎麼避免重犯 / 相關

- **正本流程在 `/root/agent.writer/scripts/lib/images/`**（photo-prompt.ts / visual-check.ts / claude-cli.ts）。未來 writer 再優化人物圖，同步回這裡的 `.mjs` 三兄弟。
- worker 改動要 `wrangler deploy` 才生效；未部署時人物圖仍以 low 生成（流程照常）。見 [`domain-change-worker-cors.md`](./domain-change-worker-cors.md) 的 worker 部署慣例。
- 配圖三來源與各頻道政策（誰准 AI、誰禁）見 `get-image.mjs` 檔頭與根 `CLAUDE.md` §自動發文 pipeline 的鐵則段（`NO_AI_IMAGE`）；帳號/模型政策見 [`automation-model-and-account-split.md`](./automation-model-and-account-split.md)。
