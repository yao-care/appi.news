import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from './config/categories';
import { TAG_VOCABULARY, MAX_TAGS_PER_ARTICLE } from './config/tags';

/* ------------------------------------------------------------------ */
/*  共用 schema                                                        */
/* ------------------------------------------------------------------ */

const referenceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  publisher: z.string().optional(),
  note: z.string().optional(),
});

const disclaimerTypeEnum = z
  .enum(['general', 'medical', 'financial', 'legal', 'sponsored'])
  .default('general');

const sourceTypeEnum = z
  .enum([
    'editorial',
    'author',
    'contributor',
    'expert',
    'press-release',
    'sponsored',
    'partner',
    'wire',
  ])
  .default('editorial');

const contentTypeEnum = z
  .enum([
    'news',
    'feature',
    'analysis',
    'column',
    'opinion',
    'interview',
    'research-brief',
    'guide',
    'press-release',
    'sponsored',
    'video',
    'photo-story',
  ])
  .default('news');

const statusEnum = z
  .enum(['draft', 'published', 'scheduled', 'archived'])
  .default('published');

/* ------------------------------------------------------------------ */
/*  articles                                                           */
/* ------------------------------------------------------------------ */

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    // slug 可選；缺少時用檔名
    slug: z.string().optional(),
    description: z.string(),
    excerpt: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(CATEGORY_SLUGS),
    subcategory: z.string().optional(),
    // 標籤是受控詞彙表（src/config/tags.ts），不是自由關鍵詞欄位。
    // 表外的標籤會讓 build 直接失敗——這是刻意的，見 docs/lessons/tag-taxonomy.md。
    tags: z.array(z.enum(TAG_VOCABULARY)).max(MAX_TAGS_PER_ARTICLE).default([]),
    author: z.string().default('appi-editorial'),
    coAuthors: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    coverImageCredit: z.string().optional(), // 圖庫圖攝影師署名（unsplash/pexels 授權要求）
    status: statusEnum,
    featured: z.boolean().default(false),
    hero: z.boolean().default(false),
    sourceType: sourceTypeEnum,
    contentType: contentTypeEnum,
    editor: z.string().optional(),
    reviewedBy: z.array(z.string()).default([]),
    factCheckedBy: z.array(z.string()).default([]),
    readingTime: z.number().optional(),
    disclaimerType: disclaimerTypeEnum,
    disclosure: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    expertNote: z.string().optional(),
    risksAndLimits: z.array(z.string()).default([]),
    references: z.array(referenceSchema).default([]),
    column: z.string().optional(),
    topics: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** 遷移用：保留 WordPress 原始作者帳號與分類，供日後人工校對 */
    legacyAuthor: z.string().optional(),
    legacyCategory: z.string().optional(),
    /**
     * 本文相對外媒／同題報導多做了什麼，以一兩句描述：
     * 例如原始採訪、資料整理、在地脈絡補充、文件比對、跨來源交叉查核等。
     * 有值時文末渲染「編按｜本文原創貢獻」小卡；未填則不顯示。
     */
    originalContribution: z.string().optional(),
  }),
});

/* ------------------------------------------------------------------ */
/*  authors                                                            */
/* ------------------------------------------------------------------ */

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    displayTitle: z.string().optional(),
    bioShort: z.string().default(''),
    avatar: z.string().optional(),
    /** 作者頁內文用的完整人像（avatar 為臉部方形裁切，此為原圖） */
    portrait: z.string().optional(),
    credentials: z.array(z.string()).default([]),
    specialties: z.array(z.string()).default([]),
    socialLinks: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    website: z.string().url().optional(),
    emailPublic: z.string().optional(),
    githubLogin: z.string().optional(), // 編輯器用：對應 GitHub 登入帳號 → 預設作者
    authorLevel: z
      .enum(['contributor', 'verified', 'columnist', 'featured', 'brand'])
      .default('contributor'),
    joinedDate: z.coerce.date().optional(),
    active: z.boolean().default(true),
    /** 此「作者」實為機構/團隊署名（如編輯部）→ 結構化資料以 Organization 而非 Person 呈現 */
    isOrganization: z.boolean().default(false),
    showAuthorPage: z.boolean().default(false),
    showColumnPage: z.boolean().default(false),
    disclaimer: z.string().optional(),
  }),
});

/* ------------------------------------------------------------------ */
/*  columns                                                            */
/* ------------------------------------------------------------------ */

const columns = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/columns' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    ownerAuthor: z.string(),
    coAuthors: z.array(z.string()).default([]),
    category: z.enum(CATEGORY_SLUGS).optional(),
    coverImage: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
    type: z.enum(['personal', 'brand', 'editorial', 'sponsored']).default('personal'),
    featured: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/*  topics                                                             */
/* ------------------------------------------------------------------ */

const topics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    coverImage: z.string().optional(),
    category: z.enum(CATEGORY_SLUGS).optional(),
    tags: z.array(z.enum(TAG_VOCABULARY)).max(MAX_TAGS_PER_ARTICLE).default([]),
    /** 手動指定核心文章 slug；其餘文章由 article.topics 反向關聯 */
    articles: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const collections = { articles, authors, columns, topics };
