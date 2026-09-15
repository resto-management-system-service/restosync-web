import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Table } from '../api/types';
import { MAX_ZOOM } from '../lib/canvas-view';
import TableMapCanvas from './table-map-canvas';

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get: () => 800
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get: () => 600
});

let stageHandlers: {
  onMouseDown?: (e: { target: { getStage: () => unknown } }) => void;
  onMouseUp?: (e: { target: { getStage: () => unknown } }) => void;
  onWheel?: (e: {
    evt: { preventDefault: () => void; deltaY: number };
    target: { getStage: () => unknown };
  }) => void;
} = {};

vi.mock('react-konva', () => ({
  Stage: ({
    children,
    onMouseDown,
    onMouseUp,
    onWheel
  }: {
    children?: React.ReactNode;
    onMouseDown?: (e: { target: { getStage: () => unknown } }) => void;
    onMouseUp?: (e: { target: { getStage: () => unknown } }) => void;
    onWheel?: (e: {
      evt: { preventDefault: () => void; deltaY: number };
      target: { getStage: () => unknown };
    }) => void;
  }) => {
    stageHandlers = { onMouseDown, onMouseUp, onWheel };
    return <div data-testid='stage'>{children}</div>;
  },
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
    onResizeEnd,
    onEditRequest
  }: {
    table: Table;
    onDragEnd: (id: string, x: number, y: number) => void;
    onResize: (id: string, width: number, height: number) => void;
    onResizeEnd: (id: string, width: number, height: number) => void;
    onEditRequest: (table: Table) => void;
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
      <button type='button' onClick={() => onEditRequest(table)}>
        {`edit-${table.id}`}
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

beforeEach(() => {
  stageHandlers = {};
});

describe('TableMapCanvas drag/resize persistence', () => {
  it('persists layout only on drag-end / resize-end, not on resize-move', async () => {
    const onUpdateTable = vi.fn();
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={onUpdateTable}
        onSelectTable={() => {}}
        onEditRequest={() => {}}
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
        onEditRequest={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    expect(screen.getByTestId('shape-t1')).toBeInTheDocument();
    expect(screen.queryByTestId('shape-t2')).not.toBeInTheDocument();
  });

  it('forwards onEditRequest from a table body click', async () => {
    const onEditRequest = vi.fn();
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={() => {}}
        onSelectTable={() => {}}
        onEditRequest={onEditRequest}
        onDeleteRequest={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'edit-t1' }));
    expect(onEditRequest).toHaveBeenCalledWith(table);
  });
});

describe('TableMapCanvas zoom/pan', () => {
  it('enables stage pan from empty space and disables it over a table', () => {
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={() => {}}
        onSelectTable={() => {}}
        onEditRequest={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    const stage = { draggable: vi.fn(), getStage: () => stage };

    // mousedown on empty canvas → stage becomes draggable (pan)
    stageHandlers.onMouseDown?.({ target: stage });
    expect(stage.draggable).toHaveBeenCalledWith(true);

    // mousedown on a table → stage is NOT draggable (table drags instead)
    stageHandlers.onMouseDown?.({ target: { getStage: () => stage } });
    expect(stage.draggable).toHaveBeenCalledWith(false);

    // mouseup always ends panning
    stageHandlers.onMouseUp?.({ target: stage });
    expect(stage.draggable).toHaveBeenCalledWith(false);
  });

  it('clamps zoom to MAX_ZOOM when a wheel event zooms in beyond the bound', () => {
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={() => {}}
        onSelectTable={() => {}}
        onEditRequest={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    const stage = {
      getPointerPosition: () => ({ x: 400, y: 300 }),
      scaleX: () => 2.9,
      x: () => 0,
      y: () => 0,
      scale: vi.fn(),
      position: vi.fn(),
      width: vi.fn(),
      height: vi.fn()
    };

    stageHandlers.onWheel?.({
      evt: { preventDefault: vi.fn(), deltaY: -100 },
      target: { getStage: () => stage }
    });

    // 2.9 * ZOOM_STEP ≈ 3.19, clamped to MAX_ZOOM
    expect(stage.scale).toHaveBeenCalledWith({ x: MAX_ZOOM, y: MAX_ZOOM });
  });

  it('zooms without resizing the stage viewport (background stays fixed)', () => {
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={() => {}}
        onSelectTable={() => {}}
        onEditRequest={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    const stage = {
      getPointerPosition: () => ({ x: 400, y: 300 }),
      scaleX: () => 1,
      x: () => 0,
      y: () => 0,
      scale: vi.fn(),
      position: vi.fn(),
      width: vi.fn(),
      height: vi.fn()
    };

    stageHandlers.onWheel?.({
      evt: { preventDefault: vi.fn(), deltaY: -100 },
      target: { getStage: () => stage }
    });

    // Zooming must change scale/position, but never the viewport dimensions.
    expect(stage.scale).toHaveBeenCalled();
    expect(stage.position).toHaveBeenCalled();
    expect(stage.width).not.toHaveBeenCalled();
    expect(stage.height).not.toHaveBeenCalled();
  });

  it('renders the background as CSS on the container, not as a scaled Konva shape', () => {
    render(
      <TableMapCanvas
        tables={[table]}
        editing
        onUpdateTable={() => {}}
        onSelectTable={() => {}}
        onEditRequest={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    expect(screen.getByTestId('table-map-canvas')).toHaveClass('bg-slate-50');
  });
});
