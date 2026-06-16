import { describe, it, expect } from 'vitest';
import {
  buildTopicButtonValue,
  buildViewpointModal,
  parseButtonInteraction,
  parseModalSubmission,
  isAuthorized,
  toJob,
  WRITE_ACTION_ID,
  MODAL_CALLBACK_ID,
  VIEWPOINT_BLOCK,
  VIEWPOINT_ACTION,
  LENGTH_BLOCK,
  LENGTH_ACTION,
} from './slack-interaction.mjs';

const topic = () => ({
  title: '居家陪伴機器人 × AI 基本法',
  conclusion: '有潛力但落地門檻在問責與隱私',
  angle: '台灣高齡社會視角',
  signal: '外部熱題：CES 2026 + AI 基本法上路',
  category: 'tech',
  subcategory: 'industry-tech',
});

describe('buildTopicButtonValue', () => {
  it('回 JSON 字串', () => {
    expect(JSON.parse(buildTopicButtonValue(topic())).title).toContain('居家陪伴機器人');
  });
  it('超過 2000 字元丟錯', () => {
    expect(() => buildTopicButtonValue({ title: 'x'.repeat(2100) })).toThrow();
  });
});

describe('buildViewpointModal', () => {
  it('看法欄必填（min_length>=1）、callback_id 正確、topic 進 private_metadata', () => {
    const v = buildViewpointModal({ topic: topic() });
    expect(v.callback_id).toBe(MODAL_CALLBACK_ID);
    expect(JSON.parse(v.private_metadata).category).toBe('tech');
    const input = v.blocks.find((b) => b.block_id === VIEWPOINT_BLOCK);
    expect(input.element.action_id).toBe(VIEWPOINT_ACTION);
    expect(input.element.min_length).toBeGreaterThanOrEqual(1);
    expect(input.optional).not.toBe(true); // input block 預設必填
  });
});

describe('parseButtonInteraction', () => {
  it('取出 userId / triggerId / topic', () => {
    const payload = {
      type: 'block_actions',
      user: { id: 'U123' },
      trigger_id: 'T.999',
      actions: [{ action_id: WRITE_ACTION_ID, value: buildTopicButtonValue(topic()) }],
    };
    const r = parseButtonInteraction(payload);
    expect(r.userId).toBe('U123');
    expect(r.triggerId).toBe('T.999');
    expect(r.topic.subcategory).toBe('industry-tech');
  });
  it('非 block_actions 丟錯', () => {
    expect(() => parseButtonInteraction({ type: 'view_submission' })).toThrow();
  });
  it('value 非 JSON 丟錯', () => {
    expect(() =>
      parseButtonInteraction({ type: 'block_actions', actions: [{ action_id: WRITE_ACTION_ID, value: 'not json' }] }),
    ).toThrow();
  });
});

describe('parseModalSubmission', () => {
  it('取出 viewpoint（trim）與 topic', () => {
    const payload = {
      type: 'view_submission',
      user: { id: 'U123' },
      view: {
        private_metadata: JSON.stringify(topic()),
        state: { values: { [VIEWPOINT_BLOCK]: { [VIEWPOINT_ACTION]: { value: '  我帶過長照團隊的看法  ' } } } },
      },
    };
    const r = parseModalSubmission(payload);
    expect(r.viewpoint).toBe('我帶過長照團隊的看法');
    expect(r.topic.title).toContain('居家陪伴機器人');
  });
  it('非 view_submission 丟錯', () => {
    expect(() => parseModalSubmission({ type: 'block_actions' })).toThrow();
  });
});

describe('isAuthorized', () => {
  it('白名單內 → true', () => {
    expect(isAuthorized('U123', ['U123', 'U456'])).toBe(true);
  });
  it('不在白名單 / 空白名單 / 無 userId → false（預設拒）', () => {
    expect(isAuthorized('Uxxx', ['U123'])).toBe(false);
    expect(isAuthorized('U123', [])).toBe(false);
    expect(isAuthorized('U123', undefined)).toBe(false);
    expect(isAuthorized(undefined, ['U123'])).toBe(false);
  });
});

describe('toJob', () => {
  it('topic + 看法 → 工單（含 viewpoint，可餵 validateJob）', () => {
    const job = toJob(topic(), '  我的看法  ');
    expect(job.viewpoint).toBe('我的看法');
    expect(job.category).toBe('tech');
    expect(job.title).toContain('居家陪伴機器人');
  });
  it('帶 length 選項', () => {
    expect(toJob(topic(), '看法', { length: 'deep' }).length).toBe('deep');
    expect(toJob(topic(), '看法').length).toBeUndefined();
  });
});

describe('篇幅選項（Phase 2）', () => {
  const subWithLen = (len) => ({
    type: 'view_submission',
    user: { id: 'U' },
    view: {
      private_metadata: JSON.stringify(topic()),
      state: {
        values: {
          [VIEWPOINT_BLOCK]: { [VIEWPOINT_ACTION]: { value: '看法' } },
          ...(len ? { [LENGTH_BLOCK]: { [LENGTH_ACTION]: { selected_option: { value: len } } } } : {}),
        },
      },
    },
  });

  it('modal 含篇幅選擇塊（選填、預設短稿）', () => {
    const v = buildViewpointModal({ topic: topic() });
    const lb = v.blocks.find((b) => b.block_id === LENGTH_BLOCK);
    expect(lb.optional).toBe(true);
    expect(lb.element.initial_option.value).toBe('short');
  });

  it('parseModalSubmission 取出篇幅；沒選 → 預設 short', () => {
    expect(parseModalSubmission(subWithLen('deep')).length).toBe('deep');
    expect(parseModalSubmission(subWithLen(null)).length).toBe('short');
  });
});
