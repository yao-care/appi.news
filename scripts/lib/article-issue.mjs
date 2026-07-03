// 把 /admin「文章寫作工單」issue（label: article-draft）解析成 newsroom 產線的工單（job）。
// 純函式、無副作用，方便單元測試。協調器 scripts/article-write.mjs 用它把 issue 轉成 newsroom-write 吃的 job.json。
//
// issue body 由 src/utils/editor/issue.ts 的 buildIssueBody() 產出，欄位：
//   - 分類（category）: <slug>        （由 /admin 分類下拉帶入；舊工單可能沒有 → 由呼叫端補預設）
//   - 標題: <title>
//   - 目標檔案: `src/content/articles/<slug>.md`
//   - 網址: `/articles/<slug>/`
//   ### 寫作方向 / ### 參考資料源 / ### 想表達的結論   （空白時為「未指定」）
//
// 產出的 job 一律 kind=factual（/admin 下單無個人觀點、編輯部署名、產待審草稿待人工核可上線）。

const UNSPECIFIED = '未指定';
const isMeaningful = (v) => typeof v === 'string' && v.trim() && v.trim() !== UNSPECIFIED;

/** 抓「- 標籤: 值」的行內值（標籤用中文括號或半形皆可）。 */
function inlineField(body, labelRegex) {
  const m = String(body || '').match(new RegExp(`^\\s*-\\s*${labelRegex}\\s*[:：]\\s*(.+?)\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

/** 抓「### 標題」到下一個 ###／---／檔尾 之間的段落文字。
 *  不用 'm' flag：否則 $ 會匹配每行行尾、讓非貪婪只吃到第一行。 */
function section(body, heading) {
  const re = new RegExp(`###\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n###\\s|\\n---|$)`);
  const m = String(body || '').match(re);
  return m ? m[1].trim() : '';
}

/** issue title 去掉「[文章] 」前綴。 */
export function stripArticleTitlePrefix(title) {
  return String(title || '').replace(/^\s*\[文章\]\s*/, '').trim();
}

/** 從「目標檔案 `src/content/articles/<slug>.md`」或「網址 `/articles/<slug>/`」抽 slug。 */
export function slugFromBody(body) {
  const file = String(body || '').match(/src\/content\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md/);
  if (file) return file[1];
  const url = String(body || '').match(/\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\//);
  return url ? url[1] : '';
}

/**
 * 把 article-draft issue 解析成 newsroom job。
 * @param {{title?:string, body?:string, fallbackCategory?:string}} p
 *   fallbackCategory：舊工單 body 沒帶分類時的預設（呼叫端決定；不給則 category 留空、交給 validateJob 擋）。
 * @returns {{ job: object, warnings: string[] }}
 */
export function parseArticleIssueBody({ title, body, fallbackCategory } = {}) {
  const warnings = [];
  const b = String(body || '');

  const bodyTitle = inlineField(b, '標題');
  const finalTitle = isMeaningful(bodyTitle) ? bodyTitle : stripArticleTitlePrefix(title);

  const slug = slugFromBody(b);
  if (!slug) warnings.push('工單找不到目標檔案 slug（src/content/articles/<slug>.md）');

  let category = inlineField(b, '分類（category）') || inlineField(b, '分類\\(category\\)');
  if (!isMeaningful(category)) {
    category = isMeaningful(fallbackCategory) ? fallbackCategory.trim() : '';
    if (category) warnings.push(`工單未帶分類，套用預設分類：${category}`);
  }

  const direction = section(b, '寫作方向');
  const sources = section(b, '參考資料源');
  const conclusionRaw = section(b, '想表達的結論');

  // conclusion 是 validateJob 必填；未指定時退回標題（寫作方向另存 angle，仍會進起草 prompt）。
  const conclusion = isMeaningful(conclusionRaw) ? conclusionRaw : finalTitle;

  // 參考資料源：逐行拆成必引來源清單（去掉條列符號與空行；「未指定」整段忽略）。
  const mustCite = isMeaningful(sources)
    ? sources.split('\n').map((l) => l.replace(/^\s*[-*]\s*/, '').trim()).filter((l) => l && l !== UNSPECIFIED)
    : [];

  const job = {
    title: finalTitle,
    slug: slug || undefined,
    category: category || undefined,
    kind: 'factual', // /admin 下單：事實稿、編輯部署名、產待審草稿
    conclusion,
    angle: isMeaningful(direction) ? direction : '',
    mustCite,
    length: 'short',
  };
  return { job, warnings };
}
