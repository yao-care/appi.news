// 民俗節慶佈局雷達：年曆表（lib/festival-days.mjs）→ 窗內節點 → 自動撰寫成員文並上架 → 回報生活台。
// 站長 2026-08-22 裁示開線（複製七夕/中元/中秋提前佈局套路；成長第 2 槓桿）。
//
// 行為：
//   - 預設 dry-run：只印窗內節點與將開的工單，零副作用。
//   - --go：對「帳本未記錄」的窗內節點，逐題走 writeAndPublish（newsroom factual 正規產線：
//     codex 起草＋配圖＋四道 gate＋自動上線），全數完成才記帳本（partial 失敗下輪重試）。
//   - 帳本：~/.local/state/appi-news/festival-done.json（{ [festivalId]: ISO 時間 }），防重複佈局。
//   - **hub（topic 頁）不在本腳本**：成員文先上線卡位；hub 由人工或後續輪建立
//     （中元/中秋經驗：hub 晚幾天建不影響成員文排名爬升）。
//   - 純資料判斷在前：窗內無節點就 exit 0，完全不喚模型（同論壇/颱風前置 gate 慣例）。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { FESTIVAL_DAYS, upcomingFestivals, LEAD_DAYS } from './lib/festival-days.mjs';
import { writeAndPublish, postToSlack } from './lib/radar-shared.mjs';

const GO = process.argv.includes('--go');
const LEDGER = process.env.FESTIVAL_LEDGER
  || join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'festival-done.json');

const todayYmd = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10); // 台北日期
const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {};
const due = upcomingFestivals(todayYmd, FESTIVAL_DAYS).filter((f) => !ledger[f.id]);

if (!due.length) {
  console.log(`festival-radar：${todayYmd} 起 ${LEAD_DAYS} 天內無未佈局節點，安靜結束（未喚模型）。`);
  process.exit(0);
}

for (const f of due) {
  console.log(`\n📅 ${f.name}（${f.date}）進入佈局窗，成員題 ${f.ideas.length} 篇：`);
  f.ideas.forEach((i) => console.log(`  - ${i.title}`));
  if (!GO) continue;

  const published = [];
  let allOk = true;
  for (const idea of f.ideas) {
    const url = writeAndPublish(
      {
        title: idea.title,
        signal: `民俗節慶年曆：${f.name} ${f.date}（提前 ${LEAD_DAYS} 天佈局，lib/festival-days.mjs）`,
        angle: idea.angle,
        conclusion: idea.conclusion,
        category: 'lifestyle',
        subcategory: 'life',
      },
      { tmpPrefix: 'appi-festival-' },
    );
    if (url) published.push({ url, title: idea.title });
    else allOk = false;
  }

  if (published.length) {
    postToSlack(published, {
      category: 'lifestyle',
      heading: `🏮 *節慶佈局：${f.name}（${f.date}）*`,
      notifyTitle: `節慶佈局 ${f.name}`,
      sourceNote: `距 ${f.name} 還有 ${Math.round((Date.parse(f.date) - Date.parse(todayYmd)) / 86400000)} 天，年曆線提前佈局`,
      payloadPath: `/tmp/festival-slack-${f.id}.json`,
    });
  }
  if (allOk) {
    ledger[f.id] = new Date().toISOString();
    mkdirSync(dirname(LEDGER), { recursive: true });
    writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
    console.log(`✓ ${f.name} 佈局完成（${published.length} 篇），已記帳本。`);
  } else {
    console.log(`⚠️ ${f.name} 部分未產出（${published.length}/${f.ideas.length}），不記帳本、下輪重試。`);
  }
}
