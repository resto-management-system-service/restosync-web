import type { TableShape, TableStatus } from '../api/types';

// ============================================================
// Tables Layout Helpers
// ============================================================
// Percentage ↔ pixel conversion and geometry used by the canvas.
// Percentages (0.0–1.0) are the source of truth; pixels are only ever
// derived for rendering/drag math.

/** Convert a percentage coordinate (0–1) to a pixel offset within `dimension`. */
export function percentToPixel(fraction: number, dimension: number): number {
  return fraction * dimension;
}

/** Convert a pixel offset within `dimension` to a percentage coordinate (0–1). */
export function pixelToPercent(pixels: number, dimension: number): number {
  if (dimension <= 0) return 0;
  return pixels / dimension;
}

/** Default width/height (percentages) assigned to a newly created table. */
export const DEFAULT_TABLE_SIZE = { width: 0.16, height: 0.16 };

/**
 * Compute a default table size (as width/height percentages) that renders as a
 * SQUARE in pixels on a canvas with the given pixel dimensions. Width is stored
 * as a fraction of canvas width and height as a fraction of canvas height, so
 * equal fractions only render square when the canvas itself is square. By
 * targeting a fixed fraction of the canvas width and deriving the height from
 * the pixel size, a "square" table renders square regardless of aspect ratio.
 */
export function computeSquareSize(canvasSize: { width: number; height: number }): {
  width: number;
  height: number;
} {
  if (canvasSize.width <= 0 || canvasSize.height <= 0) return DEFAULT_TABLE_SIZE;
  const pixelSize = DEFAULT_TABLE_SIZE.width * canvasSize.width;
  return { width: DEFAULT_TABLE_SIZE.width, height: pixelSize / canvasSize.height };
}

/** Gap (percentages) left between auto-placed tables so they never overlap. */
const AUTO_PLACE_GAP = 0.08;

/** A table's placed geometry, used for overlap detection. */
export interface PlacedRect {
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

/** True when the two axis-aligned rectangles overlap. */
export function rectsOverlap(a: PlacedRect, b: PlacedRect): boolean {
  return (
    a.positionX < b.positionX + b.width &&
    a.positionX + a.width > b.positionX &&
    a.positionY < b.positionY + b.height &&
    a.positionY + a.height > b.positionY
  );
}

/**
 * Compute a default top-left placement (percentages) for a new table that does
 * not overlap any already-placed table. Walks a small row-major grid and returns
 * the first open cell; if every cell is occupied it cascades diagonally from the
 * last placed table (clamped to the canvas). Simple by design — no bin packing.
 */
export function computeDefaultPlacement(
  existing: PlacedRect[],
  size: { width: number; height: number } = DEFAULT_TABLE_SIZE
): {
  positionX: number;
  positionY: number;
} {
  const { width, height } = size;
  const stepX = width + AUTO_PLACE_GAP;
  const stepY = height + AUTO_PLACE_GAP;

  if (existing.length === 0) {
    return { positionX: 0.5, positionY: 0.5 };
  }

  const cols = Math.max(1, Math.floor((1 - width) / stepX) + 1);

  for (let i = 0; i < 256; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * stepX;
    const y = row * stepY;
    if (x + width > 1 || y + height > 1) continue;

    const candidate: PlacedRect = { positionX: x, positionY: y, width, height };
    if (!existing.some((t) => rectsOverlap(candidate, t))) {
      return { positionX: x, positionY: y };
    }
  }

  const last = existing[existing.length - 1];
  return {
    positionX: Math.min(last.positionX + stepX, 1 - width),
    positionY: Math.min(last.positionY + stepY, 1 - height)
  };
}

/**
 * Semantic colors per table status (Tailwind green/amber/red). `fill` is the
 * solid rim color, `tabletop` is the lighter inner tint, `stroke` is the
 * mid-tone border, and `label` is the (dark) name-label color.
 */
export const STATUS_COLORS: Record<
  TableStatus,
  { fill: string; tabletop: string; stroke: string; label: string }
> = {
  AVAILABLE: { fill: '#22c55e', tabletop: '#bbf7d0', stroke: '#15803d', label: '#14532d' },
  RESERVED: { fill: '#f59e0b', tabletop: '#fde68a', stroke: '#b45309', label: '#78350f' },
  OCCUPIED: { fill: '#ef4444', tabletop: '#fecaca', stroke: '#b91c1c', label: '#7f1d1d' }
};

/** Spanish display label per table status (used in the selection panel + legend). */
export const STATUS_LABEL: Record<TableStatus, string> = {
  AVAILABLE: 'Libre',
  RESERVED: 'Reservada',
  OCCUPIED: 'Ocupada'
};

/** Status order used when listing all three states (legend, etc.). */
export const STATUS_ORDER: TableStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED'];

export const CHAIR_COLOR = { fill: '#f8fafc', stroke: '#94a3b8', dot: '#64748b' };

/** Distance (px) from a table's edge to the center of its chairs. */
const CHAIR_GAP = 10;
/** Radius (px) of a chair mark. */
export const CHAIR_RADIUS = 4;
/** Radius (px) of the filled dot inside a chair (suggests a chair back). */
export const CHAIR_DOT_RADIUS = 1.5;
/** Inset (px) of the inner tabletop from the outer rim on all sides. */
export const TABLE_INSET = 6;

/** Minimum font size (px) for a table's name label. */
const MIN_LABEL_FONT_SIZE = 11;

/**
 * Font size for a table's name label, scaled proportionally to the table's
 * current size so it grows/shrinks with the shape and never overflows.
 */
export function computeLabelFontSize(width: number, height: number): number {
  return Math.max(MIN_LABEL_FONT_SIZE, Math.min(width, height) * 0.3);
}

interface Point {
  x: number;
  y: number;
}

/**
 * Compute chair center offsets (relative to the table's top-left corner).
 *
 * - `circle`: chairs evenly distributed in a ring around the table.
 * - `square` / `rounded`: chairs distributed across the four sides so the
 *   count always matches capacity. The base count per side is
 *   `floor(capacity / 4)` and the remainder is placed on opposite sides first
 *   (top, then bottom, then right), so e.g. capacity 6 → 2 top / 2 bottom /
 *   1 right / 1 left. Chairs on a side are evenly spaced along that side.
 */
export function chairOffsets(
  shape: TableShape,
  capacity: number,
  width: number,
  height: number
): Point[] {
  const positions: Point[] = [];

  if (shape === 'circle') {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;
    for (let i = 0; i < capacity; i++) {
      const angle = (Math.PI * 2 * i) / capacity;
      positions.push({
        x: cx + Math.cos(angle) * (radius + CHAIR_GAP),
        y: cy + Math.sin(angle) * (radius + CHAIR_GAP)
      });
    }
    return positions;
  }

  // square & rounded: distribute `capacity` chairs across the four sides.
  const base = Math.floor(capacity / 4);
  const remainder = capacity % 4;
  const counts = {
    top: base + (remainder >= 1 ? 1 : 0),
    bottom: base + (remainder >= 2 ? 1 : 0),
    right: base + (remainder >= 3 ? 1 : 0),
    left: base
  };

  const along = (count: number, length: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push((length * (i + 1)) / (count + 1));
    }
    return result;
  };

  for (const x of along(counts.top, width)) positions.push({ x, y: -CHAIR_GAP });
  for (const x of along(counts.bottom, width)) positions.push({ x, y: height + CHAIR_GAP });
  for (const y of along(counts.right, height)) positions.push({ x: width + CHAIR_GAP, y });
  for (const y of along(counts.left, height)) positions.push({ x: -CHAIR_GAP, y });

  return positions;
}
