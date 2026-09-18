import { describe, expect, it } from 'vitest';
import { computeNextZoneName, suggestNextZoneCode } from './naming';

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

describe('computeNextZoneName', () => {
  it('starts at 1 for a never-used text', () => {
    expect(computeNextZoneName(['Piso 1', 'Piso 2'], 'Terraza')).toBe('Terraza 1');
  });

  it('takes the max number + 1 for the matching category', () => {
    expect(computeNextZoneName(['Piso 1', 'Piso 2'], 'Piso')).toBe('Piso 3');
  });

  it('matches the text part case-insensitively', () => {
    expect(computeNextZoneName(['piso 1', 'PISO 2'], 'Piso')).toBe('Piso 3');
  });

  it('counts per-category independently', () => {
    expect(computeNextZoneName(['Piso 1', 'Piso 2', 'Terraza 1'], 'Terraza')).toBe('Terraza 2');
  });

  it('handles names that do not parse as "{text} {number}" as their own category', () => {
    expect(computeNextZoneName(['VIP', 'Piso 1'], 'VIP')).toBe('VIP 1');
    expect(computeNextZoneName(['Terraza Sur'], 'Terraza')).toBe('Terraza 1');
  });

  it('returns an empty string for blank input', () => {
    expect(computeNextZoneName(['Piso 1'], '')).toBe('');
    expect(computeNextZoneName(['Piso 1'], '   ')).toBe('');
  });

  it('preserves the typed casing and surrounding whitespace-trimmed text', () => {
    expect(computeNextZoneName(['Piso 1'], '  piso  ')).toBe('piso 2');
  });
});
