// 步驟一收斂：把 Slack 討論串統整成「需求確認書」草稿。被 devbot 車道 spawn。
//   node scripts/devbot-consolidate.mjs <input.json> <out-dir>
// input.json: { messages:[{user,text}], botUserId }
// 輸出 <out-dir>/result.json: { title, body }（server 取之貼草稿＋「建立需求單」鈕）。
//
// 在 /root/appi.news-devbridge clone 跑（cwd），讓 Claude 必要時能參考實際程式碼把需求講具體。
// 唯讀為主；canUseTool 接 evaluateTool 仍把關。

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { buildConsolidationPrompt, parseSpecOutput, evaluateTool } from './lib/devbot.mjs';

const BASE_CLONE = process.env.DEVBOT_BASE || '/root/appi.news-devbridge';

async function main() {
  const inputPath = process.argv[2];
  const outDir = process.argv[3];
  if (!inputPath || !outDir) {
    console.error('用法：node scripts/devbot-consolidate.mjs <input.json> <out-dir>');
    process.exit(2);
  }
  mkdirSync(outDir, { recursive: true });
  const { messages, botUserId } = JSON.parse(readFileSync(inputPath, 'utf8'));
  const prompt = buildConsolidationPrompt(messages, { botUserId });

  let finalText = '';
  let errSubtype = null;
  const q = query({
    prompt,
    options: {
      cwd: existsSync(BASE_CLONE) ? BASE_CLONE : process.cwd(),
      permissionMode: 'default',
      settingSources: ['project'],
      maxTurns: Number(process.env.DEVBOT_CONSOLIDATE_TURNS || 20),
      systemPrompt: { type: 'preset', preset: 'claude_code' },
      canUseTool: async (toolName, input) => evaluateTool(toolName, input, { worktree: BASE_CLONE }),
    },
  });
  for await (const msg of q) {
    if (msg.type === 'result') {
      if (msg.subtype === 'success') finalText = msg.result || '';
      else errSubtype = msg.subtype;
    }
  }
  if (errSubtype) {
    console.error(`收斂中斷：${errSubtype}`);
    process.exit(1);
  }
  const { title, body } = parseSpecOutput(finalText);
  writeFileSync(`${outDir}/result.json`, JSON.stringify({ title, body }, null, 2));
  console.log(`SPEC_TITLE=${title}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
