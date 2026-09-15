import { beforeEach, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Table } from '../api/types';
import TableShape from './table-shape';

type Handler = (e: { cancelBubble: boolean }) => void;
const groupHandlers: Record<string, { onClick?: Handler; onTap?: Handler; opacity?: number }> = {};

vi.mock('sonner', () => ({
  toast: { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() }
}));

vi.mock('react-konva', () => ({
  Group: ({
    name,
    onClick,
    onTap,
    opacity,
    children
  }: {
    name?: string;
    onClick?: Handler;
    onTap?: Handler;
    opacity?: number;
    children?: React.ReactNode;
  }) => {
    if (name) groupHandlers[name] = { onClick, onTap, opacity };
    return <div data-testid={name}>{children}</div>;
  },
  Circle: () => <div />,
  Rect: () => <div />,
  Text: () => <div />
}));

import { toast } from 'sonner';

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

const BLOCKED_MESSAGE = 'No se puede editar o eliminar una mesa reservada u ocupada';

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
      onResize={() => {}}
      onResizeEnd={() => {}}
      onSelect={() => {}}
      onEditRequest={() => {}}
      onDeleteRequest={() => {}}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(groupHandlers).forEach((key) => delete groupHandlers[key]);
});

it('calls onEditRequest when clicking the body in edit mode', () => {
  const onEditRequest = vi.fn();
  const onSelect = vi.fn();
  renderShape({ onEditRequest, onSelect });

  groupHandlers['table-body'].onClick?.({ cancelBubble: false });

  expect(onEditRequest).toHaveBeenCalledWith(table);
  expect(onSelect).not.toHaveBeenCalled();
});

it('calls onSelect (not onEditRequest) when clicking the body in view mode', () => {
  const onEditRequest = vi.fn();
  const onSelect = vi.fn();
  renderShape({ editing: false, onEditRequest, onSelect });

  groupHandlers['table-body'].onClick?.({ cancelBubble: false });

  expect(onSelect).toHaveBeenCalledWith(table);
  expect(onEditRequest).not.toHaveBeenCalled();
});

it('clicking the delete button calls onDeleteRequest and does not bubble to edit', () => {
  const onDeleteRequest = vi.fn();
  const onEditRequest = vi.fn();
  renderShape({ onDeleteRequest, onEditRequest });

  const event = { cancelBubble: false };
  groupHandlers['table-delete'].onClick?.(event);

  expect(onDeleteRequest).toHaveBeenCalledWith(table);
  expect(event.cancelBubble).toBe(true);
  expect(onEditRequest).not.toHaveBeenCalled();
});

it('clicking the edit icon calls onEditRequest with the correct table', () => {
  const onEditRequest = vi.fn();
  renderShape({ onEditRequest });

  const event = { cancelBubble: false };
  groupHandlers['table-edit'].onClick?.(event);

  expect(event.cancelBubble).toBe(true);
  expect(onEditRequest).toHaveBeenCalledWith(table);
});

it('clicking the resize handle stops propagation without triggering edit', () => {
  const onEditRequest = vi.fn();
  renderShape({ onEditRequest });

  const event = { cancelBubble: false };
  groupHandlers['table-resize'].onClick?.(event);

  expect(event.cancelBubble).toBe(true);
  expect(onEditRequest).not.toHaveBeenCalled();
});

it('renders edit/delete disabled (reduced opacity) for a non-available table', () => {
  renderShape({ table: { ...table, status: 'RESERVED' } });

  expect(groupHandlers['table-edit'].opacity).toBeLessThan(1);
  expect(groupHandlers['table-delete'].opacity).toBeLessThan(1);
  // resize remains enabled regardless of status
  expect(groupHandlers['table-resize'].opacity).toBeUndefined();
});

it('shows a toast (no API call) when clicking edit/delete on a non-available table', () => {
  const onEditRequest = vi.fn();
  const onDeleteRequest = vi.fn();
  renderShape({
    table: { ...table, status: 'OCCUPIED' },
    onEditRequest,
    onDeleteRequest
  });

  groupHandlers['table-edit'].onClick?.({ cancelBubble: false });
  expect(toast.warning).toHaveBeenCalledWith(BLOCKED_MESSAGE);
  expect(onEditRequest).not.toHaveBeenCalled();

  groupHandlers['table-delete'].onClick?.({ cancelBubble: false });
  expect(toast.warning).toHaveBeenCalledWith(BLOCKED_MESSAGE);
  expect(onDeleteRequest).not.toHaveBeenCalled();
});
