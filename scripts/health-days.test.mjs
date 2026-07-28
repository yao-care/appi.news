// 協調器的跨年撞圖檢查。刻意獨立成檔：年曆/prompt 的純邏輯測試在 lib/health-days.test.mjs，
// 這支測的是「有沒有真的接上」——曾經定義了卻忘記呼叫，變成死程式碼。
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, copyFileSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { priorYearCoverClash } from './health-days.mjs';
import { HEALTH_DAYS } from './lib/health-days.mjs';

const COVERS = 'public/covers';
const entry = HEALTH_DAYS.find((d) => d.slug === 'world-breastfeeding-week');
// 用產線真的產出過的封面當素材；不在就用一張現成封面替代。
const SEED = existsSync(join(COVERS, 'world-breastfeeding-week-2026-cover.webp'))
  ? join(COVERS, 'world-breastfeeding-week-2026-cover.webp')
  : null;

const made = [];
function put(name, from) {
  const p = join(COVERS, name);
  mkdirSync(COVERS, { recursive: true });
  copyFileSync(from, p);
  made.push(p);
  return p;
}

describe.runIf(SEED)('priorYearCoverClash', () => {
  afterAll(() => { for (const p of made) rmSync(p, { force: true }); });

  it('同一張圖出現在往年封面時要抓到', async () => {
    put('world-breastfeeding-week-2031-cover.webp', SEED);
    put('world-breastfeeding-week-2030-cover.webp', SEED);
    expect(await priorYearCoverClash(entry, 2031)).toBe('world-breastfeeding-week-2030-cover.webp');
  });

  it('往年沒有封面就回空字串（第一年的情況）', async () => {
    put('world-breastfeeding-week-2041-cover.webp', SEED);
    expect(await priorYearCoverClash(entry, 2041)).toBe('');
  });

  it('今年還沒有封面就回空字串，不要炸開', async () => {
    expect(await priorYearCoverClash(entry, 2051)).toBe('');
  });

  it('往年封面是不同畫面時不誤報', async () => {
    put('world-breastfeeding-week-2061-cover.webp', SEED);
    // 造一張明顯不同的圖（純色）當去年的封面
    const different = join(COVERS, 'world-breastfeeding-week-2060-cover.webp');
    const sharp = (await import('sharp')).default;
    await sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 10, g: 10, b: 10 } } })
      .webp().toFile(different);
    made.push(different);
    expect(await priorYearCoverClash(entry, 2061)).toBe('');
  });
});
