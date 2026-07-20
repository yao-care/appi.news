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
// b) LEGACY_COLOR_FILES：存量「token 外硬編顏色」65 處（多為 var(--x, #hex)
//    fallback、rgba 疊層、canvas JS 色字串、theme-color meta），超過機械修門檻
//    且部分 fallback 指向未定義 token（--color-surface-alt/--color-accent/
//    --color-text-muted/--color-border），移除會變視覺——僅豁免「顏色」一條，
//    px 字級/!important/CDN 照掃。TODO：逐檔把 fallback 色收斂進 variables.css
//    後自本清單移除；新檔案一律不得加入。
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
  join("src", "components", "blocks", "CTAJoinAuthor.astro"),
  join("src", "components", "blocks", "HeroNetwork.astro"),
  join("src", "components", "blocks", "SiteFooter.astro"),
  join("src", "components", "blocks", "SiteHeader.astro"),
  join("src", "components", "blocks", "TopicCard.astro"),
  join("src", "components", "editor", "AuthorSelect.svelte"),
  join("src", "components", "editor", "BodyEditor.svelte"),
  join("src", "components", "editor", "CoverField.svelte"),
  join("src", "components", "editor", "EditorPanel.svelte"),
  join("src", "components", "editor", "ImagePicker.svelte"),
  join("src", "components", "editor", "SeoFields.svelte"),
  join("src", "components", "seo", "SEOHead.astro"),
  join("src", "pages", "[category]", "index.astro"),
  join("src", "pages", "articles", "[slug].astro"),
  join("src", "pages", "join.astro"),
  join("src", "pages", "sports", "submit.astro"),
  join("src", "pages", "submit.astro"),
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
