# 主題/專欄的 articles 要用 frontmatter slug＋本機自檢必須跑到 prebuild（含 Windows 相容）

> 摘要：topics/columns 的 `articles:` 反查的是文章 frontmatter 的 `slug`（不是檔名）；本機只跑 `astro build` 會跳過 `prebuild` 的 `validate:content` 硬 gate，錯誤直到 CI 才爆，且 `validate-content.mjs` 原本在 Windows 會噴滿江紅假錯無法自檢 ｜ 範圍：發佈正確性 / 內容參照 / 本機建置 ｜ 狀態：已解決 ｜ 日期：2026-07-14

## 問題（症狀）

推了一批新文章＋新主題集群（`topics/smart-supplements`）進 `main`，本機 `astro build && check:links` 全綠，結果 GitHub Actions 部署 #588 的 **Build** step 就掛了：

```
✗ Content validation failed
[ERROR] src/content/topics/smart-supplements.md
  - articles 內的 "wp-247" 找不到對應文章 slug
  - articles 內的 "wp-595" 找不到對應文章 slug
```

`deploy` job 因此 skipped，整個部署沒上（幸好 build 先擋住，沒污染線上）。回頭想在本機重現，`node scripts/validate-content.mjs` 卻噴出 **551 個假錯誤**（連 `luo-yang`、`herbal-cuisine` 這些明明存在的作者/專欄都說「找不到」），完全無法判讀。

## 原因（根因）

三個獨立的坑疊在一起：

1. **`articles:` 反查的是 frontmatter `slug`，不是檔名。** `validate-content.mjs` 建 `articleSlugSet` 時「frontmatter slug 優先、否則檔名」。`wp-247.md` 的 `slug:` 其實是 `supplements-five-buying-principles`、`wp-595.md` 是 `functional-food-ad-compliance-ai`。主題裡填檔名 `wp-247`/`wp-595` 自然對不上。（其他用檔名＝slug 的文章剛好沒事，才更容易誤判成「填檔名就行」。）

2. **本機直接 `astro build` 會跳過 `prebuild` 硬 gate。** `package.json` 的 `build` 只有 `astro build`；真正的內容校驗在 `prebuild`（`pnpm validate:content && node scripts/used-images.mjs`），靠 npm/pnpm 的 `prebuild` 生命週期鉤子在 `pnpm build` 時自動先跑。這台 Windows 機器上 pnpm 11（corepack 抓 latest，因 `package.json` 沒釘 `packageManager`）因 esbuild/sharp 的 `ERR_PNPM_IGNORED_BUILDS` 會讓 `pnpm build` 的 pre-run deps 檢查 exit 1，於是改用 `node node_modules/astro/astro.js build` 直跑繞過——結果連 `prebuild` 的 `validate:content` 也一起被繞過，錯誤只能等 CI 才發現。

3. **`validate-content.mjs` 在 Windows 會噴滿江紅假錯。** `walk()` 用 `join()` 產生的是反斜線路徑，`fileSlugSet`/`articleParsed` 卻用 `f.split('/').pop()` 取檔名——在 Windows 上沒有正斜線可切，整條路徑被當成 slug，於是所有作者/主題/專欄的參照全部「找不到」。Linux/CI 用正斜線所以正常，才只報出那 2 個真錯。

## 解法（怎麼修 + 現在怎麼維持）

- **內容修正**：`topics/smart-supplements.md` 的 `articles:` 改用實際 slug（`supplements-five-buying-principles`、`functional-food-ad-compliance-ai`）。要引用某篇進主題/專欄，先看它的 frontmatter `slug`，別憑檔名。
- **校驗器 Windows 相容**：`validate-content.mjs` 的 `f.split('/')` → `f.split(/[\\/]/)`（兩處）。Linux/CI 行為不變，Windows 本機從此可信。
- **本機自檢要鏡射 CI**：不能只跑 `astro build`。至少先 `node scripts/validate-content.mjs`（＝CI 的 `prebuild`）確認 0 錯，再跑 build + `check:links`。這次補跑後：validate 0 錯、build 綠、check:links 13 萬條 0 壞連結，重推 #588 修正版即部署成功、線上驗證 noindex/圖/FAQ/主題錨點皆正常。

## 怎麼避免重犯 / 相關

- **鐵則**：主題/專欄 `articles:` 一律填**文章 frontmatter 的 slug**；新增後跑 `validate:content` 反查。真實來源見 `src/content.config.ts`。
- **鐵則**：本機驗收若因 pnpm 問題改用 `node` 直跑 astro，**務必手動補跑 `node scripts/validate-content.mjs`**（prebuild 的硬 gate），否則 slug 參照、封面存在性等錯會漏到 CI。這條 gate 會擋住整條共用部署佇列，延伸背景見 [auto-publish-pipeline-traps.md](./auto-publish-pipeline-traps.md) §F（缺封面 webp 擋部署、validate-content 升 error 的由來）。
- 相關假陽性家族見 [link-and-content-validation.md](./link-and-content-validation.md)（查證/檢查的環境性假錯）。
