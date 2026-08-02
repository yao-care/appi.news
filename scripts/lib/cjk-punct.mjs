/**
 * 中文夾半形標點的正規化。
 *
 * 病灶（2026-08-02）：LLM 回填 `risksAndLimits` / `expertNote` 時，中文句子裡混出半形
 * 逗號冒號分號（「不是智力門檻,對做流程整合的人來說這才是重點:…」），全站其他中文欄位
 * 一律是全形。
 *
 * 判準演進（第一版太窄，漏掉 65 處）：
 *   v1「前後都是中日韓文字才轉」→ 漏掉 `「健康結果」,問診`（前面是全形引號）
 *      與 `文獻,Go/Proceed`（後面是拉丁字）與 `130/80,不是`（前面是數字）。
 *   v2（現行）**任一側是中文就轉**，但排除「數字夾數字」——那是千分位 `10,080`、
 *      時間 `14:30`、血壓 `130/80` 這類合法用法，動了就是改壞資料。
 *
 * 一律不動的例子（已納入下方單元測試思路）：
 *   10,080 筆 ／ 3,700 萬人 ／ 14:30 開始 ／ Sonnet 5, Haiku 4.5 ／ 1,200 至 1,500 元
 */

/** 中文字＋全形標點（引號、括號、頓號、句號…）都算「中文側」 */
const CJK_SIDE = '\\u4e00-\\u9fff\\u3400-\\u4dbf\\u3000-\\u303f\\uff01-\\uff65';

const MARKS = [
  [',', '，'],
  [':', '：'],
  [';', '；'],
  ['?', '？'],
  ['!', '！'],
];

/**
 * 把中文句中的半形 , : ; ? ! 轉成全形。
 * 規則：任一側屬「中文側」就轉；數字夾數字（千分位／時間／比值）一律不動。非字串原樣回傳。
 */
export function normalizeCjkPunct(s) {
  if (typeof s !== 'string') return s;
  let out = s;
  for (const [half, full] of MARKS) {
    const esc = half.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 前後各抓一個非空白字元來判斷（半形標點後若跟著空白，一併吃掉）
    out = out.replace(
      new RegExp(`(\\S?)${esc}[ \\t]*(\\S?)`, 'g'),
      (m, prev, next) => {
        if (/\d/.test(prev) && /\d/.test(next)) return m; // 千分位／時間／比值
        const cjkSide = new RegExp(`[${CJK_SIDE}]`);
        if (!cjkSide.test(prev) && !cjkSide.test(next)) return m; // 純拉丁語境不動
        return `${prev}${full}${next}`;
      },
    );
  }
  return out;
}

/** 陣列版：逐項正規化 */
export function normalizeCjkPunctAll(arr) {
  return Array.isArray(arr) ? arr.map(normalizeCjkPunct) : arr;
}

/**
 * check-content 的核心 ERROR「不是X，而是Y」家族。回填腳本用它自檢，
 * 免得產出寫進去才在 build 被擋（2026-08-02 第一輪 34 條中招）。
 */
// 直接對齊 scripts/check-content.mjs 的三條核心 ERROR regex（不要自己另寫寬鬆版：
// 第一版少了「無逗號」的情形，漏抓「不是單一風險而是一整串連動」）。
const CONTRAST_TELLS = [
  /不是[^。！？\n]{1,30}而是/,
  /不只是?[^。！？\n]{1,30}(更是|而是)/,
  /並非[^。！？\n]{1,30}而是/,
];

/** true＝命中禁用的對比句式，呼叫端應拒收並重生。 */
export function hasContrastTell(s) {
  return typeof s === 'string' && CONTRAST_TELLS.some((re) => re.test(s));
}
