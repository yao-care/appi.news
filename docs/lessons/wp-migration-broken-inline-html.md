# WordPress → Astro 遷移遺留的破損 inline HTML（頂部重複 FAQ／巢狀 table／blockquote 內 hr）

> 摘要：76 篇 wp-* 文章帶有遷移產生的破損 inline HTML，用確定性腳本一次掃修 ｜ 範圍：內容/遷移 ｜ 狀態：已解決 ｜ 日期：2026-07-08

## 問題（症狀）

改兩篇髖關節痛文章（`hip-pain-symptoms-causes-treatment`／`hip-pain-which-specialist`）時發現三種破損標記，一掃才知**遍布全站 wp-* 文章**：

- **A 頂部重複裸問句 FAQ**：body 一開頭（frontmatter 後）就有一組沒包任何 HTML 的「問句？\n答案」純文字，擠在 intro 上方——它是文末真 FAQ 的重複副本。渲染時整組黏成一坨純文字，出現在正文之前，很醜也稀釋開頭。
- **B 巢狀 `<table>`**：一個多餘的外層 `<table>` 殼包住真表，形成 `<table> … <table>…</table> … </table>`。有兩種變體：外層開緊接內層開；或外層開與內層開之間夾一段 `<p>` 說明（caption）。HTML parser 會把內容 hoist 出去、留一個空 `<table>`，或把後面的段落/`<hr>` 誤包進表格。
- **C 跑進 `<blockquote>` 的 `<hr>`**：`<hr>` 出現在 `</blockquote>` 之前、被包在引言塊裡，語意錯誤。

盤點結果：A 222 處／74 檔、B 68 處／61 檔、C 54 處／37 檔。

## 原因（根因）

WordPress → Astro 的一次性內容搬遷（見 [`../../MIGRATION_NOTES.md`](../../MIGRATION_NOTES.md)）產生的機械轉換殘留：FAQ 區塊被同時塞到頂部與底部、表格被多包一層 `<table>`、`<hr>` 分隔線落在引言塊內。build 不會報錯（Astro 容忍畸形 inline HTML），`check:links` 也不看標籤結構，所以這些破損**靜默存活**、不會被既有 gate 擋下，只有肉眼看渲染或逐檔讀原始碼才會發現。

## 解法（怎麼修 + 現在怎麼維持）

用確定性 node 腳本一次掃修：[`scripts/maint/fix-wp-migration-markup.mjs`](../../scripts/maint/fix-wp-migration-markup.mjs)（`--dry-run` 只印不寫、`--only a,b` 限定檔）。原則：**只改 100% 能確定的，曖昧整檔跳過並列印清單**（no silent caps；本次 0 跳過）。各型態的安全判定：

- **A**：取 body 前導區塊（跳過前導空行、到第一個空行為止），必須是**偶數行、Q/A 交替**（偶 index 問句以 `？` 結尾、奇 index 答句不以 `？` 結尾、問句非 `<` 開頭）。**安全閘：首問句必須在區塊之後的內文再次出現**（＝底部有真 FAQ），才刪頂部，確保不丟內容。單行的修辭型 intro（如「你有沒有發現…？」）因非交替、非重複而正確略過。
- **B**：某個 `<table>` 在遇到 `<tr>/<thead>/<tbody>/<caption>/<colgroup>` 之前先遇到另一個 `<table>`，即判定為多餘外層殼（中間夾 `<p>`/文字/`<img>` 也算）。刪外層開那行＋其後**第 2 個** `</table>`（第 1 個是內層真表的閉合），中間的 caption `<p>` 保留成表前說明。結構更深（兩個 close 之間又冒出 `<table>`）則保守跳過。
- **C**：`<hr>` 緊接（僅空行）`</blockquote>` → 換成 `</blockquote>` 後才 `<hr>`。

**驗收鏈**（每次跑完必走）：`pnpm build` 綠 → `pnpm check:links` 0 壞連結 → 對全改動檔的 **dist HTML** 掃 `<table></table>`（空表）與 `<table>…<table>`（殘留巢狀）皆為 0 → 抽驗表格 `<tr>` 列數與底部 FAQ 問句仍在（內容保全）。原始碼層再確認每檔 `<table>` 開/閉數平衡。

## 怎麼避免重犯 / 相關

- **未涵蓋的子型態**：重複 `<h4>` 緊接同文字 `<h3>`（極少、文字不一定相同）、單獨的空 `<table></table>`——留待人工個案，別硬塞進自動規則。
- **底部 FAQ 升級成 `常見問題` H2 + 逐題 H3**：屬內容結構強化（非破損修復），本次只在兩篇髖關節痛文章手動做；要全站化需另案，別和「修破損」混在一起自動跑。
- 未來若再有一批 WP 匯入，先跑本腳本 `--dry-run` 盤點，別假設 build/check:links 綠就代表標記乾淨——**這兩個 gate 看不到畸形 inline HTML**。
- 相關：換網域與轉址坑見 [`wordpress-date-permalink-404.md`](./wordpress-date-permalink-404.md)；此次起點（反思層競品比對牽出這批文章）見 seo-ops 反思層。
