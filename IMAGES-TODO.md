# 🖼️ 待補圖片清單（18 篇，2026-08-17 建立）

> **這是給站長的提醒檔。** 這 18 篇文章目前用的是**品牌佔位圖**（「APPI News／圖片準備中」的漸層底圖），文字已上線、排程中。
> 原因：worker 背後的 OpenAI 生圖額度歸零（`You have no credits remaining`），當下無法生真圖，站長決定「先上文字、圖之後補」。
> **補完圖之後，請刪掉這個檔案（或至少刪掉對應的勾選列），別留著增加負擔。**

## 補圖步驟（在有 OpenAI 額度的那台機器上）

1. 先確認 worker 背後的 OpenAI 帳號**已儲值**（額度恢復後生圖才會成功）。
2. 對每篇生成真圖，**覆蓋同檔名即可，文章內文一個字都不用改**（`coverImage` 與 `<img src>` 路徑都已就位）：
   - 封面：`public/covers/<slug>.webp`（橫式，Discover 規格寬 ≥1200）
   - 內文：`public/images/<slug>-s1.webp`、`public/images/<slug>-s2.webp`
   - 走平常的配圖流程（`node scripts/get-image.mjs --generate …`）。**配圖風格**：真實新聞照、台灣人臉、乾淨空白標籤（見既有健康文的配圖標準）。每張生成後肉眼檢查一次。
3. 全部補完後重建並上線：`node node_modules/astro/astro.js build` → 驗線上 → `gh workflow run deploy.yml --ref main`。
4. **刪掉這個檔案**（`git rm IMAGES-TODO.md` → commit → push）。

## 清單（打勾＝已補真圖）

### 成人疫苗（8/18–8/23）
- [ ] `adult-vaccines-overview` — 封面 + s1 + s2
- [ ] `shingles-vaccine-adults` — 封面 + s1 + s2
- [ ] `pneumococcal-vaccine-elderly` — 封面 + s1 + s2
- [ ] `flu-vaccine-annual-myths` — 封面 + s1（此篇只有 1 張內文圖）
- [ ] `covid-vaccine-adults-2026` — 封面 + s1 + s2
- [ ] `tetanus-pertussis-tdap-adults` — 封面 + s1 + s2

### 眼睛健康（9/2–9/12）
- [ ] `dry-eye-syndrome-relief` — 封面 + s1 + s2
- [ ] `cataract-surgery-lens-choice` — 封面 + s1 + s2
- [ ] `presbyopia-aging-eyes` — 封面 + s1 + s2
- [ ] `macular-degeneration-warning-signs` — 封面 + s1 + s2
- [ ] `glaucoma-eye-pressure-silent` — 封面 + s1 + s2
- [ ] `floaters-eye-when-to-worry` — 封面 + s1 + s2

### 腎臟保健（9/3–9/13）
- [ ] `kidney-protection-daily-habits` — 封面 + s1 + s2
- [ ] `ckd-early-warning-signs` — 封面 + s1 + s2
- [ ] `proteinuria-foamy-urine` — 封面 + s1 + s2
- [ ] `diabetes-hypertension-kidney-damage` — 封面 + s1 + s2
- [ ] `drug-induced-kidney-damage` — 封面 + s1 + s2
- [ ] `dialysis-end-stage-kidney-choices` — 封面 + s1 + s2

（合計 18 封面 + 35 內文圖 = 53 張佔位圖待換。）
