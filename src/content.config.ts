import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from './config/categories';

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
  .enum(['editorial', 'contributor', 'sponsored', 'press-release', 'ai-assisted'])
  .default('editorial');

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
    tags: z.array(z.string()).default([]),
    author: z.string().default('appi-editorial'),
    coAuthors: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    status: statusEnum,
    featured: z.boolean().default(false),
    hero: z.boolean().default(false),
    sourceType: sourceTypeEnum,
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
    credentials: z.array(z.string()).default([]),
    specialties: z.array(z.string()).default([]),
    socialLinks: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    website: z.string().url().optional(),
    emailPublic: z.string().optional(),
    authorLevel: z
      .enum(['contributor', 'verified', 'columnist', 'featured', 'brand'])
      .default('contributor'),
    joinedDate: z.coerce.date().optional(),
    active: z.boolean().default(true),
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
    tags: z.array(z.string()).default([]),
    /** 手動指定核心文章 slug；其餘文章由 article.topics 反向關聯 */
    articles: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const collections = { articles, authors, columns, topics };
