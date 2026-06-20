// 颱風停班停課「狀態變更偵測」：讓 watch 可高頻跑，但只有停班課情形「有變」時才產新草稿，
// 避免颱風期間每小時重複洗出一樣的待審草稿。
//
// 設計：
//   - 把目前的停班課清單算成一個穩定 signature（排序正規化）。
//   - 與上次記錄的 signature 比對：相同 → 跳過（exit 3）；不同 → 該產出（exit 0）。
//   - 狀態存 git 工作區外（~/.local/state/appi-news/typhoon-state.json），不弄髒 repo。
//   - 純函式（closureSignature）可單元測試；CLI 是薄殼。
//
// 用法：
//   node scripts/typhoon-state.mjs check  <closures.json>   # 變了 exit 0；沒變 exit 3；印 signature
//   node scripts/typhoon-state.mjs record <closures.json>   # 把目前 signature 記為已產出
//
// closures.json 形如：{ "closures": [ { "area":"臺北市", "status":"停止上班、停止上課", "date":"2026-07-10" }, ... ] }
//   無颱風（空清單）→ signature 為空字串；check 對「空 vs 無紀錄」視為沒變（保持安靜）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export function statePath() {
  return (
    process.env.TYPHOON_STATE_PATH ||
    join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'typhoon-state.json')
  );
}

/** 停班課清單 → 穩定 signature（排序、正規化；同一組情形不論順序都同字串）。 */
export function closureSignature(closures) {
  const items = (Array.isArray(closures) ? closures : [])
    .map((c) => {
      const date = String(c?.date ?? '').trim();
      const area = String(c?.area ?? '').trim().normalize('NFKC');
      const status = String(c?.status ?? '').trim().normalize('NFKC');
      return `${date}|${area}|${status}`;
    })
    .filter((s) => s.replace(/\|/g, '').trim().length > 0)
    .sort();
  return items.join(';');
}

/** 比對目前 signature 與上次記錄。回傳 { changed:boolean, current, previous }。 */
export function diffState(prevSig, currentSig) {
  return { changed: (prevSig || '') !== (currentSig || ''), current: currentSig || '', previous: prevSig || '' };
}

// ───────────────────────── CLI 薄殼 ─────────────────────────

function readState(path) {
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    return typeof j?.sig === 'string' ? j.sig : '';
  } catch {
    return '';
  }
}

function writeState(path, sig) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ sig, ts: new Date().toISOString() }, null, 2) + '\n');
}

function loadClosures(file) {
  const j = JSON.parse(readFileSync(file, 'utf8'));
  return Array.isArray(j) ? j : j.closures;
}

function main() {
  const [cmd, file] = process.argv.slice(2);
  if (!cmd || !file) {
    console.error('用法：node scripts/typhoon-state.mjs <check|record> <closures.json>');
    process.exit(1);
  }
  let sig;
  try {
    sig = closureSignature(loadClosures(file));
  } catch (e) {
    console.error(`讀不到/解析不了 ${file}：${e.message}`);
    process.exit(1);
  }
  const path = statePath();

  if (cmd === 'check') {
    const prev = readState(path);
    const { changed } = diffState(prev, sig);
    process.stdout.write(`SIGNATURE=${sig}\n`);
    if (!sig) {
      // 沒有任何停班課情形：保持安靜（視為沒變）。
      process.stdout.write('NO_CLOSURES\n');
      process.exit(3);
    }
    if (changed) {
      process.stdout.write('CHANGED\n');
      process.exit(0);
    }
    process.stdout.write('SAME\n');
    process.exit(3);
  }

  if (cmd === 'record') {
    writeState(path, sig);
    console.log(`recorded signature（${sig ? sig.length + ' chars' : '空'}）→ ${path}`);
    return;
  }

  console.error('未知指令；用 check 或 record');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
