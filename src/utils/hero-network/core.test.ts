import { describe, it, expect } from 'vitest';
import {
  sampleX,
  makeNodes,
  pickGoldIndices,
  baseOpacity,
  makeOpacityScale,
  makeColorMixer,
  linkOpacity,
  mixNavyGold,
  pulse,
} from './core';

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

describe('makeOpacityScale', () => {
  it('回傳可重複呼叫的 scale，結果與 baseOpacity 一致', () => {
    const s = makeOpacityScale(1000, 0.18, 0.5);
    expect(s(0)).toBeCloseTo(0.18);
    expect(s(1000)).toBeCloseTo(0.5);
    expect(s(500)).toBeCloseTo(0.34);
    expect(s(-50)).toBeCloseTo(0.18); // 夾住
    expect(s(2000)).toBeCloseTo(0.5); // 夾住
  });
});

describe('makeColorMixer', () => {
  it('回傳可重複呼叫的內插器，結果與 mixNavyGold 一致', () => {
    const mix = makeColorMixer('#1f3a5f', '#a87515');
    expect(mix(0)).toBe('rgb(31, 58, 95)');
    expect(mix(1)).toBe('rgb(168, 117, 21)');
    expect(mix(2)).toBe('rgb(168, 117, 21)'); // 夾住
    expect(mix(-1)).toBe('rgb(31, 58, 95)'); // 夾住
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
