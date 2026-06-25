// 颱風停班停課「狀態變更偵測」：讓 watch 可高頻跑，但只有停班課情形「有變」時才產新草稿，
// 避免颱風期間每小時重複洗出一樣的待審草稿。
//
// 設計：
//   - 把目前的停班課清單算成一個穩定 signature（排序正規化）。
//   - 與上次記錄的 signature 比對：相同 → 跳過（exit 3）；不同 → 該產出（exit 0）。
//   - 狀態存 git 工作區外（~/.local/state/appi-news/typhoon-state.json），不弄髒 repo。
//   - 另存「當前颱風事件的文章 slug」：同一場颱風只維護一篇，每次變更就滾動更新那一篇而非新建。
//     事件結束（空清單 record）→ 清空 slug，下一場才另起新篇。為什麼：見 SKILL.md 步驟 2「同一颱風事件＝同一篇」。
//   - 純函式（closureSignature / diffState）可單元測試；CLI 是薄殼。
//
// 用法：
//   node scripts/typhoon-state.mjs check  <closures.json>              # 變了 exit 0；沒變/無颱風 exit 3；印 SIGNATURE 與 EPISODE_SLUG
//   node scripts/typhoon-state.mjs record <closures.json> [--slug <s>] # 記 signature（＋事件文章 slug）；空清單則清空事件狀態
//   node scripts/typhoon-state.mjs slug   <closures.json>              # 印出當前事件文章 slug（空＝無進行中事件）
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

function readStateObj(path) {
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    return {
      sig: typeof j?.sig === 'string' ? j.sig : '',
      slug: typeof j?.slug === 'string' ? j.slug : '', // 當前颱風事件的文章 slug（''＝無進行中事件）
    };
  } catch {
    return { sig: '', slug: '' };
  }
}

function readState(path) {
  return readStateObj(path).sig;
}

function writeState(path, sig, slug = '') {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ sig, slug: slug || '', ts: new Date().toISOString() }, null, 2) + '\n');
}

function loadClosures(file) {
  const j = JSON.parse(readFileSync(file, 'utf8'));
  return Array.isArray(j) ? j : j.closures;
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const slugFlagIdx = argv.indexOf('--slug');
  const slugArg = slugFlagIdx >= 0 ? argv[slugFlagIdx + 1] || '' : '';
  const file = argv.slice(1).find((a) => !a.startsWith('--') && a !== slugArg);
  const path = statePath();

  // slug：印出目前進行中事件的文章 slug（''＝無事件）。讓 watch 決定「新建 or 滾動更新」。
  if (cmd === 'slug') {
    process.stdout.write(`${readStateObj(path).slug}\n`);
    return;
  }

  if (!cmd || !file) {
    console.error('用法：node scripts/typhoon-state.mjs <check|record|slug> <closures.json> [--slug <事件文章slug>]');
    process.exit(1);
  }
  let sig;
  try {
    sig = closureSignature(loadClosures(file));
  } catch (e) {
    console.error(`讀不到/解析不了 ${file}：${e.message}`);
    process.exit(1);
  }

  if (cmd === 'check') {
    const { sig: prev, slug: prevSlug } = readStateObj(path);
    const { changed } = diffState(prev, sig);
    process.stdout.write(`SIGNATURE=${sig}\n`);
    process.stdout.write(`EPISODE_SLUG=${prevSlug}\n`); // 進行中事件的文章 slug（''＝無）
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
    // 無停班課（空清單）＝事件結束 → 連同事件文章 slug 一起清掉，下次有颱風才會新建一篇。
    // 有停班課 → 記住本次 slug（沒帶 --slug 就沿用既有，維持同一事件指向同一篇）。
    const nextSlug = sig ? slugArg || readStateObj(path).slug : '';
    writeState(path, sig, nextSlug);
    console.log(`recorded signature（${sig ? sig.length + ' chars' : '空（事件結束，已清 slug）'}）slug=${nextSlug || '∅'} → ${path}`);
    return;
  }

  console.error('未知指令；用 check / record / slug');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
