// cron 值勤回報：發一則訊息到指定分類頻道（無 --category 則發預設「作者群」當值勤頻道）。
// 給各 cron 在「正常完成 / 無產出 / 失敗」時都回報，確保每次執行都有 Slack 通知。
//
// 用法：
//   node scripts/cron-report.mjs --text "訊息"                    # 發到作者群（值勤回報）
//   node scripts/cron-report.mjs --category international --text "✅ 上架 3 篇\n<url>..."  # 發到國際台
//   node scripts/cron-report.mjs --dev --text "..."              # 發到 dev 頻道（維運/心跳/索引等系統訊號）
//
// 🔴 訊息開頭是 ❌ 或 ⚠️ ＝失敗/略過告警，**一律強制發 dev 台**（無視 --category）。
//    所以各線 `.sh` 不必再自己判斷要不要帶 --dev；舊有的 `--category X` 留著也不會有作用。
//   echo "長訊息" | node scripts/cron-report.mjs --dev --stdin

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { postMessage } from './lib/slack.mjs';
import { routeChannel } from './lib/report-config.mjs';

function arg(n) { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; }

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) { console.error('缺 SLACK_BOT_TOKEN'); process.exit(1); }
  const category = arg('category'); // 未給 → channelForCategory 回預設作者群
  let text = process.argv.includes('--stdin') ? readFileSync(0, 'utf8') : arg('text');
  if (!text || !text.trim()) { console.error('缺 --text'); process.exit(1); }
  // 頻道優先序：❌/⚠️ 告警（一律 dev）＞ --dev ＞ --category 分類頻道 ＞ 預設作者群。
  // 告警不看 --category：失敗與略過統一收在 dev 台，分類台只留有產出的內容（見 report-config.mjs）。
  const channel = routeChannel({ text, category, dev: process.argv.includes('--dev') });
  const r = await postMessage({ token, channel, text });
  console.log('cron-report sent ts=' + r.ts);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
}
