/**
 * Base-aware URL helpers。
 *
 * 站內連結一律透過 url() 產生，會自動帶上 import.meta.env.BASE_URL，
 * 因此把 base 從 '/appi.news' 改成 '/'（換成自訂網域）時，全站連結
 * 自動跟著變，不需要逐檔修改。
 */

const BASE = import.meta.env.BASE_URL; // 例如 '/appi.news/' 或 '/'

/** 產生站內相對連結（含 base），結尾固定帶斜線以符合 trailingSlash: 'always' */
export function url(path = '/'): string {
  const clean = `/${String(path).replace(/^\/+/, '')}`;
  // BASE 結尾一定有斜線
  let out = (BASE.replace(/\/+$/, '') + clean).replace(/\/{2,}/g, '/');
  // 檔案路徑（含副檔名，如 .xml / .png / .txt）不補尾斜線
  const isFile = /\.[a-z0-9]+$/i.test(out);
  if (!isFile && !out.endsWith('/')) out += '/';
  return out;
}

/** 產生絕對網址（給 canonical / og:image / structured data 用） */
export function absoluteUrl(path: string, site: URL | string | undefined): string {
  const rel = url(path);
  if (!site) return rel;
  return new URL(rel, site.toString()).toString();
}

/** 取得資產（圖片等）的 base-aware 路徑 */
export function asset(path: string): string {
  const clean = `/${String(path).replace(/^\/+/, '')}`;
  return (BASE.replace(/\/+$/, '') + clean).replace(/\/{2,}/g, '/');
}
