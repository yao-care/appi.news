import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';

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

/** 預建一條 x→透明度 的線性 scale（左 min、右 max、夾住），供每幀重複呼叫避免重建。 */
export function makeOpacityScale(width: number, min: number, max: number): (x: number) => number {
  return scaleLinear([0, width], [min, max]).clamp(true);
}

/** 預建一個 深藍↔金色 內插器，回傳 (t)=>rgb，t 自動夾在 [0,1]，供每幀重複呼叫避免重建。 */
export function makeColorMixer(navy: string, gold: string): (t: number) => string {
  const interp = interpolateRgb(navy, gold);
  return (t: number) => interp(Math.max(0, Math.min(1, t)));
}

/** 依 x 位置線性內插基準透明度（左 min、右 max），超出範圍夾住。 */
export function baseOpacity(x: number, width: number, min: number, max: number): number {
  return makeOpacityScale(width, min, max)(x);
}

/** 連線透明度：距離 0 時為 ceil，達 maxDist 以上為 0，線性衰減。 */
export function linkOpacity(dist: number, maxDist: number, ceil: number): number {
  if (dist >= maxDist) return 0;
  return ceil * (1 - dist / maxDist);
}

/** 依 t∈[0,1] 在深藍與金色間內插，t=0 全藍、t=1 全金（超出範圍夾住）。 */
export function mixNavyGold(navy: string, gold: string, t: number): string {
  return makeColorMixer(navy, gold)(t);
}

/** 0..amp 的正弦脈動，給金色節點呼吸用。 */
export function pulse(timeMs: number, periodMs: number, amp = 1): number {
  return amp * (0.5 + 0.5 * Math.sin((2 * Math.PI * timeMs) / periodMs));
}
