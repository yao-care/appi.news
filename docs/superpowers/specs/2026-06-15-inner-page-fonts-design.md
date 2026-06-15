# 內頁字型優化設計（逐頁迷你字型，pilot 先行）

> 日期：2026-06-15
> 作者：Lightman（CΛ）
> 目標：把內頁（文章/分類/作者/專題/專欄等內容頁）的繁中字型負載從 ~2MB 降到每頁數十～數百 KB，提升 PSI mobile（目標 90+），首頁基準（desktop 100、mobile ≥90）不退。

## 1. 背景與根因（已驗證）

- 內頁 PSI mobile ~56、FCP/LCP ~11.5s、TBT 0、CLS 0、TTFB 1–3ms。瓶頸是 **render 關鍵路徑被字型主導**，不是 CSS（CSS 內聯已上線、render-blocking 已 0）、不是圖片 bytes。
- `subset-fonts.mjs` 的子集是「**全站用字聯集**」。內容長到 279 篇後聯集近乎涵蓋常用繁中字，子集膨脹到 ~470–647KB/權重；內頁載 5 個權重 ~2MB（slow-4G 下主導 FCP/LCP）。
- 首頁不受此害：`subset-fonts.mjs` 另為首頁產「**只含首頁用字**」的迷你字型（獨立 family `NotoSansTC-Home`/`NotoSerifTC-Home`、inline `@font-face` + `:root` 覆蓋、把站台大字型從首頁字型棧**換掉**），首頁只載 ~360KB。
- 對應 `PERFORMANCE.md` §0（CJK 字型過大是頭號風險）、§2 兩個坑（同名 @font-face 雙抓、`font-display:optional` 後備會抓棧中下一個 web font）、§5（內頁可比照 §2 延伸）。

## 2. 目標與誠實前提

- 目標：內頁 mobile 90+。**但有不確定性**：首頁迷你字型 ~360KB 實測 mobile 87（也尚未到 90）；文章用字多，逐頁子集可能 ~400–500KB，FCP 可能仍 ~3s，**不保證穩上 90**。預期從 56 大幅改善（估 ~80+）。
- 因此**先 pilot 驗證真實增益，再決定是否全量**，避免重蹈「假設打錯」與「先付出數千檔成本」。

## 3. 設計

### 3.1 重構：可重用的迷你字型注入
把 `subset-fonts.mjs` 既有的「首頁迷你字型」區塊重構成函式 `injectMiniFonts(htmlPath, opts)`：
1. 取該頁用字（baseline 字元 + 該 HTML 的所有字元）。
2. 對 5 個權重（sans 400/500/700、serif 600/700），從對應的繁中 woff2 子集成「只含該頁用字」的迷你 woff2。
3. 寫入 `_astro/`（檔名帶內容 hash）。
4. 在該頁 `</head>` 前注入 inline `<style>`：迷你 `@font-face`（family 用統一的 `NotoSansTC-Pg`/`NotoSerifTC-Pg`，各頁的 `src` 指向自己的檔）+ `:root` 覆蓋，把 `--font-sans`/`--font-serif` 的站台 web font **換成** Pg family（後接系統字型，缺字落回系統 CJK，不 tofu）。
- family 名全站統一即可（各 HTML 文件獨立，互不干擾），毋需逐頁取名；關鍵是**檔案逐頁不同**。
- 沿用首頁已驗證的兩個坑解法（獨立 family、把站台 web font 從棧中換掉，避免 optional 後備抓大字型）。

首頁改為呼叫同一函式（行為等效）。

### 3.2 套用範圍（scope A）
對所有 `dist/**/*.html` 注入逐頁迷你字型，**排除** `/admin`、`/choice`（與 `inline-css.mjs` 相同排除集）。

### 3.3 build 成本緩解
- **以「字集 hash + 權重」快取子集**：相同字集的頁共用同一迷你檔（list/分類頁可能重疊），減少重複子集與檔數。
- 子集化以 `subset-font` 進行；預期數千次，build 增數分鐘 —— **實測並記錄**，必要時縮範圍或減權重。

### 3.4 pilot 先行（關鍵）
1. 先完成 `injectMiniFonts` 函式，**只套 ~5 篇代表性文章**（不同長度/題材）。
2. 部署後第三方 PSI 量這 5 篇 mobile/FCP/LCP。
3. **決策點**：
   - 若 ~90+ 或顯著接近且可接受 → 全量套用 scope A。
   - 若明顯不足 → 暫停，回報實測，重新評估（可能搭配 cover/CSS 其他槓桿或調整字集策略），不貿然全量。

## 4. 驗收
- **首頁不可退**：desktop 100、mobile ≥90（pilot 與全量後皆 PSI 複測）。
- **內頁**：pilot 5 篇 mobile 達標趨勢；全量後抽樣文章/分類/作者頁 mobile 90+（或記錄實際達到值為新基準）。
- `pnpm build && pnpm check:links` 全綠；build 後抽查內頁 `<head>` 有迷你 `@font-face` + `:root` 覆蓋、且未載入全站大字型（PSI network 不再出現 ~500KB/權重的全站子集）。
- 記錄 build 時間與 dist 字型總量，確認可接受。
- 回填內頁基準到 `PERFORMANCE.md`，更新 §5 與 §2（subset-fonts 現也產逐頁迷你字型）。

## 5. 風險
| 風險 | 緩解 |
|------|------|
| 逐頁迷你字型仍上不了 mobile 90 | pilot 先驗證；不足則暫停重評，不全量硬上 |
| build 變慢 / dist 字型檔數爆量 | 字集 hash 快取共用；實測 build 時間;必要時縮範圍（先文章頁）或減權重 |
| 動到 `subset-fonts.mjs` 弄壞首頁迷你字型 | 重構為函式、首頁走同一支；驗收強制 PSI 複測首頁 100/≥90 |
| 字型兩個坑（雙抓/optional 後備） | 沿用首頁已驗證解法（獨立 family、換掉棧中站台 web font） |

## 6. 交付項
1. `subset-fonts.mjs` 重構出 `injectMiniFonts(htmlPath)`（首頁改呼叫它）。
2. pilot：套 ~5 篇文章 → build → 部署 → PSI 量測 → 決策。
3. 全量：套所有內容頁（排除 admin/choice）+ 字集 hash 快取。
4. `PERFORMANCE.md` 同步逐頁迷你字型說明與內頁基準。
5. 驗收：build + check:links + 多頁型 PSI（首頁不退、內頁達標或記錄實值）。
