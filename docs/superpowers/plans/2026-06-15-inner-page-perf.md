# 內頁效能優化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把內頁（文章/分類/子分類/作者/專欄/專題）PSI mobile 推到 90+，首頁基準（desktop 100、mobile 90+）不退。

**Architecture:** 把首頁的去 render-blocking 手法延伸到全站：將 `inline-home-css.mjs` 通用化為走遍所有 `dist/**/*.html` 的 `inline-css.mjs`（排除 `/choice`、`/admin`），並新增 `optimize-article-images.mjs` 把內頁封面縮成 webp。純 HTML 轉換邏輯抽成 `scripts/lib/*.mjs` 走 vitest TDD；fs/sharp 與整體效果用 `pnpm build` + grep + 第三方 PSI 驗收。

**Tech Stack:** Node ESM 腳本、sharp、vitest（已含 `scripts/**/*.test.mjs`）、Astro postbuild、PageSpeed Insights。

**現況依據（已驗證）：**
- `scripts/inline-home-css.mjs`：掃 `<link rel="stylesheet" href=".../_astro/X.css">`、讀檔內聯為 `<style>`、移除 link；**只跑 `dist/index.html`**。
- `scripts/optimize-home-images.mjs`：sharp `resize(width,null,{withoutEnlargement:true}).webp({quality:72})`、hash 檔名、不變小就不換；只動首頁 `/covers/` 圖。
- 文章封面 HTML：`<img src="/appi.news/covers/wp-426.jpg" alt="…" class="article-cover" loading="eager" data-fallback="…" onerror="…">`（src 在 class 之前）。
- 內頁 `<head>` 有多個 `_astro/*.css` render-blocking link；`/choice` 頁有 ~592KB CSS（須排除）。
- `package.json` postbuild：`subset-fonts.mjs && optimize-home-images.mjs && inline-home-css.mjs && pagefind --site dist`。
- 站內約 1,400+ HTML、文章封面數百張。

---

## File Structure

**新增：**
- `scripts/lib/inline-css.mjs` — 純函式 `inlineCssLinks(html, getCss)`：把指向 `_astro/*.css` 的 link 換成內聯 `<style>`。
- `scripts/lib/inline-css.test.mjs`
- `scripts/lib/cover-rewrite.mjs` — 純函式 `findArticleCoverSrc(html)` / `replaceArticleCoverSrc(html, newSrc)`。
- `scripts/lib/cover-rewrite.test.mjs`
- `scripts/inline-css.mjs` — postbuild 進入點：走 `dist/**/*.html`（排除 choice/admin）、快取 `_astro` CSS、套 `inlineCssLinks`。
- `scripts/optimize-article-images.mjs` — postbuild 進入點：縮內頁封面成 webp、改寫 `src`。

**修改：**
- `package.json` — postbuild 串接（`inline-home-css` → `inline-css`，插入 `optimize-article-images`）。
- `PERFORMANCE.md` / `README.md` / `CLAUDE.md` — 同步腳本改名、新腳本與內頁基準。

**刪除：**
- `scripts/inline-home-css.mjs`（由 `inline-css.mjs` 取代）。

---

## Task 1: inline-css 純函式 + 測試

**Files:**
- Create: `scripts/lib/inline-css.mjs`
- Test: `scripts/lib/inline-css.test.mjs`

- [ ] **Step 1: 寫失敗測試** — `scripts/lib/inline-css.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { inlineCssLinks } from './inline-css.mjs';

describe('inlineCssLinks', () => {
  it('把 _astro CSS link 換成內聯 style，外部 link 不動', () => {
    const html =
      '<link rel="stylesheet" href="/appi.news/_astro/a.css">' +
      '<link rel="stylesheet" href="https://cdn.example/ext.css">';
    const getCss = (f) => (f === 'a.css' ? 'body{color:red}' : null);
    const r = inlineCssLinks(html, getCss);
    expect(r.html).toContain('<style>body{color:red}</style>');
    expect(r.html).not.toContain('_astro/a.css');
    expect(r.html).toContain('href="https://cdn.example/ext.css"');
    expect(r.inlined).toBe(1);
    expect(r.bytes).toBe('body{color:red}'.length);
  });
  it('找不到 CSS 內容時保留原 link', () => {
    const html = '<link rel="stylesheet" href="/appi.news/_astro/missing.css">';
    const r = inlineCssLinks(html, () => null);
    expect(r.html).toBe(html);
    expect(r.inlined).toBe(0);
  });
  it('多個 _astro link 全部內聯', () => {
    const html =
      '<link rel="stylesheet" href="/x/_astro/a.css">' +
      '<link rel="stylesheet" href="/x/_astro/b.css">';
    const r = inlineCssLinks(html, (f) => (f === 'a.css' ? 'A{}' : 'B{}'));
    expect(r.inlined).toBe(2);
    expect(r.html).toContain('<style>A{}</style>');
    expect(r.html).toContain('<style>B{}</style>');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗** — `pnpm test inline-css`。Expected: FAIL（找不到模組）。

- [ ] **Step 3: 寫實作** — `scripts/lib/inline-css.mjs`:
```js
// 純函式：把指向 _astro/*.css 的 render-blocking <link> 換成內聯 <style>。
// getCss(filename) 回傳該 css 檔內容字串，或 null（找不到則保留原 link）。
export function inlineCssLinks(html, getCss) {
  const linkRe = /<link\b[^>]*\brel="stylesheet"[^>]*>/g;
  let out = html;
  let inlined = 0;
  let bytes = 0;
  for (const link of html.match(linkRe) || []) {
    const m = link.match(/href="[^"]*\/_astro\/([^"]+\.css)"/);
    if (!m) continue;
    const css = getCss(m[1]);
    if (css == null) continue;
    out = out.replace(link, `<style>${css}</style>`);
    inlined++;
    bytes += css.length;
  }
  return { html: out, inlined, bytes };
}
```

- [ ] **Step 4: 跑測試確認通過** — `pnpm test inline-css`。Expected: PASS（3 測試）。

- [ ] **Step 5: Commit:**
```bash
git add scripts/lib/inline-css.mjs scripts/lib/inline-css.test.mjs
git commit -m "feat(perf): inline-css 純函式（_astro CSS link → 內聯 style）+ 測試"
```

---

## Task 2: 全站內聯進入點 + 取代 inline-home-css

**Files:**
- Create: `scripts/inline-css.mjs`
- Delete: `scripts/inline-home-css.mjs`
- Modify: `package.json`

- [ ] **Step 1: 寫 `scripts/inline-css.mjs`:**
```js
// postbuild：走遍 dist 全站 HTML，把 _astro render-blocking CSS 內聯（排除 choice/admin）。
// 由 inline-home-css.mjs 通用化而來；首頁也走同一支。須在 subset-fonts/optimize-* 之後跑。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { inlineCssLinks } from './lib/inline-css.mjs';

const DIST = 'dist';
const EXCLUDE_TOP = ['choice', 'admin']; // 第一層目錄排除（choice 有 ~592KB CSS）

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkHtml(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const cssCache = new Map();
function getCss(file) {
  if (cssCache.has(file)) return cssCache.get(file);
  const p = join(DIST, '_astro', file);
  const v = existsSync(p) ? readFileSync(p, 'utf8') : null;
  cssCache.set(file, v);
  return v;
}

const pages = walkHtml(DIST).filter((p) => {
  const top = relative(DIST, p).split(sep)[0];
  return !EXCLUDE_TOP.includes(top);
});

let files = 0;
let totalInlined = 0;
let totalBytes = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const { html: out, inlined, bytes } = inlineCssLinks(html, getCss);
  if (inlined) {
    writeFileSync(p, out);
    files++;
    totalInlined += inlined;
    totalBytes += bytes;
  }
}
console.log(
  `[inline-css] ${files} 頁內聯 ${totalInlined} 個 CSS（${(totalBytes / 1024).toFixed(0)}KB），移除 render-blocking link`,
);
```

- [ ] **Step 2: 刪除舊腳本** — `git rm scripts/inline-home-css.mjs`。

- [ ] **Step 3: 改 package.json postbuild** — 把 `inline-home-css.mjs` 換成 `inline-css.mjs`（其餘不動）：
```json
"postbuild": "node scripts/subset-fonts.mjs && node scripts/optimize-home-images.mjs && node scripts/inline-css.mjs && pagefind --site dist",
```

- [ ] **Step 4: build 驗證** — `pnpm build`。Expected: 成功。驗證：
```bash
# 文章內頁不應再有 _astro render-blocking CSS link
f=$(find dist/articles -name index.html | head -1); grep -c '_astro/[^"]*\.css"' "$f"
# 首頁也應為 0（仍內聯）
grep -c '_astro/[^"]*\.css"' dist/index.html
# choice 頁應「保留」link（被排除，不內聯）→ 若存在 choice 頁則 >0
find dist/choice -name index.html 2>/dev/null | head -1 | xargs -r grep -c '_astro/[^"]*\.css"'
```
Expected: 文章頁與首頁皆印 `0`；choice 頁（若有）印 `>0`。

- [ ] **Step 5: 跑既有測試確認未壞** — `pnpm test`。Expected: 全數 PASS。

- [ ] **Step 6: Commit:**
```bash
git add scripts/inline-css.mjs package.json
git rm scripts/inline-home-css.mjs
git commit -m "feat(perf): 全站 critical-CSS 內聯（inline-css 取代 inline-home-css，排除 choice/admin）"
```

---

## Task 3: 封面改寫純函式 + 測試

**Files:**
- Create: `scripts/lib/cover-rewrite.mjs`
- Test: `scripts/lib/cover-rewrite.test.mjs`

- [ ] **Step 1: 寫失敗測試** — `scripts/lib/cover-rewrite.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { findArticleCoverSrc, replaceArticleCoverSrc } from './cover-rewrite.mjs';

const tag =
  '<img src="/appi.news/covers/wp-426.jpg" alt="封面" class="article-cover" loading="eager" data-fallback="/appi.news/og/health.png" onerror="x">';
const html = `<div>before</div>${tag}<p>after</p>`;

describe('findArticleCoverSrc', () => {
  it('抓到 article-cover 的 src（src 在 class 之前也行）', () => {
    expect(findArticleCoverSrc(html)).toBe('/appi.news/covers/wp-426.jpg');
  });
  it('沒有 article-cover 時回 null', () => {
    expect(findArticleCoverSrc('<img src="/x.jpg" class="other">')).toBeNull();
  });
});

describe('replaceArticleCoverSrc', () => {
  it('只換 article-cover 的 src，其餘屬性與內容不動', () => {
    const out = replaceArticleCoverSrc(html, '/appi.news/covers/wp-426-a900.abcd1234.webp');
    expect(out).toContain('src="/appi.news/covers/wp-426-a900.abcd1234.webp"');
    expect(out).not.toContain('covers/wp-426.jpg');
    expect(out).toContain('class="article-cover"');
    expect(out).toContain('data-fallback="/appi.news/og/health.png"');
    expect(out).toContain('<p>after</p>');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗** — `pnpm test cover-rewrite`。Expected: FAIL。

- [ ] **Step 3: 寫實作** — `scripts/lib/cover-rewrite.mjs`:
```js
// 純函式：定位文章封面 <img class="article-cover"> 並讀/換其 src。
const COVER_RE = /<img\b[^>]*\bclass="[^"]*\barticle-cover\b[^"]*"[^>]*>/;

export function findArticleCoverSrc(html) {
  const tag = html.match(COVER_RE);
  if (!tag) return null;
  const m = tag[0].match(/\bsrc="([^"]+)"/);
  return m ? m[1] : null;
}

export function replaceArticleCoverSrc(html, newSrc) {
  return html.replace(COVER_RE, (tag) =>
    tag.replace(/\bsrc="[^"]+"/, `src="${newSrc}"`),
  );
}
```

- [ ] **Step 4: 跑測試確認通過** — `pnpm test cover-rewrite`。Expected: PASS。

- [ ] **Step 5: Commit:**
```bash
git add scripts/lib/cover-rewrite.mjs scripts/lib/cover-rewrite.test.mjs
git commit -m "feat(perf): 封面改寫純函式（find/replace article-cover src）+ 測試"
```

---

## Task 4: 內頁封面縮圖進入點

**Files:**
- Create: `scripts/optimize-article-images.mjs`
- Modify: `package.json`

- [ ] **Step 1: 寫 `scripts/optimize-article-images.mjs`:**
```js
// postbuild：把內頁文章封面（.article-cover）縮成寬 900 的 webp，改寫該頁 src。
// 比照 optimize-home-images：hash 檔名、不變小就不換、原圖小於目標寬不放大。
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { findArticleCoverSrc, replaceArticleCoverSrc } from './lib/cover-rewrite.mjs';

const DIST = 'dist';
const ARTICLES = join(DIST, 'articles');
const WIDTH = 900;
const Q = 72;

function walkIndex(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkIndex(p));
    else if (name === 'index.html') out.push(p);
  }
  return out;
}

const cache = new Map(); // 來源 cover 檔 → 產出檔名（或 null=不值得縮）
let count = 0;
let saved = 0;

for (const page of walkIndex(ARTICLES)) {
  let html = readFileSync(page, 'utf8');
  const src = findArticleCoverSrc(html);
  if (!src || !src.includes('/covers/')) continue;
  const prefix = src.split('/covers/')[0];
  const file = src.split('/covers/')[1];
  const input = join(DIST, 'covers', file);
  if (!existsSync(input)) continue;

  let outName = cache.get(input);
  if (outName === undefined) {
    const buf = await sharp(input)
      .resize(WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: Q })
      .toBuffer();
    const orig = readFileSync(input).length;
    if (buf.length >= orig) {
      cache.set(input, null);
      outName = null;
    } else {
      const hash = createHash('sha256').update(buf).digest('hex').slice(0, 8);
      outName = `${file.replace(/\.[a-z0-9]+$/i, '')}-a${WIDTH}.${hash}.webp`;
      writeFileSync(join(DIST, 'covers', outName), buf);
      cache.set(input, outName);
      saved += orig - buf.length;
    }
  }
  if (!outName) continue;

  html = replaceArticleCoverSrc(html, `${prefix}/covers/${outName}`);
  writeFileSync(page, html);
  count++;
}
console.log(
  `[optimize-article-images] ${count} 篇內頁封面縮為 webp，省 ${(saved / 1024).toFixed(0)}KB`,
);
```

- [ ] **Step 2: 改 package.json postbuild** — 在 `optimize-home-images.mjs` 之後、`inline-css.mjs` 之前插入：
```json
"postbuild": "node scripts/subset-fonts.mjs && node scripts/optimize-home-images.mjs && node scripts/optimize-article-images.mjs && node scripts/inline-css.mjs && pagefind --site dist",
```

- [ ] **Step 3: build 驗證** — `pnpm build`。Expected: 成功。驗證某篇含封面的文章頁，封面已是縮過的 webp：
```bash
f=$(grep -rl 'class="article-cover"' dist/articles | head -1)
grep -oE '<img[^>]*class="article-cover"[^>]*>' "$f" | grep -oE 'src="[^"]+"'
```
Expected: src 指向 `/appi.news/covers/<name>-a900.<hash>.webp`（webp、含 `-a900` 標記）。

- [ ] **Step 4: Commit:**
```bash
git add scripts/optimize-article-images.mjs package.json
git commit -m "feat(perf): 內頁封面縮圖（optimize-article-images，900px webp）"
```

---

## Task 5: 同步文件（PERFORMANCE / README / CLAUDE）

**Files:**
- Modify: `PERFORMANCE.md`、`README.md`、`CLAUDE.md`

- [ ] **Step 1: PERFORMANCE.md** — §2 postbuild 表格：把 `inline-home-css.mjs` 那列改名為 `inline-css.mjs` 並把「只動首頁」改為「**全站**內聯（排除 choice/admin）」；新增一列 `optimize-article-images.mjs`（內頁封面縮 webp）。§5 把「內頁目前沿用原圖、未去 render-blocking」改為「內頁已套全站 CSS 內聯 + 封面縮圖」。（基準數字於 Task 6 補。）

- [ ] **Step 2: README.md** — 「Build 流程」區塊的 postbuild 清單更新為四步：`subset-fonts` → `optimize-home-images` → `optimize-article-images` → `inline-css`（+ pagefind）；各加一句用途。「目錄結構」的 scripts 區把 `inline-home-css.mjs` 改為 `inline-css.mjs`（全站 CSS 內聯）並新增 `optimize-article-images.mjs`。「效能驗收」段移除「內頁未優化」的說法。

- [ ] **Step 3: CLAUDE.md** — 效能鐵則第 2 點的 postbuild 串接更新為：`subset-fonts.mjs` → `optimize-home-images.mjs` → `optimize-article-images.mjs` → `inline-css.mjs`；第 5 點（內頁偏低為結構性現象）改為「內頁已套同手法優化」。

- [ ] **Step 4: Commit:**
```bash
git add PERFORMANCE.md README.md CLAUDE.md
git commit -m "docs(perf): 同步腳本改名與內頁優化（PERFORMANCE/README/CLAUDE）"
```

---

## Task 6: 驗收（PSI）與基準回填

**Files:** Modify: `PERFORMANCE.md`（回填內頁基準）

- [ ] **Step 1: build + 連結 gate** — `pnpm build && pnpm check:links`。Expected: build 成功、check:links 全綠。

- [ ] **Step 2: 確認 dist 無 render-blocking 漏網** — 抽查多頁型 `<head>` 無 `_astro` CSS link：
```bash
for d in articles international/asia tech authors columns; do
  f=$(find "dist/$d" -name index.html 2>/dev/null | head -1)
  [ -n "$f" ] && echo "$f -> $(grep -c '_astro/[^"]*\.css"' "$f") 個外部 css link"
done
```
Expected: 各頁皆 `0`。

- [ ] **Step 3: 部署後第三方 PSI**（需先把分支合併/部署上線，或對 PR preview；依專案以線上站為準）。對下列各跑 mobile 與 desktop，記錄分數：
```bash
source .env
psi(){ curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$1&strategy=$2&category=performance&key=$PSI_API_KEY" | python3 -c "import sys,json;d=json.load(sys.stdin);print(round(d['lighthouseResult']['categories']['performance']['score']*100) if 'lighthouseResult' in d else 'ERR')"; }
# 首頁（不可退）
psi https://yao-care.github.io/appi.news/ mobile
psi https://yao-care.github.io/appi.news/ desktop
# 內頁抽樣（取線上真實存在的 URL）：文章 / 分類 / 子分類 / 作者
```
Expected：**首頁 desktop 100、mobile 90+**；**內頁 mobile 90+**。若某內頁未達標，回報實測細項（FCP/LCP）再決定後續（例如封面寬度或品質微調）。

- [ ] **Step 4: 回填基準到 PERFORMANCE.md** — 把 Step 3 的內頁實測值寫入 §4 或 §5 作為「內頁基準（不可退回）」。

- [ ] **Step 5: Commit:**
```bash
git add PERFORMANCE.md
git commit -m "docs(perf): 回填內頁 PSI 基準"
```

---

## Self-Review（撰寫者自檢）

- **Spec 覆蓋**：§3.1 全站內聯=Task 1+2；§3.2 封面縮圖=Task 3+4；§3.3 postbuild 順序=Task 2+4 的 package.json；§3.4 文件同步=Task 5+6；§4 驗收=Task 6。皆有對應。
- **無 placeholder**：純函式步驟附完整程式碼與測試；腳本步驟附完整程式碼與 grep 驗證；文件步驟指明改哪段。
- **型別/命名一致**：`inlineCssLinks(html, getCss)→{html,inlined,bytes}`（Task1 定義，Task2 使用一致）；`findArticleCoverSrc`/`replaceArticleCoverSrc`（Task3 定義，Task4 使用一致）；產出檔名慣例 `<name>-a900.<hash>.webp` 一致；postbuild 串接在 Task2（改名）與 Task4（插入）累加為最終四步，無矛盾。
- **風險覆蓋**：首頁不退（Task2 Step4 驗首頁仍 0 外部 css、Task6 PSI 複測）；choice 排除（Task2 Step4 驗 choice 仍有 link）；既有測試不壞（Task2 Step5 全量 test）。
