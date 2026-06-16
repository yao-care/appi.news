// 把週報的「建議方向」結構化陣列 → Block Kit blocks，每個 tech 建議掛「我要寫這題」按鈕。
// 由 slack-post.mjs 呼叫；按鈕 value 用 buildTopicButtonValue（與互動端點解析對齊）。
// 只有 category==='tech' 的建議掛按鈕（本管線只自動產科技類，spec §1）。

import { buildTopicButtonValue, WRITE_ACTION_ID } from './slack-interaction.mjs';

const TECH = 'tech';

function suggestionText(s, n) {
  const parts = [];
  if (s.signal) parts.push(`依據：${s.signal}`);
  if (s.angle) parts.push(`切角：${s.angle}`);
  if (s.conclusion) parts.push(`結論：${s.conclusion}`);
  const cat = (s.category ?? '') + (s.subcategory ? `/${s.subcategory}` : '');
  if (cat) parts.push(`分類：${cat}`);
  return `*${n}. ${s.title ?? ''}*\n${parts.join('　|　')}`;
}

/** suggestions（{title,conclusion,angle,signal,category,subcategory}[]）→ blocks。 */
export function suggestionBlocks(suggestions) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return [];
  const blocks = [
    { type: 'divider' },
    { type: 'section', text: { type: 'mrkdwn', text: '💡 *本週建議寫作方向*（科技類可按鈕一鍵開寫）' } },
  ];
  suggestions.forEach((s, i) => {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: suggestionText(s, i + 1) } });
    if (s && s.category === TECH) {
      let value = null;
      try {
        value = buildTopicButtonValue(s);
      } catch {
        value = null; // 太大（>2000）就不掛按鈕，仍顯示文字
      }
      if (value) {
        blocks.push({
          type: 'actions',
          elements: [
            { type: 'button', text: { type: 'plain_text', text: '我要寫這題' }, style: 'primary', action_id: WRITE_ACTION_ID, value },
          ],
        });
      }
    }
  });
  return blocks;
}
