// 純轉換：吃 weekly-data.mjs + seo-opportunities.mjs 的結構化 JSON → 手機可讀的 Block Kit blocks。
// 設計動機：週報以前由模型每週手刻 blocks，常把「query｜曝光｜排名｜CTR」四欄塞進一行，手機換行後對不齊、無法閱讀。
// 解法：版面交給這支決定論渲染器，模型只負責填質性一句話 notes（pageType/seoHealth/page2/titleCtr/traffic/ai）。
// 排版鐵則（手機優先）：
//   1. 多欄數據一律「兩行制」：第一行粗體標的，第二行全形空格縮排後接「曝光 X・排名 Y・CTR Z%」，永遠不在同一行塞 4 欄。
//   2. 標籤永遠跟著數字（曝光/排名/CTR/瀏覽），換行也讀得懂。
//   3. 路徑用 `code` 包，避免被當連結折行。
// 無 I/O、好測。

const PAGE_TYPE_LABEL = {
  home: '首頁', article: '文章內文', author: '作者頁', category: '分類索引',
  column: '專欄', topic: '專題', tag: '標籤', page: '其他頁',
};
const CATEGORY_LABEL = {
  focus: '焦點', international: '國際', health: '健康', tech: '科技',
  finance: '財經', sports: '運動', lifestyle: '生活', uncategorized: '未分類',
};

const IND = '　'; // U+3000 全形空格，當第二行縮排（手機看得到）

const num = (n) => Number(n || 0).toLocaleString('en-US');
const wow = (p) => (p == null ? '—' : `${p > 0 ? '+' : ''}${p}%`);
const pos = (n) => (n == null ? '—' : (Math.round(Number(n) * 10) / 10).toString());
const ctr = (frac) => (frac == null ? '—' : `${Math.round(Number(frac) * 1000) / 10}%`);
const mdShort = (ymd) => {
  const [, m, d] = String(ymd || '').split('-');
  return m && d ? `${+m}/${+d}` : String(ymd || '');
};
const pageTypeLabel = (t) => PAGE_TYPE_LABEL[t] || t;
const categoryLabel = (c) => CATEGORY_LABEL[c] || c;

const section = (text) => ({ type: 'section', text: { type: 'mrkdwn', text } });
const context = (text) => ({ type: 'context', elements: [{ type: 'mrkdwn', text }] });
const divider = () => ({ type: 'divider' });

/** 兩行制單列：第一行粗體標的，第二行縮排接 metrics（已格式化字串陣列）。 */
const twoLine = (title, metrics) => `• *${title}*\n${IND}${metrics.join('・')}`;

/** 縮短過長路徑：保留開頭與結尾，中段以 … 省略（避免一條 URL 占滿整段）。 */
function shortPath(p, max = 36) {
  const s = String(p || '');
  if (s.length <= max) return s;
  const head = Math.ceil((max - 1) * 0.45);
  const tail = max - 1 - head;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

/**
 * report 結構（皆可選，缺的區塊自動略過）：
 * {
 *   period: { start, end },
 *   articlePerf: { topArticles:[{path,title,views,avgEngagementSec}], byPageType:[{type,views,wowPct}], byArticleCategory:[{category,views,wowPct}] },
 *   seoHealth: { pagesInSearch, totalImpressions, totalClicks, avgPosition },
 *   searchOpportunities: [{ query, impressions, clicks, ctr, position }],
 *   seoOpportunities: { pageOpportunities:[{page,category,impressions,position,ctr}], titleCtrCandidates:[{query,page,category,impressions,position,ctr}] },
 *   trafficHealth: { users, usersWoWPct, sources:[{source,users}], aiReferrals:[{source,users}] },
 *   notes: { pageType, seoHealth, page2, titleCtr, traffic, ai },  // 模型填的質性一句話
 *   geoText: '...',           // AI 引用量測一句話（可選）
 *   generatedAt: '...'        // 產生時間字串（可選）
 * }
 */
export function weeklyReportBlocks(report = {}) {
  const r = report || {};
  const notes = r.notes || {};
  const blocks = [];

  const period = r.period || {};
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: `📊 APPI News 週報　${mdShort(period.start)}–${mdShort(period.end)}`, emoji: true },
  });

  // ① 文章 / 分類表現
  const ap = r.articlePerf || {};
  if (ap.topArticles?.length) {
    const lines = ap.topArticles.map(
      (a, i) => `${i + 1}. \`${shortPath(a.path)}\`\n${IND}${num(a.views)} 瀏覽・停留 ${a.avgEngagementSec ?? 0}s`,
    );
    blocks.push(section(`*① 文章 / 分類表現*\n\n*Top 頁面*\n${lines.join('\n')}`));
  } else {
    blocks.push(section('*① 文章 / 分類表現*'));
  }

  if (ap.byPageType?.length) {
    const lines = ap.byPageType.map((t) => `${IND}${pageTypeLabel(t.type)}　${num(t.views)} 瀏覽（${wow(t.wowPct)}）`);
    let text = `*各頁面類型*（瀏覽・週對比）\n${lines.join('\n')}`;
    if (notes.pageType) text += `\n_${notes.pageType}_`;
    blocks.push(section(text));
  }

  if (ap.byArticleCategory?.length) {
    const lines = ap.byArticleCategory.map((c) => `${IND}${categoryLabel(c.category)}　${num(c.views)} 瀏覽（${wow(c.wowPct)}）`);
    blocks.push(section(`*文章分類動能*（只算內文・週對比）\n${lines.join('\n')}`));
  }

  blocks.push(divider());

  // ② 搜尋與 SEO 啟動
  const sh = r.seoHealth;
  if (sh) {
    const ctrAll = sh.totalImpressions ? sh.totalClicks / sh.totalImpressions : null;
    const lines = [
      `${IND}出現於搜尋頁數　${num(sh.pagesInSearch)}`,
      `${IND}總曝光　${num(sh.totalImpressions)}`,
      `${IND}總點擊　${num(sh.totalClicks)}（CTR ${ctr(ctrAll)}）`,
      `${IND}平均排名　${pos(sh.avgPosition)}`,
    ];
    let text = `*② 🔍 搜尋與 SEO 啟動*\n${lines.join('\n')}`;
    if (notes.seoHealth) text += `\n_${notes.seoHealth}_`;
    blocks.push(section(text));
  }

  if (r.searchOpportunities?.length) {
    const lines = r.searchOpportunities.map((o) =>
      twoLine(o.query, [`曝光 ${num(o.impressions)}`, `排名 ${pos(o.position)}`, `CTR ${ctr(o.ctr)}`]),
    );
    blocks.push(section(`*Top 搜尋機會*（query）\n${lines.join('\n')}`));
  }

  // ②b 🎯 SEO 機會
  const so = r.seoOpportunities || {};
  if (so.pageOpportunities?.length || so.titleCtrCandidates?.length) {
    blocks.push(divider());
  }
  if (so.pageOpportunities?.length) {
    const lines = so.pageOpportunities.map((o) =>
      `• \`${shortPath(o.page)}\`　〔${categoryLabel(o.category)}〕\n${IND}曝光 ${num(o.impressions)}・排名 ${pos(o.position)}・CTR ${ctr(o.ctr)}`,
    );
    let text = `*②b 🎯 第 2 頁衝刺*（補內鏈/補深度可進第一頁）\n${lines.join('\n')}`;
    if (notes.page2) text += `\n_${notes.page2}_`;
    blocks.push(section(text));
  }
  if (so.titleCtrCandidates?.length) {
    const lines = so.titleCtrCandidates.map((o) =>
      `• *${o.query}*　〔${categoryLabel(o.category)}〕\n${IND}\`${shortPath(o.page)}\`\n${IND}曝光 ${num(o.impressions)}・排名 ${pos(o.position)}・CTR ${ctr(o.ctr)}`,
    );
    let text = `*改標題搶點擊*（排名還行但標題沒吸引點擊）\n${lines.join('\n')}`;
    if (notes.titleCtr) text += `\n_${notes.titleCtr}_`;
    blocks.push(section(text));
  }

  blocks.push(divider());

  // ③ 流量健康度
  const th = r.trafficHealth;
  if (th) {
    const srcs = (th.sources || []).slice(0, 6).map((s) => `${s.source} ${num(s.users)}`).join('・');
    let text = `*③ 📈 流量健康度*\n${IND}本週使用者　${num(th.users)}（${wow(th.usersWoWPct)}）`;
    if (srcs) text += `\n${IND}主要來源：${srcs}`;
    if (notes.traffic) text += `\n_${notes.traffic}_`;
    blocks.push(section(text));

    // ④ AI 轉介點擊（真人從 AI 答案點進站，非被引用）
    const ai = th.aiReferrals || [];
    const aiText = ai.length ? ai.map((s) => `${s.source} ${num(s.users)}`).join('・') : '無';
    blocks.push(section(`*④ 🤖 AI 轉介點擊*（真人從 AI 答案點連結進站）\n${IND}${aiText}`));
  }

  // ④b AI 引用量測（GEO/AEO，與 ④ 不同）
  if (r.geoText) {
    blocks.push(section(`*④b 🤖 AI 引用量測*（本站內容被 AI 引擎引用，與 ④ 不同）\n${IND}${r.geoText}`));
  }

  // 頁尾
  const foot = [`資料區間 ${mdShort(period.start)}–${mdShort(period.end)}`, '來源 GA4 + GSC'];
  if (r.generatedAt) foot.push(`產生於 ${r.generatedAt}`);
  blocks.push(context(foot.join('　·　')));

  return blocks;
}
