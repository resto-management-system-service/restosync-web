import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
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

const state = vi.hoisted(() => ({
  stageHandlers: {} as {
    onMouseDown?: (e: { target: { getStage: () => unknown } }) => void;
    onMouseUp?: (e: { target: { getStage: () => unknown } }) => void;
    onWheel?: (e: {
      evt: { preventDefault: () => void; deltaY: number };
      target: { getStage: () => unknown };
    }) => void;
  },
  shapeProps: {} as Record<string, { x: number; y: number }>,
  overlay: {
    rect: null as null | { x: number; y: number; width: number; height: number },
    onResizeStart: null as null | ((corner: string) => void),
    onResizeMove: null as null | ((corner: string, pointer: { x: number; y: number }) => void),
    onResizeEnd: null as null | ((corner: string, pointer: { x: number; y: number }) => void)
  },
  mockStage: {
    findOne: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    scaleX: vi.fn(() => 1),
    x: vi.fn(() => 0),
    y: vi.fn(() => 0),
    scale: vi.fn(),
    position: vi.fn(),
    draggable: vi.fn(),
    getPointerPosition: vi.fn(() => ({ x: 400, y: 300 }))
  }
}));

vi.mock('./table-selection-overlay', () => ({
  default: ({
    rect,
    onResizeStart,
    onResizeMove,
    onResizeEnd
  }: {
    rect: { x: number; y: number; width: number; height: number };
    onResizeStart: (corner: string) => void;
    onResizeMove: (corner: string, pointer: { x: number; y: number }) => void;
    onResizeEnd: (corner: string, pointer: { x: number; y: number }) => void;
  }) => {
    state.overlay.rect = rect;
    state.overlay.onResizeStart = onResizeStart;
    state.overlay.onResizeMove = onResizeMove;
    state.overlay.onResizeEnd = onResizeEnd;
    return <div data-testid='selection-overlay' />;
  }
}));

vi.mock('react-konva', () => ({
  Stage: ({
    children,
    ref,
    onMouseDown,
    onMouseUp,
    onWheel
  }: {
    children?: React.ReactNode;
    ref?: React.Ref<unknown>;
    onMouseDown?: (e: { target: { getStage: () => unknown } }) => void;
    onMouseUp?: (e: { target: { getStage: () => unknown } }) => void;
    onWheel?: (e: {
      evt: { preventDefault: () => void; deltaY: number };
      target: { getStage: () => unknown };
    }) => void;
  }) => {
    state.stageHandlers = { onMouseDown, onMouseUp, onWheel };
    if (ref) {
      if (typeof ref === 'function') ref(state.mockStage);
      else (ref as React.MutableRefObject<unknown>).current = state.mockStage;
    }
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
    x,
    y,
    onDragEnd,
    onDragMove,
    onSelect
  }: {
    table: Table;
    x: number;
    y: number;
    onDragEnd: (id: string, x: number, y: number) => void;
    onDragMove: (id: string) => void;
    onSelect: (table: Table) => void;
  }) => {
    state.shapeProps[table.id] = { x, y };
    return (
      <div data-testid={`shape-${table.id}`}>
        <button type='button' onClick={() => onDragEnd(table.id, 400, 300)}>
          drag-end
        </button>
        <button type='button' onClick={() => onDragMove(table.id)}>
          drag-move
        </button>
        <button type='button' onClick={() => onSelect(table)}>
          select
        </button>
      </div>
    );
  }
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

function renderCanvas(props: Partial<Parameters<typeof TableMapCanvas>[0]> = {}) {
  return render(
    <TableMapCanvas
      tables={[table]}
      editing
      selectedTableId={null}
      onSelectedTableIdChange={() => {}}
      onUpdateTable={() => {}}
      onSelectTable={() => {}}
      onEditRequest={() => {}}
      onDeleteRequest={() => {}}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  state.stageHandlers = {};
  Object.keys(state.shapeProps).forEach((key) => delete state.shapeProps[key]);
  state.overlay.rect = null;
  state.overlay.onResizeStart = null;
  state.overlay.onResizeMove = null;
  state.overlay.onResizeEnd = null;
  state.mockStage.scaleX.mockReturnValue(1);
  state.mockStage.x.mockReturnValue(0);
  state.mockStage.y.mockReturnValue(0);
  state.mockStage.getPointerPosition.mockReturnValue({ x: 400, y: 300 });
});

describe('TableMapCanvas selection', () => {
  it('selects the clicked table via onSelectedTableIdChange', async () => {
    const onSelectedTableIdChange = vi.fn();
    renderCanvas({ onSelectedTableIdChange });

    await userEvent.click(
      within(screen.getByTestId('shape-t1')).getByRole('button', { name: 'select' })
    );

    expect(onSelectedTableIdChange).toHaveBeenCalledWith('t1');
  });

  it('deselects when clicking empty canvas space (stage itself)', () => {
    const onSelectedTableIdChange = vi.fn();
    renderCanvas({ onSelectedTableIdChange });

    const stage = { draggable: vi.fn(), getStage: () => stage };
    state.stageHandlers.onMouseDown?.({ target: stage });

    expect(onSelectedTableIdChange).toHaveBeenCalledWith(null);
  });

  it('does not deselect when mousedown starts on a table (not the stage)', () => {
    const onSelectedTableIdChange = vi.fn();
    renderCanvas({ onSelectedTableIdChange });

    const stage = { draggable: vi.fn(), getStage: () => stage };
    state.stageHandlers.onMouseDown?.({ target: { getStage: () => stage } });

    expect(onSelectedTableIdChange).not.toHaveBeenCalled();
  });

  it('positions the overlay from the node getClientRect (real Konva transform)', () => {
    const node = { getClientRect: vi.fn(() => ({ x: 100, y: 100, width: 100, height: 100 })) };
    state.mockStage.findOne.mockReturnValue(node);

    renderCanvas({ selectedTableId: 't1' });

    expect(state.overlay.rect).toEqual({ x: 100, y: 100, width: 100, height: 100 });
  });

  it('locates the rim node (not the chair-including group) for selection/resize', () => {
    const node = { getClientRect: vi.fn(() => ({ x: 100, y: 100, width: 100, height: 100 })) };
    state.mockStage.findOne.mockReturnValue(node);

    renderCanvas({ selectedTableId: 't1' });

    // The group's getClientRect includes chairs (~14px outside the rim); the
    // selection box and resize math must target the rim node instead.
    expect(state.mockStage.findOne).toHaveBeenCalledWith('#table-rim-t1');
  });

  it('recomputes the overlay position after a zoom/pan change', () => {
    const node = { getClientRect: vi.fn(() => ({ x: 100, y: 100, width: 100, height: 100 })) };
    state.mockStage.findOne.mockReturnValue(node);

    renderCanvas({ selectedTableId: 't1' });
    expect(state.overlay.rect).toEqual({ x: 100, y: 100, width: 100, height: 100 });

    // Simulate the rendered position changing under a zoom/pan transform.
    node.getClientRect.mockReturnValue({ x: 250, y: 150, width: 200, height: 200 });
    const wheelListener = state.mockStage.on.mock.calls.find((c) => c[0] === 'wheel')?.[1];
    act(() => {
      (wheelListener as () => void)?.();
    });

    expect(state.overlay.rect).toEqual({ x: 250, y: 150, width: 200, height: 200 });
  });

  it('resizes proportionally through the overlay and persists fractions on end', () => {
    const onUpdateTable = vi.fn();
    const node = { getClientRect: vi.fn(() => ({ x: 100, y: 100, width: 100, height: 100 })) };
    state.mockStage.findOne.mockReturnValue(node);

    renderCanvas({ selectedTableId: 't1', onUpdateTable });

    state.overlay.onResizeStart?.('br');
    state.overlay.onResizeMove?.('br', { x: 250, y: 250 });
    expect(onUpdateTable).not.toHaveBeenCalled();

    state.overlay.onResizeEnd?.('br', { x: 250, y: 250 });

    // World 150x150 at (100,100) → fractions over an 800x600 canvas.
    expect(onUpdateTable).toHaveBeenCalledWith('t1', {
      width: 150 / 800,
      height: 150 / 600,
      positionX: 100 / 800,
      positionY: 100 / 600
    });
  });
});

describe('TableMapCanvas drag persistence', () => {
  it('persists layout on drag-end', async () => {
    const onUpdateTable = vi.fn();
    renderCanvas({ onUpdateTable });

    await userEvent.click(screen.getByRole('button', { name: 'drag-end' }));
    expect(onUpdateTable).toHaveBeenCalledWith('t1', { positionX: 0.5, positionY: 0.5 });
  });

  it('skips tables that have no position/size', () => {
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
        selectedTableId={null}
        onSelectedTableIdChange={() => {}}
        onUpdateTable={() => {}}
        onSelectTable={() => {}}
        onEditRequest={() => {}}
        onDeleteRequest={() => {}}
      />
    );

    expect(screen.getByTestId('shape-t1')).toBeInTheDocument();
    expect(screen.queryByTestId('shape-t2')).not.toBeInTheDocument();
  });

  it('dragging one table updates only that table (other tables remain unchanged)', async () => {
    const onUpdateTable = vi.fn();
    const tableB: Table = { ...table, id: 't2', name: 'T2', positionX: 0.6, positionY: 0.6 };

    renderCanvas({ tables: [table, tableB], onUpdateTable });

    const bInitialX = state.shapeProps['t2'].x;
    expect(state.shapeProps['t1'].x).not.toBe(state.shapeProps['t2'].x);

    await userEvent.click(
      within(screen.getByTestId('shape-t1')).getByRole('button', { name: 'drag-end' })
    );

    expect(onUpdateTable).toHaveBeenCalledWith('t1', { positionX: 0.5, positionY: 0.5 });
    expect(onUpdateTable.mock.calls.every(([id]) => id !== 't2')).toBe(true);
    expect(state.shapeProps['t2'].x).toBe(bInitialX);
  });
});

describe('TableMapCanvas zoom/pan', () => {
  it('enables stage pan from empty space and disables it over a table', () => {
    renderCanvas();

    const stage = { draggable: vi.fn(), getStage: () => stage };

    state.stageHandlers.onMouseDown?.({ target: stage });
    expect(stage.draggable).toHaveBeenCalledWith(true);

    state.stageHandlers.onMouseDown?.({ target: { getStage: () => stage } });
    expect(stage.draggable).toHaveBeenCalledWith(false);

    state.stageHandlers.onMouseUp?.({ target: stage });
    expect(stage.draggable).toHaveBeenCalledWith(false);
  });

  it('clamps zoom to MAX_ZOOM when a wheel event zooms in beyond the bound', () => {
    renderCanvas();

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

    state.stageHandlers.onWheel?.({
      evt: { preventDefault: vi.fn(), deltaY: -100 },
      target: { getStage: () => stage }
    });

    expect(stage.scale).toHaveBeenCalledWith({ x: MAX_ZOOM, y: MAX_ZOOM });
  });

  it('zooms without resizing the stage viewport (background stays fixed)', () => {
    renderCanvas();

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

    state.stageHandlers.onWheel?.({
      evt: { preventDefault: vi.fn(), deltaY: -100 },
      target: { getStage: () => stage }
    });

    expect(stage.scale).toHaveBeenCalled();
    expect(stage.position).toHaveBeenCalled();
    expect(stage.width).not.toHaveBeenCalled();
    expect(stage.height).not.toHaveBeenCalled();
  });

  it('renders the background as CSS on the container, not as a scaled Konva shape', () => {
    renderCanvas();
    expect(screen.getByTestId('table-map-canvas')).toHaveClass('bg-slate-50');
  });
});
