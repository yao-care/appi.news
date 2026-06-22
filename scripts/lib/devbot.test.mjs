import { describe, it, expect } from 'vitest';
import {
  branchForIssue,
  stripMention,
  parseSlackEvent,
  buildConsolidationPrompt,
  parseSpecOutput,
  buildIssueBody,
  buildCreateSpecButton,
  isCreateSpecAction,
  parseCreateSpecInteraction,
  buildDevPublishButton,
  isDevPublishAction,
  parseDevPublishInteraction,
  evaluateTool,
  DEVBOT_CREATE_ACTION,
  DEVBOT_PUBLISH_ACTION,
} from './devbot.mjs';

describe('branchForIssue', () => {
  it('dev/issue-N', () => {
    expect(branchForIssue(42)).toBe('dev/issue-42');
    expect(branchForIssue('7')).toBe('dev/issue-7');
  });
});

describe('stripMention', () => {
  it('去掉 <@ID> 並壓空白', () => {
    expect(stripMention('<@U0BC4NU583W>  幫我做  X')).toBe('幫我做 X');
    expect(stripMention('純文字')).toBe('純文字');
  });
});

describe('parseSlackEvent', () => {
  it('url_verification 回 challenge', () => {
    expect(parseSlackEvent({ type: 'url_verification', challenge: 'abc' })).toEqual({ kind: 'url_verification', challenge: 'abc' });
  });
  it('app_mention 取 channel/thread/text', () => {
    const out = parseSlackEvent({
      type: 'event_callback',
      event: { type: 'app_mention', user: 'U1', text: '<@UBOT> 做個東西', ts: '111.2', channel: 'C9' },
    });
    expect(out).toEqual({ kind: 'app_mention', channel: 'C9', threadTs: '111.2', ts: '111.2', user: 'U1', text: '做個東西' });
  });
  it('thread 內 @ 接該串', () => {
    const out = parseSlackEvent({
      type: 'event_callback',
      event: { type: 'app_mention', user: 'U1', text: '<@UBOT> 補充', ts: '222.9', thread_ts: '111.2', channel: 'C9' },
    });
    expect(out.threadTs).toBe('111.2');
  });
  it('bot 自己/系統/非 mention → ignore', () => {
    expect(parseSlackEvent({ type: 'event_callback', event: { type: 'app_mention', bot_id: 'B1', text: 'x', ts: '1', channel: 'C' } }).kind).toBe('ignore');
    expect(parseSlackEvent({ type: 'event_callback', event: { type: 'message', text: 'x' } }).kind).toBe('ignore');
    expect(parseSlackEvent({ type: 'whatever' }).kind).toBe('ignore');
    expect(parseSlackEvent(null).kind).toBe('ignore');
  });
});

describe('buildConsolidationPrompt', () => {
  it('含討論內容、濾掉 bot', () => {
    const p = buildConsolidationPrompt(
      [{ user: 'U1', text: '要一個深色模式' }, { user: 'UBOT', text: '機器人插嘴' }, { user: 'U2', text: '<@UBOT> 對' }],
      { botUserId: 'UBOT' },
    );
    expect(p).toContain('要一個深色模式');
    expect(p).toContain('@U2: 對');
    expect(p).not.toContain('機器人插嘴');
    expect(p).toMatch(/```json/);
  });
});

describe('parseSpecOutput', () => {
  it('抽 json 區塊', () => {
    const out = parseSpecOutput('廢話\n```json\n{"title":"加深色模式","body":"## 背景\\n要深色"}\n```\n尾巴');
    expect(out).toEqual({ title: '加深色模式', body: '## 背景\n要深色' });
  });
  it('無 json → 首行當標題', () => {
    const out = parseSpecOutput('# 加搜尋\n內文一堆');
    expect(out.title).toBe('加搜尋');
    expect(out.body).toContain('內文一堆');
  });
  it('空輸入安全', () => {
    expect(parseSpecOutput('').title).toBe('需求確認書');
  });
});

describe('buildIssueBody', () => {
  it('帶出處頁尾', () => {
    const b = buildIssueBody({ specBody: '## 背景\nX', threadLink: 'https://slack/...', requestedBy: 'U1' });
    expect(b).toContain('## 背景');
    expect(b).toContain('需求提出：<@U1>');
    expect(b).toContain('討論串：https://slack/...');
  });
});

describe('建立需求單鈕', () => {
  const payload = (value) => ({ type: 'block_actions', user: { id: 'U1' }, actions: [{ action_id: DEVBOT_CREATE_ACTION, value }] });
  it('build/parse round-trip', () => {
    const btn = buildCreateSpecButton({ channel: 'C9', threadTs: '111.2' });
    expect(btn.elements[0].action_id).toBe(DEVBOT_CREATE_ACTION);
    const p = payload(btn.elements[0].value);
    expect(isCreateSpecAction(p)).toBe(true);
    expect(parseCreateSpecInteraction(p)).toEqual({ userId: 'U1', channel: 'C9', threadTs: '111.2' });
  });
  it('非此鈕 → isCreateSpecAction false', () => {
    expect(isCreateSpecAction({ type: 'block_actions', actions: [{ action_id: 'other' }] })).toBe(false);
  });
});

describe('發佈鈕', () => {
  const payload = (value) => ({ type: 'block_actions', user: { id: 'U1' }, actions: [{ action_id: DEVBOT_PUBLISH_ACTION, value }] });
  it('build/parse round-trip', () => {
    const btn = buildDevPublishButton({ pr: 5, issue: 3, branch: 'dev/issue-3', title: '加深色' });
    const p = payload(btn.elements[0].value);
    expect(isDevPublishAction(p)).toBe(true);
    expect(parseDevPublishInteraction(p)).toEqual({ userId: 'U1', pr: 5, issue: 3, branch: 'dev/issue-3', title: '加深色' });
  });
  it('擋不合法 branch / pr', () => {
    expect(() => parseDevPublishInteraction(payload(JSON.stringify({ pr: 5, issue: 3, branch: 'main' })))).toThrow();
    expect(() => parseDevPublishInteraction(payload(JSON.stringify({ pr: 'x', issue: 3, branch: 'dev/issue-3' })))).toThrow();
  });
});

describe('evaluateTool — 只擋最危險的（站長定調）', () => {
  const wt = '/root/appi.news-devbridge-wt/issue-3';
  const bash = (cmd) => evaluateTool('Bash', { command: cmd }, { worktree: wt });

  it('放行 git/build/裝套件/甚至 push 與 merge', () => {
    for (const cmd of [
      'git push origin main', // 設計不會叫它這樣做；但不再用 denylist 擋
      'git push -f origin dev/issue-3',
      'git push origin dev/issue-3',
      'gh pr create --fill',
      'gh pr merge 5 --merge',
      'pnpm install',
      'pnpm build && pnpm check:links',
      'pm2 list',
      'docker ps',
      'git reset --hard origin/main',
      'rm -rf dist',
      'rm -rf ./node_modules/.cache',
    ]) {
      expect(bash(cmd).behavior, cmd).toBe('allow');
    }
  });

  it('擋 sudo / 毀滅性 / 家目錄系統刪除', () => {
    for (const cmd of ['sudo rm x', 'rm -rf ~', 'rm -rf /etc', 'rm -rf ../other', 'mkfs.ext4 /dev/sda', 'dd if=/dev/zero of=/dev/sda', ':(){:|:&};:']) {
      expect(bash(cmd).behavior, cmd).toBe('deny');
    }
  });

  it('擋讀寫機密檔（指令與檔案路徑）', () => {
    expect(bash('cat ~/.config/appi-news/report.env').behavior).toBe('deny');
    expect(bash('grep TOKEN .env').behavior).toBe('deny');
    expect(evaluateTool('Read', { file_path: '/root/.config/appi-news/report.env' }).behavior).toBe('deny');
    expect(evaluateTool('Write', { file_path: '.env' }, { worktree: wt }).behavior).toBe('deny');
    expect(evaluateTool('Read', { file_path: 'src/index.astro' }).behavior).toBe('allow');
  });

  it('寫入限制在 worktree 內', () => {
    expect(evaluateTool('Write', { file_path: 'src/x.ts' }, { worktree: wt }).behavior).toBe('allow');
    expect(evaluateTool('Edit', { file_path: '/etc/hosts' }, { worktree: wt }).behavior).toBe('deny');
    expect(evaluateTool('Write', { file_path: `${wt}/../escape` }, { worktree: wt }).behavior).toBe('deny');
  });

  it('其餘工具放行', () => {
    expect(evaluateTool('Grep', { pattern: 'x' }).behavior).toBe('allow');
  });
});
