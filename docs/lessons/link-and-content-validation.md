# 連結查證與內容驗證的假陽性：別據此誤刪/誤報

> 摘要：驗外部連結死活、跑內容檢查、抽 frontmatter 時，有三類「看起來壞但其實沒壞」的坑，誤判會刪掉好連結或漏掉一批文章。｜ 範圍：內容/查證 ｜ 狀態：已知/已修 ｜ 日期：2026-06-17

對應 SOP：根 `CLAUDE.md` §內容紀律（所有資料附可連線來源、逐條查證）。

## A. 外部連結查證的三類「假死」

驗 appi.news 文章外部連結存活時，`curl`/`WebFetch` 會有三類假死，**別據此誤刪好連結**：

1. **某些網域對所有自動化一律回 404/403**：fda.gov、drugs.com、goodrx、washingtonpost…（Akamai 擋 bot，fda.gov 連首頁對 curl 都回 404）。→ 改用 `WebSearch` 確認該機構現行官方 URL。
2. **gov.tw / org.tw 用 curl 預設常回 `000`**（hpa.gov.tw、tfda.gov.tw…）：是本主機的 IPv6 連線坑 → 加 **`curl -4`** 走 IPv4 多半就 200。
3. **連結抽取 regex `[^)"]+` 會把帶括號的 URL 截斷**（Wikipedia `..._(film)`、WHO `...salmonella-(non-typhoidal)`）→ grep 出的殘缺 URL 假性 404；比對原文完整 URL 再驗。

**真死連結判準**：在「平常會正常回應 bot 的網域」（cdc.gov、escardio.org、harvard.edu、nist.gov…）上回 404，才是真搬移/下架。（2026-06-17 全站 486 條外部連結逐條驗，只有 13 條真死，PR #31。）

## B. validate-content 的 legal 字眼誤報（已根治）

- **問題**：`scripts/validate-content.mjs` 原本只要 title/description/tags 出現法規/合規/法律… 且 `disclaimerType≠legal` 就 warn，對遷移舊文永遠誤報、清不掉。
- **原因**：`disclaimerType` 是單一值（health→medical、finance→financial 已佔位，無法再疊 legal）；且法律字眼多只在 description/tags 順帶提及。
- **解法**：PR #32 改為「**只在標題本身即涉法律字眼、且尚未設任何特定免責**」才提醒。現在應 **0 warning**；若再出現，是「標題真的在談法律卻掛 general 免責」的真實案例，不是誤報。

## C. frontmatter 引號不一致 → 用 quote-agnostic 解析

- **問題**：批次掃描/改寫文章欄位時，**靜默漏掉一批文章**。
- **原因**：`*.md` 的 frontmatter 欄位有些有雙引號、有些是無引號 YAML 純量（`slug: post-636` vs `title: "…"`），兩種都合法；用 `awk -F'"'` / `grep '^slug: "post-'` 這種「假設一定有引號」的抽取法會漏掉無引號那批（2026-06 做 GEO 時漏了 post-636）。
- **解法**：一律用 quote-agnostic 解析（`(?m)^key:\s*(.*)$` 取值後再 strip 成對引號）；改完再跑一次 YAML-aware 全站重掃確認 0 殘留，別只信第一輪 grep 的數字。
