import { describe, it, expect } from 'vitest';
import { parseViewpointVerdict } from './newsroom-write.mjs';

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
