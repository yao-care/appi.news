// 國際編譯台協調器：選題（international-select）→ 每則熱題交給 Claude 寫作/更新 → 上架。
// 純寫作邏輯在 scripts/lib/international-write.mjs（可測）。
//
// 安全：預設 dry-run（只印「選到的題 + 要餵給 Claude 的寫作指令」，零副作用、零寫作）。
//   node scripts/international-write.mjs                 # dry-run：印選題 + 第一則的完整寫作指令
//   node scripts/international-write.mjs --go            # （待審核寫作指令後啟用）真的寫作並上架
//
// 一天一次由 cron 呼叫。

import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { buildIntlPrompt, parseIntlResult } from './lib/international-write.mjs';
import { dedupeByEvent, filterSeen, mergeSeen, buildTriagePrompt, parseTriage } from './lib/international-gate.mjs';
import { runClaudeOnce } from './lib/claude-cli.mjs';
import { salvageArticle } from './lib/changed-articles.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';

const ARTICLES_DIR = 'src/content/articles';

function die(msg) { console.error(`✖ ${msg}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const has = (n) => process.argv.includes(`--${n}`);

/**
 * 用真實系統時間蓋掉模型寫的 publishDate（NEW）/ updatedDate（UPDATE）。
 * 模型沒有可靠時鐘，常把「現在」寫成未來整點（如 13:00/18:30）→ 變排程稿、不立即上線、
 * 點連結只看到 noindex 預覽。這裡強制蓋成 now，確保新聞當下就上線。回傳 title 供 Slack 回報。
 */
function stampDateAndTitle(slug, action, nowIso) {
  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (!existsSync(file)) return '';
  let raw = readFileSync(file, 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  let title = '';
  try { title = (yaml.load(fm ? fm[1] : '') || {}).title || ''; } catch { /* 標題拿不到不致命 */ }
  if (action === 'new') {
    raw = raw.replace(/^publishDate:.*$/m, `publishDate: "${nowIso}"`);
  } else if (action === 'update') {
    if (/^updatedDate:.*$/m.test(raw)) raw = raw.replace(/^updatedDate:.*$/m, `updatedDate: "${nowIso}"`);
    else raw = raw.replace(/^(publishDate:.*)$/m, `$1\nupdatedDate: "${nowIso}"`);
  }
  writeFileSync(file, raw);
  return title;
}

/**
 * 回傳該篇文章「引用了、但 public/ 下不存在」的本地圖檔清單（封面＋內文）。
 * 用來在 build/check:links 之前就攔下「有引用卻沒存到圖」的半成品，避免一篇壞圖拖垮整批。
 */
function missingLocalAssets(slug) {
  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (!existsSync(file)) return ['（文章檔不存在）'];
  const raw = readFileSync(file, 'utf8');
  const refs = new Set();
  for (const m of raw.matchAll(/(covers|images)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|avif)/gi)) refs.add(m[0]);
  return [...refs].filter((r) => !existsSync(join('public', r)));
}

/** 剔除一篇有問題的文章：UPDATE 還原、NEW 刪除，使它不進這次發佈批次。 */
function dropArticle(slug, action) {
  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (action === 'update') { try { sh('git', ['checkout', '--', file]); } catch { /* 還原失敗就算了 */ } }
  else if (existsSync(file)) { try { rmSync(file); } catch { /* 刪不掉就算了 */ } }
}

/** 跨日 seen 帳本路徑（放 git 工作區外，避免弄髒 repo 踩到「工作區乾淨」檢查）。 */
function seenPath() {
  return (
    process.env.INTL_SEEN_PATH ||
    join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'appi-news', 'international-seen.json')
  );
}
function readSeen() {
  try { return JSON.parse(readFileSync(seenPath(), 'utf8')); } catch { return []; }
}
function writeSeen(entries) {
  try {
    mkdirSync(dirname(seenPath()), { recursive: true });
    writeFileSync(seenPath(), JSON.stringify(entries, null, 2) + '\n');
  } catch (e) { console.log(`  ⚠️ seen 帳本寫入失敗（不致命）：${e.message}`); }
}

const UA = 'Mozilla/5.0 (appi-news intl-radar)';
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
/** 解 HTML 實體：具名（&amp;）＋十進位（&#39;）＋十六進位（&#x27;）。標題常見三種都有。 */
function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (full, name) => {
    const n = name.toLowerCase();
    if (n.startsWith('#x')) { const c = Number.parseInt(n.slice(2), 16); return Number.isFinite(c) ? String.fromCodePoint(c) : full; }
    if (n.startsWith('#')) { const c = Number(n.slice(1)); return Number.isFinite(c) ? String.fromCodePoint(c) : full; }
    return ENTITIES[n] ?? full;
  });
}

/**
 * 抓每則候選原文的 <title>。閘門要判「這是什麼新聞」就得先知道標題——選題端只給了
 * 一個 URL 與 GDELT 標地（而標地經常是錯的）。抓不到就留空，後續各層一律放行不錯殺。
 */
async function fetchTitles(stories, { timeoutMs = 12_000, concurrency = 8 } = {}) {
  const queue = stories.slice();
  const worker = async () => {
    while (queue.length) {
      const s = queue.shift();
      try {
        const res = await fetch(s.sourceUrl, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), headers: { 'user-agent': UA } });
        const html = (await res.text()).slice(0, 200_000);
        const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        s.title = m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim().slice(0, 300) : '';
      } catch { s.title = ''; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  return stories;
}

/**
 * 寫作前三層閘門：同批同事件去重 → 跨日 seen 帳本 → 一次 Haiku 批次篩選。
 * 為什麼＝lib/international-gate.mjs 檔頭（三分之二的寫作呼叫注定產出 SKIP）。
 * 任何一層自己壞掉一律 fail-open，寧可多寫也不要因為閘門讓整晚 0 篇。
 */
async function runGate(stories, recent, today) {
  const total = stories.length;
  console.log(`\n→ 寫作前閘門（候選 ${total} 則）`);
  await fetchTitles(stories);
  const noTitle = stories.filter((s) => !s.title).length;
  if (noTitle) console.log(`  · 抓不到標題 ${noTitle} 則（一律放行）`);

  const d1 = dedupeByEvent(stories);
  for (const { story, dupOf } of d1.dropped) console.log(`  ✂ 同事件重複：${story.title || story.sourceUrl}\n      └ 併入：${dupOf.title || dupOf.sourceUrl}`);

  const d2 = filterSeen(d1.kept, readSeen(), { today });
  for (const { story, seenOn } of d2.dropped) console.log(`  ✂ ${seenOn} 已處理過：${story.title || story.sourceUrl}`);

  let kept = d2.kept;
  if (kept.length) {
    try {
      const verdicts = parseTriage(await runClaudeOnce(buildTriagePrompt(kept, recent), 'haiku', 180_000), kept.length);
      if (!verdicts) {
        console.log('  ⚠️ 批次篩選無法解析 → 全部放行（fail-open）');
      } else {
        const survivors = [];
        kept.forEach((s, i) => {
          const v = verdicts.get(i);
          if (v && v.verdict === 'skip') console.log(`  ✂ 篩選：${s.title || s.sourceUrl}\n      └ ${v.reason}`);
          else survivors.push(s);
        });
        kept = survivors;
      }
    } catch (e) {
      console.log(`  ⚠️ 批次篩選失敗 → 全部放行（fail-open）：${e.message.slice(0, 160)}`);
    }
  }
  console.log(`  ⇒ 通過閘門 ${kept.length}/${total} 則（同事件 ${d1.dropped.length}、已處理過 ${d2.dropped.length}、篩選 ${d2.kept.length - kept.length}）`);
  return kept;
}

/** 跑選題引擎，回 picks {region:[stories]}。 */
function runSelection(hours, maxPer) {
  const r = spawnSync('node', ['scripts/international-select.mjs', '--hours', String(hours), '--max', String(maxPer), '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`選題失敗：${(r.stderr || '').slice(-300)}`);
  return JSON.parse(r.stdout).picks;
}

/** 近 N 天「進行中」國際文：category=international 且 updatedDate||publishDate 在 N 天內。 */
function recentActiveIntl(days = 30) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let files = [];
  try {
    files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const out = [];
  for (const f of files) {
    let data;
    try {
      const txt = readFileSync(join(ARTICLES_DIR, f), 'utf8');
      const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      data = yaml.load(m[1]);
    } catch {
      continue;
    }
    if (!data || data.category !== 'international') continue;
    const when = new Date(data.updatedDate || data.publishDate || 0).getTime();
    if (when >= cutoff) {
      out.push({ slug: f.replace(/\.md$/, ''), title: data.title || '', updatedDate: data.updatedDate || data.publishDate || '' });
    }
  }
  return out.sort((a, b) => (a.updatedDate < b.updatedDate ? 1 : -1));
}

function flattenPicks(picks) {
  const out = [];
  for (const region of Object.keys(picks)) {
    for (const s of picks[region]) out.push({ ...s, region });
  }
  // 最熱的先處理（樣稿有料；--limit 測試時先碰到強題）。
  out.sort((a, b) => b.numSources - a.numSources || b.numArticles - a.numArticles);
  return out;
}

async function main() {
  const hours = Number(arg('hours', '24'));
  const maxPer = Number(arg('max', '3'));
  const limit = Number(arg('limit', '0')); // >0 時只處理前 N 則（測試用）
  const go = has('go');
  const stage = has('stage');

  const picks = runSelection(hours, maxPer);
  let stories = flattenPicks(picks);
  if (limit > 0) stories = stories.slice(0, limit);
  const recent = recentActiveIntl(30);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
  // 安全前置提到閘門之前：工作區不乾淨反正寫不了，別先白燒一次批次篩選呼叫。
  // （隔離模式由 cron 先 reset 到 origin/main；避免把無關改動掃進發佈 commit。）
  if ((go || stage) && sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑（避免把無關改動掃進發佈 commit）');
  stories = await runGate(stories, recent, today);
  if (!stories.length) {
    console.log('\n✓ 閘門後無題可寫（全部重複／已處理過／非國際新聞），本次不動用寫作。');
    return;
  }

  if (!go && !stage) {
    console.log(`— DRY RUN（零副作用）—`);
    console.log(`閘門後 ${stories.length} 則熱題（近 ${hours}h，每區最多 ${maxPer}）：`);
    for (const s of stories) {
      console.log(`  [${s.region}] ${s.numSources}家/${s.numArticles}篇 | ${s.fullName}`);
      console.log(`     ${s.sourceUrl}`);
    }
    console.log(`\n近 30 天進行中國際文：${recent.length} 篇`);
    if (stories.length) {
      console.log('\n===== 第一則的完整 Claude 寫作指令（其餘同模板）=====\n');
      console.log(buildIntlPrompt(stories[0], recent));
    }
    return;
  }

  // --go / --stage：真正寫作（工作區乾淨已在閘門前檢查過）。
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 國際編譯：${stories.length} 則，分支 ${branch}（${go ? '寫作後 push 上線' : 'stage 不 push'}）`);

  // 時間預算：預設「不限」，選到的題全部跑完。
  // 歷史：這個預算原本（2026-06-23 fa9d4f1）只是為了閃避 cron 外層的 `timeout 1200s`——被砍在
  // 迴圈中途會整批 0 上架。那個外層 timeout 已於 2026-07-09（1e2a901）移除，護欄的對象消失，
  // 預算卻留著，變成純粹的減產器：每則要 6~9 分，540s 等於每晚只跑得動 1~2 則，第一則失手
  // 就整天 0 篇（2026-07-27 事故）。站長 2026-07-28 裁示拿掉。
  // 仍留 INTL_TIME_BUDGET_MS 當緊急手煞車（>0 才生效），失控時不必改碼就能收斂。
  const budgetMs = Number(process.env.INTL_TIME_BUDGET_MS || 0);
  const start = Date.now();
  const results = [];
  let skipped = 0;
  // 基礎設施級失敗（模型沒吐出可解析的 INTL_RESULT）耗掉的時間不計入預算——那不是產出，
  // 讓它吃掉預算等於「單則失手＝整天 0 篇」（2026-07-27 事故）。但整體壞掉（帳號/網路）時
  // 也不能無限空燒，故設總次數上限。
  let wastedMs = 0;
  let infraFails = 0;
  const MAX_INFRA_FAILS = 3;
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    if (i > 0 && budgetMs > 0 && Date.now() - start - wastedMs > budgetMs) {
      skipped = stories.length - i;
      // 註：沒有「接續」這回事——下一輪是重新抓一個新視窗重選，未處理的題若仍夠熱才會再出現。
      console.log(`\n⏳ 手煞車 INTL_TIME_BUDGET_MS（${Math.round(budgetMs / 1000)}s）用盡：本輪處理 ${i} 則，其餘 ${skipped} 則不處理（下輪重新選題）。`);
      break;
    }
    const prompt = buildIntlPrompt(s, recent);
    console.log(`\n→ [${s.region}] ${s.numSources}家 | ${s.fullName}`);
    const t0 = Date.now();
    const r = spawnSync('claude-appi', ['--model', 'claude-sonnet-5', '-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const stdout = r.stdout || '';
    // 撞用量上限是「帳號層級」：這則被擋，本批剩下每則都會被擋。限流訊息秒回（吃不到時間預算），
    // 若照單則錯誤 continue 下去會把整批 20+ 則狂打成空跑（見 docs/lessons）。→ 立刻中止整批。
    // claude-appi 撞上限時會 exit 0 只印限額訊息 → 必須查 stdout，不能只看 exit code。
    if (/hit your .*limit|weekly limit|usage limit/i.test(stdout)) {
      skipped = stories.length - i;
      console.log(`  ⛔ 撞用量上限，中止本輪（剩 ${skipped} 則不處理；額度重置後由下輪重新選題）：${stdout.slice(-160)}`);
      break;
    }
    // 其餘（單則 API error / 拒答）才跳過這一則、續跑下一則。
    if (r.error || r.status !== 0 || /API Error|Usage Policy|unable to respond/i.test(stdout)) { console.log(`  ⚠️ claude 失敗（跳過此則）：${(r.stderr || stdout || r.error?.message || '').slice(-200)}`); results.push({ s, action: 'error' }); continue; }
    const v = parseIntlResult(r.stdout);
    // 沒有可解析的 INTL_RESULT＝基礎設施級失敗，不是「編輯判斷跳過」，兩件事要分開處理：
    //  ① 模型很可能已經把稿寫進工作區（讀原文/交叉查證的 token 早就燒完了），照舊碼會隨
    //     worktree 一起被丟掉 → 這裡撿回來，一樣走底下的缺圖／去 AI 腔／check:links 各關。
    //  ② 這一則耗掉的時間不算進預算，續跑下一則，別讓單則失手變成整批 0 篇。
    if (v.infra) {
      wastedMs += Date.now() - t0;
      infraFails += 1;
      const found = salvageArticle(ARTICLES_DIR, results.map((x) => x.slug).filter(Boolean));
      if (found) {
        console.log(`  ⚠️ 無 INTL_RESULT，但工作區有寫好的 ${found.slug}（${found.action}）→ 撿回，續走既有關卡`);
        results.push({ s, action: found.action, slug: found.slug, note: '模型漏報 INTL_RESULT，由工作區撿回' });
      } else {
        console.log(`  SKIP｜${v.note}（工作區沒有可歸屬的稿）`);
        results.push({ s, ...v });
      }
      if (infraFails >= MAX_INFRA_FAILS) {
        skipped = stories.length - i - 1;
        console.log(`\n⛔ 基礎設施級失敗累計 ${infraFails} 次，中止本輪（剩 ${skipped} 則不處理，下輪重新選題），不空燒。`);
        break;
      }
      continue;
    }
    console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);
    results.push({ s, ...v });
  }

  // 記進 seen 帳本：只記「真的走完寫作端、拿到明確結論」的題（寫了／模型判定跳過）。
  // 基礎設施級失敗與 API error 不記，明天才會重試——那不是結論，是故障。
  const decided = results.filter((x) => x.action !== 'error' && !x.infra).map((x) => x.s);
  if (decided.length) writeSeen(mergeSeen(readSeen(), decided, today));

  // 有產出才往下（check:links → 一次 commit → push）。一天一批一個 commit、一次部署。
  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  let wrote = results.filter((x) => x.action === 'new' || x.action === 'update');
  // 逐篇驗證引用的本地圖檔（封面＋內文）真的存在；缺圖的整篇剔除，不讓一篇壞圖在 check:links
  // 把整批一起擋掉（呼應「沒圖就不發」：封面是動筆前的前置關卡，但 AI 不穩，這裡是程式保險）。
  for (const x of wrote.slice()) {
    if (!x.slug) continue;
    const missing = missingLocalAssets(x.slug);
    if (missing.length) {
      console.log(`  ⚠️ 剔除 ${x.slug}：缺本地圖檔（${missing.join('、')}），不發這篇、不拖垮整批`);
      dropArticle(x.slug, x.action);
      wrote = wrote.filter((w) => w !== x);
      continue;
    }
    // 去 AI 腔硬 gate：命中機械可判的簽名句（破折號／自我辯白旁白）就剔除這篇，不拖垮整批。
    // 為什麼＝docs/lessons/ai-tone-gate.md。
    // 成長規則自檢（report-only，永不擋發佈）：站內導流／topics／標題長度有沒有做到，印進 cron log 供事後回收。
    // 規則正本＝scripts/lib/growth-prompt.mjs（GROWTH_PROMPT），盤點與工作清單＝docs/growth-playbook.md。
    const _growth = spawnSync('node', ['scripts/growth-lint.mjs', join(ARTICLES_DIR, `${x.slug}.md`)], { encoding: 'utf8' });
    if (_growth.stdout) console.log(_growth.stdout.trim());
    const _tags = spawnSync('node', ['scripts/check-tags.mjs', join(ARTICLES_DIR, `${x.slug}.md`)], { encoding: 'utf8' });
    if (_tags.status !== 0) {
      console.log(`  ⚠️ 剔除 ${x.slug}：標籤不在受控詞彙表，不發這篇、不拖垮整批\n${_tags.stdout || _tags.stderr || ''}`);
      dropArticle(x.slug, x.action);
      continue;
    }
    const _tone = spawnSync('node', ['scripts/check-content.mjs', join(ARTICLES_DIR, `${x.slug}.md`)], { encoding: 'utf8' });
    if (_tone.status !== 0) {
      console.log(`  ⚠️ 剔除 ${x.slug}：去 AI 腔硬 tell，不發這篇、不拖垮整批\n${_tone.stdout || _tone.stderr || ''}`);
      dropArticle(x.slug, x.action);
      wrote = wrote.filter((w) => w !== x);
      continue;
    }
    // 封面規格 gate（橫式 ≥1200，Discover 大圖門檻）：embed 直式原圖曾從這條線連漏六週。
    // 為什麼＝docs/lessons/discover-image-and-meta-signals.md（2026-08-11 追記）。
    const _cover = spawnSync('node', ['scripts/check-cover-spec.mjs', join(ARTICLES_DIR, `${x.slug}.md`)], { encoding: 'utf8' });
    if (_cover.status !== 0) {
      console.log(`  ⚠️ 剔除 ${x.slug}：封面不符 Discover 規格，不發這篇、不拖垮整批\n${_cover.stdout || _cover.stderr || ''}`);
      dropArticle(x.slug, x.action);
      wrote = wrote.filter((w) => w !== x);
      continue;
    }
  }
  if (!produced || wrote.length === 0) {
    console.log(`\n✓ 本批無有效產出（全部跳過/無進展，或缺圖被剔除）。`);
    return;
  }
  // 用系統時間蓋掉模型寫的 publishDate/updatedDate（模型常排成未來整點 → 不立即上線），
  // 並順手取回每篇 title 供 Slack 回報。必須在 build/commit 之前。
  const nowIso = new Date().toISOString();
  for (const x of wrote) if (x.slug) x.title = stampDateAndTitle(x.slug, x.action, nowIso);
  // worktree 無殘留 dist → 先 build 再 check:links；失敗時同步最新 main 自癒重試一次（並發防護，不序列化）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }

  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  const newN = wrote.filter((x) => x.action === 'new').length;
  const updN = wrote.filter((x) => x.action === 'update').length;
  sh('git', ['commit', '-m', `feat(international): 國際編譯自動產文（新 ${newN}、更新 ${updN}）\n\nGDELT 選題＋事實編譯，編輯部署名、附原文出處。`]);
  if (go) {
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    console.log(`✓ 已上線：新 ${newN}、更新 ${updN} 篇。`);
    for (const x of wrote) if (x.slug) console.log(`PUBLISHED=https://appi.news/articles/${x.slug}/ ｜ ${x.title || x.slug}`);
  } else {
    console.log(`✓ 已 stage（commit 在 ${branch}，未 push）：新 ${newN}、更新 ${updN} 篇。`);
    for (const x of wrote) if (x.slug) console.log(`STAGED=${x.slug} ｜ ${x.title || x.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  });
}
