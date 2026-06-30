# PSI 剛部署暴跌：冷邊緣假象，別對假問題改程式

> 摘要：剛部署後 PSI 量到 mobile 55、FCP 10s+，看似效能退步，實為 GitHub Pages CDN 冷邊緣 + PSI 對固定 URL 釘住舊跑的假象；**低流量站連 cb 都暖不回 PSI 的 POP，判健康改看暖讀 FCP/TBT/CLS/可修成因而非總分**（見低流量站追記）。｜ 範圍：效能量測 ｜ 狀態：已知/有解法 ｜ 日期：2026-06、2026-06-30

對應 SOP：[`PERFORMANCE.md`](../../PERFORMANCE.md) §3（效能驗收用第三方 PSI）。

## 問題（症狀）

剛部署完用 PSI 量線上站，分數暴跌（首頁卡 55），個別頁面 FCP/LCP 暴增到 **10s+**，看起來像剛改的東西把效能弄壞了。

## 原因（根因）

兩個量測陷阱疊加，跟程式無關：

1. **CDN 冷邊緣**：新部署的大站，許多 GitHub Pages CDN 邊緣仍是冷的，每個資源冷 TTFB 疊加 → 個別頁面 FCP/LCP 暴增。等暖（下次 6 小時 cron 重建或自然流量帶暖）才是真值。
2. **PSI 對固定 URL 釘住舊跑**：PSI 會把某次（常是冷跑）結果快取在該網址，之後重複量同一 URL 會一直回同一筆數字（連小數都一樣），就算邊緣已暖也不動。

## 解法（怎麼修 + 現在怎麼維持）

- **破解 PSI 釘住**：在網址加 `?cb=<timestamp>`（GitHub Pages 靜態頁忽略 query、內容相同），強制 PSI 重跑。（2026-06-15 實測首頁無 cb 卡 55、加 cb 立刻 91；**但低流量站此招不再保證有效，見下方追記**。）
- **等暖再下結論**：剛部署別急著判退步，等下一輪 cron 或自然流量暖機。

## 怎麼避免重犯 / 相關

**判讀準則**：先看 **TBT / CLS / render-blocking / 各請求耗時**。若這些都正常，只有總分低，幾乎一定是冷邊緣假象 → **不要對假問題改程式**。真有退步時這些指標會一起壞。

> 本機與 CI 的 Lighthouse 會抖（~60–96 亂跳），不可當準；一律以線上 PSI（加 `?cb=`）為準。詳見 `PERFORMANCE.md` §3。

## 低流量站追記（2026-06-30）：cb 也救不回時怎麼改判

**症狀**：站長看到 CI Lighthouse perf 0.82、PSI mobile ~0.55，要求修。照上面「加 cb 立刻 91」去跑，**加了 cb 還是 55**（FCP 8–14s、LCP ~14s），跟舊紀錄矛盾。

**根因（比原文深一層）**：

- 原文「加 cb 立刻 91」是 2026-06-15 量的，當時 POP 較暖。**cb 只能破解「PSI 釘住同一 URL 的舊跑」，並不能讓 PSI 自己用的 POP 變暖。**
- 本站流量極低（gtag 才上線兩週、週使用者約 200），**PSI 從它最近 POP 抓站、那個 POP 長期是冷的**，且**沒有 CrUX field data**（流量不足）可拿真實使用者數據佐證 → mobile lab 慣性吃冷邊緣、分數偏低。**這是「低流量站 + GitHub Pages + PSI lab」的結構性現象，不是程式退步。**
- 旁證：同頁同邊緣，desktop FCP 1.5s 但 mobile 14s（mobile 有 4× CPU + slow-4G 節流，把冷 POP 的取檔延遲放大）。

**決策樹（cb 也低分時，怎麼判頁面到底健不健康）**：

1. **暖讀 FCP**：本機 `curl` 同一 URL 連打數次把邊緣打暖，PSI 偶爾碰到暖 POP 會給 FCP ~1.2s；只要出現過一次正常暖讀，就證明頁面本身快。
2. **Lighthouse 有沒有指出「可修成因」**：`render-blocking-resources`、`network-requests` 最慢項、`lcp-lazy-loaded`、`prioritize-lcp-image` 若**全 None/空**，代表 Lighthouse 自己都歸不出原因 → 純冷邊緣，**沒東西可改**。
3. **核對實體**：直接 `curl` LCP 主圖看大小/耗時（本站 hero = 74KB webp、0.23s）、HTML 大小、TBT/CLS。都正常就結案，別動程式。

**唯一從這次診斷生出的真實改動**：LCP hero 圖原本 `loading="eager"` 卻沒 `fetchpriority="high"`，已補（對真實慢網路使用者有益，但**不會改變 PSI 冷邊緣分數**——別期待補完分數就跳）。見 `PERFORMANCE.md` §5。

**一句話**：低流量站的 PSI mobile lab 慣性偏低是冷邊緣常態；**判健康看「暖讀 FCP + TBT/CLS + Lighthouse 有無可修成因 + 實體資源大小」，不是看那個總分**。
