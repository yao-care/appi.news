import { describe, it, expect, vi, afterEach } from 'vitest';
import { postMessage } from './slack.mjs';

afterEach(() => vi.restoreAllMocks());

describe('postMessage', () => {
  it('POST chat.postMessage 帶 Bearer 與 channel/text/blocks', async () => {
    const spy = vi.fn(async () => new Response(JSON.stringify({ ok: true, ts: '1.2' }), { status: 200 }));
    vi.stubGlobal('fetch', spy);
    await postMessage({ token: 'xoxb-t', channel: 'C1', text: 'hi', blocks: [{ type: 'section' }] });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('https://slack.com/api/chat.postMessage');
    expect(init.headers.Authorization).toBe('Bearer xoxb-t');
    const body = JSON.parse(init.body);
    expect(body).toEqual({ channel: 'C1', text: 'hi', blocks: [{ type: 'section' }] });
  });

  it('Slack 回 ok:false → 丟錯帶 error 字串', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: false, error: 'not_in_channel' }), { status: 200 })));
    await expect(postMessage({ token: 'x', channel: 'C1', text: 'hi' })).rejects.toThrow('not_in_channel');
  });
});
