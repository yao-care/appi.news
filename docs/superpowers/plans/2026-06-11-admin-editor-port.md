# /admin 編輯器移植 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 evidencetoday.news 的 `/admin` 編輯器（前端 Svelte islands + GitHub Contents API + 兩個 Cloudflare Worker）完整移植到 appi.news，支援全欄位編輯、新增文章、圖片上傳、AI 即時潤飾。

**Architecture:** 純前端 Svelte 元件直接呼叫 GitHub API commit，OAuth/AI 由 Cloudflare Worker 中繼。Astro 維持 `output: 'static'`。多數程式碼自 evidencetoday 複製後改寫硬編碼常數（repo、副檔名、worker URL、token key、設計 token）；淨新增的是「全欄位混合表單 + Zod 存檔驗證」。

**Tech Stack:** Astro 5、Svelte 5、@toast-ui/editor、js-yaml、pinyin-pro、vitest、Cloudflare Workers（wrangler）、GitHub REST API、Anthropic API。

**來源根目錄（複製來源）：** `/Users/lightman/weiqi.kids/evidencetoday.news`（以下簡稱 `$SRC`）
**目標根目錄：** `/Users/lightman/yao.care/appi.news`（以下簡稱 `$DST`，即 cwd）
**分支：** `feat/admin-editor`（已建立，設計文件已 commit）

---

## File Structure（移植後 appi.news 新增/修改的檔案）

**新增：**
- `src/components/editor/{AdminLogin,EditButton,EditorPanel,BodyEditor,NewArticle,SeoFields}.svelte`
- `src/utils/editor/{token,mdx-doc,github,issue,image-upload,slugify,deploy-status,save-machine,seo-schema,article-schema}.ts` + 對應 `.test.ts`
- `src/utils/editor/lint/{index,types}.ts`、`src/utils/editor/lint/rules/{description-length,phantom-image}.ts` + `.test.ts`
- `src/pages/admin.astro`
- `public/vendor/toastui-editor.css`
- `workers/github-oauth/{src/index.ts,src/index.test.ts,wrangler.toml,README.md}`
- `workers/ai-suggest/{src/index.ts,src/index.test.ts,src/prompt.ts,src/prompt.test.ts,wrangler.toml,README.md}`
- `vitest.config.ts`
- `docs/superpowers/specs/2026-06-11-admin-editor-port-design.md`（已存在）

**修改：**
- `package.json`（加依賴與 `test` script）
- `astro.config.mjs`（加 `svelte()` 整合）
- 文章詳細頁（掛 EditButton）— 需先確認 appi.news 文章頁檔案路徑（見 Task 8）
- `src/styles/global.css`（加編輯器設計 token 相容區塊，見 Task 3）

---

## Task 1: Svelte 整合與依賴

**Files:**
- Modify: `$DST/package.json`
- Modify: `$DST/astro.config.mjs`
- Create: `$DST/vitest.config.ts`

- [ ] **Step 1: 安裝依賴**

Run（在 `$DST`）：
```bash
pnpm add @astrojs/svelte@^7.2.5 svelte@^5.55.5 @toast-ui/editor@^3.2.2 js-yaml@^4.2.0 pinyin-pro@^3.28.1
pnpm add -D vitest@^4.1.8 @types/js-yaml@^4.0.9
```
Expected: 安裝成功，`package.json` dependencies/devDependencies 出現上述套件。

- [ ] **Step 2: astro.config.mjs 加 svelte 整合**

在 `import mdx from '@astrojs/mdx';` 下一行加：
```js
import svelte from '@astrojs/svelte';
```
在 `integrations: [` 陣列開頭加 `svelte(),`（sitemap filter 已排除 `/admin`，不動）。

- [ ] **Step 3: 加 test script**

`package.json` 的 `scripts` 加：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 建立 vitest.config.ts**

Create `$DST/vitest.config.ts`：
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'workers/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
});
```

- [ ] **Step 5: 驗證建置仍綠**

Run: `pnpm build 2>&1 | tail -5`
Expected: build 成功（加了 svelte 整合但還沒有 .svelte 檔，不影響）。

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs vitest.config.ts
git commit -m "build: 加入 Svelte 整合與編輯器依賴 + vitest"
```

---

## Task 2: 移植「通用、可直接重用」的 utils

這些檔案與站台 schema 無關，僅 token.ts 需改 key。複製後跑移植過來的測試。

**Files:**
- Create: `src/utils/editor/token.ts`、`mdx-doc.ts`、`slugify.ts`、`save-machine.ts`、`deploy-status.ts` + 各自 `.test.ts`（`mdx-doc` 含 `.roundtrip.test.ts`）

- [ ] **Step 1: 複製檔案**

Run（在 `$DST`）：
```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
mkdir -p src/utils/editor
cp "$SRC"/src/utils/editor/{token.ts,mdx-doc.ts,mdx-doc.test.ts,mdx-doc.roundtrip.test.ts,slugify.ts,slugify.test.ts,save-machine.ts,save-machine.test.ts,deploy-status.ts,deploy-status.test.ts,token.test.ts} src/utils/editor/
```

- [ ] **Step 2: token.ts 改 key（避免與同機 evidencetoday 撞 sessionStorage）**

`src/utils/editor/token.ts` 第一行改：
```ts
export const KEY = 'appi_gh_token';
```

- [ ] **Step 3: deploy-status.ts 改 OWNER/REPO**

`src/utils/editor/deploy-status.ts` 內把 `weiqi-kids` → `yao-care`、`evidencetoday.news` → `appi.news`（grep 確認所有出現處）。

- [ ] **Step 4: 跑測試**

Run: `pnpm test src/utils/editor/ 2>&1 | tail -20`
Expected: token / mdx-doc / slugify / save-machine / deploy-status 測試全綠。
（若 deploy-status.test.ts 內斷言寫死 repo 名，一併把斷言改成 appi.news。）

- [ ] **Step 5: Commit**

```bash
git add src/utils/editor/
git commit -m "feat(editor): 移植通用 utils（token/mdx-doc/slugify/save-machine/deploy-status）"
```

---

## Task 3: 設計 token 相容區塊

編輯器元件 inline style 引用 evidencetoday 的 token（`--color-teal`、`--color-coral`、`--color-fog`、`--color-paper`、`--color-ink`、`--color-teal-subtle`、`--color-teal-hover`、`--color-coral-hover`、`--font-ui`、`--text-meta`、`--text-body`、`--text-badge`、`--radius-pill`、`--radius-sm`、`--radius-card`、`--shadow-card`、`--space-page-*`）。appi.news 未必有這些名。建立相容映射，避免逐檔改 style。

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: 盤點 appi.news 既有 token**

Run: `grep -oE '\-\-[a-z0-9-]+' src/styles/global.css | sort -u | head -60`
記下 appi.news 對應的中性墨黑、藏青、金、淡線、紙底、字體、圓角等變數名。

- [ ] **Step 2: 在 global.css 的 `:root` 末尾加「編輯器相容 token」**

把 evidencetoday token 名映射到 appi.news 既有 token（下列 fallback 值僅在 appi.news 無對應時使用；實作時優先用 appi.news 真實變數）：
```css
/* ── 編輯器（/admin）相容 token：映射 evidencetoday 命名到 appi.news 設計系統 ── */
:root {
  --color-ink: var(--appi-ink, #1a1a1a);
  --color-paper: var(--appi-paper, #f7f5f0);
  --color-fog: var(--line-2, #d9d6cf);
  --color-teal: var(--appi-brand, #1f3a5f);        /* 藏青當主動作色 */
  --color-teal-hover: color-mix(in oklch, var(--color-teal) 85%, black);
  --color-teal-subtle: color-mix(in oklch, var(--color-teal) 12%, white);
  --color-coral: var(--appi-accent, #a87515);       /* 金當編輯 FAB 強調 */
  --color-coral-hover: color-mix(in oklch, var(--color-coral) 85%, black);
  --font-ui: var(--font-sans, system-ui, sans-serif);
  --text-meta: 0.875rem;
  --text-body: 1rem;
  --text-badge: 0.75rem;
  --radius-sm: 6px;
  --radius-pill: 999px;
  --radius-card: 12px;
  --shadow-card: 0 2px 8px rgb(0 0 0 / 0.08);
  --space-page-x: clamp(1rem, 5vw, 2rem);
  --space-page-y: clamp(1.5rem, 4vw, 3rem);
}
```
（實作者須把 fallback 第一引數換成 appi.news 真實變數名；若 appi.news 已有同名變數則此區塊不覆寫——故放 `:root` 末尾並用 `var(真實, fallback)` 形式。）

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style(editor): 加入編輯器設計 token 相容映射"
```

---

## Task 4: 移植 GitHub/Issue/圖片 utils（改 OWNER/REPO/副檔名）

**Files:**
- Create: `src/utils/editor/github.ts`、`issue.ts`、`image-upload.ts` + 各 `.test.ts`

- [ ] **Step 1: 複製**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
cp "$SRC"/src/utils/editor/{github.ts,github.test.ts,issue.ts,issue.test.ts,image-upload.ts,image-upload.test.ts} src/utils/editor/
```

- [ ] **Step 2: 三檔改常數**

每檔頂部：`OWNER='weiqi-kids'` → `'yao-care'`；`REPO='evidencetoday.news'` → `'appi.news'`。

- [ ] **Step 3: issue.ts 工單模板改為 appi.news**

`issue.ts` 的 `buildIssueBody` 內：目標檔案路徑由 `src/content/{collection}/{slug}.mdx` 改為 `src/content/articles/{slug}.md`；提及「依 content.config.ts 的 schema 填 frontmatter」保留；collection 固定 `articles`（appi.news 無 myths/ingredients）。

- [ ] **Step 4: 跑測試並修斷言**

Run: `pnpm test src/utils/editor/github.test.ts src/utils/editor/issue.test.ts src/utils/editor/image-upload.test.ts 2>&1 | tail -20`
Expected: 全綠。測試內若斷言 repo 名/路徑/副檔名，改為 appi.news 對應值（`.md`）。

- [ ] **Step 5: Commit**

```bash
git add src/utils/editor/
git commit -m "feat(editor): 移植 github/issue/image-upload（改 yao-care/appi.news、.md）"
```

---

## Task 5: 移植 lint 引擎（保留通用規則，移除 myths 專屬）

**Files:**
- Create: `src/utils/editor/lint/{index,types}.ts`、`lint/rules/{description-length,phantom-image}.ts` + `.test.ts`

- [ ] **Step 1: 複製通用部分**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
mkdir -p src/utils/editor/lint/rules
cp "$SRC"/src/utils/editor/lint/{index.ts,index.test.ts,types.ts} src/utils/editor/lint/
cp "$SRC"/src/utils/editor/lint/rules/{description-length.ts,description-length.test.ts,phantom-image.ts,phantom-image.test.ts} src/utils/editor/lint/rules/
```
（**不複製** `myth-references.*`。）

- [ ] **Step 2: index.ts 移除 myth-references**

`src/utils/editor/lint/index.ts` 刪掉 `import` 與 `RULES` 陣列中的 `mythReferencesRule`。

- [ ] **Step 3: index.test.ts 移除 myth 相關斷言**

刪除/調整 index.test.ts 內引用 myth-references 的測試，只留 description-length + phantom-image 的整合斷言。

- [ ] **Step 4: 跑測試**

Run: `pnpm test src/utils/editor/lint/ 2>&1 | tail -20`
Expected: 全綠。

- [ ] **Step 5: Commit**

```bash
git add src/utils/editor/lint/
git commit -m "feat(editor): 移植 lint 引擎（保留 description-length/phantom-image）"
```

---

## Task 6: appi.news 全欄位表單描述 + Zod 存檔驗證模組

淨新增。把 appi.news articles 的 Zod schema 抽出可在瀏覽器 import 的版本，並定義「核心 widget 欄位」描述。

**Files:**
- Create: `src/utils/editor/article-schema.ts`（瀏覽器可用的 articles Zod schema + 核心欄位描述）
- Create: `src/utils/editor/article-schema.test.ts`
- Modify: `src/utils/editor/seo-schema.ts`（改為回傳 appi.news 核心欄位）

- [ ] **Step 1: 寫失敗測試**

Create `src/utils/editor/article-schema.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { validateArticleFrontmatter, CORE_FIELDS } from './article-schema';

describe('validateArticleFrontmatter', () => {
  const ok = {
    title: 't', description: 'd', publishDate: '2026-01-01', category: 'health',
  };
  it('接受合法 frontmatter（補預設後通過）', () => {
    const r = validateArticleFrontmatter(ok);
    expect(r.ok).toBe(true);
  });
  it('缺 title 回 ok:false 並標示欄位', () => {
    const r = validateArticleFrontmatter({ ...ok, title: undefined });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.path.includes('title'))).toBe(true);
  });
  it('category 非法值被擋', () => {
    const r = validateArticleFrontmatter({ ...ok, category: 'not-a-cat' });
    expect(r.ok).toBe(false);
  });
  it('CORE_FIELDS 含 category 且為 enum 型', () => {
    const cat = CORE_FIELDS.find((f) => f.key === 'category');
    expect(cat?.type).toBe('enum');
    expect(Array.isArray(cat?.options)).toBe(true);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test src/utils/editor/article-schema.test.ts 2>&1 | tail -10`
Expected: FAIL（模組不存在）。

- [ ] **Step 3: 實作 article-schema.ts**

Create `src/utils/editor/article-schema.ts`。`CATEGORY_SLUGS` 從 `src/config/categories.ts` import；schema 對齊 `content.config.ts` 的 articles（瀏覽器安全：只用 zod，不 import astro:content）：
```ts
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from '@/config/categories';

const referenceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  publisher: z.string().optional(),
  note: z.string().optional(),
});

// 對齊 src/content.config.ts 的 articles schema（瀏覽器版）
export const articleSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string(),
  excerpt: z.string().optional(),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: z.enum(CATEGORY_SLUGS),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().default('appi-editorial'),
  coAuthors: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  coverAlt: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('published'),
  featured: z.boolean().default(false),
  hero: z.boolean().default(false),
  sourceType: z.enum(['editorial', 'contributor', 'sponsored', 'press-release', 'ai-assisted']).default('editorial'),
  readingTime: z.number().optional(),
  disclaimerType: z.enum(['general', 'medical', 'financial', 'legal', 'sponsored']).default('general'),
  disclosure: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  expertNote: z.string().optional(),
  risksAndLimits: z.array(z.string()).default([]),
  references: z.array(referenceSchema).default([]),
  column: z.string().optional(),
  topics: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  legacyAuthor: z.string().optional(),
  legacyCategory: z.string().optional(),
});

export type ValidateResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: { path: string; message: string }[] };

export function validateArticleFrontmatter(fm: Record<string, unknown>): ValidateResult {
  const r = articleSchema.safeParse(fm);
  if (r.success) return { ok: true, data: r.data as Record<string, unknown> };
  return {
    ok: false,
    errors: r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
  };
}

export type CoreField =
  | { key: string; label: string; type: 'text' | 'textarea' | 'date'; maxLength?: number; required?: boolean }
  | { key: string; label: string; type: 'enum'; options: readonly string[]; required?: boolean }
  | { key: string; label: string; type: 'tags' | 'bool' };

// 給 widget 的核心欄位；其餘欄位走「進階 YAML」區
export const CORE_FIELDS: CoreField[] = [
  { key: 'title', label: '標題', type: 'text', required: true },
  { key: 'description', label: '描述（摘要）', type: 'textarea', maxLength: 160, required: true },
  { key: 'category', label: '分類', type: 'enum', options: CATEGORY_SLUGS, required: true },
  { key: 'author', label: '作者', type: 'text' },
  { key: 'tags', label: '標籤', type: 'tags' },
  { key: 'status', label: '狀態', type: 'enum', options: ['draft', 'published', 'scheduled', 'archived'] },
  { key: 'publishDate', label: '發佈日期', type: 'date', required: true },
  { key: 'featured', label: '精選', type: 'bool' },
  { key: 'hero', label: '首頁 Hero', type: 'bool' },
];

// 進階 YAML 區要排除的核心 key（其餘 frontmatter 都丟進 YAML 區）
export const CORE_KEYS = CORE_FIELDS.map((f) => f.key);
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test src/utils/editor/article-schema.test.ts 2>&1 | tail -10`
Expected: PASS（4 測試）。

- [ ] **Step 5: seo-schema.ts 退場/簡化**

appi.news 改用 CORE_FIELDS，`seo-schema.ts` 不再被表單使用。若 NewArticle 仍 import getSeoFields，保留一個回傳 `[]` 的相容 stub 或一併改 NewArticle。決策記在 Task 9。先把 `seo-schema.ts` 改為 re-export CORE_FIELDS 對應（避免死 import）。

- [ ] **Step 6: Commit**

```bash
git add src/utils/editor/article-schema.ts src/utils/editor/article-schema.test.ts src/utils/editor/seo-schema.ts
git commit -m "feat(editor): appi.news articles Zod 驗證 + 核心欄位描述"
```

---

## Task 7: 移植 BodyEditor + 重做 SeoFields（混合表單）

**Files:**
- Create: `src/components/editor/BodyEditor.svelte`（複製）
- Create: `public/vendor/toastui-editor.css`（複製）
- Create: `src/components/editor/SeoFields.svelte`（重寫為混合表單）
- Create: `src/components/editor/SeoFields.test.ts`（可選，Svelte 元件測試略，改由 playwright 冒煙）

- [ ] **Step 1: 複製 BodyEditor 與 vendor CSS**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
mkdir -p src/components/editor public/vendor
cp "$SRC"/src/components/editor/BodyEditor.svelte src/components/editor/
cp "$SRC"/public/vendor/toastui-editor.css public/vendor/
```
檢查 BodyEditor.svelte 內 `uploadImage` 來源 import 路徑（`@/utils/editor/image-upload`）在 appi.news 可解析；slug 來源沿用 props。

- [ ] **Step 2: 重寫 SeoFields.svelte（核心 widget + 進階 YAML）**

Create `src/components/editor/SeoFields.svelte`：
```svelte
<script>
  import yaml from 'js-yaml';
  import { CORE_FIELDS, CORE_KEYS } from '@/utils/editor/article-schema';

  // frontmatter：完整物件；onchange(next) 回傳完整物件
  let { frontmatter, authors = [], onchange } = $props();

  // 進階 YAML：非核心 key 的子物件，序列化成 YAML 字串供編輯
  function advObject(fm) {
    const o = {};
    for (const k of Object.keys(fm)) if (!CORE_KEYS.includes(k)) o[k] = fm[k];
    return o;
  }
  let advText = $state(yaml.dump(advObject(frontmatter), { lineWidth: -1, forceQuotes: false }));
  let advError = $state('');

  function setCore(key, value) {
    onchange({ ...frontmatter, [key]: value });
  }
  function onAdvInput(text) {
    advText = text;
    try {
      const adv = text.trim() ? yaml.load(text) : {};
      advError = '';
      // 合併：保留核心 key，覆寫非核心
      const core = {};
      for (const k of CORE_KEYS) if (k in frontmatter) core[k] = frontmatter[k];
      onchange({ ...core, ...(adv || {}) });
    } catch (e) {
      advError = 'YAML 格式錯誤：' + e.message;
    }
  }
  function tagsToText(v) { return Array.isArray(v) ? v.join(', ') : (v ?? ''); }
  function textToTags(t) { return t.split(',').map((s) => s.trim()).filter(Boolean); }
</script>

<div class="et-fields">
  {#each CORE_FIELDS as f}
    <label>
      <span>{f.label}{#if f.required}<em> *</em>{/if}</span>
      {#if f.type === 'textarea'}
        <textarea value={frontmatter[f.key] ?? ''} oninput={(e) => setCore(f.key, e.currentTarget.value)}></textarea>
        {#if f.maxLength}<small>{String(frontmatter[f.key] ?? '').length} / {f.maxLength}</small>{/if}
      {:else if f.type === 'enum'}
        <select value={frontmatter[f.key] ?? ''} onchange={(e) => setCore(f.key, e.currentTarget.value)}>
          <option value="" disabled>— 選擇 —</option>
          {#each f.options as opt}<option value={opt}>{opt}</option>{/each}
        </select>
      {:else if f.type === 'bool'}
        <input type="checkbox" checked={!!frontmatter[f.key]} onchange={(e) => setCore(f.key, e.currentTarget.checked)} />
      {:else if f.type === 'tags'}
        <input value={tagsToText(frontmatter[f.key])} oninput={(e) => setCore(f.key, textToTags(e.currentTarget.value))} placeholder="逗號分隔" />
      {:else if f.type === 'date'}
        <input type="date" value={String(frontmatter[f.key] ?? '').slice(0, 10)} oninput={(e) => setCore(f.key, e.currentTarget.value)} />
      {:else}
        <input value={frontmatter[f.key] ?? ''} oninput={(e) => setCore(f.key, e.currentTarget.value)} />
      {/if}
    </label>
  {/each}

  <details class="et-adv">
    <summary>進階欄位（YAML）</summary>
    <textarea class="et-adv-yaml" value={advText} oninput={(e) => onAdvInput(e.currentTarget.value)}></textarea>
    {#if advError}<small class="et-adv-err">{advError}</small>{/if}
  </details>
</div>

<style>
  .et-fields { display: flex; flex-direction: column; gap: 0.75rem; overflow: auto; }
  .et-fields label { display: flex; flex-direction: column; gap: 0.25rem; }
  .et-fields span { font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; color: var(--color-ink); }
  .et-fields em { color: var(--color-coral); font-style: normal; }
  .et-fields :is(input, textarea, select) {
    font-family: var(--font-ui); font-size: var(--text-body); color: var(--color-ink);
    background: white; border: 1px solid var(--color-fog); border-radius: var(--radius-sm); padding: 0.5rem 0.65rem;
  }
  .et-fields input[type="checkbox"] { width: auto; align-self: start; }
  .et-fields textarea { min-height: 4rem; resize: vertical; }
  .et-adv summary { cursor: pointer; font-family: var(--font-ui); font-size: var(--text-meta); font-weight: 600; }
  .et-adv-yaml { width: 100%; min-height: 8rem; font-family: ui-monospace, monospace; }
  .et-adv-err { color: var(--color-coral); }
</style>
```

- [ ] **Step 3: 型別/解析快速檢查**

Run: `pnpm astro check 2>&1 | tail -15`（若無 astro check 設定，改 `pnpm build` 末段確認 .svelte 編譯無誤——但此時 EditorPanel 尚未接，build 不引用也無妨，可跳到 Task 10 一起驗）。

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/BodyEditor.svelte src/components/editor/SeoFields.svelte public/vendor/toastui-editor.css
git commit -m "feat(editor): BodyEditor 移植 + SeoFields 改為全欄位混合表單"
```

---

## Task 8: 移植 EditorPanel（接 Zod 存檔 gate + 改 AI worker URL）

**Files:**
- Create: `src/components/editor/EditorPanel.svelte`（複製 + 改寫存檔驗證與 AI URL）

- [ ] **Step 1: 複製**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
cp "$SRC"/src/components/editor/EditorPanel.svelte src/components/editor/
```

- [ ] **Step 2: 改 AI worker URL 與 lint 呼叫**

- `const AI_WORKER = '...evidencetoday-ai-suggest...'` → 改成 appi.news AI worker URL（部署後填入；先放 `https://appi-news-ai-suggest.<account>.workers.dev` 佔位，Task 12 回填）。
- `AI_ENABLED`：先 `false`，Task 13 啟用。
- lint 呼叫沿用（已在 Task 5 移植）。

- [ ] **Step 3: 存檔前接 Zod 驗證 gate**

在 putFile 之前插入：把當前 frontmatter（SeoFields 的完整物件）以 `validateArticleFrontmatter` 驗證；失敗則設錯誤狀態、`return` 不存檔。範例（依 EditorPanel 既有變數名調整）：
```svelte
import { validateArticleFrontmatter } from '@/utils/editor/article-schema';
// ...存檔函式內、組 serialize 之前：
const v = validateArticleFrontmatter(frontmatter);
if (!v.ok) {
  saveError = '欄位驗證未過：' + v.errors.map((e) => `${e.path} ${e.message}`).join('；');
  return;
}
```
SeoFields 換掉原本只傳 collection 的用法，改傳 `frontmatter` 與 `onchange`（已在 Task 7 定義介面）。

- [ ] **Step 4: 確認 repoPath/副檔名**

EditorPanel 接收 `repoPath` prop（由 EditButton 傳入，見 Task 9），存檔 message 用 appi.news 文案（`content: 前台編輯 {slug}` / `前台新增 {slug}`）。確認讀寫路徑為 `.md`。

- [ ] **Step 5: Commit**

```bash
git add src/components/editor/EditorPanel.svelte
git commit -m "feat(editor): EditorPanel 移植 + 存檔前 Zod 驗證 gate"
```

---

## Task 9: 移植 AdminLogin / EditButton / NewArticle + admin 頁

**Files:**
- Create: `src/components/editor/{AdminLogin,EditButton,NewArticle}.svelte`
- Create: `src/pages/admin.astro`

- [ ] **Step 1: 複製三元件 + admin 頁**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
cp "$SRC"/src/components/editor/{AdminLogin.svelte,EditButton.svelte,NewArticle.svelte} src/components/editor/
cp "$SRC"/src/pages/admin.astro src/pages/admin.astro
```

- [ ] **Step 2: AdminLogin 改 WORKER URL、state key、base 感知回跳**

- `const WORKER = '...evidencetoday-github-oauth...'` → appi.news OAuth worker URL（Task 12 回填佔位）。
- `'et_oauth_state'` → `'appi_oauth_state'`（兩處）。
- 回跳清 fragment：`history.replaceState(null, '', location.pathname)` 維持（pathname 已含 `/appi.news/admin/` base，正確）。

- [ ] **Step 3: EditButton 確認 props**

EditButton 接 `repoPath / collection / slug`，無 evidencetoday 專屬硬編碼，原樣可用。

- [ ] **Step 4: admin.astro 改 collections 與 base 連結**

- `getCollection('myths', …)` 等不存在的 collection 移除，只留 `articles`（appi.news 也可加 columns/topics 快速連結，YAGNI 先只 articles）。
- 快速連結 href 用 appi.news 既有 base helper（`asset()` 或 `import.meta.env.BASE_URL`），確保指向 `/appi.news/articles/...`。
- NewArticle：collection 固定 `articles`，新增檔名 slug 由 pinyin slugify 產生，副檔名 `.md`。
- 若 NewArticle import `getSeoFields`，改用 CORE_FIELDS 或移除該依賴。

- [ ] **Step 5: Commit**

```bash
git add src/components/editor/AdminLogin.svelte src/components/editor/EditButton.svelte src/components/editor/NewArticle.svelte src/pages/admin.astro
git commit -m "feat(editor): AdminLogin/EditButton/NewArticle + /admin 頁（appi.news base 感知）"
```

---

## Task 10: 在文章詳細頁掛 EditButton

**Files:**
- Modify: appi.news 文章詳細頁（先確認路徑）

- [ ] **Step 1: 找文章詳細頁**

Run: `ls src/pages/articles/ 2>/dev/null; grep -rl "getCollection('articles'\|getStaticPaths" src/pages | head`
找出渲染單篇文章的 `.astro`（推測 `src/pages/articles/[...slug].astro` 或類似）。記下它的 entry 變數名與 slug 取得方式。

- [ ] **Step 2: 掛 EditButton**

在文章頁 import：
```astro
import EditButton from '@/components/editor/EditButton.svelte';
```
在 `<BaseLayout>` 內容尾端加（依該頁實際 entry 變數名；repoPath 必須是 repo 內 `.md` 路徑、不帶 site base）：
```astro
<EditButton client:idle repoPath={`src/content/articles/${entry.id}`} collection="articles" slug={slugForThisPage} />
```
注意：appi.news glob loader 的 `entry.id` 是否含副檔名需實查（Task 10 Step 1 一併確認）。若 `entry.id` 不含 `.md`，repoPath 改為 `` `src/content/articles/${entry.id}.md` ``。

- [ ] **Step 3: 驗證建置**

Run: `rm -rf .astro dist && pnpm build 2>&1 | tail -8`
Expected: build 成功，文章頁含 EditButton island（無 token 時不顯示，故不影響版面）。

- [ ] **Step 4: Commit**

```bash
git add <文章詳細頁路徑>
git commit -m "feat(editor): 文章頁掛載 EditButton"
```

---

## Task 11: 本機冒煙測試（注入 token，免 OAuth）

**Files:** 無（驗證用）

- [ ] **Step 1: 建置並啟動 preview**

```bash
rm -rf .astro dist && pnpm build && pnpm preview
```
記下 port（appi.news preview 會在 `/appi.news/` base）。

- [ ] **Step 2: playwright 驗 /admin**

載入 `http://localhost:<port>/appi.news/admin/`：
- 斷言：`用 GitHub 登入` 按鈕掛載、零 console error。

- [ ] **Step 3: playwright 驗編輯流程**

- 進一篇文章頁；`sessionStorage.setItem('appi_gh_token','fake')`；reload。
- 斷言：`.et-edit-fab` 浮出 → 點擊 → TOAST UI 載入、CORE_FIELDS widget 出現（category 是 `<select>`、tags 是輸入、featured/hero 是 checkbox）、進階 YAML `<details>` 存在。
- 注入壞 frontmatter（清空 title）按儲存 → 斷言出現 Zod 驗證錯誤訊息、未送出 PUT（假 token 本就不會成功，重點是被前置 gate 擋下）。

- [ ] **Step 4: 關閉 preview，記錄結果**

無 commit（純驗證）。若有 bug，回對應 Task 修正後再來。

---

## Task 12: github-oauth Worker

**Files:**
- Create: `workers/github-oauth/{src/index.ts,src/index.test.ts,wrangler.toml,README.md}`

- [ ] **Step 1: 複製 worker**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
mkdir -p workers/github-oauth/src
cp "$SRC"/workers/github-oauth/src/{index.ts,index.test.ts} workers/github-oauth/src/
cp "$SRC"/workers/github-oauth/{wrangler.toml,README.md} workers/github-oauth/
```

- [ ] **Step 2: 改 wrangler.toml**

- `name = "appi-news-github-oauth"`
- `GITHUB_CLIENT_ID`：Task 14 註冊 OAuth App 後回填（先留註解佔位）。
- `ALLOWED_ORIGIN = "https://yao-care.github.io"`
- `OAUTH_SCOPE = "public_repo"`

- [ ] **Step 3: 確認回跳網址含 base**

index.ts 的 `/callback` 成功後 redirect 目標：須為 `https://yao-care.github.io/appi.news/admin/#token=…&state=…`（含 `/appi.news/` base 與 trailing slash）。若 evidencetoday 寫死 `/admin`，改成讀 `ALLOWED_ORIGIN` + `/appi.news/admin/`，或新增 `ADMIN_PATH` var。

- [ ] **Step 4: 跑 worker 測試 + 改斷言**

Run: `pnpm test workers/github-oauth/ 2>&1 | tail -15`
Expected: 全綠（斷言內 origin/callback 改 appi.news 對應值）。

- [ ] **Step 5: Commit**

```bash
git add workers/github-oauth/
git commit -m "feat(worker): github-oauth（appi.news origin + base 回跳）"
```

---

## Task 13: ai-suggest Worker

**Files:**
- Create: `workers/ai-suggest/{src/index.ts,src/index.test.ts,src/prompt.ts,src/prompt.test.ts,wrangler.toml,README.md}`

- [ ] **Step 1: 複製**

```bash
SRC=/Users/lightman/weiqi.kids/evidencetoday.news
mkdir -p workers/ai-suggest/src
cp "$SRC"/workers/ai-suggest/src/{index.ts,index.test.ts,prompt.ts,prompt.test.ts} workers/ai-suggest/src/
cp "$SRC"/workers/ai-suggest/{wrangler.toml,README.md} workers/ai-suggest/
```

- [ ] **Step 2: 改 wrangler.toml**

- `name = "appi-news-ai-suggest"`
- `ALLOWED_ORIGIN = "https://yao-care.github.io"`
- `ANTHROPIC_MODEL`：用現行模型（依 claude-api 技能確認最新 id；evidencetoday 用 `claude-haiku-4-5-20251001`，沿用或升級）。
- `GITHUB_OWNER = "yao-care"`、`GITHUB_REPO = "appi.news"`（worker 驗 push 權限用）。

- [ ] **Step 3: 跑測試**

Run: `pnpm test workers/ai-suggest/ 2>&1 | tail -15`
Expected: 全綠（斷言改 appi.news）。

- [ ] **Step 4: Commit**

```bash
git add workers/ai-suggest/
git commit -m "feat(worker): ai-suggest（appi.news origin/repo + 現行模型）"
```

---

## Task 14: 外部基礎設施（人在迴路，使用者執行）

**Files:** 無程式（部署與帳號設定）；回填常數後 commit。

> 以下含帳號層級互動步驟，須使用者本人在終端用 `! npx wrangler …` 執行。

- [ ] **Step 1: 註冊 GitHub OAuth App**

使用者於 github.com/settings/developers → New OAuth App：
- Application name：`appi.news admin editor`
- Homepage URL：`https://yao-care.github.io/appi.news/`
- Authorization callback URL：`https://appi-news-github-oauth.<account>.workers.dev/callback`（先用預估 worker 網域；部署後若不同回來改）
- 取得 **Client ID** → 填入 `workers/github-oauth/wrangler.toml` 的 `GITHUB_CLIENT_ID`。
- 產生 **Client Secret** → 留待 Step 3。

- [ ] **Step 2: 部署 github-oauth worker**

```bash
cd workers/github-oauth && npx wrangler deploy
```
記下實際 workers.dev 網域 → 回填 `src/components/editor/AdminLogin.svelte` 的 `WORKER` 常數；若與 OAuth App callback 不符，回 Step 1 更新 callback URL。

- [ ] **Step 3: 設 OAuth secret**

```bash
cd workers/github-oauth && npx wrangler secret put GITHUB_CLIENT_SECRET
# 貼上 Step 1 的 Client Secret
```

- [ ] **Step 4: 部署 ai-suggest worker + secret**

```bash
cd workers/ai-suggest && npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY
# 貼上 Anthropic API key
```
記下網域 → 回填 `src/components/editor/EditorPanel.svelte` 的 `AI_WORKER`，並把 `AI_ENABLED` 設為 `true`。

- [ ] **Step 5: 回填常數並 commit**

```bash
git add src/components/editor/AdminLogin.svelte src/components/editor/EditorPanel.svelte workers/*/wrangler.toml
git commit -m "config(editor): 回填 worker 網域與 OAuth Client ID、啟用 AI"
```

---

## Task 15: 端到端驗證與上線

**Files:** 無

- [ ] **Step 1: 上線 gate**

```bash
rm -rf .astro dist && pnpm build && pnpm check:links 2>&1 | tail -10
```
Expected: build 成功、無壞連結。

- [ ] **Step 2: 全測試**

Run: `pnpm test 2>&1 | tail -15`
Expected: 全綠。

- [ ] **Step 3: 真實 OAuth 端到端（使用者）**

部署到 GitHub Pages 後（push feat 分支→合併或在預覽環境）：
- 開 `https://yao-care.github.io/appi.news/admin/` → 用 GitHub 登入 → 進文章 → 編輯一段 → 儲存 → 觀察 GitHub Actions 重建 → 重新整理確認內容更新。
- 測 AI 潤飾：選一段文字 → 潤飾 → 回填。
- 測新增文章工單：建立 → 確認 GitHub Issue 出現（label `article-draft`）。

- [ ] **Step 4: 合併分支**

依 superpowers:finishing-a-development-branch 決定 merge/PR。push 後務必 `git status` 確認非 ahead（appi.news HTTPS remote 教訓）。

- [ ] **Step 5: 更新 memory**

把「appi.news 已具備 /admin 編輯器、兩個 worker 網域、OAuth App、換正式網域要改的 3 處」寫進 `appi-news-project.md`。

---

## Self-Review（對照 spec）

- **§3 程式碼移植** → Task 2/4/5/7/8/9（元件+utils+lint）✓
- **§4.1 Svelte 整合** → Task 1 ✓
- **§4.2 換硬編碼值** → Task 2/4/8/9/12/13 ✓
- **§4.3 .md 副檔名** → Task 4 Step 3、Task 10 Step 2 ✓
- **§4.4 base 感知** → Task 9 Step 4、Task 10 Step 2、Task 12 Step 3 ✓
- **§4.5 全欄位混合表單 + Zod** → Task 6/7/8 ✓
- **§4.6 網域時點** → Task 12/13 用 GitHub Pages origin；Task 15 Step 5 記錄換網域 3 處 ✓
- **§4.7 lint 對應** → Task 5 ✓
- **§5 外部設施** → Task 14 ✓
- **§6 安全** → token key（Task 2）、ALLOWED_ORIGIN（Task 12/13）、state（Task 9）、noindex/sitemap（既有）✓
- **§7 驗證** → Task 11（冒煙）、Task 15（端到端 + build/check:links/test）✓
- **設計 token 落差**（spec 未明列，補強）→ Task 3 ✓

**Placeholder 掃描：** worker URL / Client ID 為「部署後回填」的真實佔位（Task 12-14 明確回填步驟），非計畫佔位。其餘步驟均含實際指令/程式碼。

**型別一致性：** `validateArticleFrontmatter`、`CORE_FIELDS`、`CORE_KEYS`、`articleSchema` 命名跨 Task 6/7/8 一致；SeoFields 介面 `{ frontmatter, onchange }` 跨 Task 7/8 一致。
