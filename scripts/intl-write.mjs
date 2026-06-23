// 國際編譯台協調器：選題（intl-select）→ 每則熱題交給 Claude 寫作/更新 → 上架。
// 純寫作邏輯在 scripts/lib/intl-write.mjs（可測）。
//
// 安全：預設 dry-run（只印「選到的題 + 要餵給 Claude 的寫作指令」，零副作用、零寫作）。
//   node scripts/intl-write.mjs                 # dry-run：印選題 + 第一則的完整寫作指令
//   node scripts/intl-write.mjs --go            # （待審核寫作指令後啟用）真的寫作並上架
//
// 一天一次由 cron 呼叫。

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { buildIntlPrompt, parseIntlResult } from './lib/intl-write.mjs';
import { pushToMain } from './lib/git-publish.mjs';

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

/** 跑選題引擎，回 picks {region:[stories]}。 */
function runSelection(hours, maxPer) {
  const r = spawnSync('node', ['scripts/intl-select.mjs', '--hours', String(hours), '--max', String(maxPer), '--json'], {
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

function main() {
  const hours = Number(arg('hours', '24'));
  const maxPer = Number(arg('max', '3'));
  const limit = Number(arg('limit', '0')); // >0 時只處理前 N 則（測試用）
  const go = has('go');
  const stage = has('stage');

  const picks = runSelection(hours, maxPer);
  let stories = flattenPicks(picks);
  if (limit > 0) stories = stories.slice(0, limit);
  const recent = recentActiveIntl(30);

  if (!go && !stage) {
    console.log(`— DRY RUN（零副作用）—`);
    console.log(`選到 ${stories.length} 則熱題（近 ${hours}h，每區最多 ${maxPer}）：`);
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

  // --go / --stage：真正寫作。安全前置：工作區乾淨（隔離模式由 cron 先 reset 到 origin/main）。
  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑（避免把無關改動掃進發佈 commit）');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 國際編譯：${stories.length} 則，分支 ${branch}（${go ? '寫作後 push 上線' : 'stage 不 push'}）`);

  // 時間預算：每則寫作約 6~7 分鐘，cron 外層 timeout 1200s。預設只在「開新題前」still 在
  // 預算內才續寫，故必須讓「預算 + 一則最久耗時 + 尾段(check:links/commit/push)」< 1200s，
  // 否則會像之前那樣被 timeout 砍在迴圈中途、整批 0 上架。預設 600s（env 可調）。
  const budgetMs = Number(process.env.INTL_TIME_BUDGET_MS || 600_000);
  const start = Date.now();
  const results = [];
  let skipped = 0;
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    if (i > 0 && Date.now() - start > budgetMs) {
      skipped = stories.length - i;
      console.log(`\n⏳ 時間預算（${Math.round(budgetMs / 1000)}s）用盡：本批處理 ${i} 則，其餘 ${skipped} 則留下次 cron 接續（避免被外層 timeout 砍在中途）。`);
      break;
    }
    const prompt = buildIntlPrompt(s, recent);
    console.log(`\n→ [${s.region}] ${s.numSources}家 | ${s.fullName}`);
    const r = spawnSync('claude', ['-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.error || r.status !== 0) { console.log(`  ⚠️ claude 失敗：${(r.stderr || r.error?.message || '').slice(-200)}`); results.push({ s, action: 'error' }); continue; }
    const v = parseIntlResult(r.stdout);
    console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);
    results.push({ s, ...v });
  }

  // 有產出才往下（check:links → 一次 commit → push）。一天一批一個 commit、一次部署。
  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  const wrote = results.filter((x) => x.action === 'new' || x.action === 'update');
  if (!produced) {
    console.log(`\n✓ 本批無產出（全部跳過/無進展）。new/update=${wrote.length}`);
    return;
  }
  console.log('\n→ pnpm check:links');
  try { sh('pnpm', ['check:links'], { stdio: 'inherit' }); }
  catch (e) { die(`check:links 未過，不發佈（改動留工作區）：${e.message}`); }

  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  const newN = wrote.filter((x) => x.action === 'new').length;
  const updN = wrote.filter((x) => x.action === 'update').length;
  sh('git', ['commit', '-m', `feat(international): 國際編譯自動產文（新 ${newN}、更新 ${updN}）\n\nGDELT 選題＋事實編譯，編輯部署名、附原文出處。`]);
  if (go) {
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    console.log(`✓ 已上線：新 ${newN}、更新 ${updN} 篇。`);
    for (const x of wrote) if (x.slug) console.log(`PUBLISHED=https://appi.news/articles/${x.slug}/`);
  } else {
    console.log(`✓ 已 stage（commit 在 ${branch}，未 push）：新 ${newN}、更新 ${updN} 篇。`);
    for (const x of wrote) if (x.slug) console.log(`STAGED=${x.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
}
