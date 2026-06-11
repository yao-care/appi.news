import { getCollection, type CollectionEntry } from 'astro:content';
import { asset } from './url';

export { extractFaq, type FaqItem } from './faq';

export type Article = CollectionEntry<'articles'>;
export type Author = CollectionEntry<'authors'>;
export type Column = CollectionEntry<'columns'>;
export type Topic = CollectionEntry<'topics'>;

const SUPPLEMENT_AD_COMPLIANCE_COVER = 'articles/supplement-ad-compliance-ai-review.svg';
const DEMENTIA_FRIENDLY_COMMUNITY_ACTIVITIES_COVER =
  'articles/dementia-friendly-community-activities-realistic.svg';

function isSupplementAdComplianceArticle(a: Article): boolean {
  return articleSlug(a).startsWith('保健食品廣告合規完整指南');
}

function isDementiaFriendlyCommunityActivitiesArticle(a: Article): boolean {
  return articleSlug(a).startsWith('5-個失智友善社區的活動設計原則');
}

/* ----------------------------- articles ----------------------------- */

/**
 * 是否為可公開顯示的文章。
 * 排程發佈：publishDate 晚於「build 當下時間」者一律隱藏，
 * 因此 future 排程文章會在「其日期之後的某次 build」自動上線
 * （搭配 GitHub Actions 每日 cron 重建）。
 * draft / archived 永遠隱藏。
 */
function isPublic(a: Article): boolean {
  if (a.data.draft) return false;
  if (a.data.status === 'draft' || a.data.status === 'archived') return false;
  return a.data.publishDate.getTime() <= Date.now();
}

/** 取得文章 slug（frontmatter slug 優先，否則用檔名 id） */
export function articleSlug(a: Article): string {
  return a.data.slug ?? a.id;
}

/** 所有已發佈文章，依發佈日期新到舊排序 */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles');
  return all
    .filter(isPublic)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

export function byCategory(articles: Article[], category: string): Article[] {
  return articles.filter((a) => a.data.category === category);
}

/** 有已發佈文章的分類 slug 集合（給導覽/頁尾隱藏空分類用） */
export async function getActiveCategorySlugs(): Promise<Set<string>> {
  const arts = await getPublishedArticles();
  return new Set(arts.map((a) => a.data.category));
}

export function bySubcategory(articles: Article[], sub: string): Article[] {
  return articles.filter((a) => a.data.subcategory === sub);
}

export function byTag(articles: Article[], tag: string): Article[] {
  return articles.filter((a) => a.data.tags.includes(tag));
}

export function byAuthor(articles: Article[], authorSlug: string): Article[] {
  return articles.filter(
    (a) => a.data.author === authorSlug || a.data.coAuthors.includes(authorSlug),
  );
}

export function byColumn(articles: Article[], columnSlug: string): Article[] {
  return articles.filter((a) => a.data.column === columnSlug);
}

export function byTopic(articles: Article[], topicSlug: string): Article[] {
  return articles.filter((a) => a.data.topics.includes(topicSlug));
}

export function featuredArticles(articles: Article[]): Article[] {
  return articles.filter((a) => a.data.featured);
}

/**
 * 首頁去重收集器：依序拿取各區塊文章，已用過的不重複。
 * 當某分類文章不足時可放寬（allowDup）。
 */
export function makeDeduper() {
  const used = new Set<string>();
  return {
    take(pool: Article[], n: number, allowDup = false): Article[] {
      const out: Article[] = [];
      for (const a of pool) {
        if (out.length >= n) break;
        const key = articleSlug(a);
        if (!allowDup && used.has(key)) continue;
        out.push(a);
        used.add(key);
      }
      // 不足且允許重複時，從 pool 補滿（仍標記 used）
      if (out.length < n && allowDup) {
        for (const a of pool) {
          if (out.length >= n) break;
          if (out.includes(a)) continue;
          out.push(a);
        }
      }
      return out;
    },
    has(a: Article) {
      return used.has(articleSlug(a));
    },
  };
}

/** 相關文章：同分類 / 同標籤，排除自己，最多 n 篇 */
export function relatedArticles(all: Article[], current: Article, n = 4): Article[] {
  const curSlug = articleSlug(current);
  const scored = all
    .filter((a) => articleSlug(a) !== curSlug)
    .map((a) => {
      let score = 0;
      if (a.data.category === current.data.category) score += 2;
      if (a.data.subcategory && a.data.subcategory === current.data.subcategory)
        score += 1;
      const shared = a.data.tags.filter((t) => current.data.tags.includes(t)).length;
      score += shared;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || y.a.data.publishDate.getTime() - x.a.data.publishDate.getTime());
  return scored.slice(0, n).map((x) => x.a);
}

/** 上一篇 / 下一篇（同一份已排序清單，新到舊） */
export function adjacent(sorted: Article[], current: Article) {
  const curSlug = articleSlug(current);
  const idx = sorted.findIndex((a) => articleSlug(a) === curSlug);
  return {
    newer: idx > 0 ? sorted[idx - 1] : undefined, // 較新
    older: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined, // 較舊
  };
}

/* ----------------------------- reading time ----------------------------- */

/** 估算閱讀時間（中文約每分鐘 350 字）。frontmatter 有指定則優先。 */
export function readingTime(a: Article): number {
  if (a.data.readingTime) return a.data.readingTime;
  const text = a.body ?? '';
  const chars = text.replace(/\s+/g, '').length;
  return Math.max(1, Math.round(chars / 350));
}

/* ----------------------------- images ----------------------------- */

/** 文章封面圖：有 coverImage 用之，否則用分類 fallback */
export function coverImageFor(a: Article): string {
  if (a.data.coverImage) return asset(a.data.coverImage);
  if (isSupplementAdComplianceArticle(a)) return asset(SUPPLEMENT_AD_COMPLIANCE_COVER);
  if (isDementiaFriendlyCommunityActivitiesArticle(a)) {
    return asset(DEMENTIA_FRIENDLY_COMMUNITY_ACTIVITIES_COVER);
  }
  return asset(`og/${a.data.category}.png`);
}

/** 封面 alt：coverAlt 優先，否則用標題 */
export function coverAltFor(a: Article): string {
  return a.data.coverAlt ?? a.data.title;
}

/* ----------------------------- authors ----------------------------- */

export async function getAuthors(): Promise<Author[]> {
  return getCollection('authors');
}

export async function getAuthorMap(): Promise<Map<string, Author>> {
  const authors = await getAuthors();
  return new Map(authors.map((a) => [a.id, a]));
}

/** 是否可連到作者頁（等級 + showAuthorPage 控制） */
export function authorHasPage(author: Author | undefined): boolean {
  if (!author) return false;
  return author.data.active && author.data.showAuthorPage;
}

export function authorHasColumnPage(author: Author | undefined): boolean {
  if (!author) return false;
  return author.data.active && author.data.showColumnPage;
}

export function authorAvatar(author: Author | undefined): string {
  if (author?.data.avatar) return asset(author.data.avatar);
  return asset('og/author.png');
}

/* ----------------------------- tags ----------------------------- */

export interface TagStat {
  tag: string;
  count: number;
}

export function tagStats(articles: Article[]): TagStat[] {
  const map = new Map<string, number>();
  for (const a of articles) {
    for (const t of a.data.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 簡易 slugify（標籤 / 專題網址用）。
 * 保留 CJK 原字（與文章 slug 一致，交給瀏覽器/伺服器自然編碼），
 * 僅移除 URL/檔名不安全字元 —— 切勿在此 encodeURIComponent，
 * 否則 href 與輸出資料夾名會雙重編碼而 404。
 */
export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>#%|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ----------------------------- columns / topics ----------------------------- */

export async function getColumns(): Promise<Column[]> {
  return (await getCollection('columns')).filter((c) => c.data.status === 'active');
}

export async function getTopics(): Promise<Topic[]> {
  return (await getCollection('topics')).filter((t) => t.data.status === 'active');
}
