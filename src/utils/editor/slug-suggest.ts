import { AI_WORKER } from './ai-worker';

/** slug 合法格式：小寫英文、數字、連字號。 */
export function isValidSlug(s: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
}

/**
 * 呼叫 worker /slug，請 Claude 依標題（與選填的方向／來源）產生語意化英文 kebab slug。
 * 回傳已淨化的 slug；失敗則丟錯，由呼叫端決定 fallback（例如改用拼音 slugFromTitle）。
 */
export async function fetchSuggestedSlug(args: {
  title: string;
  direction?: string;
  sources?: string;
  token: string;
}): Promise<string> {
  const res = await fetch(`${AI_WORKER}/slug`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${args.token}` },
    body: JSON.stringify({ title: args.title, direction: args.direction, sources: args.sources }),
  });
  const data = (await res.json()) as { slug?: string; error?: string };
  if (!res.ok || !data.slug || !isValidSlug(data.slug)) {
    throw new Error(data.error || `slug 產生失敗（${res.status}）`);
  }
  return data.slug;
}
