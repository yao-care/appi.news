// 純轉換：吃 weekly-data.mjs + seo-opportunities.mjs 的結構化 JSON → 手機可讀且緊湊的 Block Kit blocks。
// 設計動機：週報以前由模型每週手刻 blocks，常把「query｜曝光｜排名｜CTR」四欄塞進一行，手機換行後對不齊、無法閱讀。
// 解法：版面交給這支決定論渲染器，模型只負責填質性一句話 notes（pageType/seoHealth/page2/titleCtr/traffic）。
// 排版鐵則（手機優先 + 緊湊）：
//   1. 列表項用單行：粗體標的 +「ASCII 空格」+ 標籤化 metrics（曝光 X・排名 Y・CTR Z%）。標籤跟著數字，換行也讀得懂。
//   2. 粗體鐵律：closing `*` 後面只能接 ASCII 空白或換行，**絕不可緊接全形標點**（（）〔〕　…）。
//      Slack mrkdwn 只在 `*` 後是「字界」時才收斂粗體，緊接全形 `（` 不算字界 → 整段 `*` 原樣外露（2026-06 踩過）。
//   3. 質性判讀（notes）走 context block（小灰字），與數據視覺分層、又不占版面。
//   4. 區塊標題不再掛冗長括號說明（要說明就放 notes），維持緊湊。
// 無 I/O、好測。

const PAGE_TYPE_LABEL = {
  home: '首頁', article: '文章內文', author: '作者頁', category: '分類索引',
  column: '專欄', topic: '專題', tag: '標籤', page: '其他頁',
};
const CATEGORY_LABEL = {
  focus: '焦點', international: '國際', health: '健康', tech: '科技',
  finance: '財經', sports: '運動', lifestyle: '生活', uncategorized: '未分類',
};

const IND = '　'; // U+3000 全形空格，當行首縮排（手機看得到，但只用在行首、不接在 `*` 後）

const num = (n) => Number(n || 0).toLocaleString('en-US');
const wow = (p) => (p == null ? '' : `（${p > 0 ? '+' : ''}${p}%）`); // null → 不顯示（緊湊）
const pos = (n) => (n == null ? '—' : (Math.round(Number(n) * 10) / 10).toString());
const ctr = (frac) => (frac == null ? '—' : `${Math.round(Number(frac) * 1000) / 10}%`);
const mdShort = (ymd) => {
  const [, m, d] = String(ymd || '').split('-');
  return m && d ? `${+m}/${+d}` : String(ymd || '');
};
const pageTypeLabel = (t) => PAGE_TYPE_LABEL[t] || t;
const categoryLabel = (c) => CATEGORY_LABEL[c] || c;

const section = (text) => ({ type: 'section', text: { type: 'mrkdwn', text } });
const context = (text) => ({ type: 'context', elements: [{ type: 'mrkdwn', text: `↳ ${text}` }] });
const divider = () => ({ type: 'divider' });

/** 三欄 metrics 字串（曝光/排名/CTR）。 */
const metrics3 = (impressions, position, c) => `曝光 ${num(impressions)}・排名 ${pos(position)}・CTR ${ctr(c)}`;

/** 去掉協定+網域只留 pathname、把 %E6%B2%B9 這類 percent-encoding 解回中文（GSC 的 page 常是整串編碼 URL）。 */
function prettyPath(p) {
  let s = String(p || '').replace(/^https?:\/\/[^/]+/, '');
  try { s = decodeURIComponent(s); } catch { /* 壞編碼就原樣 */ }
  return s;
}

/** 縮短過長路徑：先正規化，再保留開頭與結尾、中段以 … 省略（避免一條 URL 占滿整段）。 */
function shortPath(p, max = 32) {
  const s = prettyPath(p);
  if (s.length <= max) return s;
  const head = Math.ceil((max - 1) * 0.5);
  const tail = max - 1 - head;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

/**
 * report 結構（皆可選，缺的區塊自動略過）：
 * {
 *   period: { start, end },
 *   articlePerf: { topArticles:[{path,views,avgEngagementSec}], byPageType:[{type,views,wowPct}], byArticleCategory:[{category,views,wowPct}] },
 *   seoHealth: { pagesInSearch, totalImpressions, totalClicks, avgPosition },
 *   searchOpportunities: [{ query, impressions, ctr, position }],
 *   seoOpportunities: { pageOpportunities:[{page,category,impressions,position,ctr}], titleCtrCandidates:[{query,page,category,impressions,position,ctr}] },
 *   trafficHealth: { users, usersWoWPct, sources:[{source,users}], aiReferrals:[{source,users}] },
 *   notes: { pageType, seoHealth, page2, titleCtr, traffic },  // 模型填的質性一句話 → context 小灰字
 *   geoText: '...',           // AI 引用量測一句話（可選）
 *   generatedAt: '...'        // 產生時間字串（可選）
 * }
 */
export function weeklyReportBlocks(report = {}) {
  const r = report || {};
  const notes = r.notes || {};
  const blocks = [];
  const note = (key) => { if (notes[key]) blocks.push(context(notes[key])); };

  const period = r.period || {};
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: `📊 APPI News 週報　${mdShort(period.start)}–${mdShort(period.end)}`, emoji: true },
  });

  // ① 文章 / 分類表現 — Top 頁面 + 頁面類型 + 分類動能 併成一個 section（緊湊）
  const ap = r.articlePerf || {};
  const parts = ['*① 文章 / 分類表現*'];
  if (ap.topArticles?.length) {
    const lines = ap.topArticles.slice(0, 3).map(
      (a, i) => `${i + 1}. \`${shortPath(a.path)}\`　${num(a.views)}・${a.avgEngagementSec ?? 0}s`,
    );
    parts.push(`*Top 頁面*\n${lines.join('\n')}`);
  }
  if (ap.byPageType?.length) {
    const lines = ap.byPageType.slice(0, 5).map((t) => `${IND}${pageTypeLabel(t.type)}　${num(t.views)}${wow(t.wowPct)}`);
    parts.push(`*頁面類型*\n${lines.join('\n')}`);
  }
  if (ap.byArticleCategory?.length) {
    const lines = ap.byArticleCategory.slice(0, 5).map((c) => `${IND}${categoryLabel(c.category)}　${num(c.views)}${wow(c.wowPct)}`);
    parts.push(`*分類動能*\n${lines.join('\n')}`);
  }
  blocks.push(section(parts.join('\n\n')));
  note('pageType');

  blocks.push(divider());

  // ② 搜尋與 SEO 啟動 — seoHealth 一行 + 搜尋機會 + ②b
  const sh = r.seoHealth;
  if (sh) {
    const ctrAll = sh.totalImpressions ? sh.totalClicks / sh.totalImpressions : null;
    const line = `${IND}頁數 ${num(sh.pagesInSearch)}・曝光 ${num(sh.totalImpressions)}・點擊 ${num(sh.totalClicks)}（CTR ${ctr(ctrAll)}）・均排名 ${pos(sh.avgPosition)}`;
    blocks.push(section(`*② 🔍 搜尋與 SEO 啟動*\n${line}`));
    note('seoHealth');
  }
  if (r.searchOpportunities?.length) {
    const lines = r.searchOpportunities.slice(0, 5).map(
      (o) => `• *${o.query}* 曝光 ${num(o.impressions)}・排名 ${pos(o.position)}・CTR ${ctr(o.ctr)}`,
    );
    blocks.push(section(`*Top 搜尋機會*\n${lines.join('\n')}`));
  }

  const so = r.seoOpportunities || {};
  if (so.pageOpportunities?.length) {
    const lines = so.pageOpportunities.slice(0, 5).map(
      (o) => `• \`${shortPath(o.page)}\` 〔${categoryLabel(o.category)}〕\n${IND}${metrics3(o.impressions, o.position, o.ctr)}`,
    );
    blocks.push(section(`*②b 🎯 第 2 頁衝刺*\n${lines.join('\n')}`));
    note('page2');
  }
  if (so.titleCtrCandidates?.length) {
    const lines = so.titleCtrCandidates.slice(0, 4).map(
      (o) => `• *${o.query}* 〔${categoryLabel(o.category)}〕\n${IND}${metrics3(o.impressions, o.position, o.ctr)}`,
    );
    blocks.push(section(`*改標題候選*\n${lines.join('\n')}`));
    note('titleCtr');
  }

  blocks.push(divider());

  // ③ 流量健康度（含 ④ AI 轉介併入同一塊，緊湊）
  const th = r.trafficHealth;
  if (th) {
    const srcs = (th.sources || []).slice(0, 5).map((s) => `${s.source} ${num(s.users)}`).join('・');
    const ai = th.aiReferrals || [];
    const aiText = ai.length ? ai.map((s) => `${s.source} ${num(s.users)}`).join('・') : '無';
    const lines = [`${IND}使用者 ${num(th.users)}${wow(th.usersWoWPct)}`];
    if (srcs) lines.push(`${IND}來源：${srcs}`);
    lines.push(`${IND}AI 轉介（真人點進站）：${aiText}`);
    blocks.push(section(`*③ 📈 流量健康度*\n${lines.join('\n')}`));
    note('traffic');
  }

  // ④b AI 引用量測（GEO/AEO，與 AI 轉介不同）
  if (r.geoText) {
    blocks.push(section(`*④b 🤖 AI 引用量測*\n${IND}${r.geoText}`));
  }

  // 頁尾
  const foot = [`資料區間 ${mdShort(period.start)}–${mdShort(period.end)}`, '來源 GA4 + GSC'];
  if (r.generatedAt) foot.push(`產生於 ${r.generatedAt}`);
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: foot.join('　·　') }] });

  return blocks;
}
