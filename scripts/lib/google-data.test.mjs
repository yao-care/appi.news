import { describe, it, expect, vi, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { base64url, signingInput, getAccessToken } from './google-data.mjs';

afterEach(() => vi.restoreAllMocks());

describe('base64url / signingInput', () => {
  it('base64url 去掉 +/= 換成 -_', () => {
    expect(base64url(Buffer.from([251, 255, 191]))).toBe('-_-_'); // fb ff bf
  });
  it('signingInput 串 header.claims（皆 base64url JSON）', () => {
    const s = signingInput({ alg: 'RS256' }, { iss: 'x' });
    const [h, c] = s.split('.');
    expect(JSON.parse(Buffer.from(h, 'base64url').toString())).toEqual({ alg: 'RS256' });
    expect(JSON.parse(Buffer.from(c, 'base64url').toString())).toEqual({ iss: 'x' });
  });
});

describe('getAccessToken', () => {
  it('用私鑰簽 JWT、POST token 端點、回 access_token', async () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const spy = vi.fn(async () => new Response(JSON.stringify({ access_token: 'tok-123' }), { status: 200 }));
    vi.stubGlobal('fetch', spy);
    const tok = await getAccessToken({
      clientEmail: 'sa@x.iam.gserviceaccount.com',
      privateKey: pem,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      now: 1_700_000_000,
    });
    expect(tok).toBe('tok-123');
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('https://oauth2.googleapis.com/token');
    const body = new URLSearchParams(init.body);
    expect(body.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    expect(body.get('assertion').split('.')).toHaveLength(3); // header.claims.sig
  });

  it('token 端點非 2xx → 丟錯', async () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('bad', { status: 400 })));
    await expect(
      getAccessToken({ clientEmail: 'a', privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }), scopes: ['s'], now: 1 }),
    ).rejects.toThrow();
  });
});
