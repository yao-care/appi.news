// 封面規格的唯一事實來源（Discover / Top Stories 大圖版位門檻）。
//
// 為什麼存在：2026-07-31 只修了「來源端」（worker 圖庫查詢加 orientation、embed 白名單），
// 出口卻沒有任何機械把關，之後六週仍持續產出直式／小圖封面（國際線 embed 直式原圖、
// worker 舊碼回 Pexels large 940px、toWebp withoutEnlargement 靜默收下不足寬的來源）。
// 教訓＝docs/lessons/discover-image-and-meta-signals.md（2026-08-11 追記）。
// 所以規格集中在這裡，由兩層機械保證共同引用：
//   1. 取圖端：scripts/get-image.mjs（covers/ 路徑的 stock 候選淘汰、embed 拒收、生成驗收）
//   2. 出口端：scripts/check-cover-spec.mjs（各產線寫檔後 spawnSync 自檢）
//      ＋ scripts/newsroom-write.mjs 的配圖硬性 gate
//
// 門檻依據（規範，不是現況，可寫死）：
//   - Discover 大卡片需寬 ≥1200px（Google 官方文件；小於只能拿小圖版位）
//   - 大圖版位是橫式：直式／方形會被裁切或降級 → 長寬比下限 1.3（4:3 ≈ 1.33 過、1:1 不過）
//   - 比例上限 2.5：比 21:9（≈2.33）還寬的多半是壞檔（實例：733×96 的橫幅碎圖）
import sharp from 'sharp';

export const COVER_MIN_WIDTH = 1200;
export const COVER_MIN_RATIO = 1.3;
export const COVER_MAX_RATIO = 2.5;

/**
 * 純函式：給定尺寸，回傳不符規格的原因（繁中、給模型／log 看），符合則回 null。
 */
export function coverSpecProblem(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return `讀不到有效尺寸（${width}×${height}）`;
  }
  const ratio = width / height;
  if (width < COVER_MIN_WIDTH) {
    return `寬度 ${width}px 不足（Discover 大圖需 ≥${COVER_MIN_WIDTH}px）`;
  }
  if (ratio < COVER_MIN_RATIO) {
    return ratio < 1
      ? `直式圖（${width}×${height}）拿不到 Discover 大圖版位（需橫式，長寬比 ≥${COVER_MIN_RATIO}）`
      : `太接近方形（${width}×${height}，比例 ${ratio.toFixed(2)}）（需橫式，長寬比 ≥${COVER_MIN_RATIO}）`;
  }
  if (ratio > COVER_MAX_RATIO) {
    return `過寬的橫幅（${width}×${height}，比例 ${ratio.toFixed(2)} > ${COVER_MAX_RATIO}），疑似壞檔或裁切錯誤`;
  }
  return null;
}

/**
 * 讀實際檔案驗規格。回 { ok, width, height, problem }；
 * 讀不到檔（不存在／非圖片）→ ok:false 並附原因，不 throw（呼叫端好組錯誤訊息）。
 */
export async function checkCoverFile(filePath) {
  let meta;
  try {
    meta = await sharp(filePath).metadata();
  } catch (e) {
    return { ok: false, width: 0, height: 0, problem: `讀不到圖檔（${e.message}）` };
  }
  const problem = coverSpecProblem(meta.width, meta.height);
  return { ok: !problem, width: meta.width, height: meta.height, problem };
}
