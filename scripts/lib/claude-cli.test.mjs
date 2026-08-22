import { describe, it, expect } from 'vitest';
import { classifyClaudeRun, parseSentinelResult, QUOTA_RE, CLAUDE_FAIL_RE } from './claude-cli.mjs';

describe('classifyClaudeRun — 三態分類（quota 整批停／fail 跳過該則／ok）', () => {
  it('撞限額：exit 0 也要抓到（claude-appi 撞上限只印訊息不報錯）', () => {
    expect(classifyClaudeRun({ status: 0, stdout: "You've hit your weekly limit." }).kind).toBe('quota');
    expect(classifyClaudeRun({ status: 0, stdout: 'usage limit reached' }).kind).toBe('quota');
  });
  it('限額優先於一般失敗（同時命中時必須回 quota，否則整批會被狂打成空跑）', () => {
    expect(classifyClaudeRun({ status: 1, stdout: 'API Error: hit your weekly limit' }).kind).toBe('quota');
  });
  it('單則失敗：API error／拒答／非 0 退出', () => {
    expect(classifyClaudeRun({ status: 0, stdout: 'API Error: overloaded' }).kind).toBe('fail');
    expect(classifyClaudeRun({ status: 0, stdout: 'I am unable to respond to this.' }).kind).toBe('fail');
    expect(classifyClaudeRun({ status: 1, stdout: '', stderr: 'boom' })).toMatchObject({ kind: 'fail', detail: 'boom' });
    expect(classifyClaudeRun({ error: new Error('spawn ENOENT'), status: null, stdout: '' }).kind).toBe('fail');
  });
  it('正常輸出回 ok 並帶 stdout', () => {
    expect(classifyClaudeRun({ status: 0, stdout: 'INTL_RESULT=NEW｜x' })).toEqual({ kind: 'ok', stdout: 'INTL_RESULT=NEW｜x' });
  });
  it('QUOTA_RE 與 CLAUDE_FAIL_RE 不重疊（quota 訊息不可被當成單則失敗）', () => {
    expect(CLAUDE_FAIL_RE.test('weekly limit')).toBe(false);
    expect(QUOTA_RE.test('API Error')).toBe(false);
  });
});

describe('parseSentinelResult — 哨兵行解析正本', () => {
  it('NEW 取 slug、洗掉反引號/粗體/引號（2026-08-03 acute 首批 4 題誤判的坑）', () => {
    expect(parseSentinelResult('TECH_RESULT=NEW｜`my-slug`', 'TECH')).toMatchObject({ action: 'new', slug: 'my-slug' });
    expect(parseSentinelResult('ACUTE_RESULT=NEW｜**doms-after-exercise**', 'ACUTE')).toMatchObject({ slug: 'doms-after-exercise' });
  });
  it('slug 只取第一個空白/直線前的 token（模型愛在後面加話）', () => {
    expect(parseSentinelResult('FOCUS_RESULT=NEW｜carbon-fee 已完成查證', 'FOCUS').slug).toBe('carbon-fee');
  });
  it('fields 保留全部欄位（tech 的 targetQuery 這類附加欄）', () => {
    const v = parseSentinelResult('TECH_RESULT=NEW｜my-slug ｜ ai 醫療 是什麼', 'TECH');
    expect(v.fields[1]).toBe('ai 醫療 是什麼');
  });
  it('SKIP 帶原因、slug 為 null', () => {
    expect(parseSentinelResult('CIVIC_RESULT=SKIP｜今天無合適措施', 'CIVIC')).toMatchObject({ action: 'skip', slug: null, note: '今天無合適措施' });
  });
  it('verdicts 可換（health-days 的 OK）', () => {
    expect(parseSentinelResult('HEALTHDAY_RESULT=OK｜world-cancer-day-2027', 'HEALTHDAY', { verdicts: ['OK', 'SKIP'] }))
      .toMatchObject({ action: 'ok', slug: 'world-cancer-day-2027' });
  });
  it('整行解析不出＝infra 故障（不是編輯判斷；不可記帳本、不可當終止條件）', () => {
    expect(parseSentinelResult('模型胡言亂語', 'INTL').infra).toBe(true);
    expect(parseSentinelResult('', 'INTL').infra).toBe(true);
    expect(parseSentinelResult(undefined, 'INTL').infra).toBe(true);
  });
  it('分隔符容錯：半形直線／冒號／有無空白都吃', () => {
    expect(parseSentinelResult('POLICE_RESULT = NEW | police-2026', 'POLICE').slug).toBe('police-2026');
    expect(parseSentinelResult('VIDEO_RESULT=NEW：video-slug', 'VIDEO').slug).toBe('video-slug');
  });
});
