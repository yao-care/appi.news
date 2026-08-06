# 品牌強調色當小字用會過不了對比：大字能過不代表小字能過

**摘要**：`--appi-accent` 金色放在 `--appi-accent-soft` 上只有 **3.51:1**，
小字需要 4.5:1 → 全站 280+ 篇 medical／financial／legal 文章的免責標籤長期 a11y 失分。
同一個顏色用在站名（19.2px 粗體）卻是合格的——**WCAG 的門檻依字級而不同**，這是最容易漏掉的地方。

日期：2026-08-06

---

## 問題

新文章上線後跑 PSI，文章頁 accessibility 96（首頁 100），失敗項是
`color-contrast`，指向 `.disclaimer-label`。

一開始以為是新文章引進的，實際比對後發現：

- 舊的 `general` 文章 → a11y **100**
- 舊的 `medical` 文章 → a11y **96**，同一條失敗

所以是既有問題，只是取決於文章的 `disclaimerType`——只有 medical／financial／legal
會套 `.disclaimer--risk`，而那個 class 才會把標籤改成金色。

## 原因

`DisclaimerBox.astro`：

```css
.disclaimer--risk { background: var(--appi-accent-soft); }   /* #f7efdd */
.disclaimer--risk .disclaimer-label { color: var(--appi-accent); }  /* #a87515，font-size: var(--text-xs) */
```

實算對比：

| 組合 | 對比 | 小字門檻 4.5:1 |
|---|---:|---|
| hex `#a87515` on `#f7efdd` | 3.51:1 | ✖ |
| oklch `(0.60 0.10 75)` on `(0.95 0.03 80)` | 3.46:1 | ✖ |

**關鍵在於「同一個顏色在別處是合格的」**：`SiteHeader` 的 `.brand-name-accent` 也用
`--appi-accent`，但那是 1.2rem（19.2px）粗體，落在 WCAG 的「大字」定義
（≥18.66px 粗體或 ≥24px），門檻只有 **3:1**，`#a87515` 對白底 4.02:1 → 過。

所以「這個色我們到處在用、沒問題」是錯覺，**門檻是隨字級變的**。

## 解法

新增一個專門給「accent-soft 底色上的小字」用的深色 token，不動 `--appi-accent` 本身
（它還被 `--color-coral` 引用，改了會牽動其他元件）：

```css
/* variables.css：hex fallback 與 oklch 兩組都要加，兩邊都得過門檻 */
--appi-accent-ink: #8a5f10;              /* 對 #f7efdd = 4.92:1 */
--appi-accent-ink: oklch(0.51 0.09 75);  /* 對 accent-soft = 5.04:1 */
```

然後 `.disclaimer--risk .disclaimer-label { color: var(--appi-accent-ink); }`。

選值時**刻意留餘裕**（4.9 / 5.0 而不是剛好 4.5），避免之後微調底色又掉回不合格。

## 怎麼避免重犯

- **要把品牌強調色拿來當文字色時，先問「這是幾 px、粗不粗」**。
  ≥18.66px 粗體或 ≥24px → 3:1；其餘一律 4.5:1。
  站上 `--text-xs` 的地方特別要小心，它們幾乎都是小字門檻。
- 這個 repo 是 **hex fallback + oklch 主要**兩套值，
  **加 token 要兩邊都加、兩邊都驗**（oklch 那組實算出來是 3.46，比 hex 更差一點）。
- 不要為了修對比直接改既有 token 的值——先查它還被誰引用
  （這次 `--appi-accent` 還被 `--color-coral` 吃著）。新增專用 token 比較安全。
- **`check-design.mjs` 管不到這個**：它守的是「顏色只准寫在 variables.css」，
  不驗對比。對比要靠 PSI／Lighthouse 的 accessibility 項，
  而那是軟性指標、不會擋 build，所以**要主動去看**，不會有人通知你。
- 查 a11y 失分時，**先拿同類型的舊頁面對照**再下「是這次改壞的」結論。
  這次若沒對照，就會誤判成新文章引進的問題。
