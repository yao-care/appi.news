// 把週報/雷達的「建議方向」結構化陣列 → Block Kit blocks，可自動產文的建議掛「我要寫這題」按鈕。
// 由 slack-post.mjs 呼叫；按鈕 value 用 buildTopicButtonValue（與互動端點解析對齊）。
//
// 掛按鈕的兩條路（2026-08-06 擴充第二條）：
//   ①**觀點稿**：category 屬於可自動產文 vertical 且 kind!=='factual'
//     → 按鈕開 modal 填真人看法 → 直接發佈上線（現行 tech 日更）。
//   ②**事實稿**：任何合法分類（含 health/finance）且 kind==='factual'
//     → 按鈕開 modal（看法改為選填）→ 產**待審草稿**，人工核可才上線。
//     為什麼要開這條：論壇選題雷達會產出 health/finance 候選，但這兩類不在 VERTICALS
//     （刻意保留「機器不自選健康/財經觀點題」這條界線），原本會連按鈕都掛不上、只能手動下單。
//     事實稿一律待審不自動上線，所以放寬分類是安全的——被放寬的是「誰能開單」，
//     不是「誰能直接上線」。cron 自動線仍不受影響（它們不經過按鈕）。

import { buildTopicButtonValue, WRITE_ACTION_ID } from './slack-interaction.mjs';
import { isVertical, isCategoryAny } from './verticals.mjs';

/** 此建議可否走「按鈕 → modal → 產文」流程。見檔頭兩條路。 */
export function isButtonEligible(s) {
  if (!s) return false;
  if (s.kind === 'factual') return isCategoryAny(s.category);
  return isVertical(s.category);
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
