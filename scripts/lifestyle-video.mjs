// 影片心得協調器：抓訂閱 YouTube 頻道 RSS → 濾掉已看過 → Claude 挑一支＋交叉查證＋寫一篇 → 自動上架。
// 寫作純邏輯在 scripts/lib/lifestyle-video.mjs；抓取在 scripts/lib/video-fetch.mjs；
// 去重帳本在 scripts/lib/video-ledger.mjs。每日由 cron 呼叫（台北 20:00 = UTC 12:00）。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push、不記帳本；--go 寫+commit+push 上架＋記帳本。
//   node scripts/lifestyle-video.mjs            # dry-run
//   node scripts/lifestyle-video.mjs --stage    # 產樣稿（不上線、不動帳本）
//   node scripts/lifestyle-video.mjs --go       # 自動上架
//
// 「有新片才寫」：候選經帳本濾掉近 60 天看過的；濾完為 0 → 不呼叫 LLM、安靜結束。

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { buildVideoPrompt, parseVideoResult } from './lib/lifestyle-video.mjs';
import { fetchVideoCandidates } from './lib/video-fetch.mjs';
import { loadSeen, filterNew, recordSeen } from './lib/video-ledger.mjs';
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

function frontmatter(file) {
  try {
    const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return m ? (yaml.load(m[1]) || {}) : null;
  } catch { return null; }
}

function articleTitle(slug) {
  return (frontmatter(join(ARTICLES_DIR, `${slug}.md`)) || {}).title || '';
}

/**
 * 近 N 天這條線已發過的標題，給去重。
 * 這條線的 slug 是主題式的（沒有固定前綴），改以「正文帶影片出處卡」當識別。
 */
function recentVideoTitles(days = 14) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let files = [];
  try { files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md')); } catch { return []; }
  const out = [];
  for (const f of files) {
    const path = join(ARTICLES_DIR, f);
    let raw = '';
    try { raw = readFileSync(path, 'utf8'); } catch { continue; }
    if (!raw.includes('class="video-embed"')) continue;
    const d = frontmatter(path);
    if (d && new Date(d.publishDate || 0).getTime() >= cutoff) out.push(d.title || f);
  }
  return out;
}

async function main() {
  const go = has('go');
  const stage = has('stage');
  const recent = recentVideoTitles(14);

  console.log('→ 固定抓取訂閱頻道的 YouTube RSS 候選中（零 LLM）…');
  const { candidates, stats } = await fetchVideoCandidates({ days: 2, log: (m) => console.log(m) });
  const seen = loadSeen();
  const fresh = filterNew(candidates, seen);
  console.log(`抓到 ${stats.reached} 個頻道（${stats.channels.join('、') || '無'}）；生活線候選 ${candidates.length} 支，濾掉已看過後新候選 ${fresh.length} 支。`);
  for (const c of fresh) console.log(`CANDIDATE=${c.source}｜${c.title}｜${c.url}`);
  const prompt = buildVideoPrompt(fresh, recent);

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 14 天已發：${recent.length} 篇；新候選：${fresh.length} 支`);
    console.log('\n===== Claude 寫作指令 =====\n');
    console.log(prompt);
    return;
  }

  // 有新片才寫：新候選為 0 → 不呼叫 LLM，安靜結束。
  if (!fresh.length) { console.log('✓ 本次無新影片候選（訂閱頻道近 2 天無新的生活線影片），不呼叫 LLM，安靜結束。'); return; }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 影片心得整理（分支 ${branch}，${go ? '上架' : 'stage 不 push'}）`);
  const r = spawnSync('claude-appi', ['--model', 'claude-sonnet-5', '-p', prompt], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  // claude-appi 撞用量上限時 exit 0 只印限額訊息 → 必須查 stdout（infra 失敗，不記帳本、下輪重試）。
  if (r.error || r.status !== 0 || /API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit/i.test(r.stdout || '')) {
    die(`claude 失敗：${(r.stderr || r.stdout || r.error?.message || '').slice(-200)}`);
  }
  const v = parseVideoResult(r.stdout);
  console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  if (v.action !== 'new' || !produced) {
    // Claude 判定沒有通得過查證 gate 的題：把這批候選記進帳本（已判過、不再重覆提供）——僅 --go。
    if (go) recordSeen(fresh);
    console.log('✓ 本次無產出（無合適題目或未寫檔）。');
    return;
  }

  // 用系統時間蓋掉模型寫的 publishDate（模型無可靠時鐘，常把「現在」填成未來 → 變排程稿）。
  if (v.slug) {
    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${new Date().toISOString()}"`));
  }

  if (v.slug) {
    // 缺圖驗證：引用了卻沒存到檔 → 不發（避免 check:links 壞連結）。
    const missing = missingLocalAssets(v.slug);
    if (missing.length) die(`引用的本地圖檔不存在（${missing.join('、')}），不發佈（改動留工作區）`);
    // 去 AI 腔硬 gate（為什麼＝docs/lessons/ai-tone-gate.md）。
    const tone = spawnSync('node', ['scripts/check-content.mjs', join(ARTICLES_DIR, `${v.slug}.md`)], { encoding: 'utf8' });
    if (tone.status !== 0) die(`去 AI 腔 gate 未過，不發佈（改動留工作區待改）：\n${tone.stdout || tone.stderr || ''}`);
  }

  // worktree 無殘留 dist → 先 build 再 check:links；失敗同步最新 main 自癒重試一次（並發防護）。
  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }
  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m', 'feat(article): 影片線索整理\n\n線索來自訂閱 YouTube 頻道，事實經公開來源交叉查證、附出處，編輯部署名。']);
  if (go) {
    const pr = pushToMain({ cwd: process.cwd() });
    if (!pr.ok) die(`推送 main 失敗：${pr.err}`);
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
