import { describe, it, expect, vi, afterEach } from 'vitest';
import worker, { handle, parseTagArray, stockImageId, applyPeopleDirective, type Env } from './index';

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

function mockKV() {
  const store = new Map<string, string>();
  return { store, get: async (k: string) => store.get(k) ?? null, put: async (k: string, v: string) => { store.set(k, v); } };
}

describe('非同步生圖', () => {
  it('/generate-async 入列 + KV pending；queue consumer 跑完寫 done', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 })) // requirePush
      .mockResolvedValue(new Response(JSON.stringify({ data: [{ b64_json: 'AAAA' }] }), { status: 200 })); // consumer → OpenAI
    vi.stubGlobal('fetch', fetchMock);
    const kv = mockKV();
    const sent: any[] = [];
    const env2 = { ...env, GEN_JOBS: kv, GEN_QUEUE: { send: async (b: unknown) => { sent.push(b); } } };
    const req = new Request('https://w.dev/generate-async', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer x' }, body: JSON.stringify({ prompt: '一個人', model: 'openai', size: 'landscape' }) });
    const res = await handle(req, env2);
    expect(res.status).toBe(200);
    const data = await res.json() as { jobId: string };
    expect(typeof data.jobId).toBe('string');
    expect(kv.store.get(data.jobId)).toContain('pending');
    expect(sent).toHaveLength(1);
    expect(sent[0].jobId).toBe(data.jobId);
    expect(sent[0].prompt).toContain('Taiwanese'); // 入列時已套台灣人鐵律

    // 模擬 queue consumer 處理該訊息
    let acked = false;
    await worker.queue!({ messages: [{ body: sent[0], ack: () => { acked = true; }, retry: () => {} }] }, env2);
    expect(acked).toBe(true);
    expect(kv.store.get(data.jobId)).toContain('done');
    expect(kv.store.get(data.jobId)).toContain('AAAA');
  });

  it('Flux：/generate-async 走 fal 佇列，回 fal:<reqId>（不動 Cloudflare Queue/KV）', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 })) // requirePush
      .mockResolvedValueOnce(new Response(JSON.stringify({ request_id: 'REQ123' }), { status: 200 })); // fal submit
    vi.stubGlobal('fetch', fetchMock);
    const sent: any[] = [];
    const env2 = { ...env, FAL_KEY: 'fk', GEN_QUEUE: { send: async (b: unknown) => { sent.push(b); } } };
    const req = new Request('https://w.dev/generate-async', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer x' }, body: JSON.stringify({ prompt: '一個人', model: 'flux', size: 'landscape' }) });
    const res = await handle(req, env2);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ jobId: 'fal:REQ123' });
    expect(sent).toHaveLength(0); // 沒走 Cloudflare Queue
    expect(fetchMock.mock.calls[1][0]).toContain('queue.fal.run');
  });

  it('Flux：/generate-status id=fal:… → 查 fal，COMPLETED 取圖回 done', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'COMPLETED' }), { status: 200 })) // status
      .mockResolvedValueOnce(new Response(JSON.stringify({ images: [{ url: 'https://fal.media/x.jpg' }] }), { status: 200 })) // result
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'content-type': 'image/jpeg' } })); // image
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(new Request('https://w.dev/generate-status?id=fal:REQ123'), { ...env, FAL_KEY: 'fk' });
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; mime: string; b64: string };
    expect(data.status).toBe('done');
    expect(data.mime).toBe('image/jpeg');
    expect(data.b64).toBe(btoa('\x01\x02\x03'));
  });

  it('Flux：fal 狀態未完成 → pending', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 'IN_PROGRESS' }), { status: 200 })));
    const res = await handle(new Request('https://w.dev/generate-status?id=fal:REQ123'), { ...env, FAL_KEY: 'fk' });
    expect(await res.json()).toEqual({ status: 'pending' });
  });

  it('/generate-status 回 KV 內容；無工單 → unknown', async () => {
    const kv = mockKV();
    kv.store.set('jid', JSON.stringify({ status: 'done', b64: 'AAAA', mime: 'image/png' }));
    const r1 = await handle(new Request('https://w.dev/generate-status?id=jid'), { ...env, GEN_JOBS: kv });
    expect(await r1.json()).toMatchObject({ status: 'done', b64: 'AAAA' });
    const r2 = await handle(new Request('https://w.dev/generate-status?id=none'), { ...env, GEN_JOBS: kv });
    expect(await r2.json()).toEqual({ status: 'unknown' });
  });
});

describe('applyPeopleDirective', () => {
  it('附加台灣人鐵律於 prompt 後', () => {
    const out = applyPeopleDirective('a person at a desk');
    expect(out).toContain('a person at a desk');
    expect(out).toContain('Taiwanese');
  });
});

describe('/slug', () => {
  function slugReq(body: object, auth = 'Bearer ght') {
    return new Request('https://w.dev/slug', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: auth },
      body: JSON.stringify(body),
    });
  }

  it('把 Claude 回的雜訊淨化成 kebab-case slug', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 })) // requirePush
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ content: [{ type: 'text', text: ' TSMC Q3 Profit! ' }] }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const res = await handle(slugReq({ title: '台積電 Q3 獲利年增 39%' }), env);
    expect(res.status).toBe(200);
    expect((await res.json() as { slug: string }).slug).toBe('tsmc-q3-profit');
  });
});

describe('/generate 套用台灣人鐵律', () => {
  it('送給 OpenAI 的 prompt 含 Taiwanese', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ b64_json: 'AAAA' }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await handle(genReq({ prompt: '一個人', model: 'openai', size: 'landscape' }), env);
    const body = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(body.prompt).toContain('一個人');
    expect(body.prompt).toContain('Taiwanese');
  });
});

describe('stockImageId', () => {
  it('unsplash / pexels URL → 穩定識別；其他 → null', () => {
    expect(stockImageId('https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixid=x')).toBe('unsplash:1581235720704-06d3acfcb36f');
    expect(stockImageId('https://images.pexels.com/photos/3760069/pexels-photo.jpeg')).toBe('pexels:3760069');
    expect(stockImageId('/covers/wp-1.jpg')).toBeNull();
  });
});

describe('/stock', () => {
  it('合併兩家、濾掉 exclude 的已用圖', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 }))
      // unsplash
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [
        { urls: { regular: 'https://images.unsplash.com/photo-AAA?x', small: 'https://images.unsplash.com/photo-AAA?s' }, user: { name: 'Ann', links: { html: 'https://u/ann' } } },
        { urls: { regular: 'https://images.unsplash.com/photo-BBB?x' }, user: { name: 'Bob' } },
      ] }), { status: 200 }))
      // pexels
      .mockResolvedValueOnce(new Response(JSON.stringify({ photos: [
        { src: { large: 'https://images.pexels.com/photos/123/p.jpg', medium: 'https://images.pexels.com/photos/123/m.jpg' }, photographer: 'Cat' },
      ] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const req = new Request('https://w.dev/stock', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer x' }, body: JSON.stringify({ keywords: 'office desk', exclude: ['unsplash:BBB'] }) });
    const res = await handle(req, { ...env, UNSPLASH_ACCESS_KEY: 'uk', PEXELS_API_KEY: 'pk' });
    expect(res.status).toBe(200);
    const data = await res.json() as { photos: { id: string; credit: string }[] };
    const ids = data.photos.map((p) => p.id);
    expect(ids).toContain('unsplash:AAA');
    expect(ids).toContain('pexels:123');
    expect(ids).not.toContain('unsplash:BBB'); // 被 exclude 濾掉
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

describe('/stock-search 圖庫代理', () => {
  function stockReq(body: object, auth = 'Bearer ght') {
    return new Request('https://w.dev/stock-search', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: auth },
      body: JSON.stringify(body),
    });
  }
  function mockByUrl() {
    return vi.fn(async (input: RequestInfo | URL) => {
      const u = String(typeof input === 'string' ? input : (input as Request).url ?? input);
      if (u.includes('api.github.com/repos')) return new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 });
      if (u.includes('api.unsplash.com')) return new Response(JSON.stringify({ results: [{ urls: { regular: 'https://images.unsplash.com/photo-abc123', small: 'https://images.unsplash.com/photo-abc123?w=200' }, user: { name: 'Ann', links: { html: 'https://unsplash.com/@ann' } } }] }), { status: 200 });
      if (u.includes('api.pexels.com')) return new Response(JSON.stringify({ photos: [{ src: { large: 'https://images.pexels.com/photos/9988/x.jpg', medium: 'https://images.pexels.com/photos/9988/x.jpg?w=300' }, photographer: 'Bob', photographer_url: 'https://pexels.com/@bob' }] }), { status: 200 });
      return new Response('not found', { status: 404 });
    });
  }
  it('回兩家候選（含去重 id）', async () => {
    vi.stubGlobal('fetch', mockByUrl());
    const res = await handle(stockReq({ query: 'data center' }), { ...env, UNSPLASH_ACCESS_KEY: 'u', PEXELS_API_KEY: 'p' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { unsplash: { id: string }[]; pexels: { id: string }[] };
    expect(body.unsplash[0].id).toBe('unsplash:abc123');
    expect(body.pexels[0].id).toBe('pexels:9988');
  });
  it('缺 query → 400', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ permissions: { push: true } }), { status: 200 })));
    const res = await handle(stockReq({}), env);
    expect(res.status).toBe(400);
  });
  it('無 push 權 → 403', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ permissions: { push: false } }), { status: 200 })));
    const res = await handle(stockReq({ query: 'x' }), env);
    expect(res.status).toBe(403);
  });
});
