// 「可嵌入原圖」來源白名單（國際線決策：只用可授權/可嵌入來源）。
//
// 為什麼是「來源白名單」而非「逐圖授權偵測」：
//   任意新聞圖的授權條款寫在散文裡、各家不同，程式無法可靠判讀；判錯＝侵權。
//   唯一能安全自動化的作法，是只從「授權政策已知、可一體適用」的來源取原圖，
//   並在『取得當下』就 fail-closed 擋掉非白名單來源（見 get-image.mjs --embed-url）。
//   外媒（路透/AP/Getty 及一般新聞網站）原圖一律不在此列 → 退回圖庫/AI 生成。
//
// ⚠️ 這份清單刻意保守，且需「人工＋法務」審核才擴充。新增來源前務必確認該來源「整站」
//    對編輯重製的授權，而非單篇例外。Wikimedia Commons 為逐檔授權（CC/PD 皆有），
//    故起草端仍須讀該檔頁面的實際授權與署名要求（規則寫在 international 雷達/skill）。

/**
 * 來源白名單。每筆：
 *   match       - 比對 hostname 的函式（回 true 即命中）
 *   license     - 授權標籤（給人看／寫進 credit）
 *   creditHint  - 署名格式提示（起草端據此填 coverImageCredit / 內文圖說）
 *   perFile     - true=逐檔授權不一（需起草端確認單檔授權），false=整站一致授權
 */
export const EMBED_SOURCES = [
  {
    id: 'wikimedia-commons',
    match: (h) => h === 'commons.wikimedia.org' || h === 'upload.wikimedia.org' || h.endsWith('.wikimedia.org'),
    license: 'Wikimedia Commons（逐檔 CC/公眾領域）',
    creditHint: '作者／來源 — 授權（例：CC BY-SA 4.0），引用自 Wikimedia Commons',
    perFile: true,
  },
  {
    id: 'eu-audiovisual',
    match: (h) => h === 'audiovisual.ec.europa.eu',
    license: '歐盟視聽服務（多為 CC BY 4.0）',
    creditHint: '© European Union, <年份>',
    perFile: true,
  },
  {
    id: 'nasa-images',
    match: (h) => h === 'images.nasa.gov' || h === 'www.nasa.gov' || h === 'nasa.gov',
    license: 'NASA（多為公眾領域）',
    creditHint: 'NASA（必要時註明任務／攝影者）',
    perFile: false,
  },
  {
    id: 'us-dod',
    match: (h) => h.endsWith('.mil') || h === 'defense.gov' || h.endsWith('.defense.gov'),
    license: '美國國防部（聯邦政府作品，多為公眾領域）',
    creditHint: 'U.S. Department of Defense（註明攝影者軍階姓名）',
    perFile: false,
  },
  {
    id: 'unsplash',
    match: (h) => h.endsWith('unsplash.com'),
    license: 'Unsplash License（免費可商用）',
    creditHint: '攝影師 — Unsplash',
    perFile: false,
  },
  {
    id: 'pexels',
    match: (h) => h.endsWith('pexels.com'),
    license: 'Pexels License（免費可商用）',
    creditHint: '攝影師 — Pexels',
    perFile: false,
  },
];

/** 解析 URL 的 hostname（小寫、去 www 前綴交給各 match 自行處理）。失敗回 null。 */
export function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * 判斷某圖片 URL 是否來自白名單來源。
 * @returns {{allowed:boolean, source?:object, host?:string, reason?:string}}
 */
export function classifyImageSource(url) {
  const host = hostnameOf(url);
  if (!host) return { allowed: false, reason: 'URL 無法解析' };
  const source = EMBED_SOURCES.find((s) => s.match(host));
  if (!source) {
    return { allowed: false, host, reason: `來源 ${host} 不在可嵌入白名單（外媒原圖一律退回圖庫/AI）` };
  }
  return { allowed: true, host, source };
}

export function isAllowedImageSource(url) {
  return classifyImageSource(url).allowed;
}
