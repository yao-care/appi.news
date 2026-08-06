import { describe, it, expect } from 'vitest';
import { suggestionBlocks, isButtonEligible } from './suggestion-blocks.mjs';
import { WRITE_ACTION_ID, parseButtonInteraction } from './slack-interaction.mjs';

const tech = (over = {}) => ({
  title: 'AI 編碼工具定價',
  conclusion: '壓住成本是關鍵',
  angle: '台灣小團隊視角',
  signal: 'GitHub Copilot 改量計價',
  category: 'tech',
  subcategory: 'software-products',
  ...over,
});

const actions = (blocks) => blocks.filter((b) => b.type === 'actions');

describe('suggestionBlocks', () => {
  it('空陣列 → []', () => {
    expect(suggestionBlocks([])).toEqual([]);
    expect(suggestionBlocks(undefined)).toEqual([]);
  });

  it('tech 建議 → 有 section + 按鈕，action_id 正確、value 可被端點解析回 topic', () => {
    const blocks = suggestionBlocks([tech()]);
    const acts = actions(blocks);
    expect(acts).toHaveLength(1);
    const btn = acts[0].elements[0];
    expect(btn.action_id).toBe(WRITE_ACTION_ID);
    // 模擬端點解析按鈕
    const parsed = parseButtonInteraction({ type: 'block_actions', actions: [btn], user: { id: 'U' }, trigger_id: 'T' });
    expect(parsed.topic.title).toBe('AI 編碼工具定價');
    expect(parsed.topic.category).toBe('tech');
  });

  it('其他可自動產 vertical（international/sports/lifestyle）也掛按鈕', () => {
    expect(actions(suggestionBlocks([tech({ category: 'international', subcategory: 'asia' })]))).toHaveLength(1);
    expect(actions(suggestionBlocks([tech({ category: 'sports', subcategory: 'baseball' })]))).toHaveLength(1);
    expect(actions(suggestionBlocks([tech({ category: 'lifestyle', subcategory: 'food' })]))).toHaveLength(1);
  });

  it('未開放的分類（health/finance）→ 只有文字、不掛按鈕', () => {
    expect(actions(suggestionBlocks([tech({ category: 'health', subcategory: 'medical' })]))).toHaveLength(0);
    expect(actions(suggestionBlocks([tech({ category: 'finance' })]))).toHaveLength(0);
    expect(JSON.stringify(suggestionBlocks([tech({ category: 'health' })]))).toContain('AI 編碼工具定價');
  });

  // 2026-08-06 行為變更：事實稿改為**掛按鈕**（走待審草稿路徑）。
  // 原規則是「事實稿由 cron 直接觸發、不走人工按鈕」，但論壇選題雷達會產出 health/finance
  // 的事實型候選，需要人挑；而颱風/優惠那些 cron 產的待審草稿走的是 notify-pending-draft.mjs
  // 的「發佈鈕」（buildPublishButton），根本不經過 suggestionBlocks，故此變更不影響它們。
  it('事實稿掛按鈕（人挑 → 產待審草稿，非直接上線）', () => {
    const blocks = suggestionBlocks([tech({ category: 'lifestyle', subcategory: 'consumer', kind: 'factual' })]);
    expect(actions(blocks)).toHaveLength(1);
  });

  it('混合 → 只有可自動產且非事實稿的掛按鈕', () => {
    const blocks = suggestionBlocks([tech(), tech({ category: 'finance' }), tech({ category: 'international', title: '第三題' })]);
    expect(actions(blocks)).toHaveLength(2);
  });

  it('過大的 topic（value>2000）→ 不掛按鈕但仍顯示', () => {
    const blocks = suggestionBlocks([tech({ conclusion: 'x'.repeat(2100) })]);
    expect(actions(blocks)).toHaveLength(0);
  });
});

// ── 2026-08-06：事實稿按鈕路徑（論壇選題雷達產的 health/finance 候選要掛得上按鈕）──
describe('按鈕資格：事實稿走放寬分類（待審草稿路徑）', () => {
  it('觀點稿仍只收可自動產文的 vertical', () => {
    expect(isButtonEligible({ category: 'tech' })).toBe(true);
    expect(isButtonEligible({ category: 'health' })).toBe(false);
    expect(isButtonEligible({ category: 'finance' })).toBe(false);
  });

  it('事實稿放寬到全部合法分類（含 health/finance）', () => {
    expect(isButtonEligible({ category: 'health', kind: 'factual' })).toBe(true);
    expect(isButtonEligible({ category: 'finance', kind: 'factual' })).toBe(true);
    expect(isButtonEligible({ category: 'tech', kind: 'factual' })).toBe(true);
  });

  it('非法分類一律不掛按鈕', () => {
    expect(isButtonEligible({ category: 'nonsense', kind: 'factual' })).toBe(false);
    expect(isButtonEligible({ category: 'nonsense' })).toBe(false);
    expect(isButtonEligible(null)).toBe(false);
  });

  it('health 事實稿建議確實產出按鈕 block', () => {
    const blocks = suggestionBlocks([
      { title: '一天要吃多少蛋白質', category: 'health', subcategory: 'nutrition', kind: 'factual' },
    ]);
    expect(JSON.stringify(blocks)).toContain('我要寫這題');
  });
});
