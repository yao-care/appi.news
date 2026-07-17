# 自動內容線的「抓資料」要用固定程式，不要交給 LLM agent

> 摘要：警消好人好事線 exit 124 逾時，根因是「抓取整段交給 LLM agent（逐站 WebFetch、還自己翻頁重抓，慢又發散）＋凌晨多條線擠同一個 5 小時 session 視窗撞 rate limit，而 claude CLI 撞限額時會 hang 到被 timeout 砍」。解法：抓取改固定 node 程式，LLM 只做「挑選＋寫作」。 ｜ 範圍：自動化 ｜ 狀態：已解決 ｜ 日期：2026-07-02
>
> 續（2026-07-17）：**同一原則也適用「變化偵測」，不只是「抓取」。** 颱風守望每 15 分鐘跑，前置 gate 只用 curl 判斷「有沒有停課」，「有沒有『變』」卻留在 sonnet 裡判——多日事件期間每輪都 fail-open 叫起完整 session，光是判「跟上次一樣沒變(SAME)」就燒掉一個 session，一天 ~96 個空轉把 5h 上限燒穿。解法：把內容簽章比對提到 gate（只取各縣市公告區塊、排除「更新時間」時鐘），沒變就不叫 sonnet。見末節。

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

## 續（2026-07-17）：變化偵測要在 gate 做，別讓 LLM 每輪空轉判斷「沒變」

**問題**：颱風守望 `lifestyle-typhoon.sh` cron 每 15 分鐘跑。原前置 gate 只 `curl nds.html | grep 無停班停課訊息`——這只分得出「有沒有停課」，分不出「停課內容有沒有變」。花蓮萬榮堰塞湖那種**多日持續**事件期間，官方頁一直有停課字樣 → gate 每輪都 fail-open → 每 15 分鐘叫起一個完整 `claude-appi` session。而「這次跟上次一樣沒變(SAME)」的判斷是**寫在 sonnet 裡**的，所以連「確認沒變、安靜結束」都要付一個完整 session 的錢：一天 ~96 個 no-op session，把滾動 5h session 上限燒穿（log 實測撞頂 229 次）。`fa5dfec` 只把撞頂後每 15 分鐘洗一則 ❌ 的**噪音**靜音，**空轉消耗本身沒解**。

**根因**：跟本篇主線同一個病——一個**可以確定性判斷**的東西（內容變沒變）被留在 LLM 裡，於是 LLM 每輪都得跑。撞頂後的失敗其實很便宜（秒退），真正燒額度的是撞頂**之前**那一串「跑完整 session 只為得出 SAME」。所以別把因果講反成「失敗迴圈燒額度」——是**空轉的成功迴圈**先燒穿，失敗只是後果。

**解法**：把內容簽章比對提到 `.sh` 純資料前置 gate。
- 抓一次 `nds.html`，「無停課」判斷與簽章比對共用同一份（省二次抓取與競態）。
- 簽章＝各縣市停班課公告區塊（`headers='StopWorkSchool_Info'` 的列）＋公告日期（`NNN年M月D日`）的 sha256。**刻意排除「更新時間：YYYY/MM/DD HH:MM:SS」時鐘**——那串每次抓都跳，含進去簽章就每次都不同、等於沒做（這是最容易漏的雷）。公告日期要保留，否則同樣「今天停止上班」字樣跨日不會觸發更新。
- 簽章與上次「**已成功處理**」者相同 → 安靜結束、不叫 sonnet。
- 只有 sonnet **成功跑完**（含確認 SAME）才把簽章寫到 worktree 外的持久檔 `/root/.local/state/appi-news/typhoon-gate-sig.txt`；撞上限/失敗**不寫** → 下一輪照重試，額度重置後自然補上，**不會漏報**。
- 抓取失敗／非 200／算不出簽章 → 簽章留空、不比對，照 **fail-open** 走完整流程（絕不為省額度漏掉真的停班課）。

效果：多日事件從一天 ~96 個完整 session 壓到「只有官方清單真的變動時才跑」（整起事件個位數次）。

**怎麼避免重犯**：新自動線只要是「**高頻輪詢、大多數輪次沒有新東西**」的形狀（颱風、停電、法規異動守望…），去重/變化偵測就一定要放在**叫 LLM 之前的確定性 gate**，而且簽章**只框真資料、排除任何時鐘/流水號/隨機 nonce**。判斷「還要不要叫模型」本身別花一次模型呼叫。
