// 主題追蹤的純轉換層：解析 frontmatter → 主題成員 → 成效加總 → Slack table blocks。
// 無 I/O（不讀檔、不打網路、不發 Slack），全部由 scripts/topic-tracker.mjs 餵資料，方便測試。
//
// 呈現規格（站長 2026-08-08 拍板）：
//   ① 頻道主層每週一則「主題總表」——唯一放成效的地方（曝光/點擊/排名 ＝ 收錄文章加總，
//      不是主題頁自己，那個量太小看不出東西）。
//   ② 每個主題一條 thread，父訊息只發一次；**thread 只記成員增減**，沒有增減就完全不回覆。
// 版面用 Slack 原生 table block（限 100 列 / 20 欄 / 全表 10,000 字元）。
// 🔴 不要退回用 `|` 排的假表格——手機換行會全崩，2026-06-25 踩過（lessons/weekly-report-mobile-layout.md）。

/** frontmatter 區塊（沒有就回空字串）。 */
export function frontmatterOf(raw) {
  return String(raw ?? '').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

/** 取單一純量欄位（引號可有可無）。 */
export function fmValue(fm, key) {
  return fm.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]*)`, 'm'))?.[1]?.trim() || '';
}

/**
 * 取清單欄位，同時吃 YAML 兩種寫法：
 *   topics: ["a", "b"]        （行內）
 *   topics:\n  - a\n  - b     （區塊）
 * 只用 fmValue 判斷清單會在第一個引號截斷（`["a`），所以清單一律走這支。
 */
export function fmList(fm, key) {
  const inline = fm.match(new RegExp(`^${key}:\\s*\\[(.*?)\\]`, 'm'))?.[1];
  if (inline != null) return inline.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  const block = fm.match(new RegExp(`^${key}:\\s*\\n((?:\\s*-\\s*.+\\n?)+)`, 'm'))?.[1];
  if (!block) return [];
  return block.split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

/** 文章 .md → { slug, title, category, topics, publishDate, isPublic }。fileSlug ＝檔名（無副檔名）。 */
export function parseArticle(raw, fileSlug, now = new Date()) {
  const fm = frontmatterOf(raw);
  const slug = fmValue(fm, 'slug') || fileSlug;
  const status = fmValue(fm, 'status') || 'published';
  const draft = /^draft:\s*true\s*$/m.test(fm);
  const publishDate = fmValue(fm, 'publishDate');
  const future = publishDate ? new Date(publishDate).getTime() > now.getTime() : false;
  return {
    slug,
    title: fmValue(fm, 'title') || slug,
    category: fmValue(fm, 'category'),
    topics: fmList(fm, 'topics'),
    publishDate,
    // 與站上 getPublishedArticles() 對齊：排程稿（未到時間）與 draft 不算數。
    isPublic: !draft && !(status === 'scheduled' && future),
  };
}

/** 主題 .md → { id, title, category, status, articles }。 */
export function parseTopic(raw, id) {
  const fm = frontmatterOf(raw);
  return {
    id,
    title: fmValue(fm, 'title') || id,
    category: fmValue(fm, 'category'),
    status: fmValue(fm, 'status') || 'active',
    articles: fmList(fm, 'articles'),
  };
}

/**
 * 主題成員＝frontmatter 手動指定的 articles ∪ 文章自己 topics 反向關聯（與 topics/[slug].astro 同規則）。
 * 只收已公開的文章；回傳依 publishDate 新到舊。
 */
export function membersOf(topic, articles) {
  const manual = new Set(topic.articles);
  const out = articles.filter((a) => a.isPublic && (manual.has(a.slug) || a.topics.includes(topic.id)));
  return out.sort((x, y) => String(y.publishDate).localeCompare(String(x.publishDate)));
}

/** 成員 slug 與上次快照比對。回 { added, removed }（皆為 slug 陣列）。 */
export function diffMembers(prevSlugs = [], curSlugs = []) {
  const prev = new Set(prevSlugs);
  const cur = new Set(curSlugs);
  return {
    added: curSlugs.filter((s) => !prev.has(s)),
    removed: prevSlugs.filter((s) => !cur.has(s)),
  };
}

/**
 * 成員文章的成效加總。byPath ＝ { '/articles/<slug>/': { impressions, clicks, position, views } }。
 * 平均排名用曝光加權（直接算術平均會被零曝光的長尾拉歪）。
 */
export function aggregate(members, byPath = {}) {
  let impressions = 0, clicks = 0, views = 0, posWeighted = 0, withImpressions = 0;
  for (const m of members) {
    const r = byPath[`/articles/${m.slug}/`] || {};
    const imp = Number(r.impressions || 0);
    impressions += imp;
    clicks += Number(r.clicks || 0);
    views += Number(r.views || 0);
    if (imp > 0) { posWeighted += Number(r.position || 0) * imp; withImpressions++; }
  }
  return {
    impressions,
    clicks,
    views,
    position: impressions > 0 ? posWeighted / impressions : null,
    withImpressions,
  };
}

/** 近 N 天內發佈的成員篇數。 */
export function recentCount(members, days = 90, now = new Date()) {
  const cut = now.getTime() - days * 86400000;
  return members.filter((m) => m.publishDate && new Date(m.publishDate).getTime() >= cut).length;
}

/**
 * 狀態燈號（純規則、不喚 LLM）：
 *   🟢 近 90 天有新文且曝光成長；🟡 有新文但曝光持平/下滑；🔴 近 90 天 0 篇。
 */
export function topicStatus({ recent90, impressions, prevImpressions }) {
  if (!recent90) return '🔴';
  return impressions > prevImpressions ? '🟢' : '🟡';
}

const nf = (n) => Number(n || 0).toLocaleString('en-US');

/**
 * 與上週的差：▲/▼ + 絕對值；持平或無資料回 '—'。
 *
 * 🔴 箭頭是**語意方向**，不是數值方向：▲＝好消息、▼＝壞消息。
 * 曝光/點擊變多是好事（數值升＝▲）；**平均排名數字變小才是進步**，所以排名欄要傳
 * `betterWhenLower: true`，否則「8.4 ▼0.7」會被讀成退步——實際上那是進步（2026-08-08 站長指出）。
 */
export function delta(cur, prev, { digits = 0, betterWhenLower = false } = {}) {
  const a = Number(cur || 0), b = Number(prev || 0);
  const d = a - b;
  if (!Number.isFinite(d) || Math.abs(d) < (digits ? 0.05 : 0.5)) return '—';
  const v = digits ? Math.abs(d).toFixed(digits) : nf(Math.round(Math.abs(d)));
  const better = betterWhenLower ? d < 0 : d > 0;
  return `${better ? '▲' : '▼'}${v}`;
}

/** 「值 ▲差」一格。排名的差要反過來讀（數字變小是進步），所以另外標。 */
const cell = (text) => ({ type: 'raw_text', text: String(text) });
const linkCell = (text, url) => ({
  type: 'rich_text',
  elements: [{ type: 'rich_text_section', elements: [{ type: 'link', url, text: String(text) }] }],
});

/**
 * ① 主題總表（頻道主層）。rows ＝ [{ id, title, url, members, impressions, prevImpressions,
 * clicks, prevClicks, position, prevPosition, status }]，呼叫端已排序。
 */
export function summaryTable(rows) {
  const header = ['主題', '收錄', '曝光', '點擊', '排名', '狀態'].map(cell);
  const body = rows.map((r) => [
    linkCell(r.title, r.url),
    cell(nf(r.members)),
    cell(`${nf(r.impressions)} ${delta(r.impressions, r.prevImpressions)}`),
    cell(`${nf(r.clicks)} ${delta(r.clicks, r.prevClicks)}`),
    cell(r.position == null ? '—' : `${r.position.toFixed(1)} ${delta(r.position, r.prevPosition, { digits: 1, betterWhenLower: true })}`),
    cell(r.status),
  ]);
  return {
    type: 'table',
    column_settings: [{ is_wrapped: true }, { align: 'right' }, { align: 'right' }, { align: 'right' }, { align: 'right' }, { align: 'center' }],
    rows: [header, ...body],
  };
}

/** ② thread 內的成員增減表。changes ＝ [{ sign: '＋'|'－', title, url, category }]。 */
export function updateTable(changes) {
  const header = ['動作', '文章', '分類'].map(cell);
  const body = changes.map((c) => [cell(c.sign), linkCell(c.title, c.url), cell(c.category || '—')]);
  return {
    type: 'table',
    column_settings: [{ align: 'center' }, { is_wrapped: true }, { align: 'center' }],
    rows: [header, ...body],
  };
}

/**
 * table block 不被工作區支援時的退路：改用兩行制 mrkdwn（見 weekly-blocks.mjs 排版鐵則）。
 * 一行一個標的、標籤跟著數字，手機換行也讀得懂。
 */
export function summaryFallbackText(rows) {
  return rows
    .map((r) => `• <${r.url}|${r.title}> ${r.status}\n　收錄 ${nf(r.members)}・曝光 ${nf(r.impressions)} ${delta(r.impressions, r.prevImpressions)}・點擊 ${nf(r.clicks)} ${delta(r.clicks, r.prevClicks)}・排名 ${r.position == null ? '—' : r.position.toFixed(1)}`)
    .join('\n');
}

export function updateFallbackText(changes) {
  return changes.map((c) => `${c.sign} <${c.url}|${c.title}>（${c.category || '—'}）`).join('\n');
}
