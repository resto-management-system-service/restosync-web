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

/** Semantic fill/stroke colors per table status (Tailwind green/amber/red). */
export const STATUS_COLORS: Record<TableStatus, { fill: string; stroke: string; label: string }> = {
  AVAILABLE: { fill: '#22c55e', stroke: '#15803d', label: '#ffffff' },
  RESERVED: { fill: '#f59e0b', stroke: '#b45309', label: '#ffffff' },
  OCCUPIED: { fill: '#ef4444', stroke: '#b91c1c', label: '#ffffff' }
};

export const CHAIR_COLOR = { fill: '#f8fafc', stroke: '#94a3b8' };

/** Distance (px) from a table's edge to the center of its chairs. */
const CHAIR_GAP = 10;
/** Radius (px) of a chair mark. */
export const CHAIR_RADIUS = 4;

interface Point {
  x: number;
  y: number;
}

function pointOnRect(distance: number, width: number, height: number): Point {
  const top = width;
  const right = height;
  const bottom = width;

  if (distance < top) return { x: distance, y: 0 };
  distance -= top;
  if (distance < right) return { x: width, y: distance };
  distance -= right;
  if (distance < bottom) return { x: width - distance, y: height };
  distance -= bottom;
  return { x: 0, y: height - distance };
}

/**
 * Compute chair center offsets (relative to the table's top-left corner)
 * for `capacity` chairs distributed evenly around the table's perimeter.
 */
export function chairOffsets(
  shape: TableShape,
  capacity: number,
  width: number,
  height: number
): Point[] {
  const cx = width / 2;
  const cy = height / 2;
  const positions: Point[] = [];

  if (shape === 'circle') {
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

  // 'rounded' and 'square' both distribute chairs around the rectangle perimeter.
  const perimeter = 2 * (width + height);
  for (let i = 0; i < capacity; i++) {
    const distance = ((i + 0.5) / capacity) * perimeter;
    const point = pointOnRect(distance, width, height);
    const dx = point.x - cx;
    const dy = point.y - cy;
    const length = Math.hypot(dx, dy) || 1;
    positions.push({
      x: point.x + (dx / length) * CHAIR_GAP,
      y: point.y + (dy / length) * CHAIR_GAP
    });
  }
  return positions;
}
