# 歷史經驗（lessons）— 為什麼這樣做

> 這個資料夾記錄**踩過的坑與重大決策**：每篇講清楚「**問題 → 原因 → 解法**」。
>
> 三層文件分工：
> - **`CLAUDE.md`（根）/ `README.md`**：導航 + 鐵則（在哪一格、不可破壞什麼）。
> - **說明文件**（`PERFORMANCE.md`、`docs/SERVER_HANDOFF.md`…）：**怎麼做**（現行 SOP）。遇到「為什麼這樣做」就連到這裡。
> - **本資料夾**：**為什麼**（前因後果）。說明文件不重述歷史，一律連過來。

## 寫法（新增一篇時照這個骨架）

```markdown
# <標題：一句話講清楚是什麼坑>

> 摘要：<一句話> ｜ 範圍：<字型/效能/SEO/自動化…> ｜ 狀態：已解決 / 緩解中 ｜ 日期：YYYY-MM-DD

## 問題（症狀）   ← 當時看到什麼、影響多大
## 原因（根因）   ← 真正的原因，不是表象
## 解法（怎麼修 + 現在怎麼維持）
## 怎麼避免重犯 / 相關   ← 鐵則、連到對應 SOP 段落
```

## 現有篇目

| 篇目 | 範圍 | 一句話 |
|---|---|---|
| [font-render-blocking.md](./font-render-blocking.md) | 字型/效能 | 全腳本字型進入點造成 545 個 @font-face、662 KB render-blocking，怎麼救回來的 |
| [psi-cold-edge.md](./psi-cold-edge.md) | 效能量測 | 剛部署 PSI 暴跌到 55 多半是冷邊緣假象，別對假問題改程式 |
| [google-indexing-api-gray-area.md](./google-indexing-api-gray-area.md) | SEO/收錄 | 「有 GSC key 就能催收錄」是誤解；Indexing API 對新聞站非官方、200 不保證收錄 |
| [wordpress-date-permalink-404.md](./wordpress-date-permalink-404.md) | SEO/轉址 | 舊 WordPress 日期網址漏接轉址變 404，仍在流失 Google 曝光 |

> 更早的一次性遷移紀錄另見 [`../../MIGRATION_NOTES.md`](../../MIGRATION_NOTES.md)（WordPress → Astro，2026-06-09 當時快照）。
> 更多尚未整理成正本的踩坑，散在 Claude 本地記憶（`~/.claude/projects/-root-appi-news/memory/`），可逐步提煉成這裡的正本。
