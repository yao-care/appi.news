// 取得文章配圖（整合：圖庫優先 / AI 生成）。
//
// 規則（見 .claude/skills/newsroom/SKILL.md 與記憶 newsroom-image-stock-first-taiwanese-people）：
//   - 概念/物件/場景圖（無人物）：先搜圖庫（Unsplash/Pexels），每張候選過 Haiku 審查
//     （相關度＋外國臉孔淘汰＋歐美場景，2026-07 站長裁示）；全淘汰/無金鑰/下載失敗
//     → 退回 AI 生成（超寫實新聞攝影單一場景＋多樣性輪轉，不再是插畫拼貼）。
//   - 人物圖（--people）：直接 AI 生成，由模組強制「台灣人」鐵律（圖庫難保證台灣人臉孔）。
//   - 圖說紀律：圖庫照與生成照的圖說一律尾註「（示意圖）」；embed 可授權真實照寫 credit 不加。
//
// 用法:
//   node scripts/get-image.mjs --topic "段落主題" --context "文章脈絡" \
//        --out public/images/<slug>-s<N>.webp [--width 960] [--query "english stock query"] [--people] [--dry-run]
//   跳過圖庫、一律 OpenAI 生圖（健康紀念日線用；--query 在此模式下無作用）:
//   node scripts/get-image.mjs --topic "..." --out public/covers/x-cover.webp --generate
//   國際線「嵌入可授權原圖」（只接受白名單來源，否則 fail-closed 退非零）:
//   node scripts/get-image.mjs --topic "..." --out public/images/x.webp \
//        --embed-url "https://upload.wikimedia.org/...jpg" --credit "作者 — CC BY-SA 4.0, Wikimedia Commons" --page-url "https://commons.wikimedia.org/..."
// 輸出: 一行 JSON：{ mode:"stock"|"generated"|"embedded", reason, file, src, width, height, tag, credit?, source?, pageUrl?, license? }
//   mode=stock 時附 credit/source/pageUrl（封面請寫進 coverImageCredit；圖庫授權允許免署名，內文可省）。
//   mode=embedded 時 credit 為必填（嵌入原圖一律署名），license/source 記錄授權與來源。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generatePhotoRealImage, generatePersonImage, imgTag, toWebp, checkStockPhotoBuffer } from './lib/ai-image.mjs';
import { searchStock } from './lib/stock.mjs';
import { classifyImageSource } from './lib/image-sources.mjs';
import { COVER_MIN_WIDTH, coverSpecProblem } from './lib/cover-spec.mjs';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(`--${name}`);

const topic = arg('topic');
const context = arg('context', '');
let out = arg('out');
// 封面（covers/）需橫式且 ≥1200px（Discover/Top Stories 大圖門檻，規格 SOT＝lib/cover-spec.mjs；
// stock 候選不符自動淘汰換下一張、embed 不符 fail-closed 退非零、生成不符即炸）；
// 內文圖（images/）維持 960（單篇多圖、且無 postbuild 縮圖，控文章頁重量）。
// --width 明確帶入時以其為準，但封面帶 <1200 會直接報錯（防照抄內文圖參數）。
const isCover = /(^|\/)covers\//.test(String(out ?? ''));
const width = Number(arg('width', isCover ? '1200' : '960'));
const query = arg('query', topic);
const wantPeople = has('people');
// --generate：跳過圖庫，直接走 codex 原生生圖（唯一生圖路徑）。給「圖庫命中率低或要求全站生成風格統一」
// 的產線用（健康紀念日線，站長 2026-07-28 指定）。預設仍是圖庫優先，不影響其餘產線。
const forceGenerate = has('generate');
const dryRun = has('dry-run');
const embedUrl = arg('embed-url');
const credit = arg('credit');
// 人物 photoreal 展開用脈絡（皆可省，缺就退回 topic/context）：
//   --caption 這張圖要傳達的訊息（最重要）／--alt 中文畫面描述／--article-context 文章主題
const caption = arg('caption', '');
const altText = arg('alt', '');
const articleContext = arg('article-context', '');
const pageUrl = arg('page-url');

if (!topic || !out) {
  console.error('need --topic and --out');
  process.exit(1);
}
if (!Number.isFinite(width)) {
  console.error('--width must be a number');
  process.exit(1);
}
// 封面 --width 防呆：帶了小於門檻的寬（例如照抄內文圖的 --width 960）等於保證產出直接被
// 封面規格 gate 擋下，這裡提前硬失敗、講清楚怎麼改，省一輪下載＋審查。
if (isCover && width < COVER_MIN_WIDTH) {
  console.error(
    `封面（covers/）--width ${width} 低於 Discover 大圖門檻 ${COVER_MIN_WIDTH}px。請拿掉 --width（封面預設 ${COVER_MIN_WIDTH}）或帶 ≥${COVER_MIN_WIDTH} 的值。`,
  );
  process.exit(1);
}

/** 封面規格驗收（橫式 ≥1200；規格 SOT＝lib/cover-spec.mjs）。內文圖不套用。回 null＝過。 */
function coverProblem(w, h) {
  return isCover ? coverSpecProblem(w, h) : null;
}
// 一律輸出 webp（圖庫圖也轉 webp，確保 CLS 安全的尺寸與檔案大小）
out = out.replace(/\.(jpe?g|png|webp)$/i, '') + '.webp';
const src = '/' + out.replace(/^public\//, '');

/** 全站禁用 AI 生圖的開關：`NO_AI_IMAGE=1` 時，任何走到 OpenAI 生圖的路徑一律硬失敗。
 *  用途：站長要求某批文章「只能用既有圖或圖庫，不准生圖」時，把它設在環境變數即可，
 *  不必逐條改 prompt（prompt 是軟約束，模型可能忽略；這裡是機械保證）。
 *  刻意 throw 而非靜默改用圖庫——讓呼叫端看到失敗、換 query 再試，而不是拿到一張沒人要的生成圖。 */
function noAiGuard(where) {
  if (process.env.NO_AI_IMAGE === '1') {
    throw new Error(
      `NO_AI_IMAGE=1：本批禁用 AI 生圖（${where}）。請改用既有圖片或換一組英文 --query 再搜圖庫。`,
    );
  }
}

/** AI 生成（超寫實攝影產線：sonnet 展開＋多樣性輪轉＋haiku 自檢；台灣人鐵律由模組強制）
 *  2026-07 起概念/封面生成不再走插畫拼貼，一律新聞攝影感單一場景。 */
async function generate(reason) {
  noAiGuard(`generate(${reason})`);
  if (dryRun) return { mode: 'generated', reason, file: out, src, dry: true };
  const r = await generatePhotoRealImage({
    topic, context, caption, alt: altText, articleContext, width, seed: out,
  });
  // 封面規格驗收：生成走 worker 的 landscape（1536×1024）理論上必過，但 worker 是獨立部署，
  // 契約變了這裡要炸出來，不能靜默寫出一張拿不到 Discover 版位的封面。
  const genProblem = coverProblem(r.width, r.height);
  if (genProblem) throw new Error(`生成封面規格不符（worker 契約異常？）：${genProblem}`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, r.buffer);
  return {
    mode: 'generated', reason, file: out, src, width: r.width, height: r.height,
    tag: imgTag({ src, width: r.width, height: r.height, alt: altText || '' }),
    expanded: r.expanded, checked: r.checked, regenerated: r.regenerated,
    ...(r.checkReason ? { checkReason: r.checkReason } : {}),
  };
}

/** 下載一張圖庫候選 → Haiku 審查（相關度＋外國臉孔，2026-07 站長裁示）→ webp → 寫檔。
 *  審查不合格回 null 換下一張候選；claude-appi 不可用時 fail-open 放行（維持舊行為）。 */
async function tryStock(cand) {
  if (dryRun) return { mode: 'stock', file: out, src, credit: cand.credit, source: cand.source, pageUrl: cand.pageUrl, description: cand.description, dry: true };
  let raw;
  try {
    const res = await fetch(cand.downloadUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    raw = Buffer.from(await res.arrayBuffer());
    if (raw.length < 5000) return null; // 過小 = 多半不是真圖
  } catch {
    return null;
  }
  const verdict = await checkStockPhotoBuffer(raw, topic, context);
  if (!verdict.ok) {
    console.error(`  圖庫候選淘汰（${cand.source ?? 'stock'}）：${verdict.reason ?? '未過審查'}`);
    return null;
  }
  let webp;
  try {
    webp = await toWebp(raw, width);
  } catch {
    return null;
  }
  // 封面規格：toWebp 的 withoutEnlargement 會把不足寬的來源「原樣收下」（940 進來就 940 出去，
  // 靜默通過），所以一定要在寫檔前驗成品尺寸；不符就淘汰這張換下一張候選。
  const specProblem = coverProblem(webp.width, webp.height);
  if (specProblem) {
    console.error(`  圖庫候選淘汰（${cand.source ?? 'stock'}）：${specProblem}`);
    return null;
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, webp.buffer);
  return {
    mode: 'stock',
    file: out,
    src,
    width: webp.width,
    height: webp.height,
    tag: imgTag({ src, width: webp.width, height: webp.height, alt: '' }),
    credit: cand.credit,
    source: cand.source,
    pageUrl: cand.pageUrl,
    description: cand.description,
  };
}

/**
 * 嵌入可授權原圖：只接受白名單來源（image-sources.mjs），否則 fail-closed 退非零，
 * 讓起草端據此退回圖庫/AI。署名為必填（嵌入原圖一律署名）。
 */
async function embed() {
  const cls = classifyImageSource(embedUrl);
  if (!cls.allowed) {
    console.error(`embed 來源未授權，拒絕嵌入：${cls.reason}`);
    process.exit(2); // 非 1：與一般錯誤區分，代表「這個來源不可用（白名單拒絕/規格不符）、請換來源或改用圖庫/AI」
  }
  if (!credit || !credit.trim()) {
    console.error(`embed 需 --credit（嵌入原圖一律署名）。此來源署名格式：${cls.source.creditHint}`);
    process.exit(1);
  }
  if (dryRun) {
    return { mode: 'embedded', file: out, src, credit: credit.trim(), license: cls.source.license, source: cls.source.id, pageUrl: pageUrl || embedUrl, dry: true };
  }
  let raw;
  try {
    const res = await fetch(embedUrl, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.error(`embed 下載失敗 HTTP ${res.status}`);
      process.exit(1);
    }
    raw = Buffer.from(await res.arrayBuffer());
    if (raw.length < 5000) {
      console.error('embed 下載檔過小，疑似非圖片');
      process.exit(1);
    }
  } catch (e) {
    console.error(`embed 下載錯誤：${e.message}`);
    process.exit(1);
  }
  const webp = await toWebp(raw, width);
  // 封面規格：embed 是唯一由模型自選原圖的路徑，直式的 Wikimedia／政府公開照從這裡
  // 一路漏了六週（2026-08 國際線直式封面全是它）。不符就 fail-closed 退非零，
  // 讓起草端換一張橫式原圖或改走圖庫（與白名單拒絕同一種「換來源」語意）。
  const embedSpecProblem = coverProblem(webp.width, webp.height);
  if (embedSpecProblem) {
    console.error(
      `embed 封面規格不符，拒絕嵌入：${embedSpecProblem}。請換一張橫式、原圖寬 ≥${COVER_MIN_WIDTH}px 的可授權圖，或改用圖庫（拿掉 --embed-url）。`,
    );
    process.exit(2);
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, webp.buffer);
  return {
    mode: 'embedded',
    file: out,
    src,
    width: webp.width,
    height: webp.height,
    tag: imgTag({ src, width: webp.width, height: webp.height, alt: '' }),
    credit: credit.trim(),
    license: cls.source.license,
    source: cls.source.id,
    pageUrl: pageUrl || embedUrl,
  };
}

/** 人物 photoreal 生圖（--people）：sonnet 展開 prompt → 生圖 medium → haiku 驗圖 → 不合格重生一次。 */
async function generatePerson() {
  noAiGuard('generatePerson');
  if (dryRun) return { mode: 'generated', reason: 'people', people: true, file: out, src, dry: true };
  const r = await generatePersonImage({
    topic, context, caption, alt: altText, articleContext, width,
  });
  // 封面規格驗收：理由同 generate()（worker 契約異常要炸出來，不能靜默收）。
  const personProblem = coverProblem(r.width, r.height);
  if (personProblem) throw new Error(`人物生成封面規格不符（worker 契約異常？）：${personProblem}`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, r.buffer);
  return {
    mode: 'generated',
    reason: 'people',
    people: true,
    file: out,
    src,
    width: r.width,
    height: r.height,
    tag: imgTag({ src, width: r.width, height: r.height, alt: altText || '' }),
    expanded: r.expanded,      // sonnet 展開是否成功（false=退回短 detail）
    checked: r.checked,        // 是否過視覺自檢
    regenerated: r.regenerated, // 是否因不合格重生一次
    ...(r.checkReason ? { checkReason: r.checkReason } : {}),
  };
}

async function main() {
  // 嵌入可授權原圖（國際線）：白名單把關，非白名單退非零→起草端改圖庫/AI。
  if (embedUrl) {
    return embed();
  }
  // 人物圖：photoreal 生成（保證台灣人＋展開＋自檢重生）。
  if (wantPeople) {
    return generatePerson();
  }
  // 明確要求生圖（--generate）：不碰圖庫，直接 OpenAI 生成。
  if (forceGenerate) {
    return generate('forced');
  }
  // 概念圖：先圖庫。無金鑰 / 搜尋失敗 / 無候選 / 下載失敗 → 退回生成。
  let candidates = [];
  try {
    const { unsplash, pexels } = await searchStock(query, 8);
    // 交錯兩家來源，提高命中相關圖的機會
    const max = Math.max(unsplash.length, pexels.length);
    for (let i = 0; i < max; i++) {
      if (unsplash[i]?.downloadUrl) candidates.push(unsplash[i]);
      if (pexels[i]?.downloadUrl) candidates.push(pexels[i]);
    }
  } catch {
    return generate('no-stock-keys');
  }
  if (!candidates.length) return generate('no-stock-result');
  // 依序試前幾張，第一張成功就用。封面多試幾張：規格驗收（橫式 ≥1200）會再淘汰一輪，
  // 只試 4 張容易全滅、白白退回生成（NO_AI_IMAGE 批次則整個失敗）。
  for (const cand of candidates.slice(0, isCover ? 8 : 4)) {
    const r = await tryStock(cand);
    if (r) return r;
  }
  return generate('stock-fetch-failed');
}

main()
  .then((r) => console.log(JSON.stringify(r)))
  .catch((e) => {
    console.error(`get-image 失敗：${e.message}`);
    process.exit(1);
  });
