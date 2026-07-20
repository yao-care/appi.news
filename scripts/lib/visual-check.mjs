// 生成圖視覺自檢：人物照產出後，用 Haiku（帶 Read/vision 讀圖）檢查有無明顯破綻
// （手指/五官/肢體變形、圖內文字浮水印、明顯 AI 破綻、人物是否東亞面孔）。不合格由呼叫端
// 決定重生一次；檢查本身失敗（CLI 錯誤）一律放行，不阻斷出圖。
//
// 移植自 /root/agent.writer/scripts/lib/images/visual-check.ts 的 realism 分支。
// ⚠️ Read/vision 讀 webp 支援不保證 → 呼叫端須傳「PNG/JPG」臨時檔給本函式（非最終 webp）。

import path from 'node:path';
import { runClaudeAgentText } from './claude-cli.mjs';

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
  return `用 Read 工具讀取圖片檔 ${file}，檢查這張「擬真照片」配圖有沒有明顯破綻。

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

/**
 * 檢查一張人物擬真照。imagePath 需為 Read 可視覺讀取的點陣圖（PNG/JPG）。
 * 回 {ok, reason?}；CLI 錯誤時回 {ok:true}（不阻斷出圖）。
 */
export async function visualCheck(imagePath, prompt, alt) {
  const dir = path.dirname(imagePath);
  const file = path.basename(imagePath);
  try {
    const out = await runClaudeAgentText(dir, buildCheckPrompt(file, prompt, alt), {
      model: 'haiku',
      tools: 'Read',
      timeoutMs: 120_000,
    });
    return parseVerdict(out.trim());
  } catch {
    return { ok: true }; // 檢查失敗不阻斷流程
  }
}
