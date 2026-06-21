// 學生賽事「拉式投稿」收件 Worker（Phase 4）。
//
// 定位：學校／隊伍／主辦單位**主動**提供賽事資訊 → 本 Worker 收件、防濫用、轉到 Slack 供人工審核。
// 不自動發文、不自動回信——一切由編輯在 Slack 審核後人工處理（符合「拉式投稿＋人工送信」決策）。
//
// 端點：
//   OPTIONS *            → CORS 預檢
//   POST   /submit       → 收一筆投稿（JSON），驗證 + （選配）Turnstile 防濫用 + 轉 Slack
//   GET    /health       → ok
//
// 純函式（validateSubmission / buildSlackBlocks）抽出可單元測試；fetch 殼層做 I/O。

export interface Env {
  ALLOWED_ORIGIN: string; // 例：https://appi.news
  SLACK_BOT_TOKEN: string; // wrangler secret：bot token（與全站一致，chat.postMessage 轉投稿給編輯審）
  SLACK_CHANNEL: string; // wrangler.toml var：收投稿的頻道 ID（運動台 C0BC106C42E）
  TURNSTILE_SECRET?: string; // wrangler secret：設了才驗 Turnstile（防機器人灌投稿）
}

export interface Submission {
  eventName: string; // 賽事名稱
  organizer: string; // 主辦／學校／隊伍
  contactName: string; // 聯絡人
  contactInfo: string; // email 或電話（至少一種）
  eventDate?: string; // 比賽日期
  location?: string; // 地點
  level?: string; // 層級（國小/國中/高中/大專…）
  description?: string; // 補充說明、賽程連結
  sourceUrl?: string; // 官方/報名連結
}

const MAX = { short: 120, long: 2000 } as const;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** 驗證投稿。回錯誤陣列；空＝通過。不丟例外。 */
export function validateSubmission(raw: unknown): string[] {
  const errors: string[] = [];
  if (!raw || typeof raw !== 'object') return ['投稿格式錯誤'];
  const s = raw as Record<string, unknown>;

  const required: [keyof Submission, string][] = [
    ['eventName', '賽事名稱'],
    ['organizer', '主辦／學校／隊伍'],
    ['contactName', '聯絡人'],
    ['contactInfo', '聯絡方式'],
  ];
  for (const [key, label] of required) {
    if (!str(s[key])) errors.push(`${label}必填`);
    else if (str(s[key]).length > MAX.short) errors.push(`${label}過長（上限 ${MAX.short} 字）`);
  }

  // 聯絡方式至少像 email 或電話之一
  const contact = str(s.contactInfo);
  if (contact && !/@/.test(contact) && !/[0-9]{6,}/.test(contact)) {
    errors.push('聯絡方式請填 email 或電話');
  }

  for (const key of ['eventDate', 'location', 'level', 'sourceUrl'] as const) {
    if (str(s[key]).length > MAX.short) errors.push(`${key} 過長`);
  }
  if (str(s.description).length > MAX.long) errors.push('補充說明過長（上限 2000 字）');

  // sourceUrl 若有給要像 URL
  const url = str(s.sourceUrl);
  if (url && !/^https?:\/\/\S+$/.test(url)) errors.push('連結格式不正確（需 http(s):// 開頭）');

  return errors;
}

/** 投稿 → Slack Block Kit blocks（給編輯審核；不含任何自動發文按鈕）。 */
export function buildSlackBlocks(s: Submission): unknown[] {
  const line = (label: string, val?: string) => (val ? `*${label}*：${val}` : null);
  const fields = [
    line('賽事', s.eventName),
    line('主辦／隊伍', s.organizer),
    line('聯絡人', s.contactName),
    line('聯絡方式', s.contactInfo),
    line('日期', s.eventDate),
    line('地點', s.location),
    line('層級', s.level),
    line('連結', s.sourceUrl),
  ].filter(Boolean) as string[];

  const blocks: unknown[] = [
    { type: 'header', text: { type: 'plain_text', text: '🏅 學生賽事投稿（待人工審核）' } },
    { type: 'section', text: { type: 'mrkdwn', text: fields.join('\n') } },
  ];
  if (s.description) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*補充*：\n${s.description.slice(0, 2900)}` } });
  }
  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: '由投稿表單送出。請人工查證後決定是否撰寫；回覆投稿者由人工處理（不自動回信）。' }],
  });
  return blocks;
}

function sanitize(raw: Record<string, unknown>): Submission {
  return {
    eventName: str(raw.eventName),
    organizer: str(raw.organizer),
    contactName: str(raw.contactName),
    contactInfo: str(raw.contactInfo),
    eventDate: str(raw.eventDate) || undefined,
    location: str(raw.location) || undefined,
    level: str(raw.level) || undefined,
    description: str(raw.description) || undefined,
    sourceUrl: str(raw.sourceUrl) || undefined,
  };
}

function cors(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(obj: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...cors(env) } });
}

/** Turnstile 驗證（設了 TURNSTILE_SECRET 才驗）。通過回 null，否則回錯誤 Response。 */
async function verifyTurnstile(token: string, ip: string, env: Env): Promise<Response | null> {
  if (!env.TURNSTILE_SECRET) return null; // 未設＝不驗（開發/初期）
  if (!token) return json({ error: '缺少驗證' }, 400, env);
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = (await res.json().catch(() => ({ success: false }))) as { success?: boolean };
  return out.success ? null : json({ error: '驗證未通過，請重試' }, 403, env);
}

async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
  if (req.method === 'GET' && url.pathname === '/health') return new Response('ok', { status: 200, headers: cors(env) });
  if (req.method !== 'POST' || url.pathname !== '/submit') return json({ error: 'not found' }, 404, env);

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: '投稿格式錯誤（需 JSON）' }, 400, env);
  }

  const ts = await verifyTurnstile(str(payload.turnstileToken), req.headers.get('cf-connecting-ip') || '', env);
  if (ts) return ts;

  const errors = validateSubmission(payload);
  if (errors.length) return json({ error: errors.join('；') }, 422, env);

  if (!env.SLACK_BOT_TOKEN || !env.SLACK_CHANNEL) return json({ error: '伺服器未設定收件管道' }, 500, env);
  const submission = sanitize(payload);
  // 與全站一致：bot token + chat.postMessage（見 scripts/lib/slack.mjs）。
  // Slack 即使 HTTP 200 也可能 ok:false，必須看 body。
  const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`, 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      channel: env.SLACK_CHANNEL,
      text: `🏅 學生賽事投稿：${submission.eventName}`,
      blocks: buildSlackBlocks(submission),
    }),
  });
  const slackJson = (await slackRes.json().catch(() => ({ ok: false }))) as { ok?: boolean };
  if (!slackJson.ok) return json({ error: '送出失敗，請稍後再試' }, 502, env);

  return json({ ok: true, message: '已收到投稿，編輯會人工審核後與你聯繫。感謝提供！' }, 200, env);
}

export default {
  async fetch(req: Request, env: Env) {
    return handle(req, env);
  },
};
