import { beforeEach, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Table } from '../api/types';
import TableShape from './table-shape';

type Handler = (e: { cancelBubble: boolean }) => void;
const groupHandlers: Record<string, { onClick?: Handler; onTap?: Handler }> = {};

vi.mock('react-konva', () => ({
  Group: ({
    name,
    onClick,
    onTap,
    children
  }: {
    name?: string;
    onClick?: Handler;
    onTap?: Handler;
    children?: React.ReactNode;
  }) => {
    if (name) groupHandlers[name] = { onClick, onTap };
    return <div data-testid={name}>{children}</div>;
  },
  Circle: () => <div />,
  Rect: () => <div />,
  Text: () => <div />
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

it('clicking the resize handle stops propagation without triggering edit', () => {
  const onEditRequest = vi.fn();
  renderShape({ onEditRequest });

  const event = { cancelBubble: false };
  groupHandlers['table-resize'].onClick?.(event);

  expect(event.cancelBubble).toBe(true);
  expect(onEditRequest).not.toHaveBeenCalled();
});
