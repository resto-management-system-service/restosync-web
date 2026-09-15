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

/** Minimum zoom scale (can't zoom out to nothing). */
export const MIN_ZOOM = 0.3;
/** Maximum zoom scale (can't zoom in absurdly far). */
export const MAX_ZOOM = 3;
/** Zoom factor per wheel notch. */
export const ZOOM_STEP = 1.1;
/** Padding (px) applied when fitting content to the viewport. */
export const FIT_PADDING = 40;

/** Clamp a scale to the allowed zoom range. */
export function clampZoom(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
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
