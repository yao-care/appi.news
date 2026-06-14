# APPI Newsroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 `/newsroom` 這個 Claude Code 專案 skill，讓使用者一個 session 內以引導式問答批量產出科技類文章（含每段配圖、超連結查證、固定人格與跨文記憶），手動批次排程後由既有部署自動上線。

**Architecture:** 純 Claude Code skill（執行期由 Claude 照 `SKILL.md` 操作，吃既有 Claude 訂閱），加上少量輔助程式：一支生圖共用模組與 CLI（OpenAI gpt-image → webp）。文章與配圖直接寫入既有 content collection 與 `public/images/`，沿用既有 `rehypeBaseImages` 渲染與 `isPublic()` 排程過濾，不改 schema、不改渲染、不新增 GitHub Actions。

**Tech Stack:** Astro 5（static）、pnpm、vitest、sharp、OpenAI Images API（gpt-image-2）、既有 `src/utils/content.ts` 排程過濾、`astro.config.mjs` 的 `rehypeBaseImages`。

**設計依據（已驗證的現況）：**
- 文章頁 `src/pages/articles/[slug].astro` 用 `render(article)` → `<Content />`。
- 內文圖：作者直接寫 `<img src="/images/xxx.webp">`，`astro.config.mjs` 的 `rehypeBaseImages()` 自動補 `/appi.news` base + `loading="lazy"` + `decoding="async"`；不自動加 width/height。
- 排程過濾：`src/utils/content.ts` 的 `isPublic()`：`draft:true`、`status` 為 `draft`/`archived` 一律隱藏；其餘需 `publishDate <= Date.now()`。scheduled + 未來日期會被擋，部署 cron（`deploy.yml` 每 6h）重建後到時自動上線。
- 生圖範本：`scripts/regen-covers.mjs`（OpenAI gpt-image-2、size 1536x1024、b64_json、sharp resize+webp、PEOPLE 鐵律、金鑰讀 `~/.config/appi-news/ai-worker.secrets`）。
- 既有 scripts：`pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm check:links` / `pnpm test`（vitest）。

**規則來源：** 完整需求見 spec `docs/superpowers/specs/2026-06-13-appi-newsroom-design.md`（引導式問答、複選雷達、每段必配圖且人物=台灣人、繁中台灣用語、去 AI 腔、超連結逐條查證、本地預覽、批次排程、人格與記憶層）。

---

## File Structure

**新增程式：**
- `scripts/lib/ai-image.mjs` — 生圖共用模組：`buildImagePrompt`（純函式，永遠附台灣人物鐵律與無文字風格）、`toWebp`（純函式，resize→webp，回傳含尺寸）、`imgTag`（純函式，產 CLS 安全的 `<img>`）、`readOpenAIKey`、`generateImage`（整合：呼叫 OpenAI → webp）。
- `scripts/lib/ai-image.test.mjs` — 上述純函式的 vitest 測試。
- `scripts/gen-image.mjs` — CLI：skill 每段呼叫一次，產圖存 `public/images/`，印出 JSON（含可直接貼用的 `<img>` tag 與尺寸）。

**新增 skill 資產（皆 repo 版控）：**
- `.claude/skills/newsroom/SKILL.md` — 主程序（雷達 / 問答 / 起草 / 查證 / 配圖 / 文風 / 排程 / 記憶）。
- `.claude/skills/newsroom/persona.md` — 作者 CΛ 聲音檔（由既有 6 篇萃取、本人定版）。
- `.claude/skills/newsroom/author-memory.json` — 立場索引（只記 `author: lightman`）。

**不修改：** `src/content.config.ts`、`astro.config.mjs`、`src/pages/articles/[slug].astro`、`deploy.yml`（皆沿用）。

---

## Phase 1：生圖程式（TDD）

### Task 1: 生圖共用模組純函式 + 測試

**Files:**
- Create: `scripts/lib/ai-image.mjs`
- Test: `scripts/lib/ai-image.test.mjs`

- [ ] **Step 1: 先寫失敗測試**

`scripts/lib/ai-image.test.mjs`：
```js
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { buildImagePrompt, toWebp, imgTag, PEOPLE_DIRECTIVE } from './ai-image.mjs';

describe('buildImagePrompt', () => {
  it('永遠附加台灣人物鐵律與無文字風格', () => {
    const p = buildImagePrompt({ topic: 'AI 在醫院的應用' });
    expect(p).toContain(PEOPLE_DIRECTIVE);
    expect(p).toContain('AI 在醫院的應用');
    expect(p.toLowerCase()).toContain('no text');
  });
  it('缺 topic 時丟錯', () => {
    expect(() => buildImagePrompt({ topic: '' })).toThrow();
  });
  it('有 context 時帶入', () => {
    const p = buildImagePrompt({ topic: 'X', context: '醫師信任議題' });
    expect(p).toContain('醫師信任議題');
  });
});

describe('toWebp', () => {
  it('縮到目標寬度並輸出 webp，回傳尺寸', async () => {
    const png = await sharp({
      create: { width: 1536, height: 1024, channels: 3, background: '#888888' },
    }).png().toBuffer();
    const { buffer, width, height } = await toWebp(png, 960);
    expect(width).toBe(960);
    expect(height).toBe(640); // 1536x1024 為 3:2，縮到寬 960 → 高 640
    expect(buffer.slice(8, 12).toString('ascii')).toBe('WEBP'); // webp magic
  });
  it('原圖較小時不放大', async () => {
    const png = await sharp({
      create: { width: 400, height: 300, channels: 3, background: '#123456' },
    }).png().toBuffer();
    const { width } = await toWebp(png, 960);
    expect(width).toBe(400);
  });
});

describe('imgTag', () => {
  it('含 width/height/lazy/decoding（CLS 安全）', () => {
    const t = imgTag({ src: '/images/x.webp', width: 960, height: 640, alt: '帶"引號"的描述' });
    expect(t).toContain('src="/images/x.webp"');
    expect(t).toContain('width="960"');
    expect(t).toContain('height="640"');
    expect(t).toContain('loading="lazy"');
    expect(t).toContain('decoding="async"');
    expect(t).toContain('&quot;'); // alt 內引號需逸出
  });
  it('缺 src 丟錯', () => {
    expect(() => imgTag({ width: 1, height: 1, alt: '' })).toThrow();
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test ai-image`
Expected: FAIL（找不到 `./ai-image.mjs` 模組）。
若 vitest 未掃到 `scripts/**`，檢查 `vitest.config.*` 的 `test.include`；需要時補上 `'scripts/**/*.test.mjs'`，再重跑直到「測試有被執行且為紅」。

- [ ] **Step 3: 寫最小實作**

`scripts/lib/ai-image.mjs`：
```js
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// 沿用 worker / regen-covers 的台灣人物鐵律
export const PEOPLE_DIRECTIVE =
  'If any people appear, they must be Taiwanese (East Asian, natural Han Taiwanese appearance). Do not depict people of other ethnicities.';

const STYLE =
  'Minimalist editorial illustration. Refined and sophisticated, calm muted tones, soft natural lighting, a subtle navy-and-warm-neutral palette, professional magazine aesthetic, plenty of negative space. No text, no words, no letters, no logos, no captions.';

// 純函式：組生圖 prompt，永遠附風格與台灣人物鐵律
export function buildImagePrompt({ topic, context = '' }) {
  if (!topic || !String(topic).trim()) throw new Error('topic is required');
  const ctx = String(context).trim() ? ` Context: ${String(context).trim()}.` : '';
  return `${STYLE} Subject: ${String(topic).trim()}.${ctx} ${PEOPLE_DIRECTIVE}`;
}

// 純函式：任意圖片 buffer → 指定寬度 webp，回傳 {buffer,width,height}
export async function toWebp(inputBuffer, width = 960, quality = 72) {
  const buffer = await sharp(inputBuffer)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width, height: meta.height };
}

// 純函式：CLS 安全的 <img>（width/height + lazy + decoding）
export function imgTag({ src, width, height, alt = '' }) {
  if (!src) throw new Error('src is required');
  const safeAlt = String(alt).replace(/"/g, '&quot;');
  return `<img src="${src}" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${safeAlt}">`;
}

export function readOpenAIKey() {
  const path = join(homedir(), '.config/appi-news/ai-worker.secrets');
  const m = readFileSync(path, 'utf8').match(/^OPENAI_API_KEY=(.+)$/m);
  if (!m) throw new Error(`OPENAI_API_KEY not found in ${path}`);
  return m[1].trim();
}

// 整合（不單元測試）：OpenAI 生圖 → webp
export async function generateImage({
  topic,
  context = '',
  width = 960,
  model = 'gpt-image-2',
  size = '1536x1024',
  quality = 'low', // 段落圖多，用 low 控成本（spec §4.4）
}) {
  const key = readOpenAIKey();
  const prompt = buildImagePrompt({ topic, context });
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, prompt, size, quality, n: 1 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const b64 = (await res.json()).data?.[0]?.b64_json;
  if (!b64) throw new Error('no image returned');
  return toWebp(Buffer.from(b64, 'base64'), width);
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test ai-image`
Expected: PASS（8 個測試全綠）。

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/ai-image.mjs scripts/lib/ai-image.test.mjs
git commit -m "feat(newsroom): 生圖共用模組（prompt/webp/img-tag）+ 測試"
```

---

### Task 2: 生圖 CLI

**Files:**
- Create: `scripts/gen-image.mjs`

- [ ] **Step 1: 寫 CLI**

`scripts/gen-image.mjs`：
```js
// 用法:
//   node scripts/gen-image.mjs --topic "段落主題" --context "可選脈絡" \
//        --out public/images/post-282-s2.webp [--width 960]
// 輸出: 一行 JSON，含可直接貼進文章的 <img> tag 與尺寸。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateImage, imgTag } from './lib/ai-image.mjs';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

const topic = arg('topic');
const context = arg('context', '');
const out = arg('out');
const width = Number(arg('width', '960'));

if (!topic || !out) {
  console.error('need --topic and --out');
  process.exit(1);
}

const { buffer, width: w, height: h } = await generateImage({ topic, context, width });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buffer);

// src 用站內 root-relative；base(/appi.news) 由 rehypeBaseImages 於 build 期自動補
const src = '/' + out.replace(/^public\//, '');
console.log(JSON.stringify({
  file: out,
  src,
  width: w,
  height: h,
  tag: imgTag({ src, width: w, height: h, alt: '' }),
}));
```

- [ ] **Step 2: 真實生圖整合測試（需 OpenAI 金鑰）**

Run:
```bash
node scripts/gen-image.mjs --topic "醫師審閱長篇病歷的場景" --out public/images/_smoke-test.webp
```
Expected: 印出一行 JSON，`width` 約 960、`height` 約 640、`file` 存在；`public/images/_smoke-test.webp` 為有效 webp（可用 `file public/images/_smoke-test.webp` 確認為 RIFF/WEBP）。

- [ ] **Step 3: 清掉測試圖**

Run: `rm public/images/_smoke-test.webp`

- [ ] **Step 4: Commit**

```bash
git add scripts/gen-image.mjs
git commit -m "feat(newsroom): 段落生圖 CLI（gen-image.mjs）"
```

---

## Phase 2：人格、記憶、SKILL.md（撰寫）

### Task 3: 作者人格檔 persona.md（萃取 + 本人定版）

**Files:**
- Create: `.claude/skills/newsroom/persona.md`
- Read: `src/content/articles/wp-278.md`、`wp-280.md`、`wp-282.md`、`wp-582.md`、`wp-580.md`、`wp-595.md`（author: lightman 的 6 篇）

- [ ] **Step 1: 讀 6 篇，萃取聲音特徵**

逐篇讀完，整理出：常用思考框架（如「解對題 vs 解錯題」「可信度靠流程不是模型」）、立場與態度、慣用比喻、句法習慣、關注領域（醫療 AI 合規、工程落地）。

- [ ] **Step 2: 寫 persona.md（固定結構）**

`.claude/skills/newsroom/persona.md`，必含以下章節（內容由 Step 1 萃取，不可留空）：
```markdown
# CΛ / Lightman 作者人格

## 身分與關注
（背景、專長、長期關注的題目）

## 招牌思考框架
（從既有文章歸納，每條附一句說明 + 出處 slug）

## 語氣與態度
（有立場、會批評、不四平八穩；具體描述他怎麼下判斷）

## 慣用語感
（句法、比喻、口頭禪；台灣口語）

## Do
（要保留的特色）

## Don't
（要避免的：見 SKILL.md 去 AI 腔守則，這裡放他個人特別忌諱的）
```

- [ ] **Step 3: 本人審閱（檢查點，必須等使用者回覆）**

把 persona.md 給使用者過目：「這份人格檔像你嗎？要改哪裡？」依回饋修到他點頭。**未獲同意不得進入下一步。**

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/newsroom/persona.md
git commit -m "feat(newsroom): 作者人格檔 persona.md（本人定版）"
```

---

### Task 4: 作者記憶索引 author-memory.json

**Files:**
- Create: `.claude/skills/newsroom/author-memory.json`
- Read: 同 Task 3 的 6 篇

- [ ] **Step 1: 由 6 篇建立索引**

每篇萃取一筆，寫成陣列。固定 schema（每筆）：
```json
{
  "slug": "post-282",
  "title": "我愛上一個不可能的可能…",
  "publishDate": "2026-04-25",
  "category": "tech",
  "tags": ["LLM醫療應用", "..."],
  "conclusion": "問題沒定義清楚，方法選擇就會錯（解對題 vs 解錯題）",
  "claims": ["LLM 醫療問題分三類…", "FHIR 標準存在不等於落地完成"],
  "predictions": []
}
```
輸出 `.claude/skills/newsroom/author-memory.json` 為上述物件的陣列（6 筆）。

- [ ] **Step 2: 驗證 JSON 合法**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude/skills/newsroom/author-memory.json','utf8')); console.log('ok')"`
Expected: 印出 `ok`。

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/newsroom/author-memory.json
git commit -m "feat(newsroom): 作者記憶索引（由既有 6 篇建立）"
```

---

### Task 5: 主程序 SKILL.md

**Files:**
- Create: `.claude/skills/newsroom/SKILL.md`

- [ ] **Step 1: 寫 SKILL.md（完整內容如下）**

`.claude/skills/newsroom/SKILL.md`：
```markdown
---
name: newsroom
description: APPI News 科技類日更引擎。輸入 /newsroom 後找議題，以一問一答引導使用者把文章寫完並排程。涵蓋議題雷達、複選、逐題問答、起草（每段配圖、超連結逐條查證）、繁中台灣用語、去 AI 腔、固定人格與跨文記憶、本地預覽、批次排程。
---

# Newsroom

你是 APPI News 作者 CΛ / Lightman 的編輯部引擎。被呼叫時，依下列步驟跑完一個批次寫作 session。全程繁體中文 + 台灣用語。

## 先載入

- 讀 `.claude/skills/newsroom/persona.md`（聲音）。
- 讀 `.claude/skills/newsroom/author-memory.json`（過往立場）。

## 步驟一：議題雷達

用 WebSearch / WebFetch 掃這些來源，產出**至少 3 題**候選（不設上限）：
1. Anthropic / OpenAI / Google 官方 blog（模型發布、重大公告）
2. arXiv cs.AI / cs.CL 近期熱門
3. Hacker News 高分科技話題
4. 本業交叉題：醫療 AI、健康法規、合規

每題評分 `熱度 × APPI/tech 相關 × 差異化角度可得性`（各 1-10 相乘），列出：議題、為何相關、建議寫作方向、候選結論、分數（熱度另記，供步驟四排程）。
請使用者**複選**想寫的幾題（如「1、3、5」）。

## 步驟二：逐題問答（每個選定題各一輪）

用 AskUserQuestion，**一次只問一題、可選時用多選題**。問序：
1. 核心結論（採候選結論或改寫）
2. 切角 / 想強調的面向
3. 真人觀點 / 本業經驗（差異化來源）
4. 篇幅與讀者（深度 3000+ 字 / 短稿 800-1500 字）
5. 指定必引來源（可選）

依 author-memory 提醒：若此題與舊文相關，問「先前在某文立場是 A，延續還是修正？」

## 步驟三：逐題起草與產出

1. 查料：用 WebSearch / WebFetch 找真實來源。
2. 擴寫：依 persona 定調聲音、繞著結論建論證；比對 author-memory 不與舊文矛盾，適度自引（站內連結指回舊文）。
   - **資料必附 inline 來源超連結**：凡數據/事實/研究/引述，當下就掛連結到原始出處，不堆文末。附不出可驗證來源的資料不准寫。
3. **超連結查證迴路**：對全文每一條超連結（inline + references），用 WebFetch 逐條確認「連得上（2xx）且內容真的支持那句」。失效/連不上/對不上 → 換真實來源；找不到佐證 → 改寫或刪該論點。迴圈到全綠。不留死連結。
4. **每段必配圖**：每個段落呼叫一次
   `node scripts/gen-image.mjs --topic "<該段重點>" --context "<文章脈絡>" --out public/images/<slug>-s<N>.webp`
   取回 JSON 的 `tag`，補上中文 alt 後，把 `<img>` 貼在該段之後。人物鐵律（台灣人）已由模組強制，無須自行加。
5. 封面圖：同法生一張，存 `public/covers/<slug>.webp`，frontmatter 填 `coverImage: "covers/<slug>.webp"` + `coverAlt`。
6. frontmatter：`title / description / category / subcategory / tags / highlights / references / author: "lightman" / sourceType: "ai-assisted" / disclaimerType`。先設 `status: "draft"`（排程待步驟四）。
7. **去 AI 腔文風複查**（產檔前必過，違反即改）：
   - 禁破折號（— / ── / --），改句號、逗號、冒號或拆句。
   - 禁 AI 套語：「不僅…更…」「不只是…而是…」「從 A 到 B 到 C」排比、「值得注意的是」「事實上」「總而言之」「歸根結底」、自問自答「那麼…呢？」。
   - 禁 AI 語氣：過度正向、四平八穩無立場、空泛升華、結尾硬拔高、翻譯腔。
   - 禁 buzzword：賦能、解鎖、釋放潛力、顆粒度、閉環。
   - 正面：有立場、具體例子數字、句長有變化、台灣口語語感。
8. 繁中台灣用語複查：用台灣詞（軟體/程式/網路/演算法/人工智慧/影片/數位/介面/預設），禁中國詞（軟件/程序/網絡/算法/人工智能/視頻/數字/接口/默認）。標題、正文、frontmatter 皆檢查。
9. 產檔：寫入 `src/content/articles/<slug>.md`。把本篇 {slug,title,publishDate,category,tags,conclusion,claims} 追加進 `author-memory.json`。
10. 本地預覽：確保 `pnpm dev` 在跑（沒跑就起一個），給使用者該文渲染後的 URL（`http://localhost:4321/appi.news/<category>/<slug>`），請他閱讀；要改就改，於同一 session 即時反映。

對每個選定題重複步驟二、三，全部完成後進步驟四。

## 步驟四：批次排程確認

- 依各篇**熱度分數**推薦 `publishDate`：愈熱門/愈具時效排愈前，其餘一天一篇往後錯開（維持日更）。
- 列出整批排程表（檔名 / 標題 / 建議日期 / 熱度）給使用者**確認或調整**。
- 確認後，逐篇套用 `publishDate` + `status: "scheduled"`（要立刻上線的設 `published` + 現在時間）。
- 跑 `pnpm check:links` 確認站內連結全綠。
- 一次 `git add -A && git commit && git push`。提醒：scheduled 文章由部署 cron 到時自動現身。

## 硬規則總結
- 全文繁中 + 台灣用語；去 AI 腔；每段必配圖且人物=台灣人。
- 所有資料附 inline 來源超連結；全文超連結逐條查證可連線，不留死連結。
- 結論是使用者給的，不得稀釋成中性；保持 CΛ 的人格與跨文一致。
```

- [ ] **Step 2: 確認 skill 被辨識**

在 Claude Code 確認 `/newsroom` 出現在可用 skill 清單（專案 `.claude/skills/` 會自動掃描；必要時重開 session）。
Expected: 鍵入 `/newsroom` 能觸發。

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/newsroom/SKILL.md
git commit -m "feat(newsroom): 主程序 SKILL.md（雷達/問答/起草/查證/配圖/文風/排程/記憶）"
```

---

## Phase 3：端到端試跑與驗收

### Task 6: 一題走完整流程 + 效能/連結驗收

**Files:**
- Test target: 新產出的一篇 `src/content/articles/<slug>.md` 與其段落圖

- [ ] **Step 1: 跑 `/newsroom` 走一題**

實際跑一輪：雷達 → 選一題 → 問答 → 起草（含每段配圖、超連結查證）→ 產檔 `status: draft` → 預覽。

- [ ] **Step 2: 驗證產出內容**

確認該 `.md`：
- 每段後都有一個 `<img ... width="..." height="..." loading="lazy">`（width/height 齊全 = CLS 安全）。
- 內文每個事實都有 inline 來源連結；references 齊全。
- 無破折號、無 AI 套語、無中國用語。
- frontmatter 欄位齊。
- `author-memory.json` 新增了這一筆。

- [ ] **Step 3: 連結查證抽驗**

對該文 3 條外部連結各 `curl -sI -o /dev/null -w "%{http_code}\n" <url>`，Expected: 皆 2xx/3xx，無 404/連不上。

- [ ] **Step 4: build 與站內連結 gate**

Run: `pnpm build && pnpm check:links`
Expected: build 成功、check:links 全綠（無壞站內連結）。

- [ ] **Step 5: 本地預覽目視 CLS**

Run: `pnpm preview`（或既有 `pnpm dev`），開該文，捲動時段落圖載入**不應造成版位跳動**（因 `<img>` 有 width/height）。

- [ ] **Step 6: 設排程 + Commit**

把該文設 `status: "scheduled"` + 合理未來 `publishDate`（或先 `draft` 留著測試）。
```bash
git add -A
git commit -m "test(newsroom): 端到端試跑一篇（含段落圖、查證、排程）"
```

- [ ] **Step 7: 線上效能複測（部署後）**

push 到 main 觸發部署後，依 `PERFORMANCE.md` 用第三方 PSI 量測**該內頁**的 LCP / CLS（不是首頁，因為段落多圖影響的是內頁）。Expected: CLS 維持 0；若 LCP 退步，調整段落圖 webp 寬度（目前 960）或品質。把內頁紅線記錄下來。

---

## Self-Review（撰寫者自檢）

- **Spec 覆蓋**：引導式問答（Task 5 步驟二）、複選雷達（步驟一）、每段必配圖+台灣人物（Task 1/2 + SKILL 步驟三.4）、繁中台灣用語與去 AI 腔（SKILL 步驟三.7/8）、超連結逐條查證（步驟三.3）、本地預覽（步驟三.10）、批次排程（步驟四）、人格與記憶（Task 3/4 + 載入/更新）、純 Claude Code 無 GitHub Actions（架構）。皆有對應任務。
- **無 placeholder**：程式步驟均附完整程式碼與預期輸出；persona/memory 為萃取任務但有固定 schema 與審閱檢查點。
- **型別一致**：`buildImagePrompt` / `toWebp` / `imgTag` / `generateImage` 簽章在 Task 1 定義，Task 2 與 SKILL.md 一致使用；段落圖檔名慣例 `public/images/<slug>-s<N>.webp` 一致。
- **效能風險**：每段配圖對內頁的影響在 Task 6 Step 5/7 驗收；CLS 由 `<img>` width/height 保證。
```
