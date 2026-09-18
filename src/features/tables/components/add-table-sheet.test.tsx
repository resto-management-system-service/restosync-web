import { beforeEach, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import type { Table } from '../api/types';
import { createTable, getNextTableName, updateTable } from '../api/service';
import AddTableSheet from './add-table-sheet';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() }
}));

import { toast } from 'sonner';

vi.mock('../api/service', () => ({
  createTable: vi.fn(),
  updateTable: vi.fn(),
  getNextTableName: vi.fn()
}));

const table: Table = {
  id: 't1',
  name: 'T1',
  capacity: 6,
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

const canvasSize = { width: 1000, height: 1000 };

function renderSheet(props: Partial<Parameters<typeof AddTableSheet>[0]> = {}) {
  return renderWithProviders(
    <AddTableSheet
      open
      onOpenChange={() => {}}
      table={null}
      zoneId='z1'
      canvasSize={canvasSize}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getNextTableName).mockResolvedValue('102');
});

it('shows the suggested name as read-only text (not an input) on open', async () => {
  renderSheet();

  await waitFor(() => expect(screen.getByTestId('table-name-readonly')).toHaveTextContent('102'));
  expect(screen.queryByRole('textbox', { name: /nombre/i })).not.toBeInTheDocument();
  expect(getNextTableName).toHaveBeenCalledWith('z1');
});

it('submits the suggested name unchanged (capacity/shape remain functional)', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(createTable).mockResolvedValue({ id: 't-new', name: '102' } as Table);

  renderSheet({ onOpenChange });

  await waitFor(() => expect(screen.getByTestId('table-name-readonly')).toHaveTextContent('102'));

  // Capacity + shape are still editable selects.
  await userEvent.click(screen.getByLabelText(/capacidad/i));
  await userEvent.click(await screen.findByRole('option', { name: '6 personas' }));

  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(createTable).toHaveBeenCalledWith({
    name: '102',
    capacity: 6,
    shape: 'circle',
    zoneId: 'z1',
    canvasSize
  });
});

it('surfaces the backend duplicate-name message via toast (not a silent failure)', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(createTable).mockRejectedValue(new Error('Table name "102" already exists'));

  renderSheet({ onOpenChange });

  await waitFor(() => expect(screen.getByTestId('table-name-readonly')).toHaveTextContent('102'));
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Table name "102" already exists'));
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
});

it('shows the name read-only in edit mode (capacity is the only editable field)', () => {
  renderSheet({ table });

  expect(screen.getByTestId('table-name-readonly')).toHaveTextContent('T1');
  expect(screen.queryByRole('textbox', { name: /nombre/i })).not.toBeInTheDocument();
  expect(screen.getByLabelText(/capacidad/i)).toHaveTextContent('6 personas');
  expect(screen.queryByLabelText(/forma/i)).not.toBeInTheDocument();
});

it('submits an edit with the unchanged name (only capacity is sent as editable)', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(updateTable).mockResolvedValue(table);

  renderSheet({ table, onOpenChange });

  await userEvent.click(screen.getByLabelText(/capacidad/i));
  await userEvent.click(await screen.findByRole('option', { name: '8 personas' }));
  await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(updateTable).toHaveBeenCalledWith('t1', { name: 'T1', capacity: 8 });
  expect(createTable).not.toHaveBeenCalled();
});

it('does not fetch a suggestion in edit mode', () => {
  renderSheet({ table });

  expect(getNextTableName).not.toHaveBeenCalled();
});
