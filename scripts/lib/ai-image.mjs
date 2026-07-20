import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { expandPhotoPrompt, composePhotoPrompt } from './photo-prompt.mjs';
import { visualCheck } from './visual-check.mjs';

// 生圖專門機制：Cloudflare Worker（與前端 src/utils/editor/ai-worker.ts 同一個，
// OpenAI/Fal 金鑰已設在 worker 上）。換網域時兩邊一起改。
export const AI_WORKER = 'https://appi-news-ai-suggest.lightman-chang.workers.dev';

// 沿用 worker / regen-covers 的台灣人物鐵律
export const PEOPLE_DIRECTIVE =
  'If any people appear, they must be Taiwanese (East Asian, natural Han Taiwanese appearance). Do not depict people of other ethnicities.';

const STYLE =
  'Minimalist editorial illustration. Refined and sophisticated, calm muted tones, soft natural lighting, a subtle navy-and-warm-neutral palette, professional magazine aesthetic, plenty of negative space. No text, no words, no letters, no logos, no captions.';

// 純函式：組生圖 prompt，永遠附風格與台灣人物鐵律
export function buildImagePrompt({ topic, context = '' }) {
  if (!topic || !String(topic).trim()) throw new Error('topic is required');
  const ctx = String(context).trim() ? ` Context: ${String(context).trim()}.` : '';
  return `${STYLE} Subject: ${String(topic).trim()}.${ctx} ${PEOPLE_DIRECTIVE}`;
}

// 純函式：任意圖片 buffer → 指定寬度 webp，回傳 {buffer,width,height}
// 封面預設寬 1200（Discover/Top Stories 大圖門檻）；withoutEnlargement 故來源不足時不放大。
export async function toWebp(inputBuffer, width = 1200, quality = 72) {
  const { data: buffer, info } = await sharp(inputBuffer)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });
  return { buffer, width: info.width, height: info.height };
}

// 純函式：CLS 安全的 <img>（width/height + lazy + decoding）
export function imgTag({ src, width, height, alt = '' }) {
  if (!src) throw new Error('src is required');
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error('imgTag requires numeric width and height (CLS safety)');
  }
  const safeAlt = String(alt ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<img src="${src}" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${safeAlt}">`;
}

export function readOpenAIKey() {
  const path = join(homedir(), '.config/appi-news/ai-worker.secrets');
  const m = readFileSync(path, 'utf8').match(/^OPENAI_API_KEY=(.+)$/m);
  if (!m) throw new Error(`OPENAI_API_KEY not found in ${path}`);
  return m[1].trim().replace(/^["']|["']$/g, '');
}

// 取 GitHub token（worker 以 repo push 權限防付費 API 被濫用）：env 優先，否則 gh auth token。
export function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// 經 worker 同步生圖（POST /generate → {b64,mime}），回 webp。worker 端會強制台灣人物鐵律。
// quality 明確帶入時附進 body（人物 photoreal 用 'medium'）；省略則由 worker 用其 env 預設（low）。
async function generateViaWorker({ prompt, width, token, quality }) {
  const body = { prompt, size: 'landscape' };
  if (quality) body.quality = quality;
  const res = await fetch(`${AI_WORKER}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`worker 生圖失敗（${res.status}）：${(await res.text()).slice(0, 200)}`);
  const { b64 } = await res.json();
  if (!b64) throw new Error('worker 未回傳圖片');
  return toWebp(Buffer.from(b64, 'base64'), width);
}

// 整合（不單元測試）：生圖 → webp。
// 優先走專門機制（worker，金鑰已配好）；無 GitHub token 才退回本機 OpenAI 金鑰。
export async function generateImage({
  topic,
  context = '',
  width = 1200,
  model = 'gpt-image-2',
  size = '1536x1024',
  quality = 'low', // 段落圖多，用 low 控成本
  prompt: prebuiltPrompt, // 人物 photoreal 路徑傳 composePhotoPrompt 組好的完整 prompt
}) {
  const prompt = prebuiltPrompt && String(prebuiltPrompt).trim()
    ? String(prebuiltPrompt).trim()
    : buildImagePrompt({ topic, context });

  const token = githubToken();
  if (token) {
    return generateViaWorker({ prompt, width, token, quality });
  }

  // fallback：本機 OpenAI 金鑰直打
  const key = readOpenAIKey();
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, prompt, size, quality, n: 1 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const b64 = (await res.json()).data?.[0]?.b64_json;
  if (!b64) throw new Error('no image returned');
  return toWebp(Buffer.from(b64, 'base64'), width);
}

// 生成圖 → 暫存成 jpg（Read/vision 讀 webp 支援不保證）→ 視覺自檢 → 清暫存。
async function checkWebp(webpBuffer, prompt, alt) {
  const dir = mkdtempSync(join(tmpdir(), 'appi-imgchk-'));
  const jpg = join(dir, 'check.jpg');
  try {
    await sharp(webpBuffer).jpeg({ quality: 90 }).toFile(jpg);
    return await visualCheck(jpg, prompt, alt);
  } catch {
    return { ok: true }; // 檢查環節本身失敗不阻斷
  } finally {
    try { unlinkSync(jpg); } catch { /* 忽略 */ }
  }
}

/**
 * 人物 photoreal 生圖（newsroom --people 路徑，移植自 writer 的優化流程）：
 *   ① sonnet 展開 detail →②composePhotoPrompt 組完整攝影 prompt →③生圖（quality medium）
 *   →④haiku 視覺自檢（手指/文字/AI 破綻/東亞面孔）→⑤不合格用同 prompt 重生一次（第二張無條件採用）
 * 全程「失敗即退回、不阻斷」：展開失敗退短 detail；驗圖失敗放行。
 * 回 {buffer,width,height, expanded, checked, ok, regenerated, checkReason?}
 */
export async function generatePersonImage({
  topic,
  context = '',
  caption = '',
  alt = '',
  articleContext = '',
  width = 1200,
  quality = 'medium', // 人物擬真照：low 會糊，升 medium
}) {
  if (!topic || !String(topic).trim()) throw new Error('topic is required');

  const detail = await expandPhotoPrompt({ brief: topic, alt, caption, articleContext: articleContext || context });
  const finalDetail = detail || [topic, caption || context || alt].filter(Boolean).join('. ').trim();
  const prompt = composePhotoPrompt(finalDetail);

  const first = await generateImage({ topic, context, width, quality, prompt });
  const verdict = await checkWebp(first.buffer, prompt, alt);
  if (verdict.ok) {
    return { ...first, expanded: !!detail, checked: true, ok: true, regenerated: false };
  }

  // 不合格：同 prompt 重擲一次，第二張無條件採用（不再驗、不阻斷）。
  const second = await generateImage({ topic, context, width, quality, prompt });
  return { ...second, expanded: !!detail, checked: true, ok: false, regenerated: true, checkReason: verdict.reason };
}
