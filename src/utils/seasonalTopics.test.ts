import { describe, expect, it } from 'vitest';
import {
  activeSeasonalTopic,
  resolveSeasonalSlots,
  taipeiDateKey,
  type SeasonalTopicCampaign,
} from './seasonalTopics';

describe('seasonal topic rotation', () => {
  it('uses the Taipei calendar date at the UTC boundary', () => {
    expect(taipeiDateKey(new Date('2026-08-19T15:59:59Z'))).toBe('2026-08-19');
    expect(taipeiDateKey(new Date('2026-08-19T16:00:00Z'))).toBe('2026-08-20');
  });

  it.each([
    ['2026-08-09T00:00:00Z', 'qixi-2026'],
    ['2026-08-19T15:59:59Z', 'qixi-2026'],
    ['2026-08-19T16:00:00Z', 'zhongyuan-2026'],
    ['2026-08-27T15:59:59Z', 'zhongyuan-2026'],
    ['2026-08-27T16:00:00Z', 'back-to-school-2026'],
    ['2026-08-31T15:59:59Z', 'back-to-school-2026'],
  ])('selects the right campaign at %s', (iso, topicId) => {
    expect(activeSeasonalTopic(new Date(iso))?.topicId).toBe(topicId);
  });

  it('returns no expired campaign after the sprint', () => {
    expect(activeSeasonalTopic(new Date('2026-08-31T16:00:00Z'))).toBeUndefined();
  });
});

describe('resolveSeasonalSlots（2026 年 8 月檔期真值表）', () => {
  // 各期間取「期間內任一時點」＋「進出期間的 UTC 邊界」驗證，
  // 把原本只活在 index.astro 三元樹裡、測不到的組合決策整張釘下來。

  it('檔期開始前：整節不出現', () => {
    expect(resolveSeasonalSlots(new Date('2026-07-31T15:59:59Z'))).toEqual({});
  });

  it('08-01 到 08-09：只有當令主入口（七夕），還沒有次入口', () => {
    for (const iso of ['2026-07-31T16:00:00Z', '2026-08-05T00:00:00Z', '2026-08-09T15:59:59Z']) {
      const { primary, companion } = resolveSeasonalSlots(new Date(iso));
      expect(primary).toMatchObject({
        topicId: 'qixi-2026',
        eyebrow: '8 月 19 日七夕',
        description: '日期、祭拜與成年禮一次查',
      });
      // 非主打期：不覆寫標題（渲染端用專題本身的標題）、無 lead 圖、非強化版型
      expect(primary?.title).toBeUndefined();
      expect(primary?.leadArticleSlug).toBeUndefined();
      expect(primary?.promoted).toBeFalsy();
      expect(companion).toBeUndefined();
    }
  });

  it('08-10 起：開學次入口提早露出（帶覆寫 eyebrow 與標題）', () => {
    for (const iso of ['2026-08-09T16:00:00Z', '2026-08-16T15:59:59Z']) {
      const { primary, companion } = resolveSeasonalSlots(new Date(iso));
      expect(primary?.topicId).toBe('qixi-2026');
      expect(companion).toMatchObject({
        topicId: 'back-to-school-2026',
        eyebrow: '提早準備｜8 月 31 日開學',
        title: '小一用品、收心與校園防疫',
      });
    }
  });

  it('08-17 起：開學升為主打主入口，當令檔期（七夕）退為次入口', () => {
    for (const iso of ['2026-08-16T16:00:00Z', '2026-08-19T15:59:59Z']) {
      const { primary, companion } = resolveSeasonalSlots(new Date(iso));
      expect(primary).toMatchObject({
        topicId: 'back-to-school-2026',
        eyebrow: '現在主打｜8 月 31 日開學',
        title: '2026 開學準備清單',
        description: '收心、護眼與校園防疫清單',
        leadArticleSlug: 'first-grade-school-supplies-2026',
        promoted: true,
      });
      expect(companion).toMatchObject({ topicId: 'qixi-2026', eyebrow: '8 月 19 日七夕' });
      // 當令檔期退為次入口時沒有覆寫標題（渲染端用專題本身的標題）
      expect(companion?.title).toBeUndefined();
    }
  });

  it('08-20 到 08-27：主打續留開學，次入口輪替為中元', () => {
    for (const iso of ['2026-08-19T16:00:00Z', '2026-08-27T15:59:59Z']) {
      const { primary, companion } = resolveSeasonalSlots(new Date(iso));
      expect(primary?.topicId).toBe('back-to-school-2026');
      expect(primary?.promoted).toBe(true);
      expect(companion).toMatchObject({ topicId: 'zhongyuan-2026', eyebrow: '8 月 27 日中元節' });
    }
  });

  it('08-28 到 08-31：當令檔期就是開學本身，次入口關閉避免同專題重複', () => {
    for (const iso of ['2026-08-27T16:00:00Z', '2026-08-31T15:59:59Z']) {
      const { primary, companion } = resolveSeasonalSlots(new Date(iso));
      expect(primary?.topicId).toBe('back-to-school-2026');
      expect(primary?.promoted).toBe(true);
      expect(companion).toBeUndefined();
    }
  });

  it('08-31 之後：全檔期結束，整節不出現', () => {
    expect(resolveSeasonalSlots(new Date('2026-08-31T16:00:00Z'))).toEqual({});
  });
});

describe('resolveSeasonalSlots（通用規則，合成檔期表）', () => {
  const campaigns: SeasonalTopicCampaign[] = [
    {
      topicId: 'festival-a',
      start: '2030-01-01',
      end: '2030-01-10',
      eyebrow: 'A 檔期',
      deadlineLabel: 'A 說明',
    },
    {
      topicId: 'festival-b',
      start: '2030-01-11',
      end: '2030-01-20',
      eyebrow: 'B 檔期',
      deadlineLabel: 'B 說明',
      // 次入口窗涵蓋 B 自己當令的期間：不得自己當主入口又當次入口
      companionStart: '2030-01-05',
      companionEnd: '2030-01-20',
    },
  ];
  const at = (day: string) => new Date(`${day}T04:00:00Z`); // 台北中午，避開日界

  it('次入口未設覆寫文案時退回 eyebrow，標題留給專題本身', () => {
    const { companion } = resolveSeasonalSlots(at('2030-01-06'), campaigns);
    expect(companion).toMatchObject({ topicId: 'festival-b', eyebrow: 'B 檔期' });
    expect(companion?.title).toBeUndefined();
  });

  it('次入口窗內但已輪到自己當令主入口：不重複佔次入口', () => {
    const { primary, companion } = resolveSeasonalSlots(at('2030-01-15'), campaigns);
    expect(primary?.topicId).toBe('festival-b');
    expect(companion).toBeUndefined();
  });

  it('沒有主入口就不回傳次入口（次入口掛在主入口區塊內）', () => {
    const gapCampaigns: SeasonalTopicCampaign[] = [
      {
        ...campaigns[1],
        start: '2030-02-01',
        end: '2030-02-05',
        companionStart: '2030-01-25',
        companionEnd: '2030-01-31',
      },
    ];
    expect(resolveSeasonalSlots(at('2030-01-26'), gapCampaigns)).toEqual({});
  });
});
