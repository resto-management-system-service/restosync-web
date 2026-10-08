import { describe, expect, it } from 'vitest';
import { isValidISODate, todayISO } from './download';

describe('todayISO', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('isValidISODate', () => {
  it('accepts real dates and rejects junk', () => {
    expect(isValidISODate('2026-10-08')).toBe(true);
    expect(isValidISODate('2026-13-40')).toBe(false);
    expect(isValidISODate('hoy')).toBe(false);
  });
});
