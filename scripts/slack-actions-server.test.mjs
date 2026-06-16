import { describe, it, expect } from 'vitest';
import { handleInteraction } from './slack-actions-server.mjs';
import { computeSlackSignature } from './lib/slack-verify.mjs';
import { WRITE_ACTION_ID, MODAL_CALLBACK_ID } from './lib/slack-interaction.mjs';

const SECRET = 'test_secret';
const NOW = 1718000000;
const ALLOW = ['U0AGB084S2H'];

const techTopic = () => ({
  title: '居家陪伴機器人 × AI 基本法',
  conclusion: '有潛力但落地門檻在問責與隱私',
  angle: '台灣高齡社會視角',
  signal: '外部熱題',
  category: 'tech',
  subcategory: 'industry-tech',
});

function call(rawBody, { ts = NOW, sign = true, inFlight = false, now = NOW } = {}) {
  const headers = {};
  if (sign) {
    headers['x-slack-request-timestamp'] = String(ts);
    headers['x-slack-signature'] = computeSlackSignature(SECRET, String(ts), rawBody);
  }
  return handleInteraction({ rawBody, headers, signingSecret: SECRET, allowlist: ALLOW, inFlight, now });
}

const form = (obj) => 'payload=' + encodeURIComponent(JSON.stringify(obj));
const button = (topic, userId = 'U0AGB084S2H') =>
  form({ type: 'block_actions', user: { id: userId }, trigger_id: 'T.1', actions: [{ action_id: WRITE_ACTION_ID, value: JSON.stringify(topic) }] });
const submission = (topic, viewpoint, userId = 'U0AGB084S2H') =>
  form({ type: 'view_submission', user: { id: userId }, view: { private_metadata: JSON.stringify(topic), state: { values: { viewpoint_block: { viewpoint_input: { value: viewpoint } } } } } });

describe('handleInteraction — 安全閘', () => {
  it('無簽章 → 401，無副作用', () => {
    const r = call(submission(techTopic(), '看法'), { sign: false });
    expect(r.status).toBe(401);
    expect(r.startEngine).toBeUndefined();
  });

  it('timestamp 太舊 → 401（防重放）', () => {
    const r = call(submission(techTopic(), '看法'), { now: NOW + 400 });
    expect(r.status).toBe(401);
  });

  it('簽章有效但 payload 壞 → 400', () => {
    const r = call('payload=' + encodeURIComponent('{壞 json'));
    expect(r.status).toBe(400);
  });
});

describe('handleInteraction — 按鈕開 modal', () => {
  it('授權人點按鈕 → 200 + 回 openModal（看法 modal），不觸發引擎', () => {
    const r = call(button(techTopic()));
    expect(r.status).toBe(200);
    expect(r.openModal.view.callback_id).toBe(MODAL_CALLBACK_ID);
    expect(JSON.parse(r.openModal.view.private_metadata).category).toBe('tech');
    expect(r.startEngine).toBeUndefined();
  });

  it('未授權人點按鈕 → 200 但不開 modal', () => {
    const r = call(button(techTopic(), 'Uxxxx'));
    expect(r.status).toBe(200);
    expect(r.openModal).toBeUndefined();
  });
});

describe('handleInteraction — 送出看法觸發', () => {
  it('授權人 + 合法 tech 工單 → 回 clear 並 startEngine（含 viewpoint）', () => {
    const r = call(submission(techTopic(), '  我帶過長照團隊的看法  '));
    expect(r.status).toBe(200);
    expect(r.body).toContain('clear');
    expect(r.startEngine.viewpoint).toBe('我帶過長照團隊的看法');
    expect(r.startEngine.category).toBe('tech');
  });

  it('帶篇幅選擇 deep → startEngine.length=deep（Phase 2）', () => {
    const payload = form({
      type: 'view_submission',
      user: { id: 'U0AGB084S2H' },
      view: {
        private_metadata: JSON.stringify(techTopic()),
        state: { values: { viewpoint_block: { viewpoint_input: { value: '看法' } }, length_block: { length_select: { selected_option: { value: 'deep' } } } } },
      },
    });
    const r = call(payload);
    expect(r.startEngine.length).toBe('deep');
  });

  it('非 tech 題 → errors，不觸發引擎', () => {
    const r = call(submission({ ...techTopic(), category: 'health' }, '看法'));
    expect(r.body).toContain('errors');
    expect(r.startEngine).toBeUndefined();
  });

  it('未授權人送出 → errors，不觸發引擎', () => {
    const r = call(submission(techTopic(), '看法', 'Uxxxx'));
    expect(r.body).toContain('errors');
    expect(r.startEngine).toBeUndefined();
  });

  it('已有一篇在產製中 → errors，不觸發引擎', () => {
    const r = call(submission(techTopic(), '看法'), { inFlight: true });
    expect(r.body).toContain('errors');
    expect(r.startEngine).toBeUndefined();
  });
});
