// 擬真照專職 prompt 寫手（newsroom 人物生圖用）。移植自
// /root/agent.writer/scripts/lib/images/photo-prompt.ts（站長指定「套用 writer 優化過的流程」）。
//
// get-image.mjs 的人物路徑原本只餵「一句 STYLE + Subject + 一句台灣人」給 gpt-image，細節不足、
// 偏插畫感。本模組多一次 sonnet 呼叫把「該段重點/圖說」展開成 150–300 字的完整攝影 prompt
// （膚質/髮型/服裝/道具/場景/鏡頭逐面向），再機械套上固定攝影技術規格串＋硬性條款＋Avoid 清單
// （gpt-image 無獨立 negative 參數，避免事項寫進同段 prompt）。
//
// 展開失敗（CLI 錯、兩次都太短）回 null，呼叫端退回「短 detail + 同一組技術規格」組裝——
// 仍是 photoreal，只是細節較少；本模組只提升品質，絕不成為配圖管線的新故障點。

import { runClaudeOnce } from './claude-cli.mjs';

/** 固定攝影技術規格串（品質關鍵詞；鏡頭焦段由展開後的構圖段落決定，這裡保持通用） */
export const PHOTO_TECH_SPEC =
  'Photorealistic, ultra-realistic RAW photo, 8K Ultra HD, HDR, '
  + 'premium lifestyle editorial photography, cinematic photography. '
  + 'Shot on a full-frame professional mirrorless camera (Sony Alpha A1 class) with a fast prime lens, '
  + 'natural daylight, shallow depth of field, creamy bokeh, global illumination, '
  + 'Kodak Portra 400 style color grading. '
  + 'Natural skin texture with visible pores, realistic hair strands, '
  + 'award-winning photography, masterpiece, best quality.';

/** 硬性條款（亞洲面孔／台灣場景／穿著得體／圖內零文字）——不信任展開結果，一律機械附加 */
export const PHOTO_HARD_CLAUSES =
  'All people in the image MUST be East Asian (Taiwanese), well-groomed and stylishly presented '
  + 'like subjects in a premium lifestyle magazine. Clothing MUST be tasteful and modest — '
  + 'no revealing or suggestive outfits. The setting MUST look like Taiwan. '
  + 'Absolutely NO text, NO captions, NO logos, NO watermarks anywhere in the image.';

/** Avoid 清單（等價於 negative prompt，寫進 prompt 末尾） */
export const PHOTO_AVOID =
  'Avoid: low quality, blurry, noise, over-processed plastic skin, over-smoothed skin, '
  + 'bad anatomy, wrong body proportions, extra or missing fingers, deformed hands, malformed face, '
  + 'cross-eyed or asymmetrical eyes, bad teeth, duplicate person, mutated limbs, floating objects, '
  + 'overexposed, underexposed, watermark, text, logo, frame, cropped subject, '
  + 'AI artifacts, unnatural pose, unrealistic lighting.';

/** 展開結果的最低字數門檻（英文詞）；低於此視為失敗（退回短 detail） */
export const MIN_DETAIL_WORDS = 100;

/** 清掉 markdown 圍欄與前後贅字，只留 prompt 本文 */
export function sanitizeDetail(text) {
  let t = String(text ?? '').trim();
  const fence = t.match(/^```[a-z]*\n([\s\S]*?)\n```$/i);
  if (fence) t = fence[1].trim();
  return t;
}

/** 英文詞數（空白切分）達門檻才算合格的展開結果 */
export function detailOk(text) {
  return String(text ?? '').split(/\s+/).filter(Boolean).length >= MIN_DETAIL_WORDS;
}

/** 展開後的細節 ＋ 固定技術規格 ＋ 硬性條款 ＋ Avoid 清單 → 最終 gpt-image prompt */
export function composePhotoPrompt(detail) {
  return `${PHOTO_TECH_SPEC}\n\n${String(detail ?? '').trim()}\n\n${PHOTO_HARD_CLAUSES}\n\n${PHOTO_AVOID}`;
}

/**
 * 組展開用的中文指令。
 * @param {{brief:string, alt?:string, caption?:string, articleContext?:string}} ctx
 *   brief          — 該段配圖重點（get-image 的 --topic）
 *   alt            — 中文畫面描述（--alt，可省）
 *   caption        — 這張圖要傳達的訊息（--caption，可省，最重要）
 *   articleContext — 文章主題脈絡（--article-context / --context，可省）
 */
export function buildWriterPrompt(ctx, retryHint = false) {
  const retry = retryHint
    ? '\n\n⚠️ 上次輸出太短或格式不符，請務必輸出 150–300 個英文詞的完整 prompt 本文，不要任何說明文字。\n'
    : '';
  const message = (ctx.caption && ctx.caption.trim()) || ctx.brief;
  const topic = ctx.articleContext && ctx.articleContext.trim();
  const alt = (ctx.alt && ctx.alt.trim()) || '';
  return `你是商業攝影與圖像生成的 prompt 專家。這是一篇文章要用的照片，把拍攝需求展開成一段可直接餵給圖像生成模型的**英文**攝影 prompt。${retry}

最高原則：照片裡**每一個具體細節**（人物的表情神態、動作、手上與周邊的物件、服裝、場景）都必須**服務「這張圖要傳達的訊息」與文章主題**，用來幫讀者看懂內容，不是為了畫面好看而堆砌。與主題無關的細節寧可不寫。
${topic ? `\n文章主題：${topic}` : ''}
這張圖要傳達的訊息（最重要，所有細節都要呼應它）：${message}
拍攝需求（構圖起點）：${ctx.brief}
畫面描述：${alt}

選角與造型基準（最重要的品質分水嶺）：人物是**保養得宜、有造型感的現代台灣人**——像高質感生活雜誌的受訪者，不是圖庫衛教照裡憔悴、素顏、穿鬆垮舊衣的路人。年齡跟文章讀者群走，但中年要寫成「優雅輕熟、保養得宜」（elegant, well-maintained, youthful-looking for their age），絕不是疲憊大嬸大叔。

輸出涵蓋以下面向，具體、視覺化（總長 150–300 個英文詞，連貫段落）：
1. Subject：真實膚質（可見毛孔、自然光澤、健康透亮、不過度磨皮、無塑膠感）、精緻自然的臉型五官、淡雅自然妝感（男性則是乾淨整潔的儀容）；**髮型要有設計感**——具體寫出層次、捲度、瀏海或編髮等造型細節（不是扁塌素髮）。人物一律 East Asian (Taiwanese)。**表情與神態要對應上面「要傳達的訊息」**，但基調一律從容自信。若需求不含人物，改寫主體物件的材質與細節。
2. Wardrobe & accessories：服裝寫到**款式、剪裁、材質、顏色**（如 ribbed knit top、tailored linen shirt、soft cashmere cardigan），符合場景，**穿著得體、不裸露**。可有**少量合理的生活感配件**（簡約手錶、細項鍊、小耳環、自然色系美甲），前提是不與場景衝突。
3. Props & setting：手上與周邊的物件、以及場景，必須**和文章主題直接相關、能幫讀者看懂主題**。場景取台灣在地感，環境乾淨明亮有質感。
4. Pose & composition：姿態動作對應訊息、放鬆自然不僵硬；景別（特寫／半身／全身）、鏡頭焦段與光圈（如 85mm f/1.4）、對焦點（眼睛銳利）、背景自然散景。
5. 拍攝需求裡的其他硬性要求逐一保留。

嚴禁：
- 名牌 logo、與場景衝突的浮誇單品、為堆砌而堆砌的無關道具。
- 裸露、暴露、性暗示的穿著或姿態。
- 圖內任何文字、招牌字樣、logo、浮水印。
- 明顯歐美的場景（西文招牌、歐式街景）。
- 「AI generated」等字樣。
只輸出英文 prompt 本文，不要說明、標題、條列編號或 markdown 圍欄。`;
}

/**
 * 把 brief（連同 caption／文章主題）展開成扣住內容的細節段落（純細節，不含技術規格與 Avoid，
 * 由 composePhotoPrompt 組裝）。兩次都失敗回 null，呼叫端退回短 detail。
 */
export async function expandPhotoPrompt(ctx, model = 'claude-sonnet-5') {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const out = await runClaudeOnce(buildWriterPrompt(ctx, attempt === 2), model, 180_000);
      const detail = sanitizeDetail(out);
      if (detailOk(detail)) return detail;
    } catch {
      /* 交給下一輪重試 */
    }
  }
  console.warn('     ⚠️ 擬真照 prompt 展開失敗（兩次），退回短 detail');
  return null;
}
