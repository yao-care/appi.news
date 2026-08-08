# 文章頁的 mobile TBT 全是 gtag.js 撐出來的：拆掉它，自己送 GA4 collect

> 摘要：`gtag.js` 是文章頁**唯一**的主執行緒阻塞來源（受控 A/B：TBT 中位 406→30ms、TTI 從鎖死 ~8s 掉到 ~2s），而且它已被推到 `load`+`requestIdleCallback`、沒有再往後推的空間；改成 inline 自送 `/g/collect` beacon。參數集不是猜的，是用 headless Chrome 攔真 gtag 封包比對出來的。｜ 範圍：效能 / 數據埋點 ｜ 狀態：已解決 ｜ 日期：2026-08-08

## 問題（症狀）

前一天量文章頁效能時發現 mobile 暖跑 TBT 是 **140–215ms**，不是 `PERFORMANCE.md` §4 寫的 0，歸因指向 GA4 的 `gtag.js`（見 [`reader-index-and-beacon-contract.md`](./reader-index-and-beacon-contract.md) 追記）。當時只做了歸因、沒有處理。

正式處理時把它量乾淨（本機同機交替 A/B，複製建置後的 HTML 成兩份，只差 GA snippet，`python3 -m http.server` 本地服務、`lighthouse@12 --form-factor=mobile --throttling-method=simulate`）：

| | TBT 中位 | TTI | performance 中位 |
|---|---|---|---|
| 有 gtag.js | ~406ms | **恆 7.9–8.1s** | 77 |
| 無任何 analytics | 0ms | 1.7–3.5s | 93 |

（絕對值被這台 4 核機的負載放大了，線上暖跑是 140–215ms；A/B 看的是差分。）

最刺眼的不是 TBT 而是 **TTI 被鎖在 ~8s**：gtag 排在 `load` + `requestIdleCallback` 之後才執行，那個長任務讓「主執行緒連續安靜 5 秒」的判定重新計時，TTI 只能落在它後面。**這代表「再往後延一點」這條路已經走到盡頭**——延得越後面，TTI 越晚，而且長任務會正好落在讀者開始捲動的當下。

## 原因（根因）

`gtag.js` 約 90KB 第三方 JS，光解析執行就要 130–220ms 行動裝置主執行緒時間。而本站對 GA4 的實際需求只有：page_view、停留時間、一個自訂事件（`/submit` 的 `generate_lead`）、以及 `content_group`。用一整套標籤管理器換這四件事，成本效益不成立。

## 解法（怎麼修 + 現在怎麼維持）

`src/components/seo/Analytics.astro` 不再載入 `gtag.js`，改成整段 inline 直接對 `https://www.google-analytics.com/g/collect` 送 `navigator.sendBeacon`：零第三方請求、零長任務、page_view 在 head 解析當下就送出（連秒退的讀者都算得到，不像「等互動才載入」那種做法會少算）。

**參數集怎麼來的（這是本篇最該複製的方法）**：不要憑記憶或部落格文章拼參數。用 headless Chrome 開一份「拿掉 hostname 守門」的建置產物，攔截送往 `google-analytics.com` 的請求並印出完整 query string，就拿到真 gtag 的 ground truth：

```js
// puppeteer-core + 既有的 /root/.cache/puppeteer/chrome/*/chrome-linux64/chrome
await page.setRequestInterception(true);
page.on('request', (r) => {
  if (r.url().includes('google-analytics.com')) { console.log(r.url()); r.respond({ status: 204, body: '' }); }
  else r.continue();
});
```

⚠️ 攔截時**一定要 abort 或 respond 204**，不要讓它真的送出去——不然本機測試會把 `dl=http://localhost/...` 的假資料灌進正式 GA4 資源（這次前半段跑 lighthouse A/B 時就灌了約 21 個 `/__ab/on/` 事件進去）。

這樣比對出來的關鍵事實：

- `content_group` 在封包裡是 **`ep.content_group`**（字串事件參數前綴 `ep.`，數值是 `epn.`），不是 UA 時代的 `cg1`。
- POST，參數全在 query string，body 空的。
- 只有 `v/tid/cid/sid/sct/seg/_s/_p/en/dl/dt/ul/sr` 這些是骨幹；`gtm`/`gcd`/`tag_exp`/`uaa` 等一大票是標籤管理器自己的東西，**不送也照樣收得到**（實測驗證，見下）。

**session 與身分**：

- `cid` 沿用 gtag 時代寫下的 `_ga` cookie（格式 `GA1.1.<a>.<b>`），並用同格式寫回。既有讀者不會整批被算成新使用者，`newVsReturning` 不斷層，日後要回退成官方 gtag 也接得上。
- session 狀態自己存 `_appi_ga`（`sid.sct.seg.lastHit`），**不去解析 gtag 的 `_ga_<id>` cookie**——那個格式不公開且改過版。30 分鐘無活動換 session（GA4 的定義）。
- `seg`（engaged session）三條件照 GA4：同 session 第 2 個以上 page_view、前景滿 10 秒、有自訂事件。
- 停留時間走 `visibilitychange`/`pagehide` 結算成 `user_engagement` + `_et`（GA4 的 `userEngagementDuration` 由此而來），送出後歸零，重複 flush 不會重複計時。

**其他站上契約**：`window.gtag` 補了同介面墊片，`/submit` 的 `gtag('event','generate_lead',{form_type})` 呼叫端不必動。`dl` 一律去掉 fragment——LINE 派送網址帶的 `#r=<short_id>` 不該進到達網頁報表（`ReadingBeacon` 也會抹掉它，但那發生在本段之後）。站內 referrer 不送 `dr`，否則 GA4 會把自己算成 referral 來源、蓋掉真正的 organic/social 歸因。

**驗證方式（三層，缺一層都不算驗過）**：

1. **協定層**：用「新元件會產生的參數集」實打一發到正式資源，`dt`/`dl` 做成可識別的 `SELFTEST`，再用 GA4 **realtime API** 確認 Google 真的收下。同時打一發完整 gtag 參數集當對照——兩邊都進得去，才證明「精簡參數集沒被丟掉」。
2. **邏輯層**：把**建置後**的 inline script 抽出來丟 `node:vm` 配假 DOM 跑（同 `ReadingBeacon` 的做法）：首訪、非正式網域、沿用舊 `_ga`、同 session 第二頁、逾時換 session、engagement 結算與不重複送、gtag 墊片、fragment 去除、站內/站外 referrer、utm 轉 `cs/cm/cn`。
3. **效能層**：重跑同一套受控 A/B，確認 TBT 與 TTI 回到「等於沒有 analytics」的水準。

**上線後的線上驗收（2026-08-08）**：真瀏覽器開線上文章頁，全頁**零第三方網域**、只有一發 collect，參數（含 `ep.content_group`）正確。PSI mobile 連抓到兩次暖跑（FCP 1.0s / 1.2s）：

```
score=100  LCP=1.7s  TBT=0ms  CLS=0  TTI=1.7s  bootup-time=0.0s
```

對照拆掉前的暖跑：TBT 140–215ms、gtag scripting 216–225ms。第三次是冷跑（FCP 5.7s、score 64、TBT 0）——**冷跑的 TBT 恆為 0，不能當證據**，只取 FCP<3s 的那幾次看。

## 怎麼避免重犯 / 相關

- 🔴 **GA4 realtime API 有幾分鐘延遲，150 秒內查不到不代表沒收到**。第一次自我測試連查 10 次（150s）全是 0 rows，差點誤判「精簡參數集被 GA4 丟掉」；幾分鐘後再查，那批事件全都在。**判「有沒有收到」至少等 5 分鐘，而且要看 rows 總數**（rows=0 連別人的真流量都沒有，那是延遲；rows>0 卻沒有你的，才是真的沒收到）。
- **一次 page_view 在報表裡會變成 3 個事件**：帶 `_ss=1` 會生 `session_start`、帶 `_fv=1` 會生 `first_visit`。看 `eventCount` 時別以為重複送了。
- **要改送出欄位前，先照上面的方法重抓一次真 gtag 封包再比對**，不要憑記憶加參數。會因為漏送而靜默劣化的消費端：`weekly-data` / `growth-audit` / `section-report` / `topic-tracker` / `audience-report` / `funnel-report` / `ai-signals-report`。
- **放棄掉的東西要知道**：GA4 的自動增強型評估（scroll、outbound click、file_download、影片）沒有了——本站目前沒有任何報表消費這些事件。真要哪一個，自己在對應互動點呼叫 `gtag('event', ...)` 墊片即可，不必把整包 gtag.js 請回來。
- **本機測第三方埋點一定要斷網或攔截**，否則污染的是正式資源的當日資料。
- 相關：[`reader-index-and-beacon-contract.md`](./reader-index-and-beacon-contract.md)（歸因過程、PSI 暖不起來時的兩段式量法）、[`psi-cold-edge.md`](./psi-cold-edge.md)（冷跑 TBT 恆為 0，不能拿來宣稱達標）。
