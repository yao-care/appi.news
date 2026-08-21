import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { expandPhotoPrompt, composePhotoPrompt, varietyHints } from './photo-prompt.mjs';
import { visualCheck, stockPhotoCheck } from './visual-check.mjs';
import { WRITER_CMD, WRITER_MODEL, classifyWriterRun } from './writer-cli.mjs';

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

// 取 GitHub token（worker 的圖庫搜尋 /stock-search 以 repo push 權限防付費 API 被濫用）：
// env 優先，否則 gh auth token。（生圖已不走 worker，此 token 只剩 stock.mjs 在用。）
export function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

/** 解析 codex 生圖回覆的 IMG=<path> 行。純函式，供測試。 */
export function parseImgResult(stdout) {
  const m = String(stdout || '').match(/^IMG=(\S+)$/m);
  return m ? m[1] : null;
}

// codex 原生生圖（image_generation 工具，stable、額度走 codex 訂閱）。
// 站長 2026-08-22 裁示：生圖本體改用 codex；worker / OpenAI API 僅作備援。
// 產出 1536x1024 橫式 PNG（實測 0.149），toWebp 再縮到目標寬。
// prompt 走 stdin（與 runWriterOnce 同理由：避免特殊字元/長度咬到 argv）。
async function generateViaCodex({ prompt, width, timeoutMs = 12 * 60_000 }) {
  const dir = mkdtempSync(join(tmpdir(), 'appi-codeximg-'));
  const out = join(dir, 'gen.png');
  try {
    const instruction = `用你的 image_generation 工具生成一張圖片。圖片需求（英文 prompt，照用、不要改寫）：

${prompt}

要求：橫式（landscape）。生成後用 shell 把產出的圖檔複製到 ${out}，最後只回覆一行：IMG=${out}`;
    const r = spawnSync(WRITER_CMD, [
      'exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check',
      '-m', WRITER_MODEL, '-c', 'model_reasoning_effort="low"',
    ], { encoding: 'utf8', input: instruction, maxBuffer: 32 * 1024 * 1024, timeout: timeoutMs, killSignal: 'SIGKILL' });
    const c = classifyWriterRun(r);
    if (c.kind !== 'ok') throw new Error(`codex 生圖 ${c.kind}：${(c.detail || '').slice(0, 150)}`);
    const path = parseImgResult(c.stdout);
    const file = path && existsSync(path) ? path : (existsSync(out) ? out : null);
    if (!file) throw new Error('codex 生圖無產出檔（回覆缺 IMG= 行且暫存路徑無檔案）');
    return toWebp(readFileSync(file), width);
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* 忽略 */ }
  }
}

// 整合（不單元測試）：生圖 → webp。
// 🔴 生圖唯一路徑＝codex 原生 image_generation（站長 2026-08-22 裁示：100% 走 codex，
// 不得退回 gpt-image-2 API／worker）。codex 失敗就 throw，讓配圖 gate 照紅線「中止不發、
// 改動留工作區待補」，不准靜默改用其他引擎。model/size/quality 參數已停用，
// 僅為呼叫端簽名相容而保留。
export async function generateImage({
  topic,
  context = '',
  width = 1200,
  model: _model, // 停用（僅簽名相容）
  size: _size, // 停用（僅簽名相容）
  quality: _quality, // 停用（僅簽名相容）
  prompt: prebuiltPrompt, // 人物 photoreal 路徑傳 composePhotoPrompt 組好的完整 prompt
}) {
  const prompt = prebuiltPrompt && String(prebuiltPrompt).trim()
    ? String(prebuiltPrompt).trim()
    : buildImagePrompt({ topic, context });
  return generateViaCodex({ prompt, width });
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
 * 超寫實攝影生圖（人物與非人物場景通用；移植自 writer 的優化流程，2026-07 依站長回饋
 * 擴為全生成路徑的標準——概念/封面生成不再走插畫拼貼，改走新聞攝影感）：
 *   ① sonnet 展開 detail（帶 seed 多樣性輪轉：構圖/光線/人選/色調逐篇輪開，反套版）
 *   →②composePhotoPrompt 組完整攝影 prompt（含反拼貼硬條款）→③生圖（quality medium）
 *   →④haiku 視覺自檢（手指/文字/AI 破綻/東亞面孔）→⑤不合格用同 prompt 重生一次（第二張無條件採用）
 * 全程「失敗即退回、不阻斷」：展開失敗退短 detail；驗圖失敗放行。
 * 回 {buffer,width,height, expanded, checked, ok, regenerated, checkReason?}
 */
export async function generatePhotoRealImage({
  topic,
  context = '',
  caption = '',
  alt = '',
  articleContext = '',
  width = 1200,
  quality = 'medium', // 擬真照：low 會糊，升 medium
  seed = '', // 多樣性輪轉種子（建議傳輸出檔路徑/slug）；空字串退 topic
}) {
  if (!topic || !String(topic).trim()) throw new Error('topic is required');

  const variety = varietyHints(seed || topic);
  const detail = await expandPhotoPrompt({
    brief: topic, alt, caption, articleContext: articleContext || context, variety,
  });
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

/** 相容別名（--people 路徑沿用舊名）。 */
export const generatePersonImage = generatePhotoRealImage;

/**
 * 圖庫候選照審查（相關度＋外國臉孔）：raw buffer 轉暫存 jpg → Haiku 讀圖判定。
 * 檢查環節失敗（CLI 錯）回 {ok:true} 放行，不阻斷出圖。
 */
export async function checkStockPhotoBuffer(rawBuffer, topic, context = '') {
  const dir = mkdtempSync(join(tmpdir(), 'appi-stockchk-'));
  const jpg = join(dir, 'stock.jpg');
  try {
    await sharp(rawBuffer).resize(1024, null, { withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(jpg);
    return await stockPhotoCheck(jpg, topic, context);
  } catch {
    return { ok: true }; // 檢查本身失敗不阻斷
  } finally {
    try { unlinkSync(jpg); } catch { /* 忽略 */ }
  }
}
