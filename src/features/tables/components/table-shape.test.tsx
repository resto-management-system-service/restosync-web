import { beforeEach, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Table } from '../api/types';
import { computeLabelFontSize } from '../lib/layout';
import TableShape from './table-shape';

type Handler = (e?: { cancelBubble: boolean }) => void;

interface MockNode {
  x: () => number;
  y: () => number;
  getStage: () => null;
}

interface DragEvent {
  target: MockNode;
  currentTarget?: MockNode;
  cancelBubble: boolean;
}

const groupHandlers: Record<
  string,
  {
    id?: string;
    onMouseDown?: Handler;
    onClick?: Handler;
    onTap?: Handler;
    onDragMove?: Handler;
    onDragEnd?: (e: DragEvent) => void;
  }
> = {};

const textProps: Record<
  string,
  {
    text?: string;
    fontSize?: number;
    width?: number;
    height?: number;
    align?: string;
    verticalAlign?: string;
  }
> = {};

const shapeIds: string[] = [];
const shapeListening: Record<string, boolean | undefined> = {};
const chairPositions: Array<{ x: number; y: number }> = [];
let chairGroupListening: boolean | undefined;

vi.mock('react-konva', () => ({
  Group: ({
    id,
    name,
    x,
    y,
    listening,
    onMouseDown,
    onClick,
    onTap,
    onDragMove,
    onDragEnd,
    children
  }: {
    id?: string;
    name?: string;
    x?: number;
    y?: number;
    listening?: boolean;
    onMouseDown?: Handler;
    onClick?: Handler;
    onTap?: Handler;
    onDragMove?: Handler;
    onDragEnd?: (e: DragEvent) => void;
    children?: React.ReactNode;
  }) => {
    if (name === 'table-body') {
      groupHandlers[name] = { id, onMouseDown, onClick, onTap, onDragMove, onDragEnd };
    }
    if (name === 'table-chair') {
      chairPositions.push({ x: x ?? 0, y: y ?? 0 });
      chairGroupListening = listening;
    }
    return <div data-testid={name}>{children}</div>;
  },
  Circle: ({ id, radius, listening }: { id?: string; radius?: number; listening?: boolean }) => {
    if (id) {
      shapeIds.push(id);
      shapeListening[id] = listening;
    }
    return <div data-radius={radius} />;
  },
  Rect: ({
    id,
    width,
    height,
    listening
  }: {
    id?: string;
    width?: number;
    height?: number;
    listening?: boolean;
  }) => {
    if (id) {
      shapeIds.push(id);
      shapeListening[id] = listening;
    }
    return <div data-width={width} data-height={height} />;
  },
  Text: ({
    text,
    fontSize,
    width,
    height,
    align,
    verticalAlign
  }: {
    text?: string;
    fontSize?: number;
    width?: number;
    height?: number;
    align?: string;
    verticalAlign?: string;
  }) => {
    if (text) textProps[text] = { text, fontSize, width, height, align, verticalAlign };
    return <div />;
  }
}));

const table: Table = {
  id: 't1',
  name: 'T1',
  capacity: 4,
  status: 'AVAILABLE',
  restaurantId: 'r1',
  zoneId: 'z1',
  positionX: 0.2,
  positionY: 0.2,
  width: 0.16,
  height: 0.16,
  shape: 'circle',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

function renderShape(props: Partial<Parameters<typeof TableShape>[0]> = {}) {
  return render(
    <TableShape
      table={table}
      x={0}
      y={0}
      width={100}
      height={100}
      editing
      onDragEnd={() => {}}
      onSelect={() => {}}
      {...props}
    />
  );
}

const node = (x: number, y: number): MockNode => ({ x: () => x, y: () => y, getStage: () => null });

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(groupHandlers).forEach((key) => delete groupHandlers[key]);
  Object.keys(textProps).forEach((key) => delete textProps[key]);
  Object.keys(shapeListening).forEach((key) => delete shapeListening[key]);
  shapeIds.length = 0;
  chairPositions.length = 0;
  chairGroupListening = undefined;
});

it('gives the body group an id so the canvas can find it', () => {
  renderShape();
  expect(groupHandlers['table-body'].id).toBe('table-t1');
});

it('gives the rim shape its own id (used for transform-aware selection/resize)', () => {
  renderShape();
  expect(shapeIds).toContain('table-rim-t1');
});

it('keeps the table body hit-testable (rim shape must be listening)', () => {
  renderShape();
  // Konva Groups have no hit region of their own — they rely on a listening
  // descendant shape. If the rim becomes `listening={false}`, clicks/drags fall
  // through to the Stage and pan the canvas instead of selecting/moving the table.
  expect(shapeListening['table-rim-t1']).not.toBe(false);
});

it('keeps the square rim listening too', () => {
  renderShape({ table: { ...table, shape: 'square' } });
  expect(shapeListening['table-rim-t1']).not.toBe(false);
});

it('keeps chairs non-interactive (their group stays listening=false)', () => {
  renderShape({ table: { ...table, capacity: 4 } });
  expect(chairGroupListening).toBe(false);
});

it('calls onSelect when clicking the body in edit mode (selection, not edit sheet)', () => {
  const onSelect = vi.fn();
  renderShape({ onSelect });

  groupHandlers['table-body'].onClick?.();

  expect(onSelect).toHaveBeenCalledWith(table);
});

it('selects on mousedown in edit mode so click-and-drag also selects', () => {
  const onSelect = vi.fn();
  renderShape({ onSelect });

  groupHandlers['table-body'].onMouseDown?.();

  expect(onSelect).toHaveBeenCalledWith(table);
});

it('does not select on mousedown in view mode (click/tap only)', () => {
  const onSelect = vi.fn();
  renderShape({ editing: false, onSelect });

  groupHandlers['table-body'].onMouseDown?.();
  expect(onSelect).not.toHaveBeenCalled();

  groupHandlers['table-body'].onClick?.();
  expect(onSelect).toHaveBeenCalledWith(table);
});

it('dragging the body persists the new position via onDragEnd', () => {
  const onDragEnd = vi.fn();
  renderShape({ onDragEnd });

  const body = node(120, 90);
  groupHandlers['table-body'].onDragEnd?.({
    target: body,
    currentTarget: body,
    cancelBubble: false
  });

  expect(onDragEnd).toHaveBeenCalledWith('t1', 120, 90);
});

it('fires onDragMove on body drag so the selection overlay can re-sync', () => {
  const onDragMove = vi.fn();
  renderShape({ onDragMove });

  groupHandlers['table-body'].onDragMove?.();

  expect(onDragMove).toHaveBeenCalledWith('t1');
});

it('renders one chair per capacity for a circle table', () => {
  renderShape({ table: { ...table, shape: 'circle', capacity: 6 } });
  expect(chairPositions).toHaveLength(6);
});

it('caps square chairs at 4 (one per side)', () => {
  renderShape({ table: { ...table, shape: 'square', capacity: 8 } });
  expect(chairPositions).toHaveLength(4);
});

it('keeps the label centered and scales its font with the shape size', () => {
  renderShape({ width: 200, height: 200 });

  const label = textProps['T1'];
  expect(label).toBeDefined();
  expect(label.align).toBe('center');
  expect(label.verticalAlign).toBe('middle');
  expect(label.width).toBe(200);
  expect(label.height).toBe(200);
  expect(label.fontSize).toBe(computeLabelFontSize(200, 200));
});

it('updates label geometry and chair positions together on resize (no desync)', () => {
  const { rerender } = renderShape({ width: 100, height: 100 });
  expect(textProps['T1'].fontSize).toBe(computeLabelFontSize(100, 100));
  expect(chairPositions).toHaveLength(4);
  const firstChair = chairPositions[0];

  rerender(
    <TableShape
      table={table}
      x={0}
      y={0}
      width={300}
      height={300}
      editing
      onDragEnd={() => {}}
      onSelect={() => {}}
    />
  );

  expect(textProps['T1'].fontSize).toBe(computeLabelFontSize(300, 300));
  expect(textProps['T1'].width).toBe(300);
  expect(textProps['T1'].height).toBe(300);
  // The circle chair ring re-derives from the new size (4 more chairs pushed).
  expect(chairPositions).toHaveLength(8);
  expect(chairPositions[4]).not.toEqual(firstChair);
});
