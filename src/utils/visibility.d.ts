// 型別殼：visibility.mjs 必須是 .mjs（scripts/*.mjs 用 node 直跑吃不了 TS），這裡補宣告給 TS 端。
export interface VisibilityFrontmatter {
  draft?: boolean | string;
  status?: string;
  publishDate?: Date | string;
}
export function isPublicFrontmatter(d: VisibilityFrontmatter | null | undefined, now?: Date | number): boolean;
export function isScheduledPreviewFrontmatter(d: VisibilityFrontmatter | null | undefined, now?: Date | number): boolean;
