// 「模型漏報結果行，但稿其實已經寫好了」的救援：直接看 git 工作區有哪些文章檔變動。
//
// 為什麼需要：五條撰寫產線（international / focus-esg / lifestyle-civic / -video / -police）
// 都用「模型最後印一行 XXX_RESULT=…」當回傳協定，協調器再依那一行決定要不要發佈。模型偶爾
// 漏印或印歪（parser 標 infra: true），舊碼一律當成「編輯判斷跳過」——於是那篇已經花了
// 6~9 分鐘 WebFetch、交叉查證、配圖寫好的稿，會隨 cron worktree 的 trap 一起被刪掉，
// 一個字都沒留下。2026-07-27 國際線整晚 0 篇就是這樣來的（lesson §G）。
//
// 對策：infra 失敗時比對 `git status --porcelain`，如果剛好多出一個文章檔，就把它撿回來，
// 照樣走各線既有的缺圖／去 AI 腔／check:links 關卡。撿不回來（0 個或多個無法歸屬）就照舊跳過。

import { spawnSync } from 'node:child_process';
import { basename } from 'node:path';

/**
 * 解析 `git status --porcelain` 輸出 → [{slug, action}]（未追蹤＝new、已追蹤有改＝update）。
 * 純函式，好測；只認 .md。
 */
export function parsePorcelain(out) {
  const list = [];
  for (const line of String(out || '').split('\n')) {
    const m = line.trim().match(/^(\?\?|[AMR]+)\s+(.+)$/);
    if (!m) continue;
    const path = m[2].replace(/^"(.*)"$/, '$1');
    if (!path.endsWith('.md')) continue;
    list.push({ slug: basename(path, '.md'), action: m[1] === '??' ? 'new' : 'update' });
  }
  return list;
}

/** 目前工作區有變動的文章檔。git 失敗回空陣列（救援是加分項，不該讓它自己炸掉主流程）。 */
export function changedArticles(dir) {
  const r = spawnSync('git', ['status', '--porcelain', '--', dir], { encoding: 'utf8' });
  return r.status === 0 ? parsePorcelain(r.stdout) : [];
}

/**
 * 撿回「模型漏報但已寫好」的那一篇。
 * @param {string} dir     文章目錄
 * @param {Iterable<string>} known 這輪已經歸屬掉的 slug（避免把別則的成果誤認成這則的）
 * @returns {{slug, action}|null} 剛好一個未歸屬的變動檔才撿，其餘一律不猜
 */
export function salvageArticle(dir, known = []) {
  const seen = new Set(known);
  const found = changedArticles(dir).filter((c) => !seen.has(c.slug));
  return found.length === 1 ? found[0] : null;
}
