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

vi.mock('react-konva', () => ({
  Group: ({
    id,
    name,
    onMouseDown,
    onClick,
    onTap,
    onDragMove,
    onDragEnd,
    children
  }: {
    id?: string;
    name?: string;
    onMouseDown?: Handler;
    onClick?: Handler;
    onTap?: Handler;
    onDragMove?: Handler;
    onDragEnd?: (e: DragEvent) => void;
    children?: React.ReactNode;
  }) => {
    if (name) groupHandlers[name] = { id, onMouseDown, onClick, onTap, onDragMove, onDragEnd };
    return <div data-testid={name}>{children}</div>;
  },
  Circle: () => <div />,
  Rect: () => <div />,
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
});

it('gives the body group an id so the canvas can find it for the selection overlay', () => {
  renderShape();

  expect(groupHandlers['table-body'].id).toBe('table-t1');
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

it('updates the label geometry when the shape is resized (no desync)', () => {
  const { rerender } = renderShape({ width: 100, height: 100 });
  expect(textProps['T1'].fontSize).toBe(computeLabelFontSize(100, 100));

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
});
