// 「這篇文章現在公開嗎」的唯一實作。
//
// 刻意用 .mjs：站台端（content.ts、astro.config.mjs）與 scripts/*.mjs（node 直跑，吃不了 TS）
// 都要 import 同一份。在這支出現之前，同一判斷有多份手抄鏡像散在 astro.config 與各腳本，
// 且已實際漂移出 bug（deploy-needed 只認 status: scheduled → status: published＋未來日期的
// 排程稿到期不觸發重建；topic-tracker 同類）。reader-index.json.ts 檔頭早寫過正確方向：
// 「不做 postbuild 腳本，因為那要重寫第三份 isPublic」——本檔把該決策推到底。
//
// 語意（與 content.ts 歷來一致）：
//   隱藏 ＝ draft 旗標 ／ status ∈ {draft, archived} ／ publishDate 在未來或無法解讀。
//   **任何 status**（含預設 published）只要 publishDate 在未來就一律隱藏——別再只認 scheduled。

/** 把 frontmatter 的 publishDate（Date 或字串）轉成毫秒；無法解讀回 NaN。 */
function publishTime(d) {
  const v = d?.publishDate;
  if (v instanceof Date) return v.getTime();
  return v ? new Date(v).getTime() : NaN;
}

function hiddenByStatus(d) {
  if (!d) return true;
  if (d.draft === true || d.draft === 'true') return true;
  return d.status === 'draft' || d.status === 'archived';
}

const nowMs = (now) => (now instanceof Date ? now.getTime() : now ?? Date.now());

/** 現在（或指定時點）公開可見。publishDate 缺漏／壞值＝不公開（寧可少列，不提早曝光）。 */
export function isPublicFrontmatter(d, now) {
  if (hiddenByStatus(d)) return false;
  const t = publishTime(d);
  return Number.isFinite(t) && t <= nowMs(now);
}

/** 排程草稿（產 noindex 預覽頁的那批）：status 沒被隱藏、但 publishDate 還在未來。 */
export function isScheduledPreviewFrontmatter(d, now) {
  if (hiddenByStatus(d)) return false;
  const t = publishTime(d);
  return Number.isFinite(t) && t > nowMs(now);
}
