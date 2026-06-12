# 首頁 Hero 淡網絡 d3 特效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首頁 Hero（`.intro`）背景加入一張用 d3-force 驅動、清晰可見且持續流動的深藍節點網絡，含 2–3 個恆亮金色節點與滑鼠靠近的金色回饋，前景卡片與 CTA 維持原樣。

**Architecture:** 純邏輯（節點生成、密度漸層、透明度、金色內插、脈動）抽到可測試的 `src/utils/hero-network/core.ts`，以 vitest TDD。Canvas + d3-force 模擬與 rAF 渲染放在 `HeroNetwork.astro` 的 `<script>`，匯入 core，靠 dev server 實測驗收。`index.astro` 插入元件並調整層次。

**Tech Stack:** Astro 5、TypeScript、vitest（node 環境）、d3-force、d3-quadtree、d3-scale、d3-interpolate、d3-color、HTML Canvas 2D。

參考 spec：`docs/superpowers/specs/2026-06-12-hero-network-d3-design.md`

---

## 檔案結構

- 建立 `src/utils/hero-network/core.ts` — 純函式（無 DOM／d3-force）：`sampleX`、`makeNodes`、`pickGoldIndices`、`baseOpacity`、`linkOpacity`、`mixNavyGold`、`pulse`，含型別 `Node`。
- 建立 `src/utils/hero-network/core.test.ts` — 上述純函式的單元測試。
- 建立 `src/components/blocks/HeroNetwork.astro` — `<canvas>` + 樣式 + 執行層 `<script>`（d3-force/quadtree、rAF、滑鼠、IntersectionObserver、reduced-motion、resize）。
- 修改 `src/pages/index.astro` — 匯入並插入 `<HeroNetwork />`，`.intro` 設 `position:relative`、`.intro-inner` 設 `z-index:1`。
- 修改 `package.json`（透過 pnpm add）— 新增 d3 模組化依賴與型別。

---

## Task 1：安裝 d3 模組化依賴

**Files:**
- Modify: `package.json`、`pnpm-lock.yaml`（由 pnpm 產生）

- [ ] **Step 1: 安裝執行依賴與型別**

Run:
```bash
pnpm add d3-force d3-quadtree d3-scale d3-interpolate d3-color
pnpm add -D @types/d3-force @types/d3-quadtree @types/d3-scale @types/d3-interpolate @types/d3-color
```
Expected: `package.json` 出現上述套件，安裝無錯誤。

- [ ] **Step 2: 確認可被 import 解析**

Run:
```bash
node -e "require.resolve('d3-force'); require.resolve('d3-quadtree'); require.resolve('d3-scale'); require.resolve('d3-interpolate'); console.log('ok')"
```
Expected: 印出 `ok`。

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: 新增 hero 網絡所需 d3 模組依賴"
```

---

## Task 2：core — 幾何（sampleX、makeNodes、pickGoldIndices）

**Files:**
- Create: `src/utils/hero-network/core.ts`
- Test: `src/utils/hero-network/core.test.ts`

- [ ] **Step 1: 寫失敗測試**

`src/utils/hero-network/core.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { sampleX, makeNodes, pickGoldIndices } from './core';

function seqRng(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('sampleX', () => {
  it('bias=0.5 時 x = width * sqrt(u)', () => {
    expect(sampleX(1000, () => 0.25, 0.5)).toBeCloseTo(500);
  });
  it('分佈偏右：pow(u,0.5) >= u', () => {
    expect(sampleX(1000, () => 0.16, 0.5)).toBeCloseTo(400);
    expect(400).toBeGreaterThan(160);
  });
  it('u=0 落在最左', () => {
    expect(sampleX(800, () => 0, 0.5)).toBe(0);
  });
});

describe('pickGoldIndices', () => {
  it('依 rng 取出相異索引', () => {
    expect(pickGoldIndices(10, 3, seqRng([0.05, 0.55, 0.95]))).toEqual([0, 5, 9]);
  });
  it('碰撞時跳過重複', () => {
    expect(pickGoldIndices(10, 3, seqRng([0.05, 0.05, 0.55, 0.95]))).toHaveLength(3);
  });
  it('k 超過 total 時夾到 total', () => {
    expect(pickGoldIndices(3, 5, seqRng([0.0, 0.4, 0.7, 0.1, 0.9]))).toHaveLength(3);
  });
});

describe('makeNodes', () => {
  it('產出 count 個節點、家座標等於初始位置、金色數正確', () => {
    const rng = seqRng([
      0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, // 5 節點的 x,y
      0.0, 0.5, // gold 索引 → 0, 2
    ]);
    const nodes = makeNodes({ width: 100, height: 100, count: 5, goldCount: 2, rng, bias: 0.5 });
    expect(nodes).toHaveLength(5);
    expect(nodes[0].hx).toBe(nodes[0].x);
    expect(nodes[0].hy).toBe(nodes[0].y);
    expect(nodes.filter((n) => n.gold)).toHaveLength(2);
    expect(nodes[0].gold).toBe(true);
    expect(nodes[2].gold).toBe(true);
    expect(nodes[1].gold).toBe(false);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test src/utils/hero-network/core.test.ts`
Expected: FAIL，找不到 `./core` 模組或匯出。

- [ ] **Step 3: 實作最小程式碼**

`src/utils/hero-network/core.ts`：
```ts
/** 網絡節點。x/y 為目前位置，hx/hy 為「家」座標，gold 表示恆亮金色節點。 */
export interface Node {
  x: number;
  y: number;
  hx: number;
  hy: number;
  gold: boolean;
}

export interface MakeNodesOpts {
  width: number;
  height: number;
  count: number;
  goldCount: number;
  rng: () => number;
  bias?: number;
}

/** 取一個 x 座標，分佈由左到右遞增（bias<1 偏右）。rng 回傳 [0,1)。 */
export function sampleX(width: number, rng: () => number, bias = 0.5): number {
  return width * Math.pow(rng(), bias);
}

/** 從 0..total-1 取 k 個相異索引（k 超過 total 時夾到 total）。 */
export function pickGoldIndices(total: number, k: number, rng: () => number): number[] {
  const picked = new Set<number>();
  const n = Math.min(k, total);
  while (picked.size < n) {
    picked.add(Math.floor(rng() * total));
  }
  return [...picked];
}

/** 依密度漸層產生節點，並標記 goldCount 個恆亮金色節點。 */
export function makeNodes(opts: MakeNodesOpts): Node[] {
  const { width, height, count, goldCount, rng, bias = 0.5 } = opts;
  const nodes: Node[] = [];
  for (let i = 0; i < count; i++) {
    const x = sampleX(width, rng, bias);
    const y = rng() * height;
    nodes.push({ x, y, hx: x, hy: y, gold: false });
  }
  for (const i of pickGoldIndices(count, goldCount, rng)) {
    nodes[i].gold = true;
  }
  return nodes;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test src/utils/hero-network/core.test.ts`
Expected: PASS（sampleX / pickGoldIndices / makeNodes 全綠）。

- [ ] **Step 5: Commit**

```bash
git add src/utils/hero-network/core.ts src/utils/hero-network/core.test.ts
git commit -m "feat(hero-network): core 幾何函式 sampleX/makeNodes/pickGoldIndices"
```

---

## Task 3：core — 透明度（baseOpacity、linkOpacity）

**Files:**
- Modify: `src/utils/hero-network/core.ts`
- Test: `src/utils/hero-network/core.test.ts`

- [ ] **Step 1: 追加失敗測試**

在 `core.test.ts` 末尾追加：
```ts
import { baseOpacity, linkOpacity } from './core';

describe('baseOpacity', () => {
  it('x 由左到右線性內插 min→max', () => {
    expect(baseOpacity(0, 1000, 0.18, 0.5)).toBeCloseTo(0.18);
    expect(baseOpacity(1000, 1000, 0.18, 0.5)).toBeCloseTo(0.5);
    expect(baseOpacity(500, 1000, 0.18, 0.5)).toBeCloseTo(0.34);
  });
  it('超出範圍時夾住', () => {
    expect(baseOpacity(-50, 1000, 0.18, 0.5)).toBeCloseTo(0.18);
    expect(baseOpacity(2000, 1000, 0.18, 0.5)).toBeCloseTo(0.5);
  });
});

describe('linkOpacity', () => {
  it('距離越近越亮、達上限歸零', () => {
    expect(linkOpacity(0, 110, 0.4)).toBeCloseTo(0.4);
    expect(linkOpacity(55, 110, 0.4)).toBeCloseTo(0.2);
    expect(linkOpacity(110, 110, 0.4)).toBe(0);
    expect(linkOpacity(150, 110, 0.4)).toBe(0);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test src/utils/hero-network/core.test.ts`
Expected: FAIL，`baseOpacity` / `linkOpacity` 未匯出。

- [ ] **Step 3: 實作**

在 `core.ts` 頂部加入匯入，並追加兩個函式：
```ts
import { scaleLinear } from 'd3-scale';
```
```ts
/** 依 x 位置線性內插基準透明度（左 min、右 max），超出範圍夾住。 */
export function baseOpacity(x: number, width: number, min: number, max: number): number {
  return scaleLinear([0, width], [min, max]).clamp(true)(x);
}

/** 連線透明度：距離 0 時為 ceil，達 maxDist 以上為 0，線性衰減。 */
export function linkOpacity(dist: number, maxDist: number, ceil: number): number {
  if (dist >= maxDist) return 0;
  return ceil * (1 - dist / maxDist);
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test src/utils/hero-network/core.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/utils/hero-network/core.ts src/utils/hero-network/core.test.ts
git commit -m "feat(hero-network): core 透明度函式 baseOpacity/linkOpacity"
```

---

## Task 4：core — 金色內插與脈動（mixNavyGold、pulse）

**Files:**
- Modify: `src/utils/hero-network/core.ts`
- Test: `src/utils/hero-network/core.test.ts`

- [ ] **Step 1: 追加失敗測試**

在 `core.test.ts` 末尾追加：
```ts
import { mixNavyGold, pulse } from './core';

describe('mixNavyGold', () => {
  it('t=0 全藍、t=1 全金', () => {
    expect(mixNavyGold('#1f3a5f', '#a87515', 0)).toBe('rgb(31, 58, 95)');
    expect(mixNavyGold('#1f3a5f', '#a87515', 1)).toBe('rgb(168, 117, 21)');
  });
  it('t 超出 [0,1] 時夾住', () => {
    expect(mixNavyGold('#1f3a5f', '#a87515', 2)).toBe('rgb(168, 117, 21)');
    expect(mixNavyGold('#1f3a5f', '#a87515', -1)).toBe('rgb(31, 58, 95)');
  });
});

describe('pulse', () => {
  it('正弦脈動 0..amp', () => {
    expect(pulse(0, 1000)).toBeCloseTo(0.5);
    expect(pulse(250, 1000)).toBeCloseTo(1);
    expect(pulse(500, 1000)).toBeCloseTo(0.5);
    expect(pulse(750, 1000)).toBeCloseTo(0);
  });
  it('amp 縮放', () => {
    expect(pulse(250, 1000, 0.4)).toBeCloseTo(0.4);
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test src/utils/hero-network/core.test.ts`
Expected: FAIL，`mixNavyGold` / `pulse` 未匯出。

- [ ] **Step 3: 實作**

在 `core.ts` 加入匯入並追加函式：
```ts
import { interpolateRgb } from 'd3-interpolate';
```
```ts
/** 依 t∈[0,1] 在深藍與金色間內插，t=0 全藍、t=1 全金（超出範圍夾住）。 */
export function mixNavyGold(navy: string, gold: string, t: number): string {
  const tt = Math.max(0, Math.min(1, t));
  return interpolateRgb(navy, gold)(tt);
}

/** 0..amp 的正弦脈動，給金色節點呼吸用。 */
export function pulse(timeMs: number, periodMs: number, amp = 1): number {
  return amp * (0.5 + 0.5 * Math.sin((2 * Math.PI * timeMs) / periodMs));
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test src/utils/hero-network/core.test.ts`
Expected: PASS（core 全部測試綠）。

- [ ] **Step 5: Commit**

```bash
git add src/utils/hero-network/core.ts src/utils/hero-network/core.test.ts
git commit -m "feat(hero-network): core 金色內插 mixNavyGold 與脈動 pulse"
```

---

## Task 5：HeroNetwork.astro 元件（canvas + d3-force 執行層）

**Files:**
- Create: `src/components/blocks/HeroNetwork.astro`

說明：此層牽涉 canvas/DOM/d3-force，不做單元測試，於 Task 7 用 dev server 實測驗收。本任務只需建立檔案、確認可被 build 引入。

- [ ] **Step 1: 建立元件**

`src/components/blocks/HeroNetwork.astro`：
```astro
---
// HeroNetwork.astro — 首頁 Hero 淡網絡背景（d3-force 驅動）
// 純邏輯在 @/utils/hero-network/core；本檔負責 canvas、模擬、rAF、互動、降級。
---
<canvas class="hero-network" aria-hidden="true"></canvas>

<style>
  .hero-network {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  @media (max-width: 520px) {
    .hero-network {
      display: none;
    }
  }
</style>

<script>
  import { forceSimulation, forceX, forceY, forceManyBody } from 'd3-force';
  import { quadtree } from 'd3-quadtree';
  import {
    makeNodes,
    baseOpacity,
    linkOpacity,
    mixNavyGold,
    pulse,
  } from '@/utils/hero-network/core';

  const canvas = document.querySelector<HTMLCanvasElement>('canvas.hero-network');
  if (canvas) init(canvas);

  function init(canvas: HTMLCanvasElement) {
    const host = (canvas.closest('.intro') as HTMLElement | null) ?? canvas.parentElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !host) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const NAVY = rootStyle.getPropertyValue('--appi-brand').trim() || '#1f3a5f';
    const GOLD = rootStyle.getPropertyValue('--appi-accent').trim() || '#a87515';

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(max-width: 900px)').matches;

    const cfg = {
      count: mobile ? 30 : 60,
      goldCount: mobile ? 2 : 3,
      bias: 0.5,
      linkDist: 110,
      minOp: 0.18,
      maxOp: 0.5,
      linkCeil: 0.4,
      nodeR: 2,
      orbitMin: 6,
      orbitMax: 16,
      driftSp: 0.00018,
      pointerR: 120,
      pointerPull: 0.6,
      actHalfLife: 600,
    };

    let W = 0;
    let H = 0;
    let nodes: any[] = [];
    let sim: any = null;
    let raf = 0;
    let last = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    function size() {
      const r = host!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      nodes = makeNodes({
        width: W,
        height: H,
        count: cfg.count,
        goldCount: cfg.goldCount,
        rng: Math.random,
        bias: cfg.bias,
      });
      for (const n of nodes) {
        n.ox = n.hx;
        n.oy = n.hy;
        n.phase = Math.random() * Math.PI * 2;
        n.sp = 0.6 + Math.random() * 0.8;
        n.orbitR = cfg.orbitMin + Math.random() * (cfg.orbitMax - cfg.orbitMin);
        n.act = 0;
      }
      if (sim) sim.stop();
      sim = forceSimulation(nodes)
        .force('x', forceX((d: any) => d.hx).strength(0.05))
        .force('y', forceY((d: any) => d.hy).strength(0.05))
        .force('charge', forceManyBody().strength(-5).distanceMax(90))
        .alpha(0.4)
        .alphaTarget(0.04)
        .alphaDecay(0.02)
        .velocityDecay(0.5);
      sim.stop(); // 改由 rAF 手動 tick
    }

    function step(t: number) {
      const dt = last ? t - last : 16;
      last = t;
      for (const n of nodes) {
        n.hx = n.ox + Math.cos(t * cfg.driftSp * n.sp + n.phase) * n.orbitR;
        n.hy = n.oy + Math.sin(t * cfg.driftSp * n.sp + n.phase) * n.orbitR;
        n.act *= Math.pow(0.5, dt / cfg.actHalfLife);
      }
      if (pointer.active) {
        for (const n of nodes) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < cfg.pointerR) {
            const f = 1 - dist / cfg.pointerR;
            n.vx = (n.vx || 0) + (dx / (dist || 1)) * f * cfg.pointerPull;
            n.vy = (n.vy || 0) + (dy / (dist || 1)) * f * cfg.pointerPull;
            n.act = Math.max(n.act, f);
          }
        }
      }
      sim.tick();
      draw(t);
      raf = requestAnimationFrame(step);
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      const qt = quadtree(
        nodes,
        (d: any) => d.x,
        (d: any) => d.y,
      );
      ctx!.lineWidth = 1;
      for (const n of nodes) {
        qt.visit((node: any, x0: number, y0: number, x1: number, y1: number) => {
          if (!node.length) {
            do {
              const m = node.data;
              if (m.x > n.x || (m.x === n.x && m.y > n.y)) {
                const dist = Math.hypot(m.x - n.x, m.y - n.y);
                const lo = linkOpacity(dist, cfg.linkDist, cfg.linkCeil);
                if (lo > 0) {
                  const tcol = Math.max(n.act, m.act, n.gold ? 0.5 : 0, m.gold ? 0.5 : 0);
                  ctx!.globalAlpha = lo * baseOpacity(n.x, W, cfg.minOp, cfg.maxOp);
                  ctx!.strokeStyle = mixNavyGold(NAVY, GOLD, tcol);
                  ctx!.beginPath();
                  ctx!.moveTo(n.x, n.y);
                  ctx!.lineTo(m.x, m.y);
                  ctx!.stroke();
                }
              }
            } while ((node = node.next));
          }
          return (
            x0 > n.x + cfg.linkDist ||
            x1 < n.x - cfg.linkDist ||
            y0 > n.y + cfg.linkDist ||
            y1 < n.y - cfg.linkDist
          );
        });
      }
      for (const n of nodes) {
        const goldT = n.gold ? 0.65 + pulse(t, 2600, 0.35) : n.act;
        const op = Math.min(
          1,
          baseOpacity(n.x, W, cfg.minOp, cfg.maxOp) + n.act * 0.4 + (n.gold ? 0.25 : 0),
        );
        ctx!.globalAlpha = op;
        ctx!.fillStyle = mixNavyGold(NAVY, GOLD, goldT);
        const r = cfg.nodeR + (n.gold ? 0.8 : 0) + n.act * 1.2;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function staticFrame() {
      for (let i = 0; i < 60; i++) sim.tick();
      draw(0);
    }

    function start() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(step);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    size();
    build();

    if (reduce) {
      staticFrame();
    } else {
      if (!mobile) {
        host.addEventListener('pointermove', (e) => {
          const r = host!.getBoundingClientRect();
          pointer.x = e.clientX - r.left;
          pointer.y = e.clientY - r.top;
          pointer.active = true;
        });
        host.addEventListener('pointerleave', () => {
          pointer.active = false;
          pointer.x = -9999;
          pointer.y = -9999;
        });
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) (en.isIntersecting ? start() : stop());
        },
        { threshold: 0 },
      );
      io.observe(host);
    }

    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => {
        size();
        build();
        if (reduce) staticFrame();
      }, 200);
    });
  }
</script>
```

- [ ] **Step 2: 型別檢查通過**

Run: `pnpm astro check`
Expected: 無與 `HeroNetwork.astro` 相關的型別錯誤。

- [ ] **Step 3: Commit**

```bash
git add src/components/blocks/HeroNetwork.astro
git commit -m "feat(hero-network): canvas + d3-force 執行層元件"
```

---

## Task 6：整合進 index.astro

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 匯入元件**

在 `src/pages/index.astro` 既有 import 區（約第 5 行 `ArticleCard` 之後）加入：
```astro
import HeroNetwork from '@/components/blocks/HeroNetwork.astro';
```

- [ ] **Step 2: 插入元件為 `.intro` 首個子節點**

把 `.intro` 區塊開頭（現為 `<section class="intro">` 緊接 `<div class="container intro-inner">`）改為：
```astro
  <section class="intro">
    <HeroNetwork />
    <div class="container intro-inner">
```
（其餘內容不動。）

- [ ] **Step 3: 調整層次樣式**

在 `<style>` 區的 `.intro` 規則加入 `position: relative;`，並把 `.intro-inner` 規則加上層次。將：
```css
  .intro {
    background:
      radial-gradient(120% 150% at 88% 0%, var(--bg-tint) 0%, transparent 58%),
      linear-gradient(180deg, var(--bg-soft) 0%, var(--white) 100%);
    border-bottom: 1px solid var(--line-2);
  }
```
改為：
```css
  .intro {
    position: relative;
    background:
      radial-gradient(120% 150% at 88% 0%, var(--bg-tint) 0%, transparent 58%),
      linear-gradient(180deg, var(--bg-soft) 0%, var(--white) 100%);
    border-bottom: 1px solid var(--line-2);
  }
```
並在 `.intro-inner` 規則內（現有 `display: grid;` 等屬性中）加入：
```css
    position: relative;
    z-index: 1;
```

- [ ] **Step 4: 建置確認**

Run: `pnpm build`
Expected: build 成功，無錯誤。

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): Hero 嵌入 d3 淡網絡背景並調整層次"
```

---

## Task 7：dev server 實測驗收（對照 spec 驗收標準）

**Files:**（無新增，僅驗證；如需微調則回到 Task 5 cfg）

- [ ] **Step 1: 啟動 dev server**

Run: `pnpm dev`
開啟首頁，觀察 Hero 區。

- [ ] **Step 2: 逐項對照 spec 驗收標準**

確認：
1. 桌機靜止時可清楚看見持續流動的深藍網絡，左淡右密，並有 2–3 個恆亮金色節點（帶輕微脈動）。
2. 滑鼠滑過右側時，附近節點靠攏、連線與節點短暫泛金，移開順暢褪回。
3. 點擊「探索所有文章」「成為作者」兩顆 CTA 正常，不被 canvas 攔截。
4. DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`：無動畫、僅靜態單幀（仍含金色節點）。
5. 將 Hero 捲出畫面：rAF 停止（可於 Performance 或加暫時 console 確認 `stop()` 觸發）。
6. 縮到 ≤900px：節點變少、無滑鼠互動仍正常；≤520px：網絡隱藏，版面與可讀性不受影響。

若任一項不符，調整 `HeroNetwork.astro` 的 `cfg`（密度、透明度、orbit、pointer 參數）後重看。

- [ ] **Step 3: 最終全測與建置**

Run: `pnpm test && pnpm build`
Expected: 測試全綠、build 成功。

- [ ] **Step 4: Commit（若 Step 2 有微調）**

```bash
git add src/components/blocks/HeroNetwork.astro
git commit -m "polish(hero-network): 依實測微調網絡視覺參數"
```

---

## Self-Review 對照

- **Spec 覆蓋**：密度漸層→Task 2 `sampleX`/Task 6 整合；明顯可見透明度→Task 3 `baseOpacity`/cfg；恆亮金色+脈動→Task 2 gold flag/Task 4 `pulse`；滑鼠吸引+金色回饋→Task 5 pointer force/activation；d3-force/quadtree/scale/interpolate→Task 1/3/4/5；prefers-reduced-motion→Task 5 `staticFrame`；IntersectionObserver 暫停→Task 5；DPR/resize→Task 5；RWD 降級→Task 5 cfg + CSS；層次不擋 CTA→Task 5 `pointer-events:none`/Task 6 z-index；不替換卡片→未更動 `.intro-art`。全部有對應任務。
- **型別一致**：`Node`（x/y/hx/hy/gold）在 core 定義，glue 以同名屬性擴充 ox/oy/phase/sp/orbitR/act；函式名稱 `sampleX`/`makeNodes`/`pickGoldIndices`/`baseOpacity`/`linkOpacity`/`mixNavyGold`/`pulse` 在測試與 glue 引用一致。
- **無 placeholder**：各步含完整程式碼與指令。
