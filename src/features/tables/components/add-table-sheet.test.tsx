import { beforeEach, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getTablesByZone, resetTableData } from '../api/mock-data';
import { renderWithProviders } from '@/test/utils';
import AddTableSheet from './add-table-sheet';

beforeEach(() => resetTableData());

it('rejects an empty name and shows the inline error', async () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} zoneId='zone-piso-1' />);

  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('accepts a valid submission and creates the table in the zone', async () => {
  const onOpenChange = vi.fn();
  renderWithProviders(<AddTableSheet open onOpenChange={onOpenChange} zoneId='zone-piso-1' />);

  await userEvent.type(screen.getByLabelText(/nombre/i), 'T14');
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }));

  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  const tables = await getTablesByZone('zone-piso-1');
  expect(tables.some((t) => t.name === 'T14')).toBe(true);
});
