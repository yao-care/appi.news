// Slack chat.postMessage 薄封裝。Slack 即使 HTTP 200 也可能 ok:false，要看 body。
export async function postMessage({ token, channel, text, blocks }) {
  const payload = { channel, text };
  if (blocks) payload.blocks = blocks;
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({ ok: false, error: `http_${res.status}` }));
  if (!j.ok) throw new Error(`Slack postMessage 失敗: ${j.error}`);
  return j;
}
