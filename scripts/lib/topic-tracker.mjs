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
 * 與上週的差。持平或無資料回 '—'。
 *
 * 🔴 符號是**語意方向、不是數值方向**：好消息用 🔺（醒目），壞消息用 `-`（低調）。
 * 站長 2026-08-08 指定這種不對稱寫法：漲的時候要跳出來，跌的時候不要一片紅。
 * 曝光/點擊變多＝好；**平均排名數字變小才是進步**，所以排名欄要傳 `betterWhenLower: true`，
 * 否則「8.4 -0.7」會被讀成退步——實際上那是進步。
 */
export function delta(cur, prev, { digits = 0, betterWhenLower = false } = {}) {
  const a = Number(cur || 0), b = Number(prev || 0);
  const d = a - b;
  if (!Number.isFinite(d) || Math.abs(d) < (digits ? 0.05 : 0.5)) return '—';
  const v = digits ? Math.abs(d).toFixed(digits) : nf(Math.round(Math.abs(d)));
  const better = betterWhenLower ? d < 0 : d > 0;
  return better ? `🔺${v}` : `-${v}`;
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
  // 表頭帶單位（站長 2026-08-08）：用括號單位而不是「收錄篇數」，省欄寬又講清楚量的是什麼。
  // 「排名」不加單位——「名」字本身就是單位，寫成「排名（名）」是重複。
  // 也不要在表頭或表格上方掛「與上週對照」的說明文字（站長指定），符號自己會講。
  const header = ['主題', '收錄（篇）', '曝光（次）', '點擊（次）', '排名', '狀態'].map(cell);
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

// ── 每週主題優化計畫（純規則，不喚 LLM）─────────────────────────────────────
// 產出會寫進 seo-ops 的站台 playbook，成為反思層/大腦層每天的 context（兩層都把整份
// playbook 塞進 prompt）。所以「動作」必須落在 playbook 白名單內，否則 reflect-guard 會擋：
//   反思(reflect:scope)＝src/pages/**、src/components/seo/**、src/content/topics/**（頁組/內鏈/主題頁文案）
//   大腦(brain:scope)  ＝src/content/articles/**（單篇 meta/內文）
// 每週最多派 3 個標的——playbook 站規是「每天最多改 3 個檔」，給一長串等於沒給。

/** 主題頁自己的訊號 → 該派哪一層、做什麼。回 null 代表這個主題本週沒有可行動訊號。 */
export function pickLever(row) {
  const p = row.page || {};
  const imp = Number(p.impressions || 0);
  const clicks = Number(p.clicks || 0);
  const pos = p.position == null ? null : Number(p.position);

  // ① 排 5–15 名（striking distance）：改主題頁 description 貼近查詢詞，最高槓桿。
  if (pos != null && pos >= 5 && pos <= 15 && clicks < 3) {
    return { owner: '反思', action: '改主題頁 description 貼近查詢詞', reason: `主題頁排 ${pos.toFixed(1)} 名、點擊 ${clicks}`, priority: 3 };
  }
  // ② 有曝光但 0 點擊：同樣先動 meta，並補 FAQ 結構化資料。
  if (imp >= 20 && clicks === 0) {
    return { owner: '反思', action: '改主題頁 description ＋ 補 FAQ 結構化資料', reason: `主題頁曝光 ${imp}、點擊 0`, priority: 2 };
  }
  // ③ 收錄夠厚但主題頁自己沒曝光：是入口問題不是內容問題，補內鏈密度。
  if (row.members >= 15 && imp < 10) {
    return { owner: '反思', action: '補分類頁／相關文章的主題入口內鏈', reason: `收錄 ${row.members} 篇但主題頁曝光僅 ${imp}`, priority: 1 };
  }
  // ④ 成員文章有需求、主題頁吃不到：交給大腦改該主題內最有機會的單篇 meta。
  if (row.impressions >= 100 && clicks === 0) {
    return { owner: '大腦', action: '挑該主題內曝光最高、點擊為 0 的成員文章改 meta', reason: `收錄文章加總曝光 ${row.impressions}、主題頁 0 點擊`, priority: 1 };
  }
  return null;
}

/**
 * 依訊號挑本週標的。rows 需含 page（主題頁自己的 GSC 數字）。
 * 回 { targets:[{id,title,url,owner,action,reason}], stale:[{id,title}] }。
 * stale（🔴 近 90 天 0 篇）**不派給大腦**——那是選題問題，大腦層無權新增內容，列出來給編輯部。
 */
export function optimizationPlan(rows, { max = 3 } = {}) {
  const scored = [];
  for (const r of rows) {
    const lever = pickLever(r);
    if (lever) scored.push({ ...r, ...lever });
  }
  scored.sort((a, b) => b.priority - a.priority || b.impressions - a.impressions);
  return {
    targets: scored.slice(0, max).map((t) => ({
      id: t.id, title: t.title, url: t.url, owner: t.owner, action: t.action, reason: t.reason,
    })),
    stale: rows.filter((r) => r.status === '🔴').map((r) => ({ id: r.id, title: r.title })),
  };
}

/** 上週派的標的這週有沒有起色（曝光/排名比較）。prevTargets 來自帳本。 */
export function planReview(prevTargets = [], rows = []) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return prevTargets.map((t) => {
    const now = byId.get(t.id);
    if (!now) return { id: t.id, title: t.title, verdict: '主題已下架或改名' };
    const impNow = Number(now.page?.impressions || 0);
    const posNow = now.page?.position == null ? null : Number(now.page.position);
    const impWas = Number(t.impressions || 0);
    const posWas = t.position == null ? null : Number(t.position);
    const better = impNow > impWas || (posNow != null && posWas != null && posNow < posWas);
    return {
      id: t.id,
      title: t.title,
      verdict: `${better ? '有起色' : '沒起色'}：曝光 ${impWas}→${impNow}${posWas != null && posNow != null ? `、排名 ${posWas.toFixed(1)}→${posNow.toFixed(1)}` : ''}`,
    };
  });
}

/** 計畫 → Slack 表（主題／負責層／動作）。 */
export function planTable(targets) {
  const header = ['主題', '交給', '本週動作'].map(cell);
  const body = targets.map((t) => [linkCell(t.title, t.url), cell(t.owner), cell(t.action)]);
  return {
    type: 'table',
    column_settings: [{ is_wrapped: true }, { align: 'center' }, { is_wrapped: true }],
    rows: [header, ...body],
  };
}

export function planFallbackText(targets) {
  return targets.map((t) => `• <${t.url}|${t.title}>（${t.owner}）\n　${t.action}——${t.reason}`).join('\n');
}

/** 計畫 → playbook 用的 markdown（每週覆寫，內容要能被反思/大腦當指令讀）。 */
export function planMarkdown({ period, targets, stale, review = [] }) {
  const lines = [`> 本區塊由 \`scripts/topic-tracker.mjs\` 每週一自動覆寫（資料期間 ${period}），下面是本週主題層的派工。`, ''];
  if (!targets.length) {
    lines.push('- 本週沒有可行動的主題訊號（都沒到 striking distance、也沒有入口缺口），主題層不派工。');
  } else {
    for (const t of targets) {
      lines.push(`- **${t.title}**（\`/topics/${t.id}/\`）→ **${t.owner}**：${t.action}。依據：${t.reason}。`);
    }
  }
  if (review.length) {
    lines.push('', '上週派工回顧：');
    for (const r of review) lines.push(`- ${r.title}：${r.verdict}`);
  }
  if (stale.length) {
    lines.push('', `停滯主題（近 90 天 0 篇新文，**不派給大腦**，屬選題問題）：${stale.map((s) => s.title).join('、')}`);
  }
  return lines.join('\n');
}

/**
 * 把計畫寫回 playbook 的專屬區塊（不碰人工共筆的 strategy 區塊）。
 * 找不到標記就附加到檔尾。回新的檔案內容（純函式，寫檔由呼叫端負責）。
 */
export const PLAN_MARK_START = '<!-- playbook:topics:start 每週主題優化計畫（由 appi.news 的 topic-tracker.mjs 自動覆寫；人工要調整改那支的規則）-->';
export const PLAN_MARK_END = '<!-- playbook:topics:end -->';

export function upsertPlanBlock(playbook, markdown) {
  const block = `${PLAN_MARK_START}\n${markdown}\n${PLAN_MARK_END}`;
  const re = new RegExp(`${PLAN_MARK_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${PLAN_MARK_END}`);
  if (re.test(playbook)) return playbook.replace(re, block);
  return `${playbook.trimEnd()}\n\n# 主題層每週派工\n\n${block}\n`;
}
