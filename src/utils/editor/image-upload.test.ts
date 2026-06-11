import { describe, it, expect, vi, afterEach } from 'vitest';
import { extForMime, imageUploadName, repoImagePath, publicImageUrl, uploadImage, b64ToBlob } from './image-upload';

afterEach(() => vi.restoreAllMocks());

function blobOf(bytes: number[], type: string): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

describe('image-upload 檔名/路徑', () => {
  it('extForMime 對應常見圖片 MIME，未知退 png', () => {
    expect(extForMime('image/jpeg')).toBe('jpg');
    expect(extForMime('image/png')).toBe('png');
    expect(extForMime('image/webp')).toBe('webp');
    expect(extForMime('image/svg+xml')).toBe('svg');
    expect(extForMime('application/octet-stream')).toBe('png');
  });
  it('imageUploadName 用 slug + 時間戳 + 副檔名，slug 清成小寫安全字元', () => {
    expect(imageUploadName('vitamin-c-myth', 'image/jpeg', 1700000000000)).toBe('vitamin-c-myth-1700000000000.jpg');
    expect(imageUploadName('A B/c', 'image/png', 1)).toBe('a-b-c-1.png');
    expect(imageUploadName('', 'image/png', 5)).toBe('image-5.png');
  });
  it('repoImagePath 與 publicImageUrl（預設 images）', () => {
    expect(repoImagePath('x-1.png')).toBe('public/images/x-1.png');
    expect(publicImageUrl('x-1.png')).toBe('/images/x-1.png');
  });
  it('repoImagePath 與 publicImageUrl（covers 目錄）', () => {
    expect(repoImagePath('c-1.png', 'covers')).toBe('public/covers/c-1.png');
    expect(publicImageUrl('c-1.png', 'covers')).toBe('/covers/c-1.png');
  });
  it('b64ToBlob 還原位元組與 MIME', async () => {
    const blob = b64ToBlob(btoa('\x01\x02\x03'), 'image/png');
    expect(blob.type).toBe('image/png');
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });
});

describe('uploadImage', () => {
  it('PUT 圖片到 public/images 並回傳 /images/ 路徑', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', spy);
    const url = await uploadImage({ blob: blobOf([1, 2, 3], 'image/png'), slug: 'demo', token: 'tok', timestamp: 42 });
    expect(url).toBe('/images/demo-42.png');
    const [reqUrl, init] = spy.mock.calls[0];
    expect(reqUrl).toBe('https://api.github.com/repos/yao-care/appi.news/contents/public/images/demo-42.png');
    expect((init as RequestInit).method).toBe('PUT');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.branch).toBe('main');
    expect(Buffer.from(body.content, 'base64')).toEqual(Buffer.from([1, 2, 3]));
  });

  it('dir=covers → PUT 到 public/covers 並回傳 /covers/ 路徑', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', spy);
    const url = await uploadImage({ blob: blobOf([9], 'image/png'), slug: 'cov', token: 'tok', timestamp: 7, dir: 'covers' });
    expect(url).toBe('/covers/cov-7.png');
    expect(spy.mock.calls[0][0]).toBe('https://api.github.com/repos/yao-care/appi.news/contents/public/covers/cov-7.png');
  });

  it('失敗回非 2xx → 丟出可讀錯誤', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 403 })));
    await expect(uploadImage({ blob: blobOf([0], 'image/png'), slug: 'd', token: 't', timestamp: 1 }))
      .rejects.toThrow('圖片上傳失敗（403）');
  });
});
