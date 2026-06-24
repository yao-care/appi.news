# 換網域漏改 Cloudflare Worker 的 CORS：編輯器「Failed to fetch」

> 摘要：編輯器的 AI 功能打一個獨立的 Cloudflare Worker，換網域時若沒同步改它的 `ALLOWED_ORIGIN` 並重新 deploy，新網域會被 CORS 擋。｜ 範圍：換網域/編輯器 ｜ 狀態：已解決 ｜ 日期：2026-06-17

對應 SOP：換網域整體設定見 [`README.md`](../../README.md) §目前正式網域設定。

## 問題（症狀）

換到新網域後，編輯器（`src/components/editor/ImagePicker.svelte`）的「AI 找圖庫 / AI 生圖 / 推薦標籤 / 潤飾」全部出現 **「Failed to fetch」**。

## 原因（根因）

這些功能不是站台 repo 的 pm2 服務，而是打一個**獨立的 Cloudflare Worker** `appi-news-ai-suggest`（程式在 `workers/ai-suggest/`）。Worker 的 CORS 允許來源由 `wrangler.toml` 的 `[vars] ALLOWED_ORIGIN` 控制。換網域只改了前端 base URL、**沒改 worker 的 `ALLOWED_ORIGIN`** → 新網域的請求被 CORS 擋掉。

## 解法（怎麼修 + 現在怎麼維持）

換網域**必做兩件事**，缺一不可：

1. 改前端 base：`src/utils/editor/ai-worker.ts` 的 `AI_WORKER`。
2. 改 worker 來源並部署：`wrangler.toml` 的 `ALLOWED_ORIGIN` → `cd workers/ai-suggest && npx wrangler deploy`。

（2026-06-17：`ALLOWED_ORIGIN` 從 `https://yao-care.github.io` 改成 `https://appi.news`。）

## 怎麼避免重犯 / 相關

- **換網域是「前端 + worker」兩端都要動**，別只改站台這端。
- 區分兩種錯：**CORS 的「Failed to fetch」** = `ALLOWED_ORIGIN` 沒同步；**找圖回空結果** = Unsplash/Pexels/OpenAI/FAL 的 worker **secret** 問題（secret 不在 vars，deploy 不會清掉）。
- CLI 有兩個 Cloudflare 帳號，此 worker 在 `Lightman.chang@gmail.com`（account_id 已寫進 wrangler.toml）。
- 這是 `github.io → appi.news` 換網域的殘留之一；同類見 [wordpress-date-permalink-404.md](./wordpress-date-permalink-404.md)（舊網址轉址）。
