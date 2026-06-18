// GitHub OAuth 觸發點（登入與重新登入共用）。
// 登入完成後 github-oauth worker 會帶 token 導回 `${ALLOWED_ORIGIN}/admin#token=…`，
// token 進 localStorage（見 token.ts）後跨頁可用，所以從文章頁編輯器觸發也沒問題。
const OAUTH_WORKER = 'https://appi-news-github-oauth.lightman-chang.workers.dev';
export const OAUTH_STATE_KEY = 'appi_oauth_state';

export function startLogin(): void {
  const state = Math.random().toString(36).slice(2); // 僅作 CSRF 對照，非密鑰
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  location.href = `${OAUTH_WORKER}/auth?state=${state}`;
}
