import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import type { Table } from '../api/types';
import TableSelectionOverlay from './table-selection-overlay';

vi.mock('sonner', () => ({
  toast: { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() }
}));

const BLOCKED_MESSAGE = 'No se puede editar o eliminar una mesa reservada u ocupada';

const table: Table = {
  id: 't1',
  name: '101',
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

const rect = { x: 100, y: 80, width: 160, height: 160 };

function renderOverlay(props: Partial<Parameters<typeof TableSelectionOverlay>[0]> = {}) {
  const handlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onResizeStart: vi.fn(),
    onResizeMove: vi.fn(),
    onResizeEnd: vi.fn(),
    toCanvasPoint: vi.fn((x: number, y: number) => ({ x, y }))
  };
  const utils = render(
    <TableSelectionOverlay
      rect={rect}
      table={table}
      onEdit={handlers.onEdit}
      onDelete={handlers.onDelete}
      onResizeStart={handlers.onResizeStart}
      onResizeMove={handlers.onResizeMove}
      onResizeEnd={handlers.onResizeEnd}
      toCanvasPoint={handlers.toCanvasPoint}
      {...props}
    />
  );
  return { ...handlers, ...utils };
}

beforeEach(() => {
  vi.clearAllMocks();
});

it('renders exactly four corner resize handles (no edge/midpoint handles)', () => {
  renderOverlay();

  expect(screen.getByTestId('resize-handle-tl')).toBeInTheDocument();
  expect(screen.getByTestId('resize-handle-tr')).toBeInTheDocument();
  expect(screen.getByTestId('resize-handle-bl')).toBeInTheDocument();
  expect(screen.getByTestId('resize-handle-br')).toBeInTheDocument();
});

it('positions the options tab with a gap from the selection box edge', () => {
  renderOverlay();

  const tab = screen.getByTestId('selection-tab');
  // TAB_OFFSET (20px) gap to the right of the selection box's right edge.
  const gap = parseFloat(tab.style.left) - rect.width;
  expect(gap).toBe(20);
});

it('opens the panel on tab hover without any click', async () => {
  const { onEdit, onDelete } = renderOverlay();

  expect(screen.queryByTestId('selection-panel')).not.toBeInTheDocument();

  await userEvent.hover(screen.getByTestId('selection-tab'));

  expect(screen.getByTestId('selection-panel')).toBeInTheDocument();
  expect(onEdit).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
});

it('shows the table name and status in the panel header', async () => {
  renderOverlay();

  await userEvent.hover(screen.getByTestId('selection-tab'));

  expect(screen.getByTestId('selection-panel-header')).toHaveTextContent('101 · Libre');
});

it('panel actions require an actual click (hover alone does not trigger them)', async () => {
  const { onEdit, onDelete } = renderOverlay();

  await userEvent.hover(screen.getByTestId('selection-tab'));
  expect(onEdit).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /editar mesa/i }));
  expect(onEdit).toHaveBeenCalledWith(table);

  await userEvent.click(screen.getByRole('button', { name: /eliminar mesa/i }));
  expect(onDelete).toHaveBeenCalledWith(table);
});

it('disables edit/delete and shows a toast for a non-AVAILABLE table', async () => {
  const { onEdit, onDelete } = renderOverlay({ table: { ...table, status: 'OCCUPIED' } });

  await userEvent.hover(screen.getByTestId('selection-tab'));

  const editButton = screen.getByRole('button', { name: /editar mesa/i });
  const deleteButton = screen.getByRole('button', { name: /eliminar mesa/i });
  expect(editButton).toHaveAttribute('aria-disabled', 'true');
  expect(deleteButton).toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(editButton);
  expect(toast.warning).toHaveBeenCalledWith(BLOCKED_MESSAGE);
  expect(onEdit).not.toHaveBeenCalled();

  await userEvent.click(deleteButton);
  expect(toast.warning).toHaveBeenCalledWith(BLOCKED_MESSAGE);
  expect(onDelete).not.toHaveBeenCalled();
});

it('drives resize through the corner handles with canvas-coordinate pointers', async () => {
  const { onResizeStart, onResizeMove, onResizeEnd, toCanvasPoint } = renderOverlay();

  const handle = screen.getByTestId('resize-handle-br');
  const pointer = (type: string, clientX: number, clientY: number) =>
    fireEvent(handle, new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true }));

  pointer('pointerdown', 260, 240);
  expect(onResizeStart).toHaveBeenCalledWith('br');

  pointer('pointermove', 300, 300);
  expect(toCanvasPoint).toHaveBeenCalledWith(300, 300);
  expect(onResizeMove).toHaveBeenCalledWith('br', { x: 300, y: 300 });

  pointer('pointerup', 300, 300);
  expect(onResizeEnd).toHaveBeenCalledWith('br', { x: 300, y: 300 });
});

it('applies the resize on the first gesture (no stale active-corner closure)', () => {
  const { onResizeStart, onResizeMove, onResizeEnd } = renderOverlay();
  const handle = screen.getByTestId('resize-handle-br');

  // Dispatch the full pointer sequence back-to-back (raw, no act flush) to
  // simulate a fast drag where pointermove/up can arrive before a re-render.
  const fire = (type: string, clientX: number, clientY: number) =>
    handle.dispatchEvent(
      new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true })
    );

  fire('pointerdown', 260, 240);
  fire('pointermove', 300, 300);
  fire('pointerup', 300, 300);

  expect(onResizeStart).toHaveBeenCalledWith('br');
  expect(onResizeMove).toHaveBeenCalledWith('br', { x: 300, y: 300 });
  expect(onResizeEnd).toHaveBeenCalledWith('br', { x: 300, y: 300 });
});
