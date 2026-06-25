// 把「待審草稿」回報到 Slack，附「✅ 發佈這篇」鈕（給 cron 驅動的事實稿用）。
//
// 由 cron 事實稿流程在 newsroom-write --go 成功後呼叫：
//   node scripts/notify-pending-draft.mjs <result.json>
// result.json 由 newsroom-write 寫出（含 title / url / slug / pendingApproval / excerpt / highlights…）。
//
// slack-actions-server 的人工觸發路徑會自己回報；這支只給「沒有經過 server 佇列」的 cron 路徑用。
// 重用 buildDoneMessage（server）與 buildPublishButton（互動），確保訊息與按鈕跟人工路徑一致。

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { postMessage } from './lib/slack.mjs';
import { buildPublishButton } from './lib/slack-interaction.mjs';
import { buildDoneMessage } from './slack-actions-server.mjs';
import { channelForCategory } from './lib/report-config.mjs';

async function main() {
  const resultPath = process.argv[2];
  if (!resultPath) {
    console.error('用法：node scripts/notify-pending-draft.mjs <result.json>');
    process.exit(1);
  }
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error('缺 SLACK_BOT_TOKEN（請 source ~/.config/appi-news/report.env）');
    process.exit(1);
  }

  let result;
  try {
    result = JSON.parse(readFileSync(resultPath, 'utf8'));
  } catch (e) {
    console.error(`讀不到/解析不了 result ${resultPath}：${e.message}`);
    process.exit(1);
  }

  const msg = buildDoneMessage({ title: result.title }, result, '');
  const note = '（⏳ 預覽頁部署中，若連結點開 404 請稍候一兩分鐘）';
  // 滾動更新既有文章（同一颱風事件）：用「已更新」開頭點明不是新的一篇，避免讀者誤以為又多一篇。
  const updatedPrefix = result.updated
    ? `♻️ *同一事件已更新（非新文章）*：停班停課情形有變，已就地更新原文並刷新「最後更新」時間。\n\n`
    : '';
  const text = `${updatedPrefix}${msg}\n${note}`;

  let blocks;
  if (result.pendingApproval && result.slug) {
    blocks = [
      { type: 'section', text: { type: 'mrkdwn', text } },
      buildPublishButton({ slug: result.slug, title: result.title, category: result.category }),
    ];
  }

  const channel = channelForCategory(result.category); // 路由到對應分類頻道（如生活）
  const r = await postMessage({ token, channel, text, blocks });
  console.log('sent ts=' + r.ts);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(String(e.message || e));
    process.exit(1);
  });
}
