import { describe, expect, it } from 'vitest';
import { activeSeasonalTopic, taipeiDateKey } from './seasonalTopics';

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
