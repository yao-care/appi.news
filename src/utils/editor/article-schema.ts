import { z } from 'astro/zod';
import { CATEGORY_SLUGS, CATEGORIES } from '@/config/categories';

const referenceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  publisher: z.string().optional(),
  note: z.string().optional(),
});

// 對齊 src/content.config.ts 的 articles schema（瀏覽器版）
export const articleSchema = z.object({
  title: z.string(),
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
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('published'),
  featured: z.boolean().default(false),
  hero: z.boolean().default(false),
  sourceType: z.enum(['editorial', 'contributor', 'sponsored', 'press-release', 'ai-assisted']).default('editorial'),
  readingTime: z.number().optional(),
  disclaimerType: z.enum(['general', 'medical', 'financial', 'legal', 'sponsored']).default('general'),
  disclosure: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  expertNote: z.string().optional(),
  risksAndLimits: z.array(z.string()).default([]),
  references: z.array(referenceSchema).default([]),
  column: z.string().optional(),
  topics: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  legacyAuthor: z.string().optional(),
  legacyCategory: z.string().optional(),
});

export type ValidateResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: { path: string; message: string }[] };

export function validateArticleFrontmatter(fm: Record<string, unknown>): ValidateResult {
  const r = articleSchema.safeParse(fm);
  if (r.success) return { ok: true, data: r.data as Record<string, unknown> };
  return {
    ok: false,
    errors: r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
  };
}

export type EnumOption = { value: string; label: string };
export type CoreField =
  | { key: string; label: string; type: 'text' | 'textarea' | 'date'; maxLength?: number; required?: boolean; full?: boolean }
  | { key: string; label: string; type: 'enum'; options: readonly EnumOption[]; required?: boolean; full?: boolean }
  | { key: string; label: string; type: 'tags' | 'bool'; full?: boolean };

// status 中文標籤（顯示用；存檔仍是英文 slug）
const STATUS_OPTIONS: EnumOption[] = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已發佈' },
  { value: 'scheduled', label: '排程' },
  { value: 'archived', label: '封存' },
];

// 給 widget 的核心欄位；其餘欄位走「進階 YAML」區
export const CORE_FIELDS: CoreField[] = [
  { key: 'title', label: '標題', type: 'text', required: true, full: true },
  { key: 'description', label: '描述（摘要）', type: 'textarea', maxLength: 160, required: true, full: true },
  { key: 'category', label: '分類', type: 'enum', options: CATEGORIES.map((c) => ({ value: c.slug, label: c.name })), required: true },
  { key: 'author', label: '作者', type: 'text' },
  { key: 'tags', label: '標籤', type: 'tags' },
  { key: 'status', label: '狀態', type: 'enum', options: STATUS_OPTIONS },
  { key: 'publishDate', label: '發佈日期', type: 'date', required: true },
  { key: 'featured', label: '精選', type: 'bool' },
  { key: 'hero', label: '首頁 Hero', type: 'bool' },
];

// 進階 YAML 區要排除的核心 key（其餘 frontmatter 都丟進 YAML 區）
export const CORE_KEYS = CORE_FIELDS.map((f) => f.key);
