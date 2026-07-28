#!/usr/bin/env node
// 把 Astro 產出的轉址空殼頁的 `noindex` 拿掉，只留 meta-refresh + rel=canonical。
//
// 為什麼＝docs/lessons/duplicate-topic-gate.md §轉址殘骸
//   GitHub Pages 是純靜態、發不了真 301，所以 astro.config.mjs 的 `redirects` 會為
//   src/redirects.json 的每筆舊網址產一頁 meta-refresh 轉址頁。Astro 內建的轉址模板
//   同時寫死 `<meta name="robots" content="noindex">` 與 `<link rel=canonical>`。
//
//   這兩個訊號是互相矛盾的：canonical 說「這頁等同目標頁，請把權重併過去」，
//   noindex 說「這頁整個不要進索引」。Google 對這種組合的處理不保證是我們要的方向，
//   實測結果也確實不是——2026-07-28 拉 GSC 90 天發現 131 個轉址殘骸仍持有
//   2,208 曝光（全站 15%）、40 點擊，部分還排在 pos 5-8，比正本還前面。
//   也就是說權重三個月都沒併過去，反而是空殼頁在吃曝光。
//
//   拿掉 noindex 後就是靜態站標準的「meta-refresh + canonical」轉址寫法：
//   Google 會跟隨轉址並把訊號併到目標頁，而不是把來源頁當成「不准索引」而斷開處理。
//
// 安全性：只改「確實是 Astro 轉址空殼」的檔——必須同時含 meta-refresh 與
//   Astro 模板固定的 "Redirecting from" 字樣。全站另有 1,581 個**該保留** noindex 的頁
//   （薄標籤頁、/admin、/search、排程草稿預覽），本腳本一律不碰。

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const NOINDEX = /<meta name="robots" content="noindex">/;
const IS_STUB = /<meta http-equiv="refresh"/;
const IS_ASTRO_STUB = /Redirecting from/;

const files = globSync('dist/**/index.html');
let fixed = 0;
let skippedNoNoindex = 0;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  if (!IS_STUB.test(html) || !IS_ASTRO_STUB.test(html)) continue; // 不是轉址空殼，跳過
  if (!NOINDEX.test(html)) {
    skippedNoNoindex++;
    continue;
  }
  writeFileSync(f, html.replace(NOINDEX, ''));
  fixed++;
}

console.log(
  `轉址頁修正：掃 ${files.length} 頁，改掉 ${fixed} 個轉址空殼的 noindex` +
    (skippedNoNoindex ? `（另 ${skippedNoNoindex} 個已無 noindex）` : '') +
    '；其餘 noindex 頁（薄標籤/admin/搜尋/排程草稿）未動。',
);

if (fixed === 0 && skippedNoNoindex === 0) {
  console.warn('⚠️  一個轉址空殼都沒找到——Astro 轉址模板可能改版了，請檢查本腳本的比對字樣。');
}
