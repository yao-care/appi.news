# 批次改存量文章的四個坑（2026-08-22 全量存量升級實踩）

> 一句話：一次動幾百篇存量（改 title/description/補內鏈）時，會踩到四類「單篇手改不會遇到」的 build 炸點，全部有機械解法。

背景：2026-08-22 依 GSC 資料對約 570 篇存量做 A1/A2/B2 批次升級（多代理平行改檔、分波 commit）。build gate 前後炸了四輪，原因與解法如下。

## 1. `updatedDate` 重複 key

**問題**：舊文的 `updatedDate` 可能在 frontmatter 後段（不在前幾行），代理在前段再加一個 → YAML duplicated mapping key，content collection 解析直接炸。
**解法**：加欄位前先 `grep` 整個 frontmatter；批次收尾用 `awk '/^---$/{c++} c<2' file | grep -c '^updatedDate:'` 逐檔驗 ≠1 即炸。

## 2. 未來排程稿不能加 `updatedDate`

**問題**：`status: scheduled` 且 `publishDate` 在未來的排程稿，加上今天的 `updatedDate` 會觸發「updatedDate 早於 publishDate」ERROR。
**解法**：批次改檔前先排除 publishDate > 今天的檔；事後掃描：比對每檔兩個日期，updated < publish 即修。注意日期可能帶引號也可能不帶，sed 兩種格式都要吃（`/^updatedDate: *"*2026-…/`）。

## 3. 原生 HTML 段落（FAQ 區）內不能用 Markdown 連結

**問題**：不少存量文的 FAQ 是原生 `<p>` HTML，Markdown `[文字](/articles/…)` 在裡面不會渲染，validation ERROR。而且這個檢查**分檔漸進爆**，一輪 build 只報一部分，逐輪修會修四輪。
**解法**：插內鏈時看清楚目標段落是 Markdown 還是 HTML；炸掉後不要逐檔修，直接全站掃「含 `<p` 且含 Markdown 連結」的行一次轉 `<a href>`。

## 4. 觸碰舊文任何一行＝整檔脫離 grandfather

**問題**：`check-content` 只掃「變動檔」，存量的 AI 腔原本不受硬 gate 約束；但只要改了 title 或插一條內鏈，整檔進 gate，舊句的「不是X而是Y」「換句話說」等 tell 全部現形變 ERROR。
**解法**：a) 插內鏈用**獨立新段落**，別把既有句子帶進 diff；b) 還是炸的話就地最小改寫該句（不動語意），這也是順手清存量 AI 腔的機會。

## 怎麼避免重犯

每輪批次的收尾檢查清單（全部機械可跑）：重複 key 掃描 → 日期先後掃描 → HTML 段 Markdown 連結掃描 → `pnpm check:content` → `pnpm build && pnpm check:links`。另：slug 對照與轉址坑見既有記憶（growth-audit 的 URL 是 slug 不是檔名）。
