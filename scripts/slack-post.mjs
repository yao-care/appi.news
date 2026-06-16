// 讀 payload JSON 檔（{ text, blocks?, suggestions? }）→ 用 env SLACK_BOT_TOKEN 發到 config 頻道。
// suggestions（建議方向結構化陣列）會被展開成 Block Kit，tech 類自動掛「我要寫這題」按鈕。
// 用法：node scripts/slack-post.mjs <payload.json> [channelId]
import { readFileSync } from 'node:fs';
import { postMessage } from './lib/slack.mjs';
import { suggestionBlocks } from './lib/suggestion-blocks.mjs';
import { SLACK_CHANNEL } from './lib/report-config.mjs';

const [, , payloadPath, channelArg] = process.argv;
const token = process.env.SLACK_BOT_TOKEN;
if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
if (!payloadPath) { console.error('用法：node scripts/slack-post.mjs <payload.json> [channelId]'); process.exit(1); }

const { text, blocks: baseBlocks, suggestions } = JSON.parse(readFileSync(payloadPath, 'utf8'));
const extra = suggestionBlocks(suggestions);
const blocks = extra.length ? [...(baseBlocks || []), ...extra] : baseBlocks;
try {
  const r = await postMessage({ token, channel: channelArg || SLACK_CHANNEL, text, blocks });
  console.log('sent ts=' + r.ts);
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
