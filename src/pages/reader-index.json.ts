import type { APIContext } from 'astro';
import {
  getPublishedArticles,
  articleSlug,
  articlePath,
  coverImageFor,
  readingTime,
  type Article,
} from '@/utils/content';
import { absoluteUrl } from '@/utils/url';

/**
 * appinews-reader 候選池索引（build 期產出的靜態 JSON）。
 *
 * 契約正本：/root/my-line-bot-customer/reader/contracts/reader-index.schema.json（reader 2026-08-13 併入該 repo）
 * 生產者＝本檔；消費者＝appinews-reader 的 feed/sync.js。
 * **這是兩個服務之間的唯一契約，任一方要改欄位都得先改那份 schema**——
 * 單方面改這裡會靜默壞掉（reader 拿不到欄位只會降級，不會報錯）。
 *
 * 為什麼是 Astro endpoint 而不是 postbuild 腳本：postbuild 拿不到 content
 * collections，得自己重解 frontmatter 並重寫一份 isPublic() 判斷。astro.config.mjs
 * 已經因為 sitemap filter 維護了第二份同邏輯的判斷（該檔註解寫「改門檻兩邊要同步」），
 * 再開第三份不划算。走 endpoint 就直接吃 getPublishedArticles()，只有一份真實來源。
 *
 * 不會污染 sitemap（@astrojs/sitemap 只收 HTML route），也不會被 check:links 掃到。
 */

/** 每個分類納入候選池的最新篇數上限（契約 articles 欄位說明）。 */
const PER_CATEGORY = 40;

/**
 * 台北時區的日期字串（YYYY-MM-DD）。
 * build 跑在 GitHub Actions（UTC），不能用 getDate() 這類本地時間方法判「當日」，
 * 否則台北時間傍晚發佈的精選在 UTC 還算前一天，featured 會整批漏掉。
 */
const TAIPEI_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
function taipeiDay(d: Date): string {
  return TAIPEI_DAY.format(d);
}

interface ReaderIndexArticle {
  slug: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  publish_date: string;
  cover_image?: string;
  reading_time?: number;
}

function toEntry(a: Article, site: URL | undefined): ReaderIndexArticle {
  const slug = articleSlug(a);
  const entry: ReaderIndexArticle = {
    slug,
    url: absoluteUrl(articlePath(a), site),
    title: a.data.title,
    category: a.data.category,
    publish_date: a.data.publishDate.toISOString(),
  };
  if (a.data.description) entry.description = a.data.description;
  if (a.data.subcategory) entry.subcategory = a.data.subcategory;

  // coverImageFor() 回傳的已經是 base-aware 路徑，或圖床的外部絕對網址。
  // 不可再套 absoluteUrl()——那會第二次疊上 base（base 非 '/' 時就錯）。
  const cover = coverImageFor(a);
  if (cover) {
    entry.cover_image = /^https?:\/\//i.test(cover)
      ? cover
      : site
        ? new URL(cover, site).toString()
        : cover;
  }

  const minutes = readingTime(a);
  if (Number.isFinite(minutes) && minutes > 0) entry.reading_time = Math.round(minutes);

  return entry;
}

export async function GET(context: APIContext) {
  const site = context.site;
  const articles = await getPublishedArticles(); // 已依 publishDate 新到舊排序
  const today = taipeiDay(new Date());

  // 當日精選：featured 且 publishDate 落在台北時區的今天。
  // 沒有就給空陣列——reader 會退回一般排序，不會壞。
  const featured = articles.filter(
    (a) => a.data.featured && taipeiDay(a.data.publishDate) === today,
  );

  // 候選池＝「各分類最新 PER_CATEGORY 篇」的聯集。
  // 刻意不取全站最新 N 篇：日產出量在分類間極不平均，單純取最新會讓冷門分類
  // 整個消失（實測 RSS 前 30 篇裡 focus 掛零，而 focus 正是首則版位要用的）。
  const takenPerCategory = new Map<string, number>();
  const picked = new Set<string>();
  const pool: Article[] = [];
  for (const a of articles) {
    const used = takenPerCategory.get(a.data.category) ?? 0;
    if (used >= PER_CATEGORY) continue;
    takenPerCategory.set(a.data.category, used + 1);
    picked.add(articleSlug(a));
    pool.push(a);
  }

  // 契約保證：featured 的每個 slug 都必須在 articles 裡查得到。
  // 當日精選照理都在自己分類的最新 40 篇內，這裡只是把保證做成機械的。
  for (const a of featured) {
    if (picked.has(articleSlug(a))) continue;
    picked.add(articleSlug(a));
    pool.push(a);
  }

  pool.sort((x, y) => y.data.publishDate.getTime() - x.data.publishDate.getTime());

  // 契約的 site 範例是無尾斜線的 https://appi.news，且 reader 會拿它去拼字串，
  // 帶斜線會拼出雙斜線。base 非 '/' 時（退回 github.io 專案頁）同樣只去掉尾斜線，
  // 保留 base 路徑本身。
  const siteRoot = absoluteUrl('/', site).replace(/\/+$/, '');

  const body = JSON.stringify({
    version: 1,
    generated_at: new Date().toISOString(),
    site: siteRoot,
    featured: featured.map(articleSlug),
    articles: pool.map((a) => toEntry(a, site)),
  });

  return new Response(body, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
