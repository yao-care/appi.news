// 便民市政協調器：抓各縣市政府 RSS → 濾掉已見 → Claude 跨縣市統整一篇 → 自動上架。
// 純寫作邏輯在 scripts/lib/lifestyle-civic.mjs；抓取在 scripts/lib/civic-fetch.mjs；去重帳本在
// scripts/lib/civic-ledger.mjs。每日由 cron 呼叫（台北 18:00 = UTC 10:00）。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push、不記帳本；--go 寫+commit+push 上架＋記帳本。
//   node scripts/lifestyle-civic.mjs            # dry-run
//   node scripts/lifestyle-civic.mjs --stage    # 產樣稿（不上線、不動帳本）
//   node scripts/lifestyle-civic.mjs --go        # 自動上架
//
// 「有新資料才寫」：候選經帳本濾掉近 30 天見過的；濾完為 0 → 不呼叫 LLM、安靜結束。

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { buildCivicPrompt, parseCivicResult } from './lib/lifestyle-civic.mjs';
import { fetchCivicCandidates } from './lib/civic-fetch.mjs';
import { loadSeen, filterNew, recordSeen } from './lib/civic-ledger.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';

const ARTICLES_DIR = 'src/content/articles';
const has = (n) => process.argv.includes(`--${n}`);
function die(m) { console.error(`✖ ${m}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

/** 該篇引用了、但 public/ 下不存在的本地圖檔。空陣列＝都在。 */
function missingLocalAssets(slug) {
  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (!existsSync(file)) return ['（文章檔不存在）'];
  const raw = readFileSync(file, 'utf8');
  const refs = new Set();
  for (const m of raw.matchAll(/(covers|images)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|avif)/gi)) refs.add(m[0]);
  return [...refs].filter((r) => !existsSync(join('public', r)));
}

function articleTitle(slug) {
  try {
    const m = readFileSync(join(ARTICLES_DIR, `${slug}.md`), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return (m && (yaml.load(m[1]) || {}).title) || '';
  } catch { return ''; }
}

/** 近 N 天已發的便民整理（slug 以 civic-services 起頭）標題，給去重。 */
function recentCivicTitles(days = 14) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let files = [];
  try { files = readdirSync(ARTICLES_DIR).filter((f) => f.startsWith('civic-services') && f.endsWith('.md')); } catch { return []; }
  const out = [];
  for (const f of files) {
    try {
      const m = readFileSync(join(ARTICLES_DIR, f), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      const d = yaml.load(m[1]);
      if (new Date(d.publishDate || 0).getTime() >= cutoff) out.push(d.title || f);
    } catch { /* skip */ }
  }
  return out;
}

async function main() {
  const go = has('go');
  const stage = has('stage');
  const recent = recentCivicTitles(14);

  console.log('→ 固定抓取各縣市政府便民 RSS 候選中（零 LLM）…');
  const { candidates, stats } = await fetchCivicCandidates({ days: 2, log: (m) => console.log(m) });
  const seen = loadSeen();
  const fresh = filterNew(candidates, seen);
  console.log(`抓到 ${stats.reached} 站（涵蓋 ${stats.areas.length} 縣市）；便民候選 ${candidates.length} 則，濾掉已見後新候選 ${fresh.length} 則。`);
  for (const c of fresh) console.log(`CANDIDATE=${c.area}｜${c.title}｜${c.url}`);
  const prompt = buildCivicPrompt(fresh, recent);

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 14 天已發：${recent.length} 篇；新候選：${fresh.length} 則`);
    console.log('\n===== Claude 寫作指令 =====\n');
    console.log(prompt);
    return;
  }

  // 有新資料才寫：新候選為 0 → 不呼叫 LLM，安靜結束（符合站長「沒新資料就不寫」）。
  if (!fresh.length) { console.log('✓ 本次無新便民資料（各站近 2 天無新的便民措施），不呼叫 LLM，安靜結束。'); return; }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 便民市政整理（分支 ${branch}，${go ? '上架' : 'stage 不 push'}）`);
  const r = spawnSync('claude-appi', ['--model', 'claude-sonnet-5', '-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  // claude-appi 撞用量上限時 exit 0 只印限額訊息 → 必須查 stdout（infra 失敗，不記帳本、下輪重試）。
  if (r.error || r.status !== 0 || /API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit/i.test(r.stdout || '')) {
    die(`claude 失敗：${(r.stderr || r.stdout || r.error?.message || '').slice(-200)}`);
  }
  const v = parseCivicResult(r.stdout);
  console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  if (v.action !== 'new' || !produced) {
    // Claude 判定無合適便民措施：把這批新候選記進帳本（已判過、不再重覆提供）——僅 --go。
    if (go) recordSeen(fresh);
    console.log('✓ 本次無產出（無合適便民措施或未寫檔）。');
    return;
  }

  // 用系統時間蓋掉模型寫的 publishDate（模型無可靠時鐘，常把「現在」填成未來 → 變排程稿）。
  if (v.slug) {
    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${new Date().toISOString()}"`));
  }

  // 缺圖驗證：引用了卻沒存到檔 → 不發（避免 check:links 壞連結）。封面可有可無，但設了就要有檔。
  if (v.slug) {
    const missing = missingLocalAssets(v.slug);
    if (missing.length) die(`引用的本地圖檔不存在（${missing.join('、')}），不發佈（改動留工作區）`);
    // 去 AI 腔硬 gate：機械可判的簽名句（破折號／自我辯白旁白）命中就不發，留工作區待改。
    // 為什麼＝docs/lessons/ai-tone-gate.md。
    const _tone = spawnSync('node', ['scripts/check-ai-tone.mjs', join(ARTICLES_DIR, `${v.slug}.md`)], { encoding: 'utf8' });
    if (_tone.status !== 0) die(`去 AI 腔 gate 未過，不發佈（改動留工作區待改）：\n${_tone.stdout || _tone.stderr || ''}`);
  }

  // worktree 無殘留 dist → 先 build 再 check:links；失敗同步最新 main 自癒重試一次（並發防護）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', `feat(article): 便民市政整理\n\n整理自各縣市政府公開新聞稿/公告、附原文出處、編輯部署名。`]);
  if (go) {
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    recordSeen(fresh); // 上架成功才記帳本（發佈失敗則保留、下輪重試）
    console.log('✓ 已上架。');
    if (v.slug) console.log(`PUBLISHED=https://appi.news/articles/${v.slug}/ ｜ ${articleTitle(v.slug) || v.slug}`);
  } else {
    console.log('✓ 已 stage（未 push、未記帳本）。');
    if (v.slug) console.log(`STAGED=${v.slug} ｜ ${articleTitle(v.slug) || v.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
