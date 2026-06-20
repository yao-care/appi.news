import { describe, it, expect } from 'vitest';
import { suggestionBlocks } from './suggestion-blocks.mjs';
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

  it('事實稿（kind: factual）不掛按鈕（由 cron 觸發、非人工填觀點）', () => {
    const blocks = suggestionBlocks([tech({ category: 'lifestyle', subcategory: 'consumer', kind: 'factual' })]);
    expect(actions(blocks)).toHaveLength(0);
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
