import { describe, it, expect } from 'vitest';
import {
  newRootMessages,
  newThreadReplies,
  maxTs,
  branchForThread,
  evaluateTool,
} from './dev-bridge.mjs';

const BOT = 'UBOT';
const human = (ts, over = {}) => ({ type: 'message', user: 'UALICE', ts, ...over });

describe('newRootMessages', () => {
  it('只留人類頂層訊息、升冪排序', () => {
    const msgs = [
      human('1002.0001'),
      human('1001.0001'),
      { type: 'message', subtype: 'channel_join', user: 'UALICE', ts: '1003.0001' }, // 系統
      { type: 'message', user: BOT, ts: '1004.0001' }, // bot 自己
      human('1005.0001', { thread_ts: '1001.0001' }), // thread 回覆，不是頂層
      human('1006.0001', { thread_ts: '1006.0001' }), // thread 根＝自己，算頂層
    ];
    const out = newRootMessages(msgs, BOT);
    expect(out.map((m) => m.ts)).toEqual(['1001.0001', '1002.0001', '1006.0001']);
  });
  it('空輸入安全', () => {
    expect(newRootMessages(undefined, BOT)).toEqual([]);
  });
});

describe('newThreadReplies', () => {
  const threadTs = '1000.0001';
  it('排除 thread 根、已處理的、bot 與系統訊息', () => {
    const replies = [
      human(threadTs, { thread_ts: threadTs }), // 根本身
      { type: 'message', user: BOT, ts: '1000.0002', thread_ts: threadTs }, // bot 回覆
      human('1000.0003', { thread_ts: threadTs }), // 已處理（<= since）
      human('1000.0005', { thread_ts: threadTs }), // 新
      human('1000.0004', { thread_ts: threadTs }), // 新
    ];
    const out = newThreadReplies(replies, BOT, threadTs, '1000.0003');
    expect(out.map((m) => m.ts)).toEqual(['1000.0004', '1000.0005']);
  });
  it('sinceTs 省略時以 threadTs 為界', () => {
    const replies = [human('1000.0002', { thread_ts: threadTs })];
    expect(newThreadReplies(replies, BOT, threadTs).map((m) => m.ts)).toEqual(['1000.0002']);
  });
});

describe('maxTs', () => {
  it('回最大 ts；空陣列回 fallback', () => {
    expect(maxTs([{ ts: '5' }, { ts: '9' }, { ts: '7' }], '0')).toBe('9');
    expect(maxTs([], 'fb')).toBe('fb');
  });
});

describe('branchForThread', () => {
  it('穩定且只含安全字元', () => {
    expect(branchForThread('1718000000.000100')).toBe('dev/t1718000000-000100');
    expect(branchForThread('1718000000.000100')).toBe(branchForThread('1718000000.000100'));
  });
});

describe('evaluateTool — Bash denylist', () => {
  const wt = '/root/appi.news-devbridge-wt/t1';
  const denied = (cmd) => evaluateTool('Bash', { command: cmd }, { worktree: wt });

  it('放行一般開發指令', () => {
    for (const cmd of [
      'git status',
      'git diff',
      'git checkout -b dev/foo origin/main',
      'git add -A && git commit -m "x"',
      'git push origin dev/foo',
      'git push -u origin dev/foo',
      'gh pr create --fill',
      'pnpm build',
      'pnpm check:links',
      'node scripts/newsroom-write.test.mjs',
      'ls -la && grep -rn foo src',
    ]) {
      expect(denied(cmd).behavior, cmd).toBe('allow');
    }
  });

  it('擋 push main / force / 刪分支 / clean -x', () => {
    for (const cmd of [
      'git push origin main',
      'git push origin HEAD:main',
      'git push origin dev/x --force',
      'git push -f origin dev/x',
      'git push --force-with-lease origin dev/x',
      'git branch -D dev/x',
      'git clean -xfd',
    ]) {
      expect(denied(cmd).behavior, cmd).toBe('deny');
    }
  });

  it('擋部署 / 系統服務 / 發佈 / gh secret', () => {
    for (const cmd of [
      'pm2 restart appinews-slack-actions',
      'docker ps',
      'wrangler deploy',
      'sudo systemctl restart nginx',
      'npm publish',
      'gh secret set FOO',
    ]) {
      expect(denied(cmd).behavior, cmd).toBe('deny');
    }
  });

  it('擋毀滅性與機密', () => {
    for (const cmd of [
      'rm -rf ~',
      'rm -rf /etc',
      'rm -rf ../other',
      'sudo rm foo',
      'cat ~/.config/appi-news/report.env',
      'source ../report.env',
      'grep TOKEN .env',
      'cat ~/.ssh/id_rsa',
      'git reset --hard origin/main',
    ]) {
      expect(denied(cmd).behavior, cmd).toBe('deny');
    }
  });

  it('允許刪 worktree 內相對路徑', () => {
    expect(denied('rm -rf dist').behavior).toBe('allow');
    expect(denied('rm -rf ./node_modules/.cache').behavior).toBe('allow');
  });
});

describe('evaluateTool — 檔案讀寫封閉', () => {
  const wt = '/root/appi.news-devbridge-wt/t1';
  it('擋讀機密', () => {
    expect(evaluateTool('Read', { file_path: '/root/.config/appi-news/report.env' }).behavior).toBe('deny');
    expect(evaluateTool('Read', { file_path: 'src/pages/index.astro' }).behavior).toBe('allow');
  });
  it('寫入限制在 worktree 內、擋機密', () => {
    expect(evaluateTool('Write', { file_path: 'src/x.ts', content: '' }, { worktree: wt }).behavior).toBe('allow');
    expect(evaluateTool('Write', { file_path: `${wt}/src/x.ts` }, { worktree: wt }).behavior).toBe('allow');
    expect(evaluateTool('Edit', { file_path: '/etc/hosts' }, { worktree: wt }).behavior).toBe('deny');
    expect(evaluateTool('Write', { file_path: `${wt}/../escape.txt` }, { worktree: wt }).behavior).toBe('deny');
    expect(evaluateTool('Write', { file_path: '.env', content: '' }, { worktree: wt }).behavior).toBe('deny');
  });
});

describe('evaluateTool — 其餘工具放行', () => {
  it('Glob/Grep/WebFetch 預設 allow', () => {
    expect(evaluateTool('Grep', { pattern: 'x' }).behavior).toBe('allow');
    expect(evaluateTool('WebFetch', { url: 'https://example.com' }).behavior).toBe('allow');
  });
});
