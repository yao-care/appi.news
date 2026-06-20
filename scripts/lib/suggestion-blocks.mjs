// 把週報/雷達的「建議方向」結構化陣列 → Block Kit blocks，可自動產文的建議掛「我要寫這題」按鈕。
// 由 slack-post.mjs 呼叫；按鈕 value 用 buildTopicButtonValue（與互動端點解析對齊）。
// 掛按鈕條件：category 屬於可自動產文 vertical（verticals.mjs）且非事實稿（kind!=='factual'）。
//   事實稿（颱風/樂齡/優惠）由 cron 直接觸發、不走人工按鈕填觀點，故不掛按鈕。

import { buildTopicButtonValue, WRITE_ACTION_ID } from './slack-interaction.mjs';
import { isVertical } from './verticals.mjs';

/** 此建議可否走「按鈕 → 填觀點 → 自動產文」流程（觀點稿且分類可自動產）。 */
function isButtonEligible(s) {
  return !!s && isVertical(s.category) && s.kind !== 'factual';
}

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
    { type: 'section', text: { type: 'mrkdwn', text: '💡 *建議寫作方向*（可按鈕一鍵開寫）' } },
  ];
  suggestions.forEach((s, i) => {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: suggestionText(s, i + 1) } });
    if (isButtonEligible(s)) {
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
