import { describe, expect, it } from 'vitest';
import { suggestNextZoneCode } from './naming';

describe('suggestNextZoneCode', () => {
  it('suggests "1" when no zones exist', () => {
    expect(suggestNextZoneCode([])).toBe('1');
  });

  it('suggests the next sequential number based on existing zones', () => {
    expect(suggestNextZoneCode([{ code: '1' }, { code: '2' }])).toBe('3');
  });

  it('reuses gaps left by deleted zones', () => {
    expect(suggestNextZoneCode([{ code: '1' }, { code: '3' }])).toBe('2');
  });

  it('ignores non-numeric codes (T, VIP)', () => {
    expect(suggestNextZoneCode([{ code: 'T' }, { code: 'VIP' }])).toBe('1');
    expect(suggestNextZoneCode([{ code: '1' }, { code: 'T' }])).toBe('2');
  });

  it('ignores null/undefined codes', () => {
    expect(suggestNextZoneCode([{ code: null }, { code: undefined }])).toBe('1');
  });
});
