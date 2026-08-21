// 生成圖視覺自檢：人物照產出後，用 codex（-i 附圖 vision）檢查有無明顯破綻
// （手指/五官/肢體變形、圖內文字浮水印、明顯 AI 破綻、人物是否東亞面孔）。不合格由呼叫端
// 決定重生一次；檢查本身失敗（CLI 錯誤）一律放行，不阻斷出圖。
// 產圖相關 LLM 呼叫全走 codex＝站長 2026-08-22 追加裁示（原為 claude haiku＋Read 讀圖）。
//
// 移植自 /root/agent.writer/scripts/lib/images/visual-check.ts 的 realism 分支。
// ⚠️ vision 讀 webp 支援不保證 → 呼叫端須傳「PNG/JPG」臨時檔給本函式（非最終 webp）。

import path from 'node:path';
import { runWriterOnce } from './writer-cli.mjs';

/** 解析 Haiku 回覆：第一行 ok/no；no 時第二行為中文原因。純函式，供測試。 */
export function parseVerdict(text) {
  const lines = String(text ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const first = (lines[0] || '').toLowerCase();
  if (first.startsWith('no')) {
    return { ok: false, reason: lines.slice(1).join(' ') || undefined };
  }
  return { ok: true };
}

/** 組人物擬真照的檢查指令。純函式，供測試。 */
export function buildCheckPrompt(file, prompt, alt) {
  return `檢視附上的圖片（檔名 ${file}），檢查這張「擬真照片」配圖有沒有明顯破綻。

這張圖想呈現的內容（英文需求）：${prompt}
中文圖說：${alt || ''}

只要符合下列任一即為「不合格」：
- 手指、五官、肢體變形或數量錯誤（多指/少指、扭曲的臉）
- 圖內出現任何文字、字幕或浮水印痕跡（本圖應完全無文字）
- 有明顯的生成破綻：不自然的光影、過度平滑或塑膠感質感、物件穿模
- 圖中若有人物，但明顯不是亞洲（東亞）面孔

輕微的美觀問題（配色普通、風格樸素）不算不合格。
輸出格式：第一行只寫 ok 或 no；若 no，第二行用一句中文說明原因。不要其他文字。`;
}

/** 組圖庫照審查指令（相關度＋外國臉孔＋歐美場景＋浮水印）。純函式，供測試。
 *  2026-07 站長裁示：圖庫命中的人物若明顯是外國人形象，一律不用（改走生成）；
 *  「真實但不相關」比「生成但精準」更傷專業感，相關度不合格也淘汰。 */
export function buildStockCheckPrompt(file, topic, context) {
  return `檢視附上的圖片（檔名 ${file}），判斷這張「圖庫真實照片」適不適合當台灣新聞網站的文章配圖。

配圖主題：${topic}
文章脈絡：${context || ''}

只要符合下列任一即為「不合格」：
- 照片內容與主題無關、或關聯太牽強（讀者看圖聯想不到主題）
- 照片中有清楚可辨的人物，且明顯不是東亞面孔（本站讀者為台灣人，外國人像會失真）
- 主題是台灣本地情境，畫面卻明顯是歐美場景（西文招牌、外國街景建築）
- 圖上有浮水印、疊字、明顯過度修圖

構圖普通、色調樸素不算不合格；人物只是背景小殘影、辨識不出族裔也不算。
輸出格式：第一行只寫 ok 或 no；若 no，第二行用一句中文說明原因。不要其他文字。`;
}

/**
 * 審查一張圖庫候選照（相關度＋臉孔）。imagePath 需為 PNG/JPG。
 * 回 {ok, reason?}；CLI 錯誤時回 {ok:true}（fail-open，不阻斷配圖流程）。
 */
export async function stockPhotoCheck(imagePath, topic, context) {

  const file = path.basename(imagePath);
  try {
    const out = await runWriterOnce(buildStockCheckPrompt(file, topic, context), {
      images: [imagePath],
      timeoutMs: 120_000,
    });
    return parseVerdict(out.trim());
  } catch {
    return { ok: true }; // 檢查失敗不阻斷流程
  }
}

/**
 * 檢查一張人物擬真照。imagePath 需為 Read 可視覺讀取的點陣圖（PNG/JPG）。
 * 回 {ok, reason?}；CLI 錯誤時回 {ok:true}（不阻斷出圖）。
 */
export async function visualCheck(imagePath, prompt, alt) {

  const file = path.basename(imagePath);
  try {
    const out = await runWriterOnce(buildCheckPrompt(file, prompt, alt), {
      images: [imagePath],
      timeoutMs: 120_000,
    });
    return parseVerdict(out.trim());
  } catch {
    return { ok: true }; // 檢查失敗不阻斷流程
  }
}
