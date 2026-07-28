// 健康紀念日協調器：每年固定的健康／醫事紀念日，在 T-2 天抓「當年度最新素材」寫成一篇文章，
// 排到當天台北 06:17 上線（status: scheduled + publishDate，當天由 health-days-publish.sh 觸發 deploy 轉正）。
//
// 年曆與寫作 prompt 在 scripts/lib/health-days.mjs（純邏輯、有單元測試）。每日由 cron 呼叫，
// 但 .sh 有純資料前置 gate：兩天後沒紀念日就完全不動用 Claude。一年只有 51 天真的會寫。
//
// 為什麼是「T-2 排程」而不是「當天現寫」：
//   1. 站長要求「接近的時候才找最新資料」，T-2 抓到的官方主題與統計已是當年度的。
//   2. 留兩天緩衝——寫失敗還有 T-1 重試；也讓站長能從 /admin 預覽頁先看先改。
//   3. status: scheduled 的文章不進列表/sitemap/RSS，只產 noindex 預覽頁，不會提早曝光。
//
// 安全：預設 dry-run（只印年曆與寫作指令）。--stage 寫+commit 不 push；--go 寫+commit+push。
//   node scripts/health-days.mjs                      # dry-run（看 T+2 有沒有題）
//   node scripts/health-days.mjs --date 2027-02-04    # 指定目標日 dry-run
//   node scripts/health-days.mjs --calendar 2027      # 印該年度完整年曆
//   node scripts/health-days.mjs --go                 # 實際寫 + 排程上架

import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import {
  HEALTH_DAYS,
  resolveHealthDate,
  healthDaysAhead,
  healthDaysOn,
  articleSlugFor,
  ledgerKey,
  buildHealthDayPrompt,
  parseHealthDayResult,
} from './lib/health-days.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { buildCheckWithResync } from './lib/build-check.mjs';
import { aHashFile, isDuplicateHash } from './lib/image-dedupe.mjs';

const ARTICLES_DIR = 'src/content/articles';
const LEDGER_PATH = process.env.HEALTH_DAYS_LEDGER_PATH
  || join(homedir(), '.local/state/appi-news/health-days.json');
/** 提前幾天寫。留 2 天緩衝：寫失敗隔天還能重試，站長也有時間預覽修改。 */
const LEAD_DAYS = Number(process.env.HEALTH_DAYS_LEAD || 2);
/** 台北時間（UTC+8）。cron 主機跑 UTC，日期換算一律以台北為準。 */
const TAIPEI_OFFSET_MS = 8 * 3600 * 1000;

const has = (n) => process.argv.includes(`--${n}`);
const argOf = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : '';
};

function die(m) { console.error(`✖ ${m}`); process.exit(1); }

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

/** 今天的台北日期 YYYY-MM-DD。 */
function taipeiToday() {
  return new Date(Date.now() + TAIPEI_OFFSET_MS).toISOString().slice(0, 10);
}

/** 讀文章 frontmatter；讀不到回 null。 */
function frontmatter(slug) {
  try {
    const m = readFileSync(join(ARTICLES_DIR, `${slug}.md`), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return m ? yaml.load(m[1]) : null;
  } catch { return null; }
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

/** 歷年同一紀念日已寫過的標題（餵給 prompt，避免年復一年寫同一篇）。 */
function priorTitlesFor(entry) {
  let files = [];
  try { files = readdirSync(ARTICLES_DIR); } catch { return []; }
  const re = new RegExp(`^${entry.slug}-(\\d{4})\\.mdx?$`);
  return files
    .map((f) => ({ f, m: f.match(re) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(b.m[1]) - Number(a.m[1]))
    .slice(0, 3)
    .map((x) => {
      const fm = frontmatter(x.f.replace(/\.mdx?$/, ''));
      return fm?.title || x.f;
    });
}

/**
 * 跨年撞圖檢查：同一個紀念日往年的封面若與今年這張視覺相同，回傳撞到的往年檔名。
 * 用感知雜湊（aHash）而非檔案雜湊——同一張圖庫照重抓一次會是不同位元、相同畫面。
 *
 * 刻意只警告不剔除：文章本身是好的，換張圖就好；排程稿還有兩天，站長可從 /admin 預覽頁換圖。
 * 為此把警告帶進 Slack 回報，不要只留在 log 裡。
 */
export async function priorYearCoverClash(entry, year) {
  const cover = join('public/covers', `${articleSlugFor(entry, year)}-cover.webp`);
  if (!existsSync(cover)) return '';
  let hash;
  try { hash = await aHashFile(cover); } catch { return ''; }
  for (let y = year - 1; y >= year - 5; y--) {
    const prev = join('public/covers', `${articleSlugFor(entry, y)}-cover.webp`);
    if (!existsSync(prev)) continue;
    try {
      if (isDuplicateHash(hash, await aHashFile(prev))) return `${articleSlugFor(entry, y)}-cover.webp`;
    } catch { /* 讀不了就當沒撞 */ }
  }
  return '';
}

/* ---------------- 帳本（哪個紀念日的哪一年已經寫過） ---------------- */

function loadLedger(path = LEDGER_PATH) {
  try {
    const obj = JSON.parse(readFileSync(path, 'utf8'));
    return obj && typeof obj === 'object' ? obj : {};
  } catch { return {}; }
}

function recordLedger(keys, path = LEDGER_PATH) {
  const led = loadLedger(path);
  const now = new Date().toISOString();
  for (const k of keys) led[k] = now;
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(led, null, 2));
  } catch (e) {
    console.warn(`  ⚠️ 帳本寫入失敗（不致命）：${e.message}`);
  }
  return led;
}

/* ---------------- 主流程 ---------------- */

/** 印某年度完整年曆（人工核對用）。 */
function printCalendar(year) {
  const rows = HEALTH_DAYS
    .map((d) => ({ date: resolveHealthDate(d.rule, year), d }))
    .sort((a, b) => a.date.localeCompare(b.date));
  console.log(`\n===== ${year} 年健康紀念日年曆（共 ${rows.length} 篇）=====\n`);
  let lastMonth = '';
  for (const { date, d } of rows) {
    const mm = date.slice(5, 7);
    if (mm !== lastMonth) { console.log(''); lastMonth = mm; }
    console.log(`  ${date}  ${d.name}（${d.sub}）｜${d.org}`);
  }
}

async function main() {
  const go = has('go');
  const stage = has('stage');

  if (has('calendar')) {
    printCalendar(Number(argOf('calendar')) || new Date().getUTCFullYear());
    return;
  }

  // 目標日：預設今天（台北）往後 LEAD_DAYS 天；--date 可指定（補寫／測試用）。
  const explicit = argOf('date');
  const targets = explicit
    ? healthDaysOn(explicit).map((entry) => ({ entry, date: explicit }))
    : healthDaysAhead(taipeiToday(), LEAD_DAYS);
  const targetDate = explicit || (targets[0]?.date ?? '');

  if (targets.length === 0) {
    console.log(`（${explicit || `${taipeiToday()} 往後 ${LEAD_DAYS} 天`} 沒有健康紀念日，安靜結束）`);
    return;
  }

  const year = Number(targets[0].date.slice(0, 4));
  const ledger = loadLedger();

  // 過濾掉「這一年已經寫過」的：帳本有紀錄，或文章檔已存在（帳本掉了也不會重寫）。
  const todo = targets.filter(({ entry }) => {
    const slug = articleSlugFor(entry, year);
    if (ledger[ledgerKey(entry, year)]) {
      console.log(`  ⏭ ${entry.name}：帳本記錄 ${year} 年已寫過，跳過`);
      return false;
    }
    if (existsSync(join(ARTICLES_DIR, `${slug}.md`))) {
      console.log(`  ⏭ ${entry.name}：${slug}.md 已存在，跳過`);
      return false;
    }
    return true;
  });

  if (todo.length === 0) {
    console.log(`（${targetDate} 的紀念日都已寫過，安靜結束）`);
    return;
  }

  if (!go && !stage) {
    console.log('— DRY RUN（零副作用）—');
    console.log(`目標日 ${targetDate}，待寫 ${todo.length} 篇：`);
    for (const { entry } of todo) console.log(`  · ${entry.name}（${articleSlugFor(entry, year)}）`);
    for (const { entry, date } of todo) {
      console.log(`\n===== Claude 寫作指令：${entry.name} =====\n`);
      console.log(buildHealthDayPrompt(entry, date, { priorTitles: priorTitlesFor(entry) }));
    }
    return;
  }

  if (sh('git', ['status', '--porcelain'])) die('工作區不乾淨，請先清乾淨再跑');
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  console.log(`→ 健康紀念日 ${targetDate}（分支 ${branch}，${go ? '排程上架' : 'stage 不 push'}）`);
  for (const { entry } of todo) console.log(`  · ${entry.name}`);

  const wrote = [];
  for (const { entry, date } of todo) {
    const slug = articleSlugFor(entry, year);
    console.log(`\n→ 寫「${entry.name}」（${slug}）…`);
    const prompt = buildHealthDayPrompt(entry, date, { priorTitles: priorTitlesFor(entry) });
    const r = spawnSync('claude-appi', ['--model', 'claude-sonnet-5', '-p', prompt], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    // claude-appi 撞用量上限時會 exit 0 但只印限額訊息 → 必須查 stdout，否則被誤判成「寫不出來」。
    if (r.error || r.status !== 0
      || /API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit/i.test(r.stdout || '')) {
      console.log(`  ⚠️ claude 失敗：${(r.stderr || r.stdout || r.error?.message || '').slice(-300)}`);
      continue;
    }
    const v = parseHealthDayResult(r.stdout);
    console.log(`  ${v.action.toUpperCase()}｜${v.note}${v.slug ? `（${v.slug}）` : ''}`);
    if (v.action !== 'ok') continue;
    if (v.slug !== slug) {
      console.log(`  ⚠️ 模型回的 slug（${v.slug}）與企劃不符（應為 ${slug}），以企劃為準檢查檔案`);
    }
    wrote.push({ entry, date, slug });
  }

  const produced = sh('git', ['status', '--porcelain', ARTICLES_DIR]);
  if (!produced || wrote.length === 0) { console.log('\n✓ 本次無產出。'); return; }

  // 逐篇驗收：檔案在、排程欄位正確、圖檔齊、過去 AI 腔與重複題 gate。任一不過就剔除該篇，不拖垮其他篇。
  const kept = [];
  for (const w of wrote) {
    const file = join(ARTICLES_DIR, `${w.slug}.md`);
    if (!existsSync(file)) {
      console.log(`  ⚠️ 剔除 ${w.slug}：模型說寫了但檔案不存在`);
      continue;
    }

    // 排程欄位以企劃為準蓋掉模型寫的（模型常把 publishDate 寫成當下或整點，會提早／延後上線）。
    let raw = readFileSync(file, 'utf8');
    raw = raw.replace(/^publishDate:.*$/m, `publishDate: "${w.date}T06:17:00+08:00"`);
    raw = /^status:/m.test(raw)
      ? raw.replace(/^status:.*$/m, 'status: "scheduled"')
      : raw.replace(/^---\r?\n/, '---\nstatus: "scheduled"\n');
    writeFileSync(file, raw);

    const fm = frontmatter(w.slug);
    if (!fm?.title || !fm?.description) {
      console.log(`  ⚠️ 剔除 ${w.slug}：frontmatter 缺 title/description`);
      rmSync(file);
      continue;
    }

    // 配圖硬性 gate（比照其餘產線）：設了 coverImage 卻沒圖檔＝壞連結，整篇不發。
    const missing = missingLocalAssets(w.slug);
    if (missing.length) {
      console.log(`  ⚠️ 剔除 ${w.slug}：缺本地圖檔（${missing.join('、')}）`);
      rmSync(file);
      continue;
    }

    const tone = spawnSync('node', ['scripts/check-content.mjs', file], { encoding: 'utf8' });
    if (tone.status !== 0) {
      console.log(`  ⚠️ 剔除 ${w.slug}：去 AI 腔硬 tell\n${tone.stdout || tone.stderr || ''}`);
      rmSync(file);
      continue;
    }

    const dup = spawnSync('node', ['scripts/check-duplicate-topic.mjs', file], { encoding: 'utf8' });
    if (dup.status !== 0) {
      console.log(`  ⚠️ 剔除 ${w.slug}：與站上既有文章重複\n${dup.stdout || dup.stderr || ''}`);
      rmSync(file);
      continue;
    }

    // 跨年撞圖：只警告不剔除（文章是好的，換張圖就好；排程稿還有兩天可人工處理）。
    const clash = await priorYearCoverClash(w.entry, year);
    if (clash) {
      console.log(`  ⚠️ ${w.slug} 的封面與往年（${clash}）視覺重複，建議換圖`);
    }

    kept.push({ ...w, title: fm.title, coverClash: clash });
  }

  if (kept.length === 0) { console.log('\n✓ 本批全被 gate 剔除，無發佈。'); return; }

  try { buildCheckWithResync(); }
  catch (e) { die(`build/check:links 未過（已自癒重試），不發佈（改動留工作區）：${e.message}`); }

  sh('git', ['add', '--', ARTICLES_DIR, 'public/covers', 'public/images']);
  sh('git', ['commit', '-m',
    `feat(article): 健康紀念日排程（${targetDate}，${kept.length} 篇）\n\n`
    + kept.map((k) => `- ${k.entry.name}：${k.title}`).join('\n')
    + `\n\n排 ${targetDate} 台北 06:17 上線，當天由 health-days-publish.sh 觸發 deploy 轉正。`]);

  if (go) {
    const pr = pushToMain({ cwd: process.cwd() });
    if (!pr.ok) die(`推送 main 失敗：${pr.err}`);
    recordLedger(kept.map((k) => ledgerKey(k.entry, year)));
    console.log(`✓ 已排程 ${kept.length} 篇（${targetDate} 06:17 上線）。`);
    // 給 cron .sh 解析回報 Slack 用。
    for (const k of kept) {
      const warn = k.coverClash ? ` ｜ ⚠️ 封面與往年（${k.coverClash}）視覺重複，建議換圖` : '';
      console.log(`SCHEDULED=https://appi.news/articles/${k.slug}/ ｜ ${k.title} ｜ ${k.date} 06:17${warn}`);
    }
  } else {
    console.log(`✓ 已 stage ${kept.length} 篇（未 push、未記帳本）。`);
    for (const k of kept) console.log(`STAGED=${k.slug} ｜ ${k.title} ｜ ${k.date} 06:17`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.message));
}
