# 內容遷移筆記（WordPress → Astro）

本文件說明舊 WordPress 站（`old/asia-pacificpreventiveinsight.WordPress.2026-06-09.xml`）
如何遷移到新的 Astro content collection schema。

## 遷移工具

```bash
python3 scripts/migrate_wp.py
```

- 解析 WXR 匯出檔，輸出 `src/content/articles/wp-<post_id>.md`
- **可重複執行**：每次執行會先刪除既有的 `wp-*.md`，再重新產生；不會動到手寫的其他文章
- 為一次性 / 維護工具，**不屬於 build 流程**

## 遷移結果（2026-06-09）

| WordPress 狀態 | 篇數 | 對應新 status | 是否上線 |
| --- | --- | --- | --- |
| publish | 40 | `published` | 是（依原始發佈日期） |
| future | 8 | `scheduled` | 否，到 `publishDate` 後由排程重建自動上線 |
| draft | 84 | `draft` | 否，永遠隱藏 |

## 欄位對照

| WordPress | 新 schema | 規則 |
| --- | --- | --- |
| `title` | `title` | 直接沿用 |
| `wp:post_name` | `slug` | 百分比解碼為中文後清理不安全字元；空值則 `post-<id>` |
| `excerpt:encoded` | `description` / `excerpt` | 無摘要時從內文擷取前 ~140 字 |
| `wp:post_date` | `publishDate` | 視為 Asia/Taipei，轉 ISO（`+08:00`） |
| `category`（domain=category） | `category` / `subcategory` | 見下方分類對照 |
| `category`（domain=post_tag） | `tags` | 全數保留 |
| `dc:creator` | `author` | **一律歸 `appi-editorial`**，原帳號存於 `legacyAuthor` |
| `wp:status` | `status` | publish→published、future→scheduled、draft→draft |
| `content:encoded` | 內文 | HTML 清理（見下） |
| — | `sourceType` | 一律標記 `ai-assisted`（內容含 AI 摘要結構），可逐篇調整 |
| `_thumbnail_id` | — | 圖片無法取得，改用分類 fallback OG 圖 |

## 分類對照

| WordPress 分類 | 新 category | subcategory | 備註 |
| --- | --- | --- | --- |
| 預防醫學 | `health` | `preventive` | |
| 中醫 | `health` | `tcm` | |
| 科技 | `tech` | — | |
| 時事 | `society` | — | |
| 焦點新聞 | `focus` | `today` | |
| 運動 | `sports` | — | |
| 未分類 / 無分類 | `focus` | — | **需人工確認**，檔案內含 TODO 註記 |

## 已知取捨與待辦

1. **作者**：舊站作者帳號（appieditor、vegeta、asignbio、chou、light）皆為內部帳號，
   為避免出現無意義署名，一律歸到 `appi-editorial`。原帳號保留在 `legacyAuthor`，
   日後若要還原真實作者，可據此建立作者檔並改回 `author`。
2. **圖片**：舊站圖片指向 `appi.news/wp-content/...`（目前 DNS 為內部位址，無法公開取得），
   故內文圖片與封面一律移除，改用分類 fallback OG 圖。取得原始 uploads 後可補回。
3. **HTML 清理**：移除 inline style、class、id、`<script>`、Kubio 進度條與裝飾區塊；
   保留 `h2/h3/p/ul/ol/li/blockquote/table/strong/em/a/hr` 等語意標籤，
   套用新站 `.article-body` 排版。少數原本以 `<div>` 排版的問答區塊會變成連續段落，
   屬可接受的降級。
4. **未分類（39 篇）**：分類需逐篇人工確認，目前暫歸 `focus`。
5. **slug**：使用中文 slug（URL 會百分比編碼），對中文 SEO 友善；
   檔名則用 ASCII 的 `wp-<id>.md` 以維持穩定。

## 排程發佈機制

- `src/utils/content.ts` 的 `isPublic()` 會過濾掉 `publishDate > build 當下時間` 的文章。
- `.github/workflows/deploy.yml` 設定每 6 小時 cron 重建，
  因此 `future` 文章會在其日期之後的下一次重建自動上線，不會一次全部出現。
