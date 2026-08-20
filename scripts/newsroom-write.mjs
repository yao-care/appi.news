// 無人值守自動產文（子專案 2 / Phase 0）協調器。
//
// 與 /newsroom 日更一致：寫完直接發佈（status: published、push main 上線），
// 作者事後進編輯器修改。不走 PR。
//
// 職責（deterministic 部分，LLM 起草交給 claude -p）：
//   1. 讀 + 驗工單（scripts/lib/newsroom-job.mjs 把關：只限 tech、看法必填）。
//   2. 以批次模式 prompt 呼叫 claude -p，由它依 newsroom 規則起草（status: published）。
//   3. gate：pnpm check:links 全綠才往下（壞連結會擋整站部署，這關自動、非人工）。
//   4. commit + push（上線）。發佈後由作者在編輯器修改。
//
// 安全預設：不帶 --go 就是 dry-run（只驗證 + 印計畫 + 印 prompt，零副作用）。
//
// 用法：
//   node scripts/newsroom-write.mjs <job.json>          # dry-run（零副作用）
//   node scripts/newsroom-write.mjs <job.json> --stage   # 起草 + check:links + commit 在分支，不 push（先審）
//   node scripts/newsroom-write.mjs <job.json> --go      # 起草 + check:links + commit + push 上線
//
// 設計依據：docs/superpowers/specs/2026-06-16-unattended-newsroom-design.md

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { validateJob, normalizeJob } from './lib/newsroom-job.mjs';
import { pushToMain } from './lib/git-publish.mjs';
import { nextOpenPublishDate, takenDatesFromContents } from './lib/publish-slot.mjs';
import { coverDuplicatesInline } from './lib/image-dedupe.mjs';
import { checkCoverFile } from './lib/cover-spec.mjs';
import { RISKS_PROMPT } from "./lib/risks-prompt.mjs";
import { EXPERT_NOTE_PROMPT } from "./lib/expert-note-prompt.mjs";
import { GROWTH_PROMPT } from "./lib/growth-prompt.mjs";

const ARTICLES_DIR = 'src/content/articles';

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  }
  return (r.stdout || '').trim();
}

/** 從內文抽「站內本地圖」的 public/ 路徑（markdown 與 <img> 皆收；外部 URL 如 unsplash 略過）。
 *  支援 root-relative（/images/…）與本站絕對網址（https://appi.news/images/…）。 */
export function extractInlineImagePaths(body) {
  const srcs = [];
  const md = body.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)/g);
  for (const m of md) srcs.push(m[1]);
  const html = body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi);
  for (const m of html) srcs.push(m[1]);
  const out = [];
  for (let s of srcs) {
    s = s.replace(/^https?:\/\/appi\.news/, ''); // 本站絕對網址 → root-relative
    if (s.startsWith('/images/') || s.startsWith('/covers/')) {
      out.push('public' + s);
    }
  }
  return out;
}

/** 解析文章 frontmatter + 內文圖數；回傳 { data, body, inlineImages, inlineImagePaths } 或 null。 */
function parseArticle(file) {
  const rawTxt = readFileSync(file, 'utf8');
  const m = rawTxt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  let data;
  try {
    data = yaml.load(m[1]);
  } catch {
    return null;
  }
  const body = m[2] || '';
  const inlineImages = (body.match(/!\[[^\]]*\]\(|<img\b/g) || []).length;
  return { data: data || {}, body, inlineImages, inlineImagePaths: extractInlineImagePaths(body) };
}

// 待審草稿用的「遠未來」排程日：讓事實稿產出後只建 noindex 預覽頁、永不自動上線，
// 等人工核可（Slack 發佈鈕或編輯器把日期改成今天）才轉正。
const PENDING_APPROVAL_DAYS = 365;

/** 決定發佈狀態與日期：指定日 > 下一個空檔；今天/過去→published、未來→scheduled。 */
function computeSchedule(job) {
  const taipeiToday = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);

  // 需人工審核（事實稿）：排到遠未來＝待審草稿（建預覽頁、不進列表、不自動上線）。
  if (job.requireApproval) {
    const future = new Date(Date.now() + PENDING_APPROVAL_DAYS * 86400 * 1000);
    const dateYmd = future.toISOString().slice(0, 10);
    return {
      status: 'scheduled',
      dateYmd,
      publishDate: `${dateYmd}T08:00:00+08:00`,
      scheduled: true,
      pendingApproval: true,
    };
  }

  let target = job.publishDate || null;
  if (!target) {
    let contents = [];
    try {
      contents = readdirSync(ARTICLES_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => readFileSync(join(ARTICLES_DIR, f), 'utf8'));
    } catch {
      contents = [];
    }
    target = nextOpenPublishDate(takenDatesFromContents(contents), taipeiToday);
  }
  const scheduled = target > taipeiToday;
  return {
    status: scheduled ? 'scheduled' : 'published',
    dateYmd: target,
    publishDate: scheduled ? `${target}T08:00:00+08:00` : new Date().toISOString(),
    scheduled,
  };
}

/** 批次模式起草 prompt：跳雷達/問答、保留起草與查證、不 push（由協調器 gate 後處理）。
 *  opts.isUpdate=true：固定 slug 的檔已存在，這是「同一事件的滾動更新」——改寫既有檔、沿用原排程。 */
export function buildDraftPrompt(job, schedule = null, opts = {}) {
  const isUpdate = !!opts.isUpdate;
  const cite = job.mustCite.length ? `\n必引來源：\n${job.mustCite.map((c) => `- ${c}`).join('\n')}` : '';
  const len = job.length === 'deep' ? '深稿（3000+ 字）' : '短稿（800–1500 字）';
  const status = schedule?.status ?? 'published';
  const pubDate = schedule?.publishDate ?? new Date().toISOString();
  const catName = job.categoryName || job.category;
  const author = job.author || 'lightman';
  const contentType = job.contentType || 'news';
  const subcat = job.subcategory ? ` / ${job.subcategory}` : '';
  const factual = job.kind === 'factual';
  // NO_AI_IMAGE=1：本批禁用 AI 生圖。get-image.mjs 已有機械保證（走到生圖直接拋錯），
  // 這裡同步改寫配圖指示，讓模型一開始就走「既有圖 → 圖庫 → 換 query」而不是撞牆才轉向。
  const noAiImage = process.env.NO_AI_IMAGE === '1';

  // 觀點稿：融入真人觀點、走作者人格與跨文記憶。事實稿：編輯部中性服務語氣、無個人觀點。
  const viewpointLine = factual
    ? '- 內容形態：事實／服務型 roundup（編輯部署名）。不要加入任何個人觀點或立場，只做準確、可查證的資訊整理。'
    : `- 真人觀點／本業經驗（Q3，作者本人提供，務必融入，不得稀釋成中性）：${job.viewpoint}`;

  const readLine = factual
    ? '先讀 .claude/skills/newsroom/SKILL.md（取其配圖、超連結查證、繁中台灣用語、去 AI 腔規則）。本篇以「編輯部」中性服務語氣撰寫，不套個人作者人格。'
    : '先讀 .claude/skills/newsroom/SKILL.md、persona.md、author-memory.json。';

  // slug：工單若指定固定 slug（滾動更新／同一事件就地改寫用），就用它、不自訂；否則引擎自選。
  const slugTarget = job.slug ? `src/content/articles/${job.slug}.md` : 'src/content/articles/<slug>.md（slug 你自訂，英文 kebab）';
  const memoryTail = factual ? '事實稿不需追加 author-memory.json。' : '並依步驟三.9 把本篇追加進 author-memory.json。';
  const memoryStep = isUpdate
    ? [
        `3. **同一事件的滾動更新**：改寫既有檔 ${slugTarget}（slug 固定、不要改）。先讀原檔，把 title／description／highlights／內文改寫成反映「最新、最完整」的停班停課全貌（涵蓋先前已列、再加上新增或變更的縣市/地區與適用時間）。`,
        `3a. **沿用原檔的 status 與 publishDate 不要動**（避免把已發佈或待審草稿的排程打回原形）；**沿用原 coverImage 檔名與既有內文圖**，只有新增段落才另配新圖。把 frontmatter 的 updatedDate 設為現在（台北時間 ISO 8601，例如 ${new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace('Z', '+08:00')}）。${memoryTail}`,
      ].join('\n')
    : `3. 寫入 ${slugTarget}。${memoryTail}`;

  const noFabricate = factual
    ? '4. 嚴禁杜撰：數據/事實/日期/地點/金額都要可連線官方或權威來源；查不到就不寫，寧缺勿錯（服務型資訊錯誤會誤導讀者）。'
    : '4. 嚴禁杜撰：數據/事實/引述都要可連線來源；Q3 真人觀點只用工單給的那段，不得自行虛構作者經歷。';

  return [
    `你正在以「無人值守批次模式」執行 APPI News 的 /newsroom ${catName}類起草，寫完直接發佈。`,
    readLine,
    '',
    '【本批工單（取代 newsroom 步驟一雷達與步驟二問答）】',
    `- 題目（標題）：${job.title}`,
    `- 核心結論（Q1）：${job.conclusion}`,
    `- 切角（Q2）：${job.angle || '（依結論自訂）'}`,
    viewpointLine,
    `- 篇幅（Q4）：${len}`,
    `- 數據依據：${job.signal || '（無）'}`,
    `- 分類：${job.category}${subcat}`,
    cite,
    '',
    '【務必照做】',
    '1. 完整執行 newsroom 步驟三：查料、擴寫、超連結逐條查證（每條 2xx 且內容支持該句，死連結一律換或刪），去 AI 腔複查、繁中台灣用語複查。',
    noAiImage
      ? '1a. 每段必配圖。**本批禁止 AI 生圖**（`NO_AI_IMAGE=1` 已在環境變數硬性擋下，走到生圖會直接失敗）。取圖順序**一定要照這個**：①**先看站內既有圖能不能重用**——`ls public/images/` 找主題相近的既有圖（例如信用卡、超商、機場、健身房、手機這類通用場景），能扣題就直接在內文引用該路徑，不必重新取圖；②既有圖都不合用，才 `node scripts/get-image.mjs`（**不要**加 `--people`、**不要**加 `--generate`）搜圖庫；③圖庫搜不到就**換一組英文 `--query` 再試**（換更通用的詞，例如 "airport departure board"、"gym interior"），連試幾組都不行就減少該段配圖，**絕對不要**改用生圖。**每張新取的圖都務必帶** `--caption "<這張圖要傳達的訊息>"` `--alt "<中文畫面描述>"` `--article-context "<本篇主題>"` 讓圖庫審查扣題。封面同法且**最重要**：縮圖要讓讀者一眼看出文章主題。**④封面的 `--query` 必須與每一張內文圖都明顯不同**——禁生圖後只能用圖庫，同一組 query 圖庫會回同一張照片，封面與內文圖就會一模一樣被配圖 gate 擋下（實測距離 0）。封面請另挑一個代表全篇的場景詞，取完用肉眼確認檔案不同。**⑤封面一律橫式、寬 ≥1200**（Discover 大圖門檻；get-image 對 covers/ 會機械把關，候選全被拒就換一組 --query 再取）。'
      : '1a. 每段必配圖，一律用 `node scripts/get-image.mjs`（不要用 gen-image.mjs）：概念/物件/場景圖**不要**加 --people（先搜圖庫，圖庫候選會自動過相關度＋外國臉孔審查；全淘汰才 AI 生成，生成一律是**超寫實新聞攝影單一場景**，已內建多樣性輪轉與反拼貼）；人物為主體的圖才加 --people（擬真攝影生成：sonnet 展開＋haiku 視覺自檢＋不合格自動重生、模組強制台灣人）。**每張圖都務必帶** `--caption "<這張圖要傳達的訊息>"` `--alt "<中文畫面描述>"` `--article-context "<本篇主題>"` 讓展開與審查扣題。封面同法且**最重要**：縮圖要讓讀者一眼看出文章主題，像新聞攝影記者拍的照片；封面一律橫式、寬 ≥1200（Discover 大圖門檻；get-image 對 covers/ 會機械把關，被拒就換 --query 再取）。',
    '1a-1. **圖說（markdown 圖片 title）紀律**：mode:"generated" 與 mode:"stock" 的圖，圖說句尾一律加「（示意圖）」；mode:"stock" 的封面把 credit 寫進 frontmatter coverImageCredit；mode:"embedded" 可授權真實照不加示意圖、但 credit 必寫。圖說會顯示在圖片下方（figcaption），要寫成給讀者看的編輯圖說。',
    '1a-2. **資料圖表**（有數字/比較/流程才畫）：依 `docs/design/chart-spec.md` 手繪原生 SVG 存 `public/images/<slug>/`，**嚴禁用生圖模型畫圖表**（畫不準繁中字與數字）。',
    '1a-3. **封面必須是獨立的一張圖，不得與內文任一張圖相同**（不可把內文第一張直接當封面）。封面用本篇整體主題另取一張；重複會被配圖 gate 擋下不發佈。',
    isUpdate
      ? `2. frontmatter：**status 與 publishDate 一律沿用原檔現值、不要改**（滾動更新不得改變排程）；category/subcategory/author/contentType/sourceType 維持原檔；新增或更新 updatedDate（見步驟 3a）。disclosure 揭露「以 AI 輔助起草、經人工查證編輯」。`
      : `2. frontmatter：status: "${status}"、publishDate: "${pubDate}"、category: "${job.category}"${job.subcategory ? `、subcategory: "${job.subcategory}"` : ''}、author: "${author}"、contentType: "${contentType}"、sourceType: "editorial"（須為 src/content.config.ts 的 enum 合法值），並用 disclosure 欄位揭露「以 AI 輔助起草、經人工查證編輯」。`,
    RISKS_PROMPT,
    EXPERT_NOTE_PROMPT,
    GROWTH_PROMPT,
    memoryStep,
    noFabricate,
    '5. **不要 git add / commit / push，也不要跑 `pnpm build` 或 `pnpm check:links`**——版控、建置與發佈全部由外層腳本在 gate 後統一處理。平行批次時多個進程同時 build 會搶同一個 `dist/`，產生 ENOENT 競態、白白耗時（實測 6 篇有 5 篇自己跑了 build）。你只要把文章與圖寫好即可。',
    '6. 完成後，最後輸出一段「查證報告」：條列文中每一條超連結 + 其 HTTP 狀態 + 是否支持該句。',
  ].join('\n');
}

/**
 * 解析觀點 gate 的查核輸出（純函式，可單元測試）。
 * 期望 claude 回一行：`VIEWPOINT_GATE=PASS｜<反映於哪>` 或 `VIEWPOINT_GATE=FAIL｜<理由>`。
 * @returns {{ok:boolean, infra:boolean, note:string}}
 *   ok    - 觀點是否充分反映於內文（gate 是否放行）
 *   infra - 是否為「查核工具異常／格式無法解析」（非文章問題，應重跑而非改稿）
 *   note  - 反映在哪 / 為何沒過 / 異常說明
 */
export function parseViewpointVerdict(stdout) {
  const m = String(stdout || '').match(/VIEWPOINT_GATE\s*=\s*(PASS|FAIL)\s*[｜|:：\-]?\s*(.*)$/im);
  if (!m) return { ok: false, infra: true, note: '無法從查核輸出解析判定（回傳格式異常）' };
  const pass = m[1].toUpperCase() === 'PASS';
  const note = (m[2] || '').trim().slice(0, 200);
  return { ok: pass, infra: false, note: note || (pass ? '已反映' : '未充分反映') };
}

/** 觀點 gate：起草後問 claude「Q3 作者觀點有沒有真的反映在內文」。失敗一律 fail-closed。 */
function checkViewpointReflected(viewpoint, body) {
  const prompt = [
    '你是 APPI News 的編輯查核員，只做一件事：判斷「作者真人觀點」有沒有實際反映在文章內文裡。',
    '通過標準：內文要有可辨識的段落或語句承載這個觀點的主旨（立場、判斷或本業經驗），讓讀者讀得出作者的角度；',
    '不通過：只把觀點稀釋成中性敘述、或根本沒提到、或只是泛泛帶過。從嚴認定。',
    '',
    '【作者真人觀點（Q3）】',
    viewpoint,
    '',
    '【文章內文】',
    body,
    '',
    '只輸出一行，二選一（用全形直線 ｜ 分隔）：',
    'VIEWPOINT_GATE=PASS｜<反映在哪：引用最相關的一句內文，30字內>',
    'VIEWPOINT_GATE=FAIL｜<為什麼沒反映或被稀釋，30字內>',
  ].join('\n');
  const r = spawnSync('claude-appi', ['--model', 'haiku', '-p', prompt], { encoding: 'utf8' });
  // claude-appi 撞「每週用量上限」時會 exit 0 但只印限額訊息 → 一併視為 infra 失敗，別讓 gate 誤判成 FAIL。
  const limitHit = /API Error|Usage Policy|unable to respond|hit your .*limit|weekly limit|usage limit/i.test(r.stdout || '');
  if (r.error || r.status !== 0 || limitHit) {
    const tail = (r.stderr || r.stdout || r.error?.message || '').trim().slice(-200);
    return { ok: false, infra: true, note: `claude 查核失敗（exit ${r.status}）：${tail}` };
  }
  return parseViewpointVerdict(r.stdout);
}

async function main() {
  const args = process.argv.slice(2);
  const go = args.includes('--go');
  const stage = args.includes('--stage');
  // --allow-any-category：放寬分類白名單成「全部合法分類」（含 health/focus/finance/columns）。
  // 只給「真人經 /admin 下單」的 article-write 協調器用；自動選題產線不帶此旗標、維持只收 vertical。
  const allowAnyCategory = args.includes('--allow-any-category');
  // --write-only：只起草＋過逐篇關卡（配圖／重複／去 AI 腔／標籤／觀點）＋寫 result.json，
  // 不 build、不 check:links、不碰 git。給「平行寫多篇 → 一次 build → 一次發佈」的批次驅動用
  // （沿用 acute-care-batch.sh 的作法：每篇各跑一次 662 篇 Astro build 會在 4 核/2GB 上 OOM）。
  const writeOnly = args.includes('--write-only');
  const jobPath = args.find((a) => !a.startsWith('--'));
  if (!jobPath) die('用法：node scripts/newsroom-write.mjs <job.json> [--go|--stage|--write-only] [--allow-any-category]');

  // 1) 讀 + 驗
  let raw;
  try {
    raw = JSON.parse(readFileSync(jobPath, 'utf8'));
  } catch (e) {
    die(`讀不到/解析不了工單 ${jobPath}：${e.message}`);
  }
  const errors = validateJob(raw, { allowAnyCategory });
  if (errors.length) {
    die(`工單未過驗證（零副作用退出）：\n  - ${errors.join('\n  - ')}`);
  }
  const job = normalizeJob(raw);
  const schedule = computeSchedule(job);
  // 固定 slug 且該檔已存在 → 同一事件的滾動更新（改寫既有檔、沿用原排程），否則新建。
  const isUpdate = !!job.slug && existsSync(join(ARTICLES_DIR, `${job.slug}.md`));
  const prompt = buildDraftPrompt(job, schedule, { isUpdate });

  if (!go && !stage && !writeOnly) {
    console.log('— DRY RUN（不帶 --go/--stage/--write-only，零副作用）—');
    console.log(`工單通過：${job.title}（${job.category}${job.subcategory ? '/' + job.subcategory : ''}，${job.kind}，${job.length}）`);
    console.log(
      isUpdate
        ? `模式：滾動更新既有文章 ${job.slug}（沿用原排程與封面，只改寫內文＋updatedDate）`
        : schedule.pendingApproval
          ? '排程：待人工審核（產待審草稿、建預覽頁、不自動上線；核可才轉正）'
          : `排程：${schedule.status}（${schedule.scheduled ? '排到 ' + schedule.dateYmd : '今天，立即發佈'}）`,
    );
    console.log('將呼叫：claude -p <批次起草 prompt>');
    console.log('gate：pnpm check:links（壞連結擋整站部署）；然後 git commit + push');
    console.log('\n===== 批次起草 prompt 預覽 =====\n');
    console.log(prompt);
    return;
  }

  // --go：真的起草並發佈。安全前置——工作區乾淨（避免把無關改動掃進發佈 commit）。
  // --write-only 例外：批次驅動就是要多篇同時在同一個工作區寫，起點本來就不乾淨（別篇的產物），
  // 且它不 commit，沒有「掃進發佈 commit」的風險。
  const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!writeOnly && sh('git', ['status', '--porcelain'])) {
    die('工作區不乾淨，請先清乾淨再跑（避免把無關改動掃進發佈 commit）');
  }
  console.log(writeOnly ? `→ 在分支 ${branch} 上起草（--write-only：不 build、不碰 git）` : `→ 在分支 ${branch} 上起草並發佈`);

  console.log('→ claude 起草中…');
  const draft = spawnSync('claude-appi', ['--model', 'claude-sonnet-5', '-p', prompt], { stdio: 'inherit' });
  if (draft.status !== 0) die(`claude 起草失敗（exit ${draft.status}）`);

  // 必須真的產出了文章。
  // --write-only 平行批次下，`git status src/content/articles/` 會同時看到**別篇**的產物，
  // 拿它推 slug 會張冠李戴、也會讓「本篇其實沒寫成」被別篇的產出蓋過去。因此工單指定固定 slug 時
  // 一律以該檔存在與否為準（批次驅動務必給 slug）。
  let slug;
  if (job.slug) {
    if (!existsSync(join(ARTICLES_DIR, `${job.slug}.md`))) {
      die(`claude 沒有產出指定 slug 的文章（src/content/articles/${job.slug}.md），中止（不發佈）`);
    }
    slug = job.slug;
  } else {
    if (writeOnly) die('--write-only 需在工單指定 slug（平行批次下無法從 git status 分辨是哪一篇的產物）');
    const produced = sh('git', ['status', '--porcelain', 'src/content/articles/']);
    if (!produced) die('claude 沒有在 src/content/articles/ 產出文章，中止（不發佈）');
    // 從產出檔推出 slug → 文章網址（給 Slack 回報帶連結）。
    const artLine = produced.split('\n').map((l) => l.trim()).find((l) => l.endsWith('.md'));
    slug = artLine ? artLine.replace(/^.*src\/content\/articles\//, '').replace(/\.md$/, '') : null;
  }
  const url = slug ? `https://appi.news/articles/${slug}/` : null;

  // 配圖硬性 gate（只擋自動產文這條路）：缺封面 / 封面檔不存在 / 內文 0 張圖 → 中止不發佈。
  const articleFile = slug ? join(ARTICLES_DIR, `${slug}.md`) : null;
  const parsed = articleFile && existsSync(articleFile) ? parseArticle(articleFile) : null;
  if (!parsed) die(`讀不到產出文章做配圖檢查：${articleFile}`);
  const cover = parsed.data.coverImage ? String(parsed.data.coverImage).replace(/^\//, '') : '';
  const imgProblems = [];
  if (!cover) imgProblems.push('缺 coverImage（每篇必須有封面）');
  else if (/^https?:\/\//i.test(cover)) imgProblems.push(`coverImage 是外部熱連結（${cover}）：繞過尺寸保證且對方撤圖即破圖，請下載自我托管`);
  else if (!existsSync(join('public', cover))) imgProblems.push(`coverImage 檔不存在：public/${cover}`);
  else {
    // 封面規格（橫式 ≥1200，Discover 大圖門檻；SOT＝lib/cover-spec.mjs）。get-image 已在取圖端把關，
    // 這裡是出口保險——模型繞過 get-image 自己塞圖（複製既有檔、手寫路徑）時仍擋得住。
    const spec = await checkCoverFile(join('public', cover));
    if (!spec.ok) imgProblems.push(`封面不符 Discover 規格：${spec.problem}。請用 get-image.mjs 重取一張橫式、寬 ≥1200 的封面`);
  }
  if (parsed.inlineImages < 1) imgProblems.push('內文 0 張圖（每篇至少要有一張內文配圖）');
  // 封面不得與內文任一張圖重複（舊產線常把封面直接當內文第一張，見 docs/lessons/image-realism-system.md）。
  // 感知雜湊比對：同源不同編碼（webp/jpg）也擋得住。讀不到檔則略過（交上面「檔案存在」檢查）。
  if (cover && existsSync(join('public', cover)) && parsed.inlineImagePaths.length) {
    const dup = await coverDuplicatesInline(join('public', cover), parsed.inlineImagePaths);
    if (dup.duplicate) {
      imgProblems.push(`封面與內文圖重複（封面必須是獨立的一張圖）：與 ${dup.match} 近似（距離 ${dup.distance}）。請把封面換成不同的圖，或把該張內文圖換掉。`);
    }
  }
  if (imgProblems.length) {
    die(`配圖 gate 未過，不發佈（改動留工作區待補圖）：\n  - ${imgProblems.join('\n  - ')}`);
  }

  // 內容 gate（集合與順序的正本＝lib/publish-pipeline.mjs）。cover:false＝沿用本檔上面
  // 自己的配圖 gate（熱連結／內文 0 圖／封面撞內文圖，比 cover-spec 廣），不疊 Discover 尺寸關。
  // dup 為什麼開：擋「站上已有一篇幾乎同標題」的新文（ERROR），同主題只警告不擋
  // （新聞追蹤報導是正當的）。為什麼＝docs/lessons/duplicate-topic-gate.md。
  const g = runArticleGates(slug, { dup: true, cover: false, log: (m) => console.log(m) });
  if (!g.ok) {
    die(`${g.label} 未過，不發佈（改動留工作區）：\n${g.detail || ''}`);
  }

  // 真人觀點硬性 gate（只擋觀點稿 kind: column）：Q3 作者觀點必須真的反映在內文，
  // 否則中止不發佈——避免產出「讀不出作者想法」的中性稿（過去作者反映看不到自己的觀點）。
  // 事實稿（kind: factual，颱風/樂齡/優惠等服務型）無個人觀點，略過此 gate。
  let vp = { ok: true, infra: false, note: '' };
  if (job.viewpointGate && job.viewpoint) {
    console.log('→ 真人觀點 gate（Q3 是否反映於內文）');
    vp = checkViewpointReflected(job.viewpoint, parsed.body);
    if (!vp.ok) {
      if (vp.infra) die(`真人觀點 gate 無法判定（查核工具異常、非文章問題，請重跑）：${vp.note}`);
      die(`真人觀點 gate 未過，不發佈（改動留工作區待補）：作者觀點未充分反映於內文 — ${vp.note}`);
    }
    console.log(`  ✓ 觀點已反映：${vp.note}`);
  } else {
    console.log('→ 真人觀點 gate：事實型／無觀點稿，略過');
  }

  // 給協調器回報 Slack 用：內文摘要 + 重點 + 本次採用觀點 + 預覽/編輯連結（同一 URL）。寫入 job 同目錄。
  const result = {
    title: parsed.data.title || job.title,
    url,
    category: job.category, // 給 Slack 回報路由到對應分類頻道
    scheduled: schedule.scheduled,
    dateYmd: schedule.dateYmd,
    excerpt: parsed.data.excerpt || parsed.data.description || '',
    highlights: Array.isArray(parsed.data.highlights) ? parsed.data.highlights.slice(0, 5) : [],
    coverImage: cover,
    inlineImages: parsed.inlineImages,
    viewpoint: job.viewpoint, // 本次採用的真人觀點（給 Slack 回報，作者可目視確認有無進文）
    viewpointNote: vp.note, // gate 判定「反映於哪一句」
    // 待審＝Slack 帶「發佈」鈕。滾動更新時依「原檔現值」判定：原檔仍是草稿→還要審（帶鈕）；
    // 原檔已是 published（已上線）→ 更新不需再審，純通知、不帶鈕（避免把已上線文章誤導成待審）。
    pendingApproval: isUpdate ? parsed.data.status !== 'published' : !!schedule.pendingApproval,
    updated: isUpdate, // 這次是滾動更新既有文章（給 Slack 回報用「已更新」措辭）
    slug, // 給「發佈」動作定位文章
  };
  try {
    writeFileSync(join(dirname(jobPath), 'result.json'), JSON.stringify(result));
  } catch (e) {
    console.error(`（result.json 寫入失敗，不影響發佈）：${e.message}`);
  }

  // --write-only：逐篇關卡都過了就收工，build / check:links / commit / push 交給批次驅動做一次。
  // check:links 需要全站 dist，本來就只能整批驗一次；此處提早返回不會漏掉那一關。
  if (writeOnly) {
    console.log(`✓ 已寫成（--write-only：未 build、未 commit）。`);
    console.log(`WRITE_ONLY_SLUG=${slug}`);
    return;
  }

  // gate：壞連結會擋整站部署，沒過就不發佈（改動留在工作區供檢查，不自動還原）
  // 先 build 出當前 dist 再 check:links（含 pagefind）。否則 check:links 驗的是殘留舊 dist、
  // 看不到這篇新文章的連結 → 壞連結會被放行、push 後才在 deploy.yml 炸、壞 commit 卡住 main。
  // 與 intl/police 同把關（worktree 線是因為沒 dist，這條是因為 dist 過期，殊途同歸都要先 build）。
  console.log('→ pnpm build（產當前 dist 供 check:links 驗到新文章）');
  try {
    sh('pnpm', ['build'], { stdio: 'inherit' });
  } catch (e) {
    die(`build 失敗，不發佈（改動留在工作區待你處理）：${e.message}`);
  }
  console.log('→ pnpm check:links（唯一自動關卡）');
  try {
    sh('pnpm', ['check:links'], { stdio: 'inherit' });
  } catch (e) {
    die(`check:links 未過，不發佈（改動留在工作區待你處理）：${e.message}`);
  }

  console.log('→ commit（只加文章產物，不用 git add -A）');
  // 只 stage 自動產文會產生的東西：文章、封面、內文圖、跨文記憶。
  // 不用 git add -A——否則 job 起跑後到這裡之間，工作區若有其他未提交改動
  // （例如有人同時在開發），會被掃進這篇發佈 commit。起點的乾淨檢查擋不了中途新增的檔。
  sh('git', ['add', '--', 'src/content/articles', 'public/covers', 'public/images', '.claude/skills/newsroom/author-memory.json']);
  const commitBody = isUpdate
    ? `${job.categoryName}類自動產文（事實型／編輯部，同一事件滾動更新；沿用原排程與封面，改寫內文＋updatedDate）。`
    : schedule.pendingApproval
      ? `${job.categoryName}類自動產文（事實型／編輯部，待人工審核，未上線；核可後轉正）。`
      : job.kind === 'factual'
        ? `${job.categoryName}類自動產文（事實型／編輯部，status: ${schedule.status}${schedule.scheduled ? '，' + schedule.dateYmd : ''}）。`
        : `${job.categoryName}類自動產文（status: ${schedule.status}${schedule.scheduled ? '，' + schedule.dateYmd : ''}）。真人觀點由作者提供。`;
  const commitSubject = isUpdate ? `feat(article): 滾動更新 — ${job.title}` : `feat(article): 自動產文 — ${job.title}`;
  sh('git', ['commit', '-m', `${commitSubject}\n\n${commitBody}`]);
  if (go) {
    console.log('→ push');
    const _pr = pushToMain({ cwd: process.cwd() });
    if (!_pr.ok) die(`推送 main 失敗：${_pr.err}`);
    if (schedule.pendingApproval) {
      console.log('✓ 已產出待審草稿並上推（建預覽頁、不進列表、不自動上線）。核可後才轉正。');
      if (slug) console.log(`PENDING_APPROVAL_SLUG=${slug}`); // 給外層解析
    } else {
      console.log(schedule.scheduled ? `✓ 已排程 ${schedule.dateYmd} 發佈。` : '✓ 已發佈上線。可進編輯器修改。');
      if (schedule.scheduled) console.log(`SCHEDULED_DATE=${schedule.dateYmd}`); // 給外層解析
    }
    if (url) console.log(`PUBLISHED_URL=${url}`);
  } else {
    console.log(`✓ 已 stage（commit 在分支 ${branch}，未 push）。審稿 OK 後 cherry-pick 到 main push 上線。`);
    if (url) console.log(`STAGED_SLUG=${slug}`);
  }
}

// 只有「直接執行」才跑；被 import（測試）時不執行、零副作用。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e?.stack || e?.message || String(e));
    process.exit(1);
  });
}
