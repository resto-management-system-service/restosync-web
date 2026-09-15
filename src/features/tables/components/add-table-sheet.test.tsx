import { beforeEach, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import type { Table } from '../api/types';
import { createTable } from '../api/service';
import AddTableSheet from './add-table-sheet';

vi.mock('../api/service', () => ({
  createTable: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it('rejects an empty name and shows the inline error', async () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} zoneId='z1' />);

  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
  expect(createTable).not.toHaveBeenCalled();
});

it('accepts a valid submission and creates the table in the zone', async () => {
  const onOpenChange = vi.fn();
  vi.mocked(createTable).mockResolvedValue({ id: 't-new', name: 'T14' } as Table);

  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} zoneId='z1' />);

  await userEvent.type(screen.getByLabelText(/nombre/i), 'T14');
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  expect(createTable).toHaveBeenCalledWith({
    name: 'T14',
    capacity: 4,
    shape: 'circle',
    zoneId: 'z1'
  });
});
