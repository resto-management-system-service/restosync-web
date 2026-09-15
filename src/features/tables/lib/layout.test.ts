import { describe, expect, it } from 'vitest';
import { chairOffsets, percentToPixel, pixelToPercent } from './layout';

describe('percent/pixel conversion', () => {
  it('round-trips percent to pixel and back', () => {
    const dimension = 800;
    const fraction = 0.35;
    const pixels = percentToPixel(fraction, dimension);
    expect(pixelToPercent(pixels, dimension)).toBeCloseTo(fraction, 10);
  });

  it('converts whole and zero fractions', () => {
    expect(percentToPixel(0, 500)).toBe(0);
    expect(percentToPixel(1, 500)).toBe(500);
    expect(pixelToPercent(0, 500)).toBe(0);
  });

  it('returns 0 when dimension is zero', () => {
    expect(pixelToPercent(100, 0)).toBe(0);
  });
});

describe('chairOffsets', () => {
  it('produces capacity-many chair positions', () => {
    expect(chairOffsets('circle', 6, 100, 100)).toHaveLength(6);
    expect(chairOffsets('square', 8, 120, 90)).toHaveLength(8);
    expect(chairOffsets('rounded', 4, 100, 100)).toHaveLength(4);
  });
});
