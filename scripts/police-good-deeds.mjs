// 警消好人好事協調器：掃各地警局新聞稿 → Claude 寫暖聞 roundup → 自動上架。
// 純寫作邏輯在 scripts/lib/police-good-deeds.mjs。一週一次由 cron 呼叫。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push；--go 寫+commit+push 上架。
//   node scripts/police-good-deeds.mjs            # dry-run
//   node scripts/police-good-deeds.mjs --stage    # 產樣稿（不上線）
//   node scripts/police-good-deeds.mjs --go        # 自動上架

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { buildPolicePrompt, parsePoliceResult } from './lib/police-good-deeds.mjs';

const ARTICLES_DIR = 'src/content/articles';
const has = (n) => process.argv.includes(`--${n}`);
function die(m) { console.error(`✖ ${m}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
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
  const r = spawnSync('claude', ['-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error || r.status !== 0) die(`claude 失敗：${(r.stderr || r.error?.message || '').slice(-200)}`);
  const v = parsePoliceResult(r.stdout);
  console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  if (v.action !== 'new' || !produced) { console.log('✓ 本次無產出（各家抓不到或無合格好人好事）。'); return; }

  console.log('→ pnpm check:links');
  try { sh('pnpm', ['check:links'], { stdio: 'inherit' }); }
  catch (e) { die(`check:links 未過，不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', `feat(article): 警消好人好事整理\n\n整理自各地警察局公開新聞稿、附原文出處、編輯部署名。`]);
  if (go) {
    sh('git', ['push']);
    console.log(`✓ 已上架。${v.slug ? `PUBLISHED=https://appi.news/articles/${v.slug}/` : ''}`);
  } else {
    console.log(`✓ 已 stage（未 push）。STAGED=${v.slug || ''}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (e) { die(e.message); }
}
