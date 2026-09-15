import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Table } from '../api/types';
import DeleteTableDialog from './delete-table-dialog';

const table: Table = {
  id: 'table-t4',
  name: 'T4',
  capacity: 2,
  status: 'AVAILABLE',
  restaurantId: 'r1',
  zoneId: 'z1',
  positionX: 0.12,
  positionY: 0.55,
  width: 0.13,
  height: 0.13,
  shape: 'square',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

it('does not confirm deletion until Eliminar is clicked', async () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(<DeleteTableDialog table={table} onConfirm={onConfirm} onCancel={onCancel} />);

  expect(
    screen.getByText(/¿Eliminar mesa T4\? Esta acción no se puede deshacer\./)
  ).toBeInTheDocument();
  expect(onConfirm).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
  expect(onCancel).toHaveBeenCalled();
  expect(onConfirm).not.toHaveBeenCalled();
});

it('calls onConfirm only when Eliminar is clicked', async () => {
  const onConfirm = vi.fn();

  render(<DeleteTableDialog table={table} onConfirm={onConfirm} onCancel={() => {}} />);

  expect(onConfirm).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));
  expect(onConfirm).toHaveBeenCalledWith(table);
});
