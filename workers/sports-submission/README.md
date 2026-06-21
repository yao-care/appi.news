# sports-submission worker

學生賽事「拉式投稿」收件 Worker（Phase 4）。學校／隊伍／主辦單位主動提供賽事資訊 →
收件、防濫用（選配 Turnstile）、轉到 Slack 供編輯**人工審核**。不自動發文、不自動回信。

## 端點
- `POST /submit`：收一筆投稿（JSON，欄位見 `src/index.ts` 的 `Submission`），驗證 + 轉 Slack。
- `GET /health`：ok。

## 設定
```bash
cd workers/sports-submission
wrangler secret put SLACK_BOT_TOKEN     # 必填：與全站一致的 bot token（chat.postMessage）
wrangler secret put TURNSTILE_SECRET    # 選配：設了才驗 Turnstile
wrangler deploy
```
收件頻道 `SLACK_CHANNEL` 在 `wrangler.toml`（運動台 `C0BC106C42E`）。bot 須在該頻道內。
`ALLOWED_ORIGIN` 在 `wrangler.toml`，換網域要同步改並 redeploy（CORS）。

## 前端
投稿表單頁：`src/pages/sports/submit.astro`，POST 到本 worker 的 `/submit`。
表單的 worker URL 與（選配）Turnstile sitekey 在該頁頂端常數，部署後填上。

## 安全
- 純收件 + 轉 Slack，不觸碰 repo、不發文、不寄信。
- 投稿含個資（聯絡人/聯絡方式）：只進 Slack 私有頻道供人工處理，不寫入 repo、不公開。
