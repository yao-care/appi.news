// 排程槽位計算（日更：一天一篇）。純函式、無 I/O，方便單元測試。
// 「最近一個還沒有文章的發佈日」＝從 fromDate 起算，第一個不在 taken 的日子。

function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

/**
 * @param {Set<string>|string[]} taken 已被佔用的日期（YYYY-MM-DD）
 * @param {string} fromDate 起算日（YYYY-MM-DD）
 * @returns {string} 最近一個 >= fromDate 且不在 taken 的 YYYY-MM-DD
 */
export function nextOpenPublishDate(taken, fromDate, maxScan = 400) {
  const set = taken instanceof Set ? taken : new Set(taken || []);
  let day = fromDate;
  for (let i = 0; i < maxScan; i++) {
    if (!set.has(day)) return day;
    day = addDays(day, 1);
  }
  return day;
}

/** 從一堆文章 frontmatter 文字中抽出 publishDate 的 YYYY-MM-DD 集合。 */
export function takenDatesFromContents(contents) {
  const set = new Set();
  for (const c of contents || []) {
    const m = String(c).match(/^publishDate:\s*["']?(\d{4}-\d{2}-\d{2})/m);
    if (m) set.add(m[1]);
  }
  return set;
}
