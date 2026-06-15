# 內頁字型優化 Implementation Plan（逐頁迷你字型，pilot 先行）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把內頁繁中字型負載從 ~2MB 降到每頁數十～數百 KB（逐頁迷你字型），提升內頁 PSI mobile，首頁基準不退；先 pilot 驗證再全量。

**Architecture:** 把 `scripts/subset-fonts.mjs` 既有「首頁迷你字型」邏輯重構成可重用 `injectMiniFonts(htmlPath, ctx)`，並把脆弱純邏輯（字型棧替換、用字收集）抽到 `scripts/lib/mini-fonts.mjs` 走 vitest。先把首頁改用此函式（行為等效），再 pilot 套 ~5 篇文章、部署 PSI 量測作為 go/no-go gate，通過才全量套所有內容頁（排除 admin/choice，含字集 hash 快取）。

**Tech Stack:** Node ESM、subset-font、sharp 無關、vitest、PSI 驗收。

**現況依據（`subset-fonts.mjs` 已讀）：** 既有首頁區塊：`baselineChars()`、`WEIGHTS`（sans 400/500/700、serif 600/700 的 regex）、`woff2now`、`hrefFor`/`varVal`（讀 cssAll）、`swap(val,site,home)`（坑#2 解法：把站台 web font 從棧中換掉）、逐權重 `subsetFont`→寫 `-home.<hash>.woff2`→組 `@font-face`（family `NotoSansTC-Home`/`NotoSerifTC-Home`，`font-display:optional`）→`:root` 覆蓋→注入 `</head>` 前。`ASTRO_DIR='dist/_astro'`。

---

## File Structure

**新增：**
- `scripts/lib/mini-fonts.mjs` — 純函式：`pageUsedText(html, baseline)`、`fontStackSwap(val, site, family)`、`miniStyleTag(faces, overrides)`。
- `scripts/lib/mini-fonts.test.mjs` — 上述測試。

**修改：**
- `scripts/subset-fonts.mjs` — 重構出 `injectMiniFonts(htmlPath, ctx, families)`；首頁改呼叫它；pilot/全量套用內容頁。
- `PERFORMANCE.md` — 同步逐頁迷你字型與內頁基準。

---

## Task 1: 純邏輯 lib + 測試

**Files:** Create `scripts/lib/mini-fonts.mjs`、`scripts/lib/mini-fonts.test.mjs`

- [ ] **Step 1: 寫失敗測試** — `scripts/lib/mini-fonts.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { pageUsedText, fontStackSwap, miniStyleTag } from './mini-fonts.mjs';

describe('pageUsedText', () => {
  it('聯集 baseline 與 HTML 用字、去重', () => {
    const out = pageUsedText('<p>科技</p>', 'AB');
    expect(out).toContain('科'); expect(out).toContain('技');
    expect(out).toContain('A'); expect(out).toContain('B');
    expect([...out].length).toBe(new Set([...out]).size); // 無重複
  });
});

describe('fontStackSwap（坑#2：把站台 web font 換掉，不留在棧中）', () => {
  it('棧含站台字型 → 直接替換成迷你 family', () => {
    expect(fontStackSwap('"Noto Sans TC", system-ui', 'Noto Sans TC', 'NS-Pg'))
      .toBe('"NS-Pg", system-ui');
  });
  it('棧無站台字型但有 Inter → 插在 Inter 後', () => {
    expect(fontStackSwap('"Inter", system-ui', 'Noto Sans TC', 'NS-Pg'))
      .toBe('"Inter", "NS-Pg", system-ui');
  });
  it('兩者皆無 → 前置迷你 family', () => {
    expect(fontStackSwap('system-ui', 'Noto Sans TC', 'NS-Pg'))
      .toBe('"NS-Pg", system-ui');
  });
});

describe('miniStyleTag', () => {
  it('組出 style（@font-face + :root override）', () => {
    const t = miniStyleTag(['@font-face{a}'], ['--font-sans:"NS-Pg"']);
    expect(t).toBe('<style>@font-face{a}:root{--font-sans:"NS-Pg"}</style>');
  });
  it('無 faces 或無 override → 空字串', () => {
    expect(miniStyleTag([], ['x'])).toBe('');
    expect(miniStyleTag(['x'], [])).toBe('');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗** — `pnpm test mini-fonts`。Expected FAIL（模組不存在）。

- [ ] **Step 3: 寫實作** — `scripts/lib/mini-fonts.mjs`:
```js
// 逐頁迷你字型的純邏輯（無 fs / 無 subset-font，便於測試）。
export function pageUsedText(html, baseline = '') {
  const s = new Set();
  for (const ch of baseline) s.add(ch);
  for (const ch of html) s.add(ch);
  return [...s].join('');
}

// 坑#2 解法：迷你字型為 font-display:optional，站台 web font 不能留在棧中
// （否則 optional 區間 Chrome 會抓棧中下一個 web font 當後備 → 全站大字型仍被下載）。
export function fontStackSwap(val, site, family) {
  if (val.includes(`"${site}"`)) return val.replace(`"${site}"`, `"${family}"`);
  return /"Inter",/.test(val) ? val.replace('"Inter",', `"Inter", "${family}",`) : `"${family}", ${val}`;
}

export function miniStyleTag(faces, overrides) {
  if (!faces.length || !overrides.length) return '';
  return `<style>${faces.join('')}:root{${overrides.join('')}}</style>`.replace(
    '}:root',
    '}:root',
  );
}
```
（注意：`miniStyleTag` 的 overrides 以 `;` 分隔多條，組裝時用 `overrides.join(';')`；上方測試只傳一條，故等價。實作請用 `:root{${overrides.join(';')}}`。）

修正實作中 `:root` 內以 `;` 連接：
```js
export function miniStyleTag(faces, overrides) {
  if (!faces.length || !overrides.length) return '';
  return `<style>${faces.join('')}:root{${overrides.join(';')}}</style>`;
}
```

- [ ] **Step 4: 跑測試確認通過** — `pnpm test mini-fonts`。Expected PASS。

- [ ] **Step 5: Commit:**
```bash
git add scripts/lib/mini-fonts.mjs scripts/lib/mini-fonts.test.mjs
git commit -m "feat(fonts): 逐頁迷你字型純邏輯 lib（用字收集/字型棧替換/style）+ 測試"
```

---

## Task 2: 重構 subset-fonts，首頁改用 injectMiniFonts（行為等效）

**Files:** Modify `scripts/subset-fonts.mjs`

- [ ] **Step 1: 重構** — 把現有「首頁迷你字型」區塊（`const HOME = ...` 到對應 `catch`）替換為：①一個建立共用 ctx 的區塊；②`injectMiniFonts(htmlPath, ctx, families)` 函式；③對首頁呼叫它。匯入 lib：
```js
import { pageUsedText, fontStackSwap, miniStyleTag } from './lib/mini-fonts.mjs';
```
在檔案 import 區加上。然後以下列取代原首頁區塊：
```js
// 逐頁迷你字型：為指定頁產「只含該頁用字」的子集（每權重一檔，檔名帶內容 hash），
// inline @font-face（獨立 family）+ :root 覆蓋（把站台 web font 從棧中換掉，見坑#2）。
const MINI_WEIGHTS = [
  { serif: false, w: 400, re: /noto-sans-tc-chinese-traditional-400-normal\..*\.woff2$/ },
  { serif: false, w: 500, re: /noto-sans-tc-chinese-traditional-500-normal\..*\.woff2$/ },
  { serif: false, w: 700, re: /noto-sans-tc-chinese-traditional-700-normal\..*\.woff2$/ },
  { serif: true, w: 600, re: /noto-serif-tc-chinese-traditional-600-normal\..*\.woff2$/ },
  { serif: true, w: 700, re: /noto-serif-tc-chinese-traditional-700-normal\..*\.woff2$/ },
];

function miniFontCtx() {
  const cssAll = listFiles(DIST, ['.css']).map((f) => readFileSync(f, 'utf8')).join('\n');
  const woff2now = listFiles(ASTRO_DIR, ['.woff2']);
  const hrefFor = (name) => {
    const m = cssAll.match(new RegExp('url\\(["\']?([^"\')]*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'));
    return m ? m[1] : null;
  };
  const varVal = (v) => {
    const m = cssAll.match(new RegExp('--font-' + v + ':\\s*([^;]+);'));
    return m ? m[1].trim() : null;
  };
  return { woff2now, hrefFor, varVal, sansVal: varVal('sans'), serifVal: varVal('serif'), cache: new Map() };
}

async function injectMiniFonts(htmlPath, ctx, families = { sans: 'NotoSansTC-Pg', serif: 'NotoSerifTC-Pg' }) {
  const html0 = readFileSync(htmlPath, 'utf8');
  if (!html0.includes('</head>')) return 0;
  const text = pageUsedText(html0, baselineChars());
  const faces = [];
  for (const wt of MINI_WEIGHTS) {
    const src = ctx.woff2now.find((p) => wt.re.test(basename(p)));
    if (!src) continue;
    const cacheKey = `${basename(src)}::${createHash('sha256').update(text).digest('hex').slice(0, 16)}`;
    let name = ctx.cache.get(cacheKey);
    if (!name) {
      const sub = await subsetFont(readFileSync(src), text, { targetFormat: 'woff2' });
      const hash = createHash('sha256').update(sub).digest('hex').slice(0, 8);
      name = basename(src).replace(/\.woff2$/, '') + `-pg.${hash}.woff2`;
      writeFileSync(join(ASTRO_DIR, name), sub);
      ctx.cache.set(cacheKey, name);
    }
    const prefix = (ctx.hrefFor(basename(src)) || '/_astro/' + basename(src)).replace(/[^/]*$/, '');
    const fam = wt.serif ? families.serif : families.sans;
    faces.push(`@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt.w};font-display:optional;src:url(${prefix}${name}) format('woff2')}`);
  }
  const overrides = [];
  if (ctx.sansVal) overrides.push(`--font-sans:${fontStackSwap(ctx.sansVal, 'Noto Sans TC', families.sans)}`);
  if (ctx.serifVal) overrides.push(`--font-serif:${fontStackSwap(ctx.serifVal, 'Noto Serif TC', families.serif)}`);
  const style = miniStyleTag(faces, overrides);
  if (!style) return 0;
  writeFileSync(htmlPath, html0.replace('</head>', style + '</head>'));
  return faces.length;
}

// 首頁（行為等效於舊版；family 名改為 Pg 但效果相同）。
const ctx = miniFontCtx();
let homeInjected = 0;
try {
  homeInjected = await injectMiniFonts(join(DIST, 'index.html'), ctx);
  console.log(`[subset-fonts] 首頁迷你字型：${homeInjected} 權重`);
} catch (e) {
  console.warn('[subset-fonts] 首頁迷你字型略過：' + e.message);
}
```
（保留檔案最末的總結 `console.log`；若它引用了已移除的 `homeBytes`，改為不引用或用 `homeInjected`。）

- [ ] **Step 2: build 驗證首頁行為等效** — `pnpm build`。Expected 成功。驗證首頁仍有迷你字型且未抓全站大字型：
```bash
grep -o "NotoSansTC-Pg" dist/index.html | head -1        # 應有
grep -o "noto-sans-tc-chinese-traditional-400-normal\.[a-z0-9]*-pg\." dist/index.html | head -1  # 首頁用 -pg 迷你檔
grep -c "_astro/[^\"]*\.css" dist/index.html              # 仍 0（CSS 已內聯，inline-css 在後）
```
Expected：前兩個有輸出、第三個視 inline-css 後續而定（subset-fonts 在 inline-css 之前跑，故此時首頁可能仍有 css link；改以最終 build 後檢查）。重點：首頁有 `-pg` 迷你字型、有 `NotoSansTC-Pg`。

- [ ] **Step 3: 全量測試不壞** — `pnpm test`。Expected 全綠。

- [ ] **Step 4: Commit:**
```bash
git add scripts/subset-fonts.mjs
git commit -m "refactor(fonts): 首頁迷你字型重構為可重用 injectMiniFonts（行為等效）"
```

---

## Task 3: PILOT — 套 5 篇文章並量測（go/no-go gate）

**Files:** Modify `scripts/subset-fonts.mjs`（暫時的 pilot 清單）

- [ ] **Step 1: 加 pilot 套用** — 在首頁 `injectMiniFonts` 之後加（暫時硬清單，取 5 篇代表性文章；用實際存在的 slug）：
```js
// PILOT：先驗 5 篇文章，部署後 PSI 量測決定是否全量。
const PILOT = ['post-638', 'post-643', 'post-700', 'post-748', 'post-282'];
let pilotN = 0;
for (const slug of PILOT) {
  const p = join(DIST, 'articles', slug, 'index.html');
  try { if (await injectMiniFonts(p, ctx)) pilotN++; } catch (e) { console.warn(`[subset-fonts] pilot ${slug} 略過：${e.message}`); }
}
console.log(`[subset-fonts] pilot 迷你字型：${pilotN} 頁`);
```
（若某 slug 在 dist 路徑不同，先 `find dist/articles -maxdepth 2 -name index.html | grep <slug>` 確認；取 5 個確定存在的。）

- [ ] **Step 2: build + 本機驗證** — `pnpm build && pnpm check:links`。Expected 成功、全綠。確認 pilot 頁有迷你字型且不再引用全站大字型：
```bash
f=$(find dist/articles -path '*post-638*' -name index.html|head -1)
grep -o "NotoSansTC-Pg" "$f" | head -1                                   # 應有
grep -oE "noto-sans-tc-chinese-traditional-400-normal\.[a-z0-9]*-pg\." "$f" | head -1  # -pg 迷你檔
grep -oE "noto-sans-tc-chinese-traditional-400-normal\.[a-z0-9]+\.woff2" "$f" | grep -v -- '-pg' | head -1  # 全站大字型「不應」再被該頁 @font-face 指向
```

- [ ] **Step 3: Commit + 部署 pilot** — 合併到 main 部署（PSI 必須量線上）：
```bash
git add scripts/subset-fonts.mjs
git commit -m "feat(fonts): pilot 5 篇文章逐頁迷你字型（量測用）"
# 合併部署（依專案流程：切 main、ff、merge、push）
```

- [ ] **Step 4: 部署後 PSI 量測（GATE）** — 對 5 篇 pilot + 首頁跑 mobile：
```bash
source .env
psi(){ curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$1&strategy=mobile&category=performance&key=$PSI_API_KEY" | python3 -c "import sys,json;d=json.load(sys.stdin);lr=d['lighthouseResult'];m=lr['audits']['metrics']['details']['items'][0];print('score',round(lr['categories']['performance']['score']*100),'FCP',m.get('firstContentfulPaint'),'LCP',m.get('largestContentfulPaint'))"; }
B=https://yao-care.github.io/appi.news
for s in articles/post-638 articles/post-643 articles/post-700 articles/post-748 articles/post-282; do echo "$s: $(psi $B/$s/)"; done
echo "home: $(psi $B/)"
```
- **決策**：pilot 文章 mobile 多數 ≥90（或顯著躍升至可接受、且首頁未退）→ 進 Task 4 全量。若明顯不足 → **停**，回報實測 FCP/LCP 細項與分數，與使用者重新評估（不全量硬上）。

---

## Task 4: 全量套用所有內容頁（pilot 通過後）

**Files:** Modify `scripts/subset-fonts.mjs`

- [ ] **Step 1: 用全站走訪取代 pilot 清單** — 把 Task 3 的 `PILOT` 區塊換成走遍所有內容頁（排除 admin/choice、跳過首頁已做）：
```js
import { relative, sep } from 'node:path';
// ...（relative/sep 若未匯入則補）
const EXCLUDE_TOP = ['admin', 'choice'];
const HOME_PATH = join(DIST, 'index.html');
let pageN = 0;
for (const f of listFiles(DIST, ['.html'])) {
  if (f === HOME_PATH) continue;
  const top = relative(DIST, f).split(sep)[0];
  if (EXCLUDE_TOP.includes(top)) continue;
  try { if (await injectMiniFonts(f, ctx)) pageN++; } catch (e) { console.warn(`[subset-fonts] ${f} 略過：${e.message}`); }
}
console.log(`[subset-fonts] 內頁逐頁迷你字型：${pageN} 頁（字集快取 ${ctx.cache.size} 個子集檔）`);
```

- [ ] **Step 2: build + 計時 + 連結 gate** — `time pnpm build && pnpm check:links`。Expected 成功、全綠。記錄 build 時間與 `ctx.cache.size`、dist 字型總量：
```bash
du -sh dist/_astro/*.woff2 2>/dev/null | tail -1; ls dist/_astro/*-pg.*.woff2 | wc -l
```
若 build 時間/檔數不可接受（例如 >數分鐘過頭），縮範圍（先只文章頁：`top==='articles'`）或減權重，並記錄取捨。

- [ ] **Step 3: 抽查多頁型未載大字型** — 對 articles / tech / authors 各一頁，確認有 `-pg` 迷你字型、`@font-face` 不指向全站大字型（同 Task 3 Step 2 的 grep）。

- [ ] **Step 4: Commit:**
```bash
git add scripts/subset-fonts.mjs
git commit -m "feat(fonts): 全內容頁逐頁迷你字型（排除 admin/choice，字集 hash 快取）"
```

---

## Task 5: 文件同步 + 最終 PSI 驗收 + 基準回填

**Files:** Modify `PERFORMANCE.md`

- [ ] **Step 1: 部署** — 合併 main 部署（含 Task 4 全量）。

- [ ] **Step 2: 最終 PSI** — 首頁 + 內頁多頁型（文章/分類/作者）mobile/desktop：
```bash
source .env
# 同上 psi 函式；量 首頁 desktop+mobile、文章×3、分類×1、作者×1
```
Expected：首頁 desktop 100 / mobile ≥90；內頁 mobile 90+（或記錄實際達到值）。

- [ ] **Step 3: 更新 PERFORMANCE.md** — §2 補「subset-fonts 也為**所有內容頁**產逐頁迷你字型（非只首頁）」；§5 把內頁說明更新為「逐頁迷你字型已上線」；§4/§5 寫入內頁實測基準（不可退回）。

- [ ] **Step 4: Commit + 部署:**
```bash
git add PERFORMANCE.md
git commit -m "docs(fonts): 同步逐頁迷你字型與內頁 PSI 基準"
```

---

## Self-Review（撰寫者自檢）
- **Spec 覆蓋**：§3.1 重構=Task1+2；§3.2 範圍=Task4；§3.3 快取=Task4 Step1（cacheKey）；§3.4 pilot=Task3（gate）；§4 驗收=Task3/5；文件=Task5。皆對應。
- **無 placeholder**：純函式附完整碼+測試；重構附完整函式碼；驗證附 grep/PSI 指令。
- **型別一致**：`injectMiniFonts(htmlPath, ctx, families)`、`miniFontCtx()→{woff2now,hrefFor,varVal,sansVal,serifVal,cache}`、lib `pageUsedText/fontStackSwap/miniStyleTag` 簽章前後一致；family `NotoSansTC-Pg`/`NotoSerifTC-Pg`、檔名 `-pg.<hash>.woff2` 一致。
- **風險**：pilot 為硬 gate（Task3 決策點），避免假設打錯全量硬上；build 成本在 Task4 計時並備縮範圍。
