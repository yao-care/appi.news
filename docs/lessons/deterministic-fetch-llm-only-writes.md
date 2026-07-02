# 自動內容線的「抓資料」要用固定程式，不要交給 LLM agent

> 摘要：警消好人好事線 exit 124 逾時，根因是「抓取整段交給 LLM agent（逐站 WebFetch、還自己翻頁重抓，慢又發散）＋凌晨多條線擠同一個 5 小時 session 視窗撞 rate limit，而 claude CLI 撞限額時會 hang 到被 timeout 砍」。解法：抓取改固定 node 程式，LLM 只做「挑選＋寫作」。 ｜ 範圍：自動化 ｜ 狀態：已解決 ｜ 日期：2026-07-02

## 問題（症狀）

- `lifestyle-police`（警消好人好事）cron 回報 **exit 124**（`timeout 1200s 被中止`），且 6/26 起連續 6 天沒有產出。
- 一開始誤判成「weekly 額度耗盡」——但站長指出**額度是夠的**，超額會有明確 limit 訊息、不會是這種逾時。
- 也誤判成「14 個警局來源太多、任務本來就大」。

## 原因（根因）

實際重現（額度足夠時計時跑）後才看清三件事，都不是「額度不夠」：

1. **抓取整段交給 LLM agent**：舊 `buildPolicePrompt` 把 14 個警局 URL 丟給 `claude-appi`，要它自己 `WebFetch` 逐站抓、判斷、查證、再寫作。實測一次要 34+ 次 WebFetch、往往還**自己翻到第二頁、重抓同一站**（Sonnet 5 想「湊滿代表性」的自主行為，prompt 沒禁止），光抓資料就 ~565s，純燒 LLM 額度做本來不需要 LLM 的事。
2. **session 視窗（非 weekly）被凌晨排程疊加撞爆**：`focus-esg 01:30 / lifestyle-deals 02:00 / international-desk 02:30 / lifestyle-police 03:50`（UTC）＋ heartbeat/weekly-report，6 條線擠在同一個滾動 5 小時 session 視窗；`international-desk` 又一次呼叫很多次。輪到最後跑的 police，session 額度已被前面耗掉 → 撞 `session limit`。
3. **claude CLI 撞 rate limit 時會 hang**：撞限額不一定快速失敗退出，有時會卡住等 reset，於是被外層 `timeout 1200` 砍成 exit 124。（對比：`.mjs` 用 stdout regex 偵測 weekly limit 時是快速 die；session limit 這條 hang 就漏接了。）

## 解法（怎麼修 + 現在怎麼維持）

把 police 這條線改成跟 `international-desk`（GDELT 固定源）一致的架構：**固定抓、LLM 只寫**。

- `scripts/lib/police-fetch.mjs`：固定抓取層（零 LLM）。用 `curl`（處理金門 TLS、臺東 UA）抓各站列表 → 各站 parser 解析 → 近 N 天過濾 → **關鍵字初篩（先排除執法/宣導詞、再要求正面善行詞）** → 查證連結 2xx → 抓詳情正文 → 產候選清單。
- `scripts/lib/police-parsers*.mjs`：各 CMS 的純函式 parser（News.aspx 一支覆蓋 6 站；其餘各站一支）。純函式、可單元測試、無網路 I/O。
- `buildPolicePrompt(candidates, recent, days)`：改成吃「已抓好＋已驗證的候選清單」，明令 LLM **不要自己上網抓、WebFetch 或翻頁**，只挑選＋寫作、連結原封照用。
- 主協調器：先固定抓，**零候選就直接結束、不呼叫 LLM**（省額度、避免撞限額）。

效果：LLM 消耗從「34+ 次 WebFetch＋大量 thinking」降到「一次讀清單＋寫作」；不再發散翻頁；沒好人好事的日子零 LLM。關鍵字初篩實測把「青春專案守護青少年」「感謝捐助查緝毒駕」「取締毒駕」等誤收全部擋掉，只留真正的助人/尋回/救援。

## 怎麼避免重犯 / 相關

- **新自動內容線的抓取一律用固定程式**（RSS/HTML parser/開放資料 API），LLM 只做「判斷＋寫作」。把整段蒐集交給 agent＝慢、發散、燒額度、難重現。對照範本：`international-desk`（GDELT）、本線 `police-fetch`。
- **分清「逾時（exit 124）」與「撞額度（limit 訊息）」**：exit 124 是 `timeout` 砍的，可能是任務真的慢、也可能是 CLI 撞限額 hang。別看到逾時就歸咎額度；反過來，額度足夠仍逾時多半是流程本身有問題，要進去實測重現，不要猜。
- **cron 排程別全擠同一個 5 小時 session 視窗**：多條 `claude-appi` 線集中在凌晨會疊加撞 session limit（與 weekly 額度無關）。降低單線消耗（如本次重構）或錯開時段都能緩解。
- 帳號/模型/限額的其他坑見 [automation-model-and-account-split.md](./automation-model-and-account-split.md)；發佈端生效/UTC/pull 見 [automation-runtime-staleness.md](./automation-runtime-staleness.md)。
