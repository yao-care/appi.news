/**
 * 內容 schema 關聯驗證（build 前 gate）。
 *
 * 掃描 src/content/ 下 articles / authors / topics / columns 的 frontmatter，
 * 補上 Astro Content Collections 的 per-file zod schema 「做不到」的跨檔關聯與
 * 編輯政策檢查：
 *   - subcategory 是否屬於該 category（schema 裡 subcategory 只是 string）
 *   - author / coAuthors / reviewedBy / factCheckedBy / editor / topics / column /
 *     ownerAuthor 等指向的檔案是否存在
 *   - slug 全站唯一
 *   - updatedDate 與 publishDate 的先後關係
 *   - topic.articles 反查文章 slug
 *   - 商業內容揭露、健康/財經/法律免責、references 建議
 *
 * 基礎必填與 enum（title/description/publishDate/category、references.url 合法等）
 * Astro build 時已會驗證；這裡一併快速預檢，讓 `pnpm validate:content` 不必整包
 * build 就能拿到漂亮、分組的錯誤輸出。
 *
 * 規則：
 *   - 有 hard error → process.exit(1)
 *   - 只有 warning → process.exit(0)
 *   - 都沒有 → 顯示 ✓ Content validation passed
 *
 * 用法：
 *   pnpm validate:content            # 完整驗證（hard error 會 exit 1）
 *   node scripts/validate-content.mjs --report   # 只報告、永遠 exit 0（盤點用）
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');
const PUBLIC = join(ROOT, 'public');

const REPORT_ONLY = process.argv.includes('--report');

/* ------------------------------------------------------------------ */
/*  載入分類設定（單一事實來源）                                          */
/* ------------------------------------------------------------------ */

// categories.ts 為 TS，但內容是純資料；用 import() 載入需先轉譯，
// 故改以輕量解析取出 CATEGORIES 的 slug 與各自的 subcategories。
const { CATEGORY_SLUGS, SUBCATEGORIES_BY_CATEGORY } = await loadCategories();

async function loadCategories() {
  const src = readFileSync(join(ROOT, 'src', 'config', 'categories.ts'), 'utf8');
  // 逐個 category 物件抓 slug 與其 subcategories 區塊內的 slug。
  const slugs = [];
  const subsByCat = {};
  // 切出每個頂層 category：以 "slug: '...'," 為錨點，往後找該物件的 subcategories。
  const catRe = /slug:\s*'([^']+)'\s*,\s*\n\s*name:/g;
  let m;
  const anchors = [];
  while ((m = catRe.exec(src))) anchors.push({ slug: m[1], index: m.index });
  for (let i = 0; i < anchors.length; i++) {
    const start = anchors[i].index;
    const end = i + 1 < anchors.length ? anchors[i + 1].index : src.length;
    const block = src.slice(start, end);
    const slug = anchors[i].slug;
    slugs.push(slug);
    const subRe = /\{\s*slug:\s*'([^']+)'\s*,\s*name:/g;
    const subs = [];
    let s;
    while ((s = subRe.exec(block))) subs.push(s[1]);
    subsByCat[slug] = subs;
  }
  if (slugs.length === 0) {
    throw new Error('無法從 src/config/categories.ts 解析出分類 slug，請檢查解析邏輯');
  }
  return { CATEGORY_SLUGS: slugs, SUBCATEGORIES_BY_CATEGORY: subsByCat };
}

/* ------------------------------------------------------------------ */
/*  工具                                                               */
/* ------------------------------------------------------------------ */

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.md') || p.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function rel(p) {
  return relative(ROOT, p).split('\\').join('/');
}

/** 讀檔並解析 frontmatter；回傳 { data, error } */
function parseFrontmatter(file) {
  const raw = readFileSync(file, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return { data: null, error: '找不到 frontmatter（檔案開頭需有 --- 區塊）' };
  try {
    const data = yaml.load(fmMatch[1]);
    if (data == null || typeof data !== 'object') {
      return { data: null, error: 'frontmatter 解析結果不是物件' };
    }
    return { data, error: null };
  } catch (e) {
    return { data: null, error: `frontmatter YAML 解析失敗：${e.message}` };
  }
}

function isValidDate(v) {
  if (v == null) return false;
  const d = v instanceof Date ? v : new Date(v);
  return !Number.isNaN(d.getTime());
}
function toDate(v) {
  return v instanceof Date ? v : new Date(v);
}
function isValidUrl(v) {
  if (typeof v !== 'string' || v.trim() === '') return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
function publicExists(p) {
  if (typeof p !== 'string' || p.trim() === '') return false;
  const cleaned = p.replace(/^\//, '');
  return existsSync(join(PUBLIC, cleaned));
}

/* ------------------------------------------------------------------ */
/*  問題收集器：以檔案分組                                               */
/* ------------------------------------------------------------------ */

// Map<filepath, { errors: string[], warnings: string[] }>
const issues = new Map();
function bucket(file) {
  const key = rel(file);
  if (!issues.has(key)) issues.set(key, { errors: [], warnings: [] });
  return issues.get(key);
}
function err(file, msg) {
  bucket(file).errors.push(msg);
}
function warn(file, msg) {
  bucket(file).warnings.push(msg);
}

/* ------------------------------------------------------------------ */
/*  先建立各 collection 的 slug 集合（供關聯檢查）                        */
/* ------------------------------------------------------------------ */

const articleFiles = walk(join(CONTENT, 'articles'));
const authorFiles = walk(join(CONTENT, 'authors'));
const topicFiles = walk(join(CONTENT, 'topics'));
const columnFiles = walk(join(CONTENT, 'columns'));

/** 檔名（去副檔名）→ slug 集合 */
function fileSlugSet(files) {
  const set = new Set();
  for (const f of files) {
    const base = f.split('/').pop().replace(/\.(md|mdx)$/, '');
    set.add(base);
  }
  return set;
}

const authorSlugs = fileSlugSet(authorFiles);
const topicSlugs = fileSlugSet(topicFiles);
const columnSlugs = fileSlugSet(columnFiles);

// 文章 slug：frontmatter slug 優先，否則檔名。先建好供 topic.articles 反查。
const articleParsed = articleFiles.map((file) => {
  const { data, error } = parseFrontmatter(file);
  const base = file.split('/').pop().replace(/\.(md|mdx)$/, '');
  const slug = data && typeof data.slug === 'string' && data.slug.trim() !== '' ? data.slug : base;
  return { file, data, error, slug, base };
});
const articleSlugSet = new Set(articleParsed.map((a) => a.slug));

/* ------------------------------------------------------------------ */
/*  共用：作者關聯檢查                                                   */
/* ------------------------------------------------------------------ */

function checkAuthorRefs(file, field, value) {
  const list = Array.isArray(value) ? value : value == null ? [] : [value];
  for (const slug of list) {
    if (typeof slug !== 'string' || slug.trim() === '') continue;
    if (!authorSlugs.has(slug)) {
      err(file, `${field} "${slug}" 在 src/content/authors/ 找不到對應作者檔`);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  驗證 articles                                                       */
/* ------------------------------------------------------------------ */

const LEGAL_KEYWORDS = ['法規', '合規', '法律', '訴訟', '契約', '個資', '主管機關'];

// slug 唯一性：slug → [檔案...]
const slugOwners = new Map();

for (const { file, data, error, slug } of articleParsed) {
  if (error) {
    err(file, error);
    continue;
  }

  // 收集 slug 供唯一性檢查
  if (!slugOwners.has(slug)) slugOwners.set(slug, []);
  slugOwners.get(slug).push(rel(file));

  // A. 必填欄位
  for (const f of ['title', 'description', 'publishDate', 'category']) {
    if (data[f] == null || (typeof data[f] === 'string' && data[f].trim() === '')) {
      err(file, `缺少必填欄位 ${f}`);
    }
  }

  // B. category 合法
  const category = data.category;
  const categoryValid = typeof category === 'string' && CATEGORY_SLUGS.includes(category);
  if (category != null && !categoryValid) {
    err(file, `category "${category}" 不是合法分類，合法值：${CATEGORY_SLUGS.join(', ')}`);
  }

  // C. subcategory 必須屬於該 category
  if (data.subcategory != null && data.subcategory !== '') {
    if (!categoryValid) {
      // category 本身不合法時，subcategory 無從驗證；category 已報錯，這裡略過
    } else {
      const validSubs = SUBCATEGORIES_BY_CATEGORY[category] || [];
      if (!validSubs.includes(data.subcategory)) {
        err(
          file,
          `subcategory "${data.subcategory}" 不屬於 category "${category}"\n` +
            `    合法 subcategory：${validSubs.join(', ')}`,
        );
      }
    }
  }

  // D. author（未填視為 appi-editorial）
  const author = data.author != null && data.author !== '' ? data.author : 'appi-editorial';
  if (!authorSlugs.has(author)) {
    err(file, `author "${author}" 在 src/content/authors/ 找不到對應作者檔`);
  }

  // E. coAuthors / reviewedBy / factCheckedBy / editor
  checkAuthorRefs(file, 'coAuthors', data.coAuthors);
  checkAuthorRefs(file, 'reviewedBy', data.reviewedBy);
  checkAuthorRefs(file, 'factCheckedBy', data.factCheckedBy);
  checkAuthorRefs(file, 'editor', data.editor);

  // G. 日期
  if (data.publishDate != null && !isValidDate(data.publishDate)) {
    err(file, `publishDate 不是合法日期：${JSON.stringify(data.publishDate)}`);
  }
  if (data.updatedDate != null) {
    if (!isValidDate(data.updatedDate)) {
      err(file, `updatedDate 不是合法日期：${JSON.stringify(data.updatedDate)}`);
    } else if (isValidDate(data.publishDate)) {
      const pub = toDate(data.publishDate);
      const upd = toDate(data.updatedDate);
      if (upd.getTime() < pub.getTime()) {
        err(
          file,
          `updatedDate（${upd.toISOString()}）早於 publishDate（${pub.toISOString()}）`,
        );
      } else if (upd.getTime() === pub.getTime()) {
        warn(
          file,
          `updatedDate 與 publishDate 相同（${pub.toISOString()}），建議移除 updatedDate（前台不需顯示同日更新）`,
        );
      }
    }
  }

  // H. topics
  if (Array.isArray(data.topics)) {
    for (const t of data.topics) {
      if (typeof t !== 'string' || t.trim() === '') continue;
      if (!topicSlugs.has(t)) {
        err(file, `topic "${t}" 在 src/content/topics/ 找不到對應檔`);
      }
    }
  }

  // I. column
  if (data.column != null && data.column !== '') {
    if (!columnSlugs.has(data.column)) {
      err(file, `column "${data.column}" 在 src/content/columns/ 找不到對應檔`);
    }
  }

  // J. references
  const refs = Array.isArray(data.references) ? data.references : [];
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    if (r == null || typeof r !== 'object') {
      err(file, `references[${i}] 格式不正確`);
      continue;
    }
    if (r.title == null || (typeof r.title === 'string' && r.title.trim() === '')) {
      err(file, `references[${i}] 缺少 title`);
    }
    if (r.url != null && r.url !== '' && !isValidUrl(r.url)) {
      err(file, `references[${i}] 的 url 不是合法網址：${JSON.stringify(r.url)}`);
    }
  }
  // references 建議（warning）
  const recommendRefs =
    category === 'health' ||
    category === 'finance' ||
    ['medical', 'financial', 'legal'].includes(data.disclaimerType) ||
    ['research-brief', 'analysis', 'guide'].includes(data.contentType);
  if (recommendRefs && refs.length === 0) {
    warn(
      file,
      `category/disclaimerType/contentType 屬須佐證類型（${[category, data.disclaimerType, data.contentType]
        .filter(Boolean)
        .join(' / ')}），建議至少附一筆 references`,
    );
  }

  // K. 商業內容揭露
  const commercialSource = ['sponsored', 'press-release', 'partner'];
  const isCommercial =
    commercialSource.includes(data.sourceType) ||
    ['sponsored', 'press-release'].includes(data.contentType) ||
    data.disclaimerType === 'sponsored';
  if (isCommercial) {
    if (['editorial', 'author'].includes(data.sourceType)) {
      err(
        file,
        `商業內容（contentType/disclaimerType 指向商業）卻使用 sourceType "${data.sourceType}"，` +
          `須改為 sponsored / press-release / partner 之一`,
      );
    } else if (!commercialSource.includes(data.sourceType)) {
      // sourceType 既非商業也非 editorial/author（例如 contributor/expert/wire），提醒釐清
      err(
        file,
        `商業內容的 sourceType "${data.sourceType ?? '(未填)'}" 不在 sponsored / press-release / partner 之內`,
      );
    }
    if (data.disclaimerType !== 'sponsored') {
      warn(file, `商業內容建議 disclaimerType 設為 sponsored（目前：${data.disclaimerType ?? '(未填)'}）`);
    }
    if (data.disclosure != null && String(data.disclosure).trim() === '') {
      err(file, `disclosure 不可為空字串（若無自訂揭露請直接移除該欄位，DisclosureBox 會依 sourceType 顯示預設揭露）`);
    }
  }

  // L. 高風險內容免責
  if (category === 'health' && data.disclaimerType !== 'medical') {
    warn(file, `category 為 health 但 disclaimerType 不是 medical（目前：${data.disclaimerType ?? '(未填)'}）`);
  }
  if (category === 'finance' && data.disclaimerType !== 'financial') {
    warn(file, `category 為 finance 但 disclaimerType 不是 financial（目前：${data.disclaimerType ?? '(未填)'}）`);
  }
  // 法律字眼檢查只看「標題」且僅在「尚未設任何特定免責」時提醒：
  //   - disclaimerType 是單一值，health→medical、finance→financial 已涵蓋該文主要
  //     風險領域，無法再疊 legal，對這類文章不應再要求改 legal（否則永遠誤報）。
  //   - 法律字眼只出現在 description / tags（標題未涉）多為順帶提及，不據此要求 legal。
  // 真正需要 legal 免責的目標：標題本身即涉法律/法規/訴訟…且還沒設任何特定免責者。
  const title = typeof data.title === 'string' ? data.title : '';
  const hitLegalTitle = LEGAL_KEYWORDS.filter((k) => title.includes(k));
  const noSpecificDisclaimer = data.disclaimerType == null || data.disclaimerType === 'general';
  if (hitLegalTitle.length > 0 && noSpecificDisclaimer) {
    warn(
      file,
      `標題出現法律相關字眼（${hitLegalTitle.join('、')}）但未設 legal 免責（disclaimerType 目前：${data.disclaimerType ?? '(未填)'}）`,
    );
  }

  // M. coverImage
  if (data.coverImage != null && data.coverImage !== '') {
    if (!publicExists(data.coverImage)) {
      warn(file, `coverImage 對應檔案不存在：public/${String(data.coverImage).replace(/^\//, '')}`);
    }
    if (data.coverAlt == null || String(data.coverAlt).trim() === '') {
      warn(file, `有 coverImage 但缺少 coverAlt`);
    }
  }
}

// F. slug 唯一性
for (const [slug, owners] of slugOwners) {
  if (owners.length > 1) {
    for (const o of owners) {
      const others = owners.filter((x) => x !== o);
      issues.get(o)?.errors.push(`slug "${slug}" 重複，與 ${others.join(', ')} 衝突`) ??
        (issues.set(o, { errors: [`slug "${slug}" 重複，與 ${others.join(', ')} 衝突`], warnings: [] }));
    }
  }
}

/* ------------------------------------------------------------------ */
/*  驗證 authors                                                        */
/* ------------------------------------------------------------------ */

for (const file of authorFiles) {
  const { data, error } = parseFrontmatter(file);
  if (error) {
    err(file, error);
    continue;
  }

  // A. 必填
  if (data.name == null || String(data.name).trim() === '') {
    err(file, `缺少必填欄位 name`);
  }

  // B. showAuthorPage 建議欄位
  if (data.showAuthorPage === true) {
    for (const f of ['bioShort', 'displayTitle', 'credentials', 'specialties']) {
      const v = data[f];
      const empty =
        v == null ||
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        warn(file, `showAuthorPage 為 true，建議補上 ${f}`);
      }
    }
  }

  // C. avatar / portrait
  for (const f of ['avatar', 'portrait']) {
    if (data[f] != null && data[f] !== '' && !publicExists(data[f])) {
      warn(file, `${f} 對應檔案不存在：public/${String(data[f]).replace(/^\//, '')}`);
    }
  }

  // D. socialLinks
  if (Array.isArray(data.socialLinks)) {
    for (let i = 0; i < data.socialLinks.length; i++) {
      const s = data.socialLinks[i];
      if (s == null || typeof s !== 'object') {
        err(file, `socialLinks[${i}] 格式不正確`);
        continue;
      }
      if (s.label == null || String(s.label).trim() === '') {
        err(file, `socialLinks[${i}] 缺少 label`);
      }
      if (!isValidUrl(s.url)) {
        err(file, `socialLinks[${i}] 的 url 不是合法網址：${JSON.stringify(s.url)}`);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  驗證 topics                                                         */
/* ------------------------------------------------------------------ */

for (const file of topicFiles) {
  const { data, error } = parseFrontmatter(file);
  if (error) {
    err(file, error);
    continue;
  }

  // A. 必填
  if (data.title == null || String(data.title).trim() === '') {
    err(file, `缺少必填欄位 title`);
  }

  // B. category
  if (data.category != null && data.category !== '' && !CATEGORY_SLUGS.includes(data.category)) {
    err(file, `category "${data.category}" 不是合法分類，合法值：${CATEGORY_SLUGS.join(', ')}`);
  }

  // C. articles
  if (Array.isArray(data.articles)) {
    for (const a of data.articles) {
      if (typeof a !== 'string' || a.trim() === '') continue;
      if (!articleSlugSet.has(a)) {
        err(file, `articles 內的 "${a}" 找不到對應文章 slug`);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  驗證 columns                                                        */
/* ------------------------------------------------------------------ */

for (const file of columnFiles) {
  const { data, error } = parseFrontmatter(file);
  if (error) {
    err(file, error);
    continue;
  }

  // A. 必填
  for (const f of ['title', 'ownerAuthor']) {
    if (data[f] == null || String(data[f]).trim() === '') {
      err(file, `缺少必填欄位 ${f}`);
    }
  }

  // B. ownerAuthor
  if (data.ownerAuthor != null && data.ownerAuthor !== '' && !authorSlugs.has(data.ownerAuthor)) {
    err(file, `ownerAuthor "${data.ownerAuthor}" 在 src/content/authors/ 找不到對應作者檔`);
  }

  // C. coAuthors
  checkAuthorRefs(file, 'coAuthors', data.coAuthors);

  // D. category
  if (data.category != null && data.category !== '' && !CATEGORY_SLUGS.includes(data.category)) {
    err(file, `category "${data.category}" 不是合法分類，合法值：${CATEGORY_SLUGS.join(', ')}`);
  }
}

/* ------------------------------------------------------------------ */
/*  輸出                                                                */
/* ------------------------------------------------------------------ */

let totalErrors = 0;
let totalWarnings = 0;
const errorFiles = [];
const warningFiles = [];

for (const [file, { errors, warnings }] of issues) {
  totalErrors += errors.length;
  totalWarnings += warnings.length;
  if (errors.length) errorFiles.push([file, errors]);
  else if (warnings.length) warningFiles.push([file, warnings]);
}

if (totalErrors === 0 && totalWarnings === 0) {
  console.log('✓ Content validation passed');
  process.exit(0);
}

if (totalErrors > 0) {
  console.log('✗ Content validation failed\n');
} else {
  console.log('⚠ Content validation passed with warnings\n');
}

for (const [file, errors] of errorFiles) {
  console.log(`[ERROR] ${file}`);
  for (const e of errors) console.log(`  - ${e}`);
  const w = issues.get(file).warnings;
  for (const x of w) console.log(`  - (warning) ${x}`);
  console.log('');
}

for (const [file, warnings] of warningFiles) {
  console.log(`[WARNING] ${file}`);
  for (const w of warnings) console.log(`  - ${w}`);
  console.log('');
}

console.log('Summary:');
console.log(`  Errors: ${totalErrors}`);
console.log(`  Warnings: ${totalWarnings}`);
console.log(
  `  Scanned: ${articleFiles.length} articles, ${authorFiles.length} authors, ${topicFiles.length} topics, ${columnFiles.length} columns`,
);

if (REPORT_ONLY) {
  console.log('\n(--report 模式：永遠 exit 0)');
  process.exit(0);
}
process.exit(totalErrors > 0 ? 1 : 0);
