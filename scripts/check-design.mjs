// 設計規範守門 v2（團隊共用；v1 源自 dreamer868，v2 加 css 白名單＋掃 .svelte）：
// 掃 src/ 下所有 .css/.astro/.svelte，違規即 exit 1（pnpm build 前自動跑）。
// 規則（見 src/styles/variables.css 檔頭）：
// 1. font-size 禁用 px（一律 var(--text-*) 階梯）
// 2. 顏色（hex / rgb() / hsl()）只准出現在 src/styles/variables.css
// 3. 禁 !important
// 4. 禁外部 CDN（fonts.googleapis / cdnjs / unpkg / jsdelivr）
// 5. 統一 css 檔案：src/ 下的 .css 只准 src/styles/ 白名單那幾檔，新增即 fail
//    （元件樣式寫 Astro/Svelte scoped <style> 或進 global.css）
//
// ── appi.news 遷移期凍結（2026-07-20 接軌 v2 時的存量豁免；禁再擴充） ──
// （/choice 風格實驗室已於 2026-07-20 整區刪除，原 a) 整檔跳掃豁免同步移除。）
// b) LEGACY_COLOR_FILES：原存量 17 檔「token 外硬編顏色」，2026-07-20 已逐檔把
//    fallback 色與 rgba 疊層收斂進 variables.css（含補定義 --color-surface-alt/
//    --color-accent/--color-text-muted/--color-border/--color-ink-2 等 token），清單
//    只准變短、新檔一律不得加入。現僅剩 2 檔為「技術性不可轉」而保留：
//    - HeroNetwork.astro：canvas JS 以 rgb(${r},${g},${b}) 動態組色字串（色源本就讀
//      自 --appi-brand/--appi-accent，非硬編視覺）。
//    - SEOHead.astro：<meta name="theme-color"> 需字面 hex，CSS var 在 meta 屬性無效。
//    僅豁免「顏色」一條，px 字級/!important/CDN 照掃。
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";

const ROOT = "src";
const TOKEN_FILE = join("src", "styles", "variables.css");
// 舊站遷移期可暫加既有檔（凍結用，禁再擴充）；新站一律只有這兩檔。
const STYLE_WHITELIST = new Set(["variables.css", "global.css"]);
// 整檔跳過：已清空（/choice 刪除後無豁免對象）；禁新增
const SKIP_FILES = new Set([]);
const SKIP_DIRS = new Set([]);
// 僅豁免「顏色」規則（遷移期凍結，禁再擴充；理由見檔頭 b)）
const LEGACY_COLOR_FILES = new Set([
  join("src", "components", "blocks", "HeroNetwork.astro"), // canvas JS 動態 rgb() 色字串
  join("src", "components", "seo", "SEOHead.astro"), // <meta theme-color> 需字面 hex
]);
const exts = new Set([".css", ".astro", ".svelte"]);
const violations = [];

function walk(dir) {
  if (SKIP_DIRS.has(relative(".", dir))) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(p))) scan(p);
  }
}

function scan(file) {
  const rel = relative(".", file);
  if (SKIP_FILES.has(rel)) return;
  if (extname(file) === ".css") {
    const inStyles = rel.startsWith(join("src", "styles") + "/");
    if (!inStyles || !STYLE_WHITELIST.has(basename(file)))
      violations.push(
        `${rel} css 檔不在白名單（統一 css：src/styles/{${[...STYLE_WHITELIST].join(",")}}；元件樣式用 scoped <style>）`
      );
  }
  const isTokenFile = rel === TOKEN_FILE;
  const colorExempt = isTokenFile || LEGACY_COLOR_FILES.has(rel);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const loc = `${rel}:${i + 1}`;
    if (/font-size\s*:\s*[0-9.]+px/i.test(line))
      violations.push(`${loc} px 字級（改用 var(--text-*)）: ${line.trim()}`);
    if (!colorExempt && /(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/.test(line) && !/url\(/.test(line))
      violations.push(`${loc} token 外硬編顏色（改用 var(--color-*)）: ${line.trim()}`);
    if (/!important/.test(line))
      violations.push(`${loc} 禁用 !important: ${line.trim()}`);
    if (/(fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare|unpkg\.com|cdn\.jsdelivr)/.test(line))
      violations.push(`${loc} 外部 CDN（字型/資源一律自託管或系統堆疊）: ${line.trim()}`);
  });
}

walk(ROOT);
if (violations.length) {
  console.error(`設計規範違規 ${violations.length} 處：\n` + violations.join("\n"));
  process.exit(1);
}
console.log("設計規範檢查通過：css 白名單、無 px 字級、無 token 外顏色、無 !important、無外部 CDN（凍結豁免見檔頭）。");
