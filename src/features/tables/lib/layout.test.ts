import { describe, expect, it } from 'vitest';
import {
  chairOffsets,
  computeDefaultPlacement,
  computeLabelFontSize,
  percentToPixel,
  pixelToPercent,
  rectsOverlap
} from './layout';

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

  it('maps small pixel increments to equally small percent increments (no rounding jumps)', () => {
    const dimension = 800;
    const startPx = percentToPixel(0.25, dimension);

    // A drag-move sequence of 1px steps must translate to smooth, tiny percent steps.
    const percents: number[] = [];
    for (let i = 0; i <= 10; i++) {
      percents.push(pixelToPercent(startPx + i, dimension));
    }

    for (let i = 1; i < percents.length; i++) {
      expect(percents[i] - percents[i - 1]).toBeCloseTo(1 / dimension, 10);
    }
  });

  it('round-trips pixel positions exactly, so live drag positions are preserved', () => {
    const dimension = 800;
    for (const px of [0, 1, 7, 123, 400, 799]) {
      expect(percentToPixel(pixelToPercent(px, dimension), dimension)).toBeCloseTo(px, 10);
    }
  });
});

describe('computeDefaultPlacement', () => {
  it('returns the center default when the zone has no placed tables', () => {
    expect(computeDefaultPlacement([])).toEqual({ positionX: 0.5, positionY: 0.5 });
  });

  it('returns a different, non-overlapping position when a table already exists', () => {
    const existing = [{ positionX: 0.5, positionY: 0.5, width: 0.16, height: 0.16 }];

    const placement = computeDefaultPlacement(existing);

    expect(placement).not.toEqual({ positionX: 0.5, positionY: 0.5 });
    expect(rectsOverlap({ ...placement, width: 0.16, height: 0.16 }, existing[0])).toBe(false);
  });

  it('never overlaps any of several already-placed tables', () => {
    const existing = [
      { positionX: 0, positionY: 0, width: 0.16, height: 0.16 },
      { positionX: 0.24, positionY: 0, width: 0.16, height: 0.16 },
      { positionX: 0.48, positionY: 0, width: 0.16, height: 0.16 }
    ];

    const placement = computeDefaultPlacement(existing);
    const placed = { ...placement, width: 0.16, height: 0.16 };

    existing.forEach((t) => expect(rectsOverlap(placed, t)).toBe(false));
  });
});

describe('chairOffsets', () => {
  it('distributes circle chairs evenly in a ring', () => {
    expect(chairOffsets('circle', 6, 100, 100)).toHaveLength(6);

    const positions = chairOffsets('circle', 4, 100, 100);
    positions.forEach((p) => {
      const distance = Math.hypot(p.x - 50, p.y - 50);
      expect(distance).toBeCloseTo(60, 10); // radius 50 + gap 10
    });
  });

  it('places square/rounded chairs one per side, capped at 4', () => {
    expect(chairOffsets('square', 8, 100, 100)).toHaveLength(4);
    expect(chairOffsets('square', 3, 100, 100)).toHaveLength(3);
    expect(chairOffsets('rounded', 2, 100, 100)).toHaveLength(2);
    expect(chairOffsets('rounded', 4, 100, 100)).toHaveLength(4);
  });

  it('centers square chairs on each side (top, right, bottom, left)', () => {
    const [top, right, bottom, left] = chairOffsets('square', 4, 100, 100);
    expect(top).toEqual({ x: 50, y: -10 });
    expect(right).toEqual({ x: 110, y: 50 });
    expect(bottom).toEqual({ x: 50, y: 110 });
    expect(left).toEqual({ x: -10, y: 50 });
  });
});

describe('computeLabelFontSize', () => {
  it('scales proportionally to the smaller table dimension', () => {
    expect(computeLabelFontSize(100, 100)).toBe(30);
    expect(computeLabelFontSize(200, 200)).toBe(60);
  });

  it('never drops below the minimum readable size', () => {
    expect(computeLabelFontSize(10, 10)).toBe(11);
    expect(computeLabelFontSize(0, 0)).toBe(11);
  });
});
