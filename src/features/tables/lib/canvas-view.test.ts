import { describe, expect, it } from 'vitest';
import {
  MAX_CANVAS_HEIGHT,
  MAX_TABLE_SIZE,
  MAX_ZOOM,
  MIN_CANVAS_HEIGHT,
  MIN_TABLE_SIZE,
  MIN_ZOOM,
  clampCanvasHeight,
  clampZoom,
  computeCornerResize,
  computeFit,
  computeResize,
  oppositeCorner,
  screenToWorld,
  zoomAtPoint
} from './canvas-view';

describe('clampZoom', () => {
  it('keeps scale within the allowed range', () => {
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(100)).toBe(MAX_ZOOM);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(-5)).toBe(MIN_ZOOM);
  });
});

describe('clampCanvasHeight', () => {
  it('clamps height within [MIN_CANVAS_HEIGHT, MAX_CANVAS_HEIGHT]', () => {
    expect(clampCanvasHeight(100)).toBe(MIN_CANVAS_HEIGHT);
    expect(clampCanvasHeight(500)).toBe(500);
    expect(clampCanvasHeight(1000)).toBe(MAX_CANVAS_HEIGHT);
    expect(clampCanvasHeight(MIN_CANVAS_HEIGHT)).toBe(MIN_CANVAS_HEIGHT);
    expect(clampCanvasHeight(MAX_CANVAS_HEIGHT)).toBe(MAX_CANVAS_HEIGHT);
  });
});

describe('zoomAtPoint', () => {
  it('zooms in toward the pointer and clamps at MAX_ZOOM', () => {
    const result = zoomAtPoint(1, { x: 0, y: 0 }, { x: 400, y: 300 }, 2);

    expect(result.scale).toBe(2);
    // The world point under the pointer stays fixed: pointer - world * newScale
    expect(result.position.x).toBe(400 - ((400 - 0) / 1) * 2);
    expect(result.position.y).toBe(300 - ((300 - 0) / 1) * 2);
  });

  it('clamps scale to MAX_ZOOM when wheel events exceed it', () => {
    // A huge zoom-in factor must not exceed MAX_ZOOM.
    const result = zoomAtPoint(2.9, { x: 0, y: 0 }, { x: 400, y: 300 }, 10);
    expect(result.scale).toBe(MAX_ZOOM);
  });

  it('clamps scale to MIN_ZOOM when zooming out too far', () => {
    const result = zoomAtPoint(0.4, { x: 0, y: 0 }, { x: 400, y: 300 }, 0.0001);
    expect(result.scale).toBe(MIN_ZOOM);
  });
});

describe('computeFit', () => {
  it('fits and centers the bounds within the viewport', () => {
    const viewport = { width: 1000, height: 800 };
    const result = computeFit({ minX: 100, minY: 100, maxX: 500, maxY: 500 }, viewport);

    // content is 400x400; available is 1000-80=920, 800-80=720 → scale = min(2.3, 1.8) = 1.8
    expect(result.scale).toBeCloseTo(1.8, 10);

    // centered: (viewport - content*scale)/2 - min*scale
    expect(result.position.x).toBeCloseTo((1000 - 400 * 1.8) / 2 - 100 * 1.8, 10);
    expect(result.position.y).toBeCloseTo((800 - 400 * 1.8) / 2 - 100 * 1.8, 10);
  });

  it('clamps the fit scale to MAX_ZOOM for tiny content', () => {
    const viewport = { width: 1000, height: 800 };
    const result = computeFit({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, viewport);
    expect(result.scale).toBe(MAX_ZOOM);
  });

  it('handles zero-area bounds without dividing by zero', () => {
    const viewport = { width: 1000, height: 800 };
    const result = computeFit({ minX: 50, minY: 50, maxX: 50, maxY: 50 }, viewport);
    expect(Number.isFinite(result.scale)).toBe(true);
    expect(Number.isFinite(result.position.x)).toBe(true);
    expect(Number.isFinite(result.position.y)).toBe(true);
  });
});

describe('screenToWorld', () => {
  it('undoes the stage scale + position', () => {
    expect(screenToWorld({ x: 200, y: 150 }, 2, { x: 100, y: 50 })).toEqual({ x: 50, y: 50 });
  });
});

describe('oppositeCorner', () => {
  it('maps each corner to its diagonal opposite', () => {
    expect(oppositeCorner('tl')).toBe('br');
    expect(oppositeCorner('br')).toBe('tl');
    expect(oppositeCorner('tr')).toBe('bl');
    expect(oppositeCorner('bl')).toBe('tr');
  });
});

describe('computeCornerResize', () => {
  it('scales a square proportionally (aspect ratio never changes)', () => {
    const result = computeCornerResize(
      { x: 0, y: 0 },
      { x: 200, y: 200 },
      { width: 100, height: 100 }
    );
    expect(result).toEqual({ width: 200, height: 200 });
    expect(result.width / result.height).toBeCloseTo(1, 10);
  });

  it('preserves a non-square aspect ratio while resizing', () => {
    // 100x50 (aspect 2:1) — dragging diagonally must keep 2:1.
    const result = computeCornerResize(
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { width: 100, height: 50 }
    );
    expect(result.width / result.height).toBeCloseTo(2, 10);
  });

  it('clamps the size to MIN_TABLE_SIZE', () => {
    const result = computeCornerResize({ x: 0, y: 0 }, { x: 1, y: 1 }, { width: 100, height: 100 });
    expect(result.width).toBe(MIN_TABLE_SIZE);
    expect(result.height).toBe(MIN_TABLE_SIZE);
  });

  it('clamps the size to MAX_TABLE_SIZE', () => {
    const result = computeCornerResize(
      { x: 0, y: 0 },
      { x: 100000, y: 100000 },
      { width: 100, height: 100 }
    );
    expect(result.width).toBe(MAX_TABLE_SIZE);
    expect(result.height).toBe(MAX_TABLE_SIZE);
  });
});

describe('computeResize', () => {
  const rect = { x: 100, y: 100, width: 100, height: 100 };

  it('keeps the top-left anchor fixed when dragging the bottom-right corner', () => {
    const result = computeResize('br', { x: 250, y: 250 }, rect);
    expect(result).toEqual({ x: 100, y: 100, width: 150, height: 150 });
  });

  it('keeps the bottom-right anchor fixed when dragging the top-left corner', () => {
    const result = computeResize('tl', { x: 50, y: 50 }, rect);
    expect(result).toEqual({ x: 50, y: 50, width: 150, height: 150 });
  });

  it('keeps the bottom-left anchor fixed when dragging the top-right corner', () => {
    const result = computeResize('tr', { x: 250, y: 50 }, rect);
    expect(result).toEqual({ x: 100, y: 50, width: 150, height: 150 });
  });

  it('keeps the top-right anchor fixed when dragging the bottom-left corner', () => {
    const result = computeResize('bl', { x: 50, y: 250 }, rect);
    expect(result).toEqual({ x: 50, y: 100, width: 150, height: 150 });
  });

  it('never distorts the aspect ratio for circle or square shapes', () => {
    for (const corner of ['tl', 'tr', 'bl', 'br'] as const) {
      const result = computeResize(corner, { x: 300, y: 10 }, rect);
      expect(result.width / result.height).toBeCloseTo(1, 10);
    }
  });
});
