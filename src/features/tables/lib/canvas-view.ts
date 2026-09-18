// ============================================================
// Canvas View Helpers — zoom/pan math (pure, view-layer only)
// ============================================================
// Zoom/pan is a client-side viewing convenience. It never touches table data
// (positionX/positionY/width/height), which remains percentage-based.

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** A corner of a table's bounding box. */
export type Corner = 'tl' | 'tr' | 'bl' | 'br';

/** A rectangle in world (unscaled) canvas coordinates. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Minimum zoom scale (can't zoom out to nothing). */
export const MIN_ZOOM = 0.3;
/** Maximum zoom scale (can't zoom in absurdly far). */
export const MAX_ZOOM = 3;
/** Zoom factor per wheel notch. */
export const ZOOM_STEP = 1.1;
/** Padding (px) applied when fitting content to the viewport. */
export const FIT_PADDING = 40;

/** Minimum table size (world px) — tables can never shrink below this. */
export const MIN_TABLE_SIZE = 40;
/** Maximum table size (world px) — tables can never grow beyond this. */
export const MAX_TABLE_SIZE = 400;

/** Minimum height (px) the canvas container can be resized to. */
export const MIN_CANVAS_HEIGHT = 300;
/** Maximum height (px) the canvas container can be resized to. */
export const MAX_CANVAS_HEIGHT = 750;
/** Default canvas container height (px). */
export const DEFAULT_CANVAS_HEIGHT = 480;

/** Clamp a scale to the allowed zoom range. */
export function clampZoom(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

/** Clamp a canvas container height to [MIN_CANVAS_HEIGHT, MAX_CANVAS_HEIGHT]. */
export function clampCanvasHeight(height: number): number {
  return Math.min(MAX_CANVAS_HEIGHT, Math.max(MIN_CANVAS_HEIGHT, height));
}

/**
 * Compute the new scale/position when zooming by `factor` toward `pointer`.
 * Standard Konva wheel-zoom math: keeps the world point under the cursor fixed.
 */
export function zoomAtPoint(
  scale: number,
  position: Point,
  pointer: Point,
  factor: number
): { scale: number; position: Point } {
  const nextScale = clampZoom(scale * factor);
  const worldX = (pointer.x - position.x) / scale;
  const worldY = (pointer.y - position.y) / scale;

  return {
    scale: nextScale,
    position: {
      x: pointer.x - worldX * nextScale,
      y: pointer.y - worldY * nextScale
    }
  };
}

/**
 * Compute the scale/position that fits `bounds` within `viewport`, centered
 * with `FIT_PADDING` of breathing room. Scale is clamped to the zoom range.
 */
export function computeFit(
  bounds: Bounds,
  viewport: { width: number; height: number }
): { scale: number; position: Point } {
  const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const availableWidth = Math.max(viewport.width - FIT_PADDING * 2, 1);
  const availableHeight = Math.max(viewport.height - FIT_PADDING * 2, 1);

  const scale = clampZoom(Math.min(availableWidth / contentWidth, availableHeight / contentHeight));

  return {
    scale,
    position: {
      x: (viewport.width - contentWidth * scale) / 2 - bounds.minX * scale,
      y: (viewport.height - contentHeight * scale) / 2 - bounds.minY * scale
    }
  };
}

/** Convert a point from screen (container) coordinates to world (unscaled) coordinates. */
export function screenToWorld(point: Point, scale: number, position: Point): Point {
  return { x: (point.x - position.x) / scale, y: (point.y - position.y) / scale };
}

/** The corner diagonally opposite `corner`. */
export function oppositeCorner(corner: Corner): Corner {
  switch (corner) {
    case 'tl':
      return 'br';
    case 'br':
      return 'tl';
    case 'tr':
      return 'bl';
    case 'bl':
      return 'tr';
  }
}

/** The world-coordinate position of `corner` on `rect`. */
export function cornerPoint(corner: Corner, rect: Rect): Point {
  switch (corner) {
    case 'tl':
      return { x: rect.x, y: rect.y };
    case 'tr':
      return { x: rect.x + rect.width, y: rect.y };
    case 'bl':
      return { x: rect.x, y: rect.y + rect.height };
    case 'br':
      return { x: rect.x + rect.width, y: rect.y + rect.height };
  }
}

/**
 * Compute a proportional corner resize. The opposite corner (`anchor`) stays
 * fixed while the dragged corner follows `pointer`. The aspect ratio of
 * `currentSize` is always preserved, and the long edge is clamped to
 * [MIN_TABLE_SIZE, MAX_TABLE_SIZE] — a circle stays a circle and a square stays
 * a square, never an oval or rectangle.
 */
export function computeCornerResize(
  anchor: Point,
  pointer: Point,
  currentSize: { width: number; height: number }
): { width: number; height: number } {
  const dw = Math.abs(pointer.x - anchor.x);
  const dh = Math.abs(pointer.y - anchor.y);

  if (currentSize.width <= 0 || currentSize.height <= 0) {
    return { width: MIN_TABLE_SIZE, height: MIN_TABLE_SIZE };
  }

  // Lock the current aspect ratio; scale by the dominant axis so the dragged
  // corner tracks the pointer without distortion.
  const aspect = currentSize.width / currentSize.height;
  const scale = Math.max(dw / currentSize.width, dh / currentSize.height);
  const width = Math.min(MAX_TABLE_SIZE, Math.max(MIN_TABLE_SIZE, currentSize.width * scale));
  const height = width / aspect;

  return { width, height };
}

/**
 * Compute the full new world rect for a corner resize, keeping the anchor
 * (opposite) corner fixed in place. Pure and testable — never inlined in a
 * Konva event handler.
 */
export function computeResize(corner: Corner, pointer: Point, current: Rect): Rect {
  const anchorCorner = oppositeCorner(corner);
  const anchor = cornerPoint(anchorCorner, current);
  const size = computeCornerResize(anchor, pointer, {
    width: current.width,
    height: current.height
  });

  switch (corner) {
    case 'br':
      return { x: current.x, y: current.y, width: size.width, height: size.height };
    case 'tl':
      return {
        x: anchor.x - size.width,
        y: anchor.y - size.height,
        width: size.width,
        height: size.height
      };
    case 'tr':
      return {
        x: current.x,
        y: anchor.y - size.height,
        width: size.width,
        height: size.height
      };
    case 'bl':
      return {
        x: anchor.x - size.width,
        y: current.y,
        width: size.width,
        height: size.height
      };
  }
}
