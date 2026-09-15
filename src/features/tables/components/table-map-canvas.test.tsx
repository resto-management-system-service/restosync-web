import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Table } from '../api/types';
import TableMapCanvas from './table-map-canvas';

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get: () => 800
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get: () => 600
});

vi.mock('react-konva', () => ({
  Stage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Layer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Rect: () => <div />,
  Group: () => <div />,
  Circle: () => <div />,
  Text: () => <div />
}));

vi.mock('./table-shape', () => ({
  default: ({
    table,
    onDragEnd,
    onResize,
    onResizeEnd
  }: {
    table: Table;
    onDragEnd: (id: string, x: number, y: number) => void;
    onResize: (id: string, width: number, height: number) => void;
    onResizeEnd: (id: string, width: number, height: number) => void;
  }) => (
    <div data-testid={`shape-${table.id}`}>
      <button type='button' onClick={() => onDragEnd(table.id, 400, 300)}>
        drag-end
      </button>
      <button type='button' onClick={() => onResize(table.id, 200, 150)}>
        resize-move
      </button>
      <button type='button' onClick={() => onResizeEnd(table.id, 200, 150)}>
        resize-end
      </button>
    </div>
  )
}));

const table: Table = {
  id: 't1',
  name: 'T1',
  capacity: 4,
  status: 'AVAILABLE',
  restaurantId: 'r1',
  zoneId: 'z1',
  positionX: 0.25,
  positionY: 0.25,
  width: 0.2,
  height: 0.2,
  shape: 'circle',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('TableMapCanvas drag/resize persistence', () => {
  it('persists layout only on drag-end / resize-end, not on resize-move', async () => {
    const onUpdateTable = vi.fn();
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={onUpdateTable}
        onSelectTable={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'resize-move' }));
    expect(onUpdateTable).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'drag-end' }));
    expect(onUpdateTable).toHaveBeenCalledTimes(1);
    expect(onUpdateTable).toHaveBeenCalledWith('t1', { positionX: 0.5, positionY: 0.5 });

    await userEvent.click(screen.getByRole('button', { name: 'resize-end' }));
    expect(onUpdateTable).toHaveBeenCalledTimes(2);
    expect(onUpdateTable).toHaveBeenLastCalledWith('t1', { width: 0.25, height: 0.25 });
  });

  it('skips tables that have no position/size', () => {
    const onUpdateTable = vi.fn();
    const unplaced: Table = {
      ...table,
      id: 't2',
      positionX: null,
      positionY: null,
      width: null,
      height: null
    };

    render(
      <TableMapCanvas
        tables={[table, unplaced]}
        editing
        onUpdateTable={onUpdateTable}
        onSelectTable={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    expect(screen.getByTestId('shape-t1')).toBeInTheDocument();
    expect(screen.queryByTestId('shape-t2')).not.toBeInTheDocument();
  });
});
