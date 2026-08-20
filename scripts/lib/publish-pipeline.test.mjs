import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { missingLocalAssets, runArticleGates, GATES } from './publish-pipeline.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'pp-'));
  const articlesDir = join(root, 'articles');
  mkdirSync(articlesDir, { recursive: true });
  return { root, articlesDir };
}

describe('missingLocalAssets', () => {
  it('檔案不存在回哨兵訊息', () => {
    const { articlesDir } = fixture();
    expect(missingLocalAssets('nope', { articlesDir })).toEqual(['（文章檔不存在）']);
  });
  it('引用了卻沒存到的圖被列出、存在的不列', () => {
    const { root, articlesDir } = fixture();
    mkdirSync(join(root, 'public', 'covers'), { recursive: true });
    writeFileSync(join(root, 'public', 'covers', 'ok.webp'), 'x');
    writeFileSync(join(articlesDir, 'a.md'), '---\ntitle: t\n---\n![](/covers/ok.webp) ![](/images/missing.png)');
    expect(missingLocalAssets('a', { articlesDir, publicDir: join(root, 'public') })).toEqual(['images/missing.png']);
  });
});

describe('runArticleGates — gate 集合的唯一定義點', () => {
  function passSpawn(calls) {
    return (cmd, args) => { calls.push(args[0]); return { status: 0, stdout: '', stderr: '' }; };
  }
  function makeArticle() {
    const { articlesDir } = fixture();
    writeFileSync(join(articlesDir, 'a.md'), '---\ntitle: t\n---\n無圖內文');
    return articlesDir;
  }

  it('預設不跑 dup（roundup 型產線的標題本來就相似，開了必誤殺）；順序照 GATES 定義', () => {
    const calls = [];
    const articlesDir = makeArticle();
    const r = runArticleGates('a', { articlesDir, spawnImpl: passSpawn(calls), log: () => {} });
    expect(r.ok).toBe(true);
    expect(calls).toEqual(['scripts/growth-lint.mjs', 'scripts/check-tags.mjs', 'scripts/check-content.mjs', 'scripts/check-cover-spec.mjs']);
  });

  it('dup: true 時插在 tone 之後、cover 之前', () => {
    const calls = [];
    const articlesDir = makeArticle();
    runArticleGates('a', { articlesDir, dup: true, spawnImpl: passSpawn(calls), log: () => {} });
    expect(calls).toEqual(GATES.map((g) => g.script));
  });

  it('blocking gate 失敗 → 回報 gate/label/detail，且後面的 gate 不再跑', () => {
    const calls = [];
    const articlesDir = makeArticle();
    const spawnImpl = (cmd, args) => {
      calls.push(args[0]);
      if (args[0] === 'scripts/check-tags.mjs') return { status: 1, stdout: '表外標籤：xx', stderr: '' };
      return { status: 0, stdout: '', stderr: '' };
    };
    const r = runArticleGates('a', { articlesDir, spawnImpl, log: () => {} });
    expect(r).toMatchObject({ ok: false, gate: 'tags', detail: '表外標籤：xx' });
    expect(calls).not.toContain('scripts/check-content.mjs');
  });

  it('growth 是 report-only：exit 1 也不擋，只把輸出交給 log', () => {
    const logs = [];
    const articlesDir = makeArticle();
    const spawnImpl = (cmd, args) => (args[0] === 'scripts/growth-lint.mjs'
      ? { status: 1, stdout: '零內鏈', stderr: '' }
      : { status: 0, stdout: '', stderr: '' });
    const r = runArticleGates('a', { articlesDir, spawnImpl, log: (m) => logs.push(m) });
    expect(r.ok).toBe(true);
    expect(logs).toContain('零內鏈');
  });

  it('缺圖在任何 gate 之前就攔下（純 fs，不 spawn）', () => {
    const { articlesDir } = fixture();
    writeFileSync(join(articlesDir, 'a.md'), '---\nt: t\n---\n![](/covers/none.webp)');
    const calls = [];
    const r = runArticleGates('a', { articlesDir, spawnImpl: passSpawn(calls), log: () => {} });
    expect(r).toMatchObject({ ok: false, gate: 'assets' });
    expect(calls).toEqual([]);
  });
});
