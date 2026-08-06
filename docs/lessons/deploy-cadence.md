# 部署被卡住不是因為站台太大，是因為部署得太頻繁

**摘要**：連續六次 `build: success / deploy: failure`，deploy 步驟 600 秒內狀態始終是
`deployment_queued`。站台只佔 GitHub Pages 上限的三分之一，**不是體積問題**——是「一篇文章
一個 commit 一次 push、push 又直接觸發部署」把一天的部署次數推到 200 次。

日期：2026-08-06　相關：`.github/workflows/deploy.yml`、`scripts/deploy-needed.mjs`

---

## 問題

站台整天無法上線。GitHub Actions 顯示：

```
build:  success
deploy: failure   ← Timeout reached, aborting!（600s）
```

## 原因

### 先講我判斷錯的那一步（這才是真正的教訓）

看到 artifact 是 335 MB，比先前成功的 319 MB 大，我直接推論「太大了」，跑去把 212 張
過大的 png/jpg 原地壓縮（117 MB → 89 MB）。**壓完照樣失敗**，因為方向從一開始就錯。

錯在哪：我沒有先去讀 deploy 步驟**到底在等什麼**，就用「數字變大了」推論因果。
兩個一看就該察覺的反證擺在眼前：

- 成功的部署 deploy 階段只花 **24–163 秒**，失敗的直接卡滿 600 秒。5% 的體積增量
  不可能讓 28 秒變成超過 600 秒。
- 站台 392 MB，是 GitHub Pages **1 GB 上限的三分之一**，離限制還很遠。

### 真正的線索在 log 裡

deploy 步驟整整 600 秒都在輪詢，狀態從頭到尾沒變過：

```
Getting Pages deployment status...
Current status: deployment_queued     ← 重複到逾時
```

**卡在 queued＝GitHub 根本沒開始處理我們的 artifact**。若是體積問題，狀態會進到
`deployment_in_progress` 然後跑很久。

配上部署次數統計（今天 200 次，其中某一小時內 70 次），最吻合的解釋是**這個 repo 的
Pages 部署被節流**。

> ⚠️ 這仍是假說。官方文件的「每小時 10 次建置」軟性限制**明文不適用於自訂 Actions
> workflow**，而我們正是用自訂 workflow，所以沒有文件可以佐證。但「收斂部署頻率」
> 本身就是該做的事（一天 200 次、每次重傳 335 MB 純屬浪費），與假說成不成立無關。

## 解法

### 一、拿掉 push 觸發，改排程收斂

```yaml
on:
  workflow_dispatch:        # 保留：健康紀念日準點上線、臨時要發都靠它
  schedule:
    - cron: '*/15 * * * *'  # 最多 4 次/小時，替 workflow_dispatch 留餘裕
```

刻意**不設成 `*/6`（10 次/小時）**——那是貼著上限跑，`workflow_dispatch` 就沒空間了。

### 二、但只做上面那步會讓每日總量變糟

`*/15` 無條件執行＝**一天 96 次** build，而平常日真正有內容變動的只有十幾次。
尖峰壓下來了（70/小時 → 4/小時），每日總量卻從約 19 次放大到 96 次。
**只看尖峰不看總量，等於把問題換個方向放大。**

所以要加變動偵測（`scripts/deploy-needed.mjs`），兩條件任一成立才 build：

1. 上次成功部署之後有新 commit
2. 有排程稿的 `publishDate` 落在（上次部署時間, 現在]

**第二條不可省**：排程稿（`status: scheduled` + 未來 `publishDate`）是靠
「build 當下時間」才轉正的（`src/utils/content.ts` 的 `isPublic`），沒有新 commit 也需要重建。
只看 commit 會讓健康紀念日那類排程稿永遠上不了線。

抓不到上次部署資訊一律 **fail-open 照部署**；`workflow_dispatch` 跳過檢查直接部署。

### 三、代價要講清楚

- **push 完不等於上線**。等排程最多 15 分鐘，而 GitHub 排程 workflow 常誤點，
  實際可能 20–30 分鐘。急著上線就 `gh workflow run deploy.yml`。
- 各產線的 `.sh` 回報措辭不可再寫「已上線」。

## 怎麼避免重犯

- **CI 卡住時，先讀那個步驟在等什麼，再談原因。** 「某個數字變大了」不是因果證據。
  這次只要看一眼 `Current status: deployment_queued`，就不會白花力氣壓縮圖片。
- **比對成功與失敗的耗時分布**：24s / 163s / 600s(逾時) 的形狀，一眼就能排除線性的體積效應。
- **查限制要看實際數字對上限的比例**，不要憑印象說「太大了」。392 MB 對 1 GB＝33%。
- **調節奏時同時看「尖峰」與「總量」**。壓尖峰的手段（提高排程頻率）很容易把總量推高，
  兩個指標要一起算過再改。
