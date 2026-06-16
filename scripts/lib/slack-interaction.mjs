// Slack 互動 payload 的解析與「看法 modal」組裝（子專案 2 / Phase 1）。
// 純函式、無 I/O，方便單元測試。HTTP 與發 Slack API 由端點 server 負責。
//
// 流程對應：
//   週報每則建議帶按鈕（action_id=WRITE_ACTION_ID、value=JSON.stringify(topic)）
//   → 點按鈕：block_actions → parseButtonInteraction → buildViewpointModal → views.open
//   → 填看法送出：view_submission → parseModalSubmission → 組工單 → 引擎

export const WRITE_ACTION_ID = 'newsroom_write_topic';
export const MODAL_CALLBACK_ID = 'newsroom_viewpoint_submit';
export const VIEWPOINT_BLOCK = 'viewpoint_block';
export const VIEWPOINT_ACTION = 'viewpoint_input';

/** 按鈕 value 帶 topic（週報建議欄位）。Slack button value 上限 2000 字元，逾限丟錯。 */
export function buildTopicButtonValue(topic) {
  const v = JSON.stringify(topic);
  if (v.length > 2000) throw new Error(`按鈕 value 超過 2000 字元（${v.length}）`);
  return v;
}

/** 組「看法」modal view（不含 trigger_id；trigger_id 由 views.open 另帶）。 */
export function buildViewpointModal({ topic }) {
  const title = String(topic?.title ?? '（未提供標題）');
  return {
    type: 'modal',
    callback_id: MODAL_CALLBACK_ID,
    private_metadata: JSON.stringify(topic ?? {}),
    title: { type: 'plain_text', text: '寫這題' },
    submit: { type: 'plain_text', text: '開始撰寫' },
    close: { type: 'plain_text', text: '取消' },
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*${title.slice(0, 2900)}*` } },
      {
        type: 'input',
        block_id: VIEWPOINT_BLOCK,
        label: { type: 'plain_text', text: '你對這題的看法／本業經驗（必填）' },
        element: {
          type: 'plain_text_input',
          action_id: VIEWPOINT_ACTION,
          multiline: true,
          min_length: 1, // Slack 端強制必填
        },
        hint: { type: 'plain_text', text: '機器人會用你這段當文章的真人觀點，沒有就不動筆。' },
      },
    ],
  };
}

/** 解析按鈕點擊（block_actions）→ { userId, triggerId, topic }。失敗丟錯。 */
export function parseButtonInteraction(payload) {
  if (payload?.type !== 'block_actions') throw new Error('非 block_actions');
  const action = payload.actions?.find((a) => a?.action_id === WRITE_ACTION_ID) ?? payload.actions?.[0];
  if (!action?.value) throw new Error('按鈕無 value');
  let topic;
  try {
    topic = JSON.parse(action.value);
  } catch {
    throw new Error('按鈕 value 非合法 JSON');
  }
  return { userId: payload.user?.id, triggerId: payload.trigger_id, topic };
}

/** 解析 modal 送出（view_submission）→ { userId, viewpoint, topic }。失敗丟錯。 */
export function parseModalSubmission(payload) {
  if (payload?.type !== 'view_submission') throw new Error('非 view_submission');
  const view = payload.view ?? {};
  let topic;
  try {
    topic = JSON.parse(view.private_metadata || '{}');
  } catch {
    throw new Error('private_metadata 非合法 JSON');
  }
  const viewpoint = view.state?.values?.[VIEWPOINT_BLOCK]?.[VIEWPOINT_ACTION]?.value ?? '';
  return { userId: payload.user?.id, viewpoint: String(viewpoint).trim(), topic };
}

/** 授權人白名單檢查。預設拒（白名單空或 user 不在內 → false），安全優先。 */
export function isAuthorized(userId, allowlist) {
  if (!Array.isArray(allowlist) || allowlist.length === 0) return false;
  return !!userId && allowlist.includes(userId);
}

/** topic（週報建議欄位）+ 作者看法 → 引擎工單（交給 newsroom-job 的 validateJob 把關）。 */
export function toJob(topic, viewpoint) {
  return { ...(topic ?? {}), viewpoint: String(viewpoint ?? '').trim() };
}
