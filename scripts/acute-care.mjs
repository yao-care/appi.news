#!/usr/bin/env node
// 急性症狀居家處置衛教線：從題目表挑還沒寫的題 → Claude 寫成待審草稿 → 過關卡 → commit。
// 題目表、醫療界線與 prompt 在 scripts/lib/acute-care.mjs。
//
// **產出一律 status: draft**：不進列表／sitemap／RSS，等醫師審閱後再逐篇轉 published。
// 因此本線**沒有 --go**（沒有「上架」這個動作），最多做到 --stage（寫+commit+push 草稿）。
//
//   node scripts/acute-care.mjs                     # dry-run：印下一題的寫作指令
//   node scripts/acute-care.mjs --list              # 列出題目表與完成進度
//   node scripts/acute-care.mjs --stage             # 寫 1 篇草稿 + commit + push
//   node scripts/acute-care.mjs --stage --count 3   # 一次寫 3 篇
//   node scripts/acute-care.mjs --stage --topic leg-cramp-relief   # 指定題目
//
// 已寫過的題記在帳本（預設 /root/.local/state/appi-news/acute-care-done.json），避免重複。

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { TOPICS, GROUPS, topicByKey, pendingTopics, buildAcuteCarePrompt, parseAcuteCareResult } from './lib/acute-care.mjs';
import { runClaudeArticle } from './lib/claude-cli.mjs';
import { runArticleGates } from './lib/publish-pipeline.mjs';
import { articleFrontmatter } from './lib/article-index.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';

const ARTICLES_DIR = 'src/content/articles';
const LEDGER_PATH = process.env.ACUTE_CARE_LEDGER_PATH || '/root/.local/state/appi-news/acute-care-done.json';

const has = (n) => process.argv.includes(`--${n}`);
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : ''; };
function die(m) { console.error(`✖ ${m}`); process.exit(1); }
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

function loadLedger() {
  try { return JSON.parse(readFileSync(LEDGER_PATH, 'utf8')); } catch { return []; }
}
function recordLedger(keys) {
  const merged = [...new Set([...loadLedger(), ...keys])];
  mkdirSync(dirname(LEDGER_PATH), { recursive: true });
  writeFileSync(LEDGER_PATH, JSON.stringify(merged, null, 2));
}

/** 讀文章 frontmatter（正本＝lib/article-index.mjs；讀不到回空物件）。 */
const frontmatter = (slug) => articleFrontmatter(slug);

function printList() {
  const done = new Set(loadLedger());
  console.log(`急性症狀衛教題目表：${TOPICS.length} 題，已寫 ${[...done].length} 題\n`);
  for (const g of GROUPS) {
    console.log(`■ ${g}`);
    for (const t of TOPICS.filter((x) => x.group === g)) {
      const onDisk = existsSync(join(ARTICLES_DIR, `${t.key}.md`));
      const mark = done.has(t.key) || onDisk ? '✓' : '·';
      console.log(`  ${mark} ${t.key.padEnd(30)} ${t.caution ? '⚑ ' : '  '}${t.title}`);
    }
  }
  console.log('\n⚑ ＝ 臨床共識近年變過或牽涉劑量／急救手法，prompt 會帶額外提醒。');
}

function writeOne(topic, recentTitles) {
  console.log(`\n→ ${topic.title}${topic.caution ? '（⚑ 高風險題）' : ''}…`);
  const prompt = buildAcuteCarePrompt(topic, { recentTitles });
  // 成功判定三態的正本＝lib/claude-cli.mjs：quota 回哨兵給 main 中止整批（未寫的題留在題目表）。
  const c = runClaudeArticle({ prompt });
  if (c.kind === 'quota') { console.log(`  ⛔ 撞用量上限：${c.detail}`); return { quota: true }; }
  if (c.kind === 'fail') { console.log(`  ⚠️ claude 失敗：${c.detail}`); return null; }
  const v = parseAcuteCareResult(c.stdout);

  // 保底：解析不出 ACUTE_RESULT、或報回來的 slug 對不到檔案時，直接看本題的檔案在不在。
  // 我們是「指定題目」呼叫的，slug 必然等於 topic.key，不必信模型那行字。
  // 2026-08-03 實測：首批 11 題有 4 題因為模型把 slug 包在反引號／粗體裡而被誤判成失敗，
  // 稿子其實都寫好了。**解析失敗不等於沒產出**，這道保底比修 regex 更根本。
  const expected = join(ARTICLES_DIR, `${topic.key}.md`);
  if ((v.action !== 'new' || !v.slug || !existsSync(join(ARTICLES_DIR, `${v.slug}.md`))) && existsSync(expected)) {
    console.log(`  NEW｜${topic.key}（保底撿回：模型回報「${v.note?.slice(0, 40) ?? '無'}」，但檔案存在）`);
    return { action: 'new', slug: topic.key, note: '保底撿回' };
  }

  if (v.action !== 'new' || !v.slug) {
    console.log(`  ⏭  ${v.note}`);
    return null;
  }
  console.log(`  NEW｜${v.slug}`);
  return v;
}

/** 逐篇過關卡（gate 集合與順序的正本＝lib/publish-pipeline.mjs）＋本線特有的 status 檢查；不合格的整篇剔除，不拖垮整批。 */
function gate(wrote) {
  const kept = [];
  for (const v of wrote) {
    const file = join(ARTICLES_DIR, `${v.slug}.md`);
    const drop = (why) => { console.log(`  ⚠️ 剔除 ${v.slug}：${why}`); if (existsSync(file)) rmSync(file); };

    const fm = frontmatter(v.slug);
    if (fm.status !== 'published') { drop(`status 是 "${fm.status}" 而非 published`); continue; }

    const g = runArticleGates(v.slug, { log: (m) => console.log(m) });
    if (!g.ok) { drop(`${g.label}${g.detail ? `\n${g.detail}` : ''}`); continue; }

    kept.push(v);
  }
  return kept;
}

function main() {
  if (has('list')) return printList();

  const stage = has('stage');
  const count = Math.max(1, Number(arg('count') || 1));
  const only = arg('topic');

  const done = loadLedger();
  let queue;
  if (only) {
    const t = topicByKey(only);
    if (!t) die(`未知題目 ${only}（用 --list 看題目表）`);
    queue = [t];
  } else {
    queue = pendingTopics(done).filter((t) => !existsSync(join(ARTICLES_DIR, `${t.key}.md`))).slice(0, count);
  }
  if (!queue.length) { console.log('✓ 題目表已全部寫完，無待寫題。'); return; }

  const recentTitles = TOPICS.filter((t) => existsSync(join(ARTICLES_DIR, `${t.key}.md`)))
    .map((t) => frontmatter(t.key).title).filter(Boolean);

  if (!stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`待寫 ${pendingTopics(done).length} 題，本次會寫：${queue.map((t) => t.key).join('、')}\n`);
    console.log(`===== ${queue[0].title}｜Claude 寫作指令 =====\n`);
    console.log(buildAcuteCarePrompt(queue[0], { recentTitles }));
    return;
  }

  // --write-only：只寫檔＋過逐篇關卡，不 build、不碰 git。給平行批次用。
  //
  // 為什麼要有這個模式：這台機器 4 核、可用記憶體 2GB，跑一次 build（600+ 篇 Astro ＋ pagefind）
  // 就很吃緊，27 篇各跑一次 build 會 OOM。寫作階段幾乎都在等 API、不吃 CPU，適合平行；
  // build 只需要在整批寫完後做一次。由 scripts/acute-care-batch.sh 驅動。
  const writeOnly = has('write-only');

  if (!writeOnly && sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  console.log(`→ 急性症狀衛教線（本批 ${queue.length} 題）`);

  const wrote = [];
  for (const t of queue) {
    const v = writeOne(t, recentTitles);
    if (v?.quota) { console.log('  ⛔ 中止本批（帳號層級限額，未寫的題留在題目表、下次再跑）。'); break; }
    if (v) wrote.push({ ...v, key: t.key });
  }
  if (!wrote.length) { console.log('\n✓ 本次無產出。'); return; }

  // 用系統時間蓋掉模型寫的 publishDate（模型常寫錯日期）。
  const nowIso = new Date().toISOString();
  for (const v of wrote) {
    const f = join(ARTICLES_DIR, `${v.slug}.md`);
    if (existsSync(f)) writeFileSync(f, readFileSync(f, 'utf8').replace(/^publishDate:.*$/m, `publishDate: "${nowIso}"`));
  }

  const kept = gate(wrote);
  if (!kept.length) { console.log('\n✓ 本批全部被關卡剔除，無產出。'); return; }

  if (writeOnly) {
    recordLedger(kept.map((k) => k.key));
    for (const v of kept) console.log(`WROTE=${v.slug} ｜ ${frontmatter(v.slug).title || v.slug}`);
    console.log(`✓ 已寫入 ${kept.length} 篇（未 build、未 commit，交由批次收尾）。`);
    return;
  }

  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過，不 commit（改動留工作區）：${e.message}`); }

  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  if (sh('git', ['diff', '--cached', '--name-only'])) {
    sh('git', ['commit', '-m',
      `feat(article): 急性症狀衛教待審草稿（${kept.length} 篇）\n\n` +
      kept.map((k) => `${frontmatter(k.slug).title || k.slug}`).join('\n') +
      '\n\n產出為 status: draft，不進列表／sitemap／RSS，待醫師審閱後逐篇轉 published。']);
  }
  const pr = pushToMain({ cwd: process.cwd() });
  if (!pr.ok) die(`推送 main 失敗：${pr.err}`);
  recordLedger(kept.map((k) => k.key));
  console.log(`\n✓ 已產出 ${kept.length} 篇待審草稿（未公開）。`);
  for (const v of kept) console.log(`DRAFT=https://appi.news/articles/${v.slug}/ ｜ ${frontmatter(v.slug).title || v.slug}`);
  console.log(`\n剩餘待寫：${pendingTopics(loadLedger()).length} 題`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (e) { die(e.message); }
}
