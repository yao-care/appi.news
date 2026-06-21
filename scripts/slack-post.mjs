// 讀 payload JSON 檔（{ text, blocks?, suggestions?, category? }）→ 用 env SLACK_BOT_TOKEN 發到對應頻道。
// suggestions（建議方向結構化陣列）會被展開成 Block Kit，可自動產文的分類自動掛「我要寫這題」按鈕。
// 頻道路由：明確 channelId 參數 > payload.category > 第一則 suggestion 的 category > 預設頻道。
// 用法：node scripts/slack-post.mjs <payload.json> [channelId]
import { readFileSync } from 'node:fs';
import { postMessage } from './lib/slack.mjs';
import { suggestionBlocks } from './lib/suggestion-blocks.mjs';
import { channelForCategory } from './lib/report-config.mjs';

const [, , payloadPath, channelArg] = process.argv;
const token = process.env.SLACK_BOT_TOKEN;
if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
if (!payloadPath) { console.error('用法：node scripts/slack-post.mjs <payload.json> [channelId]'); process.exit(1); }

const { text, blocks: baseBlocks, suggestions, category } = JSON.parse(readFileSync(payloadPath, 'utf8'));
const extra = suggestionBlocks(suggestions);
const blocks = extra.length ? [...(baseBlocks || []), ...extra] : baseBlocks;
// 依分類選頻道：失敗哨兵等無分類訊息會落到預設頻道。
const cat = category || (Array.isArray(suggestions) && suggestions[0]?.category);
const channel = channelArg || channelForCategory(cat);
try {
  const r = await postMessage({ token, channel, text, blocks });
  console.log('sent ts=' + r.ts);
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
