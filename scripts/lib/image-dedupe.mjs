// 圖片近似重複偵測（average hash / aHash）。
//
// 用途：擋「封面＝內文第一張圖」這種重複（產線舊習慣，見 docs/lessons/image-realism-system.md）。
// 封面與內文圖常是同源不同編碼（webp vs jpg），位元不同但視覺相同，故用感知雜湊而非檔案雜湊：
// 縮到 8×8 灰階 → 以平均值二值化成 64 bit → 漢明距離近＝視覺重複。

import sharp from 'sharp';

export const AHASH_SIZE = 8;
/** 漢明距離門檻：≤ 此值視為「同一張圖」（同源不同編碼會有零星差異，留一點餘裕）。 */
export const DUP_THRESHOLD = 6;

/** 純函式：由 size×size 灰階像素陣列算 aHash（回 64-bit BigInt）。 */
export function aHashFromGray(gray, size = AHASH_SIZE) {
  const n = size * size;
  if (!gray || gray.length < n) throw new Error(`aHashFromGray 需要至少 ${n} 個像素`);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += gray[i];
  const mean = sum / n;
  let bits = 0n;
  for (let i = 0; i < n; i++) {
    bits <<= 1n;
    if (gray[i] >= mean) bits |= 1n;
  }
  return bits;
}

/** 純函式：兩個 aHash（BigInt）的漢明距離。 */
export function hamming(a, b) {
  let x = a ^ b;
  let d = 0;
  while (x > 0n) {
    d += Number(x & 1n);
    x >>= 1n;
  }
  return d;
}

/** 純函式：距離 ≤ 門檻即視為重複。 */
export function isDuplicateHash(a, b, threshold = DUP_THRESHOLD) {
  return hamming(a, b) <= threshold;
}

/** 讀圖檔 → 8×8 灰階 → aHash。SVG 也能經 sharp 光柵化；讀不了回 null（不阻斷，交呼叫端判斷）。 */
export async function aHashFile(path, size = AHASH_SIZE) {
  try {
    const gray = await sharp(path)
      .resize(size, size, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();
    return aHashFromGray(gray, size);
  } catch {
    return null;
  }
}

/**
 * 封面是否與內文任一張圖近似重複。
 * @param {string} coverPath 封面檔路徑（public/ 下）
 * @param {string[]} inlinePaths 內文圖檔路徑陣列
 * @returns {Promise<{duplicate:boolean, match?:string, distance?:number}>}
 *   讀不到封面 → duplicate:false（交既有「檔案存在」gate 處理，本檢查不重複報錯）。
 */
export async function coverDuplicatesInline(coverPath, inlinePaths, threshold = DUP_THRESHOLD) {
  const coverHash = await aHashFile(coverPath);
  if (coverHash == null) return { duplicate: false };
  for (const p of inlinePaths) {
    const h = await aHashFile(p);
    if (h == null) continue; // 讀不到的（如遠端 URL、缺檔）略過
    const d = hamming(coverHash, h);
    if (d <= threshold) return { duplicate: true, match: p, distance: d };
  }
  return { duplicate: false };
}
