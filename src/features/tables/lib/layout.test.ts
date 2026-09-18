import { describe, expect, it } from 'vitest';
import {
  chairOffsets,
  computeDefaultPlacement,
  computeLabelFontSize,
  computeSquareSize,
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

describe('computeSquareSize', () => {
  it('renders square pixels on a non-square canvas', () => {
    const size = computeSquareSize({ width: 600, height: 260 });
    expect(size.width * 600).toBeCloseTo(size.height * 260, 10);
  });

  it('keeps equal fractions on a square canvas', () => {
    expect(computeSquareSize({ width: 1000, height: 1000 })).toEqual({ width: 0.16, height: 0.16 });
  });

  it('falls back to the default size for a zero-dimension canvas', () => {
    expect(computeSquareSize({ width: 0, height: 0 })).toEqual({ width: 0.16, height: 0.16 });
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

  it('matches square capacity exactly (not capped at 4)', () => {
    for (let capacity = 1; capacity <= 8; capacity++) {
      expect(chairOffsets('square', capacity, 100, 100)).toHaveLength(capacity);
    }
  });

  it('matches rounded capacity exactly', () => {
    expect(chairOffsets('rounded', 6, 100, 100)).toHaveLength(6);
    expect(chairOffsets('rounded', 8, 100, 100)).toHaveLength(8);
  });

  it('places one chair centered per side for capacity 4', () => {
    const [top, bottom, right, left] = chairOffsets('square', 4, 100, 100);
    expect(top).toEqual({ x: 50, y: -10 });
    expect(bottom).toEqual({ x: 50, y: 110 });
    expect(right).toEqual({ x: 110, y: 50 });
    expect(left).toEqual({ x: -10, y: 50 });
  });

  it('distributes extra chairs along opposite sides first (capacity 6)', () => {
    const positions = chairOffsets('square', 6, 100, 100);
    expect(positions).toHaveLength(6);

    expect(positions.filter((p) => p.y === -10)).toHaveLength(2); // top
    expect(positions.filter((p) => p.y === 110)).toHaveLength(2); // bottom
    expect(positions.filter((p) => p.x === 110)).toHaveLength(1); // right
    expect(positions.filter((p) => p.x === -10)).toHaveLength(1); // left
  });

  it('spreads 8 chairs two per side', () => {
    const positions = chairOffsets('square', 8, 100, 100);
    expect(positions.filter((p) => p.y === -10)).toHaveLength(2); // top
    expect(positions.filter((p) => p.y === 110)).toHaveLength(2); // bottom
    expect(positions.filter((p) => p.x === 110)).toHaveLength(2); // right
    expect(positions.filter((p) => p.x === -10)).toHaveLength(2); // left
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

  it('shrinks a 6-char name so it fits on one line in a small shape', () => {
    const width = 80;
    const shortFont = computeLabelFontSize(width, width, '101');
    const longFont = computeLabelFontSize(width, width, 'TER101');

    // "TER101" must render smaller than "101" to avoid wrapping to two lines.
    expect(longFont).toBeLessThan(shortFont);

    // At ~0.62em per glyph, the 6 characters must fit within the shape width
    // (minus horizontal padding) — i.e. no wrap for the longer code.
    expect(longFont * 0.62 * 'TER101'.length).toBeLessThanOrEqual(width - 16);
  });

  it('keeps the size-based font for a short name that already fits', () => {
    // "101" already fits at the size-based font, so it must not be shrunk.
    expect(computeLabelFontSize(100, 100, '101')).toBe(computeLabelFontSize(100, 100));
  });
});
