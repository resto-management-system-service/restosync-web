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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getNextTableName).mockResolvedValue('102');
});

it('pre-fills the suggested name on open (create mode)', async () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={null} zoneId='z1' />);

  await waitFor(() => expect(screen.getByLabelText(/nombre/i)).toHaveValue('102'));
  expect(getNextTableName).toHaveBeenCalledWith('z1');
});

it('leaves the suggested name fully editable', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(createTable).mockResolvedValue({ id: 't-new', name: 'CUSTOM' } as Table);

  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={null} zoneId='z1' />);

  await waitFor(() => expect(screen.getByLabelText(/nombre/i)).toHaveValue('102'));

  await userEvent.clear(screen.getByLabelText(/nombre/i));
  await userEvent.type(screen.getByLabelText(/nombre/i), 'CUSTOM');
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(createTable).toHaveBeenCalledWith({
    name: 'CUSTOM',
    capacity: 4,
    shape: 'circle',
    zoneId: 'z1'
  });
});

it('rejects an empty name (after clearing the suggestion) with an inline error', async () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={null} zoneId='z1' />);

  await waitFor(() => expect(screen.getByLabelText(/nombre/i)).toHaveValue('102'));
  await userEvent.clear(screen.getByLabelText(/nombre/i));
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
  expect(createTable).not.toHaveBeenCalled();
});

it('surfaces the backend duplicate-name message via toast (not a silent failure)', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(createTable).mockRejectedValue(new Error('Table name "102" already exists'));

  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={null} zoneId='z1' />);

  await waitFor(() => expect(screen.getByLabelText(/nombre/i)).toHaveValue('102'));
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Table name "102" already exists'));
  expect(onOpenChange).not.toHaveBeenCalledWith(false);
});

it('pre-fills the form in edit mode and hides the shape field', () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={table} zoneId='z1' />);

  expect(screen.getByLabelText(/nombre/i)).toHaveValue('T1');
  expect(screen.getByLabelText(/capacidad/i)).toHaveTextContent('6 personas');
  expect(screen.queryByLabelText(/forma/i)).not.toBeInTheDocument();
});

it('submits an edit by calling updateTable (not createTable) with the correct id/fields', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(updateTable).mockResolvedValue(table);

  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={table} zoneId='z1' />);

  await userEvent.clear(screen.getByLabelText(/nombre/i));
  await userEvent.type(screen.getByLabelText(/nombre/i), 'T1-A');
  await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(updateTable).toHaveBeenCalledWith('t1', { name: 'T1-A', capacity: 6 });
  expect(createTable).not.toHaveBeenCalled();
});

it('does not fetch a suggestion in edit mode', () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} table={table} zoneId='z1' />);

  expect(getNextTableName).not.toHaveBeenCalled();
});
