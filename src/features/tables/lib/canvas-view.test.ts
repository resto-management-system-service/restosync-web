import { describe, expect, it } from 'vitest';
import { MAX_ZOOM, MIN_ZOOM, clampZoom, computeFit, zoomAtPoint } from './canvas-view';

describe('clampZoom', () => {
  it('keeps scale within the allowed range', () => {
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(100)).toBe(MAX_ZOOM);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(-5)).toBe(MIN_ZOOM);
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
