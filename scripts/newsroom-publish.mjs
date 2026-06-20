// 待審草稿「核可上線」：把事實稿的待審草稿（status: scheduled + 遠未來日）轉正成立即發佈。
//
// 由 slack-actions-server 的「發佈」鈕觸發（也可手動跑）。動作：
//   讀 src/content/articles/<slug>.md → 改 frontmatter status: published、publishDate: 現在
//   → commit → push（上線，下次 build / 6h cron 生效）。
//
// 安全：不帶 --go 為 dry-run（只印改後 frontmatter、零副作用）。frontmatter 改寫為精準逐行
// 取代（只動 status / publishDate / updatedDate 三行，其餘原樣保留），不重排 YAML、不動內文。
//
// 用法：
//   node scripts/newsroom-publish.mjs <slug>          # dry-run
//   node scripts/newsroom-publish.mjs <slug> --go      # 真的轉正並 push

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ARTICLES_DIR = 'src/content/articles';

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    throw new Error(`指令失敗（exit ${r.status}）：${cmd} ${args.join(' ')}\n${r.stderr || r.stdout || ''}`);
  }
  return (r.stdout || '').trim();
}

/**
 * 把文章原文（含 frontmatter）轉正：status→published、publishDate→nowIso、補/更新 updatedDate。
 * 純函式、可單元測試。回傳 { text, changed, before } 或丟錯（無 frontmatter）。
 * @param {string} raw   原始 .md 全文
 * @param {string} nowIso 現在時間 ISO 字串
 */
export function promoteFrontmatter(raw, nowIso) {
  const m = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)([\s\S]*)$/);
  if (!m) throw new Error('找不到 frontmatter');
  const [, open, fm, close, body] = m;
  const before = {};

  const setLine = (block, key, value) => {
    const re = new RegExp(`^(${key}\\s*:).*$`, 'm');
    if (re.test(block)) {
      block = block.replace(re, (_l, k) => {
        before[key] = _l.slice(k.length).trim();
        return `${k} ${value}`;
      });
    } else {
      block += `\n${key}: ${value}`;
    }
    return block;
  };

  let next = fm;
  next = setLine(next, 'status', '"published"');
  next = setLine(next, 'publishDate', `"${nowIso}"`);
  next = setLine(next, 'updatedDate', `"${nowIso}"`);

  const text = open + next + close + body;
  return { text, changed: text !== raw, before };
}

function main() {
  const args = process.argv.slice(2);
  const go = args.includes('--go');
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) die('用法：node scripts/newsroom-publish.mjs <slug> [--go]');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) die(`slug 格式不合法：${JSON.stringify(slug)}`);

  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (!existsSync(file)) die(`找不到文章：${file}`);

  const raw = readFileSync(file, 'utf8');
  const nowIso = new Date().toISOString();
  let promoted;
  try {
    promoted = promoteFrontmatter(raw, nowIso);
  } catch (e) {
    die(`轉正失敗：${e.message}`);
  }

  if (!go) {
    console.log('— DRY RUN（不帶 --go，零副作用）—');
    console.log(`將把 ${slug} 轉正：status→published、publishDate→${nowIso}`);
    console.log(`原值：status=${promoted.before.status ?? '(無)'}、publishDate=${promoted.before.publishDate ?? '(無)'}`);
    return;
  }

  // 安全前置：工作區乾淨（避免把無關改動掃進 commit）。隔離模式由呼叫端先 reset 到 origin/main。
  if (sh('git', ['status', '--porcelain'])) {
    die('工作區不乾淨，請先清乾淨再跑');
  }
  writeFileSync(file, promoted.text);
  sh('git', ['add', '--', file]);
  sh('git', ['commit', '-m', `feat(article): 核可上線 — ${slug}\n\n事實稿待審草稿經人工核可，轉正立即發佈。`]);
  console.log('→ push');
  sh('git', ['push']);
  const url = `https://appi.news/articles/${slug}/`;
  console.log('✓ 已核可上線。');
  console.log(`PUBLISHED_URL=${url}`);
}

// 只有「直接執行」才跑；被 import（測試）時不執行、零副作用。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
