// cron 值勤回報：發一則訊息到指定分類頻道（無 --category 則發預設「作者群」當值勤頻道）。
// 給各 cron 在「正常完成 / 無產出 / 失敗」時都回報，確保每次執行都有 Slack 通知。
//
// 用法：
//   node scripts/cron-report.mjs --text "訊息"                    # 發到作者群（值勤回報）
//   node scripts/cron-report.mjs --category international --text "✅ 上架 3 篇\n<url>..."  # 發到國際台
//   echo "長訊息" | node scripts/cron-report.mjs --category lifestyle --stdin

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { postMessage } from './lib/slack.mjs';
import { channelForCategory } from './lib/report-config.mjs';

function arg(n) { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; }

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
  const category = arg('category'); // 未給 → channelForCategory 回預設作者群
  let text = process.argv.includes('--stdin') ? readFileSync(0, 'utf8') : arg('text');
  if (!text || !text.trim()) { console.error('缺 --text'); process.exit(1); }
  // 未給 --category → 預設作者群（值勤/錯誤哨兵）。dev 台只給 @bot 開發需求，cron 一律不發 dev。
  const channel = channelForCategory(category);
  const r = await postMessage({ token, channel, text });
  console.log('cron-report sent ts=' + r.ts);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
}
