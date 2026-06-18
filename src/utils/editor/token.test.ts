import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, setToken, clearToken, KEY } from './token';

function fakeStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
}

let local: ReturnType<typeof fakeStorage>;
let session: ReturnType<typeof fakeStorage>;

beforeEach(() => {
  local = fakeStorage();
  session = fakeStorage();
  vi.stubGlobal('localStorage', local);
  vi.stubGlobal('sessionStorage', session);
});

describe('token 工具', () => {
  it('set 後 get 取得同值（存 localStorage）', () => {
    setToken('tok1');
    expect(local.getItem(KEY)).toBe('tok1');
    expect(getToken()).toBe('tok1');
    expect(KEY).toBe('appi_gh_token');
  });

  it('clear 後 get 為 null', () => {
    setToken('tok1');
    clearToken();
    expect(getToken()).toBeNull();
  });

  it('舊版存在 sessionStorage 的 token 會遷移到 localStorage', () => {
    session.setItem(KEY, 'legacy');
    expect(getToken()).toBe('legacy');
    expect(local.getItem(KEY)).toBe('legacy'); // 已搬到 localStorage
    expect(session.getItem(KEY)).toBeNull(); // 舊鍵清掉
  });

  it('沒有任何 token 時回 null', () => {
    expect(getToken()).toBeNull();
  });
});
