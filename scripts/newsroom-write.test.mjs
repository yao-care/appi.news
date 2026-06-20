import { describe, it, expect } from 'vitest';
import { parseViewpointVerdict, buildDraftPrompt } from './newsroom-write.mjs';
import { normalizeJob } from './lib/newsroom-job.mjs';

describe('parseViewpointVerdict — 觀點 gate 判定解析', () => {
  it('PASS → 放行，帶反映處說明', () => {
    const r = parseViewpointVerdict('VIEWPOINT_GATE=PASS｜第三段點出第三方 App 才是破口');
    expect(r.ok).toBe(true);
    expect(r.infra).toBe(false);
    expect(r.note).toContain('第三方');
  });

  it('FAIL → 不放行，帶理由', () => {
    const r = parseViewpointVerdict('VIEWPOINT_GATE=FAIL｜觀點被稀釋成中性敘述');
    expect(r.ok).toBe(false);
    expect(r.infra).toBe(false);
    expect(r.note).toContain('稀釋');
  });

  it('容忍前後雜訊與半形分隔/冒號', () => {
    const r = parseViewpointVerdict('一些 log\nVIEWPOINT_GATE=PASS: 結尾段落承載作者判斷\n再見');
    expect(r.ok).toBe(true);
    expect(r.note).toContain('結尾段落');
  });

  it('大小寫不敏感', () => {
    expect(parseViewpointVerdict('viewpoint_gate=pass｜ok').ok).toBe(true);
  });

  it('解析不到 token → infra 錯（fail-closed，標記為工具異常）', () => {
    const r = parseViewpointVerdict('claude 沒有照格式回，只講了一堆廢話');
    expect(r.ok).toBe(false);
    expect(r.infra).toBe(true);
  });

  it('空輸出 → infra 錯', () => {
    const r = parseViewpointVerdict('');
    expect(r.ok).toBe(false);
    expect(r.infra).toBe(true);
  });
});

describe('buildDraftPrompt — 多分類 / 內容形態', () => {
  const baseJob = {
    title: 'T', conclusion: 'C', angle: 'A', signal: 'S',
    category: 'tech', subcategory: 'ai', viewpoint: '我帶團隊的經驗',
  };

  it('觀點稿（column）：帶分類中文名、真人觀點、作者本人、讀 persona', () => {
    const p = buildDraftPrompt(normalizeJob(baseJob));
    expect(p).toContain('科技類起草');
    expect(p).toContain('我帶團隊的經驗');
    expect(p).toContain('author: "lightman"');
    expect(p).toContain('category: "tech"');
    expect(p).toContain('persona.md');
  });

  it('國際觀點稿：分類中文名與 slug 都正確帶入', () => {
    const p = buildDraftPrompt(normalizeJob({ ...baseJob, category: 'international', subcategory: 'asia' }));
    expect(p).toContain('國際類起草');
    expect(p).toContain('category: "international"');
    expect(p).toContain('subcategory: "asia"');
  });

  it('事實稿（factual）：編輯部署名、禁個人觀點、不讀 persona、不追加記憶', () => {
    const { viewpoint, ...rest } = baseJob;
    const p = buildDraftPrompt(normalizeJob({ ...rest, kind: 'factual', category: 'lifestyle', subcategory: 'aging-life' }));
    expect(p).toContain('author: "appi-editorial"');
    expect(p).toContain('不要加入任何個人觀點');
    expect(p).not.toContain('persona.md');
    expect(p).toContain('事實稿不需追加 author-memory.json');
    expect(p).toContain('contentType: "guide"');
  });
});
