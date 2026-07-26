# YouTube 影片線：抓不到逐字稿，所以影片只能當「線索」不能當「素材」

> 摘要：主機 IP 被 YouTube 標記，yt-dlp 全 client 拿不到字幕；改用官方頻道 RSS 當線索源＋公開文字來源交叉查證，並用本地縮圖 facade 取代 iframe 保住 CLS 0 ｜ 範圍：自動化 / 效能 / 版權 ｜ 狀態：已解決 ｜ 日期：2026-07-26

## 問題（症狀）

站長要在「生活」頻道加一條線：**把 YouTube 影片變成自家文章**（起點是一支民視新聞的餐廳報導）。

直覺做法是「餵網址 → 抓逐字稿 → 改寫成文章」。實測全數撞牆：

| 取得方式 | 結果 |
|---|---|
| `curl` 抓 `youtube.com/watch` | HTML 回得來，但 `playabilityStatus = LOGIN_REQUIRED`、內含「Sign in to confirm you're not a bot」，`captionTracks` 完全不存在 |
| `yt-dlp`（`tv_simply` / `web_embedded` / `mweb` / `ios` / `tv` 五種 player_client，含 `--js-runtimes node`）| 五種**全部**回 `Sign in to confirm you're not a bot` |
| WebFetch `youtube.com/watch` | 只回頁尾導覽區，沒有標題／描述／字幕 |
| 影片描述裡的「看新聞」原文（`ftvnews.com.tw`）| `curl` 與 WebFetch **都是 403/404**（連首頁都 404） |

另一個容易被忽略的坑：站長說「我已經有 yt-dlp」，但那是**他自己電腦**上的；`find / -name "yt-dlp*"` 在主機是 0 筆。**cron 跑在主機**，所以主機沒有＝這條路不存在。

## 原因（根因）

1. **出口 IP 被標記**。本機出口在日本 Osaka，屬機房 IP 段，YouTube 對這類 IP 一律要求登入驗證。這跟 yt-dlp 版本、player client、有沒有 JS runtime 都無關，換工具救不了。
2. **台灣媒體站對境外 IP 做 geo/WAF 封鎖**。與 `civic-feeds.mjs` 檔頭記錄的「政府站多對非台灣 IP 封鎖」同源，民視自家網站連首頁都不給境外看，所以「影片描述附的原文連結」也讀不到。
3. 唯一沒被擋的是 **YouTube 官方 feed**（`youtube.com/feeds/videos.xml?channel_id=…`，HTTP 200）與 **`i.ytimg.com` 縮圖**（200）。feed 的 `<media:description>` 對新聞頻道來說就是稿頭，資訊量足夠當線索。

## 解法（怎麼修 + 現在怎麼維持）

**架構＝「影片當線索，事實靠別處查」**，不是「影片當素材改寫」：

1. **抓取層零 LLM**（`scripts/lib/video-fetch.mjs`）：訂閱頻道 RSS → 解析 Atom → 排除 Shorts（描述帶 `#Shorts`）→ 生活線關鍵字初篩 → 近 2 天 → `video-ledger.mjs` 依 `videoId` 去重。新候選 0 就不喚 LLM。
2. **寫作層必須上網**（與 `lifestyle-civic` 相反）：因為手上只有標題＋描述，LLM 要用 WebSearch/WebFetch 找同一件事的公開文字報導。
3. **硬性 gate：至少 2 個獨立於該頻道的來源，否則 SKIP**。只靠單一頻道的描述改寫成一篇＝洗稿，不是整理；查不到就不寫，寧可當天沒產出。頻道自家的連結（看新聞／APP／社群）不算獨立來源。
4. **關鍵字初篩要避開其他線的守備範圍**。第一次 dry-run 就漏進一則「消防員救人」（描述提到「餐廳」而命中美食詞），那是 `lifestyle-police` 的題。`OFF_BEAT` 因此補上消防／救護／CPR／OHCA／員警／分隊等詞。**新增生活線關鍵字時，先想它會不會搶到 civic／police／typhoon 的題。**

**影片怎麼呈現：facade，不是 iframe。** 站上基準是 mobile 90+／TBT 0／CLS 0（`PERFORMANCE.md` §4），一個 YouTube 播放器會拉進數百 KB 第三方 JS，就算 lazy 也會壓垮 TBT。改成 `scripts/save-video-thumb.mjs` 把縮圖下載成本地 webp（`public/images/<slug>-video.webp`），用 `scripts/lib/video-embed.mjs` 組一張「縮圖＋播放鈕＋連出去 YouTube」的卡：零第三方請求、零 JS、`width/height` 寫死＝CLS 0。播放鈕是純 CSS（`.video-embed` 在 `global.css`）。

**版權邊界**：影片縮圖只作為出處引用出現在正文，**不可拿來當封面**（封面走 `get-image.mjs` 圖庫真照）；正文不得大段照抄影片描述或任一來源文字；`disclosure` 要揭露線索來自哪個頻道的影片。

## 怎麼避免重犯 / 相關

- **別再花時間試 yt-dlp／各種 player client／字幕 API 繞過**。要真的拿到逐字稿只有兩條路，都需要站長明確授權：①掛登入 cookies（該 Google 帳號有被鎖風險）②走台灣境內／住宅代理。在那之前，這條線的設計前提就是「看不到影片」。
- 「某工具我已經有了」一律**在主機上驗證**（`find /` + `which`），別採信也別假設；cron 跑的是主機不是誰的筆電。
- 同源坑：`civic-feeds.mjs` 的 `reachable` 旗標（境外 IP 抓不到台灣官方站）。日後若接上台灣 proxy，這兩條線可一起放寬。
- SOP 在 [`.claude/skills/lifestyle-video/SKILL.md`](../../.claude/skills/lifestyle-video/SKILL.md)，排程與頻道清單見 [`docs/SERVER_HANDOFF.md`](../SERVER_HANDOFF.md) §子專案 3。
