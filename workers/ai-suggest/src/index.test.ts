import { describe, it, expect, vi, afterEach } from 'vitest';
import { handle, parseTagArray, type Env } from './index';

const env: Env = {
  ANTHROPIC_API_KEY: 'sk-test',
  ANTHROPIC_MODEL: 'claude-haiku-4-5-20251001',
  ALLOWED_ORIGIN: 'https://yao-care.github.io',
  GITHUB_OWNER: 'yao-care',
  GITHUB_REPO: 'appi.news',
  OPENAI_API_KEY: 'sk-openai-test',
  FAL_KEY: 'fal-test',
};

function req(body: object, auth = 'Bearer ght') {
  return new Request('https://w.dev/suggest', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: auth },
    body: JSON.stringify(body),
  });
}

function genReq(body: object, auth = 'Bearer ght') {
  return new Request('https://w.dev/generate', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: auth },
    body: JSON.stringify(body),
  });
}

function tagsReq(body: object, auth = 'Bearer ght') {
  return new Request('https://w.dev/tags', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: auth },
    body: JSON.stringify(body),
  });
}

afterEach(() => vi.restoreAllMocks());

describe('parseTagArray', () => {
  it('純 JSON 陣列', () => {
    expect(parseTagArray('["失智照護","社區設計"]')).toEqual(['失智照護', '社區設計']);
  });
  it('包在 ```json 與雜訊中也能取出，並去井字號、限 8 個', () => {
    expect(parseTagArray('好的：\n```json\n["#健康","醫療"]\n```')).toEqual(['健康', '醫療']);
  });
  it('無陣列 → 空', () => {
    expect(parseTagArray('抱歉我無法')).toEqual([]);
  });
});

describe('/tags', () => {
  it('有寫入權 → 呼叫 Claude，回 { tags }', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: [{ type: 'text', text: '["失智照護","音樂治療"]' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(tagsReq({ title: '失智友善', body: '內文…' }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tags: ['失智照護', '音樂治療'] });
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.anthropic.com/v1/messages');
  });
  it('無寫入權 → 403', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ permissions: { push: false } }), { status: 200 })));
    expect((await handle(tagsReq({ title: 'x' }), env)).status).toBe(403);
  });
});

describe('/suggest', () => {
  it('無寫入權的 token → 403', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ permissions: { push: false } }), { status: 200 })
    ));
    const res = await handle(req({ task: 'rewrite', context: {}, selection: 'x' }), env);
    expect(res.status).toBe(403);
  });

  it('有寫入權 → 呼叫 Claude，回 { suggestion }', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: [{ type: 'text', text: '改寫後的句子。' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(req({ task: 'rewrite', context: {}, selection: '原句。' }), env);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ suggestion: '改寫後的句子。' });
    // 第二次呼叫是 Anthropic
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect((init as RequestInit).headers).toMatchObject({ 'x-api-key': 'sk-test', 'anthropic-version': '2023-06-01' });
  });
});

describe('/generate', () => {
  it('無寫入權 → 403', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ permissions: { push: false } }), { status: 200 })
    ));
    const res = await handle(genReq({ prompt: 'a cat', model: 'openai' }), env);
    expect(res.status).toBe(403);
  });

  it('缺 prompt → 400', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 })
    ));
    const res = await handle(genReq({ prompt: '   ', model: 'openai' }), env);
    expect(res.status).toBe(400);
  });

  it('OpenAI：橫式 size 對應 1536x1024，回 { b64, mime }', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ b64_json: 'AAAA' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(genReq({ prompt: '一隻貓', model: 'openai', size: 'landscape' }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ b64: 'AAAA', mime: 'image/png' });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.openai.com/v1/images/generations');
    expect(JSON.parse((init as RequestInit).body as string)).toMatchObject({ model: 'gpt-image-1', size: '1536x1024' });
  });

  it('Flux：fal 回 URL → worker 抓圖轉 b64', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ images: [{ url: 'https://fal.media/x.jpg' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'content-type': 'image/jpeg' } }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(genReq({ prompt: '森林', model: 'flux', size: 'landscape' }), env);
    expect(res.status).toBe(200);
    const data = await res.json() as { b64: string; mime: string };
    expect(data.mime).toBe('image/jpeg');
    expect(data.b64).toBe(btoa('\x01\x02\x03'));
    expect(fetchMock.mock.calls[1][0]).toBe('https://fal.run/fal-ai/flux/schnell');
  });

  it('OpenAI dall-e-3：橫式 1792x1024、不送 response_format', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ b64_json: 'BBBB' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(genReq({ prompt: '貓', model: 'openai', size: 'landscape' }), { ...env, OPENAI_IMAGE_MODEL: 'dall-e-3' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ b64: 'BBBB', mime: 'image/png' });
    const body = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(body).toMatchObject({ model: 'dall-e-3', size: '1792x1024' });
    expect(body).not.toHaveProperty('response_format');
  });

  it('OpenAI 只回 url → worker 抓圖轉 b64', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ url: 'https://oai.example/x.png' }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([9, 8, 7]), { status: 200, headers: { 'content-type': 'image/png' } }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(genReq({ prompt: '貓', model: 'openai', size: 'landscape' }), { ...env, OPENAI_IMAGE_MODEL: 'dall-e-3' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ b64: btoa('\x09\x08\x07'), mime: 'image/png' });
  });

  it('OpenAI 失敗 → 502', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(genReq({ prompt: 'x', model: 'openai' }), env);
    expect(res.status).toBe(502);
  });
});
