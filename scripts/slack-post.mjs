// 讀 payload JSON 檔（{ text, blocks? }）→ 用 env SLACK_BOT_TOKEN 發到 config 頻道。
// 用法：node scripts/slack-post.mjs <payload.json> [channelId]
import { readFileSync } from 'node:fs';
import { postMessage } from './lib/slack.mjs';
import { SLACK_CHANNEL } from './lib/report-config.mjs';

const [, , payloadPath, channelArg] = process.argv;
const token = process.env.SLACK_BOT_TOKEN;
if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
if (!payloadPath) { console.error('用法：node scripts/slack-post.mjs <payload.json> [channelId]'); process.exit(1); }

const { text, blocks } = JSON.parse(readFileSync(payloadPath, 'utf8'));
try {
  const r = await postMessage({ token, channel: channelArg || SLACK_CHANNEL, text, blocks });
  console.log('sent ts=' + r.ts);
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
