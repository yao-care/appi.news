# 字型 unicode-range 切塊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把全站繁中字型從「逐頁子集（檔數隨內容無限膨脹、無跨頁快取）」改為「依碼位連續切塊的共享字型」，達到固定檔數、跨頁可快取、build 分鐘級、每頁只下載命中的切片。

**Architecture:** postbuild 的 `subset-fonts.mjs` 掃描 dist 全站用字，把每個繁中權重依碼位切成 ~18 段連續區段，各段以 `subset-font` 子集成一個 woff2，再用帶 `unicode-range` 的 `@font-face`（真實 family、`font-display:optional`）取代 `_astro` CSS 中原本的單體繁中 `@font-face`；後續 `inline-css.mjs` 照常把 CSS 內聯進各頁。逐頁機制、首頁 mini、Python 批次全部移除。

**Tech Stack:** Node ESM、`subset-font`（npm，純 JS）、vitest、Astro 5 postbuild。

**參考事實（實作前必讀）：**
- 來源繁中字型在 `dist/_astro/`，檔名帶 astro hash：`noto-sans-tc-chinese-traditional-{400,500,700}-normal.<hash>.woff2`（+ `.woff`）、`noto-serif-tc-chinese-traditional-{600,700}-normal.<hash>.woff2`（+ `.woff`）。
- 原始 `@font-face`（`@fontsource`，無 unicode-range）：`font-family:'Noto Sans TC';font-style:normal;font-display:swap;font-weight:400;src:url(.../noto-sans-tc-chinese-traditional-400-normal.<hash>.woff2) format('woff2'),url(...woff) format('woff')`。
- dist CSS 內 url 帶 base path 前綴（如 `/appi.news/_astro/`）。
- 全站 used 唯一字約 3483 個 → `TARGET_PER_SLICE=200` 約切 18 段 → 5 權重共 ~90 檔（驗收區間 [70,120]）。
- 測試框架 vitest（`import { describe, it, expect } from 'vitest'`），lib 純函式慣例見 `scripts/lib/inline-css.mjs` 等。
- postbuild 串接順序不可變：`subset-fonts → optimize-home-images → optimize-article-images → inline-css → pagefind`（見 `package.json` 與 `PERFORMANCE.md`）。

---

### Task 1: 切塊純邏輯 lib + 單元測試

**Files:**
- Create: `scripts/lib/font-slicing.mjs`
- Test: `scripts/lib/font-slicing.test.mjs`

- [ ] **Step 1: 寫失敗測試**

`scripts/lib/font-slicing.test.mjs`：

```js
import { describe, it, expect } from 'vitest';
import { partitionCodepoints, unicodeRange, faceCss, replaceFontFaces } from './font-slicing.mjs';

describe('partitionCodepoints', () => {
  it('涵蓋全部唯一字、不超過 target、段間不重疊且遞增', () => {
    const text = 'abc一二三四五';
    const slices = partitionCodepoints(text, 3);
    const all = slices.flatMap((s) => [...s.chars]);
    expect(new Set(all)).toEqual(new Set([...text]));
    for (const s of slices) expect([...s.chars].length).toBeLessThanOrEqual(3);
    for (let i = 1; i < slices.length; i++) expect(slices[i - 1].max).toBeLessThan(slices[i].min);
  });
  it('去重重複字', () => {
    const slices = partitionCodepoints('aaabbb', 10);
    expect(slices).toHaveLength(1);
    expect([...slices[0].chars].sort()).toEqual(['a', 'b']);
  });
});

describe('unicodeRange', () => {
  it('區間格式', () => {
    expect(unicodeRange(0x4e00, 0x9fff)).toBe('U+4e00-9fff');
  });
  it('min==max 為單點', () => {
    expect(unicodeRange(0x4e00, 0x4e00)).toBe('U+4e00');
  });
});

describe('faceCss', () => {
  it('含 optional 與 family/weight/url/unicode-range', () => {
    const css = faceCss({ family: 'Noto Sans TC', weight: 400, url: '/x/a.woff2', range: 'U+4e00-50ff' });
    expect(css).toContain("font-family:'Noto Sans TC'");
    expect(css).toContain('font-weight:400');
    expect(css).toContain('font-display:optional');
    expect(css).toContain("src:url(/x/a.woff2) format('woff2')");
    expect(css).toContain('unicode-range:U+4e00-50ff');
  });
});

describe('replaceFontFaces', () => {
  const base = 'noto-sans-tc-chinese-traditional-400-normal';
  it('移除參照 baseName 的 @font-face 並於尾端插入新規則', () => {
    const css = `a{color:red}@font-face{font-family:'Noto Sans TC';src:url(/_astro/${base}.abc.woff2) format("woff2")}b{color:blue}`;
    const { css: out, changed } = replaceFontFaces(css, base, ['@font-face{X}', '@font-face{Y}']);
    expect(changed).toBe(true);
    expect(out).not.toContain(base);
    expect(out).toContain('@font-face{X}@font-face{Y}');
    expect(out).toContain('a{color:red}');
    expect(out).toContain('b{color:blue}');
  });
  it('其他 family 不動、回報 changed=false', () => {
    const css = `@font-face{font-family:'Inter';src:url(/_astro/inter-latin-400.woff2) format("woff2")}`;
    const { css: out, changed } = replaceFontFaces(css, base, ['@font-face{X}']);
    expect(changed).toBe(false);
    expect(out).toBe(css);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm vitest run scripts/lib/font-slicing.test.mjs`
Expected: FAIL（`font-slicing.mjs` 不存在 / 函式未定義）

- [ ] **Step 3: 寫實作**

`scripts/lib/font-slicing.mjs`：

```js
// 字型 unicode-range 切塊的純邏輯（無 fs / 無 subset-font，便於測試）。

// 把文字的唯一碼位排序後，依碼位連續切成「每段約 targetPerSlice 字」的區段。
// 回傳每段 { chars, min, max }：chars 給 subset-font 子集用，min/max 給 unicode-range。
export function partitionCodepoints(text, targetPerSlice = 200) {
  const cps = [...new Set([...text].map((ch) => ch.codePointAt(0)))].sort((a, b) => a - b);
  const slices = [];
  for (let i = 0; i < cps.length; i += targetPerSlice) {
    const group = cps.slice(i, i + targetPerSlice);
    slices.push({
      chars: group.map((c) => String.fromCodePoint(c)).join(''),
      min: group[0],
      max: group[group.length - 1],
    });
  }
  return slices;
}

// 碼位 min/max → CSS unicode-range 字串（min==max 時為單點）。
export function unicodeRange(min, max) {
  const hex = (n) => 'U+' + n.toString(16);
  return min === max ? hex(min) : `${hex(min)}-${max.toString(16)}`;
}

// 產一條切片 @font-face（真實 family、font-display:optional、單一 woff2 src、帶 unicode-range）。
export function faceCss({ family, weight, url, range }) {
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:optional;src:url(${url}) format('woff2');unicode-range:${range}}`;
}

// 移除 CSS 中內容參照到 baseName 的所有 @font-face，於尾端插入 newRules。回傳 { css, changed }。
export function replaceFontFaces(css, baseName, newRules) {
  let changed = false;
  const out = css.replace(/@font-face\{[^}]*\}/g, (block) => {
    if (block.includes(baseName)) {
      changed = true;
      return '';
    }
    return block;
  });
  if (!changed) return { css, changed: false };
  return { css: out + newRules.join(''), changed: true };
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm vitest run scripts/lib/font-slicing.test.mjs`
Expected: PASS（4 個 describe、全綠）

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/font-slicing.mjs scripts/lib/font-slicing.test.mjs
git commit -m "feat(fonts): unicode-range 切塊純邏輯 lib + 測試"
```

---

### Task 2: 重寫 subset-fonts.mjs 走切塊；移除逐頁/Python；還原 deploy.yml

**Files:**
- Overwrite: `scripts/subset-fonts.mjs`
- Delete: `scripts/subset_pages.py`、`scripts/lib/mini-fonts.mjs`、`scripts/lib/mini-fonts.test.mjs`
- Modify: `.github/workflows/deploy.yml`（移除 Python/pip 步驟）

- [ ] **Step 1: 用切塊版覆寫 `scripts/subset-fonts.mjs`**

完整檔案內容：

```js
// 建置期字型切塊：掃描 dist 全站 HTML 實際用到的字，把每個繁中權重「依碼位切成連續區段」，
// 每段子集成一個 woff2，並用帶 unicode-range 的 @font-face 取代原本的單體繁中 @font-face。
//
// 為何：原本每權重是整包繁中字（~470KB+），內頁載 5 權重 ~2MB 主導 slow-4G FCP。
// 切塊後瀏覽器只下載當頁出現字命中的少數區段，且每段 URL 全站固定 → 跨頁可快取、檔數固定不隨內容膨脹。
// font-display:optional 讓字型不擋首屏；family 用真實名稱，字型棧不需改。
import { readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import subsetFont from 'subset-font';
import { partitionCodepoints, unicodeRange, faceCss, replaceFontFaces } from './lib/font-slicing.mjs';

const DIST = 'dist';
const ASTRO_DIR = join(DIST, '_astro');
const TARGET_PER_SLICE = 200;

// 5 個繁中權重：base 檔名（不含 astro hash）、family、weight。
const WEIGHTS = [
  { base: 'noto-sans-tc-chinese-traditional-400-normal', family: 'Noto Sans TC', weight: 400 },
  { base: 'noto-sans-tc-chinese-traditional-500-normal', family: 'Noto Sans TC', weight: 500 },
  { base: 'noto-sans-tc-chinese-traditional-700-normal', family: 'Noto Sans TC', weight: 700 },
  { base: 'noto-serif-tc-chinese-traditional-600-normal', family: 'Noto Serif TC', weight: 600 },
  { base: 'noto-serif-tc-chinese-traditional-700-normal', family: 'Noto Serif TC', weight: 700 },
];

// 基線白名單：ASCII 可見字 + 常見半形/全形標點、CJK 標點，避免邊角缺字。
function baselineChars() {
  let s = '';
  for (let c = 0x20; c <= 0x7e; c++) s += String.fromCodePoint(c);
  for (let c = 0x3000; c <= 0x303f; c++) s += String.fromCodePoint(c);
  for (let c = 0xff00; c <= 0xffef; c++) s += String.fromCodePoint(c);
  s += '　、。．，；：？！「」『』（）〔〕【】《》〈〉—…‧·‵′″“”‘’–§¶†‡•○●◎◇◆□■△▲▽▼☆★※←↑→↓№℃℉°±×÷';
  return s;
}

// 遞迴列出 dist 下符合副檔名的檔案。
function listFiles(dir, exts) {
  const out = [];
  for (const rel of readdirSync(dir, { recursive: true })) {
    const p = join(dir, rel);
    if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

// 1) 收集全站用到的字（逐 code point，正確處理 surrogate pair）。
const used = new Set();
for (const ch of baselineChars()) used.add(ch);
const htmlFiles = listFiles(DIST, ['.html']);
for (const f of htmlFiles) for (const ch of readFileSync(f, 'utf8')) used.add(ch);
const usedText = [...used].join('');
console.log(`[subset-fonts] 掃描 ${htmlFiles.length} 個 HTML → ${used.size} 個唯一字`);

// 2) 切塊（各權重共用同一組邊界）。
const slices = partitionCodepoints(usedText, TARGET_PER_SLICE);
console.log(`[subset-fonts] 切成 ${slices.length} 段（每段 ~${TARGET_PER_SLICE} 字）`);

// 找某 base 在 CSS 的 src url 前綴（取得 /appi.news/_astro/ 之類前綴）。
const cssFiles = listFiles(ASTRO_DIR, ['.css']);
const cssAll = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
function urlPrefixFor(base) {
  const m = cssAll.match(
    new RegExp('url\\(([^)]*' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "[^)]*\\.woff2)"),
  );
  return m ? m[1].replace(/[^/]*$/, '') : null; // 去掉檔名留目錄前綴
}

// 3) 每權重 × 每段子集成 woff2，收集切片 @font-face 規則（依 base）。
const woff2now = listFiles(ASTRO_DIR, ['.woff2']);
const rulesByBase = new Map();
let sliceFiles = 0;
let sliceBytes = 0;
for (const w of WEIGHTS) {
  const srcPath = woff2now.find((p) => basename(p).startsWith(w.base + '.'));
  if (!srcPath) {
    console.warn(`[subset-fonts] 找不到來源字型 ${w.base}，略過該權重`);
    continue;
  }
  const prefix = urlPrefixFor(w.base) || '/_astro/';
  const srcBuf = readFileSync(srcPath);
  const rules = [];
  for (let i = 0; i < slices.length; i++) {
    const s = slices[i];
    const sub = await subsetFont(srcBuf, s.chars, { targetFormat: 'woff2' });
    const hash = createHash('sha256').update(sub).digest('hex').slice(0, 8);
    const name = `${w.base}.slice-${i}.${hash}.woff2`;
    writeFileSync(join(ASTRO_DIR, name), sub);
    sliceFiles++;
    sliceBytes += sub.length;
    rules.push(
      faceCss({ family: w.family, weight: w.weight, url: prefix + name, range: unicodeRange(s.min, s.max) }),
    );
  }
  rulesByBase.set(w.base, rules);
}

if (rulesByBase.size === 0) {
  console.warn('[subset-fonts] 沒有任何繁中來源字型可切塊（import 是否已切換？），略過');
  process.exit(0);
}

// 4) 在 CSS 取代舊單體 @font-face。
let rewritten = 0;
for (const f of cssFiles) {
  let text = readFileSync(f, 'utf8');
  let changed = false;
  for (const [base, rules] of rulesByBase) {
    const r = replaceFontFaces(text, base, rules);
    if (r.changed) {
      text = r.css;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(f, text);
    rewritten++;
  }
}
if (rewritten === 0) {
  console.warn('[subset-fonts] 警告：CSS 中找不到可取代的繁中 @font-face（結構是否變動？）');
}

// 5) 刪掉舊整包字型（woff2 + woff），避免殘留佔空間（切片檔含 .slice- 不刪）。
let removed = 0;
for (const w of WEIGHTS) {
  for (const p of listFiles(ASTRO_DIR, ['.woff2', '.woff'])) {
    if (basename(p).startsWith(w.base + '.') && !basename(p).includes('.slice-')) {
      rmSync(p);
      removed++;
    }
  }
}

console.log(
  `[subset-fonts] 切片 ${sliceFiles} 檔 ${(sliceBytes / 1024 / 1024).toFixed(2)}MB；改寫 ${rewritten} 個 CSS；刪除舊整包 ${removed} 檔`,
);
```

- [ ] **Step 2: 刪除逐頁/Python 殘留檔**

```bash
git rm scripts/subset_pages.py scripts/lib/mini-fonts.mjs scripts/lib/mini-fonts.test.mjs
```

Expected: 三檔從 git 索引移除（`subset_pages.py` 與 `subset-fonts.mjs` 的 mjs 改動先前未 commit；`mini-fonts.*` 為已追蹤檔）。若某檔不存在於索引，改用 `rm -f`。

- [ ] **Step 3: 還原 `.github/workflows/deploy.yml` 的 Python 步驟**

把這段（在 `Install dependencies` 與 `Build` 之間）整段移除：

```yaml
      # postbuild 的 subset-fonts.mjs 會呼叫 python3 scripts/subset_pages.py
      # 做逐頁字型批次子集（fontTools 讀/寫 woff2 需 brotli）。
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install font subsetting deps
        run: pip install fonttools brotli
```

移除後，`Install dependencies` 之後緊接 `Build`（回到切塊前的原狀）。

- [ ] **Step 4: 跑既有單元測試確認沒被誤傷**

Run: `pnpm vitest run`
Expected: PASS（含 Task 1 的 font-slicing、其餘 lib 測試；不再有 mini-fonts 測試）

- [ ] **Step 5: Commit**

```bash
git add scripts/subset-fonts.mjs .github/workflows/deploy.yml
git commit -m "refactor(fonts): subset-fonts 改走 unicode-range 切塊；移除逐頁/Python 機制"
```

---

### Task 3: 本機 build smoke 驗證

**Files:**（不改 code，純驗證）

- [ ] **Step 1: 乾淨計時 build**

Run: `rm -rf dist && { /usr/bin/time -p pnpm build; } 2>&1 | tail -30`
Expected: build 成功（`[build] Complete!`）；`[subset-fonts] 切成 ~18 段`、`切片 ~90 檔`；總時間數分鐘內（明顯低於先前的逐頁版）。

- [ ] **Step 2: 切片檔數在區間 [70,120]、無舊整包殘留**

Run:
```bash
echo "slice files:"; ls dist/_astro/*.slice-*.woff2 | wc -l
echo "leftover monolith (應為 0):"; ls dist/_astro/*chinese-traditional*-normal.*.woff2 2>/dev/null | grep -v '\.slice-' | wc -l
echo "font total:"; du -ch dist/_astro/*chinese-traditional*.woff2 | tail -1
```
Expected: slice files 介於 70–120；leftover monolith = 0；font total ~2–3MB（非 182MB+）。

- [ ] **Step 3: 抽樣文章 HTML 內聯了切片規則、無舊引用**

Run:
```bash
f=$(ls dist/articles/post-700/index.html); \
echo "has unicode-range:"; grep -c 'unicode-range:U+' "$f"; \
echo "has optional:"; grep -c 'font-display:optional' "$f"; \
echo "references a slice woff2:"; grep -c 'slice-[0-9]' "$f"; \
echo "references non-slice chinese-traditional (應為 0):"; grep -o 'chinese-traditional-[0-9]*-normal\.[a-f0-9]*\.woff2' "$f" | grep -v slice | wc -l
```
Expected: unicode-range > 0、optional > 0、slice 參照 > 0、非切片引用 = 0。

- [ ] **Step 4: check:links 硬 gate**

Run: `pnpm check:links`
Expected: 0 broken internal links（綠）。

- [ ] **Step 5: 記錄結果（無 commit）**

把 Step 1–4 的實際數字貼回對話（build 秒數、slice 檔數、font 總量），作為 Task 4 回填 `PERFORMANCE.md` 的依據。

---

### Task 4: 同步 PERFORMANCE.md

**Files:**
- Modify: `PERFORMANCE.md`（§2 字型坑、§5 內頁；用 Task 3 實測數字）

- [ ] **Step 1: 讀現況**

Run: `grep -n "逐頁\|mini\|subset\|font-face\|內頁\|字型" PERFORMANCE.md | head -40`
Expected: 找到描述舊「逐頁迷你字型 / 全站聯集子集」的段落位置。

- [ ] **Step 2: 改寫字型段落為切塊機制**

把舊「逐頁迷你字型 / 全站聯集大子集」敘述改為：
- `subset-fonts.mjs` 掃描全站用字，把每繁中權重依碼位切成 ~18 連續區段，各段子集成 woff2，用帶 `unicode-range` 的 `@font-face`（真實 family、`font-display:optional`）取代單體 @font-face。
- 效果：每頁只下載命中的少數切片、跨頁可快取、字型檔數固定（~90 檔、~Task3 實測 MB），不隨文章數膨脹。
- 坑：family 用真實名稱、棧中只有一個 web font，故不需逐頁換棧；`font-display:optional` 讓字型不擋首屏。
- 用 Task 3 Step 5 的實測數字（build 秒數、檔數、總量）回填為新基準。

（實際字句依現有 §2/§5 行文風格調整，保持 Mermaid/格式規範。）

- [ ] **Step 3: Commit**

```bash
git add PERFORMANCE.md
git commit -m "docs(perf): 字型段落改為 unicode-range 切塊機制 + 回填實測基準"
```

---

## 驗收（全部 Task 後，由控制者執行，沿用專案既定流程）

1. 合併 `perf/inner-fonts` → `main`、push（觸發 GitHub Pages 部署）。
2. 等部署完成後，用第三方 PSI 對線上站量測：
   - 首頁 desktop 100 / mobile ≥90（**不可退**）。
   - 文章頁（抽 3 篇不同長度）mobile ≥90，或記錄實值為新基準。
   - tag 頁、作者頁各抽 1。
3. 用 Playwright 或 PSI network 確認某文章頁只抓到少數切片（非舊 470KB×5 單體、非 182MB 逐頁）。
4. 若首頁退步或內頁明顯不足 → 記錄實值、回 `systematic-debugging` 評估（不貿然加複雜度）。
