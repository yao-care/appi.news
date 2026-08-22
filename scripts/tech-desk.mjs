// 科技台協調器：GSC 訊號 → Claude 寫科技稿（兩條 track）→ 自動上架（tech 分類）。
// 純寫作邏輯與選題判準在 scripts/lib/tech-desk.mjs。每日由 cron 呼叫。
//
// 為什麼要有這條線：tech 原本只有 tech-radar（產候選 → Slack 按鈕 → 人挑 → newsroom-write），
// 沒有自動產文線。兩條 track 由站長指定：
//   --track editorial  APPI 編輯部：事實型概念解釋（是什麼／怎麼運作／台灣現況）
//   --track lightman   張饒輝《AI 醫療現場》專欄：AI×健康觀點
// 不帶 --track 時**兩條都跑各一篇**（cron 預設）。
//
// 安全：預設 dry-run（只印寫作指令）。--stage 寫+commit 不 push；--go 寫+commit+push 上架。
//   node scripts/tech-desk.mjs                                  # dry-run（兩 track）
//   node scripts/tech-desk.mjs --track lightman                 # dry-run（單 track）
//   node scripts/tech-desk.mjs --track editorial --topic "…" --go   # 指定題目並上架
//
// --topic：跳過自動選題，照指定方向寫（補寫既有缺口用）。

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildTechDeskPrompt, parseTechDeskResult, TECH_TRACKS } from './lib/tech-desk.mjs';
import { runWriterArticle } from './lib/writer-cli.mjs'; // 寫作＝codex（站長 2026-08-22 裁示），查核仍走 claude-cli
import { runArticleGates } from './lib/publish-pipeline.mjs';
import { articleTitle, recentTitles } from './lib/article-index.mjs';
import { salvageArticle } from './lib/changed-articles.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';

const ARTICLES_DIR = 'src/content/articles';
const has = (n) => process.argv.includes(`--${n}`);
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : '';
};
function die(m) { console.error(`✖ ${m}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

/** 近 N 天已發的 tech 文章標題，給去重（索引正本＝lib/article-index.mjs）。 */
const recentTechTitles = (days = 30) => recentTitles({ days, filter: (e) => e.data.category === 'tech' });

/**
 * GSC 訊號：差一步的 tech 頁（pos 10.5~20.5）＋有需求沒吃到點擊的 query。
 * **fail-open**：缺金鑰／無網路／解析失敗一律回空，選題退回判準一與四，不讓訊號變單點故障。
 */
function techSignals() {
  try {
    const env = { ...process.env };
    const key = `${process.env.HOME}/.config/appi-news/ga4-sa.json`;
    if (!env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(key)) env.GOOGLE_APPLICATION_CREDENTIALS = key;
    const r = spawnSync('node', ['scripts/seo-opportunities.mjs'], { encoding: 'utf8', env, maxBuffer: 16 * 1024 * 1024 });
    if (r.status !== 0) return { striking: [], demand: [], evergreen: [] };
    const out = JSON.parse(r.stdout);
    const striking = (out.pageOpportunities || [])
      .filter((p) => p.category === 'tech')
      .slice(0, 6)
      .map((p) => `${decodeURIComponent(p.page).replace(/^https?:\/\/[^/]+/, '')}（曝光 ${p.impressions}、pos ${p.position}）`);
    const demand = (out.searchDemandTopics || [])
      .slice(0, 12)
      .map((q) => `${q.query}（曝光 ${q.impressions}、目前最好 pos ${q.bestPosition}）`);
    // 常青需求：跨窗複現的字。判準一（三個月後還有人搜嗎）本來只能靠模型猜，這是實測答案。
    const evergreen = (out.evergreenDemandTopics || [])
      .slice(0, 12)
      .map((q) => `${q.query}（${q.windows} 個月都有人搜、曝光 ${q.impressions}、目前最好 pos ${q.bestPosition}）`);
    return { striking, demand, evergreen };
  } catch {
    return { striking: [], demand: [], evergreen: [] };
  }
}

function runTrack(track, { go, topic, recent, signals, wrote }) {
  const prompt = buildTechDeskPrompt({
    track,
    recentTitles: recent,
    striking: signals.striking,
    demand: signals.demand,
    evergreen: signals.evergreen,
    topic,
  });
  console.log(`\n→ ${TECH_TRACKS[track].label}…`);
  // 成功判定三態的正本＝lib/claude-cli.mjs：quota 是帳號層級，回傳給 main 停掉剩下的 track（別空打）。
  const c = runWriterArticle({ prompt });
  if (c.kind === 'quota') { console.log(`  ⛔ 撞用量上限：${c.detail}`); return 'quota'; }
  if (c.kind === 'fail') { console.log(`  ⚠️ claude 失敗：${c.detail}`); return false; }
  const v = parseTechDeskResult(c.stdout);
  if (v.infra) {
    // 解析不出＝故障，不是「沒題」：模型可能已把稿寫在工作區，撿回來走既有關卡。
    const found = salvageArticle(ARTICLES_DIR, wrote.map((w) => w.slug).filter(Boolean));
    if (found && found.action === 'new') {
      console.log(`  ⚠️ 無 TECH_RESULT，但工作區有寫好的 ${found.slug} → 撿回`);
      wrote.push({ action: 'new', slug: found.slug, track });
      return true;
    }
    console.log(`  ⚠️ ${v.note}（工作區沒有可歸屬的稿）`);
    return false;
  }
  console.log(`  ${v.action.toUpperCase()}｜${v.note}`);
  if (v.action !== 'new' || !v.slug) return false;
  wrote.push({ ...v, track });
  return true;
}

function main() {
  const go = has('go');
  const stage = has('stage');
  const topic = arg('topic');
  const only = arg('track');
  if (only && !TECH_TRACKS[only]) die(`未知的 --track ${only}（可用：${Object.keys(TECH_TRACKS).join(' / ')}）`);
  const tracks = only ? [only] : Object.keys(TECH_TRACKS);
  if (topic && tracks.length > 1) die('--topic 需搭配 --track 指定單一 track');

  const recent = recentTechTitles(30);
  const signals = techSignals();

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`近 30 天已發科技文：${recent.length} 篇；差一步的 tech 頁：${signals.striking.length} 個；需求 query：${signals.demand.length} 個；常青需求：${signals.evergreen.length} 個`);
    for (const t of tracks) {
      console.log(`\n===== ${TECH_TRACKS[t].label}｜Claude 寫作指令 =====\n`);
      console.log(buildTechDeskPrompt({ track: t, recentTitles: recent, striking: signals.striking, demand: signals.demand, evergreen: signals.evergreen, topic }));
    }
    return;
  }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 科技台（分支 ${branch}，${go ? '上架' : 'stage 不 push'}，track：${tracks.join(' + ')}）`);

  const wrote = [];
  for (const t of tracks) {
    if (runTrack(t, { go, topic, recent, signals, wrote }) === 'quota') break; // 帳號層級：第二條 track 一樣會被擋
  }

  // 只看 wrote，**不要**用 `git status` 當「有沒有產出」的判準。
  // 2026-07-29 實測：模型有時會無視「不要 commit」的指示，自己把稿 commit 掉；此時
  // ARTICLES_DIR 的 porcelain 是空的，舊寫法會誤判成「無產出」而**跳過標籤／去 AI 腔／
  // build／check:links 全部關卡**，還印出誤導的「本次無產出」。稿子照樣在 commit 裡。
  if (wrote.length === 0) { console.log('\n✓ 本次無產出。'); return; }
  if (!sh('git', ['status', '--porcelain', ARTICLES_DIR])) {
    console.log('  ℹ️ 工作區乾淨但有產出＝模型自行 commit 過；照常跑完所有關卡（關卡吃的是檔案，不是 diff）。');
  }

  // 用系統時間蓋掉模型寫的 publishDate；逐篇過 gate（集合與順序的正本＝lib/publish-pipeline.mjs），
  // 不合格的整篇剔除、不拖垮整批。
  const nowIso = new Date().toISOString();
  const kept = [];
  for (const v of wrote) {
    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    if (existsSync(file)) writeFileSync(file, readFileSync(file, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${nowIso}"`));
    const g = runArticleGates(v.slug, { log: (m) => console.log(m) });
    if (!g.ok) {
      console.log(`  ⚠️ 剔除 ${v.slug}：${g.label}${g.detail ? `\n${g.detail}` : ''}`);
      if (existsSync(file)) rmSync(file);
      continue;
    }
    kept.push(v);
  }
  if (kept.length === 0) { console.log('\n✓ 本批全部被關卡剔除，無發佈。'); return; }

  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }

  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  // 模型可能已自行 commit（見上），此時沒有 staged 變更；空 commit 會讓 git 回非 0 而誤判失敗。
  const staged = sh('git', ['diff', '--cached', '--name-only']);
  if (staged) {
    sh('git', ['commit', '-m', `feat(article): 科技台自動產文（${kept.length} 篇）\n\n${kept.map((k) => `${TECH_TRACKS[k.track].label}：${articleTitle(k.slug) || k.slug}`).join('\n')}`]);
  } else {
    console.log('  ℹ️ 無待 commit 變更（模型已自行 commit），直接進入發佈。');
  }
  if (go) {
    const pr = pushToMain({ cwd: process.cwd() });
    if (!pr.ok) die(`推送 main 失敗：${pr.err}`);
    console.log(`✓ 已上架 ${kept.length} 篇。`);
    for (const v of kept) console.log(`PUBLISHED=https://appi.news/articles/${v.slug}/ ｜ ${articleTitle(v.slug) || v.slug}`);
  } else {
    console.log(`✓ 已 stage ${kept.length} 篇（未 push）。`);
    for (const v of kept) console.log(`STAGED=${v.slug} ｜ ${articleTitle(v.slug) || v.slug}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (e) { die(e.message); }
}
