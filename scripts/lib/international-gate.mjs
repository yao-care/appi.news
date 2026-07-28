// 國際編譯台「寫作前閘門」純邏輯（無 I/O，可單元測試）。
//
// 為什麼需要：選題引擎（international-select）只依 GDELT 熱度挑題，完全無狀態，而唯一的
// 去重／品質判斷寫在最貴的那一端——每則要花 6~9 分鐘的 Claude 寫作呼叫（WebFetch 讀原文、
// 交叉查證），才可能換到一行 `INTL_RESULT=SKIP`。2026-07-28 實跑當天 24 則候選：4 組同一事件
// 被不同轉載媒體重複送進來（日本地震、Polanski、西雅圖槍擊、澳洲獻金案），另有 7~8 則根本
// 不是國際新聞（烤肉技巧、訃聞、鹽沼研究、農業 AI 特寫），且 GDELT 地點大量標錯（西雅圖槍擊
// 標成 Mexico、澳洲政治標成 Lebanon）。約三分之二的呼叫注定產出 SKIP。
//
// 三層閘門（便宜到貴）：
//   ① dedupeByEvent  — 同批同事件去重（標題近似）。純字串，零成本。
//   ② filterSeen     — 跨日 seen 帳本（比照 civic-seen.json / video-seen.json 慣例）。零成本。
//   ③ triage         — 一次 Haiku 批次篩選 24 則標題，砍掉非國際新聞與已寫過的事件。一次呼叫。
//
// 鐵則：閘門只准「便宜地砍掉明顯不必寫的」，任何解析失敗一律 fail-open（全部放行），
// 絕不因為閘門自己壞掉而讓整晚 0 篇——那正是它要治的病。

/** 標題正規化成廉價比對 key：NFKC + 小寫 + 去空白/標點/符號（同 topic-ledger 慣例）。 */
export function normalizeTitle(title) {
  return String(title ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '');
}

/** 標題切詞（英文為主的外電標題）：小寫、去標點、濾掉虛詞與 2 字以下的詞。 */
const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'by', 'with', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'after', 'over', 'into', 'that', 'this', 'it', 'its', 'his', 'her', 'their', 'says', 'said', 'new', 'may', 'has', 'have', 'not', 'no']);
export function titleTokens(title) {
  return new Set(
    String(title ?? '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\p{P}\p{S}]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/** 兩個標題的 Jaccard 相似度（0~1）。任一方無詞 → 0。 */
export function titleSimilarity(a, b) {
  const A = titleTokens(a);
  const B = titleTokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  return inter / (A.size + B.size - inter);
}

/**
 * ① 同批同事件去重：同一則新聞被多家轉載＝多個 sourceUrl，選題端只依 URL 去重擋不掉。
 * 標題完全相同（正規化後）或 Jaccard ≥ threshold 視為同事件，只留熱度最高那則。
 * 沒抓到標題（title 空）的一律保留，不冒錯殺的險。
 * @returns {{kept: Array, dropped: Array<{story, dupOf}>}}
 */
export function dedupeByEvent(stories, threshold = 0.5) {
  const order = stories
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.numSources - a.s.numSources || b.s.numArticles - a.s.numArticles || a.i - b.i);
  const kept = [];
  const dropped = [];
  for (const { s } of order) {
    if (!s.title) { kept.push(s); continue; }
    const dupOf = kept.find(
      (k) => k.title && (normalizeTitle(k.title) === normalizeTitle(s.title) || titleSimilarity(k.title, s.title) >= threshold),
    );
    if (dupOf) dropped.push({ story: s, dupOf });
    else kept.push(s);
  }
  // 還原成原本的熱度排序（kept 已依熱度，穩定）
  return { kept, dropped };
}

/**
 * ② 跨日 seen 帳本過濾：近 windowDays 天內處理過同一 URL 或同一標題（正規化後全等）就跳過。
 * 只擋字面重複；「同事件但有新進展」會是不同標題的新報導，擋不到它，那交給寫作端的更新模式。
 * @param {Array} entries 帳本 [{url, key, date}]
 * @returns {{kept: Array, dropped: Array<{story, seenOn}>}}
 */
export function filterSeen(stories, entries, { windowDays = 14, today } = {}) {
  const cutoff = Date.parse(`${today}T00:00:00Z`) - windowDays * 86400000;
  const byUrl = new Map();
  const byKey = new Map();
  for (const e of Array.isArray(entries) ? entries : []) {
    if (!e || !e.date || Date.parse(`${e.date}T00:00:00Z`) < cutoff) continue;
    if (e.url) byUrl.set(e.url, e.date);
    if (e.key) byKey.set(e.key, e.date);
  }
  const kept = [];
  const dropped = [];
  for (const s of stories) {
    const seenOn = byUrl.get(s.sourceUrl) || (s.title ? byKey.get(normalizeTitle(s.title)) : undefined);
    if (seenOn) dropped.push({ story: s, seenOn });
    else kept.push(s);
  }
  return { kept, dropped };
}

/** 把處理過的題併入帳本（同 url 不重複存），並砍掉超過 retentionDays 的舊紀錄。 */
export function mergeSeen(entries, stories, date, retentionDays = 45) {
  const out = (Array.isArray(entries) ? entries : []).filter(
    (e) => e && e.date && Date.parse(`${e.date}T00:00:00Z`) >= Date.parse(`${date}T00:00:00Z`) - retentionDays * 86400000,
  );
  const seen = new Set(out.map((e) => e.url));
  for (const s of stories) {
    if (!s || !s.sourceUrl || seen.has(s.sourceUrl)) continue;
    seen.add(s.sourceUrl);
    out.push({ url: s.sourceUrl, key: s.title ? normalizeTitle(s.title) : '', date });
  }
  return out;
}

/**
 * ③ 批次篩選 prompt：一次把所有候選標題交給 Haiku 判「值不值得動用寫作」。
 * 只看標題（零 WebFetch），要的是砍掉明顯不該寫的，判不準時一律放行由寫作端把關。
 */
export function buildTriagePrompt(stories, recentArticles = []) {
  const list = stories
    .map((s, i) => `${i}. [${s.region}／GDELT 標地 ${s.fullName}] ${s.title || '（抓不到標題）'}\n   ${s.sourceUrl}`)
    .join('\n');
  const recent = recentArticles.length
    ? recentArticles.map((a) => `- ${a.title}`).join('\n')
    : '（近 30 天無國際文）';
  return [
    '你是國際新聞編譯台的選題助理。下面是 GDELT 依熱度撈出的候選，請只看標題快速判斷「值不值得動用完整撰寫」。',
    '注意 GDELT 的地點標記經常錯誤（例：澳洲政治新聞被標成 Lebanon），請以標題內容為準，不要被標地誤導。',
    '',
    '【判 skip 的情形】',
    '- 不是國際新聞：生活風格／food／烤肉技巧、訃聞、影劇綜藝、書評、體育賽事花絮、促銷廣編、內容農場、純科普研究小品。',
    '- 與下方「近 30 天已發國際文」是同一事件，且標題看不出有新進展。',
    '- 與本清單中另一則是同一事件（不同媒體轉載）：只留最值得寫的那一則，其餘標 skip 並在 reason 註明與第幾則重複。',
    '',
    '【判 write 的情形】',
    '- 真正的國際新聞事件（政治、外交、衝突、災難、經濟政策、重大科技/產業動向）。',
    '- 拿不準、資訊不足以判斷 → 一律 write（後段還有完整查證關卡，這裡寧可放行也不要錯殺）。',
    '',
    '【候選清單】',
    list,
    '',
    '【近 30 天已發國際文】',
    recent,
    '',
    '【輸出】只輸出一個 JSON 陣列，不要有任何其他文字或說明：',
    '[{"i": 0, "verdict": "write", "reason": "簡短理由"}, {"i": 1, "verdict": "skip", "reason": "簡短理由"}]',
    `陣列必須涵蓋 0 到 ${stories.length - 1} 每一則。`,
  ].join('\n');
}

/**
 * 解析批次篩選輸出。回 Map<index, {verdict, reason}>；解析不出來回 null（呼叫端須 fail-open）。
 */
export function parseTriage(text, count) {
  const raw = String(text ?? '');
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  let arr;
  try {
    arr = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(arr) || !arr.length) return null;
  const out = new Map();
  for (const e of arr) {
    const i = Number(e && e.i);
    if (!Number.isInteger(i) || i < 0 || i >= count) continue;
    const verdict = String(e.verdict || '').toLowerCase() === 'skip' ? 'skip' : 'write';
    out.set(i, { verdict, reason: String(e.reason || '').slice(0, 120) });
  }
  return out.size ? out : null;
}
