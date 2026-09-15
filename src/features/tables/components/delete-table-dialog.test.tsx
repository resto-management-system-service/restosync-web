import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TableLayout } from '../api/mock-data';
import DeleteTableDialog from './delete-table-dialog';

const table: TableLayout = {
  id: 'table-t4',
  name: 'T4',
  capacity: 2,
  status: 'available',
  shape: 'square',
  zoneId: 'zone-piso-1',
  positionX: 0.12,
  positionY: 0.55,
  width: 0.13,
  height: 0.13
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
