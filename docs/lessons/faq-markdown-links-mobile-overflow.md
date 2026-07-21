# FAQ 用 Markdown 連結寫在原生 `<p>` 裡 → 連結不渲染＋手機水平溢出

> 摘要：常見問題區塊用 `[文字](網址)` 寫在原生 `<p>` HTML 內，Markdown 不處理 → 整串含網址變成字面文字，長網址在手機撐破版面（左右被裁）｜ 範圍：版面/效能/內容 ｜ 狀態：已解決 ｜ 日期：2026-07-21

## 問題（症狀）

手機開文章頁，**整個主內容欄往左位移、左側字被裁掉**（麵包屑「首頁」少「首」、標題與作者名左緣被切），右側留白。header 正常。

## 原因（根因）

用 chromium（Playwright）在 390px 量測：`document.scrollWidth = 411 > viewport 390`，有 21px 水平溢出；溢出的葉節點是**第一個 FAQ 答案的 `<p>`**（內容比容器寬 49px）。

根因兩層：
1. **FAQ 區塊是原生 HTML `<p><strong>問</strong><br>答…</p>`（見 newsroom SKILL 的 FAQ 樣板）。答案裡若用 Markdown 連結 `[錨文](https://…長網址)`，Markdown 不會處理原生 HTML 區塊內的 inline 語法**，於是 `[錨文](https://udn.com/news/story/7266/9535477)` 整串（含**裸網址**）變成字面文字顯示。
2. 裸網址是**不可斷的長英數字串**，中文段落裡它撐到 ~399px、比手機內容欄（350px）寬，造成整頁水平溢出。頁面沒有任何 `overflow-x` 防護，一個溢出元素就把置中的 `.container` 推到視窗左外，全欄左移。

兩個常見誤判要避開：
- **不是圖片**：`img { max-width:100% }` 是全域的，圖片沒問題。
- **不是表格**：`participate`/`why-now` 有表格但實測 `scrollWidth=390` 沒溢出；出事的 `medical` 反而沒表格。真兇是 FAQ 裸網址。

## 解法（怎麼修 + 現在怎麼維持）

1. **FAQ 連結一律用 `<a href="…">錨文</a>`，不要用 Markdown `[](url)`**（原生 HTML 區塊內 Markdown 不生效）。已把三篇 FAQ 的 `[文字](url)` 轉成 `<a>`（順帶修好：這些連結本來是壞的、還露出裸網址；`extractFaq` 會 `stripHtml`，所以 JSON-LD 也一起變乾淨）。
2. **手機安全網（`src/styles/global.css`）**：
   - `.article-body { overflow-wrap: break-word }` → 任何長網址/英文長字撐不破版面（**站台其它文章的 FAQ 即使還有裸網址，症狀也被這條擋住**）。
   - `.article-body :is(table) { display:block; max-width:100%; overflow-x:auto }` → 寬表格在自己容器內橫捲，不讓整頁水平溢出（呼應站規：頁面 body 不得水平捲動）。
3. **驗收方式（沒有瀏覽器就裝 playwright-core 用快取的 chromium）**：`document.documentElement.scrollWidth` 必須等於 viewport 寬；量到 >viewport 就抓「自己 scrollWidth>clientWidth 的葉節點」找真兇。三篇修後 390=390、零溢出，截圖確認左右邊界正常。

## 怎麼避免重犯 / 相關

- **寫 FAQ 一律 `<a href>`**：newsroom SKILL 的 FAQ 樣板本來就是 `<a href>`；產線/agent 若改用 Markdown 連結就會中這個坑。審稿時檢查 FAQ 區有沒有 `](http`。
- **手機版面驗收用真實寬度量 `scrollWidth`**，不要只靠肉眼；元凶常在摺疊線下（表格/裸網址/長字）。
- **潛在擴散**：其它文章的 FAQ 若也用 Markdown 連結，會有同樣的「露裸網址」問題（連結仍可被 CSS 斷行、不再破版，但顯示不美）。要根治可全站掃 `<h2>常見問題` 區段內的 `](http` 批次轉 `<a>`。
- 相關：`PERFORMANCE.md`（效能鐵則）、站規「頁面 body 不得水平捲動、寬內容各自 overflow-x:auto」。
