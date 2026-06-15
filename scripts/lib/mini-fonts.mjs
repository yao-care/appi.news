// 逐頁迷你字型的純邏輯（無 fs / 無 subset-font，便於測試）。
export function pageUsedText(html, baseline = '') {
  const s = new Set();
  for (const ch of baseline) s.add(ch);
  for (const ch of html) s.add(ch);
  return [...s].join('');
}

// 坑解法：迷你字型為 font-display:optional，站台 web font 不能留在棧中（否則 optional
// 區間 Chrome 會抓棧中下一個 web font 當後備 → 全站大字型仍被下載）。
export function fontStackSwap(val, site, family) {
  if (val.includes(`"${site}"`)) return val.replace(`"${site}"`, `"${family}"`);
  return /"Inter",/.test(val) ? val.replace('"Inter",', `"Inter", "${family}",`) : `"${family}", ${val}`;
}

export function miniStyleTag(faces, overrides) {
  if (!faces.length || !overrides.length) return '';
  return `<style>${faces.join('')}:root{${overrides.join(';')}}</style>`;
}
