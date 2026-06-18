export const KEY = 'appi_gh_token';

// token 存 localStorage：跨分頁、關掉瀏覽器再開都還在（單人內部 CMS，可接受 write-scope token 持久於本機）。
// 舊版存在 sessionStorage（只活在登入當下那個分頁，換分頁/重開就掉，會出現「缺少授權」）。
// 這裡讀取時順手把舊值遷移到 localStorage，避免既有登入者部署後被登出。
export function getToken(): string | null {
  const t = localStorage.getItem(KEY);
  if (t) return t;
  const legacy = sessionStorage.getItem(KEY);
  if (legacy) {
    localStorage.setItem(KEY, legacy);
    sessionStorage.removeItem(KEY);
    return legacy;
  }
  return null;
}
export function setToken(token: string): void {
  localStorage.setItem(KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY); // 清掉可能殘留的舊鍵
}
