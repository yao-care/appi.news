/**
 * 取得 OG 圖的**真實**像素尺寸（build 期讀本機檔案）。
 *
 * 為什麼需要：`SEOHead.astro` 原本把 `og:image:width/height` 寫死成 1200×630，
 * 但站上封面實際比例不一（1200×800、1600×1067、部分舊圖甚至是直式）。
 * 宣告值與實際檔案不符時，社群與 Discover 的爬蟲會依錯誤尺寸預留版位，
 * 可能造成裁切錯誤或忽略這組提示。與其宣告錯的，不如宣告對的；
 * 讀不到就整組不輸出（爬蟲會自己抓圖判斷，缺這兩個 tag 不影響收錄）。
 *
 * 效能：全站 1,100+ 頁共用少數封面，因此以模組層 Map 快取，
 * 同一張圖在單次 build 只讀一次。
 */
import sharp from 'sharp';
import path from 'node:path';

type Size = { width: number; height: number } | null;

const cache = new Map<string, Size>();

/**
 * @param ogImagePath SEOHead 拿到的 ogImage 值（相對 BASE 的資產路徑，或絕對網址）
 * @returns 真實尺寸；外部網址、檔案不存在或讀取失敗一律回 null（呼叫端就不輸出 tag）
 */
export async function ogImageSize(ogImagePath: string): Promise<Size> {
  // 外部網址不在本機，讀不到也不該猜
  if (/^https?:\/\//.test(ogImagePath)) return null;
  if (cache.has(ogImagePath)) return cache.get(ogImagePath)!;

  let out: Size = null;
  try {
    const rel = ogImagePath.replace(/^\/+/, '');
    const meta = await sharp(path.join(process.cwd(), 'public', rel)).metadata();
    if (meta.width && meta.height) out = { width: meta.width, height: meta.height };
  } catch {
    out = null;
  }
  cache.set(ogImagePath, out);
  return out;
}
