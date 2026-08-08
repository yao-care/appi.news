import { describe, it, expect } from 'vitest';
import {
  weekRanges,
  GA4_PROPERTY_ID,
  GSC_SITE,
  SLACK_CHANNEL,
  CATEGORY_CHANNELS,
  DEV_CHANNEL,
  channelForCategory,
  isAlert,
  routeChannel,
} from './report-config.mjs';

describe('report-config 常數', () => {
  it('帶正式 ID', () => {
    expect(GA4_PROPERTY_ID).toBe('541946427');
    expect(GSC_SITE).toBe('sc-domain:appi.news');
    expect(SLACK_CHANNEL).toBe('C0BC4JRQJF6'); // 作者群（預設）
    expect(DEV_CHANNEL).toBe('C0BC4JJDR0C');
  });
});

describe('channelForCategory — 分類路由', () => {
  it('各分類對到自己的頻道', () => {
    expect(channelForCategory('tech')).toBe('C0BC105LB18');
    expect(channelForCategory('international')).toBe('C0BBKF9TN23');
    expect(channelForCategory('sports')).toBe('C0BC106C42E');
    expect(channelForCategory('lifestyle')).toBe('C0BBKFCD6MV');
  });
  it('未知/未給 → 預設頻道', () => {
    expect(channelForCategory('nope')).toBe(SLACK_CHANNEL);
    expect(channelForCategory(undefined)).toBe(SLACK_CHANNEL);
  });
  it('CATEGORY_CHANNELS 七個分類齊全', () => {
    expect(Object.keys(CATEGORY_CHANNELS).sort()).toEqual(
      ['finance', 'focus', 'health', 'international', 'lifestyle', 'sports', 'tech'].sort(),
    );
  });
});

describe('isAlert / routeChannel — 失敗與略過一律進 dev', () => {
  it('❌ 與 ⚠️ 開頭視為告警（允許前置空白）', () => {
    expect(isAlert('❌ 科技台 失敗（exit 1）')).toBe(true);
    expect(isAlert('⚠️ 便民市政：無法建 worktree，略過本次')).toBe(true);
    expect(isAlert('  ⚠️ 開 modal 失敗')).toBe(true);
  });
  it('有產出的內容訊息不是告警', () => {
    expect(isAlert('✅ 數據報告：完成')).toBe(false);
    expect(isAlert('🌍 國際編譯自動上架 3 篇')).toBe(false);
    expect(isAlert('📝 已產出待審草稿（未上線）')).toBe(false);
    expect(isAlert('')).toBe(false);
    expect(isAlert(undefined)).toBe(false);
  });
  it('告警無視 category，一律 dev', () => {
    expect(routeChannel({ text: '❌ 焦點/ESG 失敗', category: 'focus' })).toBe(DEV_CHANNEL);
    expect(routeChannel({ text: '⚠️ 無法建 worktree，略過本次', category: 'lifestyle' })).toBe(DEV_CHANNEL);
  });
  it('非告警照舊走分類 / 預設 / --dev', () => {
    expect(routeChannel({ text: '💻 科技台自動上架 2 篇', category: 'tech' })).toBe(CATEGORY_CHANNELS.tech);
    expect(routeChannel({ text: '✅ 完成' })).toBe(SLACK_CHANNEL);
    expect(routeChannel({ text: '📊 數據心跳', dev: true })).toBe(DEV_CHANNEL);
  });
});

describe('weekRanges', () => {
  it('回本週與上週各 7 天、不重疊、格式 YYYY-MM-DD', () => {
    const r = weekRanges(new Date('2026-06-16T00:00:00Z'));
    expect(r.cur).toEqual({ start: '2026-06-09', end: '2026-06-15' });
    expect(r.prev).toEqual({ start: '2026-06-02', end: '2026-06-08' });
  });
});
