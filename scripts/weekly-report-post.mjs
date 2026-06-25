// 週報專用發送：讀結構化 payload → 決定論渲染手機可讀 blocks（weekly-blocks.mjs）→ 接 suggestionBlocks → 發作者群。
// 週報以前由模型手刻 blocks，常把多欄數據塞一行、手機換行後讀不了；改成模型只填數據 + 質性 notes，版面交給 lib。
// 用法：node scripts/weekly-report-post.mjs <payload.json>
// payload：{ text, report?, suggestions?[] }
//   - report 缺（失敗哨兵）→ 只發 text。
//   - report 結構見 weekly-blocks.mjs 的 weeklyReportBlocks 註解。
import { readFileSync } from 'node:fs';
import { postMessage } from './lib/slack.mjs';
import { weeklyReportBlocks } from './lib/weekly-blocks.mjs';
import { suggestionBlocks } from './lib/suggestion-blocks.mjs';
import { SLACK_CHANNEL } from './lib/report-config.mjs';

const [, , payloadPath] = process.argv;
const token = process.env.SLACK_BOT_TOKEN;
if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
if (!payloadPath) { console.error('用法：node scripts/weekly-report-post.mjs <payload.json>'); process.exit(1); }

const { text, report, suggestions } = JSON.parse(readFileSync(payloadPath, 'utf8'));
const base = report ? weeklyReportBlocks(report) : [];
const extra = suggestionBlocks(suggestions);
const blocks = [...base, ...extra];

try {
  const r = await postMessage({ token, channel: SLACK_CHANNEL, text, blocks: blocks.length ? blocks : undefined });
  console.log('sent ts=' + r.ts);
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}
