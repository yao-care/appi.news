// 警消好人好事協調器：掃各地警局新聞稿 → Claude 寫暖聞 roundup → 自動上架。
// 純寫作邏輯在 scripts/lib/lifestyle-police.mjs。一週一次由 cron 呼叫。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push；--go 寫+commit+push 上架。
//   node scripts/lifestyle-police.mjs            # dry-run
//   node scripts/lifestyle-police.mjs --stage    # 產樣稿（不上線）
//   node scripts/lifestyle-police.mjs --go        # 自動上架

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { buildPolicePrompt, parsePoliceResult } from './lib/lifestyle-police.mjs';
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

/** 回傳該篇引用了、但 public/ 下不存在的本地圖檔（封面＋內文）。空陣列＝都在。 */
function missingLocalAssets(slug) {
  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (!existsSync(file)) return ['（文章檔不存在）'];
  const raw = readFileSync(file, 'utf8');
  const refs = new Set();
  for (const m of raw.matchAll(/(covers|images)\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g|avif)/gi)) refs.add(m[0]);
  return [...refs].filter((r) => !existsSync(join('public', r)));
}

/** 讀文章 title（給 Slack 回報帶標題用）。 */
function articleTitle(slug) {
  try {
    const m = readFileSync(join(ARTICLES_DIR, `${slug}.md`), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return (m && (yaml.load(m[1]) || {}).title) || '';
  } catch { return ''; }
}

/** 近 N 天已發的警消好人好事整理（slug 以 police-good-deeds 起頭）標題，給去重。 */
function recentPoliceTitles(days = 30) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let files = [];
  try { files = readdirSync(ARTICLES_DIR).filter((f) => f.startsWith('police-good-deeds') && f.endsWith('.md')); } catch { return []; }
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

function main() {
  const go = has('go');
  const stage = has('stage');
  const recent = recentPoliceTitles(30);
  const prompt = buildPolicePrompt(recent, 7);

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 30 天已發好人好事整理：${recent.length} 篇`);
    console.log('\n===== Claude 寫作指令 =====\n');
    console.log(prompt);
    return;
  }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 警消好人好事整理（分支 ${branch}，${go ? '上架' : 'stage 不 push'}）`);
  const r = spawnSync('claude-appi', ['-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error || r.status !== 0) die(`claude 失敗：${(r.stderr || r.error?.message || '').slice(-200)}`);
  const v = parsePoliceResult(r.stdout);
  console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  if (v.action !== 'new' || !produced) { console.log('✓ 本次無產出（各家抓不到或無合格好人好事）。'); return; }

  // 用系統時間蓋掉模型寫的 publishDate（模型無可靠時鐘，常把「現在」填成未來整點 → 變排程稿、
  // 不立即上線）。警消是全自動即時發，必須當下上線（同 international-write 的處理）。
  if (v.slug) {
    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${new Date().toISOString()}"`));
  }

  // 缺圖驗證：引用了卻沒存到檔的本地圖（封面／內文）→ 不發（避免 check:links 壞連結）。
  // 警消封面可有可無，但「設了 coverImage 就要有檔」；缺就中止、留工作區待查。
  if (v.slug) {
    const missing = missingLocalAssets(v.slug);
    if (missing.length) die(`引用的本地圖檔不存在（${missing.join('、')}），不發佈（改動留工作區）`);
  }

  // worktree 無殘留 dist → 先 build 再 check:links；失敗時同步最新 main 自癒重試一次（並發防護，不序列化）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', `feat(article): 警消好人好事整理\n\n整理自各地警察局公開新聞稿、附原文出處、編輯部署名。`]);
  if (go) {
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    console.log('✓ 已上架。');
    if (v.slug) console.log(`PUBLISHED=https://appi.news/articles/${v.slug}/ ｜ ${articleTitle(v.slug) || v.slug}`);
  } else {
    console.log('✓ 已 stage（未 push）。');
    if (v.slug) console.log(`STAGED=${v.slug} ｜ ${articleTitle(v.slug) || v.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (e) { die(e.message); }
}
