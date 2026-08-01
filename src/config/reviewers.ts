/**
 * 分類 → 專業審閱者 對照表（單一事實來源）
 *
 * 用途有二：
 *  1. `scripts/backfill-reviewers.mjs` 依此回填文章 frontmatter 的 reviewedBy / factCheckedBy。
 *  2. 文章頁渲染時，frontmatter 沒填 reviewedBy 就退回這張表——所以自動產線新產出的文章
 *     不必逐支腳本改就會帶到審閱者，避免七條產線各自漏填。
 *
 * 語意區分（2026-08-01 站長裁定）：
 *  - reviewedBy    ＝ 專業審閱：這篇的說法對不對、有沒有誤導，由該領域具名專業人員負責。
 *  - factCheckedBy ＝ 事實查核：數字、引述、連結對不對，由 APPI News 編輯部負責。
 *
 * 新增分類時務必同步補一列，否則該分類文章不會顯示審閱者。
 */
/** 事實查核一律歸編輯部 */
export const FACT_CHECKER_ID = 'appi-editorial';

/** null ＝ 該分類不指定專業審閱者（目前僅 columns，站上 0 篇使用該分類） */
export const CATEGORY_REVIEWER: Record<string, string | null> = {
  health: 'huang-ziyan',
  finance: 'wu-fang-jun',
  lifestyle: 'luo-yang',
  international: 'luo-yang',
  tech: 'lightman',
  focus: 'lightman',
  sports: 'chou-jingyan',
  columns: null,
};

/** 取某分類的專業審閱者 id；查無或未指定回 undefined */
export function reviewerFor(category: string): string | undefined {
  return CATEGORY_REVIEWER[category] ?? undefined;
}
