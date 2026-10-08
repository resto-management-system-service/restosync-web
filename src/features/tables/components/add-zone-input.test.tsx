import { beforeEach, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import type { Zone } from '../api/types';
import { createZone } from '../api/service';
import AddZoneInput from './add-zone-input';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() }
}));

import { toast } from 'sonner';

vi.mock('../api/service', () => ({
  createZone: vi.fn()
}));

const zone = (id: string, name: string, code: string): Zone => ({
  id,
  restaurantId: 'r1',
  name,
  code,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

beforeEach(() => {
  vi.clearAllMocks();
});

it('previews the per-category final name and submits the combined name + auto code', async () => {
  const onCreated = vi.fn();
  vi.mocked(createZone).mockResolvedValue(zone('z-new', 'Piso 3', '3'));

  renderWithProviders(
    <AddZoneInput
      zones={[zone('z1', 'Piso 1', '1'), zone('z2', 'Piso 2', '2')]}
      onCreated={onCreated}
    />
  );

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));
  await userEvent.type(screen.getByLabelText(/nombre de la zona/i), 'Piso');

  expect(screen.getByTestId('zone-name-preview')).toHaveTextContent('Piso 3');

  await userEvent.click(screen.getByRole('button', { name: /guardar zona/i }));

  await waitFor(() => expect(createZone).toHaveBeenCalledWith({ name: 'Piso 3', code: '3' }));
});

it('starts numbering at 1 for a never-used category name', async () => {
  vi.mocked(createZone).mockResolvedValue(zone('z-new', 'Terraza 1', '2'));

  renderWithProviders(<AddZoneInput zones={[zone('z1', 'Piso 1', '1')]} />);

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));
  await userEvent.type(screen.getByLabelText(/nombre de la zona/i), 'Terraza');

  expect(screen.getByTestId('zone-name-preview')).toHaveTextContent('Terraza 1');
});

it('does not show the internal code to the user', async () => {
  renderWithProviders(<AddZoneInput zones={[zone('z1', 'Piso 1', '1')]} />);

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));

  expect(screen.queryByTestId('zone-code-readonly')).not.toBeInTheDocument();
});

it('surfaces the backend duplicate-code message via toast', async () => {
  vi.mocked(createZone).mockRejectedValue(new Error('Zone code "2" already exists'));

  renderWithProviders(
    <AddZoneInput zones={[zone('z1', 'Piso 1', '1'), zone('z2', 'Piso 3', '3')]} />
  );

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));
  await userEvent.type(screen.getByLabelText(/nombre de la zona/i), 'Piso');
  await userEvent.click(screen.getByRole('button', { name: /guardar zona/i }));

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Zone code "2" already exists'));
});
