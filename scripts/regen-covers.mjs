// 一次性：把 31 篇用 SVG 陽春占位封面（無 coverImage）的文章，用 OpenAI gpt-image-2 重生封面。
// 風格：簡約編輯插畫；套台灣人鐵律 + 無文字。壓成 WebP 存 public/covers/，並寫回 frontmatter。
// 可重複執行（只挑沒有 coverImage 的，已處理的會跳過）。
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const KEY = readFileSync(join(homedir(), '.config/appi-news/ai-worker.secrets'), 'utf8').match(/^OPENAI_API_KEY=(.+)$/m)[1].trim();
const DIR = 'src/content/articles';
const PEOPLE = 'If any people appear, they must be Taiwanese (East Asian, Han Taiwanese appearance).';
const CONCURRENCY = 3;
const QUALITY = 'medium';

function fmBlock(text) { const m = text.match(/^---\n([\s\S]*?)\n---/); return m ? m[1] : ''; }
function field(fm, key) { const m = fm.match(new RegExp('^' + key + ': *"?(.*?)"?$', 'm')); return m ? m[1] : ''; }

const targets = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !/^coverImage:/m.test(readFileSync(join(DIR, f), 'utf8')));
console.log(`待處理：${targets.length} 篇`);

async function genOne(file) {
  const path = join(DIR, file);
  const text = readFileSync(path, 'utf8');
  const fm = fmBlock(text);
  const title = field(fm, 'title');
  const desc = field(fm, 'description').slice(0, 180);
  const prompt = `Minimalist editorial illustration for a news article cover. Topic: ${title}. ${desc}. Style: refined and sophisticated, calm muted tones, soft natural lighting, a subtle navy-and-warm-neutral palette, professional magazine aesthetic, plenty of negative space. No text, no words, no letters, no logos, no captions. ${PEOPLE}`;
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1536x1024', quality: QUALITY, n: 1 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const b64 = (await res.json()).data?.[0]?.b64_json;
  if (!b64) throw new Error('未回傳圖片');
  const webp = await sharp(Buffer.from(b64, 'base64')).resize({ width: 1280 }).webp({ quality: 82 }).toBuffer();
  const name = file.replace(/\.md$/, '') + '.webp';
  writeFileSync(join('public/covers', name), webp);
  const insert = `coverImage: "covers/${name}"\ncoverAlt: "${title.replace(/"/g, '')}"\n`;
  writeFileSync(path, text.replace(/^(---\n[\s\S]*?\n)(---)/, (_m, a, b) => a + insert + b));
  return name;
}

const queue = [...targets];
let done = 0;
const failed = [];
async function runner() {
  while (queue.length) {
    const f = queue.shift();
    try { const n = await genOne(f); done++; console.log(`✓ ${done}/${targets.length}  ${f} → ${n}`); }
    catch (e) { failed.push(`${f} (${e.message})`); console.log(`✗ ${f}: ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, runner));
console.log(`\n完成 ${done} 篇；失敗 ${failed.length}${failed.length ? '：\n' + failed.join('\n') : ''}`);
